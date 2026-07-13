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
  "hero_wish",
  "wish_flow_started",
  "cwv_metric",
  "clear_history_for_testing",
]);

const WINDOW_SIZE = 100;
const history: Record<string, number[]> = {
  LCP: [],
  CLS: [],
  INP: [],
};

function clearHistory() {
  history.LCP = [];
  history.CLS = [];
  history.INP = [];
}

function trackMetricAndCheckP75(name: string, value: number): boolean {
  const list = history[name];
  if (!list) return false;
  list.push(value);
  if (list.length > WINDOW_SIZE) {
    list.shift();
  }
  
  const sorted = [...list].sort((a, b) => a - b);
  const p75Idx = Math.floor(sorted.length * 0.75);
  const p75Value = sorted[p75Idx];
  
  if (name === "LCP" && p75Value > 2500) return true;
  if (name === "CLS" && p75Value > 0.1) return true;
  if (name === "INP" && p75Value > 200) return true;
  return false;
}

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

  if (event === "clear_history_for_testing") {
    if (process.env.NODE_ENV !== "production") {
      clearHistory();
    }
    return NextResponse.json({ ok: true });
  }

  if (event === "cwv_metric" && props && typeof props === "object") {
    const { name, value } = props as { name?: string; value?: number };
    if (typeof name === "string" && typeof value === "number" && ["LCP", "CLS", "INP"].includes(name)) {
      const isBreach = trackMetricAndCheckP75(name, value);
      if (isBreach) {
        console.error(`[alert] cwv p75 breach: ${name} value ${value} exceeds good threshold`);
      }
    }
  }

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
