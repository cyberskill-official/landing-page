---
id: FR-CHAR-022
title: "Integrate the commissioned GLB via gltfjsx, replacing LumiPlaceholder behind the CanvasMount gate"
module: CHAR
priority: MUST
status: planned
verify: T
phase: P2
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-021, FR-SCENE-001]
related_frs: [FR-CHAR-020, FR-CHAR-023]
source_pages:
  - "research doc §L (Lumi visual identity), §J (3D scene scaffold)"
---

## §1 Requirement (BCP-14 normative)

The real Lumi GLB MUST replace the placeholder without changing the gate.

1. The commissioned GLB (FR-CHAR-021) MUST be integrated through a gltfjsx-
   generated typed component, not loaded ad hoc.
2. The new component MUST replace `LumiPlaceholder` (FR-CHAR-020) at the same
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

Not yet implemented; acceptance pending build.
