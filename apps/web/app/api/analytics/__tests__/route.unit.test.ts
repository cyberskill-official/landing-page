import { afterEach, describe, expect, test, vi } from 'vitest';
import { analyticsRetryQueue, resetAnalyticsProxyState } from '@/lib/analytics/proxy';
import { POST } from '../route';

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://cyberskill.world/api/analytics', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'vitest',
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    },
    method: 'POST',
  });
}

describe('FR-SEO-007 /api/analytics route', () => {
  afterEach(() => {
    resetAnalyticsProxyState();
    vi.restoreAllMocks();
  });

  test('accepts valid events and forwards to both analytics pipes', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    const response = await POST(request({
      event_name: 'scene_enter',
      properties: { scene_id: 'scene-0', email: 'nope@example.com' },
      referrer: 'https://google.com/search?q=private',
      url: 'https://cyberskill.world/',
    }));

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(202);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toBe('https://plausible.io/api/event');
    expect(fetchSpy.mock.calls[0]?.[1]?.body).not.toContain('nope@example.com');
    expect(fetchSpy.mock.calls[0]?.[1]?.body).not.toContain('private');
  });

  test('supports legacy diagnostic client body shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    const response = await POST(request({
      name: 'skip_story_used',
      payload: { breakpoint: 'desktop' },
      url: 'https://cyberskill.world/',
    }));

    expect(response.status).toBe(202);
  });

  test('rejects invalid events and rate-limits abusive clients', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    await expect(POST(request({ event_name: 'bad', url: 'https://cyberskill.world/' }))).resolves.toHaveProperty('status', 400);

    for (let index = 0; index < 100; index += 1) {
      await POST(request({ event_name: 'scene_enter', properties: { scene_id: 'scene-0' }, url: 'https://cyberskill.world/' }));
    }

    const limited = await POST(request({ event_name: 'scene_enter', properties: { scene_id: 'scene-0' }, url: 'https://cyberskill.world/' }));
    expect(limited.status).toBe(429);
  });

  test('queues upstream 5xx for retry and dedupes duplicate beacons', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));
    const body = {
      dedupe_id: 'same',
      event_name: 'scene_enter',
      properties: { scene_id: 'scene-0' },
      url: 'https://cyberskill.world/',
    };

    const first = await POST(request(body));
    const second = await POST(request(body));

    expect(first.status).toBe(202);
    await expect(second.json()).resolves.toEqual({ deduped: true, ok: true });
    expect(analyticsRetryQueue.length).toBeGreaterThanOrEqual(1);
  });
});
