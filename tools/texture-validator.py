#!/usr/bin/env python3
"""Validate FR-CHAR-008 Lumi texture contract artifacts."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
TEXTURES = ["BaseColor", "ORM", "Normal", "Emissive"]


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def validate(texdir: Path) -> tuple[dict, list[str]]:
    errors: list[str] = []
    stats_path = texdir / "lumi-texture-stats.json"
    if not stats_path.exists():
        return {}, [f"missing {stats_path}"]
    stats = json.loads(stats_path.read_text(encoding="utf-8"))
    if stats.get("verdict") != "PASS":
        fail(errors, "stats verdict must be PASS")
    if stats.get("pbr_values") != {"metallic": 0.4, "roughness": 0.35}:
        fail(errors, "PBR values must be metallic 0.4 and roughness 0.35")
    if stats.get("ktx2_preview_vram_mb", 999) > 4:
        fail(errors, "KTX2 preview VRAM must be <= 4 MB")

    maps = stats.get("maps", {})
    for role in TEXTURES:
        file_name = f"lumi-{role}.png"
        path = texdir / file_name
        if not path.exists():
            fail(errors, f"missing {file_name}")
            continue
        with Image.open(path) as image:
            if image.size != (2048, 2048):
                fail(errors, f"{file_name} must be 2048x2048")
            if image.mode != "RGB":
                fail(errors, f"{file_name} must be RGB")
        entry = maps.get(role)
        if not entry:
            fail(errors, f"stats missing map {role}")
            continue
        if entry.get("resolution") != [2048, 2048]:
            fail(errors, f"{role} stats resolution mismatch")
        if entry.get("channel_count") != 3:
            fail(errors, f"{role} stats channel count mismatch")

    base = maps.get("BaseColor", {})
    if base.get("palette_match_rate") != 1.0 or base.get("off_palette_pixel_count") != 0:
        fail(errors, "BaseColor must be fully palette-matched")
    if not base.get("no_cool_tones"):
        fail(errors, "BaseColor must not include cool tones")
    orm = maps.get("ORM", {})
    if orm.get("channel_packing") != {"R": "AO", "G": "Roughness", "B": "Metallic"}:
        fail(errors, "ORM channel packing must be R=AO, G=Roughness, B=Metallic")
    normal = maps.get("Normal", {})
    if normal.get("normal_convention") != "OpenGL" or normal.get("g_mean_top_region", 0) <= 0.5:
        fail(errors, "Normal map must be OpenGL Y+")
    emissive = maps.get("Emissive", {})
    if emissive.get("mask_area_fraction", 1) > 0.25 or not emissive.get("within_cap"):
        fail(errors, "Emissive mask must stay <= 25%")
    return stats, errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--texdir", default=str(ROOT / "assets-built" / "raw" / "textures"))
    args = parser.parse_args()
    stats, errors = validate(Path(args.texdir))
    if errors:
        print(json.dumps({"verdict": "FAIL", "errors": errors}, indent=2))
        return 1
    print(json.dumps({"verdict": "PASS", "maps": sorted(stats.get("maps", {}))}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
