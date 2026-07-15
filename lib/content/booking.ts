/**
 * TASK-CTA-005: Call-booking path is a plain link, env-gated.
 * Never loads a third-party booking script.
 *
 * IMPORTANT (Next.js): client bundles only inline NEXT_PUBLIC_* when accessed
 * as a *static* member expression (`process.env.NEXT_PUBLIC_BOOKING_URL`).
 * Dynamic keys like `process.env[name]` are NOT replaced and resolve to
 * undefined in the browser.
 */

export const BOOKING_URL_ENV = "NEXT_PUBLIC_BOOKING_URL" as const;

/**
 * Read the build-time booking URL via static env access (Next-safe).
 * Optional `override` is for tests only.
 */
export function readBookingUrlEnv(override?: string | null): string | undefined {
  if (override !== undefined) {
    return override === null ? undefined : override;
  }
  // Static access — required for Next client inlining.
  return process.env.NEXT_PUBLIC_BOOKING_URL;
}

/**
 * Returns a validated absolute booking URL, or null when unset/invalid.
 * Renders nothing when null (TASK-CTA-005 §1.2).
 */
export function getBookingUrl(override?: string | null): string | null {
  const raw = readBookingUrlEnv(override)?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function isBookingConfigured(override?: string | null): boolean {
  return getBookingUrl(override) !== null;
}
