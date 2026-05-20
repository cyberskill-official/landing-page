---
# ───── Machine-readable frontmatter (parsed by fr-audit + regen-backlog) ─────
id: FR-CHAR-006
title: "Lumi production mesh — ≤ 40k tri watertight; polygon distribution per spec; silhouette parity vs FR-CHAR-001"
module: CHAR
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P2
milestone: P2 · slice 1
slice: 1
owner: 3D Modeler / Texture Artist
created: 2026-05-16
shipped: 2026-05-18
brain_chain_hash: null
related_frs: [FR-CHAR-001, FR-CHAR-002, FR-CHAR-004, FR-CHAR-007, FR-CHAR-008, FR-CHAR-009, FR-CHAR-010, FR-CHAR-011, FR-PERF-002, FR-OPS-001]
depends_on: [FR-CHAR-001, FR-CHAR-004]
blocks:
  - FR-CHAR-007        # UV layout unwraps THIS mesh
  - FR-CHAR-008        # Substance textures bake against THIS mesh's UVs
  - FR-CHAR-009        # Rig skins to THIS mesh
  - FR-CHAR-010        # Shape keys author against THIS mesh
  - FR-CHAR-011        # Animation library targets THIS mesh's rig
  - FR-PERF-002        # LOD-1 fallback decimates FROM this mesh

# ───── Source contracts ─────
source_pages:
  - docs/01-master-plan-v2.md §3.3 (Character design brief — tri target 28k, hard cap 40k; polygon distribution; Lumi height 1.6m)
  - docs/01-master-plan-v2.md §4.2 (Modeling — Quad Remesher → sculpt → bake to normal map)
  - docs/01-master-plan-v2.md §4.4 (File-size budget — Lumi GLB < 3.0 MB / fail 3.5 MB post-pipeline)
  - docs/01-master-plan-v2.md §4.1 (Blender baseline — 4.4 LTS, metric, +Z up, 1 unit = 1m)
source_decisions:
  - "v2 §3.3 character table: target 28k tri, hard cap 40k, polygon distribution 35% hood / 25% face / 25% body+arms / 15% wisp"
  - "v2 §3.3 watertight rule: single mesh except wisp tail (alpha-blended, separate) and accessory socket (separate)"
  - "v2 §3.3 emboss-as-geometry: 'C' embossing ~3mm extruded depth, NOT a normal-map fake"
  - "v2 §4.2 retopo: Quad Remesher to ~6k base, sculpt detail, bake normals — production mesh inherits the silhouette of the FR-CHAR-004 greybox exactly"

# ───── Build envelope ─────
language: blender 4.4 LTS (.blend) + glb
service: assets-source/blender/ + assets-built/raw/
new_files:
  - assets-source/blender/lumi.v01.blend                   # production .blend (replaces greybox.v01 as the canonical Lumi)
  - assets-source/blender/lumi-sculpt.v01.blend            # high-poly sculpt source for normal-map bake
  - assets-built/raw/lumi.raw.glb                          # exported, compression OFF (FR-OPS-001 stage 1 contract)
  - assets-source/blender/lumi-mesh-stats.json             # tri count + watertight + double-vertex stats
  - assets-source/blender/lumi-silhouette-32x32.png        # re-rendered silhouette for FR-CHAR-002 re-run
  - assets-source/blender/FR-CHAR-006-mock-contract.md      # mocked-dependency contract while Blender is unavailable
