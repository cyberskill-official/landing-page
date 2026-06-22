---
id: FR-CHAR-023
title: "Named animation-clip state machine cross-faded via AnimationMixer, bound to the genie store"
module: CHAR
priority: SHOULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-022, FR-CHAR-012]
related_frs: [FR-CHAR-024]
source_pages:
  - "research doc §L (Lumi visual identity), §I (conversational Genie)"
---

## §1 Requirement (BCP-14 normative)

Lumi's motion MUST be a small, named state machine.

1. The model MUST expose named clips for idle, greeting, thinking, speaking, and
   point, played through a Three.js `AnimationMixer`.
2. Transitions between clips MUST cross-fade rather than cut, and idle MUST be
   the resting state.
3. The active clip MUST be selected from the genie store (FR-CHAR-012) so chat
   state drives the animation: thinking while awaiting a reply, speaking while
   streaming, idle when done.
4. When motion is not allowed the model MUST hold a single static pose and MUST
   NOT advance the mixer.

## §2 Acceptance

- Each named clip plays and cross-fades into the next without a hard cut.
- Chat state changes drive the matching clip via the store.
- With reduced motion, Lumi holds one static pose.

## §3 Evidence

Not yet implemented; acceptance pending build.
