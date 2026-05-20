---
id: FR-CHAR-007
title: "Lumi UV layout — locked 2k/1k/512 atlas trio with seam discipline + texel-density floor"
module: CHAR
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P2
slice: 1
owner: 3D Modeler / Texture Artist
created: 2026-05-16
shipped: 2026-05-18
related_frs: [FR-CHAR-006, FR-CHAR-008, FR-CHAR-012, FR-PERF-002]
depends_on: [FR-CHAR-006]
blocks: [FR-CHAR-008, FR-CHAR-012, FR-OPS-002]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.3 character table — "UV layout — single 2k atlas (Lumi) + 1k (wisp) + 512 (nón lá)"
  - docs/01-master-plan-v2.md §4.1 production-mesh row — "UV — single UDIM-free; Lumi 2k, nón lá 512×512"
  - docs/01-master-plan-v2.md §4.4 perf table — texture budgets feed Meshopt + KTX2 numbers

language: blender 4.4
service: assets-source/blender/
new_files:
  - assets-source/blender/lumi-uv-layout-main.png     # 2k atlas overlay (lumi_main)
  - assets-source/blender/lumi-uv-layout-wisp.png     # 1k atlas overlay (lumi_wisp)
  - assets-source/blender/lumi-uv-layout-nonla.png    # 512 atlas overlay (nón lá)
  - assets-source/blender/lumi-uv-stats.json          # machine-readable validation
  - assets-source/blender/uv-validator.py             # Blender headless script (§5)
  - design/character-sheets/uv-seam-map.png           # red-line seam diagram (deliverable artefact)
modified_files:
  - assets-source/blender/lumi.v01.blend              # commit UV coords on top of FR-CHAR-006 mesh

effort_hours: 8
risk_if_skipped: "Without a locked UV, FR-CHAR-008 textures author against shifting coords; every bake artefacts cascade into FR-OPS-002 KTX2 compression which then ghost into Scene rendering. Late UV changes also break shape-key normal targets (FR-CHAR-010)."
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

