import { ALL_EVENT_NAMES, isAnalyticsEventName, type AnalyticsEventName, type AnalyticsProperties } from './events';

const GA4_API = 'https://www.google-analytics.com/mp/collect';
const PLAUSIBLE_API = 'https://plausible.io/api/event';
const REFERRER_LIMIT = 100;
const PROPERTY_LIMIT = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;
const DEDUPE_TTL_MS = 2_000;

type ParseSuccess<T> = { success: true; data: T };
type ParseFailure = { success: false; error: string };

export type AnalyticsEvent = {
  dedupe_id?: string;
  event_name: AnalyticsEventName;
  properties: AnalyticsProperties;
  referrer?: string;
  url: string;
};

export const analyticsRetryQueue: Array<{
  event: AnalyticsEvent;
  status: number;
  target: 'ga4' | 'plausible';
  queued_at: number;
}> = [];

const rateBuckets = new Map<string, { count: number; startedAt: number }>();
const dedupeWindow = new Map<string, number>();

export const eventSchema = {
  safeParse(input: unknown): ParseSuccess<AnalyticsEvent> | ParseFailure {
    if (!isRecord(input)) return { success: false, error: 'payload_not_object' };

    const eventName = input.event_name;
    if (!isAnalyticsEventName(eventName)) return { success: false, error: 'invalid_event_name' };

    const url = input.url;
    if (typeof url !== 'string' || !isValidUrl(url)) return { success: false, error: 'invalid_url' };

    const properties = input.properties;
    if (properties !== undefined && !isRecord(properties)) {
      return { success: false, error: 'invalid_properties' };
    }

    const referrer = input.referrer;
    if (referrer !== undefined && typeof referrer !== 'string') {
      return { success: false, error: 'invalid_referrer' };
    }

    const dedupeId = input.dedupe_id;
    if (dedupeId !== undefined && typeof dedupeId !== 'string') {
      return { success: false, error: 'invalid_dedupe_id' };
    }

    return {
      success: true,
      data: {
        dedupe_id: dedupeId,
        event_name: eventName,
        properties: stripPiiProperties(properties ?? {}),
        referrer: stripPii(referrer),
        url,
      },
    };
  },
};

export function normalizeAnalyticsBody(input: unknown, fallbackUrl: string): unknown {
  if (!isRecord(input)) return input;
  if ('event_name' in input) return input;

  if (typeof input.name === 'string') {
    return {
      dedupe_id: typeof input.dedupe_id === 'string' ? input.dedupe_id : undefined,
      event_name: input.name,
      properties: isRecord(input.payload) ? input.payload : {},
      referrer: typeof input.referrer === 'string' ? input.referrer : undefined,
      url: typeof input.url === 'string' ? input.url : fallbackUrl,
    };
  }

  return input;
}

export function stripPii(referrer: string | undefined): string | undefined {
  if (!referrer) return undefined;

  try {
    const url = new URL(referrer);
    url.search = '';
    url.hash = '';
    const cleaned = url.toString();
    return cleaned.length > REFERRER_LIMIT ? cleaned.slice(0, REFERRER_LIMIT) : cleaned;
  } catch {
    return undefined;
  }
}

export function stripPiiProperties(properties: Record<string, unknown>): AnalyticsProperties {
  const clean: AnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties).slice(0, PROPERTY_LIMIT)) {
    if (/(^|_)(email|phone|name|first_name|last_name|full_name)($|_)/i.test(key)) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value == null) {
      clean[key] = value as AnalyticsProperties[string];
    }
  }

  return clean;
}

export async function hashIp(value: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return 'webcrypto-unavailable';

  const data = new TextEncoder().encode(value);
  const digest = await subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

export function checkAnalyticsRateLimit(ipHash: string, now = Date.now()) {
  const current = rateBuckets.get(ipHash);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ipHash, { count: 1, startedAt: now });
    return true;
  }

  current.count += 1;
  return current.count <= 100;
}

export function markDuplicateEvent(ipHash: string, event: AnalyticsEvent, now = Date.now()) {
  if (!event.dedupe_id) return false;

  for (const [key, expiresAt] of dedupeWindow) {
    if (expiresAt <= now) dedupeWindow.delete(key);
  }

  const key = `${ipHash}:${event.dedupe_id}`;
  if (dedupeWindow.has(key)) return true;
  dedupeWindow.set(key, now + DEDUPE_TTL_MS);
  return false;
}

export async function forwardToGA4(event: AnalyticsEvent, headers: Headers, fetchImpl: typeof fetch = fetch) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return new Response(null, { status: 204 });

  const url = new URL(GA4_API);
  url.searchParams.set('measurement_id', measurementId);
  url.searchParams.set('api_secret', apiSecret);

  const clientId = await hashIp(`${headers.get('user-agent') ?? ''}:${headers.get('x-forwarded-for') ?? ''}`);
  return fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      events: [{ name: event.event_name, params: event.properties }],
    }),
  });
}

export async function forwardToPlausible(event: AnalyticsEvent, headers: Headers, fetchImpl: typeof fetch = fetch) {
  const domain = process.env.PLAUSIBLE_DOMAIN ?? 'cyberskill.world';

  return fetchImpl(PLAUSIBLE_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': headers.get('user-agent') ?? 'unknown',
    },
    body: JSON.stringify({
      domain,
      name: plausibleEventName(event),
      props: event.properties,
      referrer: event.referrer,
      url: event.url,
    }),
  });
}

function plausibleEventName(event: AnalyticsEvent) {
  if (event.event_name !== 'web_vitals') return event.event_name;
  const metricName = event.properties.metric_name;
  return typeof metricName === 'string' ? `web-vitals/${metricName}` : event.event_name;
}

export function queueRetry(target: 'ga4' | 'plausible', event: AnalyticsEvent, response: Response) {
  if (response.status < 500) return;
  analyticsRetryQueue.push({
    event,
    status: response.status,
    target,
    queued_at: Date.now(),
  });
}

export function resetAnalyticsProxyState() {
  analyticsRetryQueue.length = 0;
  rateBuckets.clear();
  dedupeWindow.clear();
}

export function analyticsEventNames() {
  return ALL_EVENT_NAMES;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
