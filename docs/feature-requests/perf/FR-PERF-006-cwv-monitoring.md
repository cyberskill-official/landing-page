---
id: FR-PERF-006
title: "Field Core Web Vitals monitoring via Vercel Speed Insights"
module: PERF
priority: SHOULD
status: shipped
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-23
depends_on: [FR-OPS-003]
related_frs: [FR-OPS-007]
blocks: []
source_pages:
  - "research doc §B (field vs lab metrics), §L (monitoring)"
modified_files:
  - app/layout.tsx
  - package.json
---

## §1 Requirement (BCP-14 normative)

Real-user metrics MUST be observed, not just lab scores.

1. The app MUST collect field Core Web Vitals from real visitors through Vercel
   Speed Insights, distinct from the synthetic Lighthouse runs.
2. The collected metrics MUST be visible in the project dashboard so LCP, CLS,
   and INP trends can be tracked over real traffic.
3. The integration MUST follow the dependency note in FR-OPS-007 so the
   `@vercel/*` peer conflict does not break installs.

## §2 Acceptance

- Field CWV data appears in the Vercel dashboard from real sessions.
- LCP, CLS, and INP are tracked over time.
- Install succeeds with the documented peer-dependency handling.

## §3 Evidence

Shipped (integration). `<SpeedInsights />` from `@vercel/speed-insights` is
mounted in `app/layout.tsx`, so real-user LCP, CLS, and INP are collected from
every route, distinct from the synthetic Lighthouse-CI runs (FR-PERF-002). This
is live in production. The dashboard trend (§2 item 1-2) accrues with real
traffic and is viewed in the Vercel project's Speed Insights tab - that part is
data accumulation on Vercel's side, not a code deliverable. Install handling per
FR-OPS-007 (no `.npmrc` needed; the peer conflict no longer reproduces).
Verified: build green with the component mounted.
