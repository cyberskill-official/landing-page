import type { LeadPayload, LeadTrack } from '@/lib/forms/schemas/lead-schema';

const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type UtmKey = (typeof utmKeys)[number];

export type LeadMetadata = Partial<Record<UtmKey, string>> & {
  locale: 'en' | 'vi';
  referrer?: string;
  scene_id: string;
  timestamp: string;
  user_agent_redacted: string;
};

export type HubspotStageConfig = {
  buyPipeline: string;
  buyStage: string;
  partnerPipeline: string;
  partnerStage: string;
};

export type RoutingAlert = {
  code: 'unexpected_track';
  message: string;
  track: string;
};

export type RoutingResult =
  | {
      destination: 'hubspot';
      metadata: LeadMetadata;
      pipeline: string;
      stage: string;
      track: 'buy' | 'partner';
    }
  | {
      destination: 'ats';
      metadata: LeadMetadata;
      track: 'join';
    }
  | {
      alert: RoutingAlert;
      destination: 'alert';
      metadata: LeadMetadata;
      track: string;
    };

export function stageConfigFromEnv(env: Record<string, string | undefined> = process.env): HubspotStageConfig {
  return {
    buyPipeline: env.HUBSPOT_PIPELINE_BUY ?? 'default',
    buyStage: env.HUBSPOT_STAGE_BUY ?? 'inbound-discovery',
    partnerPipeline: env.HUBSPOT_PIPELINE_PARTNER ?? 'partners',
    partnerStage: env.HUBSPOT_STAGE_PARTNER ?? 'partner-pipeline',
  };
}

function truncate(value: string, max = 500) {
  return value.length > max ? value.slice(0, max) : value;
}

function clean(value: string | null | undefined, max = 120) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return truncate(trimmed, max);
}

function extractUtmFromUrl(rawUrl: string | undefined) {
  if (!rawUrl) return {};

  try {
    const url = new URL(rawUrl);
    return Object.fromEntries(
      utmKeys
        .map((key) => [key, clean(url.searchParams.get(key))] as const)
        .filter((entry): entry is [UtmKey, string] => Boolean(entry[1])),
    ) as Partial<Record<UtmKey, string>>;
  } catch {
    return {};
  }
}

function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  for (const pair of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = pair.split('=');
    const name = rawName?.trim();
    if (!name) continue;
    cookies.set(name, rawValue.join('=').trim());
  }

  return cookies;
}

function extractUtmFromCookie(cookieHeader: string | null) {
  const raw = parseCookieHeader(cookieHeader).get('cyberskill_utm');
  if (!raw) return {};

  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith('{')) {
    try {
      const parsed = JSON.parse(decoded) as Partial<Record<UtmKey, unknown>>;
      return Object.fromEntries(
        utmKeys
          .map((key) => [key, typeof parsed[key] === 'string' ? clean(parsed[key]) : undefined] as const)
          .filter((entry): entry is [UtmKey, string] => Boolean(entry[1])),
      ) as Partial<Record<UtmKey, string>>;
    } catch {
      return {};
    }
  }

  const params = new URLSearchParams(decoded);
  return Object.fromEntries(
    utmKeys
      .map((key) => [key, clean(params.get(key))] as const)
      .filter((entry): entry is [UtmKey, string] => Boolean(entry[1])),
  ) as Partial<Record<UtmKey, string>>;
}

export function extractUtmFromHeaders(headers: Headers): Partial<Record<UtmKey, string>> & { referrer?: string } {
  const referrer = headers.get('referer') ?? headers.get('referrer') ?? undefined;
  return {
    ...extractUtmFromCookie(headers.get('cookie')),
    ...extractUtmFromUrl(referrer),
    referrer: referrer ? truncate(referrer) : undefined,
  };
}

function inferLocale(rawUrl: string | undefined) {
  if (!rawUrl) return undefined;
  try {
    const pathname = new URL(rawUrl).pathname;
    return pathname === '/vi' || pathname.startsWith('/vi/') ? 'vi' : undefined;
  } catch {
    return undefined;
  }
}

export function createLeadMetadata({
  headers,
  now = new Date(),
  payload,
  requestUrl,
  userAgentRedacted,
}: {
  headers: Headers;
  now?: Date;
  payload: LeadPayload;
  requestUrl: string;
  userAgentRedacted: string;
}): LeadMetadata {
  const attribution = extractUtmFromHeaders(headers);

  return {
    ...attribution,
    locale: payload.locale ?? inferLocale(attribution.referrer) ?? inferLocale(requestUrl) ?? 'en',
    scene_id: payload.scene_id ?? 'unknown',
    timestamp: now.toISOString(),
    user_agent_redacted: userAgentRedacted,
    utm_source: attribution.utm_source ?? 'direct',
  };
}

export function routeLead(
  track: LeadTrack | string,
  metadata: LeadMetadata,
  config = stageConfigFromEnv(),
  onAlert?: (alert: RoutingAlert) => void,
): RoutingResult {
  if (track === 'buy') {
    return { destination: 'hubspot', metadata, pipeline: config.buyPipeline, stage: config.buyStage, track };
  }

  if (track === 'partner') {
    return { destination: 'hubspot', metadata, pipeline: config.partnerPipeline, stage: config.partnerStage, track };
  }

  if (track === 'join') {
    return { destination: 'ats', metadata, track };
  }

  const alert = {
    code: 'unexpected_track' as const,
    message: `Unexpected lead track received: ${track}`,
    track,
  };
  onAlert?.(alert);
  return { alert, destination: 'alert', metadata, track };
}
