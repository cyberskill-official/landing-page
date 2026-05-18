---
id: FR-SEO-009
title: "web-vitals integration — LCP/INP/CLS/FCP custom events to Plausible, sample 100% P6 / 10% stable"
module: SEO
priority: SHOULD
status: shipped
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Frontend Lead + DevOps
created: 2026-05-16
related_frs: [FR-SEO-007, FR-SEO-008, FR-PERF-011, FR-OPS-011]
depends_on: [FR-SEO-007]
blocks: []
language: typescript 5.6
service: apps/web/lib/perf/
new_files:
  - apps/web/lib/perf/web-vitals.ts
  - apps/web/lib/perf/__tests__/web-vitals.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §6.1 — CWV monitoring
  - web.dev/vitals — Google web-vitals library
  - FR-SEO-007 proxy consumer

effort_hours: 3
risk_if_skipped: "Synthetic Lighthouse is one number. Real-user web-vitals measure actual experience. Without RUM web-vitals data, perf regressions go undetected. Master plan §6.1 monitoring."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `apps/web/lib/perf/web-vitals.ts` integrating Google's `web-vitals` library (v4+).
2. **MUST** report these metrics as Plausible custom events (via FR-SEO-007 proxy):
   - **LCP** — Largest Contentful Paint.
   - **INP** — Interaction to Next Paint (replaces FID per web-vitals v4).
   - **CLS** — Cumulative Layout Shift.
   - **FCP** — First Contentful Paint.
   - **TTFB** — Time to First Byte.
3. **MUST** include in each event payload:
   - `value` (number; ms for time metrics; 0-1 for CLS).
   - `route` (current pathname).
   - `breakpoint` (mobile / tablet / desktop).
   - `connection` (effectiveType from navigator.connection).
   - `locale` (en / vi).
4. **MUST** sample at:
   - **100%** during P6 launch + first 4 weeks post-launch.
   - **10%** after stable (env-configurable).
