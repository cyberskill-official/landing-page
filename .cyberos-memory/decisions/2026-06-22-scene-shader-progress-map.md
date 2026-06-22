# DEC: Cinematic Lumi - glow shader (SCENE-006) + declarative progress map (SCENE-007)

- Date: 2026-06-22
- Status: accepted
- Modules: SCENE
- Deciders: Stephen Cheng (operator: assets, "make my landing exciting & creative"), agent

## Context

Stephen asked for code-generated assets to make the landing more exciting, and
picked all of: richer 3D Lumi + glow shader, cinematic scroll, AI imagery, icon
set. This is the first asset increment: the scene centerpiece.

## Decision

- FR-SCENE-006 (shipped): `LumiPlaceholder` is now a richer procedural Lumi - a
  lit gold core, an inner nucleus, three orbiting energy wisps, and a custom
  `THREE.ShaderMaterial` fresnel aura (additive) with a `uTime` shimmer, a
  `uReveal` dissolve-in on appearance, and `uProgress`/`uPulse` uniforms driven by
  scene progress and chat state. The lit core is the plain-emissive fallback; the
  StaticPoster covers the non-WebGL path.
- FR-SCENE-007 (shipped): `lib/scene/progressMap.ts` is the single declarative
  map (keyframe stops -> camera/model/light targets) with a clamped
  `resolveSceneState(progress)`. The new `CameraRig` (cinematic dolly + push-in)
  and Lumi's choreography and lighting all read from it - no scattered per-frame
  math. `staticSceneState()` serves the reduced/non-WebGL path.

## Consequences

- BACKLOG totals: 41 shipped / 1 hold / 51 planned. SCENE shipped 5.
- Verified: tsc clean, vitest 36/36 (4 new map tests), lint clean, next build
  rc=0; the dev server runs the scene with no WebGL/shader console errors.
- Verification gap to close: the dev screenshot tool waits for document_idle,
  which the always-animating canvas never reaches, so I could not capture a
  visual frame. The build proves type/compile health and the console is clean,
  but pixels are confirmed on the deploy. If the aura looks off on prod, it is a
  CSS/uniform tweak, not a structural risk (the lit core renders regardless).
- FR-SCENE-004 (pinned DOM sections) stays planned; FR-SCENE-005 (authored camera
  via Theatre.js) stays planned - the CameraRig covers the camera-move intent
  without adding a dependency.

## Related

[[FR-SCENE-006-glow-shader]] [[FR-SCENE-007-scene-progress-map]] [[FR-CHAR-021]] [[2026-06-22-always-motion-override]]
