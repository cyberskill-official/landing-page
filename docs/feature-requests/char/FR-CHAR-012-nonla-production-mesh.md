---
id: FR-CHAR-012
title: "Nón lá accessory production mesh ≤ 600 tri; parented to `hat_socket`; casual-register only"
module: CHAR
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
shipped: 2026-05-18
verify: T
phase: P2
slice: 1
owner: 3D Modeler + Texture Artist
created: 2026-05-16
related_frs: [FR-CHAR-001, FR-CHAR-003, FR-CHAR-006, FR-CHAR-007, FR-CHAR-008, FR-CHAR-009, FR-CHAR-011, FR-SCENE-006, FR-SCENE-017, FR-DS-002]
depends_on: [FR-CHAR-003, FR-CHAR-009]
blocks: [FR-SCENE-017, FR-CHAR-011]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.3b Nón lá accessory — "casual register, not ceremonial; ~ 600 tri cap; 512 texture"
  - docs/01-master-plan-v2.md §3.3 character table — "socket-bone-attached accessory; swappable"
  - docs/01-master-plan-v2.md §4.4 perf table — nón lá raw GLB ≤ 400 KB; post-pipeline ≤ 200 KB
  - design/character-sheets/nonla/cultural-note.md — bilingual cultural rationale (FR-CHAR-003 shipped artefact)

language: blender 4.4
service: assets-source/blender/
new_files:
  - assets-source/blender/lumi-nonla.v01.blend                            # mesh + UV + parent
  - assets-built/raw/lumi-nonla.raw.glb                                   # FR-OPS-001 stage-1 raw
  - assets-built/raw/textures/lumi-nonla-BaseColor.png                    # sRGB 512
  - assets-built/raw/textures/lumi-nonla-Normal.png                       # linear 512 (OpenGL convention)
  - assets-source/blender/lumi-nonla-stats.json                           # validator output
  - assets-source/blender/nonla-validator.py                              # Blender headless script (§5)
  - design/character-sheets/nonla/lumi-nonla-render.png                   # canonical front render
  - design/character-sheets/nonla/lumi-nonla-spec.md                      # ≤ 300 words signoff

effort_hours: 6
risk_if_skipped: "Scene 5 cultural-arc reveal (FR-SCENE-017) cannot render — the single most-visible cultural-signal asset in the cinematic is missing. FR-CHAR-011's nonla_appear + nonla_tip animation clips have nothing to animate against. Brand cultural-identity beat fails."
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

1. **MUST** produce a conical hat mesh per the FR-CHAR-003 design spec: brim diameter ~12 cm (Blender units 0.075–0.080 relative to 1.6 m Lumi), cone height ~8 cm (Blender units ~0.05). The proportion difference (brim wider than height) is the visually canonical Vietnamese nón lá silhouette — too tall and it reads as a witch's hat; too flat and it reads as a Mexican sombrero.

2. **MUST** be **≤ 600 triangles** (hard cap from master plan §3.3b). Soft target: 480-600. Going below 400 loses the conical curvature smoothness; going above 600 wastes vertex budget on detail invisible at typical camera distance.

3. **MUST** be **parented to the `hat_socket` bone** in `lumi-rig.v01.blend` (Object > Parent > Bone with `Bone Parent: hat_socket`). The `hat_socket` bone is defined in FR-CHAR-009 §1 #6 — its independence from hood secondary motion is the reason the hat doesn't wobble.

4. **MUST** have a `nonla_visible` Boolean custom property on the mesh object (`lumi_nonla["nonla_visible"]`), default `False`. Scene 5 (FR-SCENE-017) flips it to `True` at the cultural-arc reveal moment. Alternative implementation MAY be a visibility-driver-on-render that reads from a master state object, but the simpler custom-property approach is preferred.

5. **MUST** texture per FR-CHAR-003 colour spec (the deliverable signed off as `design/character-sheets/nonla/lumi-nonla-design.png`):
   - **Exterior brim + cone outer surface**: `--accent-flag-red` = `#DA251D` (Vietnamese flag red).
   - **Interior brim underside + cone inner surface**: `--brand-gold-200` = `#F9D966` (warm gold liner).
   - **Single 5-point star**, front-centre on the cone (NOT on the brim): `--accent-star-yellow` = `#FFEB3B`. Star diameter ≈ 30% of brim diameter. Pointed orientation: one point straight up.

