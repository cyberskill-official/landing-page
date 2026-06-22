---
id: FR-SCENE-007
title: "Map each section's normalized 0..1 progress to camera, model state, and lighting"
module: SCENE
priority: SHOULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SCENE-002, FR-SCENE-003]
related_frs: [FR-SCENE-005, FR-SCENE-006]
source_pages:
  - "research doc §J (3D scene scaffold), §K (scrollytelling beats)"
---

## §1 Requirement (BCP-14 normative)

One map MUST turn section progress into scene state.

1. Each narrative section MUST expose a normalized 0..1 progress value derived
   from the shared scroll loop in FR-SCENE-002.
2. A single progress map MUST translate those values into camera moves, model
   state, and lighting, so all scene consumers read one source of truth.
3. The map MUST be declarative data (section to targets), not logic scattered
   across components, and MUST clamp inputs to the 0..1 range.
4. When motion is not allowed the map MUST resolve to static end-state values
   so the scene still composes correctly without animation.

## §2 Acceptance

- Each section reports a clamped 0..1 progress as the user scrolls.
- Camera, model, and lighting all read from the one progress map.
- With reduced motion, the map yields stable static values.

## §3 Evidence

Not yet implemented; acceptance pending build.
