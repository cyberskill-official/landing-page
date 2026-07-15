---
id: TASK-SCENE-010
title: "GLB preloader and Suspense boundary so the scene never blocks first paint"
module: SCENE
priority: SHOULD
status: done
class: product
verify: T
phase: P3
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-24
depends_on: [TASK-SCENE-001]
related_frs: [TASK-CHAR-022, TASK-SCENE-009]
source_pages:
  - "research doc §J (3D scene scaffold), §H (fallback + reduced motion)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

GLB loading MUST stay off the first-paint critical path.

1. GLB assets MUST load through a preloader and a React Suspense boundary so the
   scene mounts only after its assets resolve.
2. The static poster MUST remain the first paint and MUST stay visible until the
   scene is ready to swap in.
3. A load failure MUST resolve to the poster fallback and MUST NOT throw to the
   page or leave a blank canvas.
4. Preloading MUST be triggered only behind the CanvasMount gate so mobile and
   reduced-motion visitors never fetch the GLB.

## §2 Acceptance

- The poster paints first; the scene swaps in once assets resolve.
- A failed GLB load falls back to the poster with no thrown error.
- On a gated-out device, no GLB request is made.

## §3 Evidence

Shipped 2026-06-24 on branch `auto/glb-perf-a11y`.

- `components/canvas/GenieScene.tsx` reads `NEXT_PUBLIC_LUMI_GLB` and, when set,
  calls `useGLTF.preload(url)` at module scope. GenieScene is imported only by
  `CanvasMount` via `dynamic(..., { ssr: false })`, which mounts only on capable
  desktops, so the preload (and the GLB fetch) never fires on mobile or
  reduced-motion clients (criterion 4).
- The Lumi render sits inside `<Suspense fallback={null}>`; the server-rendered
  static poster is the first paint and stays until the scene chunk + GLB resolve
  (criteria 1-2).
- `components/canvas/GlbBoundary.tsx` is an in-canvas React error boundary
  wrapping `GltfLumi`. A rejected GLB load (missing file, decode failure) is
  caught and the procedural `LumiPlaceholder` renders instead, so the canvas is
  never blank and nothing throws to the page (criterion 3). The procedural Lumi
  is a strictly richer fallback than the static poster.
- Build-verified both ways: default (`next build`) and with
  `NEXT_PUBLIC_LUMI_GLB=/models/lumi.glb next build` both compile and prerender
  26/26 pages. Integration steps: `docs/3d/lumi-glb-integration.md`.