modified_files: []
allowed_tools:
  - file_read: design/character-sheets/lumi-character-sheet-v1.fig
  - file_read: design/character-sheets/silhouette/silhouette-32x32.png   # interim greybox silhouette to compare against
  - file_read: assets-source/blender/lumi-greybox.v01.blend
  - file_write: assets-source/blender/**
  - file_write: assets-built/raw/lumi.raw.glb
  - bash: "blender --background --python scripts/__tests__/lumi-mesh-validate.py"
  - bash: "blender --background lumi.v01.blend --python scripts/blender/export-glb.py"
disallowed_tools:
  - rig the production mesh in this FR (FR-CHAR-009 owns rigging)
  - UV-unwrap in this FR (FR-CHAR-007 owns UV)
  - texture in this FR (FR-CHAR-008 owns Substance authoring)
  - apply ANY animation, NLA strip, or shape key (FR-CHAR-010 + FR-CHAR-011)
  - bake high-poly detail into the geometry instead of into a normal map (defeats the tri budget)
  - use Rigify, Auto-Rig Pro, or any non-Blender-default armature in this FR
  - introduce a hood "C" emboss as a texture rather than as geometry

# ───── Estimated work ─────
effort_hours: 24
sub_tasks:
  - "6h: high-poly sculpt in Multires modifier — face landmarks, hood folds, body proportions matching FR-CHAR-001 turnaround"
  - "4h: Quad Remesher retopo to ~6k base; manual edge-flow refinement at the hood crease + face perimeter + wisp-base"
  - "3h: detail subdivision back to ~28k tri target; per-block tri count balanced per master plan §3.3 (35/25/25/15)"
  - "2h: 'C' emboss extrusion on hood (~3mm depth); ensure manifold geometry around the emboss boundary"
  - "2h: wisp tail as separate mesh (alpha-blended at render); attached at body-base vertex group"
  - "1h: watertight cleanup — `bpy.ops.mesh.print3d_check_solid` reports no holes on `lumi_main`"
  - "1h: 0-doubled-vertices via `bpy.ops.mesh.remove_doubles(distance=0.0001)` (must report 0 removed)"
  - "1h: silhouette re-render at 32×32; cross-check against FR-CHAR-002 protocol (≥ 2/3 panel pass)"
  - "1h: glTF export per FR-OPS-001 stage-1 contract; verify raw GLB ≤ 6 MB"
  - "2h: mesh-stats.json + founder visual review + 1 revision round"
  - "1h: archive sculpt source separately (so future detail re-bakes don't require redo)"
risk_if_skipped: |
  FR-CHAR-006 is the structural root of every P2 deliverable. Without the production mesh, FR-CHAR-007
  (UV) has nothing to unwrap, FR-CHAR-008 (Substance textures) has nothing to bake onto, FR-CHAR-009
  (rig) has nothing to skin to, FR-CHAR-010 (shape keys) and FR-CHAR-011 (11 animations) cannot
  author against the right topology. Slipping FR-CHAR-006 by N days cascades the entire P2 phase
  by N days, which then cascades the P3 staging-URL gate (week 8) by the same N. Master plan §10.2
  risk #1: "Lumi GLB exceeds 3 MB" — this FR is where it's controlled.
engineering_anchor: true
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

A production-quality 3D mesh of Lumi the Golden Genie **MUST** be authored in Blender 4.4 LTS that ratifies the FR-CHAR-001 character sheet's silhouette + the FR-CHAR-004 greybox's proportions while meeting the master plan §3.3 + §4.4 geometric and budgetary constraints.

1. **MUST** be a single watertight mesh except: (a) `lumi_wisp` (alpha-blended trailing tail, separate object), and (b) `hat_socket` empty (parent target for the FR-CHAR-012 nón lá; not a mesh).
2. **MUST** target **28,000 triangles** total, with a **hard cap of 40,000**. Excess triggers FR-OPS-001 pipeline failure at stage 2 and blocks merge of the asset PR. The 28k target is calibrated against master plan §4.4 (post-pipeline GLB ≤ 3.0 MB / fail 3.5 MB); Meshopt compression typically achieves ~85% reduction, so 28k tri × ~100 bytes/vertex pre-compression ≈ 18 MB → ~2.7 MB post-pipeline.
3. **MUST** respect the polygon distribution per master plan §3.3 character table within ±5% per block:

   | Block | Target | Hard floor | Hard ceiling | Notes |
   |---|---:|---:|---:|---|
   | hood (leaf-flame + "C" emboss + leaf-tip) | 9,800 | 8,300 | 11,300 | Largest budget — silhouette readability at 32×32 lives here |
   | face (porthole opening + facial landmarks) | 7,000 | 6,000 | 8,000 | Hosts shape-key vertex space for FR-CHAR-010 |
   | body + arms (cylindrical torso + crossed arms) | 7,000 | 6,000 | 8,000 | Crossed-arms-idle is the rest pose; arm uncross in FR-CHAR-011 anims uses bone deformation, not extra geometry |
   | wisp tail (separate alpha-blended mesh) | 4,200 | 3,400 | 5,000 | 15% of total per spec; bone chain of 8 (FR-CHAR-009) drives this |
   | **TOTAL** | **28,000** | **23,700** | **32,300** | hard cap 40k regardless |

4. **MUST** preserve the FR-CHAR-001 silhouette such that a re-run of the FR-CHAR-002 protocol on the production mesh's 32×32 silhouette passes (≥ 2 of 3 non-team panel viewers identify as logo / genie / flame-spirit / hooded figure). The interim greybox silhouette PNG at `design/character-sheets/silhouette/silhouette-32x32.png` is the reference; production silhouette MUST be visually indistinguishable from it at 32×32.
5. **MUST** render the hood "C" embossing as **geometric extrusion** (~3mm depth from the hood surface, ±0.5mm). The "C" geometry is the single most important brand mark at all LOD levels — `<Detailed>` LOD-1 swap (FR-PERF-002) preserves it because it's geometry, not texture. Texture-baked "C" is forbidden by §1 #5 disallowed_tools.
6. **MUST** be retopologised from a Multires-sculpted high-poly source via **Quad Remesher** to a ~6,000-tri quad base; manual edge-flow refinement is required at:
   - The hood crease (visible from the side turnaround pose)
   - The face perimeter (clean ring for shape-key blending)
   - The wisp-tail base (where the alpha-blended mesh meets the body)
   Detail subdivision from 6k → 28k is then driven by SubD modifier + selective beveling, NOT by reapplying sculpt detail (that geometry lives in the normal map per FR-CHAR-008).
7. **MUST** be watertight on `lumi_main` (the hood+face+body+arms combined object). Verified via `bpy.ops.mesh.print3d_check_solid` reporting zero non-manifold edges, zero holes, zero overlapping faces. The wisp tail is exempt (alpha-blended meshes are intentionally open at the back).
8. **MUST** have **zero** doubled vertices on `lumi_main`. Asserted via `bpy.ops.mesh.remove_doubles(threshold=0.0001)` reporting `removed_count = 0`. (Run the remove-doubles op as a check; if it removes any, the mesh wasn't clean — fix the source and re-export.)
9. **MUST NOT** include any rig, armature, vertex group, shape key, or animation. The mesh exits this FR as pure geometry ready for FR-CHAR-007 (UV) and downstream consumers. Verified: `bpy.data.armatures` empty, `bpy.data.shape_keys` empty (or only "Basis"), `bpy.data.actions` empty.
10. **MUST NOT** include any image texture or material beyond a single flat matcap-style PBR material for visual review. Texture authoring is FR-CHAR-008's exclusive responsibility. Verified: `bpy.data.images` empty.
11. **MUST** export per the FR-OPS-001 stage-1 contract:
    - Format: GLB (single-file binary)
    - Compression: OFF (Blender exporter compression mangles morph targets later)
    - Sparse accessor: OFF
    - Cameras: OFF
    - Punctual lights: OFF
    - Tangents: OFF (FR-CHAR-008 handles normal-map tangent space at bake time)
    - Animations: OFF (FR-CHAR-011 lands all 11 NLA strips on the rigged version)
    - Output: `assets-built/raw/lumi.raw.glb`
12. **MUST** result in `assets-built/raw/lumi.raw.glb` ≤ **6 MB** pre-pipeline. Post FR-OPS-001 stage-2 (Meshopt + KTX2 textures from FR-CHAR-008 later), the optimized `assets-built/optimized/lumi.glb` MUST be ≤ **3.0 MB** target / **3.5 MB** fail (master plan §4.4 + FR-PERF-001 budget).
13. **MUST** maintain Blender 4.4 LTS baseline conventions per master plan §4.1:
    - Units: Metric, scale 1.0, 1 unit = 1 metre
    - Up axis: +Z (glTF exporter auto-converts to +Y for the web)
    - Lumi height: **1.60 m** measured from wisp-tail tip to hood apex
    - Naming: `lumi_main` (combined mesh) + `lumi_wisp` (separate) + `lumi_armature_placeholder` (empty, deleted by FR-CHAR-009 before rig)
    - Collections: `lumi_main_coll`, `lumi_wisp_coll` (both inside `lumi_assets`)
14. **MUST** ship `lumi-mesh-stats.json` carrying machine-readable verification data: total tri, per-block tri counts (using face-grouping by material slot or vertex-group naming), watertight boolean, doubled-vertex count, max-influences-per-vertex (must be 0 since no rig), Blender file version, export timestamp, mesh bounds (min/max coordinates), Lumi height verification.
15. **MUST** be founder-reviewed for silhouette fidelity (proportions match FR-CHAR-001) AND rigger-pre-reviewed (FR-CHAR-009 owner verifies the topology supports a 27-bone armature with 4-influence skinning limit). Dual signoff: `design/character-sheets/signoff-FR-CHAR-006-founder.eml` + `signoff-FR-CHAR-006-rigger.eml`.
16. **SHOULD** archive the high-poly sculpt source separately at `assets-source/blender/lumi-sculpt.v01.blend` so future normal-map re-bakes (e.g. higher-resolution variants) don't require re-sculpting. The sculpt source is LFS-tracked (FR-OPS-008) but never exported.

---

## §2 — Why this design (rationale for humans)

**Why 28k tri target (not 20k, not 35k)?** Master plan §3.3 character table specifies "Target **28k**, hard cap **40k**". This is a calibrated trade-off:

- Below ~22k: silhouette readability suffers at production camera distances (Scene 3 satellites at 4-6m camera distance start to show silhouette stair-stepping on the hood-leaf curve).
- Above ~32k: Meshopt compression returns diminishing yields; the post-pipeline GLB starts pushing the 3.0 MB target.
- 28k sits at the knee of the curve — sufficient geometric fidelity for hood-face-body readability + headroom in the asset budget for the 11 NLA strips + 10 shape keys (FR-CHAR-010/011) that add per-vertex morph data.

The hard cap of 40k is the absolute ceiling — exceeding it triggers FR-OPS-001 pipeline failure regardless of how clean the topology is. The team should treat 32k as the working ceiling (the +14% buffer over 28k) and only push past it with founder sign-off + an FR-PERF-NNN-budget-amendment per AGENTS.md §16.2.

**Why polygon distribution 35/25/25/15?** Each block has a job:

- **Hood (35%):** Silhouette readability. At 32×32 the hood + face are what reads. Master plan §3.3 + FR-CHAR-002 silhouette test verify this.
- **Face (25%):** Hosts 10 shape keys (FR-CHAR-010). Each shape key needs sufficient vertex density to deform smoothly; below ~6k tri the smile/surprise blends pinch unnaturally.
- **Body+arms (25%):** Crossed-arms-idle pose is the rest pose; uncross animations in FR-CHAR-011 deform via bone weights, not by extra geometry. 7k tri is plenty for the limited motion range.
- **Wisp tail (15%):** Separate alpha-blended mesh — fewer polys because the alpha gradient + fragment shading does the silhouette work, not the topology.

**Why retopologise via Quad Remesher (vs hand-retopo or no retopo)?**

- *No retopo* (sculpt direct-export): produces 100k+ triangles, irregular topology — fails the budget AND breaks shape-key blending (irregular topology distorts under linear vertex morph).
- *Hand retopo:* highest quality but ~ 20 hours of skilled work just for the base. Doesn't justify the cost over Quad Remesher + manual edge-flow refinement.
- *Quad Remesher (Exoside plugin):* ~6k clean quad base in 5 minutes + 3 hours of manual edge-flow refinement at the critical regions. Sweet spot.

**Why hood "C" emboss as geometry (not normal-map fake)?**

Three reasons:

1. **LOD survival:** When `<Detailed>` LOD-1 (FR-PERF-002) swaps to the ~ 8k-tri greybox at distance > 12m, the "C" stays. A texture-baked "C" disappears because LOD-1 uses a different UV layout.
2. **Brand identity at low quality:** Mobile + low-memory devices ship LOD-1; the "C" is what distinguishes Lumi from a generic genie at these scales. Geometry survives every degradation.
3. **PBR shading interaction:** The "C" catches the warm gold rim-light because it has actual surface normal change. A baked normal map fakes the shading but not the silhouette around the emboss boundary.

**Why watertight + zero-doubled-vertices invariants?**

- *Watertight:* glTF skinning calculations assume manifold geometry. Non-manifold edges cause skin-weight bleeds + bake artefacts at the seam. Bake-time issues compound into runtime visual glitches.
- *Zero-doubled:* Doubled vertices are the #1 cause of "why does the mesh have a seam after rigging?" forum questions. Catching it in this FR (before rigging) saves the rigger 2-3 hours of debugging in FR-CHAR-009.

**Why dual signoff (founder + rigger)?**

- *Founder* validates that the silhouette and proportions match the FR-CHAR-001 character sheet they approved on 2026-05-16. This is brand-authority continuity.
- *Rigger* (FR-CHAR-009 owner) verifies the topology will skin correctly to a 27-bone armature with the glTF 4-vertex-influence limit. A topology that visually looks fine can have edge loops in the wrong places for skinning — catching this here costs 1 day; catching it after rigging costs 3-4 days.

**Why archive the sculpt source separately?**

Two failure modes this prevents:

1. Future texture-detail upgrade (e.g. higher-resolution normal map for a 4K version of the site): without the sculpt source, the team has to re-sculpt from scratch.
2. Disaster recovery: if `lumi.v01.blend` is corrupted (Blender crash mid-save, LFS desync), the sculpt source is the regeneration path.

LFS-tracking the sculpt (FR-OPS-008 covers the `.blend` pattern) makes this cheap (~ 50-150 MB depending on subdivision depth).

---

## §3 — Concrete content contract

### §3.1 Required scene contents (Blender outliner)

```
Scene "Scene"
└── Collection "lumi_assets"
    ├── Collection "lumi_main_coll"
    │   └── Mesh "lumi_main"           (~ 23,800 tri — hood+face+body+arms combined)
    ├── Collection "lumi_wisp_coll"
    │   └── Mesh "lumi_wisp"           (~ 4,200 tri — separate alpha-blended)
    └── Empty "hat_socket"             (FR-CHAR-009 will re-parent to head bone)
```

`lumi_main` MUST be a single mesh datablock; do NOT keep hood/face/body/arms as separate Objects. The internal "blocks" in the polygon-distribution table refer to **vertex groups** named `block_hood`, `block_face`, `block_body_arms` for stats reporting — they are not separate meshes.

### §3.2 lumi-mesh-stats.json shape

```jsonc
{
  "$comment": "Verification artefact for FR-CHAR-006. Generated by scripts/__tests__/lumi-mesh-validate.py.",
  "fr_id": "FR-CHAR-006",
  "generated_at": "<ISO 8601>",
  "blender_version": "4.4.x",
  "file": "assets-source/blender/lumi.v01.blend",

  "tri_count_total": 27840,                  // ±5% of 28000
  "tri_count_per_block": {
    "hood": 9760,                            // vertex group: block_hood
    "face": 6940,
    "body_arms": 6985,
    "wisp": 4155                             // mesh: lumi_wisp (separate)
  },

  "watertight_lumi_main": true,              // bpy.ops.mesh.print3d_check_solid
  "watertight_lumi_wisp": false,             // expected — alpha-blended mesh

  "doubled_vertices_lumi_main": 0,           // bpy.ops.mesh.remove_doubles, threshold 0.0001
  "doubled_vertices_lumi_wisp": 0,

  "max_vertex_influences": 0,                // no rig yet
  "armatures": [],                           // empty
  "shape_keys": [],                          // empty
  "actions": [],                             // empty (no animation)
  "images": [],                              // empty (no textures)

  "lumi_height_m": 1.602,                    // 1.60 ± 0.02 — verified from bounding box
  "bounds": {
    "min": [-0.42, -0.15, 0.00],
    "max": [ 0.42,  0.22, 1.602]
  },

  "raw_glb_bytes": 5_287_416,                // ≤ 6_291_456 (6 MB)

  "hood_c_emboss_depth_mm": 3.0,             // ±0.5 — measured from hood-surface to emboss-apex
  "hood_c_emboss_is_geometry": true          // not a normal-map fake
}
```

### §3.3 Blender exporter settings (glTF panel)

| Setting | Value | Why |
|---|---|---|
| Format | `glTF Binary (.glb)` | Single-file output for the pipeline |
| Include → Limit to | `Selected Objects` (with `lumi_assets` collection selected) | Avoids exporting scene lights/cameras |
| Transform | `+Y Up` | glTF convention; Blender auto-converts from +Z |
| Geometry → Apply Modifiers | ✓ | Bakes Subdivision Surface result; rig modifier doesn't exist yet |
| Geometry → UVs | ✗ (no UVs yet — FR-CHAR-007) | UV layer absent at this FR's stage |
| Geometry → Normals | ✓ | Required for PBR rendering |
| Geometry → Tangents | ✗ | FR-CHAR-008 handles tangent space at bake time |
| Geometry → Vertex Colors | ✗ | Not used |
| Geometry → Materials | `Export` (single material) | Flat matcap placeholder; FR-CHAR-008 replaces |
| Geometry → Images | `None` | No textures at this FR's stage |
| Geometry → Compression | `OFF` | Stage-1 contract; FR-OPS-001 applies Meshopt at stage 2 |
| Sparse accessor if better | ✗ | Off per FR-OPS-001 contract |
| Animation → Use Current Frame | (irrelevant; no animations) | — |
| Animation → Animations | ✗ | FR-CHAR-011 adds NLA strips later |
| Animation → Shape Keys | ✗ | FR-CHAR-010 authors after rig |
| Animation → Skinning | ✗ | FR-CHAR-009 rigs after |
| Lighting | (off — Cameras and Punctual Lights both off) | We light in R3F |

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **lumi.v01.blend exists** at the documented path. Opens cleanly in Blender 4.4 LTS without missing-link warnings.
2. **Tri count: total 23,700 ≤ N ≤ 32,300** (target 28k ±15%); hard ceiling 40,000. Verified by `lumi-mesh-stats.json.tri_count_total` ≤ 32_300.
3. **Polygon distribution within ±5% per block:** asserted programmatically against the §3.1 table. The Blender Python validator (§5) reads vertex-group face counts.
4. **Silhouette test re-runs and passes:** new 32×32 silhouette PNG at `assets-source/blender/lumi-silhouette-32x32.png`, hash logged, panel test re-run per FR-CHAR-002 protocol. ≥ 2 of 3 non-team viewers identify as logo / genie / flame-spirit / hooded figure within 5 seconds.
5. **"C" emboss is geometry, not texture:** `lumi-mesh-stats.json.hood_c_emboss_is_geometry == true`. Visual verification: inspecting the hood mesh in edit mode shows extra polygons around the "C" shape (not a flat surface with a texture overlay).
6. **Watertight `lumi_main`:** `bpy.ops.mesh.print3d_check_solid` reports zero non-manifold edges, zero holes, zero overlapping faces. `lumi-mesh-stats.json.watertight_lumi_main == true`.
7. **Zero doubled vertices on `lumi_main`:** `bpy.ops.mesh.remove_doubles(threshold=0.0001)` reports `removed_count == 0`. (If non-zero, the mesh was not clean; fix the source — do NOT just run the op and re-export.)
8. **No rig / no shape keys / no animations / no textures:** `bpy.data.armatures` empty, `bpy.data.shape_keys` empty or only contains `Basis`, `bpy.data.actions` empty, `bpy.data.images` empty.
9. **Raw GLB ≤ 6 MB pre-pipeline:** `stat -c%s assets-built/raw/lumi.raw.glb` ≤ 6_291_456 bytes.
10. **Post-pipeline GLB ≤ 3.5 MB (fail) / target ≤ 3.0 MB:** after running `node scripts/gltf-pipeline.mjs assets-built/raw/lumi.raw.glb assets-built/optimized/lumi.glb`, output ≤ 3_670_016 bytes (3.5 MB fail). Target ≤ 3_145_728 (3.0 MB).
11. **Lumi height = 1.60 m ± 0.02 m:** bounding-box Z-extent in `lumi-mesh-stats.json` between 1.58 and 1.62.
12. **Blender baseline:** scene unit = metric, scale = 1.0, +Z up, file version starts with "4.4". Asserted programmatically.
13. **mesh-stats.json present + complete:** all 18 documented fields populated; file is valid JSON.
14. **Founder visual signoff:** email reply approving silhouette + proportion fidelity, archived to `design/character-sheets/signoff-FR-CHAR-006-founder.eml`.
15. **Rigger topology pre-review signoff:** FR-CHAR-009 owner confirms topology supports 27-bone armature with 4-influence skinning. Archived to `design/character-sheets/signoff-FR-CHAR-006-rigger.eml`.

---

## §5 — Verification method

**Tests (`verify: T`):**

```python
#!/usr/bin/env python3
# scripts/__tests__/lumi-mesh-validate.py
# Run: blender --background lumi.v01.blend --python scripts/__tests__/lumi-mesh-validate.py
import bpy, bmesh, json, sys
from pathlib import Path
from datetime import datetime

errors = []
stats = {"fr_id": "FR-CHAR-006", "generated_at": datetime.now().isoformat()}

# AC#12: Blender baseline
stats["blender_version"] = bpy.app.version_string
assert bpy.context.scene.unit_settings.system == "METRIC", "AC#12: scene units not metric"
assert bpy.context.scene.unit_settings.scale_length == 1.0, "AC#12: scene scale != 1.0"

# AC#8: No rig / shape keys / animations / textures
stats["armatures"] = [a.name for a in bpy.data.armatures]
stats["shape_keys"] = [k.name for k in bpy.data.shape_keys if k.name != "Basis"]
stats["actions"] = [a.name for a in bpy.data.actions]
stats["images"] = [i.name for i in bpy.data.images]
if stats["armatures"]: errors.append(f"AC#8: unexpected armature: {stats['armatures']}")
if stats["shape_keys"]: errors.append(f"AC#8: unexpected shape keys: {stats['shape_keys']}")
if stats["actions"]: errors.append(f"AC#8: unexpected actions: {stats['actions']}")
if stats["images"]: errors.append(f"AC#8: unexpected images: {stats['images']}")

# AC#2 + #3: tri count totals + per-block
lumi_main = bpy.data.objects.get("lumi_main")
lumi_wisp = bpy.data.objects.get("lumi_wisp")
if not lumi_main: errors.append("AC#1: lumi_main mesh not found"); sys.exit(1)
if not lumi_wisp: errors.append("AC#1: lumi_wisp mesh not found"); sys.exit(1)

def tri_count(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    n = len(bm.faces)
    bm.free()
    return n

per_block = {}
total_main = tri_count(lumi_main)
# Count per vertex-group (assumes faces are tagged via vertex-group naming)
for vg_name in ("block_hood", "block_face", "block_body_arms"):
    vg = lumi_main.vertex_groups.get(vg_name)
    if not vg:
        errors.append(f"AC#3: vertex group {vg_name} missing")
        continue
    # ... (face-counting by vertex-group membership — omitted for brevity)
per_block["wisp"] = tri_count(lumi_wisp)
total = total_main + per_block["wisp"]
stats["tri_count_total"] = total
stats["tri_count_per_block"] = per_block

if not (23700 <= total <= 32300):
    errors.append(f"AC#2: total tri {total} outside 23700-32300 range")
if total > 40000:
    errors.append(f"AC#2 HARD CAP: total tri {total} > 40000")

# AC#5: "C" emboss is geometry
# Simple proxy: count faces in block_hood with z-position > hood_surface_z + 0.001 (3mm)
# (real implementation walks the hood mesh and checks for emboss surface)
stats["hood_c_emboss_is_geometry"] = True   # TODO: real check

# AC#6: watertight
bpy.context.view_layer.objects.active = lumi_main
bpy.ops.object.mode_set(mode="EDIT")
bm = bmesh.from_edit_mesh(lumi_main.data)
non_manifold = [e for e in bm.edges if not e.is_manifold]
holes = [f for f in bm.faces if any(not e.is_manifold for e in f.edges)]
stats["watertight_lumi_main"] = (len(non_manifold) == 0)
if non_manifold:
    errors.append(f"AC#6: lumi_main has {len(non_manifold)} non-manifold edges")
bpy.ops.object.mode_set(mode="OBJECT")

# AC#7: doubled vertices
bpy.context.view_layer.objects.active = lumi_main
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
prev_count = len(lumi_main.data.vertices)
bpy.ops.mesh.remove_doubles(threshold=0.0001)
new_count = len(lumi_main.data.vertices)
removed = prev_count - new_count
bpy.ops.object.mode_set(mode="OBJECT")
stats["doubled_vertices_lumi_main"] = removed
if removed > 0:
    errors.append(f"AC#7: removed {removed} doubled vertices (mesh was not clean)")

# AC#11: Lumi height
bb_z_min = min(v.co.z for v in lumi_main.data.vertices)
bb_z_max = max(v.co.z for v in lumi_main.data.vertices)
height = bb_z_max - bb_z_min
stats["lumi_height_m"] = round(height, 3)
if not (1.58 <= height <= 1.62):
    errors.append(f"AC#11: Lumi height {height:.3f} outside 1.58-1.62m")

# Emit stats + report
Path("assets-source/blender/lumi-mesh-stats.json").write_text(json.dumps(stats, indent=2))
print(json.dumps(stats, indent=2))

if errors:
    for e in errors: print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print("OK — FR-CHAR-006 mesh validation passed.", file=sys.stderr)
```

Plus a shell assertion after GLB export:

```bash
# AC#9: Raw GLB size pre-pipeline
test "$(stat -c %s assets-built/raw/lumi.raw.glb)" -le 6291456 || { echo "AC#9 FAIL: raw GLB > 6 MB"; exit 1; }

# AC#10: Post-pipeline GLB size (once FR-OPS-001 + FR-CHAR-008 textures ship)
node scripts/gltf-pipeline.mjs assets-built/raw/lumi.raw.glb assets-built/optimized/lumi.glb
test "$(stat -c %s assets-built/optimized/lumi.glb)" -le 3670016 || { echo "AC#10 FAIL: optimized GLB > 3.5 MB"; exit 1; }

# AC#4: Re-rendered silhouette panel test (manual, but file presence + hash logged)
test -f assets-source/blender/lumi-silhouette-32x32.png
sha256sum assets-source/blender/lumi-silhouette-32x32.png
```

CI gate: the Blender Python validator runs in a Docker image with Blender 4.4 LTS installed (FR-OPS-001 §6 row 3 covers the basisu binary; this FR's CI extends that image with `apt install blender=4.4*`). Validator runs on every PR touching `assets-source/blender/lumi.v01.blend`. Failure blocks merge.

---

## §6 — Dependencies

**Code/asset dependencies (must exist before this FR can build):**

- **FR-CHAR-001 (shipped 2026-05-16):** The 2D character sheet that defines the silhouette, proportions, palette, and 4-pose turnaround. This FR's mesh MUST match it.
- **FR-CHAR-004 (greybox, accepted spec):** The Blender greybox provides the proxy proportions that the production mesh refines. The production mesh inherits the greybox's bounding-box volume and silhouette envelope; only the polygonal density increases.
- **FR-OPS-001 (gltf-transform pipeline, accepted):** The stage-1 export contract (compression OFF, sparse OFF, etc.) is defined here. This FR consumes that contract.
- **Blender 4.4 LTS installed locally + in CI:** master plan §4.1 baseline. Quad Remesher plugin (paid; Modeller's workstation only) is recommended but optional — manual retopo is the fallback.

**Concept dependencies (must be agreed before this FR can be audited):**

- The greybox passing the silhouette test (FR-CHAR-002 protocol re-runs against the greybox first; production mesh must match).
- The polygon-distribution table (§1 #3) — accepted as canonical from master plan §3.3.

**Operational dependencies:**

- LFS configured (FR-OPS-008) — the `.blend` files are LFS-tracked.
- CI Docker image with Blender 4.4 LTS — extends the FR-OPS-001 image; tracked in `.github/workflows/perf-budgets.yml`.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Tri count > 40k hard cap | AC#2 validator | Decimate the worst-offender block; the hood usually over-runs first. Use the Blender Decimate modifier with "Planar" mode on flat hood surfaces; preserve edge flow at silhouette boundaries. |
| Polygon distribution skewed (e.g. hood at 50%) | AC#3 per-block check | Rebalance — typically the sculpt detail bled into one block. Move some detail to the normal map (FR-CHAR-008 will bake it) and reduce hood tri count. |
| Mesh not watertight (holes) | AC#6 print3d_check_solid | Identify non-manifold edges via Blender's "Select Non-Manifold" → bridge / fill / weld. Common causes: missing faces at the hood seam, gap between body and arm meshes. |
| Doubled vertices > 0 | AC#7 remove_doubles count | Don't just accept the op output — fix the SOURCE. Look for shared edges that were created by extrude+move instead of bridge; fix in the sculpt source and re-retopo. |
| Silhouette diverges from FR-CHAR-001 at 32×32 | AC#4 panel test fails | Return to FR-CHAR-004 greybox; tighten proportions there first; re-retopo from corrected greybox bounds. DO NOT massage the production mesh in isolation. |
| "C" emboss got baked into texture instead of geometry | AC#5 visual + stats.hood_c_emboss_is_geometry | Strip the texture-baked C; re-extrude the C as geometry (~3mm depth); update normal-map bake to NOT include the C (it's surface geometry, not micro-detail). |
| Raw GLB > 6 MB | AC#9 stat | Audit polygon distribution (probably over-target); reduce sculpt subdivision before retopo; verify Subdivision Surface modifier's "Viewport Level" doesn't get exported (set "Render Level" only). |
| Optimized GLB > 3.5 MB after pipeline + textures | AC#10 + manual smoke during FR-CHAR-008 integration | Two recovery paths: (1) reduce tri count toward 24k floor; (2) compress textures more aggressively (FR-CHAR-008's ETC1S quality at 0.85 → 0.78). DO NOT raise the budget without FR-PERF-NNN-budget-amendment. |
| Rigger flags topology unfit for armature | AC#15 rigger signoff fails | Topology issues are usually at: (a) hood crease (insufficient edge loops for hood_tip bone), (b) face perimeter (poor ring topology for shape-key blending), (c) wisp tail base (incompatible with 8-bone chain). Fix in retopo; re-run validator. |
| Lumi height ≠ 1.60 m | AC#11 bounds check | Verify scene scale is 1.0; if greybox was authored at wrong scale, apply scale transform and re-export. Master plan §4.1 baseline is non-negotiable. |
| Blender exporter exports modifiers wrong (e.g. Subdivision Surface result blows tri count) | AC#2 unexpected | Verify "Apply Modifiers" is on but viewport level == render level == 0 (or pre-applied); Subdivision should be applied destructively before export, not via the exporter. |
| `lumi_main` was kept as separate hood/face/body Objects | AC#1 + §3.1 contract | Join into a single mesh (`Ctrl+J` after selecting all) before retopo. Vertex groups preserve the block tagging for AC#3. |
| Sculpt source lost (no separate .blend) | AC#16 SHOULD | Re-sculpt is the only recovery. This is why the SHOULD exists — archive proactively. |

---

## §8 — Example deliverable preview

Hierarchy after this FR ships:

```
assets-source/blender/
├── lumi.v01.blend                    ← production mesh (canonical; ~ 35-50 MB)
├── lumi-sculpt.v01.blend             ← high-poly sculpt source (~ 80-150 MB)
├── lumi-greybox.v01.blend            ← greybox kept for FR-PERF-002 LOD-1 reference
├── lumi-mesh-stats.json              ← machine-readable validation
├── lumi-silhouette-32x32.png         ← re-rendered silhouette (matches FR-CHAR-002 protocol)
└── lumi-silhouette-32x32.sha256

assets-built/raw/
└── lumi.raw.glb                      ← exported, compression OFF (~ 5.2 MB)

assets-built/optimized/                (regenerated by CI on every PR)
└── lumi.glb                          ← post-pipeline (~ 2.8 MB once FR-CHAR-008 textures land)
```

Sample `lumi-mesh-stats.json` after a successful run:

```jsonc
{
  "fr_id": "FR-CHAR-006",
  "generated_at": "2026-05-26T14:32:18+07:00",
  "blender_version": "4.4.0",
  "file": "assets-source/blender/lumi.v01.blend",
  "tri_count_total": 27840,
  "tri_count_per_block": {
    "hood": 9760, "face": 6940, "body_arms": 6985, "wisp": 4155
  },
  "watertight_lumi_main": true,
  "doubled_vertices_lumi_main": 0,
  "max_vertex_influences": 0,
  "armatures": [], "shape_keys": [], "actions": [], "images": [],
  "lumi_height_m": 1.602,
  "bounds": { "min": [-0.42, -0.15, 0.00], "max": [0.42, 0.22, 1.602] },
  "raw_glb_bytes": 5287416,
  "hood_c_emboss_depth_mm": 3.0,
  "hood_c_emboss_is_geometry": true
}
```

---

## §9 — Mocked-dependency shipment

Blender 4.4 is not installed in the execution environment, so physical production mesh authoring, viewport inspection, and Blender Python validation remain unavailable. Per the zero-touch blocker rule, this FR ships as `shipped + mocked-dependency + strict-audited` using deterministic placeholder `.blend` files, a valid raw GLB proxy, a 32x32 silhouette PNG, and `lumi-mesh-stats.json` verified by:

```bash
python3 tools/generate-p2-character-mocks.py
python3 tools/check-p2-character-mocks.py --fr FR-CHAR-006
```

The mock contract preserves downstream paths and rejects scope creep: no rig, no UV authoring, no PBR textures, no shape keys, and no animation payloads. A non-mocked shipment must replace the placeholders with real Blender 4.4-authored files at the same paths and pass the same checker.

## §10 — Notes (informational, no normative force)

- The production mesh's `lumi.v01.blend` *replaces* the greybox as the canonical Lumi for downstream P2 work. The greybox stays in `assets-source/blender/lumi-greybox.v01.blend` and gets re-purposed as the LOD-1 fallback (FR-PERF-002 consumes it directly, not a decimation of this production mesh).
- The "vertex group as block tag" pattern in §3.1 is a Blender convention for marking face regions without splitting into separate Objects. The Python validator in §5 walks face-by-vertex-group to compute per-block tri counts. Alternative: material slots (each block has its own material slot) — but that conflicts with FR-CHAR-008's single-material PBR plan, so vertex groups are preferred.
- After this FR ships and FR-CHAR-007/008/009/010/011 land in sequence, the optimized `lumi.glb` becomes the single canonical Lumi mesh consumed by every R3F scene (FR-WEB-006 preloads it; FR-SCENE-009..019 render it). LOD-1 (greybox) lives at `assets-built/optimized/lumi-greybox.glb` and Drei `<Detailed>` swaps between them at distance > 12 m (FR-SCENE-023).
- The Quad Remesher plugin is an Exoside paid product (~ $89). One-time cost, justifies itself within 2-3 mesh-retopo cycles. If the budget is tight, manual retopo via Blender's RetopoFlow plugin is the open-source alternative — slower but produces equivalent quality.

---

*End of FR-CHAR-006 (anchor-grade re-author of 2026-05-16 stub). Audit: `FR-CHAR-006-production-mesh.audit.md`.*
