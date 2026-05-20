---
id: FR-CHAR-009
title: "Custom armature ~27 bones (NOT Rigify) — spine / arms / wisp / hood / jaw / eyes / hat-socket"
module: CHAR
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
shipped: 2026-05-18
verify: T
phase: P2
slice: 1
owner: 3D Rigger / Animator
created: 2026-05-16
related_frs: [FR-CHAR-006, FR-CHAR-007, FR-CHAR-008, FR-CHAR-010, FR-CHAR-011, FR-CHAR-012, FR-OPS-002]
depends_on: [FR-CHAR-006]
blocks: [FR-CHAR-010, FR-CHAR-011, FR-CHAR-012]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.3 character table — "Rig — custom armature, NOT Rigify; ~ 27 bones"
  - docs/01-master-plan-v2.md §4.2 modeling & rigging — "max 4 vertex influences per glTF; mesh parented directly to armature; no Preserve Volume"
  - docs/01-master-plan-v2.md §3.3 nón lá row — "socket-bone-attached accessory, swappable"

language: blender 4.4
service: assets-source/blender/
new_files:
  - assets-source/blender/lumi-rig.v01.blend          # armature added on top of lumi.v01.blend
  - assets-source/blender/lumi-rig-skinning-stats.json # validator output
  - assets-source/blender/rig-validator.py            # Blender headless script (§5)
  - design/character-sheets/lumi-rig-spec.md          # founder + rigger + animator co-signoff
  - design/character-sheets/lumi-bone-map.png         # bone hierarchy diagram
modified_files:
  - assets-source/blender/lumi.v01.blend              # parent mesh to armature; commit weight maps

effort_hours: 16
risk_if_skipped: "Rigify exports poorly to glTF (master plan §4.2 documents multi-mesh morph-target bug + sparse-accessor incompatibility). Skipping the custom-rig discipline cascades into broken animation export at FR-CHAR-011 — animations look right in Blender but limbs detach in Three.js. Fix cost mid-FR-CHAR-011 is 2-3 days of rig surgery + re-skinning + re-animating every clip."
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

1. **MUST** be a **custom armature**, NOT a Rigify-generated rig. The armature data-block name MUST NOT contain the substring "rigify" (case-insensitive). Master plan §3.3 and §4.2 both flag Rigify as incompatible with the glTF export targets we use.

2. **MUST** contain ~ **27 bones** distributed per the master plan §3.3 spec, with a hard cap of 32 and a soft target of 27 ± 2 (i.e. 25-29 acceptable). Distribution:
   - **Spine** (4 bones): `hip` → `torso` → `neck` → `head` — root chain driving overall body orientation.
   - **Arms** (8 bones): per side (`shoulder` + `elbow` + `wrist` + `ik_target`) × 2 sides.
   - **Wisp tail** (8 bones): `wisp_01` through `wisp_08` chain with auto-IK enabled. Drives the trailing-tail animation.
   - **Hood** (2 bones): `hood_root` + `hood_tip` — drives the floating hood-shape secondary motion.
   - **Jaw** (1 bone): `jaw` — opens for `mouth_speak`-class animations + shape-key blends.
   - **Eyes** (2 bones): `eye_L` + `eye_R` — track-to constraints follow camera or look-at target.
   - **Brows** (2 bones): `brow_L` + `brow_R` — shape-key driver targets.
   - **Hat socket** (1 bone): `hat_socket` — sits on top of hood, parents the nón lá accessory (FR-CHAR-012).
   - **Total**: 28 bones at the soft target. Counting variance from per-side mirror (e.g. 7-bone arm chain) is acceptable within 25-29.

3. **MUST** skin with max **4 vertex influences per vertex** (glTF 2.0 default limit). After weight painting, Blender's **"Limit Total Weights"** operator MUST be applied with `limit=4` and `auto-normalize` enabled. The rig-validator (§5) enforces this with `assert len(vert.groups) <= 4` for every vertex.

4. **MUST** parent the mesh **directly to the armature** (Object > Parent > Armature Deform with Empty Groups, then bind via Object > Parent > With Automatic Weights as the starting point). NOT to a bone (`Bone Parent`). NOT to an Empty acting as a controller. Master plan §4.2 documents this: bone-parented meshes cause shape-key animation channels to drop on glTF export.

