#!/usr/bin/env python3
"""Mock-aware rig validator for FR-CHAR-009.

Real non-mocked usage:
    blender --background --python rig-validator.py -- --blend lumi-rig.v01.blend --out lumi-rig-skinning-stats.json

In this workspace Blender is unavailable. This script validates the mocked
skinning stats JSON shape when run directly with Python.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REQUIRED_C_HEAD_PROPS = [
    "mouth_speak", "mouth_smile", "mouth_neutral",
    "brow_raise", "brow_concern",
    "eye_blink_L", "eye_blink_R",
]
EXPECTED_BONE_GROUPS = {
    "spine": 4,
    "arm_L": 4,
    "arm_R": 4,
    "wisp": 8,
    "hood": 2,
    "jaw": 1,
    "eyes": 2,
    "brows": 2,
    "hat_socket": 1,
    "c_head": 1,
}


def validate(path: Path) -> list[str]:
    stats = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    if stats.get("verdict") != "PASS":
        errors.append("verdict must be PASS")
    if stats.get("rigify_detected"):
        errors.append("custom armature must not be Rigify")
    if not 25 <= int(stats.get("bone_count", 0)) <= 29:
        errors.append("bone count must be 25-29 for this rig contract")
    if int(stats.get("max_vertex_influences_observed", 99)) > 4:
        errors.append("max vertex influences must be <= 4")
    if stats.get("vertices_over_limit") != []:
        errors.append("vertices_over_limit must be empty")
    if not stats.get("preserve_volume_disabled"):
        errors.append("Preserve Volume must be disabled")
    if stats.get("mesh_parent_type") != "ARMATURE":
        errors.append("mesh_parent_type must be ARMATURE")
    if not stats.get("hat_socket_present") or stats.get("hat_socket_parent") != "hood_tip":
        errors.append("hat_socket must be present under hood_tip")
    if not stats.get("c_head_present"):
        errors.append("c_head must be present")
    props = set(stats.get("c_head_custom_props", []))
    missing_props = [prop for prop in REQUIRED_C_HEAD_PROPS if prop not in props]
    if missing_props:
        errors.append(f"c_head missing custom props: {', '.join(missing_props)}")
    groups = stats.get("bones_per_group", {})
    for group, expected in EXPECTED_BONE_GROUPS.items():
        if groups.get(group) != expected:
            errors.append(f"{group} bone count mismatch")
    if stats.get("shape_keys_present"):
        errors.append("shape keys must not ship in FR-CHAR-009")
    if stats.get("actions_present") or stats.get("nla_tracks_present"):
        errors.append("actions/NLA tracks must not ship in FR-CHAR-009")
    if stats.get("test_poses_remaining") != []:
        errors.append("test poses must be deleted before shipment")
    if len(stats.get("wisp_auto_ik_enabled", [])) != 8:
        errors.append("all 8 wisp bones must have auto-IK enabled")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stats", default="lumi-rig-skinning-stats.json")
    args, _ = parser.parse_known_args()
    stats_path = Path(args.stats)
    errors = validate(stats_path)
    if errors:
        print(json.dumps({"verdict": "FAIL", "errors": errors}, indent=2))
        return 1
    print(json.dumps({"verdict": "PASS", "stats": str(stats_path)}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