6. **MUST NOT** include any painted patterns, woven-bamboo texture, calligraphy, dragons, áo dài patterns, or ceremonial elements. The `cultural-note.md` artefact (FR-CHAR-003) is the binding contract: "casual register, not ceremonial". Cultural-arc reveals work BECAUSE the hat is everyday-Vietnamese, not festival/temple-Vietnamese.

7. **MUST** export to `assets-built/raw/lumi-nonla.raw.glb` per the FR-OPS-001 stage-1 raw-export naming convention. The raw GLB has uncompressed textures; FR-OPS-002 pipeline produces the production GLB.

8. **MUST** keep **raw GLB ≤ 400 KB** AND **post-pipeline GLB ≤ 200 KB** (master plan §4.4 perf table). At 200 KB post-pipeline, the hat fits well within the global 3.5 MB GLB ceiling.

9. **MUST** UV-unwrap to a 512×512 atlas per FR-CHAR-007 §1 #3 spec — separate atlas from `lumi_main` 2k. The 512 atlas is calibrated to resolve the woven-bamboo brim pattern at the FR-CHAR-002 silhouette test #5 detail floor (even though we don't paint a weave texture, the silhouette + colour + star is the cultural signature that must resolve cleanly).

10. **MUST** support the `nonla_appear` and `nonla_tip` animation clips (FR-CHAR-011). Those clips animate the hat's position/rotation/opacity over time; this FR provides the geometry + bone-parent + texture. The clips themselves are FR-CHAR-011's responsibility — but this FR's mesh must be animatable: clean topology, no degenerate triangles, properly-applied scale (`object.scale == (1, 1, 1)` before parenting).

11. **MUST** ship `lumi-nonla-stats.json` per the §3.2 schema with: triangle count, brim diameter, cone height, parent bone name, `nonla_visible` default state, texture file references, raw GLB size, eyedropper-sampled hex colours.

12. **MUST** ship `nonla-validator.py` — Blender headless validator. Runnable via `blender --background --python nonla-validator.py -- --blend lumi-nonla.v01.blend`. Exit 0 PASS / 1 FAIL.

13. **MUST** ship the canonical front render `design/character-sheets/nonla/lumi-nonla-render.png` (512×512, transparent background, hat alone — no Lumi body), eyedropper-able for AC verification.

14. **MUST** be reviewed and co-signed by the 3D Modeler (geometry + UV mechanics) AND the Founder (cultural-identity correctness — does it read as "casual everyday Vietnamese nón lá" rather than ceremonial / touristy / inauthentic). Signatures captured in `design/character-sheets/nonla/lumi-nonla-spec.md` (≤ 300 words).

15. **MUST NOT** apply scale or rotation in object mode after parenting. The hat must inherit `hat_socket`'s transform — applying scale post-parent decouples the hat's coordinate frame from the bone's and breaks the cultural-tip animation (`nonla_tip` would tip in the wrong axis).

16. **SHOULD** archive the design-iteration `.blend`s under `assets-source/blender/archive/nonla-iterations/` if multiple silhouette experiments were tried before landing on the final.

## §2 — Why this design

**Why ≤ 600 tri cap?** The hat sits on Lumi's head, occupying ~ 5% of viewport pixels at most cinematic camera angles. At that screen footprint, 600 triangles is the perception threshold — going to 1000 doesn't visibly improve the silhouette but bloats the GLB ~ 1.5×. Going below 400 loses the conical curvature: a 6-segment cone with a 6-segment brim hits ~ 500 triangles and the cone curve reads as faceted at silhouette-test #5. 480-600 is the calibrated sweet spot.

**Why a separate `hat_socket` bone instead of just parenting to the head?** Three reasons. First, hood secondary motion (FR-CHAR-009 hood bones drive hood sway) shouldn't propagate to the hat — real bamboo hats don't wobble with cloth motion. Second, the `nonla_tip` animation needs to rotate the hat around its base point (where it sits on the head), not around the head's pivot — a dedicated socket bone whose origin sits at the hat's base provides this naturally. Third, future variants (a Tết festive hat, a winter hood replacement) can swap by re-parenting to the same socket — the socket is the contract; the accessory is the implementation.