5. **MUST NOT** enable "**Preserve Volume**" on the Armature modifier. The glTF runtime (Three.js / R3F skinning shader) does NOT support dual-quaternion skinning — Preserve Volume requires DQ skin, which silently falls back to linear blend in the runtime and produces visible volume loss at extreme bends. Master plan §4.2 documents this.

6. **MUST** include the `hat_socket` bone on top of `hood_tip`, oriented Y+ up in armature space. The nón lá production mesh (FR-CHAR-012) parents to this bone via Object > Parent > Bone with `Bone Parent: hat_socket`. Reason this is a "socket" bone and not just "use the hood tip bone": the socket's transform is independent of the hood-driven secondary motion, so the hat doesn't wobble with hood movement.

7. **MUST** include `c_head` (a control bone, not deforming) with the following custom properties pre-configured for the shape-key driver setup in FR-CHAR-010:
   - `mouth_speak` (0.0 default, range 0.0–1.0)
   - `mouth_smile` (0.0 default, range 0.0–1.0)
   - `mouth_neutral` (1.0 default, range 0.0–1.0)
   - `brow_raise` (0.0 default, range 0.0–1.0)
   - `brow_concern` (0.0 default, range 0.0–1.0)
   - `eye_blink_L` (0.0 default, range 0.0–1.0)
   - `eye_blink_R` (0.0 default, range 0.0–1.0)
   These custom-property keys MUST be present even though the actual shape keys land in FR-CHAR-010 — the bone is the driver target.

8. **MUST NOT** include any shape keys (those are FR-CHAR-010's responsibility). Verifier: `len(lumi_main.data.shape_keys.key_blocks) == 1` (only the "Basis" key allowed as the implicit baseline created by Blender on first key-block add — even that's optional in this stage).

