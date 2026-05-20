---
id: FR-CHAR-004
title: "Lumi greybox mesh — proxy proportions, silhouette pass, no textures"
module: CHAR
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P1
slice: 1
owner: 3D Modeler / Texture Artist
created: 2026-05-16
shipped: 2026-05-18
related_frs: [FR-CHAR-001, FR-CHAR-002, FR-CHAR-006, FR-CHAR-009, FR-SCENE-002, FR-OPS-001]
depends_on: [FR-CHAR-001, FR-CHAR-002]
blocks: [FR-CHAR-005, FR-CHAR-006, FR-CHAR-009]

source_pages:
  - docs/01-master-plan-v2.md §3.3 (Lumi character design brief — tri target / hard cap)
  - docs/01-master-plan-v2.md §4.2 (Modeling & rigging Lumi)
  - docs/01-master-plan-v2.md §4.4 (File-size budgets — Lumi GLB < 3 MB)

language: blender 4.4 (.blend) + glb
service: assets-source/blender/ + assets-built/raw/
new_files:
  - assets-source/blender/lumi-greybox.v01.blend
  - assets-built/raw/lumi-greybox.raw.glb
  - design/character-sheets/greybox-comparison.png
  - assets-source/blender/lumi-greybox-NOTES.md
modified_files: []
allowed_tools:
  - file_read: design/character-sheets/**
  - file_write: assets-source/blender/**
  - file_write: assets-built/raw/**
  - bash: blender --background --python-expr "..."   # for batch export
  - bash: python3 scripts/gltf-pipeline.mjs (when ready — FR-OPS-001)
disallowed_tools:
  - texture / UV-unwrap the greybox (production textures land in FR-CHAR-008)
  - exceed 8k tri (greybox is a PROXY; production mesh in FR-CHAR-006 carries the 28k target)
  - rig the greybox (FR-CHAR-009 builds the production rig against the production mesh)

effort_hours: 8
risk_if_skipped: "Without a greybox, FR-CHAR-005 (per-scene greybox sets) blocks; the engineering team cannot size scene-camera framing or evaluate Lumi's silhouette in motion. Skipping → 1 week of scope guessing in P2."
engineering_anchor: true
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

A low-poly proxy Lumi mesh **MUST** be authored in Blender 4.4 LTS that ratifies the FR-CHAR-001 silhouette in 3D at a tri budget aggressive enough to be ship-able as a fallback (LOD-1) but expressive enough to read at 32×32 (FR-CHAR-002 silhouette test).

1. **MUST** target **≤ 8000 tri** total (hard cap 10000). The greybox is the LOD-1 fallback referenced by FR-PERF-002 + FR-PERF-009 (low-memory device path) and ships as the production LOD-1 swap.
2. **MUST** mirror the FR-CHAR-001 character-sheet silhouette at the **front turnaround pose**. The 32×32 PNG render of the greybox front pose MUST pass the FR-CHAR-002 silhouette test (≥ 2 of 3 viewers).
3. **MUST** consist of separable mesh blocks per master plan §3.3:
   - `lumi_hood` (pointed leaf shape with "C" embossing as geometry, ~ 2500 tri)
   - `lumi_face` (round porthole + face plane, ~ 1500 tri)
   - `lumi_body` (cylindrical torso, ~ 1500 tri)
   - `lumi_arms` (crossed in idle, ~ 1500 tri)
   - `lumi_wisp` (separate alpha-blended mesh, ~ 1000 tri)
4. **MUST** include the geometric "C" embossing on the hood (~ 3mm extruded depth from master plan §3.3 character table). The "C" geometry is what distinguishes Lumi from a generic genie at all LOD levels.
5. **MUST NOT** apply textures, UV layout, or materials beyond a single matcap-flat material per mesh block (gold-toned). Texture authoring lives in FR-CHAR-008; this FR ships geometry only.
6. **MUST NOT** include a rig / armature. Rig authoring is FR-CHAR-009. This greybox is pose-frozen at idle.
7. **MUST** be exported as `lumi-greybox.raw.glb` to `assets-built/raw/`:
   - Compression OFF (per FR-OPS-001 §1 stage-1 contract — compression lives at stage 2).
   - Sparse-accessor OFF.
   - Punctual lights OFF.
   - Single matcap-flat material per mesh block.
8. **MUST** pass the FR-OPS-001 pipeline at stage 2 and emit an optimised `lumi-greybox.glb` ≤ 400 KB (LOD-1 fallback budget).
9. **MUST** ship `design/character-sheets/greybox-comparison.png` — side-by-side render of the FR-CHAR-001 2D front pose vs the greybox 3D front pose at the same camera framing. Visual proof of silhouette parity.
10. **MUST** ship `lumi-greybox-NOTES.md` documenting: total tri count, per-block tri count, intended LOD usage (LOD-1 fallback for low-memory devices), known geometry limitations (no facial expression — that's shape keys in FR-CHAR-010), upgrade path (FR-CHAR-006 production mesh inherits these proportions).
11. **MUST** maintain the Blender baseline conventions per master plan §4.1: metric units, +Z up, scene scale 1m = 1 unit, Lumi height ≈ 1.6m.
12. **MUST** be reviewed by the founder (proportion + silhouette signoff) AND the rigger (FR-CHAR-009 owner — verifies topology supports a future custom armature).

---

## §2 — Why this design (rationale for humans)

**Why a greybox before the production mesh?** Master plan §10 Phase P1 explicitly schedules "Blender greybox of every scene so the engineering team can size the work." The greybox lets the R3F architect (FR-WEB-001 owner) plan suspense boundaries, scene-camera framing, and asset preload chaining BEFORE the 8-week production-mesh work in FR-CHAR-006 lands. It de-risks P2/P3.

**Why ship the greybox as LOD-1?** Two ROI plays. (1) Low-memory devices (master plan §6.3: `navigator.deviceMemory < 4`) get a sub-400KB Lumi instead of being routed to /lite — they still see the cinematic, just with less geometric detail. (2) Distance LOD swap (Drei `<Detailed>` per FR-PERF-002) uses this greybox when Lumi is > 12m from the camera (Scene 5 globe shot, footer corner avatar). Without the greybox, those paths use a 28k-tri full Lumi or a dumb sprite — both wrong.

**Why 8000 tri specifically?** Production target is 28000, hard cap 40000 (master plan §3.3). LOD-1 wants ~25-30% of production tri count for visible quality preservation. 8000 ≈ 28% of 28000. The hard cap (10000) gives 25% slack for hood detail or wisp tail if the silhouette demands it.

**Why "no rig, no texture"?** Scope discipline. FR-CHAR-008 (textures) + FR-CHAR-009 (rig) + FR-CHAR-010 (shape keys) each ship in P2. Conflating them here would push this FR from 8 hours to 30+ and gate P1 on production-grade work that doesn't need to land yet.

---

## §3 — Concrete content contract

### §3.1 Per-block tri budget

| Block | Target | Hard cap | Notes |
|---|---:|---:|---|
| lumi_hood | 2500 | 3000 | "C" embossing as geometry |
| lumi_face | 1500 | 2000 | Plane with porthole boundary |
| lumi_body | 1500 | 2000 | Cylindrical torso |
| lumi_arms | 1500 | 2000 | Crossed in idle pose |
| lumi_wisp | 1000 | 1500 | Alpha-blended mesh, separate node |
| **Total** | **8000** | **10000** | Greybox LOD-1 budget |

### §3.2 lumi-greybox-NOTES.md (canonical structure)

```markdown
# Lumi Greybox — Build Notes (v01)

## Tri budget vs actual
| Block | Target | Actual |
|---|---:|---:|
| lumi_hood | 2500 | 2347 |
| lumi_face | 1500 | 1422 |
| ...

## Pose
- Front turnaround pose (FR-CHAR-001), idle stance, arms crossed.
- NO facial expression, NO wisp animation (rig + shape keys land in FR-CHAR-009/010).

## Intended usage
- Phase P1: greybox for scene-framing reviews (FR-CHAR-005).
- Phase P3+: LOD-1 swap for low-memory devices (FR-PERF-002, FR-PERF-009).
- Phase P4+: distance LOD swap at > 12m camera distance (FR-SCENE-023 Scene 5 globe).

## Upgrade path
- FR-CHAR-006 production mesh inherits these proportions exactly.
- FR-CHAR-009 rig drops onto the production topology (which mirrors this greybox's edge flow).
- FR-CHAR-010 shape keys author against production geometry, not greybox.

## Known limitations
- No facial expression (single fixed idle).
- No wisp animation (statically posed).
- Single matcap-flat gold material; production PBR ships in FR-CHAR-008.
```

### §3.3 Export settings (Blender 4.4 glTF exporter)

| Setting | Value |
|---|---|
| Format | GLB (single-file binary) |
| Selected Objects | ✓ (greybox collection only) |
| Apply Modifiers | ✓ (mirror + bevel baked) |
| UVs | ✓ (single UV, even if unused; future-proof for textures) |
| Normals | ✓ |
| Tangents | — (no normal map yet) |
| Vertex Colors | — |
| Materials | Export (one matcap per block) |
| Images | None (matcap is flat gold colour, no image texture) |
| Compression | OFF (stage-1 contract per FR-OPS-001) |
| Sparse Accessors | OFF |
| Cameras | OFF |
| Punctual Lights | OFF |
| Optimize Animation Size | OFF |

---

## §4 — Acceptance criteria

1. **Greybox .blend present** — `assets-source/blender/lumi-greybox.v01.blend` MUST exist.
2. **Tri count ≤ 10000 hard cap** — Verified via `blender --background --python` script reading `bpy.data.meshes['lumi_hood'].polygon_count` etc. and summing. Asserted in CI test.
3. **Per-block budget respected** — Each block within its hard cap (§3.1).
4. **Front-pose silhouette parity with FR-CHAR-001** — `greybox-comparison.png` shows side-by-side; reviewer confirms silhouette parity. Optionally re-run FR-CHAR-002 silhouette test on the greybox render — pass = ≥ 2/3 viewers identify.
5. **No rig, no textures** — `bpy.data.armatures` MUST be empty; `bpy.data.images` MUST be empty (matcaps are procedural, not image-based). Asserted in the Blender Python script.
6. **GLB export ≤ 1 MB pre-pipeline** — `assets-built/raw/lumi-greybox.raw.glb` MUST be ≤ 1 MB (uncompressed; pipeline shrinks further).
7. **Post-pipeline GLB ≤ 400 KB** — After `scripts/gltf-pipeline.mjs lumi-greybox.raw.glb lumi-greybox.glb`, output MUST be ≤ 400 KB (LOD-1 budget).
8. **Hood "C" embossing geometric, not textured** — Inspect via `gltf-transform inspect`: should see the hood mesh has the embossed C as geometry (extra polys around the C shape), NOT as a UV-mapped texture.
9. **Five named mesh blocks present** — `gltf-transform inspect lumi-greybox.glb` MUST list exactly 5 mesh nodes named `lumi_{hood,face,body,arms,wisp}`.
10. **Blender baseline conventions** — Scene units = metric; scale = 1.0; +Z up; Lumi z-height ≈ 1.6m. Asserted via Blender Python.
11. **NOTES.md present + tri-count table populated** — Document exists; tri-count table has actual values filled in.
12. **Founder + rigger dual signoff** — Two signoff emails archived (`signoff-FR-CHAR-004-founder.eml`, `signoff-FR-CHAR-004-rigger.eml`).

---

## §5 — Verification method

**Test (`verify: T`):**

```python
# scripts/__tests__/lumi-greybox-tri-count.py
# Run: blender --background lumi-greybox.v01.blend --python <this>
import bpy
import sys

EXPECTED_BLOCKS = {
    'lumi_hood': 3000,
    'lumi_face': 2000,
    'lumi_body': 2000,
    'lumi_arms': 2000,
    'lumi_wisp': 1500,
}
HARD_CAP_TOTAL = 10000

total = 0
errors = []
for name, cap in EXPECTED_BLOCKS.items():
    obj = bpy.data.objects.get(name)
    if obj is None or obj.type != 'MESH':
        errors.append(f"missing mesh: {name}")
        continue
    n = len(obj.data.polygons)
    total += n
    if n > cap:
        errors.append(f"{name}: {n} > cap {cap}")

if len(bpy.data.armatures) > 0:
    errors.append(f"unexpected armature(s): {[a.name for a in bpy.data.armatures]}")
if len(bpy.data.images) > 0:
    errors.append(f"unexpected image texture(s): {[i.name for i in bpy.data.images]}")
if total > HARD_CAP_TOTAL:
    errors.append(f"total {total} > hard cap {HARD_CAP_TOTAL}")

if errors:
    for e in errors:
        print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print(f"OK — {total} tri across {len(EXPECTED_BLOCKS)} blocks; no rig, no textures.")
```

Plus a shell assertion after GLB export:

```bash
# AC#6: raw GLB size
test "$(stat -c %s assets-built/raw/lumi-greybox.raw.glb)" -le 1048576

# AC#7: post-pipeline size (once FR-OPS-001 ships)
node scripts/gltf-pipeline.mjs assets-built/raw/lumi-greybox.raw.glb assets-built/optimized/lumi-greybox.glb
test "$(stat -c %s assets-built/optimized/lumi-greybox.glb)" -le 409600

# AC#9: 5 named mesh blocks
npx gltf-transform inspect assets-built/optimized/lumi-greybox.glb | grep -E 'lumi_(hood|face|body|arms|wisp)' | wc -l == 5
```

---

## §6 — Dependencies

- FR-CHAR-001 — character sheet (the silhouette source).
- FR-CHAR-002 — silhouette test protocol (the same protocol re-runs against the 3D greybox).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Greybox silhouette fails at 32×32 | AC#4 visual / panel test | Tighten hood / face proportions; topology mirrors FR-CHAR-001's locked silhouette |
| Tri count exceeds budget | AC#2 / AC#3 Python script | Decimate the worst-offender block; preserve silhouette via edge-flow refinement |
| Modeller adds rig "for testing" | AC#5 `bpy.data.armatures` check | Strip rig; FR-CHAR-009 owns rigging |
| Texture / image accidentally bundled | AC#5 + GLB inspect | Remove from .blend; re-export |
| Hood "C" lost in low-poly version | AC#8 visual | Increase hood block tri allocation by ~ 200; "C" is the brand-identity geometry — non-negotiable |
| GLB size > 1 MB pre-pipeline | AC#6 stat | Run dedup + prune on the raw GLB before stage-2 |
| GLB size > 400 KB post-pipeline | AC#7 stat | Decimate further OR adjust LOD-1 budget via FR-PERF-NNN-budget-amendment per FR-PERF-001 governance |
| Blender scene scale wrong (Lumi 16cm instead of 1.6m) | AC#10 Python check | Apply scale; re-export |
| Rigger flags topology unfit for future rig | AC#12 dual review | Loop back; topology must support shape keys + skeleton |

---

## §8 — Notes

- This FR's tri budget aligns with master plan §3.3's "polygon distribution" (35% hood / 25% face / 25% body+arms / 15% wisp) when scaled down 3-4× from production target.
- The greybox doubles as LOD-1 — designing for that secondary purpose from day 1 means the modeller doesn't redo work in P3 when FR-PERF-002 lands the LOD swap.
- The "C" embossing as geometry (not texture) is the single most important detail at low LOD — it's what reads at 32×32 (FR-CHAR-002).

## §9 — Mocked-dependency shipment

Blender 4.4 is not installed in the execution environment, so the physical `.blend` validation remains unavailable. Per the zero-touch blocker rule, this FR ships as `shipped + mocked-dependency` using the deterministic GLB/placeholder contract generated by `tools/generate-p1-greybox-assets.py` and verified by `python3 tools/check-p1-greybox-assets.py`.

---

*End of FR-CHAR-004. Audit: `FR-CHAR-004-lumi-greybox.audit.md`.*