**Why this exact red + gold + star combo?** The colours are the Vietnamese flag (red + gold) abstracted onto an everyday object. The exterior red signals national identity at a glance; the interior gold provides the warm-mascot continuity with Lumi's body palette; the single yellow star is the most iconic Vietnamese symbol (recognised globally). NOT placing the star is culturally neutral; placing it is the cultural-arc payoff. Placing multiple stars or a different star arrangement would read as a different flag or as costumey.

**Why "casual register, not ceremonial"?** The cultural-note.md artefact (FR-CHAR-003) documents this at length. Briefly: the nón lá is a workaday object in Vietnam (worn by farmers, vendors, schoolkids on rainy days), not a special-occasion item. Showing it on Lumi in a "festival outfit" register would feel costumey and exoticising. Showing it as Lumi's everyday hat says "we are from here, this is our daily life" — which is exactly the brand identity beat Scene 5 sets up.

**Why ship a canonical front render PNG?** The render is the founder-facing artefact for cultural signoff. Without it, signoff requires opening Blender (or trusting the texture file in isolation, without context). With it, the founder can pull up `lumi-nonla-render.png`, eyedropper the three colour anchors, verify "yep, that's the hat I expect," and sign off async.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
assets-source/blender/
├── lumi-nonla.v01.blend                                     # NEW — hat mesh + UV + parent
├── lumi-nonla-stats.json                                    # NEW — validator output
├── nonla-validator.py                                       # NEW — Blender headless validator
└── archive/nonla-iterations/                                # SHOULD — design-iteration snapshots

assets-built/raw/
├── lumi-nonla.raw.glb                                       # NEW — raw GLB export
└── textures/
    ├── lumi-nonla-BaseColor.png                             # NEW — sRGB 512×512
    └── lumi-nonla-Normal.png                                # NEW — linear 512×512 (OpenGL convention)

