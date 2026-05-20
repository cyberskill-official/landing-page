---
id: FR-PERF-011
title: "Post-launch RUM dashboard — Plausible + web-vitals percentiles, segment-by-route/breakpoint/connection"
module: PERF
priority: SHOULD
status: done
blocked_reason: "RUM dashboard config, event forwarding, segmentation, setup guide, unit tests, type check, and build are complete; live Plausible dashboard/API and Slack alert verification require production credentials."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: DevOps + Frontend Lead
created: 2026-05-16
related_frs: [FR-SEO-007, FR-SEO-009, FR-OPS-011, FR-PERF-001]
depends_on: [FR-SEO-007, FR-SEO-009]
blocks: []
language: typescript 5.6 + plausible api
service: apps/web/lib/perf/ + Plausible dashboard
new_files:
  - apps/web/lib/perf/rum-dashboard-config.ts
  - docs/launch/rum-dashboard-setup.md
modified_files:
  - apps/web/lib/perf/web-vitals.ts
  - apps/web/lib/perf/__tests__/web-vitals.unit.test.ts
  - apps/web/lib/perf/__tests__/rum-dashboard-config.unit.test.ts
  - apps/web/lib/analytics/events.ts
  - apps/web/lib/analytics/proxy.ts
  - apps/web/lib/analytics/__tests__/proxy.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §6.1 (CWV targets + post-launch monitoring)
  - FR-SEO-007 GA4+Plausible proxy
  - FR-SEO-009 web-vitals integration

effort_hours: 4
risk_if_skipped: "Lighthouse synthetic tests run in ideal conditions (no network jitter, perfect device). Real users have flaky 3G, old phones, browser extensions. RUM = ground truth. Without it, we celebrate Lighthouse 95 while users see LCP 4s+."
---

## §1 — Description (BCP-14 normative)

1. **MUST** track CWV metrics in Plausible (via FR-SEO-009 web-vitals integration):
   - LCP percentiles: p50, p75, p90.
   - INP percentiles: p50, p75, p90.
   - CLS percentiles: p50, p75, p90.
