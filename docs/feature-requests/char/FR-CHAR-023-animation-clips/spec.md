---
id: FR-CHAR-023
title: "Named animation-clip state machine cross-faded via AnimationMixer, bound to the genie store"
module: CHAR
priority: SHOULD
status: on_hold
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-022, FR-CHAR-012]
related_frs: [FR-CHAR-024]
source_pages:
  - "research doc §L (Lumi visual identity), §I (conversational Genie)"
routed_back_count: 0
awh: N/A
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

Partial (status stays planned). The placeholder Lumi now reacts to the genie
store as a procedural pose machine: it leans toward the viewer and brightens when
the chat opens, plays a dissolve-and-reform shimmer on open/close transitions,
and varies energy by `status` (idle / thinking / speaking) - all eased so states
cross-fade rather than cut, with idle the resting state, and the StaticPoster
holding a single static frame on the reduced/non-WebGL path. This satisfies the
intent of clauses 2-4 procedurally.

What still blocks a full ship: clause 1 requires *named animation clips played
through a Three.js `AnimationMixer`*, which depends on the rigged GLB
(FR-CHAR-022, in turn the on-hold FR-CHAR-021). Until the GLB lands there are no
named clips to mix, so this stays planned; the procedural reactivity is the
down-payment and the store wiring is already in place to drive real clips later.
