/**
 * FR-CTA-005: Call-booking path is a plain link, env-gated.
 * Never loads a third-party booking script.
 */

export const BOOKING_URL_ENV = "NEXT_PUBLIC_BOOKING_URL";

/**
 * Returns a validated absolute booking URL, or null when unset/invalid.
 * Renders nothing when null (FR-CTA-005 §1.2).
 */
export function getBookingUrl(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const raw = env[BOOKING_URL_ENV]?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function isBookingConfigured(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return getBookingUrl(env) !== null;
}
