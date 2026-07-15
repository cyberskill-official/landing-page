---
id: TASK-OPS-001
title: "CI: static import check + typecheck + build + performance-budget gate"
module: OPS
priority: MUST
status: done
class: product
verify: T
phase: P3
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: []
blocks: []
source_pages:
  - "research doc §L (CI + performance budget), §B (LCP target)"
new_files:
  - .github/workflows/ci.yml
  - lighthouse/budget.json
  - scripts/verify-static.mjs
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

CI MUST be the machine that enforces what humans cannot eyeball.

1. CI MUST run the static verification script, a typecheck, and a build on every
   push and pull request, and MUST fail the job if any step fails.
2. CI MUST enforce a Lighthouse performance budget and MUST fail if the LCP
   budget regresses past 2500 ms.
3. `lighthouse/budget.json` MUST be the machine-checked performance contract
   (script bundle, total bytes, and timing budgets), version-controlled so a
   regression is a diff.
4. `scripts/verify-static.mjs` MUST be runnable locally so the same checks gate
   before a push.

## §2 Acceptance

- A type error or failed build fails CI.
- An LCP budget over 2500 ms in `budget.json` fails CI.
- `node scripts/verify-static.mjs` runs the static checks locally.

## §3 Evidence

Static: `.github/workflows/ci.yml` runs verify + typecheck + build + budget;
`lighthouse/budget.json` sets the LCP ceiling; `scripts/verify-static.mjs`
present. Deferred: a live CI run on the operator's GitHub.
