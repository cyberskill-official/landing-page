import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import {
  SANITY_WEBHOOK_SIGNATURE_HEADER,
  verifySanityWebhookSignature,
} from '@/lib/sanity/webhook-secret';
import { checkRevalidateRateLimit } from '@/lib/sanity/revalidate-rate-limit';
import { pathsForSanityPayload, type SanityWebhookPayload } from '@/lib/sanity/revalidate-paths';

export const runtime = 'nodejs';

function clientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || 'unknown';
}

function normalizePath(path: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) return null;
  if (path.startsWith('/api/')) return null;
  return path === '/vi/' ? '/vi' : path;
}

function tagsForSanityPayload(payload: SanityWebhookPayload): string[] {
  return payload._type ? [`cms:${payload._type}`] : ['cms:unknown'];
}

function logRevalidate(event: Record<string, unknown>) {
  console.info(JSON.stringify({ kind: 'revalidate', ...event }));
}

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  const startedAt = performance.now();
  const key = `revalidate:${clientKey(request)}`;

  if (!checkRevalidateRateLimit(key)) {
    return json({ ok: false, error: 'rate_limit' }, 429);
  }

  const url = new URL(request.url);
  const manualPath = url.searchParams.get('path');

  if (manualPath) {
    const adminToken = process.env.REVALIDATE_ADMIN_TOKEN;
    const auth = request.headers.get('authorization');

    if (!adminToken || auth !== `Bearer ${adminToken}`) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }

    const path = normalizePath(manualPath);
    if (!path) {
      return json({ ok: false, error: 'invalid_path' }, 400);
    }

    revalidatePath(path);
    logRevalidate({ mode: 'manual', paths: [path], latency_ms: Math.round(performance.now() - startedAt) });
    return json({ ok: true, revalidated: true, paths: [path] });
  }

  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return json({ ok: false, error: 'missing_secret' }, 503);
  }

  const raw = await request.text();
  const signature = request.headers.get(SANITY_WEBHOOK_SIGNATURE_HEADER);

  if (!verifySanityWebhookSignature({ payload: raw, secret, signature })) {
    logRevalidate({ mode: 'webhook', error: 'invalid_signature' });
    return json({ ok: false, error: 'invalid_signature' }, 401);
  }

  let payload: SanityWebhookPayload;
  try {
    payload = JSON.parse(raw) as SanityWebhookPayload;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const paths = pathsForSanityPayload(payload).map(normalizePath).filter((path): path is string => Boolean(path));
  const tags = tagsForSanityPayload(payload);

  for (const path of paths) {
    revalidatePath(path);
  }
  for (const tag of tags) {
    revalidateTag(tag);
  }

  logRevalidate({
    mode: 'webhook',
    doc_type: payload._type ?? 'unknown',
    doc_id: payload._id ?? 'unknown',
    paths,
    tags,
    latency_ms: Math.round(performance.now() - startedAt),
  });

  return json({ ok: true, revalidated: true, paths, tags });
}
