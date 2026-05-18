#!/usr/bin/env python3
"""Validate generated P1 greybox fallback artifacts."""
from __future__ import annotations

import json
import struct
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
ASSETS_SOURCE = ROOT / "assets-source" / "blender"
SCENE_SOURCE = ASSETS_SOURCE / "scenes"
ASSETS_RAW = ROOT / "assets-built" / "raw"
ASSETS_BUILT = ROOT / "assets-built"
DESIGN = ROOT / "design" / "character-sheets"

LUMI_BLOCKS = {"lumi_hood", "lumi_face", "lumi_body", "lumi_arms", "lumi_wisp"}
SCENES = ["scene-0", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5", "scene-6", "footer"]


def read_glb_json(path: Path) -> dict:
    data = path.read_bytes()
    magic, version, total_length = struct.unpack_from("<III", data, 0)
    if magic != 0x46546C67 or version != 2 or total_length != len(data):
        raise AssertionError(f"{path}: invalid GLB header")
    json_length, chunk_type = struct.unpack_from("<I4s", data, 12)
    if chunk_type != b"JSON":
        raise AssertionError(f"{path}: first chunk is not JSON")
    return json.loads(data[20 : 20 + json_length].decode("utf-8"))


def assert_exists(path: Path) -> None:
    if not path.exists():
        raise AssertionError(f"missing {path.relative_to(ROOT)}")


def check_lumi() -> None:
    required = [
        ASSETS_SOURCE / "lumi-greybox.v01.blend",
        ASSETS_RAW / "lumi-greybox.raw.glb",
        ASSETS_BUILT / "lumi-greybox.glb",
        DESIGN / "greybox-comparison.png",
        ASSETS_SOURCE / "lumi-greybox-NOTES.md",
        ASSETS_SOURCE / "signoff-FR-CHAR-004-founder.eml",
        ASSETS_SOURCE / "signoff-FR-CHAR-004-rigger.eml",
    ]
    for path in required:
        assert_exists(path)

    raw = ASSETS_RAW / "lumi-greybox.raw.glb"
    built = ASSETS_BUILT / "lumi-greybox.glb"
    if raw.stat().st_size > 1_000_000:
        raise AssertionError("lumi raw GLB exceeds 1 MB")
    if built.stat().st_size > 400_000:
        raise AssertionError("lumi optimized fallback GLB exceeds 400 KB")

    glb = read_glb_json(raw)
    node_names = {node["name"] for node in glb["nodes"]}
    if node_names != LUMI_BLOCKS:
        raise AssertionError(f"lumi node names mismatch: {sorted(node_names)}")
    total = sum(mesh["extras"]["triCount"] for mesh in glb["meshes"])
    if total > 10_000:
        raise AssertionError(f"lumi tri hard cap exceeded: {total}")

    placeholder = json.loads((ASSETS_SOURCE / "lumi-greybox.v01.blend").read_text(encoding="utf-8"))
    if placeholder.get("format") != "BLENDER_4_4_PLACEHOLDER":
        raise AssertionError("lumi .blend placeholder marker missing")


def check_scenes() -> None:
    assert_exists(SCENE_SOURCE / "SCENE_GREYBOX_NOTES.md")
    assert_exists(SCENE_SOURCE / "signoff-FR-CHAR-005-r3f-architect.eml")
    for scene in SCENES:
        for path in [
            SCENE_SOURCE / f"{scene}-greybox.v01.blend",
            ASSETS_RAW / f"{scene}-greybox.raw.glb",
            ASSETS_BUILT / f"{scene}-greybox.glb",
        ]:
            assert_exists(path)

        if (ASSETS_BUILT / f"{scene}-greybox.glb").stat().st_size > 1_500_000:
            raise AssertionError(f"{scene} optimized fallback GLB exceeds 1.5 MB")

        placeholder = json.loads((SCENE_SOURCE / f"{scene}-greybox.v01.blend").read_text(encoding="utf-8"))
        if placeholder.get("format") != "BLENDER_4_4_PLACEHOLDER":
            raise AssertionError(f"{scene} .blend placeholder marker missing")
        if "lumi-greybox.v01.blend#collection=lumi_main" not in placeholder.get("lumiLinkedCollection", ""):
            raise AssertionError(f"{scene} does not reference linked lumi collection")
        if placeholder.get("propTriCount", 0) > 6000:
            raise AssertionError(f"{scene} prop tri count exceeds 6000")

        glb = read_glb_json(ASSETS_RAW / f"{scene}-greybox.raw.glb")
        if glb.get("extras", {}).get("scene") != scene:
            raise AssertionError(f"{scene} raw GLB extras scene mismatch")


def main() -> int:
    try:
        check_lumi()
        check_scenes()
    except AssertionError as exc:
        print(f"FAIL - {exc}")
        return 1
    print("OK - P1 greybox fallback artifacts pass deterministic checks")
    print("NOTE - Blender 4.4 validation is still blocked because Blender is not installed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
