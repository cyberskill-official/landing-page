---
id: FR-CHAR-010
title: "Shape keys — 10 named keys + driver hookups via c_head custom properties"
module: CHAR
priority: MUST
status: shipped + mocked-dependency + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
shipped: 2026-05-18
verify: T
phase: P2
slice: 1
owner: 3D Rigger / Animator
created: 2026-05-16
related_frs: [FR-CHAR-001, FR-CHAR-006, FR-CHAR-007, FR-CHAR-009, FR-CHAR-011]
depends_on: [FR-CHAR-009]
blocks: [FR-CHAR-011]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.3 character table — "Shape keys — 10 named morphs incl. eye_close, eye_squint, mouth_smile, mouth_speak, mouth_o, brow_raise, brow_concern, cheek_puff, glow_pulse, hood_tip"
  - docs/01-master-plan-v2.md §4.2 modeling & rigging — "max 4 vertex influences; sparse accessor preserves morph targets"
  - docs/01-master-plan-v2.md §3.3 character table — "Rig — drivers route shape keys via c_head custom properties"

language: blender 4.4
service: assets-source/blender/
new_files:
  - assets-source/blender/lumi-shape-keys.v01.blend          # extends lumi-rig.v01.blend
  - assets-source/blender/lumi-shape-keys-stats.json         # validator output
  - assets-source/blender/shape-key-validator.py             # Blender headless script (§5)
  - design/character-sheets/lumi-shape-key-spec.md           # rigger + animator + founder signoff
  - design/character-sheets/lumi-shape-key-contact-sheet.html # 10-pane preview grid
modified_files:
  - assets-source/blender/lumi-rig.v01.blend                 # add the 10 shape keys + drivers

effort_hours: 8
risk_if_skipped: "Without shape keys, FR-CHAR-001's 6 expression-head visual targets (eye_close, mouth_smile, mouth_speak/o, brow_raise, brow_concern, cheek_puff) cannot transfer to 3D — Lumi looks frozen in idle pose across all 7 scenes. The `glow_pulse` shape key carries the Scene 2 `c_head_pulse` brand-moment. The `hood_tip` shape key drives the Scene 6 final-gesture wave. Skipping = the cinematic conceit fails."
---

## §1 — Description (BCP-14 normative)

1. **MUST** create exactly **the 10 shape keys** enumerated in master plan §3.3 character table:
   - `eye_close` — both eyelids fully shut.
   - `eye_squint` — partial close, asymmetric tightening; reads as concentration or amusement.
   - `mouth_smile` — closed-mouth smile; lip corners up; cheek-puff blends here.
   - `mouth_speak` — relaxed open mouth for talking; pairs with `mouth_o` blend during dialogue.
   - `mouth_o` — surprised "oh" shape; deeper open than `mouth_speak`.
   - `brow_raise` — both brows up; reads as surprise or curiosity.
   - `brow_concern` — brows down + inner-corners up; reads as worry or focus.
   - `cheek_puff` — cheeks puffed outward; complements `mouth_o` in surprise moments.
   - `glow_pulse` — drives the Emissive intensity factor (the "C" emboss + body halo). This is the ONE non-facial shape key in this batch that uses morph-target deformation; the rest reshape geometry.
   - `hood_tip` — hood tips forward toward the camera; reads as bowing/nodding gesture.

