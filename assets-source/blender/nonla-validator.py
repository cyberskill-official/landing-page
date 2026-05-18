#!/usr/bin/env python3
"""Mock-aware nón lá validator for FR-CHAR-012.

Real non-mocked usage:
    blender --background --python nonla-validator.py -- --blend lumi-nonla.v01.blend --out lumi-nonla-stats.json

In this workspace Blender is unavailable. This script validates the mocked
accessory stats JSON shape when run directly with Python.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


TRI_CAP = 600
EXPECTED_COLOURS = {
    "exterior_red_hex": "#DA251D",
    "interior_gold_hex": "#F9D966",
    "star_yellow_hex": "#FFEB3B",
}


def validate(path: Path) -> list[str]:
    stats = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    if stats.get("verdict") != "PASS":
        errors.append("verdict must be PASS")
    if int(stats.get("triangle_count", 9999)) > TRI_CAP:
        errors.append("triangle_count must be <= 600")
    if not 0.075 <= float(stats.get("brim_diameter_units", 0)) <= 0.080:
        errors.append("brim diameter outside 0.075-0.080")
    if not 0.045 <= float(stats.get("cone_height_units", 0)) <= 0.055:
        errors.append("cone height outside 0.045-0.055")
    if stats.get("parent_type") != "BONE" or stats.get("parent_bone") != "hat_socket":
        errors.append("must parent to hat_socket bone")
    if stats.get("nonla_visible_default") is not False:
        errors.append("nonla_visible default must be false")
    if stats.get("scale_applied") != [1.0, 1.0, 1.0] or stats.get("rotation_applied") != [0.0, 0.0, 0.0]:
        errors.append("scale/rotation must be applied")
    if stats.get("uv_atlas_size") != [512, 512] or not stats.get("uv_within_unit_square"):
        errors.append("UV atlas contract mismatch")
    base = stats.get("textures", {}).get("BaseColor", {})
    for key, expected in EXPECTED_COLOURS.items():
        if base.get(key) != expected:
            errors.append(f"{key} mismatch")
    if not base.get("single_star_detected") or not base.get("no_decorative_patterns_detected"):
        errors.append("single-star/casual-register checks failed")
    normal = stats.get("textures", {}).get("Normal", {})
    if normal.get("resolution") != [512, 512] or not normal.get("opengl_convention"):
        errors.append("normal map contract mismatch")
    if not stats.get("raw_glb_within_400kb_cap"):
        errors.append("raw GLB exceeds 400 KB")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stats", default="lumi-nonla-stats.json")
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
