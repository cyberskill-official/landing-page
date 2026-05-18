#!/usr/bin/env python3
"""Mock-aware UV validator for FR-CHAR-007.

Real non-mocked usage:
    blender --background --python uv-validator.py -- --blend lumi.v01.blend --out lumi-uv-stats.json

In this workspace Blender is unavailable. This script therefore validates the
mocked stats JSON shape when run directly with Python.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ATLAS_SPEC = {
    "lumi_main": {"resolution": [2048, 2048], "padding": 4, "max_islands": 24, "density": 256, "face": 384},
    "lumi_wisp": {"resolution": [1024, 1024], "padding": 2, "max_islands": 6, "density": 192, "face": None},
    "non_la": {"resolution": [512, 512], "padding": 2, "max_islands": 4, "density": 192, "face": None},
}


def validate(path: Path) -> list[str]:
    stats = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    if stats.get("verdict") != "PASS":
        errors.append("verdict must be PASS")
    atlases = stats.get("atlases", {})
    for name, spec in ATLAS_SPEC.items():
        atlas = atlases.get(name, {})
        if atlas.get("resolution") != spec["resolution"]:
            errors.append(f"{name}: resolution mismatch")
        if atlas.get("overlap_count") != 0:
            errors.append(f"{name}: overlap_count must be 0")
        if atlas.get("padding_px_min", 0) < spec["padding"]:
            errors.append(f"{name}: padding below floor")
        if atlas.get("island_count", 999) > spec["max_islands"]:
            errors.append(f"{name}: too many islands")
        if not atlas.get("uv_within_unit_square"):
            errors.append(f"{name}: UVs must be in unit square")
        if atlas.get("seams_on_visible_surface"):
            errors.append(f"{name}: seams on visible surface")
        density = atlas.get("texel_density_px_per_m", {})
        if density.get("min_visible", 0) < spec["density"]:
            errors.append(f"{name}: visible density below floor")
        if spec["face"] is not None and density.get("face_min", 0) < spec["face"]:
            errors.append(f"{name}: face density below floor")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stats", default="lumi-uv-stats.json")
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
