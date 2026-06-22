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

Not yet implemented; acceptance pending build.
