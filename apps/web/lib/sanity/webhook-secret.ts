import { createHmac, timingSafeEqual } from 'node:crypto';

export const SANITY_WEBHOOK_SIGNATURE_HEADER = 'sanity-webhook-signature';

export function signSanityWebhookPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifySanityWebhookSignature({
  payload,
  secret,
  signature,
}: {
  payload: string;
  secret?: string;
  signature?: string | null;
}): boolean {
  if (!secret || !signature) return false;

  const normalizedSignature = signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature;
  const expected = signSanityWebhookPayload(payload, secret);

  if (normalizedSignature.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(normalizedSignature, 'hex'), Buffer.from(expected, 'hex'));
}

