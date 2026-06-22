---
id: FR-SCENE-005
title: "Authored camera keyframe sequence indexed by section progress"
module: SCENE
priority: COULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SCENE-007]
related_frs: [FR-SCENE-002, FR-SCENE-006]
source_pages:
  - "research doc §J (3D scene scaffold), §K (scrollytelling beats)"
---

## §1 Requirement (BCP-14 normative)

The camera SHOULD follow an authored shot list, one shot per scene.

1. Camera motion MUST come from an authored keyframe sequence (Theatre.js or a
   baked animation clip), not from ad hoc per-frame math.
2. There MUST be one named shot per narrative section, indexed by that section's
   normalized progress from FR-SCENE-007.
3. Camera updates MUST be driven by the scene progress map each frame, and MUST
   interpolate smoothly between adjacent shots.
4. When motion is not allowed the camera MUST hold a single authored default
   pose and MUST NOT animate.

## §2 Acceptance

- Each section maps to a distinct, named camera shot.
- Scrolling between sections moves the camera smoothly along the keyframes.
- With reduced motion, the camera stays at the default pose.

## §3 Evidence

Not yet implemented; acceptance pending build.