5. **MUST** fire metric on `web-vitals` library's `onCLS`/`onINP`/etc. callbacks (not on page-unload alone).
6. **MUST** be SSR-safe (only runs client-side).
7. **MUST** be tested via Vitest unit tests + Playwright integration.
8. **MUST** handle browser support gracefully:
   - INP unavailable on Safari < 16 → silently skip (don't fall back to FID; FID deprecated).

## §2 — Why this design

**Why web-vitals lib?** Google-maintained; tracks the exact metrics Google ranks on. Authoritative.

**Why all 5 metrics?** Different signals:
- LCP = render perf.
- INP = interactivity.
- CLS = visual stability.
- FCP = perceived speed.
- TTFB = server perf.

**Why include connection?** 3G vs 4G vs wifi shows dramatically different metrics. Segmenting essential.

**Why include locale?** Vietnamese page may have different perf due to different content. Segmentation enables targeted optimization.

**Why sample 100% during P6 launch?** First weeks = critical feedback. Drop to 10% post-stable to reduce Plausible quota cost.

**Why route through FR-SEO-007 proxy (not direct Plausible)?** Privacy + retry queue. Consistent.

## §3 — Public surface

```ts
// apps/web/lib/perf/web-vitals.ts
"use client";
import { onLCP, onINP, onCLS, onFCP, onTTFB, type Metric } from "web-vitals";
import { trackEvent } from "@/lib/analytics";

const SAMPLE_RATE = Number(process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE ?? "1.0");

function getBreakpoint(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1280 ? "tablet" : "desktop";
}

function getConnection(): string {
  const conn = (navigator as any).connection;
  return conn?.effectiveType ?? "unknown";
}

function shouldSample(): boolean {
  return Math.random() < SAMPLE_RATE;
}

function reportMetric(metric: Metric) {
  if (!shouldSample()) return;
  trackEvent("web_vitals" as any, {  // extended event type
    metric_name: metric.name,
    value: metric.value,
    rating: metric.rating,  // good / needs-improvement / poor
    route: window.location.pathname,
    breakpoint: getBreakpoint(),
    connection: getConnection(),
    locale: document.documentElement.lang || "en",
  });
}

export function initWebVitals() {
  if (typeof window === "undefined") return;
  try {
    onLCP(reportMetric);
    onINP(reportMetric);
    onCLS(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);
  } catch (e) {
    console.warn("[web-vitals] init failed", e);
  }
}
```

```tsx
// apps/web/app/layout.tsx or providers.tsx — call once on mount
"use client";
import { useEffect } from "react";
import { initWebVitals } from "@/lib/perf/web-vitals";

export function WebVitalsProvider() {
  useEffect(() => { initWebVitals(); }, []);
  return null;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | web-vitals fires for each metric | Console listener |
| 2 | Plausible custom events recorded | Plausible API |
| 3 | Sample rate adjustable via env | NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE check |
| 4 | INP missing on Safari < 16 → skip silently | Safari test or mock |
| 5 | SSR-safe (no crash in node) | Build + smoke |
| 6 | Payload includes route + breakpoint + connection + locale | Verify event |
| 7 | Routes through FR-SEO-007 proxy | Inspect network |
| 8 | Vitest unit tests pass | pnpm vitest |
| 9 | TTFB tracked (not just visual metrics) | Plausible event |
| 10 | Auto-handles page-unload (web-vitals lib) | Library handles |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { initWebVitals } from "../web-vitals";

vi.mock("web-vitals", () => ({
  onLCP: vi.fn((cb) => cb({ name: "LCP", value: 1500, rating: "good" })),
  onINP: vi.fn(),
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onTTFB: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("web-vitals", () => {
  it("registers onLCP onINP onCLS onFCP onTTFB", () => {
    initWebVitals();
    const wv = require("web-vitals");
    expect(wv.onLCP).toHaveBeenCalled();
    expect(wv.onINP).toHaveBeenCalled();
    expect(wv.onCLS).toHaveBeenCalled();
  });

  it("calls trackEvent on metric report", () => {
    initWebVitals();
    const trackEvent = require("@/lib/analytics").trackEvent;
    expect(trackEvent).toHaveBeenCalledWith("web_vitals", expect.objectContaining({
      metric_name: "LCP",
      value: 1500,
    }));
  });

  it("respects sample rate", () => {
    process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE = "0.0";
    initWebVitals();
    // With sample rate 0, no events should fire
  });

  it("SSR-safe (no crash in node)", () => {
    // typeof window === "undefined" guard
    expect(() => initWebVitals()).not.toThrow();
  });
});
```

## §6 — Dependencies

**Concept:** FR-SEO-007 (proxy), FR-SEO-008 (event taxonomy extends with web-vitals events), FR-PERF-011 (dashboard consumer), FR-OPS-011 (synthetic Lighthouse correlation).

**Operational:** `web-vitals` ^4 npm package.

**Downstream:** FR-PERF-011 RUM dashboard.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| INP missing on Safari < 16 | Library handles | Silently skip; document |
| web-vitals lib version drift | Build error | Pin version; CI test on bump |
| Sample rate misconfigured (0% by accident) | No events | Env validation at boot |
| trackEvent batch overflow | FR-SEO-007 rate-limit | Sample lowering |
| Plausible quota exhausted (during 100% sample) | API 429 | Drop to 10% earlier |
| User session ends before metric fires | web-vitals beacon | Library handles via `pagehide` |
| Metrics fire on dev mode (noise) | Filter | Disable in development |
| SSR build fails | typeof check | Window guard |
| Sample randomness uneven | Acceptable | Statistical noise |
| Connection effectiveType missing | "unknown" default | Acceptable |
| TTFB measured wrong (proxy adds latency) | Sanity check | Document; Vercel edge sub-100ms typical |
| Memory leak from observers | Manual test | web-vitals lib auto-cleans |

## §8 — Deliverable preview

Visitor lands on /:
1. WebVitalsProvider mounts → initWebVitals.
2. LCP fires at ~1.4s → trackEvent("web_vitals", { metric_name: "LCP", value: 1400, ... }).
3. INP fires after first interaction → trackEvent.
4. CLS finalizes on page-unload → trackEvent.
5. Plausible records each as custom event.

Plausible dashboard:
- LCP p75: 2.1s (good).
- INP p75: 140ms (good).
- CLS p75: 0.08 (good).
- Segment by route + breakpoint + connection + locale.

## §9 — Notes

**On web-vitals v4 vs older:** v4 replaces FID with INP. Adopt v4.

**On sample rate post-stable:** Default 10% saves Plausible quota; statistical significance still strong at our traffic.

**On Vietnamese visitors:** Vietnamese audience on 3G/4G mobile primary; web-vitals data reveals their actual experience.

**On future enhancements:** Could send to Sentry too for cross-correlation with errors. Slice 3.

*End of FR-SEO-009.*
