/**
 * FR-OPS-011: Typed event taxonomy for CyberSkill.
 *
 * Every analytics event emitted on this site MUST come through this module.
 * An unknown event name fails TypeScript typecheck at compile time.
 *
 * Invariants:
 * - No event payload carries personal data beyond what the lead payload already
 *   contains (FR-OPS-011 §1.4).
 * - Analytics stay cookieless (first-party, no cross-site identifiers).
 * - This module is safe to import in server and client contexts.
 *
 * See docs/decisions/consent-stance.md for the consent posture that governs
 * when these events are forwarded to any third-party analytics endpoint.
 */

// ---------------------------------------------------------------------------
// Event payload types
// ---------------------------------------------------------------------------

export interface LeadSubmittedPayload {
  source: "contact-form" | "lumi-chat" | "synthetic" | "teardown";
  locale: string;
  utm?: UtmFields;
}

export interface CtaClickedPayload {
  location: string; // e.g. "hero", "contact-section", "footer", "persistent-cta"
  label: string;    // human-readable label of the CTA
}

export interface BookingClickedPayload {
  location: string;
}

export interface NewsletterSubscribedPayload {
  placement: string; // e.g. "footer", "blog-inline"
}

export interface FaqOpenedPayload {
  id: string; // question text or index — no PII
}

export interface ChapterReachedPayload {
  chapter: string; // scene id, e.g. "hero", "craft", "proof"
}

export interface FormStartedPayload {
  formId: string;
}

export interface FormAbandonedPayload {
  formId: string;
  lastField?: string; // name of last touched field (no value — no PII)
}

export interface TeardownDeliveredPayload {
  leadId: string;
}

// ---------------------------------------------------------------------------
// Allowlisted payload fields (FR-OPS-011 §1.4)
// ---------------------------------------------------------------------------

/** Field names that are allowed in any event payload. Anything else is stripped. */
export const ALLOWED_EVENT_FIELDS = new Set([
  "source", "locale", "utm", "location", "label", "placement",
  "id", "chapter", "formId", "lastField", "leadId",
]);

// ---------------------------------------------------------------------------
// UTM standard (FR-OPS-011 §1.3)
// ---------------------------------------------------------------------------

export interface UtmFields {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/** UTM parameter names that are persisted from query string to sessionStorage. */
export const UTM_PARAMS: (keyof UtmFields)[] = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
];

/** sessionStorage key under which UTM fields are persisted for the visit. */
export const UTM_STORAGE_KEY = "cs_utm";

/**
 * Reads utm_* params from the current URL and persists them to sessionStorage.
 * Call this once on landing (in a useEffect or layout effect).
 * Only writes if at least one param is present — does not clear existing UTMs.
 */
export function captureUtm(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const captured: Partial<UtmFields> = {};
  let found = false;
  for (const key of UTM_PARAMS) {
    const val = params.get(key);
    if (val) {
      captured[key] = val;
      found = true;
    }
  }
  if (found) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
    } catch {
      // sessionStorage unavailable (private mode, quota exceeded) — ignore.
    }
  }
}

/**
 * Reads UTM fields from sessionStorage.
 * Returns undefined if no UTMs were captured (not empty strings — omitted).
 */
export function readUtm(): UtmFields | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as UtmFields;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Event emitter
// ---------------------------------------------------------------------------

/**
 * Emit a typed analytics event. Currently logs to the server-side event
 * collector endpoint if configured; falls back to a console.info in dev.
 *
 * FR-OPS-011 §1.4: no PII is accepted beyond the lead payload. Fields not in
 * ALLOWED_EVENT_FIELDS are stripped before sending.
 */
export function emit<T extends EventName>(
  event: T,
  payload: EventPayloadMap[T],
): void {
  // Strip any field not in the allowlist.
  const safe = Object.fromEntries(
    Object.entries(payload as unknown as Record<string, unknown>).filter(([k]) =>
      ALLOWED_EVENT_FIELDS.has(k),
    ),
  );

  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event, safe);
  }

  // Forward to server-side collector if the endpoint is configured.
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (endpoint && typeof window !== "undefined") {
    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...safe, _ts: Date.now() }),
      keepalive: true,
    }).catch(() => {
      // Best-effort — never fail the user interaction.
    });
  }
}

// ---------------------------------------------------------------------------
// Event name → payload type map (ensures exhaustive typing)
// ---------------------------------------------------------------------------

export type EventPayloadMap = {
  lead_submitted: LeadSubmittedPayload;
  cta_clicked: CtaClickedPayload;
  booking_clicked: BookingClickedPayload;
  newsletter_subscribed: NewsletterSubscribedPayload;
  faq_opened: FaqOpenedPayload;
  chapter_reached: ChapterReachedPayload;
  form_started: FormStartedPayload;
  form_abandoned: FormAbandonedPayload;
  teardown_delivered: TeardownDeliveredPayload;
};

export type EventName = keyof EventPayloadMap;
