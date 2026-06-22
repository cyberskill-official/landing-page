---
id: FR-PERF-003
title: "Asset-size guard failing the build on GLB, texture, or JS regression"
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
  - "research doc §L (asset budget), §J (3D asset weight)"
new_files:
  - scripts/check-asset-size.mjs
  - perf/asset-budget.json
---

## §1 Requirement (BCP-14 normative)

Heavy assets MUST not creep past their budget unnoticed.

1. `perf/asset-budget.json` MUST declare per-category byte ceilings for the GLB
   model, textures, and the JavaScript bundle.
2. `scripts/check-asset-size.mjs` MUST measure the built assets against those
   ceilings and MUST exit non-zero when any category regresses.
3. CI MUST run the guard on every build so a regression fails the job rather
   than shipping.

## §2 Acceptance

- A GLB or texture over its ceiling fails the build.
- A JS bundle over its ceiling fails the build.
- `node scripts/check-asset-size.mjs` runs the same check locally.

## §3 Evidence

Not yet implemented; acceptance pending build.