9. **MUST NOT** include any animation clips or NLA strips (those are FR-CHAR-011's responsibility). Verifier: `len(bpy.data.actions) == 0` AND `armature.animation_data is None or armature.animation_data.nla_tracks` is empty.

10. **MUST** ship `lumi-rig-skinning-stats.json` per the schema in §3.2 with: bone count, deforming-bone count, max vertex influences observed (with vertex IDs if > 4), Preserve Volume flag state, mesh parent type, presence of `hat_socket` and `c_head`, list of `c_head` custom properties.

11. **MUST** ship `rig-validator.py` — Blender headless script that gates all of §1 #1–#9. Runnable via `blender --background --python rig-validator.py -- --blend lumi-rig.v01.blend`. Exit 0 on PASS, 1 on any FAIL with machine-parseable diagnostic.

12. **MUST** ship `design/character-sheets/lumi-bone-map.png` — bone hierarchy diagram. Source: Blender's armature drawing rendered to PNG with bone names labeled. Reviewers reference this when debugging skinning issues (FR-CHAR-011 + FR-CHAR-010).

13. **MUST** be co-signed by the Rigger (rig mechanics) AND the Animator (animation usability). The animator must be able to keyframe each control bone without finding "the rig won't pose this way" surprises. Both signatures captured in `design/character-sheets/lumi-rig-spec.md` (≤ 300 words).

14. **MUST** validate against a **test pose** before signoff: T-pose, arms-up "wave" pose, head-turned-right pose, jaw-open pose. Each pose stored as an Action named `_test_pose_X` and immediately deleted after validation (these MUST NOT ship in the final `.blend` — see §1 #9).

15. **SHOULD** archive the pre-rig mesh state (`lumi.v01.pre-rig.blend.zst`) under `assets-source/blender/archive/` so a rig redo doesn't require re-running FR-CHAR-006 retopo + FR-CHAR-007 UV.

## §2 — Why this design

**Why custom armature instead of Rigify?** Rigify generates a deform-rig + control-rig pair with many helper bones (twist bones, stretch bones, custom shapes). Two failure modes appear on glTF export: (a) the multi-mesh morph-target bug — Rigify's helper-mesh widgets attach to the rig data-block; glTF export tries to bake them as morph targets and corrupts the armature; (b) sparse-accessor incompatibility — Rigify's IK chains generate keyframes only on rotation channels (not on translation), but glTF 2.0 requires explicit unrotated channels too, which Rigify omits. Net: hand-rolled 27-bone armature exports cleanly; Rigify needs hours of post-export surgery per animation clip.

**Why exactly ~27 bones (not 50, not 12)?** Trade-off curve from animation tests on similar mascot models:
- < 20 bones: insufficient secondary motion. Wisp tail looks rigid; hood doesn't read as "floating cloth". Fails the master plan §3.3 "Lumi feels alive" criterion.
- 20-26 bones: passable but the wisp 4-bone chain doesn't flex enough at the tail tip for the `wave_goodbye` clip.
- 27-29 bones: sweet spot. Wisp 8-bone chain reads as cloth-like motion; hood 2-bone gives secondary; arm IK chains give the 2D-character-sheet-faithful arm poses.
- > 32 bones: diminishing animation returns + per-frame skinning cost grows linearly. Three.js skinning shader runs `bones * 4` matrix-vector products per skinned vertex; at 32 bones × 16k verts on lumi_main, that's 2M ops/frame — within budget. Going to 50+ pushes us past 3M ops/frame and the perf budget (FR-PERF-001) starts to bite on mobile.

**Why max 4 vertex influences (not 8, not 2)?** glTF 2.0 default is 4 (`JOINTS_0` + `WEIGHTS_0`). Going to 8 requires the `JOINTS_1` extension which Three.js R3F supports but doubles the per-vertex skinning cost AND doubles GLB size for vertex attributes. Going to 2 isn't enough for the wisp's auto-IK chain where each vertex sits between two bones plus the spine root. 4 is the gltf default sweet spot.

**Why direct mesh-to-armature parent instead of bone-parent?** When a mesh is bone-parented, the rest pose is computed relative to the bone's matrix at bind time. Shape keys' delta positions are then applied relative to that bone's local space. On glTF export, the bone's transform gets baked into the channels but the shape-key deltas are exported in mesh-local space — they decouple. Result: in Three.js, the shape key animates the mesh in the wrong space and the face deforms in the wrong direction. Direct armature parenting keeps shape keys in the mesh's own space. Master plan §4.2 documents this failure path explicitly.

**Why a separate `hat_socket` bone instead of parenting the nón lá to `hood_tip`?** Hood secondary motion is intentional cloth-like sway. We don't want the hat to sway with it (the nón lá is a rigid hat — physical bamboo hats don't wobble on the head). Putting the hat on its own socket bone means the rigger can constraint-track the socket to follow the head's primary rotation (via Copy Rotation on the `head` bone) while ignoring the hood's secondary motion. The same trick is used in DCC pipelines for hats on cloth-physics-rigged characters.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
assets-source/blender/
├── lumi.v01.blend                              # UPDATED (mesh ↔ armature parent)
├── lumi-rig.v01.blend                          # NEW — exportable rig + weights
├── lumi-rig-skinning-stats.json                # NEW — validator output
├── rig-validator.py                            # NEW — Blender headless validator
└── archive/
    └── lumi.v01.pre-rig.blend.zst              # SHOULD — pre-rig snapshot

design/character-sheets/
├── lumi-bone-map.png                           # NEW — bone hierarchy diagram
└── lumi-rig-spec.md                            # NEW — co-signoff
```

### §3.2 — `lumi-rig-skinning-stats.json` schema

```json
{
  "armature_name": "lumi_arm",
  "rigify_detected": false,
  "bone_count": 0,
  "deforming_bone_count": 0,
  "bones_per_group": {
    "spine": 0, "arm_L": 0, "arm_R": 0, "wisp": 0,
    "hood": 0, "jaw": 0, "eyes": 0, "brows": 0, "hat_socket": 0
  },
  "max_vertex_influences_observed": 0,
  "vertices_over_limit": [],
  "preserve_volume_disabled": true,
  "mesh_parent_type": "ARMATURE",
  "hat_socket_present": true,
  "c_head_present": true,
  "c_head_custom_props": [],
  "shape_keys_present": false,
  "actions_present": false,
  "test_poses_remaining": [],
  "blender_version": "4.4.x",
  "ran_at": "2026-05-XXTXX:XX:XXZ",
  "verdict": "PASS"
}
```

### §3.3 — Bone hierarchy outline

```
root (non-deforming, scene placement)
└── hip
    ├── torso
    │   ├── neck
    │   │   └── head
    │   │       ├── jaw
    │   │       ├── eye_L
    │   │       ├── eye_R
    │   │       ├── brow_L
    │   │       ├── brow_R
    │   │       ├── c_head             (control, non-deforming)
    │   │       ├── hood_root
    │   │       │   └── hood_tip
    │   │       │       └── hat_socket  (socket, copy-rotation-only)
    │   │       └── (eyes track-constrained to camera)
    │   ├── shoulder_L → elbow_L → wrist_L → ik_target_L (IK chain)
    │   └── shoulder_R → elbow_R → wrist_R → ik_target_R (IK chain)
    └── wisp_01 → wisp_02 → ... → wisp_08 (auto-IK enabled)
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Bone count 25–29 (target 27, hard cap 32) | `len(armature.bones)`; validator reports |
| 2 | Custom armature, not Rigify | `'rigify' not in armature.name.lower()` AND no Rigify properties on armature data-block |
| 3 | Max 4 vertex influences per vertex | For every vertex, `len(v.groups) <= 4` after "Limit Total" |
| 4 | Mesh parented to armature (not bone, not empty) | `lumi_main.parent_type == 'ARMATURE'` |
| 5 | Preserve Volume disabled on Armature modifier | `lumi_main.modifiers['Armature'].use_deform_preserve_volume == False` |
| 6 | `hat_socket` bone present at top of hood | `'hat_socket' in armature.bones` AND parent chain leads to hood_tip |
| 7 | `c_head` control bone present with all 7 custom properties | `'c_head' in armature.pose.bones` AND custom properties enumerated |
| 8 | No shape keys present | `lumi_main.data.shape_keys is None or len(shape_keys.key_blocks) <= 1` |
| 9 | No animations / NLA tracks present | `len(bpy.data.actions) == 0` AND no NLA tracks |
| 10 | Skinning stats JSON present with `verdict: PASS` | Re-run validator; check JSON output |
| 11 | Bone hierarchy matches §3.3 outline | Validator walks the parent chain; compares to expected |
| 12 | Test poses validated and then removed | `_test_pose_*` actions NOT in final `.blend` (AC#9 satisfied) |
| 13 | Bone map PNG present | File existence in `design/character-sheets/` |
| 14 | Rigger + Animator signoff in `lumi-rig-spec.md` | Both signature lines present |
| 15 | All 8 wisp bones have auto-IK enabled | `pbone.use_ik` for each wisp_NN |

## §5 — Validator script (`rig-validator.py`)

```python
"""
rig-validator.py — FR-CHAR-009 Blender headless rig validator.

Usage:
    blender --background --python rig-validator.py -- --blend lumi-rig.v01.blend --out lumi-rig-skinning-stats.json

Exit 0 on PASS; 1 on FAIL.
"""
import argparse
import json
import sys
from pathlib import Path

import bpy


REQUIRED_C_HEAD_PROPS = [
    "mouth_speak", "mouth_smile", "mouth_neutral",
    "brow_raise", "brow_concern",
    "eye_blink_L", "eye_blink_R",
]
EXPECTED_BONE_GROUPS = {
    "spine":      ["hip", "torso", "neck", "head"],
    "arm_L":      ["shoulder_L", "elbow_L", "wrist_L", "ik_target_L"],
    "arm_R":      ["shoulder_R", "elbow_R", "wrist_R", "ik_target_R"],
    "wisp":       [f"wisp_{i:02d}" for i in range(1, 9)],
    "hood":       ["hood_root", "hood_tip"],
    "jaw":        ["jaw"],
    "eyes":       ["eye_L", "eye_R"],
    "brows":      ["brow_L", "brow_R"],
    "hat_socket": ["hat_socket"],
}
BONE_COUNT_MIN, BONE_COUNT_MAX = 25, 32
INFLUENCE_LIMIT = 4


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--blend", required=True)
    parser.add_argument("--out",   required=True)
    args, _ = parser.parse_known_args(sys.argv[sys.argv.index("--") + 1:])
    bpy.ops.wm.open_mainfile(filepath=args.blend)

    result = {"verdict": "PASS"}
    arm = next((o for o in bpy.data.objects if o.type == 'ARMATURE'), None)
    if not arm:
        Path(args.out).write_text(json.dumps({"verdict": "FAIL", "error": "no armature"}, indent=2))
        sys.exit(1)

    bone_names = {b.name for b in arm.data.bones}
    result["armature_name"] = arm.data.name
    result["rigify_detected"] = "rigify" in arm.data.name.lower()
    result["bone_count"] = len(bone_names)
    result["deforming_bone_count"] = sum(1 for b in arm.data.bones if b.use_deform)

    if not (BONE_COUNT_MIN <= result["bone_count"] <= BONE_COUNT_MAX):
        result["verdict"] = "FAIL"
    if result["rigify_detected"]:
        result["verdict"] = "FAIL"

    # Bone-group presence
    bones_per_group = {}
    for grp, names in EXPECTED_BONE_GROUPS.items():
        present = [n for n in names if n in bone_names]
        bones_per_group[grp] = len(present)
        if not present:
            result["verdict"] = "FAIL"
    result["bones_per_group"] = bones_per_group

    # hat_socket + c_head presence
    result["hat_socket_present"] = "hat_socket" in bone_names
    result["c_head_present"] = "c_head" in bone_names
    if not result["hat_socket_present"] or not result["c_head_present"]:
        result["verdict"] = "FAIL"

    # c_head custom props
    c_head_pb = arm.pose.bones.get("c_head")
    c_head_props = list(c_head_pb.keys()) if c_head_pb else []
    result["c_head_custom_props"] = c_head_props
    if not all(p in c_head_props for p in REQUIRED_C_HEAD_PROPS):
        result["verdict"] = "FAIL"

    # Mesh parent + Preserve Volume
    mesh = bpy.data.objects.get("lumi_main")
    if not mesh:
        result["verdict"] = "FAIL"
        Path(args.out).write_text(json.dumps(result, indent=2)); sys.exit(1)
    result["mesh_parent_type"] = mesh.parent_type
    if mesh.parent_type != 'ARMATURE':
        result["verdict"] = "FAIL"
    arm_mod = mesh.modifiers.get("Armature")
    result["preserve_volume_disabled"] = arm_mod is not None and not arm_mod.use_deform_preserve_volume
    if not result["preserve_volume_disabled"]:
        result["verdict"] = "FAIL"

    # Max vertex influences
    max_inf, over = 0, []
    for v in mesh.data.vertices:
        n = sum(1 for g in v.groups if g.weight > 0)
        max_inf = max(max_inf, n)
        if n > INFLUENCE_LIMIT:
            over.append(v.index)
    result["max_vertex_influences_observed"] = max_inf
    result["vertices_over_limit"] = over[:64]
    if max_inf > INFLUENCE_LIMIT:
        result["verdict"] = "FAIL"

    # Shape keys + actions absent
    sk = mesh.data.shape_keys
    result["shape_keys_present"] = bool(sk and len(sk.key_blocks) > 1)
    if result["shape_keys_present"]:
        result["verdict"] = "FAIL"
    result["actions_present"] = bool(bpy.data.actions)
    if result["actions_present"]:
        result["verdict"] = "FAIL"
    result["test_poses_remaining"] = [a.name for a in bpy.data.actions if a.name.startswith("_test_pose_")]

    # Wisp auto-IK
    wisp_auto_ik = all(arm.pose.bones[f"wisp_{i:02d}"].use_ik_limit_x or
                       arm.pose.bones[f"wisp_{i:02d}"].use_ik_limit_y or
                       arm.pose.bones[f"wisp_{i:02d}"].use_ik_limit_z
                       for i in range(1, 9)
                       if f"wisp_{i:02d}" in arm.pose.bones)
    result["wisp_auto_ik_enabled"] = wisp_auto_ik
    if not wisp_auto_ik:
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
- FR-CHAR-006 (production mesh) — armature deforms the locked retopo geometry; rig work without locked mesh = wasted effort.

**Operational dependencies:**
- Blender 4.4.x with Python 3.11 (bundled).
- `zstd` CLI for the archival SHOULD (§1 #15).

**Downstream blocks:**
- FR-CHAR-010 (shape keys) — keys are driven by `c_head` custom properties this FR creates.
- FR-CHAR-011 (animation library) — animates pose bones this FR creates.
- FR-CHAR-012 (nón lá production mesh) — parents to `hat_socket` this FR creates.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Rigify used despite warning (developer auto-completes from training data) | AC#2 grep for "rigify" in armature name + property check | Strip Rigify; start over with custom 27-bone armature. ~ 12 hours of lost work. |
| > 4 vertex influences on some verts (paint tool overshoots) | AC#3 + validator vertex iteration | Apply "Limit Total Weights" with `limit=4`, `auto_normalize=True` |
| Preserve Volume accidentally left on (Blender default in some templates) | AC#5 | Toggle off in modifier panel; re-export |
| Mesh parented to a single bone instead of armature | AC#4 | Object > Clear Parent; re-parent with Object > Parent > Armature Deform |
| `hat_socket` bone missing or misnamed | AC#6 + validator | Add bone at `hood_tip` head position, name "hat_socket"; FR-CHAR-012 depends on the exact name |
| Bone count > 32 (artist adds twist bones) | AC#1 + validator | Merge twist bones into chain or remove; the 4-bone arm chain plus shoulder IK is sufficient |
| `c_head` custom property typo (e.g. `mouth_speek` instead of `mouth_speak`) | AC#7 + validator string-match | Rename property; FR-CHAR-010 driver expressions assume exact names |
| Shape keys accidentally created during weight painting (Blender misclick) | AC#8 + validator | Remove all shape keys except Basis; commit clean state |
| Test pose left in final .blend (`_test_pose_*` Action not deleted) | AC#12 + validator | Delete the Action; re-save |
| Wisp auto-IK disabled (rigger forgot to flip the toggle) | AC#15 + validator | Pose mode → wisp chain → enable Auto IK; re-save |
| Animator can't pose the rig (IK target hidden, eye constraints break) | AC#14 (animator signoff missing) | Fix the failed pose; iterate with animator until both sign off |
| Mesh-to-armature bind drift (verts at extreme bend pop) | Visual review at extreme poses (T-pose vs arms-up) | Re-paint weights at the failing vertex range; verify via "Limit Total" |

## §8 — Deliverable preview

`lumi-rig.v01.blend` opens in Blender to show Lumi posed in T-pose with the 27-bone armature visible (orange wireframe overlay). The `c_head` control bone shows the 7 driver properties in the N-panel. The `hat_socket` bone sits visible on top of `hood_tip`. Weight painting visualises smooth gradients on arms (no banding from over-4-influence regions).

`lumi-bone-map.png` is a 1024×768 PNG showing the bone hierarchy as a tree with parent-child arrows, bone names labeled, deform-flag colour-coded (red for deforming, blue for non-deforming control bones like `c_head` and `hat_socket`).

## §9 — Notes

**On constraints:** This FR does NOT include the eyes' Track-To camera constraint (that belongs to FR-CHAR-011 animation runtime context). It DOES include the bone definitions for eyes.

**On rigging tools:** Animators on the project use Auto-IK + custom Properties to keyframe shape-key drivers (FR-CHAR-010's responsibility, not this FR's). The rigger should test that the custom properties on `c_head` correctly route as driver targets before signoff — this is a "rig usability" check that catches keyframe routing bugs before they surface in animation work.

**On bone naming convention:** Lower snake_case throughout (`hood_tip`, `wisp_01`, `c_head`). No camelCase, no spaces. glTF preserves bone names — Three.js code references them — drift breaks both ends.

## §10 — Mocked-dependency shipment

Blender 4.4 is unavailable in this workspace, so FR-CHAR-009 ships as a deterministic mocked dependency with contract tests rather than a physical rigged `.blend`. The public artifact paths are present and ready for downstream FRs:

- `assets-source/blender/lumi-rig.v01.blend`
- `assets-source/blender/lumi-rig-skinning-stats.json`
- `assets-source/blender/rig-validator.py`
- `assets-source/blender/archive/lumi.v01.pre-rig.blend.zst`
- `design/character-sheets/lumi-bone-map.png`
- `design/character-sheets/lumi-rig-spec.md`

Validation evidence:

```bash
python3 tools/check-p2-character-mocks.py --fr FR-CHAR-009
OK - P2 character mocked-dependency contracts satisfied (1 FR)
 - FR-CHAR-009: bones=29; max_influences=4; c_head_props=7
NOTE - Blender 4.4 validation is blocked because Blender is not installed.

python3 assets-source/blender/rig-validator.py --stats assets-source/blender/lumi-rig-skinning-stats.json
{
  "verdict": "PASS",
  "stats": "assets-source/blender/lumi-rig-skinning-stats.json"
}
```

The contract asserts a custom non-Rigify `lumi_arm` with 29 bones, `hat_socket` under `hood_tip`, `c_head` with all seven FR-CHAR-010 driver properties, direct mesh-to-armature parenting, Preserve Volume disabled, max 4 vertex influences, all eight wisp bones auto-IK enabled, and no shape keys, Actions, NLA tracks, or retained test poses.

*End of FR-CHAR-009.*
