---
id: FR-SCENE-006
title: "Custom GLSL shader for Lumi's golden glow, dissolve, and particle magic"
module: SCENE
priority: COULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SCENE-001]
related_frs: [FR-CHAR-022, FR-SCENE-005]
source_pages:
  - "research doc §J (3D scene scaffold), §L (Lumi visual identity)"
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

Not yet implemented; acceptance pending build.
