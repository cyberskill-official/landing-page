import { createHash } from 'node:crypto';
import type { LeadPayload } from '@/lib/forms/schemas/lead-schema';

export type LeadRetryItem = {
  attempts: number;
  createdAt: number;
  id: string;
  payload: LeadPayload;
  reason: string;
};

export type LeadLogEvent = {
  country?: string;
  error?: string;
  ip_hash: string;
  kind: string;
  latency_ms?: number;
  success: boolean;
  track?: LeadPayload['track'];
  ts: string;
  user_agent_redacted: string;
};

export const leadRetryQueue: LeadRetryItem[] = [];
export const leadStructuredLogs: LeadLogEvent[] = [];
export const leadCapturedExceptions: Array<{ message: string; context: Record<string, unknown> }> = [];

const hashSalt = process.env.LEAD_HASH_SALT ?? 'cyberskill-local-lead-salt';

export function hashIp(ip: string) {
  return `sha256:${createHash('sha256').update(`${hashSalt}:${ip}`).digest('hex').slice(0, 24)}`;
}

export function redactEmail(email: string) {
  const [local = '', domain = ''] = email.split('@');
  const [host = '', ...tldParts] = domain.split('.');
  const tld = tldParts.join('.');
  const localRedacted = local ? `${local[0]}***` : '***';
  const hostRedacted = host ? `${host[0]}***` : '***';
  return tld ? `${localRedacted}@${hostRedacted}.${tld}` : `${localRedacted}@${hostRedacted}`;
}

export function redactUserAgent(userAgent: string) {
  if (!userAgent) return 'empty';
  const firstToken = userAgent.split(/\s+/)[0] ?? 'unknown';
  return firstToken.replace(/\([^)]*\)/g, '(redacted)').slice(0, 80);
}

export function stableLeadId(prefix: string, payload: LeadPayload) {
  const digest = createHash('sha256')
    .update(`${payload.track}:${payload.contact_email}:${payload.contact_name}`)
    .digest('hex')
    .slice(0, 12);
  return `${prefix}-${digest}`;
}

export function queueRetry(payload: LeadPayload, reason: string) {
  const id = `pending-${Date.now().toString(36)}-${leadRetryQueue.length + 1}`;
  leadRetryQueue.push({ attempts: 0, createdAt: Date.now(), id, payload, reason });
  return id;
}

export function logLeadEvent(event: Omit<LeadLogEvent, 'ts'>) {
  const redacted = {
    ...event,
    ts: new Date().toISOString(),
  };
  leadStructuredLogs.push(redacted);

  if (process.env.NODE_ENV !== 'test') {
    console.info(JSON.stringify(redacted));
  }
}

export function captureLeadException(error: unknown, context: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  leadCapturedExceptions.push({ context, message });

  const sentryLike = (globalThis as unknown as {
    Sentry?: { captureException?: (error: unknown, context?: Record<string, unknown>) => void };
  }).Sentry;
  sentryLike?.captureException?.(error, { extra: context });
}

export function resetLeadObservabilityState() {
  leadRetryQueue.length = 0;
  leadStructuredLogs.length = 0;
  leadCapturedExceptions.length = 0;
}
