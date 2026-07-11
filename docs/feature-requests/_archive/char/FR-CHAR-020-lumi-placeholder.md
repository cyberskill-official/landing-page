---
id: FR-CHAR-020
title: "Procedural Lumi placeholder (gaze + chat-state animation) pending GLB"
module: CHAR
priority: SHOULD
status: done
class: product
verify: T
phase: P3
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-SCENE-001, FR-CHAR-012]
blocks: []
source_pages:
  - "research doc §J (3D Genie), §I (chat-state reactivity)"
new_files:
  - components/canvas/LumiPlaceholder.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

A procedural stand-in MUST hold Lumi's place until the commissioned GLB lands.

1. A procedural golden orb MUST stand in for the commissioned GLB and MUST be
   clearly labelled as a placeholder, not the final character.
2. The orb MUST gaze toward the pointer, lerping toward the normalised pointer
   position each frame rather than snapping.
3. The orb MUST react to chat state from the Zustand store (FR-CHAR-012) with
   distinct idle, thinking, and speaking behaviours.
4. The placeholder MUST mount only inside the gated scene (FR-SCENE-001) and MUST
   NOT appear when the scene is unavailable.

## §2 Acceptance

- The orb tracks the pointer smoothly and recenters when the pointer leaves.
- Switching chat state visibly changes idle/think/speak motion.
- No placeholder renders on mobile / reduced-motion (scene gate off).

## §3 Evidence

Static: `LumiPlaceholder` lerps to the normalised pointer per frame and reads
chat state from the store; labelled as a placeholder. Deferred: motion feel and
state transitions observed on the operator machine.
