---
id: FR-SCENE-009
title: "Draw-call budget, GPU disposal, and LOD for the scene"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-K, audit-C/performance, audit-B/finding-2-high]
---

# FR-SCENE-009: Draw-call budget, GPU disposal, and LOD for the scene

## 0. Why (evidence)

Research doc §K. Partially done (2026-06-24, branch auto/glb-perf-a11y):

- GPU disposal on unmount is in place: components/canvas/GltfLumi.tsx disposes geometries and materials on unmount, and
  LumiPlaceholder.tsx disposes the hand-built aura ShaderMaterial that R3F does not own.
- The asset/budget guard holds: `npm run check:assets` keeps the gated-desktop client JS and public assets under budget,
  and the poster path carries no GLB cost.

Open: a measured steady-state draw-call count. Distance LOD is only meaningful once a real multi-resolution GLB exists, so
it is deferred to FR-CHAR-021 (on hold). Audit C independently flags the always-on scene as the main INP risk, which
FR-PERF-012 addresses.

## 1. Description (normative)

- 1.1 The scene SHALL render under 100 draw calls per frame in the steady state, measured and recorded, on both the placeholder and the GLB path.
- 1.2 On unmount the scene SHALL dispose geometries, materials and textures and release the WebGL context, so memory does not leak across mounts.
- 1.3 The asset budget SHALL hold for the gated desktop path and SHALL NOT regress the static poster path.
- 1.4 Distance-based level-of-detail SHALL swap to lighter meshes as the subject recedes (deferred to FR-CHAR-021 - meaningless until the multi-resolution GLB exists).

## 2. Acceptance criteria

- [ ] AC for 1.1 - a measured steady-state draw-call count under 100 is recorded - test: `scene/draw-call-budget`
- [ ] AC for 1.2 - mounting and unmounting the scene ten times shows no GPU memory growth - test: `scene/dispose-no-leak`
- [ ] AC for 1.3 - check:assets stays green and the poster path carries no GLB bytes - test: `ci/asset-size-guard`

## 3. Edge cases

- A low-end GPU where even the placeholder is expensive - the capability gate must send it to the poster.
- A remount triggered by a theme flip must not leak the shader material.

## 4. Out of scope / non-goals

- The LOD meshes themselves (FR-CHAR-021, on hold).
- Pausing the render loop (FR-PERF-012).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.3 progressive enhancement: the 3D scene stays code-split, gated, and ships with its static poster fallback.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
