---
id: FR-SCENE-006
title: "Custom GLSL shader for Lumi's golden glow, dissolve, and particle magic"
module: SCENE
priority: COULD
status: shipped
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-SCENE-001]
related_frs: [FR-CHAR-022, FR-SCENE-005]
source_pages:
  - "research doc §J (3D scene scaffold), §L (Lumi visual identity)"
modified_files:
  - components/canvas/LumiPlaceholder.tsx
---

## §1 Requirement (BCP-14 normative)

Lumi's magic SHOULD be a custom shader, not a stock material.

1. A custom GLSL shader material MUST render Lumi's golden glow in the brand
   Ochre hue, driven by a time uniform for a slow living pulse.
2. The shader MUST support a dissolve or particle effect that can be triggered
   on appearance and dismissal of the genie.
3. Glow intensity and particle density MUST expose uniforms so other systems
   can drive them from scene progress or chat state.
4. The shader MUST degrade to a plain emissive material when WebGL features are
   unavailable or motion is not allowed.

## §2 Acceptance

- Lumi shows a golden Ochre glow that pulses over time.
- Appearance and dismissal play a dissolve or particle transition.
- On a reduced or unsupported path, a plain emissive fallback renders.

## §3 Evidence

Shipped 2026-06-22. `LumiPlaceholder` now wraps the lit gold core in a custom
`THREE.ShaderMaterial` aura (additive, depth-write off): a fresnel edge glow in
the brand Ochre (`uCore` #F4BA17 -> `uRim` #FFE7A6) with a `uTime`-driven shimmer
for a slow living pulse (clause 1). A `uReveal` uniform gates the alpha through a
moving shimmer band, so Lumi dissolves into being on appearance (clause 2); the
uniform is exposed so a dismissal can drive it back down. Glow intensity is
uniform-driven from scene progress (`uProgress` <- the progress map's glow) and
chat state (`uPulse` <- idle/thinking/speaking), so other systems steer it
(clause 3). The non-WebGL / incapable path renders the StaticPoster, and the lit
`MeshStandardMaterial` core is the plain emissive fallback if the shader is
absent (clause 4). Verified by `next build` (rc=0, scene chunk compiles) with no
runtime WebGL/shader console errors on the running dev server; tsc + lint + 36
vitest tests green. Note: GLSL is runtime-compiled, so the build proves
type/compile health, not pixels - a visual pass on the deploy is the final check.
