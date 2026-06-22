---
id: FR-OPS-007
title: "Wire Vercel Speed Insights with the legacy-peer-deps install note"
module: OPS
priority: COULD
status: planned
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-OPS-003]
related_frs: [FR-PERF-006]
blocks: []
source_pages:
  - "research doc §L (Speed Insights), §F (build tooling)"
new_files:
  - .npmrc
modified_files:
  - app/layout.tsx
  - package.json
---

## §1 Requirement (BCP-14 normative)

Speed Insights MUST be installable without breaking the test toolchain.

1. The Vercel Speed Insights component MUST be mounted in the root layout so
   field metrics are reported from every route.
2. The install MUST resolve the known `@vercel/*` and Vitest Vite peer
   conflict; a committed `.npmrc` with `legacy-peer-deps=true` MUST make the
   install deterministic.
3. The dependency note MUST be recorded so the next operator does not rediscover
   the conflict by hitting it.

## §2 Acceptance

- The Speed Insights component is mounted in the layout.
- A clean install succeeds with the committed `.npmrc`.
- Vitest still installs and runs alongside `@vercel/*`.

## §3 Evidence

Not yet implemented; acceptance pending build.
