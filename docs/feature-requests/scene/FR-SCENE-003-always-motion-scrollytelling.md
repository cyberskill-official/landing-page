---
id: FR-SCENE-003
title: "Always-on motion and scroll-tied Lumi choreography"
module: SCENE
priority: SHOULD
status: shipped
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-SCENE-001, FR-SCENE-002]
blocks: []
related_frs: [FR-A11Y-001, FR-SCENE-001]
source_decisions:
  - .cyberos-memory/decisions/2026-06-22-always-motion-override.md
source_pages:
  - "research doc §J (scroll storytelling), §B (LCP/perf), §H (device capability)"
new_files:
  - lib/scroll/progress.ts
modified_files:
  - components/canvas/CanvasMount.tsx
  - components/scroll/ScrollStoryProvider.tsx
  - components/scroll/ScrollState.tsx
  - components/canvas/LumiPlaceholder.tsx
  - components/canvas/GenieScene.tsx
removed_files:
  - components/a11y/MotionToggle.tsx
---

## §1 Requirement (BCP-14 normative)

On capable desktops the story MUST move; the device-capability gate MUST still
protect weak devices. This overrides the reduced-motion gate from FR-A11Y-001
and FR-SCENE-002 per the decision record above.

1. The reduced-motion gate MUST be removed so the 3D scene and Lenis smooth
   scroll always run on capable desktops; the per-`<html>` motion toggle is
   retired.
2. Hero-scoped scroll progress MUST be published (0 at the top, 1 after one
   viewport) via a module-level store that the render loop reads directly,
   without triggering React re-renders.
3. The orb MUST rotate, drift toward the camera, and brighten as progress rises.
4. The device-capability gate MUST stay: mobile and low-end devices still get
   the static poster instead of the live scene.

## §2 Acceptance

- On a capable desktop, the scene and smooth scroll run with no motion toggle.
- Scrolling the hero animates the orb (rotate, approach, brighten) tied to
  progress, and the progress store updates without React re-renders.
- A mobile or low-end profile renders the static poster, not the canvas.

## §3 Evidence

Static: `lib/scroll/progress.ts` is a module-level store read in the render loop;
`CanvasMount`/`ScrollStoryProvider`/`ScrollState` drop the reduced-motion gate
and keep the capability gate; `LumiPlaceholder`/`GenieScene` map progress to
rotation, drift, brightness, plus drei `Float` drift and golden `Sparkles`;
`components/a11y/MotionToggle.tsx` removed. Deferred: scroll feel and frame rate
on the operator machine.
