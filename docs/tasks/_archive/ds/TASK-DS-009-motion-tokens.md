---
id: TASK-DS-009
title: "Motion tokens (easing and duration) consumed by all transitions"
module: DS
priority: COULD
status: done
class: product
verify: T
phase: P1
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-DS-001]
source_pages:
  - "research doc §C (motion scale, design tokens), §D (reduced motion)"
new_files:
  - lib/motion/tokens.ts
modified_files:
  - app/globals.css
  - lib/scroll/lenis-gsap.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Motion MUST be tokenized so every transition and the scene share one set of easing and duration values rather than each picking its own.

1. The system MUST define easing and duration motion tokens as `--cs-*` custom properties.
2. All UI transitions and the 3D scene MUST read timing from those tokens and MUST NOT hardcode ad hoc durations or cubic-beziers in components.
3. Under `prefers-reduced-motion: reduce`, token-driven transitions MUST reduce to no motion without breaking layout or state.

## §2 Acceptance

- Easing and duration tokens are defined once and referenced by transitions and the scene.
- With motion reduced, animated elements settle to their final state with no movement.

## §3 Evidence

Shipped 2026-06-22. The motion scale lives once in `:root` in `globals.css`: `--cs-ease` plus `--cs-dur-fast`/`--cs-dur`/`--cs-dur-slow`, with `--cs-dur-scroll` for the scene and `--cs-dur-shimmer` for the skeleton (clause 1). Every CSS transition references these tokens (header, cards, links, reveal, skeleton); the last hardcoded value (the skeleton's `1.4s ease`) now uses `var(--cs-dur-shimmer) linear`, so no component hardcodes an ad hoc duration or cubic-bezier (clause 2, CSS side). The 3D scene reads the same scale: `lib/motion/ tokens.ts` `readDurationSeconds()` parses `--cs-dur-scroll` from `:root` and `lib/scroll/lenis-gsap.ts` passes it to Lenis as the smooth-scroll `duration` (clause 2, scene side); `parseDurationToSeconds` is unit-tested in `tests/motion-tokens.test.ts`. Under `prefers-reduced-motion: reduce` the UI duration tokens collapse to `0.01ms` so token-driven transitions settle with no movement (clause 3), while `--cs-dur-scroll` is intentionally left intact because the storytelling motion is an explicit always-on product decision (see [[2026-06-22-always-motion-override]]). Verified by `next build` (rc=0) plus tsc + lint + vitest (32 tests) green.

Note: per-frame lerp damping in `LumiPlaceholder` is frame-rate smoothing, not a design "duration", so it is deliberately not tokenized.
