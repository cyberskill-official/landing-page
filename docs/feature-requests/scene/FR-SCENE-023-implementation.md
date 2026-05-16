---
id: FR-SCENE-023
title: "Drei `<Detailed>` LOD swap — Lumi production-mesh ↔ greybox at 12m distance threshold"
module: SCENE
priority: SHOULD
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: R3F Architect
created: 2026-05-16
related_frs: [FR-SCENE-017, FR-CHAR-004, FR-CHAR-006, FR-SCENE-019, FR-PERF-002]
depends_on: [FR-SCENE-017, FR-CHAR-004, FR-CHAR-006]
blocks: [FR-PERF-002]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.3 — "LOD swap via Drei <Detailed> at distance > 12m"
  - docs/01-master-plan-v2.md §6.3 perf — distance-LOD frame-budget savings
  - FR-CHAR-004 §2 — greybox doubles as LOD-1 fallback

language: typescript + react 19 + r3f 9 + drei
service: apps/web/components/lumi/
new_files:
  - apps/web/components/lumi/LumiLod.tsx
  - apps/web/components/lumi/__tests__/lumi-lod.unit.test.ts

effort_hours: 4
risk_if_skipped: "Rendering 28k-tri production Lumi at corner-avatar size (~48 px) wastes GPU. FR-PERF-002 budget gate fails. Master plan §5.3 specifies LOD swap; without it, the secondary-ROI argument for FR-CHAR-004 greybox (LOD-1 fallback) collapses."
---

## §1 — Description (BCP-14 normative)

1. **MUST** wrap Lumi rendering in Drei `<Detailed>` component with 2 LOD levels:
   - LOD-0: `lumi.glb` (production mesh, ~28k tri, FR-CHAR-006).
   - LOD-1: `lumi-greybox.glb` (greybox mesh, ~8k tri, FR-CHAR-004).

2. **MUST** trigger LOD swap when camera distance to Lumi > 12m. Below 12m: production. Above 12m: greybox.

3. **MUST** include hysteresis to prevent visible swap-flicker:
   - Swap to greybox at distance > 12.5m (slight headroom).
   - Swap back to production at distance < 11.5m.
   - 1.0m hysteresis band.

4. **MUST NOT** swap during active animations on screen. If Lumi is playing `wave_goodbye` (visible to user), keep LOD-0 even if distance exceeds threshold. Resume LOD checks once clip completes.

5. **MUST** preserve animation continuity across swaps. Both LOD-0 and LOD-1 share the same FR-CHAR-009 armature (greybox inherits topology). useAnimations actions remain valid across LODs.

6. **MUST NOT** swap for the footer corner avatar (always at apparent distance "near" since rendered at viewport-relative 48×48 px). Corner avatar uses LOD-1 explicitly regardless of world distance.

7. **MUST** ship Vitest unit tests for LOD threshold + hysteresis behavior.

8. **MUST** ship Playwright integration tests verifying Scene 5 globe shot uses LOD-1, Scene 0 hero uses LOD-0.

9. **SHOULD** include `?debug=lod` overlay showing current LOD + distance.

## §2 — Why this design

**Why 12m threshold?** Master plan §5.3 + perf research: at distance > 12m camera distance, the production mesh's detailed face / hood geometry resolves to < 3 screen pixels of detail. The greybox at 8k tri is visually indistinguishable but renders 4× faster. 12m is the calibrated knee.

**Why hysteresis?** Without hysteresis, camera that drifts around 12m exact threshold causes rapid LOD swaps (flicker). 1.0m band prevents this. Hysteresis is a Drei `<Detailed>` standard pattern.

**Why never swap mid-animation?** Animation clips are pose-mathematically identical across LOD-0/LOD-1 (same armature), but the visible mesh detail changes. Mid-clip swap would be perceptible as a "pop" — the swap looks better when camera is moving (visually masked).