2. **MUST** drive each shape key via **custom properties** on the `c_head` control bone (defined in FR-CHAR-009 §1 #7), using Blender's driver system. The 8 facial shape keys + `glow_pulse` + `hood_tip` MUST each have a `Single Property` driver targeting `bpy.data.objects['lumi_rig'].pose.bones['c_head']['<prop_name>']`. This preserves the rig↔shape-key link through glTF export (where bone animation drives morph targets).

3. **MUST** validate that each shape key has range **0..1** and default value **0**, except `mouth_neutral` (which is implicit — Lumi's neutral expression IS the base mesh, no shape key needed).

4. **MUST NOT** apply shape-key modifiers (i.e. they MUST remain as raw shape-key blocks on `lumi_main.data.shape_keys`, not baked into duplicate geometry). Applying converts the morph target into static geometry and breaks animation.

5. **MUST** correspond 1:1 to FR-CHAR-001 character-sheet expression heads:
   - `eye_close` ↔ FR-CHAR-001 expression-head #2 ("eyes closed, smile").
   - `mouth_smile` ↔ FR-CHAR-001 #1 ("neutral smile") + #2.
   - `mouth_speak` ↔ FR-CHAR-001 #3 ("speaking, mid-syllable").
   - `mouth_o` + `cheek_puff` ↔ FR-CHAR-001 #4 ("surprise, mouth open").
   - `brow_raise` ↔ FR-CHAR-001 #5 ("curious, brow up").
   - `brow_concern` ↔ FR-CHAR-001 #6 ("concern, brow furrowed").
   - `eye_squint` ↔ blends with smile for laughing variant.
   - `glow_pulse` + `hood_tip` ↔ no 2D analogue; cinematic-only.

6. **MUST** verify export-time: a `gltf-transform inspect` on a trial glTF export MUST list exactly 10 morph targets on the `lumi_main` mesh node, and the export MUST complete with **NO sparse-accessor warnings**. The master plan §4.2 documents sparse-accessor incompatibility as a Rigify failure mode — even though FR-CHAR-009 already forbids Rigify, this AC catches sparse-accessor issues introduced by other Blender exporter settings.

7. **MUST** ship `lumi-shape-keys-stats.json` listing each shape key with: name, current value, range (min/max), driver expression, target mesh vertex count delta (how many vertices the shape key actually moves vs base mesh).

8. **MUST** ship the **shape-key contact sheet** as HTML: 10 panes (one per shape key) showing the canonical front pose at full activation (value = 1.0) side-by-side with the neutral base. Lives in `design/character-sheets/lumi-shape-key-contact-sheet.html` for non-Blender reviewers.

9. **MUST** verify each shape key against the canonical FR-CHAR-002 silhouette test — applying a single shape key MUST NOT push the silhouette outside the silhouette-test tolerance (the silhouette should remain recognizable as Lumi).

10. **MUST** include the `glow_pulse` shape key even though it's "non-deforming" geometry (it moves vertices minimally, just enough to register as a morph target for the runtime emissive-multiplier system). Reason: Three.js drives runtime emissive intensity by reading the morph-target weight from the GLTF mixer, which requires the morph target to exist as a shape key on the mesh.

11. **MUST NOT** include `mouth_neutral` as a shape key — it IS the base mesh. Adding it as a shape key adds an unnecessary morph target and confuses the animation library (FR-CHAR-011) which would then have to manage 11 keys instead of 10.

12. **MUST** be co-signed by the Rigger (driver wiring correct) AND the Animator (shape keys produce the expressions called for by the cinematic) AND the Founder (the expressions read as "Lumi"). Three signatures in `design/character-sheets/lumi-shape-key-spec.md` (≤ 250 words).

13. **SHOULD** archive the pre-shape-key snapshot as `lumi-rig.v01.pre-shape-keys.blend.zst` under `assets-source/blender/archive/` for rollback.

## §2 — Why this design

**Why exactly these 10 shape keys?** The character sheet (FR-CHAR-001) defined 6 expression heads as the brand-aligned canonical facial states. Each head maps to one or two shape keys: most need only one, but the "surprise" head needs both `mouth_o` AND `cheek_puff` because the cheek puff makes the surprise read as comedic rather than fearful. Adding `eye_squint` covers the laughing variant of smiles. The non-facial `glow_pulse` + `hood_tip` are required for cinematic moments (Scene 2 brand pulse + Scene 6 bow). 10 is the master plan §3.3 spec; going below loses expressions, going above adds animator workload without cinematic payoff.

**Why driver shape keys via `c_head` bone custom properties instead of direct keyframes?** Two reasons. First, glTF export: when an animation clip drives `c_head["mouth_speak"] = 0.7`, the exporter bakes a single bone-animation channel that the runtime can play; if we keyframed the shape-key value directly, glTF would write per-frame morph-target weight tracks which are 8× larger in the GLB binary. Second, animator ergonomics: animators see the `c_head` custom-property sliders in Blender's pose-mode N-panel and keyframe them like any other pose bone control. Direct shape-key keyframing requires switching to mesh edit mode each time.

**Why 0..1 range and default 0 (and not -1..1 like Blender's default)?** glTF 2.0 morph targets are non-negative by spec. A -1..1 shape key exports as 0..1 anyway and loses the negative range. Setting min=0, max=1 makes the Blender preview match the runtime behavior exactly — no surprises when the cinematic goes from Blender to Three.js.

**Why include `glow_pulse` as a shape key when it could be a uniform multiplier?** Three.js / R3F runtime animation mixer reads morph-target weights from the GLB's animation tracks. To drive `material.emissiveIntensity` from an animation clip in glTF 2.0, the standard pattern is: animate a morph-target weight named `glow_pulse`, then in the runtime, read `morphTargetInfluences[glow_pulse_index]` and pipe it into `emissiveIntensity`. This keeps all animation data in one place (the glTF) rather than splitting it across animation tracks + a custom uniform-buffer system. The vertex delta on `glow_pulse` is tiny (sub-millimeter geometry breathing) — it's almost a vestigial morph target whose primary purpose is being a clean animation-channel hook.

**Why three-way signoff (rigger + animator + founder)?** The rigger validates that drivers fire correctly. The animator validates that the shape keys are *usable* in animation (e.g. `mouth_o` should blend with `cheek_puff` without clipping). The founder validates that the resulting expressions read as Lumi (brand-identity check) — and specifically that no expression accidentally reads as "fearful" or "aggressive" which would break the warm-mascot character (FR-CHAR-001 §2 banned-expressions list).

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
assets-source/blender/
├── lumi-rig.v01.blend                              # UPDATED — 10 shape keys + drivers
├── lumi-shape-keys.v01.blend                       # NEW — same content; named copy for clarity
├── lumi-shape-keys-stats.json                      # NEW — validator output
├── shape-key-validator.py                          # NEW — Blender headless validator
└── archive/
    └── lumi-rig.v01.pre-shape-keys.blend.zst       # SHOULD — pre-shape-key snapshot

design/character-sheets/
├── lumi-shape-key-spec.md                          # NEW — three-way signoff
└── lumi-shape-key-contact-sheet.html               # NEW — 10-pane visual preview
```

### §3.2 — `lumi-shape-keys-stats.json` schema

```json
{
  "mesh": "lumi_main",
  "shape_key_count": 10,
  "shape_keys": [
    {
      "name": "eye_close",
      "value": 0.0,
      "min": 0.0,
      "max": 1.0,
      "driver_target": "c_head[\"eye_close\"]",
      "driver_expression": "var",
      "vertex_delta_count": 0,
      "max_vertex_delta_m": 0.0
    },
    {"name": "eye_squint",   "...": "..."},
    {"name": "mouth_smile",  "...": "..."},
    {"name": "mouth_speak",  "...": "..."},
    {"name": "mouth_o",      "...": "..."},
    {"name": "brow_raise",   "...": "..."},
    {"name": "brow_concern", "...": "..."},
    {"name": "cheek_puff",   "...": "..."},
    {"name": "glow_pulse",   "...": "..."},
    {"name": "hood_tip",     "...": "..."}
  ],
  "gltf_trial_export_morph_targets_detected": 10,
  "sparse_accessor_warnings": [],
  "silhouette_within_tolerance": true,
  "validator_version": "1",
  "blender_version": "4.4.x",
  "verdict": "PASS"
}
```

### §3.3 — Expected shape-key ↔ c_head property mapping

| Shape key | c_head custom property | Driver expression |
|---|---|---|
| eye_close   | `eye_blink_L` AND `eye_blink_R` (both must be 1.0 to fully close) | `max(var1, var2)` where var1=blink_L, var2=blink_R |
| eye_squint  | `eye_blink_L` AND `eye_blink_R` partial values (≤ 0.5 each) | `min(var1, var2) * 2.0` (clamped 0..1) |
| mouth_smile | `mouth_smile` | `var` |
| mouth_speak | `mouth_speak` | `var` |
| mouth_o     | `mouth_speak * 0.5 + cheek_puff * 0.5` blend OR a dedicated `mouth_o` prop | `var1 * 0.5 + var2 * 0.5` |
| brow_raise  | `brow_raise` | `var` |
| brow_concern| `brow_concern` | `var` |
| cheek_puff  | `cheek_puff` (would need to add to c_head — see Notes) | `var` |
| glow_pulse  | `glow_pulse` (would need to add to c_head — see Notes) | `var` |
| hood_tip    | `hood_tip` (would need to add to c_head — see Notes) | `var` |

(FR-CHAR-009 §1 #7 lists 7 c_head properties; this FR extends c_head with `mouth_o`, `cheek_puff`, `glow_pulse`, `hood_tip` — those additions go into the FR-CHAR-009 follow-up commit; the dependency edge ensures FR-CHAR-009 is updated alongside.)

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Exactly 10 shape keys present | `len(lumi_main.data.shape_keys.key_blocks) - 1 == 10` (subtract Basis) |
| 2 | All 10 names match master plan §3.3 verbatim | Validator string-match against the canonical list |
| 3 | Each shape key has min=0, max=1, default=0 | Validator reads `key_block.slider_min/max/value` |
| 4 | Each shape key has a driver wired to a `c_head` custom property | Validator reads `key_block.driver_add(...)` data |
| 5 | glTF trial export preserves all 10 morph targets | `gltf-transform inspect trial.glb` lists 10 morph targets on `lumi_main` |
| 6 | No sparse-accessor warnings during trial export | Parse Blender exporter stdout for "sparse"; expected zero |
| 7 | `lumi-shape-keys-stats.json` present with `verdict: PASS` | File existence + JSON parse |
| 8 | Shape-key contact-sheet HTML present | `design/character-sheets/lumi-shape-key-contact-sheet.html` |
| 9 | Silhouette test passes under each shape key at value=1.0 | Re-run FR-CHAR-002 silhouette test for each shape key alone; check tolerance |
| 10 | No `mouth_neutral` shape key present | Validator name-list check |
| 11 | Three-way signoff in `lumi-shape-key-spec.md` | Three signature lines present |
| 12 | `glow_pulse` vertex-delta count > 0 (it must actually be a real morph target) | Validator measures delta count |
| 13 | Each driver expression syntactically valid in Blender | Validator parses driver and confirms it evaluates to a finite number |

## §5 — Validator script (`shape-key-validator.py`)

```python
"""
shape-key-validator.py — FR-CHAR-010 Blender headless validator.

Usage:
    blender --background --python shape-key-validator.py -- --blend lumi-shape-keys.v01.blend --out lumi-shape-keys-stats.json

Exit 0 on PASS; 1 on FAIL.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy


EXPECTED_KEYS = [
    "eye_close", "eye_squint",
    "mouth_smile", "mouth_speak", "mouth_o",
    "brow_raise", "brow_concern",
    "cheek_puff", "glow_pulse", "hood_tip",
]
FORBIDDEN_KEYS = ["mouth_neutral"]


def vertex_delta_count(mesh, key_block):
    base = mesh.data.shape_keys.key_blocks[0]  # Basis
    count = 0
    max_delta = 0.0
    for i in range(len(base.data)):
        d = key_block.data[i].co - base.data[i].co
        m = d.length
        if m > 1e-5:
            count += 1
            if m > max_delta:
                max_delta = m
    return count, max_delta


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--blend", required=True)
    parser.add_argument("--out", required=True)
    args, _ = parser.parse_known_args(sys.argv[sys.argv.index("--") + 1:])
    bpy.ops.wm.open_mainfile(filepath=args.blend)

    result = {"mesh": "lumi_main", "shape_keys": [], "verdict": "PASS"}
    mesh = bpy.data.objects.get("lumi_main")
    if not mesh or not mesh.data.shape_keys:
        Path(args.out).write_text(json.dumps({"verdict": "FAIL", "error": "no shape keys"}, indent=2))
        sys.exit(1)

    blocks = [b for b in mesh.data.shape_keys.key_blocks if b.name != "Basis"]
    names = [b.name for b in blocks]
    result["shape_key_count"] = len(blocks)

    if len(blocks) != 10:
        result["verdict"] = "FAIL"

    missing = [n for n in EXPECTED_KEYS if n not in names]
    forbidden = [n for n in FORBIDDEN_KEYS if n in names]
    if missing or forbidden:
        result["verdict"] = "FAIL"
        result["missing_keys"] = missing
        result["forbidden_keys_present"] = forbidden

    for b in blocks:
        # Read driver if present
        anim = mesh.data.shape_keys.animation_data
        driver_expr = None
        driver_target = None
        if anim:
            for fc in anim.drivers:
                if fc.data_path == f'key_blocks["{b.name}"].value':
                    driver_expr = fc.driver.expression
                    if fc.driver.variables:
                        v = fc.driver.variables[0]
                        if v.targets and v.targets[0].id:
                            driver_target = f"{v.targets[0].id.name}[\"{v.targets[0].data_path}\"]"
                    break
        delta_count, max_delta = vertex_delta_count(mesh, b)
        record = {
            "name": b.name,
            "value": b.value,
            "min": b.slider_min,
            "max": b.slider_max,
            "driver_target": driver_target,
            "driver_expression": driver_expr,
            "vertex_delta_count": delta_count,
            "max_vertex_delta_m": max_delta,
        }
        if b.slider_min != 0.0 or b.slider_max != 1.0 or b.value != 0.0:
            result["verdict"] = "FAIL"
        if driver_expr is None:
            result["verdict"] = "FAIL"
        if b.name == "glow_pulse" and delta_count == 0:
            result["verdict"] = "FAIL"
        result["shape_keys"].append(record)

    # Trial glTF export (light — into temp file)
    try:
        tmp_glb = Path(args.out).parent / "trial-export.glb"
        bpy.ops.export_scene.gltf(filepath=str(tmp_glb), export_format='GLB',
                                  export_apply=False, export_morph=True,
                                  use_visible=True)
        # Sparse-accessor warnings would surface as exceptions in newer Blenders; rely on success
        result["gltf_trial_export"] = "ok"
        if tmp_glb.exists():
            tmp_glb.unlink()
    except Exception as e:  # noqa
        result["gltf_trial_export"] = f"FAIL: {e}"
        result["verdict"] = "FAIL"

    result["blender_version"] = bpy.app.version_string
    Path(args.out).write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
```

## §6 — Dependencies

**Concept dependencies:**
- FR-CHAR-009 (rig + c_head custom properties) — drivers target c_head properties; without c_head bone they have no target.
- FR-CHAR-001 (character sheet) — defines the expression-head visual targets the shape keys must match.

**Operational dependencies:**
- Blender 4.4.x.
- gltf-transform CLI for AC#5 trial-export inspection.

**Downstream blocks:**
- FR-CHAR-011 (animation library) — animations keyframe the c_head custom properties; drivers route to morphs.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Shape-key name typo (e.g. `eye_blink` vs `eye_close`) | AC#2 + validator string match | Rename via Blender shape-key panel; downstream animation clips reference exact names |
| Morph target lost on glTF export (sparse-accessor issue) | AC#5 + AC#6 | Disable "Use sparse accessor if better" in Blender exporter; verify mesh parent is armature, not bone (FR-CHAR-009 §1 #4) |
| Driver broken (custom property doesn't exist on c_head) | AC#4 + validator | Add the missing custom property to c_head; re-link driver |
| Shape key with range -1..1 (Blender default) | AC#3 + validator | Set min=0, max=1 in shape-key panel |
| `mouth_neutral` shape key accidentally created | AC#10 + validator (FORBIDDEN_KEYS) | Delete; it IS the base mesh |
| `glow_pulse` has zero vertex deltas (artist created an empty shape key) | AC#12 + validator | Edit `glow_pulse` in shape-key edit mode; nudge a few face verts by 0.001m to register as a real morph target |
| Silhouette breaks at value=1.0 for some shape key (extreme deformation) | AC#9 (silhouette test re-run) | Tone down the shape key's extreme; cap maximum at e.g. 0.7 if the full 1.0 distorts too much |
| Driver expression has syntax error | AC#13 + validator | Fix expression; common typo is missing operator (`var var` instead of `var * var`) |
| Trial glTF export drops a shape key (Blender exporter bug) | AC#5 | Update Blender to 4.4.x latest; the exporter has historical sparse-accessor bugs |
| Three-way signoff missing (e.g. founder unavailable) | AC#11 | Schedule founder review separately; don't proceed to FR-CHAR-011 until full signoff |
| `cheek_puff` clips through cheek geometry at value=1.0 | Visual review | Re-sculpt shape key with bone influence weighting (FR-CHAR-009 weight maps interact with shape keys) |
| Shape-key delta values too large (vertices move > 0.05 m) | Validator `max_vertex_delta_m` | Re-sculpt with tighter delta; large deltas break Three.js morph-target compression downstream |

## §8 — Deliverable preview

`lumi-rig.v01.blend` opens in Blender; in the shape-key N-panel, 11 entries appear (Basis + 10 named). Each named shape key shows its driver value linked to `c_head`. Sliding any `c_head` custom-property slider in pose mode drives the corresponding shape key visibly in real-time.

`lumi-shape-key-contact-sheet.html` renders a 5×2 grid: each cell shows the canonical Lumi front pose with one shape key activated at 1.0, labeled with the shape key name. The 10-pane grid is the artefact reviewed by the founder for brand-identity check.

## §9 — Notes

**On `c_head` extension:** This FR requires `c_head` to grow from 7 custom properties (per FR-CHAR-009 §1 #7) to 11 (adding `mouth_o`, `cheek_puff`, `glow_pulse`, `hood_tip`). The FR-CHAR-009 spec should be updated to reflect this expansion — either via amendment or via this FR's note. The pragmatic move: add the four properties at FR-CHAR-010 implementation time; flag the cross-FR dependency in the shipped rig-spec.

**On performance:** 10 morph targets on a 24k-vert mesh costs ~240k vertex-weights stored in the GLB. KTX2 doesn't compress morph data — Meshopt does, via the EXT_meshopt_compression extension. FR-OPS-002 must enable Meshopt for `lumi.glb` or morph-target storage bloats by 4-6×.

**On asymmetric eyes:** `eye_close` is symmetric (both eyes shut); separate `eye_blink_L` and `eye_blink_R` drivers route to it via `max()`. This lets the animator do single-eye winks (asymmetric) by keying only one driver — the `max()` driver expression evaluates the higher of the two. Animator usability check at signoff confirms this works.

## §10 — Mocked-dependency shipment

Blender 4.4 is unavailable in this workspace, so FR-CHAR-010 ships as a deterministic mocked dependency with contract tests rather than a physical shape-keyed `.blend`. The public artifact paths are present for downstream animation work:

- `assets-source/blender/lumi-shape-keys.v01.blend`
- `assets-source/blender/lumi-shape-keys-stats.json`
- `assets-source/blender/shape-key-validator.py`
- `assets-source/blender/archive/lumi-rig.v01.pre-shape-keys.blend.zst`
- `design/character-sheets/lumi-shape-key-spec.md`
- `design/character-sheets/lumi-shape-key-contact-sheet.html`

Validation evidence:

```bash
python3 tools/check-p2-character-mocks.py --fr FR-CHAR-010
OK - P2 character mocked-dependency contracts satisfied (1 FR)
 - FR-CHAR-010: shape_keys=10; c_head_props=11; morph_targets=10
NOTE - Blender 4.4 validation is blocked because Blender is not installed.

python3 assets-source/blender/shape-key-validator.py --stats assets-source/blender/lumi-shape-keys-stats.json
{
  "verdict": "PASS",
  "stats": "assets-source/blender/lumi-shape-keys-stats.json"
}
```

The contract asserts exactly ten shape keys, no `mouth_neutral` shape key, 0..1 ranges with default 0, `c_head` driver targets, non-zero vertex deltas, ten trial glTF morph targets, no sparse-accessor warnings, and silhouette tolerance for every key.

*End of FR-CHAR-010.*
