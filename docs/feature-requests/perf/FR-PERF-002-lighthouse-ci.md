---
id: FR-PERF-002
title: "Lighthouse CI on mobile emulation per PR, asserting CWV thresholds"
module: PERF
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-PERF-001]
blocks: []
source_pages:
  - "research doc §L (Lighthouse CI), §B (Core Web Vitals)"
new_files:
  - lighthouserc.json
  - .github/workflows/lighthouse.yml
---

## §1 Requirement (BCP-14 normative)

Lighthouse MUST run on every pull request so a regression is caught before merge.

1. Lighthouse CI MUST run under mobile emulation, since mobile is the slower and
   more representative profile for the audience.
2. The run MUST assert Core Web Vitals thresholds (LCP, CLS, and total blocking
   time) and MUST fail the pull request when an assertion regresses.
3. The asserted thresholds MUST live in `lighthouserc.json` so they change only
   through a reviewed diff.

## §2 Acceptance

- A pull request triggers a mobile Lighthouse run.
- A CWV threshold breach fails the pull request.
- Thresholds are read from `lighthouserc.json`.

## §3 Evidence

Not yet implemented; acceptance pending build.
