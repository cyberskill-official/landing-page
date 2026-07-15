---
id: TASK-CHAR-022
title: "Integrate the commissioned GLB via gltfjsx, replacing LumiPlaceholder behind the CanvasMount gate"
module: CHAR
priority: MUST
status: on_hold
class: product
verify: T
phase: P2
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [TASK-CHAR-021, TASK-SCENE-001]
related_frs: [TASK-CHAR-020, TASK-CHAR-023]
source_pages:
  - "research doc §L (Lumi visual identity), §J (3D scene scaffold)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The real Lumi GLB MUST replace the placeholder without changing the gate.

1. The commissioned GLB (TASK-CHAR-021) MUST be integrated through a gltfjsx-
   generated typed component, not loaded ad hoc.
2. The new component MUST replace `LumiPlaceholder` (TASK-CHAR-020) at the same
   mount point, behind the existing CanvasMount gate, with no API change for
   callers.
3. The GLB MUST be served from the app's own static assets and MUST be draco or
   meshopt compressed to keep transfer size small.
4. If the GLB fails to load, the scene MUST fall back to the existing placeholder
   or poster and MUST NOT throw.

## §2 Acceptance

- On a gated desktop, the real Lumi model renders in place of the placeholder.
- The mount point and gate behaviour are unchanged for callers.
- A forced GLB load failure falls back without breaking the page.

## §3 Evidence

Drop-in path ready (2026-06-24, branch `auto/glb-perf-a11y`). Status stays
`planned` until the commissioned model exists and renders, since the first
acceptance bullet ("the real Lumi model renders") cannot be verified without it.
Stephen is producing the model via Meshy.

- Done - same mount point, gate unchanged (criterion 2): `GenieScene` renders
  `GltfLumi` in place of `LumiPlaceholder` behind the existing CanvasMount gate,
  with no caller API change. Activated by setting `NEXT_PUBLIC_LUMI_GLB`.
- Done - served from app static assets (criterion 3): the model is read from
  `/models/lumi.glb` under `public/`; the export checklist requires Draco or
  meshopt compression. See `docs/3d/lumi-glb-integration.md`.
- Done - safe fallback (criterion 4): `GlbBoundary` + Suspense fall back to the
  procedural Lumi on a failed/again load without throwing (shared with
  TASK-SCENE-010).
- Remaining - the actual model (criterion 1 + first acceptance bullet). The
  loader uses drei `useGLTF` with a typed `{ url }` prop and `scene.clone`; once
  the GLB is dropped in, swap to a gltfjsx-generated typed component if per-node
  control is wanted. Build-verified with `NEXT_PUBLIC_LUMI_GLB` set (compiles,
  26/26 pages prerender) so the wiring is sound ahead of the model.
