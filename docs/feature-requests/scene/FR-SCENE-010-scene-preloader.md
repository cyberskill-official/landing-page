---
id: FR-SCENE-010
title: "GLB preloader and Suspense boundary so the scene never blocks first paint"
module: SCENE
priority: SHOULD
status: planned
verify: T
phase: P3
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SCENE-001]
related_frs: [FR-CHAR-022, FR-SCENE-009]
source_pages:
  - "research doc §J (3D scene scaffold), §H (fallback + reduced motion)"
---

## §1 Requirement (BCP-14 normative)

GLB loading MUST stay off the first-paint critical path.

1. GLB assets MUST load through a preloader and a React Suspense boundary so the
   scene mounts only after its assets resolve.
2. The static poster MUST remain the first paint and MUST stay visible until the
   scene is ready to swap in.
3. A load failure MUST resolve to the poster fallback and MUST NOT throw to the
   page or leave a blank canvas.
4. Preloading MUST be triggered only behind the CanvasMount gate so mobile and
   reduced-motion visitors never fetch the GLB.

## §2 Acceptance

- The poster paints first; the scene swaps in once assets resolve.
- A failed GLB load falls back to the poster with no thrown error.
- On a gated-out device, no GLB request is made.

## §3 Evidence

Not yet implemented; acceptance pending build.
