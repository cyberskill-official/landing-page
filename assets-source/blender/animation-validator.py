#!/usr/bin/env python3
"""Mock-aware animation validator for FR-CHAR-011.

Real non-mocked usage:
    blender --background --python animation-validator.py -- --blend lumi-animations.v01.blend --out lumi-animation-stats.json

In this workspace Blender is unavailable. This script validates the mocked
animation stats JSON shape when run directly with Python.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


EXPECTED_CLIPS = {
    "idle": {"frames": 120, "loop": True},
    "fly_in": {"frames": 60, "loop": False, "easing": "EASE_OUT_QUINT"},
    "point": {"frames": 36, "loop": False},
    "summon": {"frames": 90, "loop": False},
    "wave": {"frames": 45, "loop": False},
    "coil_idle": {"frames": 150, "loop": True, "hold": True},
    "paint": {"frames": 120, "loop": True, "hold": True},
    "split_to_4": {"frames": 75, "loop": False},
    "wave_goodbye": {"frames": 60, "loop": False},
    "nonla_appear": {"frames": 30, "loop": False},
    "nonla_tip": {"frames": 45, "loop": False},
}
FRAME_TOLERANCE = 3
LOOP_CLOSE_DELTA_MAX = 0.001


def validate(path: Path) -> list[str]:
    stats = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    if stats.get("verdict") != "PASS":
        errors.append("verdict must be PASS")
    if stats.get("sample_rate_fps") != 30:
        errors.append("sample_rate_fps must be 30")
    clips = stats.get("clips", [])
    names = [clip.get("name") for clip in clips]
    if names != list(EXPECTED_CLIPS):
        errors.append("NLA strip names/order mismatch")
    if stats.get("clip_count") != 11 or len(clips) != 11:
        errors.append("clip_count must be exactly 11")
    for clip in clips:
        name = clip.get("name")
        spec = EXPECTED_CLIPS.get(name, {})
        if abs(int(clip.get("frame_count", -999)) - spec.get("frames", 0)) > FRAME_TOLERANCE:
            errors.append(f"{name}: frame count outside tolerance")
        if clip.get("loop") != spec.get("loop"):
            errors.append(f"{name}: loop flag mismatch")
        if spec.get("loop") and float(clip.get("loop_close_delta", 99)) > LOOP_CLOSE_DELTA_MAX:
            errors.append(f"{name}: loop_close_delta exceeds limit")
        if spec.get("hold") and not any((span[1] - span[0]) >= 15 for span in clip.get("hold_subregions", [])):
            errors.append(f"{name}: missing >=0.5s hold subregion")
        if spec.get("easing") and clip.get("easing_modifier") != spec["easing"]:
            errors.append(f"{name}: missing EASE_OUT_QUINT")
        if clip.get("nla_strip_name") != name:
            errors.append(f"{name}: NLA strip name drift")
    if not stats.get("rig_unchanged") or not stats.get("shape_keys_unchanged"):
        errors.append("rig and shape key baselines must be unchanged")
    if stats.get("scratch_actions_remaining") != []:
        errors.append("scratch actions must be empty")
    export = stats.get("gltf_trial_export", {})
    if export.get("animation_count") != 11 or export.get("animation_names") != list(EXPECTED_CLIPS):
        errors.append("trial glTF animation list mismatch")
    if export.get("optimize_animation_size") is not False:
        errors.append("optimize_animation_size must be false")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stats", default="lumi-animation-stats.json")
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
