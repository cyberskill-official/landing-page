# DEC: Ship a procedural Lumi placeholder; commission the real GLB separately

- Date: 2026-06-22
- Status: accepted
- Modules: CHAR, SCENE
- Deciders: CyberOS agent (operator informed via the scope question)

## Context

The research doc (§C) recommends a bespoke golden-genie GLB (Draco + KTX2,
Mixamo rig, ARKit visemes) as the hero mascot. That asset must be commissioned
or bought and optimised; it cannot be authored in this build session.

## Decision

Phase 3 ships a procedural golden-orb placeholder that already demonstrates the
two behaviours the real model needs: gaze-toward-pointer and a chat-state-driven
idle/think/speak animation bound to the Zustand store. The commissioned GLB is
tracked as `FR-CHAR-021` (deferred). The scene loader, capability gate, and
static poster fallback are production-shaped, so swapping the placeholder for the
GLB is a localised change.

## Consequences

- The 3D experience is demonstrable now without a finished art asset.
- `FR-CHAR-021` must close before launch marketing leans on the mascot visual.
- The placeholder is clearly labelled as such in code and the FR.

## Related

[[FR-CHAR-020-lumi-placeholder]] [[FR-CHAR-021-commission-glb]] [[FR-SCENE-001-canvas-scaffold]]
