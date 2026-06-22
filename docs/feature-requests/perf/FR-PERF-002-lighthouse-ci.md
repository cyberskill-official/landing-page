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
  - .github/workflows/ci.yml (lighthouse job added)
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

Partially implemented (advisory). `lighthouserc.json` runs `@lhci/cli autorun`
against the built site (`npm run start`) on `/en` and `/vi`, asserting
`lighthouse/budget.json` (LCP, CLS, total-blocking-time, interactive, and the
resource-size and third-party budgets). The `lighthouse` job in
`.github/workflows/ci.yml` runs on every push and pull request under
Lighthouse's default mobile emulation and uploads the report to temporary
public storage (URL printed in the job log).

The one acceptance item still open is the hard fail: the job is currently
`continue-on-error: true`, so a breach reports but does not yet fail the PR.
This is deliberate - CI-measured timing metrics can flake on a shared runner,
and the threshold was authored offline and not yet baselined against a real CI
run. The plan: confirm the first CI runs are green, then drop
`continue-on-error` so a budget breach blocks merge, at which point §2 is fully
met. Until then this FR stays `planned`, not shipped.
