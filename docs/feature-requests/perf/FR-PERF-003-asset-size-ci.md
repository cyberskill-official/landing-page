---
id: FR-PERF-003
title: "Asset-size guard failing the build on GLB, texture, or JS regression"
module: PERF
priority: SHOULD
status: shipped
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-23
depends_on: [FR-PERF-001]
blocks: []
source_pages:
  - "research doc §L (asset budget), §J (3D asset weight)"
new_files:
  - scripts/check-asset-size.mjs
  - scripts/asset-budget.json
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

Shipped. `scripts/asset-budget.json` declares the ceilings (maxImageKB 200,
maxGlbKB 4096, maxPublicTotalKB 600, maxClientJsTotalKB 2800).
`scripts/check-asset-size.mjs` walks `public/` (per-image and per-GLB caps +
total) and the built client JS in `.next/static/chunks` (total), printing the
measured sizes and exiting non-zero on any breach. It is wired as `npm run
check:assets` and runs in the CI `build` job right after `next build`, so a
regression fails the job before deploy. Runs locally with the same command.

Current measured: public 95KB (largest asset aurora 95KB), client JS 2286KB
across 43 chunks - both within budget. When the commissioned Lumi GLB lands
(FR-CHAR-022), bump `maxGlbKB` after optimizing/Draco-compressing it.
(Budget file lives at `scripts/asset-budget.json`, not `perf/`.)
