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

Not yet implemented; acceptance pending build.