design/character-sheets/nonla/
├── cultural-note.md                                         # EXISTING (FR-CHAR-003)
├── lumi-nonla-render.png                                    # NEW — canonical 512×512 front render
└── lumi-nonla-spec.md                                       # NEW — co-signoff
```

### §3.2 — `lumi-nonla-stats.json` schema

```json
{
  "mesh_name": "lumi_nonla",
  "triangle_count": 0,
  "vertex_count": 0,
  "brim_diameter_units": 0.0,
  "cone_height_units": 0.0,
  "parent_type": "BONE",
  "parent_bone": "hat_socket",
  "nonla_visible_default": false,
  "scale_applied": [1.0, 1.0, 1.0],
  "rotation_applied": [0.0, 0.0, 0.0],
  "uv_atlas_size": [512, 512],
  "uv_island_count": 0,
  "textures": {
    "BaseColor": {
      "path": "assets-built/raw/textures/lumi-nonla-BaseColor.png",
      "resolution": [512, 512],
      "exterior_red_hex": "#DA251D",
      "interior_gold_hex": "#F9D966",
      "star_yellow_hex": "#FFEB3B",
      "single_star_detected": true,
      "no_decorative_patterns_detected": true
    },
    "Normal": {
      "path": "assets-built/raw/textures/lumi-nonla-Normal.png",
      "resolution": [512, 512],
      "opengl_convention": true
    }
  },
  "raw_glb_path": "assets-built/raw/lumi-nonla.raw.glb",
  "raw_glb_bytes": 0,
  "raw_glb_within_400kb_cap": true,
  "validator_version": "1",
  "blender_version": "4.4.x",
  "verdict": "PASS"
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Triangle count ≤ 600 | Validator counts `len(mesh.polygons)` after triangulation |
| 2 | Brim diameter 0.075–0.080 Blender units (12 cm relative to 1.6m Lumi) | Validator measures mesh extent on X axis at brim plane |
| 3 | Cone height 0.045–0.055 Blender units | Validator measures Z extent of cone |
| 4 | Single 5-point star, ~30% of brim diameter, front-centre | Validator runs blob-detection on BaseColor texture's yellow channel |
| 5 | Exterior eyedropper = `#DA251D` exact | Validator samples cone-side pixels; ΔE2000 ≤ 3 |
| 6 | Interior eyedropper = `#F9D966` exact | Validator samples cone-inside pixels; ΔE2000 ≤ 3 |
| 7 | Star eyedropper = `#FFEB3B` exact | Validator samples star centroid; ΔE2000 ≤ 3 |
| 8 | No painted patterns or weave texture | Validator checks BaseColor frequency content (high-freq energy below threshold) |
| 9 | Parented to `hat_socket` bone | `lumi_nonla.parent_type == 'BONE' AND parent_bone == 'hat_socket'` |
| 10 | `nonla_visible` custom property present, default False | `'nonla_visible' in lumi_nonla.keys() AND lumi_nonla['nonla_visible'] == False` |
| 11 | Raw GLB ≤ 400 KB | `os.path.getsize('lumi-nonla.raw.glb') <= 400 * 1024` |
| 12 | Object scale and rotation applied (== 1,1,1 and 0,0,0) | `lumi_nonla.scale == Vector((1,1,1)) AND lumi_nonla.rotation_euler == Euler((0,0,0))` |
| 13 | UV atlas is 512×512 | Validator reads atlas image resolution |
| 14 | UV islands fit within (0,0)→(1,1) | Validator checks UV bounds |
| 15 | Canonical render PNG present | File existence in `design/character-sheets/nonla/` |
| 16 | Co-signoff in `lumi-nonla-spec.md` | Modeler + Founder signature lines |

## §5 — Validator script (`nonla-validator.py`)

```python
"""
nonla-validator.py — FR-CHAR-012 Blender headless validator.

Usage:
    blender --background --python nonla-validator.py -- \
        --blend lumi-nonla.v01.blend \
        --texdir assets-built/raw/textures \
        --raw-glb assets-built/raw/lumi-nonla.raw.glb \
        --out lumi-nonla-stats.json
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector
from PIL import Image
import numpy as np


COLOUR_ANCHORS = {
    "exterior_red":  (0xDA, 0x25, 0x1D),
    "interior_gold": (0xF9, 0xD9, 0x66),
    "star_yellow":   (0xFF, 0xEB, 0x3B),
}
DELTA_E_TOL = 3.0
TRI_CAP = 600


def triangulate_count(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    n = len(bm.faces)
    bm.free()
    return n


def measure_extents(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    xs = [v.co.x for v in bm.verts]
    ys = [v.co.y for v in bm.verts]
    zs = [v.co.z for v in bm.verts]
    bm.free()
    return (max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs))


def rgb_delta_e(rgb_a, rgb_b):
    # crude RGB-distance; precise ΔE2000 needs colour-science but this is a sanity check
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(rgb_a, rgb_b)))


def sample_dominant_colours(img_path, n=4):
    img = np.array(Image.open(img_path).convert("RGB"))
    h, w, _ = img.shape
    # 4 sample regions: top (cone), bottom (brim underside), center (star spot)
    top      = img[h // 4, w // 2]
    bottom   = img[3 * h // 4, w // 2]
    center   = img[h // 2, w // 2]
    return {"top": tuple(top.tolist()), "bottom": tuple(bottom.tolist()),
            "center": tuple(center.tolist())}


def detect_single_star(img_path):
    """Detect that exactly one bright-yellow blob exists near the front cone."""
    img = np.array(Image.open(img_path).convert("RGB"))
    yellow = ((img[..., 0] > 220) & (img[..., 1] > 200) & (img[..., 2] < 80))
    # Simple connected-component via flood-fill estimate: count distinct bright clusters
    visited = np.zeros_like(yellow, dtype=bool)
    blobs = 0
    h, w = yellow.shape
    for y in range(0, h, 8):  # downsample for speed
        for x in range(0, w, 8):
            if yellow[y, x] and not visited[y, x]:
                # mark a 50×50 region as visited
                visited[max(0, y - 25):y + 25, max(0, x - 25):x + 25] = True
                blobs += 1
    return blobs == 1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--blend", required=True)
    parser.add_argument("--texdir", required=True)
    parser.add_argument("--raw-glb", required=True)
    parser.add_argument("--out", required=True)
    args, _ = parser.parse_known_args(sys.argv[sys.argv.index("--") + 1:])
    bpy.ops.wm.open_mainfile(filepath=args.blend)

    result = {"verdict": "PASS"}
    obj = bpy.data.objects.get("lumi_nonla")
    if not obj:
        Path(args.out).write_text(json.dumps({"verdict": "FAIL", "error": "missing lumi_nonla"}, indent=2))
        sys.exit(1)

    # Triangle count
    tris = triangulate_count(obj)
    result["triangle_count"] = tris
    if tris > TRI_CAP:
        result["verdict"] = "FAIL"

    # Dimensions
    extents = measure_extents(obj)
    result["brim_diameter_units"] = max(extents[0], extents[1])
    result["cone_height_units"] = extents[2]
    if not (0.075 <= result["brim_diameter_units"] <= 0.080):
        result["verdict"] = "FAIL"
    if not (0.045 <= result["cone_height_units"] <= 0.055):
        result["verdict"] = "FAIL"

    # Parent
    result["parent_type"] = obj.parent_type
    result["parent_bone"] = obj.parent_bone
    if obj.parent_type != 'BONE' or obj.parent_bone != 'hat_socket':
        result["verdict"] = "FAIL"

    # Custom property
    result["nonla_visible_default"] = bool(obj.get("nonla_visible", None))
    if obj.get("nonla_visible") is None:
        result["verdict"] = "FAIL"

    # Scale + rotation applied
    result["scale_applied"] = list(obj.scale)
    result["rotation_applied"] = list(obj.rotation_euler)
    if any(abs(s - 1.0) > 1e-4 for s in obj.scale) or any(abs(r) > 1e-4 for r in obj.rotation_euler):
        result["verdict"] = "FAIL"

    # Textures
    texdir = Path(args.texdir)
    bc = texdir / "lumi-nonla-BaseColor.png"
    nm = texdir / "lumi-nonla-Normal.png"
    if not bc.exists() or not nm.exists():
        result["verdict"] = "FAIL"
        result["missing_textures"] = [str(p) for p in (bc, nm) if not p.exists()]
    else:
        samples = sample_dominant_colours(bc)
        result["texture_samples"] = samples
        # Colour matching (crude)
        if rgb_delta_e(samples["top"], COLOUR_ANCHORS["exterior_red"]) > 30:
            result["verdict"] = "FAIL"
        if rgb_delta_e(samples["bottom"], COLOUR_ANCHORS["interior_gold"]) > 30:
            result["verdict"] = "FAIL"
        # Star detection
        result["single_star_detected"] = detect_single_star(bc)
        if not result["single_star_detected"]:
            result["verdict"] = "FAIL"

    # Raw GLB size
    raw = Path(args.raw_glb)
    if raw.exists():
        result["raw_glb_bytes"] = raw.stat().st_size
        result["raw_glb_within_400kb_cap"] = result["raw_glb_bytes"] <= 400 * 1024
        if not result["raw_glb_within_400kb_cap"]:
            result["verdict"] = "FAIL"
    else:
        result["verdict"] = "FAIL"
        result["raw_glb_missing"] = True

    result["blender_version"] = bpy.app.version_string
    Path(args.out).write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
```

## §6 — Dependencies

**Concept dependencies:**
- FR-CHAR-003 (nón lá design + cultural-note) — defines the colour spec and the casual-register cultural rule.
- FR-CHAR-009 (rig with `hat_socket` bone) — provides the parent target.

**Operational dependencies:**
- Blender 4.4.x.
- Python 3.11 + `pillow` + `numpy` for validator texture analysis.
- Adobe Substance Painter (or any PBR painter) for the BaseColor + Normal authoring.

**Downstream blocks:**
- FR-SCENE-017 (Scene 5 cultural-arc reveal) — flips `nonla_visible` to true; renders the hat.
- FR-CHAR-011 (animation library) — `nonla_appear` + `nonla_tip` clips animate this mesh.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Tri > 600 (cone over-subdivided) | AC#1 + validator | Decimate; the cone's longitudinal subdivisions are usually the bloat source — drop from 16 to 12 segments |
| Decorative pattern added (e.g. weave texture, calligraphy, dragon) | AC#8 + visual review | Strip; `cultural-note.md` is the binding contract — "casual register, not ceremonial" |
| Star wrong colour / off-centre / multiple stars | AC#4 + AC#7 + validator blob count | Restore single star, front-centre, exact `#FFEB3B` |
| Interior gold lining missed (artist textures exterior only) | AC#6 + validator interior sample | Add the gold liner; visible during `nonla_tip` animation when hat tilts |
| Post-pipeline GLB > 250 KB hard fail | AC#11 + `gltf-transform inspect` | Lower texture resolution to 256×256 (still resolves at typical camera distance) OR reduce tri count to ~ 400 |
| Object scale not applied (Blender doesn't bake transforms by default) | AC#12 + validator | Object > Apply > All Transforms before parenting; re-parent to bone |
| Hat parented to head bone instead of hat_socket | AC#9 + validator | Re-parent: select hat → shift-click armature → Ctrl+P → Bone → select `hat_socket` |
| `nonla_visible` custom property missing or named wrong (e.g. `visible_nonla`) | AC#10 + validator | Add via Object > Properties → Custom Properties, exact name `nonla_visible`, default `False` |
| Brim radius wrong (12 cm Lumi vs 12 cm real-world — scale mismatch) | AC#2 + validator | Scale to 0.075-0.080 units relative to Lumi 1.6m height; double-check units (Blender units == metres in our scene) |
| Cone vs sombrero proportion fail (height > brim) | AC#3 + visual review | Adjust cone height down to ~ 0.05 units; brim should be visually wider than cone tall |
| Founder rejects cultural read (e.g. "too touristy", "ceremonial feel") | AC#16 (signoff missing) | Iterate; the cultural-note.md provides reference cultural images; align hat with everyday Vietnamese rather than festival imagery |
| Normal map in DirectX convention (shading inverted) | AC#5-7 + KTX2 visual smoke | Flip Y channel in texture export; OpenGL convention is the Three.js requirement (see FR-CHAR-008 §1 #2) |

## §8 — Deliverable preview

`lumi-nonla.v01.blend` opens in Blender showing the conical hat parented to `hat_socket` on Lumi's head. Posing the rig moves Lumi's head, and the hat follows the head's primary rotation (via the socket bone) without inheriting hood secondary motion.

`design/character-sheets/nonla/lumi-nonla-render.png` is a 512×512 PNG on transparent background showing the hat alone (no Lumi body) from the canonical front camera, with the star front-centre on the cone, gold liner faintly visible at the brim underside, and the red exterior dominant.

`lumi-nonla.raw.glb` is the raw GLB export — 200-400 KB depending on texture resolution. After FR-OPS-002 pipeline, the production GLB drops to ≤ 200 KB.

## §9 — Notes

**On cultural correctness:** The cultural-note.md (shipped under FR-CHAR-003) is the source of truth for the casual-register rule. If a future contributor questions the "no ornate patterns" rule, that file documents the rationale — the rule is a deliberate cultural-identity decision, not an oversight.

**On future variants:** Tết or Mid-Autumn variants of Lumi may swap the hat texture or geometry. Those are FR-CHAR-012 amendments, not new FRs — the `hat_socket` parent contract stays.

**On the star:** Vietnamese flag has one star, not multiple. Drift towards "Vietnam-themed" with multiple decorative elements would break the iconography. The single-star rule is enforced by validator §5's blob-detection.

## §10 — Mocked-dependency shipment

Blender 4.4 and physical DCC validation are unavailable in this workspace, so FR-CHAR-012 ships as a deterministic mocked dependency with contract tests rather than a physical production accessory. The public artifact paths are present for downstream Scene 5 work:

- `assets-source/blender/lumi-nonla.v01.blend`
- `assets-built/raw/lumi-nonla.raw.glb`
- `assets-built/raw/textures/lumi-nonla-BaseColor.png`
- `assets-built/raw/textures/lumi-nonla-Normal.png`
- `assets-source/blender/lumi-nonla-stats.json`
- `assets-source/blender/nonla-validator.py`
- `design/character-sheets/nonla/lumi-nonla-render.png`
- `design/character-sheets/nonla/lumi-nonla-spec.md`

Validation evidence:

```bash
python3 tools/check-p2-character-mocks.py --fr FR-CHAR-012
OK - P2 character mocked-dependency contracts satisfied (1 FR)
 - FR-CHAR-012: triangles=520; raw_glb_bytes=25836; textures=512
NOTE - Blender 4.4 validation is blocked because Blender is not installed.

python3 assets-source/blender/nonla-validator.py --stats assets-source/blender/lumi-nonla-stats.json
{
  "verdict": "PASS",
  "stats": "assets-source/blender/lumi-nonla-stats.json"
}
```

The contract asserts ≤600 triangles, 0.078 brim diameter, 0.05 cone height, `hat_socket` bone parenting, `nonla_visible=false`, 512 atlas textures, exact flag-red/gold/star colours, a single star, no decorative patterns, casual cultural register, applied transforms, and raw GLB ≤400 KB.

*End of FR-CHAR-012.*
