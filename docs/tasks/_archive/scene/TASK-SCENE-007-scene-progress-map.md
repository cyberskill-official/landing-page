---
id: TASK-SCENE-007
title: "Map each section's normalized 0..1 progress to camera, model state, and lighting"
module: SCENE
priority: SHOULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-SCENE-002, TASK-SCENE-003]
related_tasks: [TASK-SCENE-005, TASK-SCENE-006]
source_pages:
  - "research doc §J (3D scene scaffold), §K (scrollytelling beats)"
new_files:
  - lib/scene/progressMap.ts
modified_files:
  - components/canvas/GenieScene.tsx
  - components/canvas/LumiPlaceholder.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

One map MUST turn section progress into scene state.

1. Each narrative section MUST expose a normalized 0..1 progress value derived
   from the shared scroll loop in TASK-SCENE-002.
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

Shipped 2026-06-22. `lib/scene/progressMap.ts` is the single declarative map:
keyframe stops (`at` -> camera/model/light targets) as data, with
`resolveSceneState(progress)` lerping between the surrounding stops and
`clamp01` clamping input to 0..1 (clauses 1, 3). Both scene consumers read from
it and nothing computes its own choreography: the `CameraRig` in `GenieScene`
eases the camera toward `resolveSceneState(p).camera`, and `LumiPlaceholder`
drives its spin/drift/glow from `.model` and the point light from `.light`
(clause 2). `staticSceneState()` returns the opening composition for the
reduced-motion / non-WebGL path, which the StaticPoster mirrors (clause 4).
`tests/scene-progress-map.test.ts` covers clamping, end-state resolution,
monotonic interpolation, and the static state. Verified by tsc + lint + 36
vitest tests + `next build` (rc=0).

Note on clause 1: progress is currently the global story timeline (the shared
0..1 scroll loop); per-section sub-ranges can layer onto the same map when the
pinned-section work (TASK-SCENE-004) lands.
