// Tiny first-party event tracker. Uses sendBeacon when available (survives
// navigation), falls back to keepalive fetch. Safe to call anywhere client-side;
// no-ops on the server. The set of names mirrors the /api/analytics allowlist.

export type AnalyticsEvent = "genie_open" | "lead_submitted" | "cta_click" | "page_view";

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ event, props });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    // fall through to fetch
  }
  try {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // analytics must never break the UX
  }
}
