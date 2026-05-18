# Plausible RUM Dashboard Setup

Related FR: FR-PERF-011.
Status: config-ready, blocked on production Plausible access and Slack webhook setup.

## Purpose

Synthetic Lighthouse checks are useful, but real users are the source of truth. This dashboard tracks Core Web Vitals from real browsers through the existing `/api/analytics` proxy and Plausible Events API.

## Metrics

Track these metrics as Plausible custom events:

| Metric | Event name | Good | Needs improvement |
|---|---|---:|---:|
| LCP | `web-vitals/LCP` | <= 2500 ms | <= 4000 ms |
| INP | `web-vitals/INP` | <= 200 ms | <= 500 ms |
| CLS | `web-vitals/CLS` | <= 0.10 | <= 0.25 |
| FCP | `web-vitals/FCP` | <= 1800 ms | <= 3000 ms |
| TTFB | `web-vitals/TTFB` | <= 800 ms | <= 1800 ms |

Use p50, p75, and p90 in every panel. Treat p75 as the launch health gate and p90 as the slow-tail investigation view.

## Event Properties

Each event is emitted through `web_vitals` internally and forwarded to Plausible as `web-vitals/{metric}`.

Required properties:

```json
{
  "metric_name": "LCP",
  "value": 2100,
  "rating": "good",
  "route": "/work/*",
  "breakpoint": "mobile",
  "connection": "4g",
  "locale": "vi"
}
```

Segmentation contract:

- `route`: normalized route, including `/work/*` and `/vi/work/*` for case-study detail pages.
- `breakpoint`: `mobile`, `tablet`, or `desktop`.
- `connection`: `navigator.connection.effectiveType` when available, otherwise `unknown`.
- `locale`: inferred from pathname, `en` or `vi`.

## Plausible Dashboard Panels

Create these panels in Plausible or the exported reporting sheet:

1. LCP p50, p75, p90 by route, last 7 days and last 30 days.
2. INP p50, p75, p90 by route, last 7 days and last 30 days.
3. CLS p50, p75, p90 by route, last 7 days and last 30 days.
4. Mobile/tablet/desktop comparison per metric.
5. Connection comparison for 3g, 4g, wifi, and unknown.
6. EN vs VI locale comparison.
7. Synthetic Lighthouse vs RUM p75 notes.

Use a 7-day rolling window for alerting because early traffic can be low and daily samples are noisy.

## Plausible API Verification

Set:

```bash
export PLAUSIBLE_API_KEY="<token>"
export PLAUSIBLE_SITE_ID="cyberskill.world"
```

Verify realtime collection:

```bash
curl -H "Authorization: Bearer $PLAUSIBLE_API_KEY" \
  "https://plausible.io/api/v1/stats/realtime/visitors?site_id=$PLAUSIBLE_SITE_ID"
```

Verify custom event presence:

```bash
curl -H "Authorization: Bearer $PLAUSIBLE_API_KEY" \
  "https://plausible.io/api/v1/stats/aggregate?site_id=$PLAUSIBLE_SITE_ID&period=7d&metrics=events&filters=event:name==web-vitals/LCP"
```

Verify route segmentation:

```bash
curl -H "Authorization: Bearer $PLAUSIBLE_API_KEY" \
  "https://plausible.io/api/v1/stats/breakdown?site_id=$PLAUSIBLE_SITE_ID&period=7d&property=event:props:route&filters=event:name==web-vitals/LCP"
```

Verify locale segmentation:

```bash
curl -H "Authorization: Bearer $PLAUSIBLE_API_KEY" \
  "https://plausible.io/api/v1/stats/breakdown?site_id=$PLAUSIBLE_SITE_ID&period=7d&property=event:props:locale&filters=event:name==web-vitals/LCP"
```

## Weekly Alert Contract

Schedule a weekly job for Monday 10:00 UTC.

Inputs:

- Plausible API key.
- Slack webhook for `#perf-monitor`.
- Current 7-day p75 values by metric and segment.
- Previous 7-day p75 values by metric and segment.

Alert when:

```text
((current_p75 - previous_p75) / previous_p75) * 100 > 10
```

Slack message template:

```text
Perf RUM weekly report
- LCP p75: {current} ms ({delta}% vs previous week)
- INP p75: {current} ms ({delta}% vs previous week)
- CLS p75: {current} ({delta}% vs previous week)
Flagged: {metric} on {route} / {breakpoint} / {connection} / {locale}
Next: compare Lighthouse CI run, recent deploys, and changed components.
```

## Public Access

Create a Plausible shared link after production launch:

```text
https://plausible.io/share/cyberskill.world?auth=<token>
```

Grant view access to:

- Founder.
- Frontend lead.
- DevOps owner.

Do not commit the share token into git. Store the live URL in the project tracker or password manager.

## Synthetic Correlation

Each weekly review should include:

- Latest Lighthouse CI median LCP, INP/TBT, CLS, and performance score.
- RUM p75 for the same route.
- A note when Lighthouse and RUM diverge.

Interpretation:

- Lighthouse good, RUM poor: investigate real network/device variance and third-party runtime.
- Lighthouse poor, RUM good: investigate CI config drift or synthetic throttling changes.
- Both poor: prioritize performance fix before further visual work.

## Current Blocker

The code-level event config is present, but this workspace cannot verify a live Plausible dashboard or Slack alert without production Plausible credentials and webhook secrets.
