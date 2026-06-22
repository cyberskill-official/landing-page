---
id: FR-A11Y-003
title: "Automated axe-core accessibility checks in CI"
module: A11Y
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §H (automated a11y testing), §L (CI gates)"
planned_files:
  - tests/a11y/axe.spec.ts
---

## §1 Requirement (BCP-14 normative)

Accessibility regressions SHOULD be caught automatically before merge.

1. CI SHOULD run axe-core against the home, `/work`, `/careers`, and a
   case-study route on every build.
2. The check MUST fail the build when it finds violations at the serious or
   critical level.
3. The run MUST cover both locales for at least the home route so localised
   markup is exercised.
4. Each failure MUST report the rule, the offending selector, and the route so
   the fix is actionable.

## §2 Acceptance

- The CI job runs axe-core across the listed routes on a pull request.
- Introducing a serious or critical violation fails the build.
- Failure output names the rule, selector, and route.

## §3 Evidence

Partial (status stays planned). A first automated axe gate landed in CI:
`tests/axe.test.ts` renders representative presentational components (TrustBand,
Faq, SiteFooter) to server markup in jsdom and runs `axe-core` over them for both
`en` and `vi`, failing on any violation. It runs inside the existing vitest job
the CI workflow already executes (`axe-core` + `jsdom` added as devDeps; vitest
configured with the automatic JSX runtime). Both locales currently pass with zero
violations.

Still to do for full acceptance: run axe against the actual rendered routes
(home, `/work`, `/careers`, a case study) on a served production build so
page-level rules (landmarks, single-main, bypass) and real `color-contrast` are
exercised, scoped to serious/critical, with rule + selector + route in the
output. That needs a served-build step (pa11y-ci or @axe-core/cli against
`next start`, or Playwright + @axe-core/playwright) which is a heavier CI job;
this component-level check is the down-payment.
