#!/usr/bin/env python3
"""Mock-aware shape-key validator for FR-CHAR-010.

Real non-mocked usage:
    blender --background --python shape-key-validator.py -- --blend lumi-shape-keys.v01.blend --out lumi-shape-keys-stats.json

In this workspace Blender is unavailable. This script validates the mocked
shape-key stats JSON shape when run directly with Python.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path


EXPECTED_KEYS = [
    "eye_close", "eye_squint",
    "mouth_smile", "mouth_speak", "mouth_o",
    "brow_raise", "brow_concern",
    "cheek_puff", "glow_pulse", "hood_tip",
]
FORBIDDEN_KEYS = {"mouth_neutral"}
REQUIRED_C_HEAD_PROPS = {
    "mouth_speak", "mouth_smile", "mouth_neutral",
    "brow_raise", "brow_concern", "eye_blink_L", "eye_blink_R",
    "mouth_o", "cheek_puff", "glow_pulse", "hood_tip",
}


def validate(path: Path) -> list[str]:
    stats = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    if stats.get("verdict") != "PASS":
        errors.append("verdict must be PASS")
    records = stats.get("shape_keys", [])
    names = [record.get("name") for record in records]
    if names != EXPECTED_KEYS:
        errors.append("shape key names/order mismatch")
    if stats.get("shape_key_count") != 10 or len(records) != 10:
        errors.append("shape_key_count must be exactly 10")
    if FORBIDDEN_KEYS.intersection(names) or stats.get("forbidden_shape_keys_present") != []:
        errors.append("mouth_neutral must not be a shape key")
    if set(stats.get("c_head_custom_props", [])) != REQUIRED_C_HEAD_PROPS:
        errors.append("c_head custom property set mismatch")
    for record in records:
        name = record.get("name")
        if record.get("min") != 0.0 or record.get("max") != 1.0 or record.get("value") != 0.0:
            errors.append(f"{name}: range/default mismatch")
        if not record.get("driver_expression"):
            errors.append(f"{name}: missing driver expression")
        if "c_head" not in json.dumps(record.get("driver_target")):
            errors.append(f"{name}: driver target must reference c_head")
        if not isinstance(record.get("vertex_delta_count"), int) or record.get("vertex_delta_count") <= 0:
            errors.append(f"{name}: vertex_delta_count must be > 0")
        if not math.isfinite(float(record.get("max_vertex_delta_m", 0))):
            errors.append(f"{name}: max_vertex_delta_m must be finite")
        if not record.get("silhouette_within_tolerance"):
            errors.append(f"{name}: silhouette tolerance failed")
    if stats.get("gltf_trial_export_morph_targets_detected") != 10:
        errors.append("trial glTF export must report 10 morph targets")
    if stats.get("sparse_accessor_warnings") != []:
        errors.append("sparse accessor warnings must be empty")
    if not stats.get("silhouette_within_tolerance"):
        errors.append("aggregate silhouette tolerance failed")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stats", default="lumi-shape-keys-stats.json")
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
