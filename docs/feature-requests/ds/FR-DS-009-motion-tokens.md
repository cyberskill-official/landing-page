---
id: FR-DS-009
title: "Motion tokens (easing and duration) consumed by all transitions"
module: DS
priority: COULD
status: planned
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-DS-001]
source_pages:
  - "research doc §C (motion scale, design tokens), §D (reduced motion)"
new_files:
  - app/globals.css
---

## §1 Requirement (BCP-14 normative)

Motion MUST be tokenized so every transition and the scene share one set of
easing and duration values rather than each picking its own.

1. The system MUST define easing and duration motion tokens as `--cs-*` custom
   properties.
2. All UI transitions and the 3D scene MUST read timing from those tokens and
   MUST NOT hardcode ad hoc durations or cubic-beziers in components.
3. Under `prefers-reduced-motion: reduce`, token-driven transitions MUST reduce
   to no motion without breaking layout or state.

## §2 Acceptance

- Easing and duration tokens are defined once and referenced by transitions and
  the scene.
- With motion reduced, animated elements settle to their final state with no
  movement.

## §3 Evidence

Not yet implemented; acceptance pending build.
