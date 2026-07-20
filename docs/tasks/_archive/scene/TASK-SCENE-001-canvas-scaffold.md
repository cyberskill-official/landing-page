---
id: TASK-SCENE-001
title: "Fixed full-viewport R3F canvas, lazy ssr:false, capability gate + static poster"
module: SCENE
priority: MUST
status: done
class: product
verify: T
phase: P3
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-A11Y-001]
blocks: [TASK-CHAR-020, TASK-SCENE-002]
source_pages:
  - "research doc §J (3D scene scaffold), §H (fallback + reduced motion)"
new_files:
  - components/canvas/CanvasMount.tsx
  - components/canvas/GenieScene.tsx
  - components/canvas/StaticPoster.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

There MUST be one fixed canvas that fails closed and never owns LCP.

1. The app MUST mount a single fixed, full-viewport R3F canvas so 3D assets load once and persist across scroll.
2. The scene MUST be a dynamic import with `ssr: false` that fails closed: any load or capability failure MUST leave the static poster in place.
3. The canvas MUST mount only when all hold: desktop, fine pointer, at least four logical cores, and motion allowed. Otherwise it MUST NOT mount.
4. A static CSS poster MUST be the SSR and initial paint, and the mobile / low- GPU / reduced-motion fallback.
5. The canvas MUST use an alpha (transparent) background so the SSR hero shows through, and MUST NOT become the LCP element.

## §2 Acceptance

- On mobile / reduced motion, only the static poster renders; no WebGL context.
- On a capable desktop, the canvas mounts over the still-present SSR hero.
- A forced scene-import failure leaves the poster and breaks nothing.

## §3 Evidence

Static: `CanvasMount` gates on pointer/cores/motion/desktop and dynamically imports `GenieScene` with `ssr:false`; `StaticPoster` is the fallback; canvas is alpha. Deferred: GPU behaviour and LCP confirmation on the operator machine.
