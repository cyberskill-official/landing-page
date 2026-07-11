---
id: FR-CHAR-021
title: "Commission optimised golden-genie GLB (Draco+KTX2, Mixamo rig, ARKit visemes)"
module: CHAR
priority: MUST
status: on_hold
class: product
verify: T
phase: P3
owner: human
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-020]
blocks: []
source_pages:
  - "research doc §J (3D Genie asset pipeline), §K (lip-sync fidelity)"
new_files: []
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The final Lumi MUST be a bespoke, optimised GLB that drops in behind the same
loader and gate as the placeholder.

1. A stylized golden-genie GLB MUST be commissioned and MUST be optimised with
   glTF-Transform: Draco or Meshopt geometry compression and KTX2 textures.
2. The asset SHOULD stay within budget: under 100 draw calls and roughly 3 MB or
   less, so it does not threaten the performance gate.
3. The model MUST carry a Mixamo-compatible rig and facial blendshapes (ARKit
   visemes) for animation and lip-sync.
4. It MUST swap in for the procedural placeholder behind the existing loader and
   capability gate, with no change to mounting rules.

## §2 Acceptance

- Deferred: acceptance is checked when the asset is delivered and integrated.
- On integration: draw calls and byte budget hold; rig and visemes drive
  animation; the scene gate is unchanged.

## §3 Evidence

Deferred: this requires an art asset and budget that do not yet exist, so there
is nothing to verify statically. This is the single HOLD recorded in the `.awh`
log; the placeholder (FR-CHAR-020) satisfies the slot until then.
