---
id: FR-SCENE-009
title: "LOD by distance, under 100 draw calls per frame, dispose GPU resources on unmount"
module: SCENE
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SCENE-001]
related_frs: [FR-SCENE-008, FR-SCENE-010]
source_pages:
  - "research doc §J (3D scene scaffold), §M (renderer + performance)"
---

## §1 Requirement (BCP-14 normative)

The scene MUST stay within a fixed GPU budget.

1. Models MUST use level-of-detail by camera distance, swapping to lighter
   meshes as the subject recedes.
2. The scene MUST render under 100 draw calls per frame in the steady state,
   measured on the operator machine.
3. On unmount the scene MUST dispose geometries, materials, and textures and
   release the WebGL or WebGPU context so memory does not leak across mounts.
4. Asset budgets MUST hold for the gated desktop path and MUST NOT regress the
   static poster path.

## §2 Acceptance

- LOD meshes swap with distance without visible popping at normal scroll speed.
- Steady-state draw calls stay under 100 per frame.
- Unmounting the scene frees GPU memory with no leak across remounts.

## §3 Evidence

Partial (2026-06-24, branch `auto/glb-perf-a11y`). Status stays `planned` until
LOD lands and draw calls are measured on the operator machine.

- Done - GPU disposal on unmount (criterion 3): `components/canvas/GltfLumi.tsx`
  traverses the cloned model and disposes geometries + materials on unmount;
  `components/canvas/LumiPlaceholder.tsx` disposes the hand-built aura
  `ShaderMaterial` (the one R3F does not own) when the theme flips or the scene
  unmounts. R3F disposes the built-in geometries/materials it created.
- Holds - asset/budget guard (criterion 4): `npm run check:assets` keeps the
  gated-desktop client JS and public assets under budget; the poster path
  carries no GLB cost.
- Remaining - distance LOD (criterion 1) and a measured steady-state draw-call
  count under 100 (criterion 2). The procedural scene is well under budget by
  inspection (< ~20 draw calls), but LOD is only meaningful once the real
  multi-resolution GLB exists, so it is deferred with the model.
