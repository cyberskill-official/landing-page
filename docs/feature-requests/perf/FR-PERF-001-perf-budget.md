---
id: FR-PERF-001
title: "Performance budget enforced in CI (LCP <= 2500 ms, byte ceilings)"
module: PERF
priority: MUST
status: shipped
verify: T
phase: P3
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-OPS-001]
blocks: []
source_pages:
  - "research doc §L (performance budget), §B (LCP target)"
modified_files:
  - lighthouse/budget.json
  - .github/workflows/ci.yml
---

## §1 Requirement (BCP-14 normative)

The performance budget MUST be a machine-checked contract, not a hope.

1. `lighthouse/budget.json` MUST declare a timing budget with an LCP ceiling of
   2500 ms and byte ceilings for the script bundle and the total transfer.
2. CI MUST read that budget and MUST fail the job when any timing or byte
   ceiling regresses past its declared value.
3. The budget file MUST be version-controlled so every change to a ceiling lands
   as a reviewable diff.

## §2 Acceptance

- `lighthouse/budget.json` sets LCP to 2500 ms plus script and total byte caps.
- A run that exceeds the LCP ceiling fails CI.
- A bundle over the script byte cap fails CI.

## §3 Evidence

Shipped, verified, live.
