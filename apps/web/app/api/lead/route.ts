import { atsCreateCandidate } from '@/lib/server/ats-client';
import { hubspotCreateContact, hubspotCreateDeal } from '@/lib/server/hubspot-client';
import { createLeadMetadata, routeLead as routeLeadToDestination, type LeadMetadata } from '@/lib/server/hubspot-stage-router';
import { isUpstreamLeadError } from '@/lib/server/lead-errors';
import {
  captureLeadException,
  hashIp,
  logLeadEvent,
  queueRetry,
  redactUserAgent,
} from '@/lib/server/lead-observability';
import { cacheLeadId, checkRateLimit, getCachedLeadId } from '@/lib/server/rate-limit';
import { notifyLeadRoutingAlert, slackNotifyLead } from '@/lib/server/slack-client';
import { flattenLeadErrors, leadSchema, type LeadPayload } from '@/lib/forms/schemas/lead-schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const allowedStaticOrigins = new Set(['https://cyberskill.world', 'http://localhost:3000', 'http://127.0.0.1:3000']);

function corsHeaders(origin: string | null, requestUrl: string) {
  const requestOrigin = new URL(requestUrl).origin;
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : null;
  const allowedOrigins = new Set([requestOrigin, ...allowedStaticOrigins]);
  if (configuredOrigin) allowedOrigins.add(configuredOrigin);
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : requestOrigin;

  return {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function originAllowed(origin: string | null, requestUrl: string) {
  if (!origin) return true;
  const headers = corsHeaders(origin, requestUrl);
  return headers['Access-Control-Allow-Origin'] === origin;
}

function json(body: unknown, request: Request, status = 200, extraHeaders: HeadersInit = {}) {
  return Response.json(body, {
    headers: {
      ...corsHeaders(request.headers.get('origin'), request.url),
      ...extraHeaders,
    },
    status,
  });
}

function requestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function looksLikeBot(userAgent: string) {
  if (!userAgent.trim()) return true;
  return /\b(bot|crawler|spider|scrapy|python-requests|httpclient)\b/i.test(userAgent);
}

function leadCountry(payload: LeadPayload) {
  return 'country' in payload ? payload.country : undefined;
}

async function dispatchLead(payload: LeadPayload, metadata: LeadMetadata) {
  const route = routeLeadToDestination(payload.track, metadata);

  if (route.destination === 'hubspot' && (payload.track === 'buy' || payload.track === 'partner')) {
    const contactId = await hubspotCreateContact(payload);
    return hubspotCreateDeal(contactId, route, payload);
  }

  if (route.destination === 'ats' && payload.track === 'join') {
    return atsCreateCandidate(payload);
  }

  const message = route.destination === 'alert' ? route.alert.message : `Unexpected lead route for track ${payload.track}`;
  await notifyLeadRoutingAlert(message);
  throw new Error(message);
}

export async function OPTIONS(request: Request) {
  if (!originAllowed(request.headers.get('origin'), request.url)) {
    return json({ ok: false, error: 'origin_disallowed' }, request, 403);
  }

  return new Response(null, {
    headers: corsHeaders(request.headers.get('origin'), request.url),
    status: 204,
  });
}

export async function POST(request: Request) {
  const startedAt = performance.now();
  const ip = requestIp(request);
  const ipHash = hashIp(ip);
  const userAgent = request.headers.get('user-agent') ?? '';
  const userAgentRedacted = redactUserAgent(userAgent);

  if (!originAllowed(request.headers.get('origin'), request.url)) {
    return json({ ok: false, error: 'origin_disallowed' }, request, 403);
  }

  if (looksLikeBot(userAgent)) {
    logLeadEvent({
      error: 'bot',
      ip_hash: ipHash,
      kind: 'lead_rejected',
      success: false,
      user_agent_redacted: userAgentRedacted,
    });
    return json({ ok: false, error: 'bot' }, request, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, request, 400);
  }

  if (body && typeof body === 'object' && 'hp_email' in body && String((body as { hp_email?: unknown }).hp_email ?? '').trim()) {
    logLeadEvent({
      error: 'honeypot',
      ip_hash: ipHash,
      kind: 'honeypot_caught',
      success: true,
      user_agent_redacted: userAgentRedacted,
    });
    return json({ ok: true, lead_id: 'drop' }, request, 200);
  }

  const rate = checkRateLimit(ipHash);
  if (!rate.ok) {
    return json(
      {
        challenge: {
          provider: 'turnstile',
          site_key: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null,
        },
        error: 'rate_limit',
        ok: false,
      },
      request,
      429,
      { 'Retry-After': String(rate.retryAfter) },
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, errors: flattenLeadErrors(parsed.error) }, request, 400);
  }

  const payload = parsed.data;
  const idempotencyKey = payload.idempotency_key ? `${ipHash}:${payload.idempotency_key}` : null;
  const cachedLeadId = idempotencyKey ? getCachedLeadId(idempotencyKey) : null;
  if (cachedLeadId) {
    return json({ deduped: true, lead_id: cachedLeadId, ok: true }, request, 200);
  }

  try {
    const metadata = createLeadMetadata({
      headers: request.headers,
      payload,
      requestUrl: request.url,
      userAgentRedacted,
    });
    const leadId = await dispatchLead(payload, metadata);
    cacheLeadId(idempotencyKey ?? `${ipHash}:${leadId}`, leadId);
    await slackNotifyLead(payload, leadId);

    logLeadEvent({
      country: leadCountry(payload),
      ip_hash: ipHash,
      kind: 'lead_success',
      latency_ms: Math.round(performance.now() - startedAt),
      success: true,
      track: payload.track,
      user_agent_redacted: userAgentRedacted,
    });

    return json({ ok: true, lead_id: leadId }, request, 200);
  } catch (error) {
    captureLeadException(error, { ip_hash: ipHash, track: payload.track });

    if (isUpstreamLeadError(error) && error.upstream5xx) {
      const pendingId = queueRetry(payload, error.message);
      cacheLeadId(idempotencyKey ?? `${ipHash}:${pendingId}`, pendingId);
      logLeadEvent({
        country: leadCountry(payload),
        error: 'upstream_queued',
        ip_hash: ipHash,
        kind: 'lead_retry_queued',
        latency_ms: Math.round(performance.now() - startedAt),
        success: true,
        track: payload.track,
        user_agent_redacted: userAgentRedacted,
      });
      return json({ ok: true, lead_id: pendingId }, request, 200);
    }

    logLeadEvent({
      country: leadCountry(payload),
      error: 'upstream',
      ip_hash: ipHash,
      kind: 'lead_failed',
      latency_ms: Math.round(performance.now() - startedAt),
      success: false,
      track: payload.track,
      user_agent_redacted: userAgentRedacted,
    });

    return json({ ok: false, error: 'upstream' }, request, 503);
  }
}
