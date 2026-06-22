---
id: FR-CHAR-024
title: "Viseme/blendshape lip-sync applied after the mixer each frame"
module: CHAR
priority: COULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-022]
related_frs: [FR-CHAR-023]
source_pages:
  - "research doc §L (Lumi visual identity), §I (conversational Genie)"
---

## §1 Requirement (BCP-14 normative)

Lumi's mouth SHOULD move with speech when she speaks.

1. The model MUST expose mouth blendshapes (visemes); lip-sync MUST set their
   weights, driven either by audio amplitude or by a viseme stream.
2. Lip-sync MUST be applied after the AnimationMixer update each frame so it
   layers on top of the active clip rather than being overwritten.
3. Lip-sync MUST run only while Lumi is in the speaking state and MUST relax
   mouth weights to neutral when speech ends.
4. When motion or audio is not allowed, lip-sync MUST be skipped entirely.

## §2 Acceptance

- Mouth blendshapes move in time with speech while speaking.
- Lip-sync layers over the body clip without being clobbered by the mixer.
- On speech end or reduced motion, the mouth returns to neutral.

## §3 Evidence

Not yet implemented; acceptance pending build.
