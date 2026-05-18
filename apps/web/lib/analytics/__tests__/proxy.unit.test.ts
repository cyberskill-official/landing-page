import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  analyticsRetryQueue,
  checkAnalyticsRateLimit,
  eventSchema,
  forwardToGA4,
  forwardToPlausible,
  markDuplicateEvent,
  queueRetry,
  resetAnalyticsProxyState,
  stripPii,
  stripPiiProperties,
} from '../proxy';

const event = {
  event_name: 'cta_click',
  properties: { cta_id: 'buy', scene_id: 'scene-6', track: 'buy' },
  url: 'https://cyberskill.world/',
} as const;

describe('FR-SEO-007 analytics proxy helpers', () => {
  afterEach(() => {
    resetAnalyticsProxyState();
    vi.unstubAllEnvs();
  });

  test('strips query strings, hashes no PII into referrer, and validates event names', () => {
    expect(stripPii('https://google.com/search?q=secret&utm=x')).toBe('https://google.com/search');
    expect(stripPii('not a url')).toBeUndefined();
    expect(eventSchema.safeParse(event).success).toBe(true);
    expect(eventSchema.safeParse({ ...event, event_name: 'unknown' }).success).toBe(false);
  });

  test('drops top-level PII properties before forwarding', () => {
    expect(stripPiiProperties({
      email: 'person@example.com',
      phone: '+8490',
      full_name: 'Name',
      cta_id: 'buy',
    })).toEqual({ cta_id: 'buy' });
  });

  test('rate-limits to 100 requests per minute per hashed IP', () => {
    for (let index = 0; index < 100; index += 1) {
      expect(checkAnalyticsRateLimit('hash-a', 1000)).toBe(true);
    }
    expect(checkAnalyticsRateLimit('hash-a', 1000)).toBe(false);
    expect(checkAnalyticsRateLimit('hash-a', 62_000)).toBe(true);
  });

  test('dedupes strict-mode duplicate events by dedupe id', () => {
    expect(markDuplicateEvent('hash-a', { ...event, dedupe_id: 'same' }, 1000)).toBe(false);
    expect(markDuplicateEvent('hash-a', { ...event, dedupe_id: 'same' }, 1100)).toBe(true);
    expect(markDuplicateEvent('hash-a', { ...event, dedupe_id: 'same' }, 4000)).toBe(false);
  });

  test('forwards to both upstream shapes and queues 5xx responses', async () => {
    vi.stubEnv('GA4_MEASUREMENT_ID', 'G-TEST');
    vi.stubEnv('GA4_API_SECRET', 'secret');
    const fetchMock = vi.fn(async (_input: Parameters<typeof fetch>[0], _init?: Parameters<typeof fetch>[1]) =>
      new Response(null, { status: 503 }),
    );
    const fetchImpl = fetchMock as unknown as typeof fetch;
    const headers = new Headers({ 'user-agent': 'vitest', 'x-forwarded-for': '127.0.0.1' });

    const ga4 = await forwardToGA4(event, headers, fetchImpl);
    const plausible = await forwardToPlausible(event, headers, fetchImpl);
    queueRetry('ga4', event, ga4);
    queueRetry('plausible', event, plausible);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('google-analytics.com/mp/collect');
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe('https://plausible.io/api/event');
    expect(analyticsRetryQueue).toHaveLength(2);
  });

  test('forwards web vitals to Plausible metric-specific custom events', async () => {
    const fetchMock = vi.fn(async (_input: Parameters<typeof fetch>[0], _init?: Parameters<typeof fetch>[1]) =>
      new Response(null, { status: 202 }),
    );
    const headers = new Headers({ 'user-agent': 'vitest' });

    await forwardToPlausible({
      event_name: 'web_vitals',
      properties: {
        breakpoint: 'mobile',
        connection: '4g',
        locale: 'vi',
        metric_name: 'LCP',
        route: '/vi',
        value: 2100,
      },
      url: 'https://cyberskill.world/vi',
    }, headers, fetchMock as unknown as typeof fetch);

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { name?: string; props?: Record<string, unknown> };
    expect(body.name).toBe('web-vitals/LCP');
    expect(body.props).toMatchObject({ locale: 'vi', route: '/vi' });
  });
});