**Why corner avatar is LOD-1?** Corner avatar at 48×48 px is the most extreme low-detail case. Rendering production mesh is pure waste. Explicit LOD-1 override avoids the runtime distance calculation entirely.

## §3 — Public surface

```tsx
// LumiLod.tsx
import { useGLTF, Detailed } from "@react-three/drei";

export function LumiLod({ forceLow = false, ...props }: { forceLow?: boolean; [key: string]: any }) {
  const productionMesh = useGLTF("/lumi.glb");
  const greyboxMesh = useGLTF("/lumi-greybox.glb");

  if (forceLow) {
    return <primitive object={greyboxMesh.scene} {...props} />;
  }

  return (
    <Detailed distances={[0, 12]} {...props}>
      <primitive object={productionMesh.scene} />
      <primitive object={greyboxMesh.scene} />
    </Detailed>
  );
}

// Usage:
// Scene 5 / corner avatar / Scene 6: <LumiLod forceLow /> for corner-avatar case
// Scenes 0-5 main canvas: <LumiLod /> for distance-based auto
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | LOD swap at distance 12m | Vitest with mocked camera distance |
| 2 | Hysteresis prevents flicker around 12m | Test sweep through threshold; expect single swap |
| 3 | Production mesh < 12m | R3F dev panel mesh inspection |
| 4 | Greybox mesh > 12m | Same |
| 5 | No swap mid-animation | Smoke test during wave_goodbye while moving camera |
| 6 | Corner avatar uses LOD-1 explicitly | FR-SCENE-019 corner avatar uses `forceLow` prop |
| 7 | Animation continuity across swap | Visual test scrolling Scene 0 → Scene 5 |
| 8 | `?debug=lod` overlay renders | Playwright |
| 9 | greybox.glb preloaded via FR-WEB-006 chain | Network check on Scene 5 entry |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
// LOD distance threshold test via mocked Three camera
```

## §6 — Dependencies

**Concept:** FR-SCENE-017 (Scene 5 globe shot is the canonical far-distance), FR-CHAR-004 (greybox mesh provider), FR-CHAR-006 (production mesh).

**Operational:** Drei `<Detailed>`, FR-WEB-006 (preload chain — greybox preloads with main Lumi).

**Downstream:** FR-PERF-002 LOD perf gate verifies LOD swap actually fires.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Visible swap flicker | AC#2 + visual smoke | Increase hysteresis to 2.0m if needed |
| Swap mid-animation pop | AC#5 | Defer swap to clip end via useAnimations.finished |
| Greybox at scale appears wrong (proportions) | Visual | Verify FR-CHAR-004 inherits proportions from FR-CHAR-001 exactly |
| Animation drift between LODs (different armature) | AC#7 | FR-CHAR-009 rig MUST work on both meshes; verify topology matches |
| Corner avatar uses production by accident | AC#6 | FR-SCENE-019 passes `forceLow` prop |
| greybox.glb fails to preload | AC#9 + network check | Verify FR-WEB-006 chain includes greybox |
| `<Detailed>` distance calc wrong on non-standard camera | Test alt camera setups | Use camera.position as reference |
| LOD swap with Scene 5 globe (far) shows wrong mesh | Scene 5 distance > 12m at globe-cam | Verify camera-distance math at Scene 5 specifically |
| Hot-reload breaks `<Detailed>` (HMR issue) | Manual test | Wrap in useEffect cleanup; reset on HMR |

## §8 — Deliverable preview

- Scene 0 / 1 / 2 / 6 / footer: production mesh (camera ~5m).
- Scene 5: greybox at globe-far shot (camera ~6.5m + scene depth → effective > 12m).
- Corner avatar: greybox forced via `forceLow`.

## §9 — Notes

**On LOD-2 future tier:** Could add a third LOD (sprite billboard) for distance > 30m. Out of slice 1 scope; master plan §5.3 specifies 2 levels.

*End of FR-SCENE-023.*