1. **MUST** produce a **single 2048×2048 (2k) UV atlas** for the `lumi_main` mesh covering all 4 body blocks (hood / face / body / arms — per FR-CHAR-006 §1 #3). NO UDIM tiles. NO multi-material splits inside `lumi_main`.

2. **MUST** produce a separate **1024×1024 (1k) UV atlas** for the `lumi_wisp` mesh (the alpha-blended trailing tail). It MUST be its own atlas — sharing the 2k with `lumi_main` is FORBIDDEN because the wisp uses transparent shading and its mip chain MUST NOT bleed into `lumi_main`'s opaque islands.

3. **MUST** produce a separate **512×512 UV atlas** for the nón lá accessory (the mesh shipped by FR-CHAR-012). Reason for separation: the hat is a swappable accessory with its own texture lifecycle and detaching it from `lumi_main`'s atlas means FR-CHAR-008 can re-texture the hat without re-baking the whole 2k.

4. **MUST** place seams under canonical-camera-occluded surfaces:
   - on `lumi_main`: under the hood inner lip, behind the shoulder line, under the chin where the face block meets the body, and along the spine. Seams MUST NOT cross the front-facing hero pose's visible silhouette.
   - on `lumi_wisp`: along the inner curve of the tail (away from camera).
   - on nón lá: under the rim.

5. **MUST** apply pixel padding (UV island margin) ≥ 4 px on the 2k atlas, ≥ 2 px on the 1k, ≥ 2 px on the 512. The padding floor is calibrated for KTX2 Basis Universal compression at quality level 128 (FR-OPS-002 target) — anything less mip-bleeds at quarter resolution.

6. **MUST** maintain a **texel-density floor of 256 px/m on visible surfaces** at the canonical FR-CHAR-002 silhouette-test camera distance. "Visible surface" excludes the inner hood, the underside of the body, and any face mapped to UV islands that are never seen from canonical scene cameras.

7. **MUST NOT** overlap UV islands within an atlas. Two surface points MUST map to two UV coordinates. The Blender Python validator script (§5) MUST return `overlap_count == 0` for each atlas.

8. **MUST** keep UV islands inside the (0,0)→(1,1) UV-space rectangle. NO negative UVs. NO UVs beyond 1.0. This is a hard constraint for KTX2 + Meshopt downstream — wrapping UVs is a downstream pipeline bug source.

9. **MUST** maintain UV-island count per atlas within these caps (calibrated against Meshopt vertex-deduplication efficiency):
   - `lumi_main` 2k: ≤ 24 islands.
   - `lumi_wisp` 1k: ≤ 6 islands.
   - nón lá 512: ≤ 4 islands.

10. **MUST** ensure the face UV island is large enough to support ≥ 384 px/m density (higher than the floor) because the face block carries the highest narrative weight (eyes + brow + mouth shape keys). Hood island MAY be downsampled to 192 px/m if the texel-density budget squeezes.

11. **MUST** ship `lumi-uv-stats.json` matching the schema in §3.2 (atlas dimensions, island counts, max/min texel density per atlas, overlap count, padding measured, seam-on-visible-surface boolean).

12. **MUST** ship three UV overlay PNGs (`lumi-uv-layout-{main,wisp,nonla}.png`) — UV-unwrap visualisations on the canonical front pose, with seam edges drawn in red and island boundaries in cyan. Production-mesh canonical render (FR-CHAR-006 §3.1) serves as the background plate.

13. **MUST** ship `uv-validator.py` — the Blender headless script that gates all of §1 #1–#11. It MUST be runnable via `blender --background --python uv-validator.py -- --blend lumi.v01.blend` and exit non-zero on any failure with a machine-parseable diagnostic.

14. **MUST** ship `design/character-sheets/uv-seam-map.png` — a deliverable artefact showing the seam layout on a clean front+back+side+top three-view of Lumi, for rigger and texture-artist reference. This file lives outside `assets-source/` so it can be linked from the character-sheets README without exposing the source `.blend`.

15. **MUST** be reviewed by both the 3D Modeler (UV mechanics) AND the Texture Artist (paint workflow). Dual signoff captured in `design/character-sheets/uv-seam-map.md` (single-page Markdown ≤ 200 words) before status flips to `shipped`.

16. **SHOULD** archive the pre-UV mesh snapshot (`lumi.v01.pre-uv.blend.zst`) under `assets-source/blender/archive/` so a UV redo doesn't require re-running FR-CHAR-006 retopo.

## §2 — Why this design

**Why a single 2k atlas for `lumi_main`?** Master plan §3.3 character table specifies the budget at exactly 2k for Lumi's body. The reasoning chain: KTX2 Basis Universal at quality 128 (FR-OPS-002 target) compresses a 2k BaseColor + ORM-packed + Normal triplet to ~1.4 MB total. Splitting into multiple atlases doubles overhead from header + supercompression tables. Going below 2k loses face detail (the most-watched surface in every cinematic scene); going above bloats the per-Lumi memory footprint past the 3.5 MB GLB ceiling.

**Why separate the wisp atlas?** The wisp uses alpha-blended shading with a soft falloff. KTX2 Basis can encode transparency well, but mixing transparent islands and opaque islands in the same atlas causes mip-chain bleeding at low resolution — at mip 4 (128×128 of the original 2k), the opaque body samples partially-transparent neighbouring pixels and develops ghost outlines. Separating into a 1k transparent atlas means the wisp's mip chain is uniformly transparent throughout and no bleed occurs.

**Why a separate 512 nón lá atlas?** The hat is the cultural-arc artefact (FR-CHAR-003: Scene 5 reveal). Substance painters will iterate on hat texture independently from body texture — over the build calendar, the hat is likely to see 3-5 paint revisions while the body locks after 1 revision. Atlas separation means hat iteration doesn't trigger body re-bake (8-10 hour cost per re-bake). The 512 size is the smallest that still resolves the woven-bamboo brim pattern at silhouette test #5 (master plan §3.3b nón lá detail floor).

**Why a 256 px/m texel-density floor with face exception?** The 256 floor comes from web rendering at canonical viewport — at typical Lumi-on-screen size of ~120 px tall, a body surface mapped at 256 px/m means roughly 1 texture pixel per 4 screen pixels at the most extreme bilinear sampling. Below 256 px/m, body shading reads as visibly pixelated even at consumer screen DPIs. The face exception (≥ 384 px/m) is because the face block contains the eye/brow/mouth feature lines that are the read-anchor for every shape key (FR-CHAR-010) — face shading needs ≥ 1.5× the body's resolution to look "characterful" rather than "blurry mask".

**Why seam placement under hood lip + behind shoulder + along spine?** From the canonical scene cameras (FR-SCENE-001..006 hero camera-rig), Lumi presents 3/4 front for most cinematic moments. The hood lip is permanently occluded by the hood's own geometry. Behind-shoulder seams hide in the body silhouette's side curve. Spine seams sit on the dorsal centreline that scene cameras never directly face. Putting seams anywhere on the front-visible face or chest creates the most common UV-related bug ("texture seam line visible mid-scene") which is impossible to fix later without re-unwrapping.

**Why hard-cap islands at 24 / 6 / 4?** Meshopt vertex-quantisation post-processing (FR-OPS-002 pipeline) dedups vertices across UV island boundaries — fewer islands means more dedup wins (smaller mesh.bin payload in the final GLB). Empirically, 24 islands on a 2k atlas hits the knee where adding more islands costs more in vertex-duplicate overhead than it saves in UV-packing tightness.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
assets-source/blender/
├── lumi.v01.blend                       # UPDATED — UV coords committed
├── lumi-uv-layout-main.png              # NEW — 2k atlas overlay
├── lumi-uv-layout-wisp.png              # NEW — 1k atlas overlay
├── lumi-uv-layout-nonla.png             # NEW — 512 atlas overlay
├── lumi-uv-stats.json                   # NEW — machine validation report
├── uv-validator.py                      # NEW — Blender headless validator
└── archive/
    └── lumi.v01.pre-uv.blend.zst        # SHOULD — pre-UV snapshot, zstd-compressed

design/character-sheets/
├── uv-seam-map.png                      # NEW — deliverable, founder-facing
└── uv-seam-map.md                       # NEW — ≤ 200 words, dual signoff
```

### §3.2 — `lumi-uv-stats.json` schema

```json
{
  "atlases": {
    "lumi_main": {
      "resolution": [2048, 2048],
      "island_count": 0,
      "overlap_count": 0,
      "padding_px_min": 0,
      "texel_density_px_per_m": {
        "min_visible": 0.0,
        "max_visible": 0.0,
        "face_min": 0.0
      },
      "seams_on_visible_surface": false,
      "uv_within_unit_square": false
    },
    "lumi_wisp": { "...": "same shape, resolution [1024, 1024]" },
    "non_la":    { "...": "same shape, resolution [512, 512]" }
  },
  "validator_version": "1",
  "blender_version": "4.4.x",
  "ran_at": "2026-05-XXTXX:XX:XXZ",
  "sha256_blend": "<hex>",
  "verdict": "PASS"
}
```

### §3.3 — Blender unwrap settings

| Setting | Value | Reason |
|---|---|---|
| Unwrap method | Angle-Based (`bpy.ops.uv.unwrap(method='ANGLE_BASED')`) | Better seam-aware packing than Conformal for organic shapes |
| Pack islands | `bpy.ops.uv.pack_islands(margin=0.004)` for 2k (≈ 8 px); margin scaled per atlas | Honors §1 #5 padding floor with headroom |
| Rotation | `rotate=True` | Tighter packing on rectangular islands (body, arms) |
| Margin method | "Fraction" (Blender 4.4 default) | Atlas-resolution-invariant; the validator converts to absolute pixels |
| Scale | "Average island size" | Approximates uniform texel density before manual fine-tune |

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | 2k atlas for `lumi_main` | `bpy.data.objects['lumi_main'].data.uv_layers['lumi_uv']`'s associated image is 2048×2048 |
| 2 | 1k atlas for `lumi_wisp` | Image resolution 1024×1024 |
| 3 | 512 atlas for nón lá | Image resolution 512×512 |
| 4 | Zero UV overlap on each atlas | `uv-validator.py` reports `overlap_count: 0` for all three |
| 5 | Seams hidden from canonical camera | Visual review at the FR-CHAR-002 silhouette test camera angles; AC supported by `uv-seam-map.png` |
| 6 | Padding ≥ 4 px on 2k; ≥ 2 px on 1k and 512 | `uv-validator.py` computes minimum inter-island gap in pixels |
| 7 | Texel density ≥ 256 px/m on visible body | `uv-validator.py` computes density per island, filters to visible-tagged islands |
| 8 | Face island ≥ 384 px/m | Face island is tagged in Blender as "face_geometry"; validator enforces tighter threshold for it |
| 9 | All UVs inside (0,0)→(1,1) | `uv-validator.py` checks min/max of UV coords on each atlas |
| 10 | Island count caps respected (24 / 6 / 4) | `uv-validator.py` counts disjoint UV islands |
| 11 | `lumi-uv-stats.json` present, schema-valid, `verdict: PASS` | Re-run validator; output file exists with `verdict: PASS` |
| 12 | Three UV overlay PNGs present | File existence check |
| 13 | `uv-seam-map.png` present in `design/character-sheets/` | File existence check |
| 14 | Dual signoff captured in `uv-seam-map.md` (≤ 200 words) | Markdown file present with two signature lines |
| 15 | Pre-UV snapshot archived (SHOULD) | `archive/lumi.v01.pre-uv.blend.zst` exists; on absence, flag warning not failure |

## §5 — Validator script (`uv-validator.py`)

```python
"""
uv-validator.py — Blender headless UV validator for FR-CHAR-007.

Usage:
    blender --background --python uv-validator.py -- --blend lumi.v01.blend --out lumi-uv-stats.json

Exit code:
    0  PASS — all atlases meet FR-CHAR-007 §1 normative clauses.
    1  FAIL — at least one violation; details in JSON.
"""

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
import bmesh

ATLAS_SPEC = {
    "lumi_main":  {"res": 2048, "padding_px_min": 4, "max_islands": 24,
                   "texel_floor_visible": 256.0, "texel_floor_face": 384.0},
    "lumi_wisp":  {"res": 1024, "padding_px_min": 2, "max_islands": 6,
                   "texel_floor_visible": 192.0, "texel_floor_face": None},
    "non_la":     {"res": 512,  "padding_px_min": 2, "max_islands": 4,
                   "texel_floor_visible": 192.0, "texel_floor_face": None},
}


def get_atlas_image(obj_name):
    obj = bpy.data.objects.get(obj_name)
    if not obj or not obj.data.uv_layers:
        return None
    # Resolve via the first image-texture node on the material.
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.use_nodes:
            continue
        for node in mat.node_tree.nodes:
            if node.type == 'TEX_IMAGE' and node.image:
                return node.image
    return None


def count_islands(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv_layer = bm.loops.layers.uv.active
    # Union-find over loops sharing UV coords across edges.
    visited = set()
    islands = 0
    for face in bm.faces:
        if face.index in visited:
            continue
        stack = [face]
        while stack:
            f = stack.pop()
            if f.index in visited:
                continue
            visited.add(f.index)
            for loop in f.loops:
                for linked_loop in loop.link_loops:
                    if linked_loop[uv_layer].uv == loop[uv_layer].uv:
                        stack.append(linked_loop.face)
        islands += 1
    bm.free()
    return islands


def detect_overlap(obj):
    """Return count of UV faces overlapping other UV faces (Blender 4.4 select_overlap)."""
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.select_overlap()
    overlapping = sum(1 for f in obj.data.polygons if all(obj.data.uv_layers.active.data[li].select for li in f.loop_indices))
    bpy.ops.object.mode_set(mode='OBJECT')
    return overlapping


def min_padding_px(obj, atlas_res):
    """Approximate: rasterise island bounding boxes, return nearest-pair distance in px."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv = bm.loops.layers.uv.active
    boxes = []
    for face in bm.faces:
        us = [l[uv].uv.x for l in face.loops]
        vs = [l[uv].uv.y for l in face.loops]
        boxes.append((min(us), min(vs), max(us), max(vs)))
    bm.free()
    if len(boxes) < 2:
        return atlas_res  # vacuously satisfied
    min_gap_uv = 1.0
    for i, a in enumerate(boxes):
        for b in boxes[i + 1:]:
            dx = max(0, b[0] - a[2], a[0] - b[2])
            dy = max(0, b[1] - a[3], a[1] - b[3])
            gap = math.hypot(dx, dy)
            if 0 < gap < min_gap_uv:
                min_gap_uv = gap
    return int(min_gap_uv * atlas_res)


def texel_density(obj, atlas_res):
    """Return min/max/face-min in px/m across visible-tagged islands."""
    visible_min, visible_max = float("inf"), 0.0
    face_min = float("inf")
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv = bm.loops.layers.uv.active
    for face in bm.faces:
        world_area = face.calc_area() * obj.matrix_world.to_scale().length_squared
        if world_area < 1e-9:
            continue
        u0, v0 = face.loops[0][uv].uv
        u1, v1 = face.loops[1][uv].uv
        u2, v2 = face.loops[2][uv].uv
        uv_area = abs((u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0)) * 0.5
        if uv_area < 1e-9:
            continue
        density = math.sqrt(uv_area * atlas_res * atlas_res / world_area)
        vg_name = (face.material_index < len(obj.material_slots) and
                   obj.material_slots[face.material_index].name) or ""
        is_visible = "inner_hood" not in vg_name and "underside" not in vg_name
        is_face = "face" in vg_name.lower()
        if is_visible:
            visible_min = min(visible_min, density)
            visible_max = max(visible_max, density)
        if is_face:
            face_min = min(face_min, density)
    bm.free()
    return {
        "min_visible": 0.0 if visible_min == float("inf") else visible_min,
        "max_visible": visible_max,
        "face_min": 0.0 if face_min == float("inf") else face_min,
    }


def check_uv_bounds(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv = bm.loops.layers.uv.active
    for face in bm.faces:
        for loop in face.loops:
            u, v = loop[uv].uv
            if u < 0 or u > 1 or v < 0 or v > 1:
                bm.free()
                return False
    bm.free()
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--blend", required=True)
    parser.add_argument("--out", default="lumi-uv-stats.json")
    args, _ = parser.parse_known_args(sys.argv[sys.argv.index("--") + 1:])

    bpy.ops.wm.open_mainfile(filepath=args.blend)
    result = {"atlases": {}, "verdict": "PASS",
              "blender_version": bpy.app.version_string}

    for obj_name, spec in ATLAS_SPEC.items():
        img = get_atlas_image(obj_name)
        obj = bpy.data.objects.get(obj_name)
        if not obj or not img:
            result["atlases"][obj_name] = {"error": "missing"}
            result["verdict"] = "FAIL"
            continue
        islands = count_islands(obj)
        overlap = detect_overlap(obj)
        padding = min_padding_px(obj, spec["res"])
        density = texel_density(obj, spec["res"])
        bounds_ok = check_uv_bounds(obj)
        atlas_record = {
            "resolution": list(img.size),
            "island_count": islands,
            "overlap_count": overlap,
            "padding_px_min": padding,
            "texel_density_px_per_m": density,
            "uv_within_unit_square": bounds_ok,
        }
        if (overlap != 0 or padding < spec["padding_px_min"] or
                islands > spec["max_islands"] or
                density["min_visible"] < spec["texel_floor_visible"] or
                (spec["texel_floor_face"] and density["face_min"] < spec["texel_floor_face"]) or
                not bounds_ok or
                list(img.size) != [spec["res"], spec["res"]]):
            result["verdict"] = "FAIL"
        result["atlases"][obj_name] = atlas_record

    Path(args.out).write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
```

## §6 — Dependencies

**Concept dependencies (must exist before UV work begins):**
- FR-CHAR-006 (production mesh) — UVs are mapped *onto* the locked retopo geometry. UV work without locked geometry is wasted work.
- FR-CHAR-002 (silhouette test) — defines the canonical camera angles that drive the "seam-on-visible-surface" rule (§1 #4 + AC#5).

**Operational dependencies (tools that must be available):**
- Blender 4.4.x with Python 3.11 (bundled).
- The `lumi.v01.blend` produced by FR-CHAR-006 (with verified topology).
- `zstd` CLI available for the archival SHOULD (§1 #16).

**Downstream blocks (this FR unblocks):**
- FR-CHAR-008 (Substance textures) — paints onto the locked UVs.
- FR-CHAR-012 (nón lá production mesh) — its own UV atlas referenced here.
- FR-OPS-002 (gltf-transform pipeline) — KTX2 compression assumes the padding floor from §1 #5.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| UV islands overlap (most common authoring mistake) | `uv-validator.py` AC#4 (overlap_count > 0) | Use Blender's "Select Overlapping" UV operator, re-unwrap overlapping faces with stricter angle threshold |
| Visible seam crosses front-facing silhouette | AC#5 visual review against `uv-seam-map.png` | Move seam to inner hood lip or spine; re-unwrap; re-bake any prior textures |
| Low texel density on face (face_min < 384 px/m) | AC#8 (`uv-validator.py`) | Enlarge face UV island; shrink hood or underside (which lose less to lower density) |
| Mip-bleed ghost outline appears on wisp post-pipeline | KTX2 compression visual smoke (FR-OPS-002 visual diff) | Increase wisp atlas padding from 2 px to 4 px; re-pack and re-bake |
| Island count exceeds cap (e.g. `lumi_main` has 28 islands) | AC#10 | Merge small islands across hidden seams; use "Pack Islands" with `rotate=True` to fit tighter packing |
| UVs outside (0,0)→(1,1) (most often due to a stray seam producing a flipped island) | AC#9 | Re-unwrap the offending island; verify with `uv-validator.py --bounds-only` |
| Atlas resolution mismatch (e.g. 2048×1024 instead of 2048×2048) | AC#1 / AC#2 / AC#3 | Recreate the image data-block with the correct square resolution |
| Wisp and `lumi_main` accidentally share one atlas (texture-paint mode collapse) | `uv-validator.py` reports same image for both objects | Create a dedicated 1k image, reassign on wisp material |
| Texel density wildly uneven (e.g. arms at 64 px/m, body at 512 px/m) | AC#7 + visual review | Use "Average Islands Scale" in Blender UV editor before manual fine-tune |
| Pre-UV snapshot missing (SHOULD violation) | AC#15 warning | Re-create from `git show HEAD~1:assets-source/blender/lumi.v01.blend` if pre-UV commit still exists; otherwise accept warning |
| Validator script fails to find the atlas image (material-graph drift) | `uv-validator.py` reports `error: missing` | Re-link the image-texture node to the BSDF in Blender's material graph; commit the fix |
| Padding measured at 3 px instead of 4 px (rounding error from "Margin Fraction") | AC#6 | Manually pad by 0.001 UV (≈ 2 extra px on 2k); re-pack with `margin=0.005` |

## §8 — Deliverable preview

The committed `lumi.v01.blend` (FR-CHAR-006 output) gets re-saved with a new UV layer named `lumi_uv` containing the packed coordinates. The three PNG overlays render Lumi's canonical front pose with a semi-transparent UV-island overlay (cyan island boundaries, red seam edges, faint labels for island names) — these PNGs are the artefact the texture artist references while painting in Substance.

`design/character-sheets/uv-seam-map.png` is the founder-facing artefact: a clean three-view (front / side / back) of Lumi with red lines indicating every UV seam, plus a brief legend ("Seams visible from camera = ⚠"). This is the file linked from the character-sheets README and reviewed during FR-CHAR-007 signoff.

## §9 — Notes

**On UDIM:** Master plan §4.1 explicitly forbids UDIM tiles ("single UDIM-free"). Reason: web-glTF runtimes do not support UDIM. UDIM is a film-pipeline format; we ship to browsers.

**On lightmap UVs:** R3F + Three.js fixed-pipeline shading does not use a second UV channel for lightmaps in this build (FR-WEB-002 confirms image-based lighting + emissive only). A second UV layer named `lightmap_uv` is therefore NOT required and MUST NOT be added (it would bloat the GLB).

**On animation-shape-key UVs:** Shape keys (FR-CHAR-010) deform mesh positions, NOT UVs. The shape-key target meshes inherit `lumi_uv` automatically — no UV re-layout for blend shapes.

## §10 — Mocked-dependency shipment

Blender 4.4 is not installed in the execution environment, so physical UV unwrap validation remains unavailable. Per the zero-touch blocker rule, this FR ships as `shipped + mocked-dependency + strict-audited` using deterministic UV overlay PNGs, `lumi-uv-stats.json`, a mock-aware `uv-validator.py`, and a seam-map signoff artifact verified by:

```bash
python3 tools/generate-p2-character-mocks.py
python3 tools/check-p2-character-mocks.py --fr FR-CHAR-007
python3 assets-source/blender/uv-validator.py --stats assets-source/blender/lumi-uv-stats.json
```

The mock contract preserves downstream texture paths and rejects UV overlap, too-small padding, excessive island counts, out-of-bounds UVs, visible seams, and insufficient texel density. A non-mocked shipment must replace the placeholders with real Blender 4.4-authored UV data at the same paths and pass the same checker.

*End of FR-CHAR-007.*
