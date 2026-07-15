---
id: TASK-PERF-013
title: "Measure and gate real Core Web Vitals: mobile Lighthouse assertions plus field data"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/phase-1, audit-C/limitations, audit-B/method, audit-A/section-3]
---

# TASK-PERF-013: Measure and gate real Core Web Vitals: mobile Lighthouse assertions plus field data

## 0. Why (evidence)

Audit C could not pull PageSpeed Insights (quota error) and the site has no CrUX field data, so real-user LCP, INP
and CLS are unverified; audit A flags the same gap. The web-applications service page publicly promises "Core Web Vitals
kept in the green", so measuring and holding them is a credibility matter, not only an engineering one. TASK-PERF-002 and
TASK-PERF-006 shipped Lighthouse CI and Speed Insights; this task raises them to an asserted, regression-proof floor.

## 1. Description (normative)

- 1.1 lighthouserc.json SHALL assert, on mobile emulation, LCP <= 2500 ms, TBT <= 300 ms, CLS <= 0.1 and performance score >= 85, and CI SHALL fail below any of them.
- 1.2 The repository SHALL record a dated baseline (docs/verification/) containing the 2026-07-10 benchmark numbers (mobile perf 47, CLS 0.431, TBT 1,370 ms, 573 KB) so every later run is comparable.
- 1.3 Field Core Web Vitals SHALL be collected at p75 (Vercel Speed Insights and/or the web-vitals library posting to /api/analytics) and reviewed monthly.
- 1.4 When p75 field LCP, INP or CLS breaches its good threshold, an alert SHALL fire to the owner.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the assertions exist and a seeded regression fails CI - test: `ci/lighthouse-assertions`
- [ ] AC for 1.2 - the baseline document exists with the four numbers - test: `docs/perf-baseline-present`
- [ ] AC for 1.3 - field vitals appear at p75 in the dashboard - test: `analytics/field-vitals-ingest`
- [ ] AC for 1.4 - a seeded breach triggers the alert path - test: `analytics/cwv-alert`

## 3. Edge cases

- Low traffic means sparse CrUX - the task must not assume CrUX exists; Speed Insights is the primary source.
- Lighthouse variance between runs: assertions use medians of 3 runs, not a single run.
- Preview deployments must not page the owner.

## 4. Out of scope / non-goals

- Fixing the metrics (TASK-PERF-007/008/012).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- The public 'Core Web Vitals in the green' claim on the services page must not outrun the measured data.
