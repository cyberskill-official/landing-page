---
id: FR-PERF-002
title: "Lumi LOD-1 variant (~8k tri) — for distance > 12m + low-memory device fallback"
module: PERF
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: 3D Lead + Frontend
created: 2026-05-16
related_frs: [FR-CHAR-004, FR-CHAR-006, FR-SCENE-023, FR-WEB-009, FR-PERF-009]
depends_on: [FR-CHAR-006]
blocks: [FR-PERF-009]
language: blender python + bash + glb pipeline
service: assets-source/blender/ + assets-built/optimized/
new_files:
  - assets-source/blender/lumi-lod1.blend
  - assets-built/optimized/lumi-lod1.glb
  - tools/blender/scripts/export-lod1.py
  - apps/web/lib/lumi/use-lumi-lod.ts

source_pages:
  - docs/01-master-plan-v2.md §6.3 — device-tier LOD strategy
  - docs/01-master-plan-v2.md §5.5 — Drei <Detailed> LOD swap
  - FR-CHAR-004 — greybox spec serves as LOD-1 base
  - FR-SCENE-023 — distance threshold + hysteresis

effort_hours: 8
risk_if_skipped: "Without LOD-1, 28k-tri production Lumi renders at corner-avatar (~48px) — pure GPU waste. Mobile-low devices (3 GB RAM, integrated GPU) drop to 15 FPS in Scene 5 globe shot. FR-PERF-009 low-memory path needs LOD-1 mesh; master plan §5.3 explicitly mandates the LOD swap."
---

## §1 — Description (BCP-14 normative)

1. **MUST** export an 8k-tri LOD-1 variant of Lumi as `lumi-lod1.glb`, based on FR-CHAR-004 greybox topology. Production-mesh details (high-frequency normal map, sub-surface scattering, detailed hair geometry) removed.

2. **MUST** preserve the same FR-CHAR-009 armature (~27 bones) as production mesh. NLA clips (FR-CHAR-011) MUST animate identically across LOD-0 and LOD-1.

3. **MUST** be wired via Drei `<Detailed>` per FR-SCENE-023:
   - Distance ≤ 12m → LOD-0 (production)
   - Distance > 12m → LOD-1
   - Hysteresis band 11.5–12.5m to avoid swap-flicker.

4. **MUST** auto-activate when `navigator.deviceMemory < 4` regardless of distance — FR-PERF-009 low-memory path forces LOD-1.

5. **MUST** post-pipeline (FR-OPS-001 glTF-Transform) target size ≤ **400 KB** for the .glb (Meshopt-compressed + KTX2 textures at 1k resolution for LOD-1).

6. **MUST** preserve material slots (FR-CHAR-008 PBR material binding works on both LODs).

7. **MUST** ship a Blender Python script `tools/blender/scripts/export-lod1.py` that:
   - Opens `lumi.v01.blend`.
   - Applies Decimate modifier targeting 8000 tris.
   - Verifies armature + shape keys preserved.
   - Exports to `assets-built/source/lumi-lod1.glb` for FR-OPS-001 pipeline ingest.

8. **MUST** integrate with FR-WEB-006 preload chain — LOD-1 mesh is pre-fetched alongside LOD-0 on Scene 0 entry.

9. **MUST** be tested via Vitest unit tests:
   - LOD-1 glb file size ≤ 400 KB.
   - Vertex count ~ 8000 (acceptable range 7000-9000).
   - Armature matches LOD-0 (same bone names + count).

10. **MUST** be tested via Playwright integration test — Scene 5 globe shot (distance > 12m) confirms LOD-1 mesh is bound.

11. **MUST NOT** introduce visible quality drop in close-up views (LOD-0 still primary for Scenes 0-4).

12. **MUST** include a `forceLow` prop for explicit LOD-1 binding (e.g., FR-SCENE-019 corner avatar always renders LOD-1).

## §2 — Why this design

**Why 8k tri target?** Master plan §6.3 calibration: 8k tri visually identical at screen-projection ≤ 48 px or distance > 12m. 4× faster rasterization than 28k = mobile-low can hit 60 FPS.

**Why same armature?** Animation reuse. Different rig → every NLA clip needs re-targeting. Same armature = identical clip playback; only mesh changes.

**Why distance > 12m threshold?** Per FR-SCENE-023 master plan §5.3 calibration. At 12m camera distance, production mesh detail resolves to < 3 screen pixels — invisible improvement over greybox.

**Why ≤ 400 KB target?** 28k Lumi optimized = ~4 MB; LOD-1 at 8k should be ~14% = ~560 KB. Aggressive 400 KB via Meshopt + smaller texture variants.

**Why auto-LOD-1 on deviceMemory < 4?** Constrained devices can't render production mesh at 60 FPS regardless of distance. FR-PERF-009 forces LOD-1 globally for tier-low.

**Why Blender Python script?** Reproducibility. Manual Decimate per-export drifts. Script ensures every LOD-1 export is identical.

## §3 — Public surface

```python
# tools/blender/scripts/export-lod1.py
import bpy
import sys

def export_lod1(input_blend: str, output_glb: str):
    bpy.ops.wm.open_mainfile(filepath=input_blend)
    lumi_obj = bpy.data.objects.get("Lumi")
    if not lumi_obj:
        raise SystemExit("No 'Lumi' object found")
    dec = lumi_obj.modifiers.new(name="LOD1Decimate", type="DECIMATE")
    dec.decimate_type = "COLLAPSE"
    dec.ratio = 8000 / sum(len(p.vertices) - 2 for p in lumi_obj.data.polygons)
    bpy.context.view_layer.objects.active = lumi_obj
    bpy.ops.object.modifier_apply(modifier="LOD1Decimate")
    bpy.ops.export_scene.gltf(filepath=output_glb, export_format="GLB", export_animations=True)
```

