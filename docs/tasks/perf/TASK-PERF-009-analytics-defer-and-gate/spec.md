---
id: TASK-PERF-009
title: "Defer and consent-gate the analytics tags so they cost nothing on first paint"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [TASK-OPS-013]
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-12-low, audit-B/phase-2, audit-A/section-8]
---

# TASK-PERF-009: Defer and consent-gate the analytics tags so they cost nothing on first paint

## 0. Why (evidence)

Audit B: Google Tag Manager (157 KB) loads on first paint with no consent gate and no deferral, adding third-party
weight and execution before the visitor has done anything. app/layout.tsx loads gtag with `strategy="lazyOnload"` plus
Vercel Analytics and Speed Insights. The site's own privacy page claims cookieless, first-party-only analytics, so a
Google tag on every page is also a consistency problem for the PDPL posture described in audit A §8.

## 1. Description (normative)

- 1.1 The Google tag SHALL load only after first interaction or browser idle, whichever comes first, and never before the LCP element has painted.
- 1.2 The Google tag SHALL be gated on the consent stance decided in TASK-OPS-013; when consent is absent or denied it SHALL NOT load.
- 1.3 The privacy page copy SHALL be reconciled with whatever tags actually ship, in EN and VN.
- 1.4 A mobile Lighthouse run SHALL show zero third-party script bytes in the critical path.

## 2. Acceptance criteria

- [ ] AC for 1.1 - no googletagmanager request occurs before LCP in a scripted trace - test: `perf/no-3p-before-lcp`
- [ ] AC for 1.2 - with consent denied, no tag request is made - test: `analytics/consent-gate`
- [ ] AC for 1.3 - the privacy page lists exactly the tags that load, EN and VN - test: `content/privacy-analytics-parity`
- [ ] AC for 1.4 - third-party critical-path bytes = 0 - test: `lighthouse:mobile-perf`

## 3. Edge cases

- A visitor who never interacts: the tag may never load - page-view attribution must degrade, not break.
- Consent revoked mid-session must stop further beacons.
- Vercel Analytics/Speed Insights are first-party and cookieless: they stay, but must not regress the budget.

## 4. Out of scope / non-goals

- Choosing the consent solution (TASK-OPS-013).
- Replacing GA4 with another vendor.

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- The site's cookieless, first-party-only claim in the privacy page must remain literally true.
