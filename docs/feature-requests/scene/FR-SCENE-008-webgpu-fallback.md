---
id: FR-SCENE-008
title: "WebGPURenderer with automatic WebGL fallback"
module: SCENE
priority: COULD
status: on_hold
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SCENE-001]
related_frs: [FR-SCENE-009]
source_pages:
  - "research doc §J (3D scene scaffold), §M (renderer + performance)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The scene SHOULD prefer WebGPU but MUST never depend on it.

1. The renderer MUST attempt `WebGPURenderer` first when the browser reports
   WebGPU support.
2. On any WebGPU init failure or absence, the renderer MUST fall back to the
   WebGL renderer automatically, with no user-visible error.
3. The chosen backend MUST NOT change scene authoring: the same scene graph and
   materials MUST render on either path.
4. Backend selection MUST happen behind the existing CanvasMount gate so the
   poster fallback still owns the failure-closed path.

## §2 Acceptance

- On a WebGPU browser, the scene renders through WebGPURenderer.
- On a WebGL-only browser, it renders through WebGL with no error.
- A forced WebGPU init failure silently falls back to WebGL.

## §3 Evidence

Not yet implemented; acceptance pending build.