```ts
// apps/web/lib/lumi/use-lumi-lod.ts
import { useSceneStore } from "@/lib/stores/scene-store";

export function useLumiLodVariant(distance: number, forceLow = false) {
  const lowMemoryMode = useSceneStore(s => s.lowMemoryMode);
  if (forceLow || lowMemoryMode) return "lod1";
  return distance > 12 ? "lod1" : "lod0";
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | lumi-lod1.glb exported | File present |
| 2 | LOD-1 .glb ≤ 400 KB post-pipeline | du -b |
| 3 | Vertex count 7000-9000 | gltf-transform inspect |
| 4 | Armature matches LOD-0 | gltf-transform inspect compare |
| 5 | NLA clips animate identically across LODs | Visual scrub |
| 6 | Distance > 12m triggers LOD-1 swap | Playwright Scene 5 |
| 7 | forceLow prop uses LOD-1 | FR-SCENE-019 inspect |
| 8 | deviceMemory < 4 → auto LOD-1 | Mock + assert |
| 9 | Material slots preserved | FR-CHAR-008 binding |
| 10 | Vitest unit tests pass | pnpm vitest |
| 11 | Blender Python reproducible (same blend → same glb sha256) | sha256 compare |
| 12 | FR-PERF-009 low-mem path uses LOD-1 | Integration test |

## §5 — Verification

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLumiLodVariant } from "../use-lumi-lod";
import { useSceneStore } from "@/lib/stores/scene-store";

describe("useLumiLodVariant", () => {
  beforeEach(() => useSceneStore.setState({ lowMemoryMode: false }));
  it("returns lod0 at close distance", () => {
    const { result } = renderHook(() => useLumiLodVariant(5));
    expect(result.current).toBe("lod0");
  });
  it("returns lod1 at distance > 12m", () => {
    const { result } = renderHook(() => useLumiLodVariant(15));
    expect(result.current).toBe("lod1");
  });
  it("returns lod1 when forceLow", () => {
    const { result } = renderHook(() => useLumiLodVariant(5, true));
    expect(result.current).toBe("lod1");
  });
  it("returns lod1 when lowMemoryMode", () => {
    useSceneStore.setState({ lowMemoryMode: true });
    const { result } = renderHook(() => useLumiLodVariant(5));
    expect(result.current).toBe("lod1");
  });
});
```

## §6 — Dependencies

**Concept:** FR-CHAR-004 (greybox topology source), FR-CHAR-006 (production mesh — LOD-0), FR-SCENE-023 (Drei <Detailed> consumer), FR-WEB-009 (lowMemoryMode signal).

**Operational:** Blender 4.x with Python API, FR-OPS-001 pipeline, Meshopt + KTX2 toolchain.

**Downstream:** FR-PERF-009 (mobile low-memory path), FR-SCENE-019 (corner avatar uses forceLow).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| LOD-1 glb > 400 KB | AC#2 | 1k textures vs 2k; aggressive Meshopt |
| Visible pop on swap | AC#6 + visual | Increase FR-SCENE-023 hysteresis to 2.0m |
| Armature mismatch | AC#4 | Decimate preserves vertex groups; export with `export_apply=False` |
| Animation glitch on LOD-1 | AC#5 | NLA strips reference same bones |
| LOD-1 GLB doesn't preload | AC#12 | Add to FR-WEB-006 chain |
| Decimate destroys silhouette | Visual | Lower target tris floor; manual retopo if needed |
| Material slot count differs | AC#9 | No material removal during Decimate |
| Texture map mismatch (different UVs) | Visual | Same UV unwrap; same texture binding |
| Blender Python version incompat | Build fail | Pin Blender 4.x in CI |
| Non-deterministic Decimate output | AC#11 | Pin ratio; document Blender version |
| Forcing LOD-1 doesn't kick in (cache) | AC#7 + AC#8 | useEffect on lowMemoryMode → rebind |
| deviceMemory undefined on Safari | FR-WEB-009 fallback | Default to LOD-0; Safari ≥ M1 runs OK |

## §8 — Deliverable preview

Asset pipeline:
1. `tools/blender/scripts/export-lod1.py` runs in CI / dev machine.
2. Outputs `assets-built/source/lumi-lod1.glb` (~ 2.1 MB raw).
3. FR-OPS-001 pipeline optimizes → `assets-built/optimized/lumi-lod1.glb` (~ 380 KB).

Runtime:
1. Scene 5 globe shot — camera ~13m distance.
2. Drei <Detailed> swaps to LOD-1 mesh.
3. Production face details disappear; silhouette + animation preserved.
4. GPU saves ~75% vertex shader work.

Low-memory:
1. iPhone 6S Plus (2 GB RAM) deviceMemory=2.
2. Auto-routes to LOD-1 site-wide.

## §9 — Notes

**On future LOD-2:** Sprite billboard for distance > 30m — out of slice 1.

**On animation continuity:** Both LODs use SAME armature. Drei <Detailed> swap is mesh-only; animation playback state preserved.

**On Vietnamese localization:** None directly. LOD-1 mesh is locale-agnostic.

*End of FR-PERF-002.*
