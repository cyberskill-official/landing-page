import { NextResponse } from "next/server";

export const runtime = "nodejs";

// First-party, privacy-light event sink. No third-party scripts, no cookies.
// Logs server-side and optionally forwards to a webhook (ANALYTICS_WEBHOOK_URL)
// so funnel events (genie opens, lead submits, CTA clicks) are attributable.
const ALLOWED = new Set([
  "genie_open",
  "lead_submitted",
  "cta_click",
  "page_view",
  "form_start",
  "lead_abandoned",
  "wish_flow_started",
]);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = (body as { event?: unknown })?.event;
  if (typeof event !== "string" || !ALLOWED.has(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const props = (body as { props?: unknown }).props;
  const record = {
    event,
    props: props && typeof props === "object" ? props : null,
    ts: new Date().toISOString(),
  };
  console.info("[analytics]", JSON.stringify(record));

  const url = process.env.ANALYTICS_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(record),
      });
    } catch {
      // best effort
    }
  }

  return NextResponse.json({ ok: true });
}
