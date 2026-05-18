import {
  checkAnalyticsRateLimit,
  eventSchema,
  forwardToGA4,
  forwardToPlausible,
  hashIp,
  markDuplicateEvent,
  normalizeAnalyticsBody,
  queueRetry,
} from '@/lib/analytics/proxy';

export const runtime = 'edge';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ipHash = await hashIp(ip);

  if (!checkAnalyticsRateLimit(ipHash)) {
    return Response.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const fallbackUrl = request.headers.get('referer') ?? 'https://cyberskill.world/';
  const parsed = eventSchema.safeParse(normalizeAnalyticsBody(body, fallbackUrl));
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (markDuplicateEvent(ipHash, parsed.data)) {
    return Response.json({ deduped: true, ok: true });
  }

  const [ga4, plausible] = await Promise.allSettled([
    forwardToGA4(parsed.data, request.headers),
    forwardToPlausible(parsed.data, request.headers),
  ]);

  if (ga4.status === 'fulfilled') queueRetry('ga4', parsed.data, ga4.value);
  if (plausible.status === 'fulfilled') queueRetry('plausible', parsed.data, plausible.value);

  return Response.json({ ok: true }, { status: 202 });
}