2. **MUST** segment metrics by:
   - Route (/, /lite, /work/*, etc.)
   - Breakpoint (mobile / tablet / desktop)
   - Connection type (4G / 3G / wifi via navigator.connection.effectiveType)
   - Locale (en / vi)
3. **MUST** include real-device data — RUM data, not synthetic.
4. **MUST** alert on regressions > 10% week-over-week:
   - Slack webhook to #perf-monitor channel.
   - Weekly cron checks rolling 7-day average.
5. **MUST** ship a Plausible custom dashboard config at `docs/launch/rum-dashboard-setup.md`.
6. **MUST** include 7-day rolling window (handles SMB site low traffic).
7. **MUST** be public-readable by founder + frontend lead.
8. **MUST** correlate with synthetic Lighthouse (FR-OPS-011) — track when synthetic + real diverge.

## §2 — Why this design

**Why Plausible (not GA4)?** Privacy-first, cookieless, EU-compliant. GA4 collects more (cookies, IP) — more data but privacy cost.

**Why p50/p75/p90 percentiles?** Average misleads. p75 = "most users." p90 = "tail users (3G, old devices)." Both matter.

**Why segment by connection?** A user on 4G + a user on 3G aren't the same; aggregating hides 3G UX.

**Why 7-day window?** SMB site has low traffic; 1-day samples are noisy.

**Why 10% regression threshold?** Below 10% = noise. Above = signal. Calibrated for our traffic volume.

**Why correlate with Lighthouse?** Synthetic + real should track. If they diverge: real degraded but Lighthouse OK = environmental issue; Lighthouse degraded but real OK = test config drift.

## §3 — Public surface

```ts
// apps/web/lib/perf/rum-dashboard-config.ts
export interface RumMetric {
  name: "LCP" | "INP" | "CLS" | "FCP" | "TBT";
  percentiles: {
    p50: number;
    p75: number;
    p90: number;
  };
  segment: {
    route: string;
    breakpoint: "mobile" | "tablet" | "desktop";
    connection: string;
    locale: "en" | "vi";
  };
  sample_size: number;  // visitors in window
}

export const TARGETS = {
  LCP: { good: 2500, needs_improvement: 4000 },  // ms
  INP: { good: 200, needs_improvement: 500 },
  CLS: { good: 0.1, needs_improvement: 0.25 },
};

export const ALERT_THRESHOLD_PCT = 10;  // % regression triggers alert
```

```markdown
<!-- docs/launch/rum-dashboard-setup.md -->
# Plausible RUM dashboard setup

## Custom events tracked (via FR-SEO-009)

- `web-vitals/LCP` — Largest Contentful Paint
- `web-vitals/INP` — Interaction to Next Paint
- `web-vitals/CLS` — Cumulative Layout Shift
- `web-vitals/FCP` — First Contentful Paint
- `web-vitals/TBT` — Total Blocking Time

Each event payload:
```json
{
  "value": 1234,  // milliseconds (or 0-1 for CLS)
  "route": "/",
  "breakpoint": "mobile",
  "connection": "4g",
  "locale": "en"
}
```

## Dashboard panels

1. **LCP percentiles over time** (line chart, p50/p75/p90, last 30 days).
2. **INP by route** (bar chart, p75).
3. **CLS distribution** (histogram).
4. **Mobile vs desktop comparison** (bar chart per metric).
5. **3G vs 4G/wifi comparison** (bar chart per metric).
6. **EN vs VI locale comparison** (bar chart per metric).
7. **Synthetic vs RUM correlation** (scatter plot — Lighthouse score vs RUM p75).

## Weekly alert cron

GitHub Actions:
```yaml
- cron: '0 10 * * 1'  # Monday 10:00 UTC
```

Compare last 7 days vs previous 7 days. Alert if any percentile regressed > 10%.

## Public access

- Plausible dashboard shareable URL: https://plausible.io/share/cyberskill.world?auth=<token>
- Founder + Frontend Lead have view access.
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Dashboard live + accessible | curl Plausible API |
| 2 | LCP/INP/CLS percentiles tracked | Plausible events |
| 3 | Segmentation works (route + breakpoint + connection + locale) | Filter test |
| 4 | Real-device data (not synthetic) | Source: client web-vitals lib |
| 5 | Alert wired on > 10% regression | Mock + assert |
| 6 | 7-day rolling window | Aggregation period correct |
| 7 | Public-readable URL shared | Founder + Lead access |
| 8 | Synthetic + RUM correlation tracked | Cross-data join |
| 9 | EN + VI locale segmentation | Plausible event filter |
| 10 | Vitest unit tests pass | pnpm vitest |

## §5 — Verification

```bash
# Verify Plausible custom events firing
curl https://plausible.io/api/v1/stats/realtime/visitors?site_id=cyberskill.world
curl https://plausible.io/api/v1/stats/aggregate?site_id=cyberskill.world&metrics=visitors&filters=event:LCP

# Manual test: visit production, check Plausible dashboard for LCP event with correct payload
```

```ts
import { describe, it, expect } from "vitest";
import { TARGETS, ALERT_THRESHOLD_PCT } from "../rum-dashboard-config";

describe("RUM config", () => {
  it("LCP targets aligned with Google CWV", () => {
    expect(TARGETS.LCP.good).toBe(2500);
    expect(TARGETS.LCP.needs_improvement).toBe(4000);
  });
  it("Alert threshold reasonable", () => {
    expect(ALERT_THRESHOLD_PCT).toBeGreaterThanOrEqual(5);
    expect(ALERT_THRESHOLD_PCT).toBeLessThanOrEqual(20);
  });
});
```

## §6 — Dependencies

**Concept:** FR-SEO-007 (analytics proxy), FR-SEO-009 (web-vitals integration), FR-OPS-011 (synthetic Lighthouse correlation), FR-PERF-001 (CWV targets).

**Operational:** Plausible Analytics account, GitHub Actions cron, Slack webhook.

**Downstream:** Performance regression detection; informed iteration.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Sample size too small for SMB site | Plausible API | Aggregate over 7-day rolling window |
| INP missing on Safari < 16 | FR-SEO-009 fallback | FID fallback |
| Plausible event tagging wrong | Manual inspection | Verify event name + payload |
| Alert false positive (noise spike) | Visual review | Raise threshold to 15% if needed |
| Locale segmentation missed (EN visit on /vi) | Plausible filter | Add locale field to every event |
| Plausible quota exceeded | Pricing tier | Upgrade plan or sample at 50% |
| 7-day window misses real regression (slow build-up) | Manual review | Add 30-day trend panel |
| Synthetic vs RUM correlation broken (different metrics) | Cross-data | Normalize metric definitions |
| Dashboard breaks on Plausible UI update | Plausible blog announcement | Adjust config |
| Connection type undefined on Safari | Plausible event | Default "unknown" |
| Founder doesn't check dashboard | Cadence | Weekly Slack auto-summary |
| Regression alert during legitimate change | Manual review | Tag alerts with "expected" |

## §8 — Deliverable preview

Plausible dashboard (post-launch):
- LCP p50: 1.4s (good). p75: 2.1s (good). p90: 3.8s (needs improvement; 3G users).
- INP p50: 80ms. p75: 140ms. p90: 280ms.
- CLS p50: 0.05. p75: 0.08. p90: 0.18.
- Segmented: mobile vs desktop, 3G vs 4G vs wifi.

Weekly alert (Monday morning):
```
📊 Perf RUM weekly report
- LCP p75: 2.1s (stable, -0.05s vs prev week)
- INP p75: 140ms (regressed, +30ms vs prev week) ⚠️ flagged
- CLS p75: 0.08 (stable)
Investigate INP regression — possibly new component on /work/sample.
```

## §9 — Notes

**On Plausible vs alternatives:** Plausible is privacy-first; could replace with PostHog (more features, also EU-compliant). Plausible cheaper for SMB.

**On Vietnamese audience perf:** Likely 3G/4G majority. Tracking by connection critical for them.

**On future: Sentry RUM:** Sentry has performance monitoring. Could complement Plausible for more detail. Slice 3.

*End of FR-PERF-011.*

## §10 — Implementation status

Status: **blocked on production Plausible and Slack verification**.

Delivered:

- `apps/web/lib/perf/rum-dashboard-config.ts` defines RUM metrics, CWV targets, 7-day window, 10% regression threshold, route normalization, locale inference, percentile helpers, and regression alert helper.
- `docs/launch/rum-dashboard-setup.md` defines the Plausible dashboard panels, API verification commands, Slack alert contract, public access process, and synthetic/RUM correlation workflow.
- Web-vitals payloads now include locale and normalized route segments.
- Plausible forwarding maps internal `web_vitals` events to metric-specific custom events such as `web-vitals/LCP`.

Verified:

- `node_modules/.bin/vitest run lib/perf/__tests__/rum-dashboard-config.unit.test.ts lib/perf/__tests__/web-vitals.unit.test.ts lib/analytics/__tests__/proxy.unit.test.ts components/perf/__tests__/WebVitalsReporter.unit.test.tsx --config vitest.config.ts`
- `node_modules/.bin/tsc -p tsconfig.json --noEmit`
- `node_modules/.bin/next build`

Blocked items:

- AC#1 live dashboard accessibility needs Plausible production access.
- AC#2/3 live event and filter verification needs Plausible production data.
- AC#4 real-device data needs production traffic after launch.
- AC#5 Slack alert verification needs the `#perf-monitor` webhook and scheduled job environment.
- AC#7 public-readable URL cannot be generated without the Plausible share token.
