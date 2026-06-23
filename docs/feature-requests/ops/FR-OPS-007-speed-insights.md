---
id: FR-OPS-007
title: "Wire Vercel Speed Insights with the legacy-peer-deps install note"
module: OPS
priority: COULD
status: shipped
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-23
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

Shipped. `@vercel/speed-insights@^2` (and `@vercel/analytics@^2`) are in
`package.json`, and `<SpeedInsights />` (+ `<Analytics />`) are mounted in
`app/layout.tsx`, so field metrics report from every route. The peer conflict
this FR anticipated no longer reproduces: a clean `npm install` succeeds with no
`.npmrc` (the dependency tree resolved cleanly once the packages landed via the
Vercel install PRs), and Vitest still installs and runs alongside them (37
tests pass). So no `.npmrc` was needed; the note for the next operator is simply
that the conflict is gone. Verified: clean install + vitest + next build green.
