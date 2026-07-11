---
id: FR-PERF-005
title: "Font subset, display, and preload strategy including Vietnamese glyphs"
module: PERF
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-PERF-001]
blocks: []
source_pages:
  - "research doc §E (Vietnamese typography), §B (font loading and CLS)"
new_files:
  - lib/fonts.ts
modified_files:
  - app/layout.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Fonts MUST render Vietnamese correctly and MUST not cause layout shift.

1. Self-hosted fonts MUST be subset to the Latin and Vietnamese ranges so every
   accented glyph the content uses renders without a fallback swap.
2. Each web font MUST set an explicit `font-display` policy and the primary
   text font MUST be preloaded so first paint is not blocked on a late fetch.
3. The strategy MUST be centralised in `lib/fonts.ts` and consumed by the root
   layout so the policy is applied once and consistently.

## §2 Acceptance

- Vietnamese text renders in the intended face, with all diacritics.
- The primary font is preloaded and declares a display policy.
- Font usage flows through `lib/fonts.ts`.

## §3 Evidence

Not yet implemented; acceptance pending build.
