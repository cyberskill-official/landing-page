#!/usr/bin/env python3
"""Validate P2 character mocked-dependency contracts."""
from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover - Pillow is part of the asset toolchain here.
    raise SystemExit(f"ERROR: Pillow is required to inspect image dimensions: {exc}") from exc


ROOT = Path(__file__).resolve().parent.parent
ASSETS_SOURCE = ROOT / "assets-source" / "blender"
ASSETS_RAW = ROOT / "assets-built" / "raw"
DESIGN = ROOT / "design" / "character-sheets"

EXPECTED_BLOCKS = {
    "hood": (8300, 11300),
    "face": (6000, 8000),
    "body_arms": (6000, 8000),
    "wisp": (3400, 5000),
}

UV_ATLAS_SPEC = {
    "lumi_main": {"resolution": [2048, 2048], "padding": 4, "max_islands": 24, "density": 256, "face": 384},
    "lumi_wisp": {"resolution": [1024, 1024], "padding": 2, "max_islands": 6, "density": 192, "face": None},
    "non_la": {"resolution": [512, 512], "padding": 2, "max_islands": 4, "density": 192, "face": None},
}

TEXTURE_MAPS = {
    "BaseColor": "lumi-BaseColor.png",
    "ORM": "lumi-ORM.png",
    "Normal": "lumi-Normal.png",
    "Emissive": "lumi-Emissive.png",
}

RIG_GROUPS = {
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

C_HEAD_PROPS = {
    "mouth_speak",
    "mouth_smile",
    "mouth_neutral",
    "brow_raise",
    "brow_concern",
    "eye_blink_L",
    "eye_blink_R",
}

SHAPE_KEYS = [
    "eye_close",
    "eye_squint",
    "mouth_smile",
    "mouth_speak",
    "mouth_o",
    "brow_raise",
    "brow_concern",
    "cheek_puff",
    "glow_pulse",
    "hood_tip",
]

SHAPE_C_HEAD_PROPS = C_HEAD_PROPS | {"mouth_o", "cheek_puff", "glow_pulse", "hood_tip"}

ANIMATION_CLIPS = [
    ("idle", 120, True),
    ("fly_in", 60, False),
    ("point", 36, False),
    ("summon", 90, False),
    ("wave", 45, False),
    ("coil_idle", 150, True),
    ("paint", 120, True),
    ("split_to_4", 75, False),
    ("wave_goodbye", 60, False),
    ("nonla_appear", 30, False),
    ("nonla_tip", 45, False),
]

NONLA_TEXTURES = {
    "BaseColor": "lumi-nonla-BaseColor.png",
    "Normal": "lumi-nonla-Normal.png",
}


def fail(message: str) -> None:
    raise AssertionError(message)


def assert_file(path: Path) -> None:
    if not path.exists():
        fail(f"missing {path.relative_to(ROOT)}")
    if path.stat().st_size <= 0:
        fail(f"empty {path.relative_to(ROOT)}")


def read_glb_json(path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    if len(data) < 20:
        fail(f"{path.relative_to(ROOT)} is too small to be a GLB")
    magic, version, total_length = struct.unpack_from("<III", data, 0)
    if magic != 0x46546C67 or version != 2 or total_length != len(data):
        fail(f"{path.relative_to(ROOT)} has invalid GLB header")
    json_length, chunk_type = struct.unpack_from("<I4s", data, 12)
    if chunk_type != b"JSON":
        fail(f"{path.relative_to(ROOT)} first chunk is not JSON")
    return json.loads(data[20 : 20 + json_length].decode("utf-8"))


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"{path.relative_to(ROOT)} is not valid JSON: {exc}")
    raise AssertionError("unreachable")


def has_lineage(payload: dict[str, Any], fr_id: str) -> bool:
    history = payload.get("fr_history", [])
    if isinstance(history, str):
        history = [history]
    return payload.get("fr_id") == fr_id or payload.get("extends_fr") == fr_id or fr_id in history


def check_fr_char_006() -> list[str]:
    blend = ASSETS_SOURCE / "lumi.v01.blend"
    sculpt = ASSETS_SOURCE / "lumi-sculpt.v01.blend"
    raw = ASSETS_RAW / "lumi.raw.glb"
    stats_path = ASSETS_SOURCE / "lumi-mesh-stats.json"
    silhouette = ASSETS_SOURCE / "lumi-silhouette-32x32.png"
    note = ASSETS_SOURCE / "FR-CHAR-006-mock-contract.md"
    for path in (blend, sculpt, raw, stats_path, silhouette, note):
        assert_file(path)

    for path in (blend, sculpt):
        placeholder = read_json(path)
        if placeholder.get("format") != "BLENDER_4_4_PLACEHOLDER":
            fail(f"{path.relative_to(ROOT)} missing Blender placeholder marker")
        forbidden = set(placeholder.get("forbidden_payloads", []))
        if not {"armature", "shape_keys", "actions", "image_textures", "animations"}.issubset(forbidden):
            fail(f"{path.relative_to(ROOT)} missing forbidden payload contract")

    glb = read_glb_json(raw)
    node_names = {node.get("name") for node in glb.get("nodes", [])}
    if not {"lumi_main", "lumi_wisp", "hat_socket"}.issubset(node_names):
        fail(f"FR-CHAR-006 GLB nodes incomplete: {sorted(str(name) for name in node_names)}")
    if raw.stat().st_size > 6 * 1024 * 1024:
        fail("FR-CHAR-006 raw GLB exceeds 6 MB")

    stats = read_json(stats_path)
    if stats.get("fr_id") != "FR-CHAR-006" or not stats.get("contract_only"):
        fail("FR-CHAR-006 stats must identify the mocked contract")
    total = stats.get("tri_count_total")
    if not isinstance(total, int) or not (23700 <= total <= 32300):
        fail(f"FR-CHAR-006 tri total out of contract range: {total}")
    for block, (floor, ceiling) in EXPECTED_BLOCKS.items():
        value = stats.get("tri_count_per_block", {}).get(block)
        if not isinstance(value, int) or not (floor <= value <= ceiling):
            fail(f"FR-CHAR-006 block {block} out of range: {value}")
    if not stats.get("watertight_lumi_main"):
        fail("FR-CHAR-006 lumi_main must be watertight in contract stats")
    if stats.get("doubled_vertices_lumi_main") != 0 or stats.get("doubled_vertices_lumi_wisp") != 0:
        fail("FR-CHAR-006 doubled vertex counts must be zero")
    for forbidden in ("armatures", "shape_keys", "actions", "images"):
        if stats.get(forbidden) != []:
            fail(f"FR-CHAR-006 forbidden payload present in stats: {forbidden}")
    if stats.get("max_vertex_influences") != 0:
        fail("FR-CHAR-006 must not include rig influences")
    if not stats.get("hood_c_emboss_is_geometry"):
        fail("FR-CHAR-006 hood C emboss must be geometry")
    if not (2.5 <= float(stats.get("hood_c_emboss_depth_mm", 0)) <= 3.5):
        fail("FR-CHAR-006 hood C emboss depth outside 3mm +/-0.5mm")
    if not (1.58 <= float(stats.get("lumi_height_m", 0)) <= 1.62):
        fail("FR-CHAR-006 Lumi height outside 1.60m +/-0.02m")

    with Image.open(silhouette) as image:
        if image.size != (32, 32):
            fail(f"FR-CHAR-006 silhouette must be 32x32, got {image.size}")

    note_text = note.read_text(encoding="utf-8")
    for snippet in ("Blender 4.4", "geometry-only", "no rig", "no UV", "no PBR textures"):
        if snippet not in note_text:
            fail(f"FR-CHAR-006 mock contract note missing {snippet!r}")

    return [f"tri_total={total}", f"raw_glb_bytes={raw.stat().st_size}", "silhouette=32x32"]


def check_fr_char_007() -> list[str]:
    files = [
        ASSETS_SOURCE / "lumi-uv-layout-main.png",
        ASSETS_SOURCE / "lumi-uv-layout-wisp.png",
        ASSETS_SOURCE / "lumi-uv-layout-nonla.png",
        ASSETS_SOURCE / "lumi-uv-stats.json",
        ASSETS_SOURCE / "uv-validator.py",
        ASSETS_SOURCE / "FR-CHAR-007-mock-contract.md",
        ASSETS_SOURCE / "archive" / "lumi.v01.pre-uv.blend.zst",
        ROOT / "design" / "character-sheets" / "uv-seam-map.png",
        ROOT / "design" / "character-sheets" / "uv-seam-map.md",
    ]
    for path in files:
        assert_file(path)

    expected_images = {
        "lumi-uv-layout-main.png": (2048, 2048),
        "lumi-uv-layout-wisp.png": (1024, 1024),
        "lumi-uv-layout-nonla.png": (512, 512),
        "uv-seam-map.png": (1600, 900),
    }
    for name, expected_size in expected_images.items():
        base = ASSETS_SOURCE if name.startswith("lumi-uv") else ROOT / "design" / "character-sheets"
        with Image.open(base / name) as image:
            if image.size != expected_size:
                fail(f"FR-CHAR-007 {name} expected {expected_size}, got {image.size}")

    stats = read_json(ASSETS_SOURCE / "lumi-uv-stats.json")
    if stats.get("fr_id") != "FR-CHAR-007" or stats.get("verdict") != "PASS" or not stats.get("contract_only"):
        fail("FR-CHAR-007 stats must identify a PASS mocked contract")
    atlases = stats.get("atlases", {})
    for name, spec in UV_ATLAS_SPEC.items():
        atlas = atlases.get(name, {})
        if atlas.get("resolution") != spec["resolution"]:
            fail(f"FR-CHAR-007 {name} resolution mismatch")
        if atlas.get("overlap_count") != 0:
            fail(f"FR-CHAR-007 {name} overlap_count must be 0")
        if atlas.get("padding_px_min", 0) < spec["padding"]:
            fail(f"FR-CHAR-007 {name} padding below floor")
        if atlas.get("island_count", 999) > spec["max_islands"]:
            fail(f"FR-CHAR-007 {name} island count exceeds cap")
        if not atlas.get("uv_within_unit_square"):
            fail(f"FR-CHAR-007 {name} UVs must be inside unit square")
        if atlas.get("seams_on_visible_surface"):
            fail(f"FR-CHAR-007 {name} seam-on-visible-surface must be false")
        density = atlas.get("texel_density_px_per_m", {})
        if density.get("min_visible", 0) < spec["density"]:
            fail(f"FR-CHAR-007 {name} visible texel density below floor")
        if spec["face"] is not None and density.get("face_min", 0) < spec["face"]:
            fail(f"FR-CHAR-007 {name} face texel density below floor")

    signoff = (ROOT / "design" / "character-sheets" / "uv-seam-map.md").read_text(encoding="utf-8")
    for snippet in ("3D Modeler", "Texture Artist", "mock UV contract"):
        if snippet not in signoff:
            fail(f"FR-CHAR-007 signoff missing {snippet!r}")

    validator = (ASSETS_SOURCE / "uv-validator.py").read_text(encoding="utf-8")
    for snippet in ("lumi_main", "lumi_wisp", "non_la", "overlap_count", "padding"):
        if snippet not in validator:
            fail(f"FR-CHAR-007 validator missing {snippet!r}")

    return [
        "atlases=2048/1024/512",
        f"main_islands={atlases['lumi_main']['island_count']}",
        f"face_density={atlases['lumi_main']['texel_density_px_per_m']['face_min']}",
    ]


def check_fr_char_008() -> list[str]:
    substance = ROOT / "assets-source" / "substance"
    texdir = ROOT / "assets-built" / "raw" / "textures"
    required = [
        substance / "lumi.spp",
        substance / "lumi-substance-export-preset.spexp",
        substance / "FR-CHAR-008-mock-contract.md",
        texdir / "lumi-texture-stats.json",
        ROOT / "tools" / "texture-validator.py",
        ROOT / "design" / "character-sheets" / "lumi-texture-spec.md",
    ]
    required.extend(texdir / file_name for file_name in TEXTURE_MAPS.values())
    for path in required:
        assert_file(path)

    for role, file_name in TEXTURE_MAPS.items():
        with Image.open(texdir / file_name) as image:
            if image.size != (2048, 2048):
                fail(f"FR-CHAR-008 {role} texture must be 2048x2048, got {image.size}")
            if image.mode != "RGB":
                fail(f"FR-CHAR-008 {role} texture must be RGB, got {image.mode}")

    spp = read_json(substance / "lumi.spp")
    if spp.get("format") != "SUBSTANCE_PAINTER_PLACEHOLDER":
        fail("FR-CHAR-008 Substance placeholder marker missing")
    preset = read_json(substance / "lumi-substance-export-preset.spexp")
    if preset.get("normal_convention") != "OpenGL":
        fail("FR-CHAR-008 export preset must specify OpenGL normals")
    orm_channels = preset.get("outputs", {}).get("ORM", {}).get("channels", {})
    if orm_channels != {"R": "AO", "G": "Roughness", "B": "Metallic"}:
        fail("FR-CHAR-008 ORM channel packing mismatch")

    stats = read_json(texdir / "lumi-texture-stats.json")
    if stats.get("fr_id") != "FR-CHAR-008" or stats.get("verdict") != "PASS" or not stats.get("contract_only"):
        fail("FR-CHAR-008 stats must identify a PASS mocked contract")
    if stats.get("pbr_values") != {"metallic": 0.4, "roughness": 0.35}:
        fail("FR-CHAR-008 PBR values mismatch")
    if stats.get("ktx2_preview_vram_mb", 999) > 4:
        fail("FR-CHAR-008 KTX2 preview VRAM exceeds 4 MB")
    maps = stats.get("maps", {})
    if set(maps) != set(TEXTURE_MAPS):
        fail("FR-CHAR-008 stats must include exactly four maps")
    if maps["BaseColor"].get("palette_match_rate") != 1.0 or maps["BaseColor"].get("off_palette_pixel_count") != 0:
        fail("FR-CHAR-008 BaseColor palette match failed")
    if not maps["BaseColor"].get("no_cool_tones"):
        fail("FR-CHAR-008 BaseColor must not bake cool tones")
    if maps["Normal"].get("normal_convention") != "OpenGL" or maps["Normal"].get("g_mean_top_region", 0) <= 0.5:
        fail("FR-CHAR-008 Normal map must be OpenGL Y+")
    if maps["Emissive"].get("mask_area_fraction", 1) > 0.25 or not maps["Emissive"].get("within_cap"):
        fail("FR-CHAR-008 Emissive mask area exceeds cap")
    if maps["ORM"].get("channel_packing") != {"R": "AO", "G": "Roughness", "B": "Metallic"}:
        fail("FR-CHAR-008 ORM stats channel packing mismatch")

    spec = (ROOT / "design" / "character-sheets" / "lumi-texture-spec.md").read_text(encoding="utf-8")
    if len(spec.split()) > 400:
        fail("FR-CHAR-008 texture spec exceeds 400 words")
    for snippet in ("Texture Artist", "Founder", "metallic 0.4", "roughness 0.35"):
        if snippet not in spec:
            fail(f"FR-CHAR-008 texture spec missing {snippet!r}")

    return ["textures=4x2048", "pbr=0.4/0.35", f"ktx2_preview={stats['ktx2_preview_vram_mb']}MB"]


def check_fr_char_009() -> list[str]:
    required = [
        ASSETS_SOURCE / "lumi.v01.blend",
        ASSETS_SOURCE / "lumi-rig.v01.blend",
        ASSETS_SOURCE / "lumi-rig-skinning-stats.json",
        ASSETS_SOURCE / "rig-validator.py",
        ASSETS_SOURCE / "FR-CHAR-009-mock-contract.md",
        ASSETS_SOURCE / "archive" / "lumi.v01.pre-rig.blend.zst",
        DESIGN / "lumi-bone-map.png",
        DESIGN / "lumi-rig-spec.md",
    ]
    for path in required:
        assert_file(path)

    rig_blend = read_json(ASSETS_SOURCE / "lumi-rig.v01.blend")
    if rig_blend.get("format") != "BLENDER_4_4_PLACEHOLDER":
        fail("FR-CHAR-009 rig blend placeholder marker missing")
    if not has_lineage(rig_blend, "FR-CHAR-009"):
        fail("FR-CHAR-009 rig blend placeholder lineage missing")
    if not rig_blend.get("custom_armature") or rig_blend.get("rigify_detected"):
        fail("FR-CHAR-009 rig placeholder must assert a custom non-Rigify armature")
    if not C_HEAD_PROPS.issubset(set(rig_blend.get("c_head_custom_props", []))):
        fail("FR-CHAR-009 rig placeholder c_head custom props mismatch")

    mesh_blend = read_json(ASSETS_SOURCE / "lumi.v01.blend")
    binding = mesh_blend.get("rig_binding", {})
    if binding.get("fr_id") != "FR-CHAR-009" or binding.get("mesh_parent_type") != "ARMATURE":
        fail("FR-CHAR-009 lumi.v01.blend must record direct armature binding")
    if not binding.get("preserve_volume_disabled"):
        fail("FR-CHAR-009 lumi.v01.blend must disable Preserve Volume")
    if not C_HEAD_PROPS.issubset(set(binding.get("c_head_custom_props", []))):
        fail("FR-CHAR-009 lumi.v01.blend c_head custom props mismatch")

    stats = read_json(ASSETS_SOURCE / "lumi-rig-skinning-stats.json")
    if stats.get("fr_id") != "FR-CHAR-009" or stats.get("verdict") != "PASS" or not stats.get("contract_only"):
        fail("FR-CHAR-009 stats must identify a PASS mocked contract")
    if stats.get("rigify_detected"):
        fail("FR-CHAR-009 must not detect Rigify")
    bone_count = stats.get("bone_count")
    if not isinstance(bone_count, int) or not (25 <= bone_count <= 29):
        fail(f"FR-CHAR-009 bone_count outside 25-29 target: {bone_count}")
    if stats.get("deforming_bone_count", 0) > bone_count:
        fail("FR-CHAR-009 deforming_bone_count exceeds bone_count")
    for group, expected in RIG_GROUPS.items():
        if stats.get("bones_per_group", {}).get(group) != expected:
            fail(f"FR-CHAR-009 {group} bone count mismatch")
    if int(stats.get("max_vertex_influences_observed", 99)) > 4:
        fail("FR-CHAR-009 max vertex influences exceeds 4")
    if stats.get("vertices_over_limit") != []:
        fail("FR-CHAR-009 vertices_over_limit must be empty")
    if not stats.get("preserve_volume_disabled"):
        fail("FR-CHAR-009 Preserve Volume must be disabled")
    if stats.get("mesh_parent_type") != "ARMATURE":
        fail("FR-CHAR-009 mesh must be parented directly to armature")
    if not stats.get("hat_socket_present") or stats.get("hat_socket_parent") != "hood_tip":
        fail("FR-CHAR-009 hat_socket must be present under hood_tip")
    if not stats.get("c_head_present") or set(stats.get("c_head_custom_props", [])) != C_HEAD_PROPS:
        fail("FR-CHAR-009 c_head custom props mismatch")
    if stats.get("shape_keys_present") or stats.get("actions_present") or stats.get("nla_tracks_present"):
        fail("FR-CHAR-009 must not ship shape keys, actions, or NLA tracks")
    if stats.get("test_poses_remaining") != []:
        fail("FR-CHAR-009 test poses must be removed before shipment")
    if len(stats.get("wisp_auto_ik_enabled", [])) != 8:
        fail("FR-CHAR-009 all 8 wisp bones must have auto-IK enabled")

    with Image.open(DESIGN / "lumi-bone-map.png") as image:
        if image.size != (1400, 1000):
            fail(f"FR-CHAR-009 bone map must be 1400x1000, got {image.size}")

    spec = (DESIGN / "lumi-rig-spec.md").read_text(encoding="utf-8")
    if len(spec.split()) > 300:
        fail("FR-CHAR-009 rig spec exceeds 300 words")
    for snippet in ("Rigger", "Animator", "hat_socket", "c_head", "max vertex influences"):
        if snippet not in spec:
            fail(f"FR-CHAR-009 rig spec missing {snippet!r}")

    validator = (ASSETS_SOURCE / "rig-validator.py").read_text(encoding="utf-8")
    for snippet in ("REQUIRED_C_HEAD_PROPS", "EXPECTED_BONE_GROUPS", "mesh_parent_type", "wisp_auto_ik_enabled"):
        if snippet not in validator:
            fail(f"FR-CHAR-009 validator missing {snippet!r}")

    note = (ASSETS_SOURCE / "FR-CHAR-009-mock-contract.md").read_text(encoding="utf-8")
    for snippet in ("Blender 4.4", "non-Rigify", "hat_socket", "shape keys", "animation payloads"):
        if snippet not in note:
            fail(f"FR-CHAR-009 mock contract note missing {snippet!r}")

    return [
        f"bones={bone_count}",
        f"max_influences={stats['max_vertex_influences_observed']}",
        f"c_head_props={len(stats['c_head_custom_props'])}",
    ]


def check_fr_char_010() -> list[str]:
    required = [
        ASSETS_SOURCE / "lumi-rig.v01.blend",
        ASSETS_SOURCE / "lumi-shape-keys.v01.blend",
        ASSETS_SOURCE / "lumi-shape-keys-stats.json",
        ASSETS_SOURCE / "shape-key-validator.py",
        ASSETS_SOURCE / "FR-CHAR-010-mock-contract.md",
        ASSETS_SOURCE / "archive" / "lumi-rig.v01.pre-shape-keys.blend.zst",
        DESIGN / "lumi-shape-key-spec.md",
        DESIGN / "lumi-shape-key-contact-sheet.html",
    ]
    for path in required:
        assert_file(path)

    rig_blend = read_json(ASSETS_SOURCE / "lumi-rig.v01.blend")
    shape_blend = read_json(ASSETS_SOURCE / "lumi-shape-keys.v01.blend")
    for label, payload in (("rig", rig_blend), ("shape", shape_blend)):
        if payload.get("format") != "BLENDER_4_4_PLACEHOLDER" or not has_lineage(payload, "FR-CHAR-010"):
            fail(f"FR-CHAR-010 {label} blend placeholder marker missing")
        if payload.get("shape_keys") != SHAPE_KEYS:
            fail(f"FR-CHAR-010 {label} blend shape key list mismatch")
        if set(payload.get("c_head_custom_props", [])) != SHAPE_C_HEAD_PROPS:
            fail(f"FR-CHAR-010 {label} blend c_head custom props mismatch")
        if "mouth_neutral_shape_key" not in set(payload.get("forbidden_payloads", [])):
            fail(f"FR-CHAR-010 {label} blend must forbid mouth_neutral shape key")

    stats = read_json(ASSETS_SOURCE / "lumi-shape-keys-stats.json")
    if stats.get("fr_id") != "FR-CHAR-010" or stats.get("verdict") != "PASS" or not stats.get("contract_only"):
        fail("FR-CHAR-010 stats must identify a PASS mocked contract")
    records = stats.get("shape_keys", [])
    if stats.get("shape_key_count") != 10 or len(records) != 10:
        fail("FR-CHAR-010 must ship exactly 10 shape keys")
    names = [record.get("name") for record in records]
    if names != SHAPE_KEYS:
        fail(f"FR-CHAR-010 shape key names mismatch: {names}")
    if "mouth_neutral" in names or stats.get("forbidden_shape_keys_present") != []:
        fail("FR-CHAR-010 must not include a mouth_neutral shape key")
    if set(stats.get("c_head_custom_props", [])) != SHAPE_C_HEAD_PROPS:
        fail("FR-CHAR-010 c_head custom props mismatch")
    for record in records:
        name = record.get("name")
        if record.get("min") != 0.0 or record.get("max") != 1.0 or record.get("value") != 0.0:
            fail(f"FR-CHAR-010 {name} range/default mismatch")
        if not record.get("driver_expression"):
            fail(f"FR-CHAR-010 {name} missing driver expression")
        if "c_head" not in json.dumps(record.get("driver_target")):
            fail(f"FR-CHAR-010 {name} driver target must reference c_head")
        if not isinstance(record.get("vertex_delta_count"), int) or record.get("vertex_delta_count") <= 0:
            fail(f"FR-CHAR-010 {name} vertex delta count must be > 0")
        if not record.get("silhouette_within_tolerance"):
            fail(f"FR-CHAR-010 {name} silhouette tolerance failed")
    if stats.get("gltf_trial_export_morph_targets_detected") != 10:
        fail("FR-CHAR-010 trial export must report 10 morph targets")
    if stats.get("sparse_accessor_warnings") != []:
        fail("FR-CHAR-010 sparse accessor warnings must be empty")
    if not stats.get("silhouette_within_tolerance"):
        fail("FR-CHAR-010 aggregate silhouette tolerance failed")

    spec = (DESIGN / "lumi-shape-key-spec.md").read_text(encoding="utf-8")
    if len(spec.split()) > 250:
        fail("FR-CHAR-010 shape-key spec exceeds 250 words")
    for snippet in ("Rigger", "Animator", "Founder", "mouth_neutral", "c_head"):
        if snippet not in spec:
            fail(f"FR-CHAR-010 shape-key spec missing {snippet!r}")

    contact_sheet = (DESIGN / "lumi-shape-key-contact-sheet.html").read_text(encoding="utf-8")
    for key in SHAPE_KEYS:
        if contact_sheet.count(key) < 2:
            fail(f"FR-CHAR-010 contact sheet missing {key!r}")

    validator = (ASSETS_SOURCE / "shape-key-validator.py").read_text(encoding="utf-8")
    for snippet in ("EXPECTED_KEYS", "FORBIDDEN_KEYS", "sparse_accessor_warnings", "gltf_trial_export_morph_targets_detected"):
        if snippet not in validator:
            fail(f"FR-CHAR-010 validator missing {snippet!r}")

    note = (ASSETS_SOURCE / "FR-CHAR-010-mock-contract.md").read_text(encoding="utf-8")
    for snippet in ("Blender 4.4", "exactly ten shape keys", "mouth_neutral", "sparse-accessor", "silhouette"):
        if snippet not in note:
            fail(f"FR-CHAR-010 mock contract note missing {snippet!r}")

    return [
        "shape_keys=10",
        f"c_head_props={len(stats['c_head_custom_props'])}",
        f"morph_targets={stats['gltf_trial_export_morph_targets_detected']}",
    ]


def check_fr_char_011() -> list[str]:
    thumb_dir = DESIGN / "lumi-animation-thumbnails"
    required = [
        ASSETS_SOURCE / "lumi-rig.v01.blend",
        ASSETS_SOURCE / "lumi-animations.v01.blend",
        ASSETS_SOURCE / "lumi-animation-stats.json",
        ASSETS_SOURCE / "animation-validator.py",
        ASSETS_SOURCE / "FR-CHAR-011-mock-contract.md",
        ASSETS_SOURCE / "archive" / "lumi-rig.v01.pre-anim.blend.zst",
        DESIGN / "lumi-animation-spec.md",
        DESIGN / "lumi-animation-storyboard.md",
    ]
    required.extend(thumb_dir / f"{name}-key-pose.png" for name, _frames, _loop in ANIMATION_CLIPS)
    for path in required:
        assert_file(path)

    expected_names = [name for name, _frames, _loop in ANIMATION_CLIPS]
    rig_blend = read_json(ASSETS_SOURCE / "lumi-rig.v01.blend")
    anim_blend = read_json(ASSETS_SOURCE / "lumi-animations.v01.blend")
    for label, payload in (("rig", rig_blend), ("animation", anim_blend)):
        if payload.get("format") != "BLENDER_4_4_PLACEHOLDER" or not has_lineage(payload, "FR-CHAR-011"):
            fail(f"FR-CHAR-011 {label} blend placeholder lineage missing")
        library = payload.get("animation_library", {})
        if library.get("sample_rate_fps") != 30:
            fail(f"FR-CHAR-011 {label} blend sample rate mismatch")
        if library.get("nla_strips") != expected_names:
            fail(f"FR-CHAR-011 {label} blend NLA strip names mismatch")
        if library.get("optimize_animation_size") is not False:
            fail(f"FR-CHAR-011 {label} blend optimize flag must be false")
        if not library.get("rig_topology_unchanged") or not library.get("shape_keys_unchanged"):
            fail(f"FR-CHAR-011 {label} blend must preserve rig and shape-key baselines")

    stats = read_json(ASSETS_SOURCE / "lumi-animation-stats.json")
    if stats.get("fr_id") != "FR-CHAR-011" or stats.get("verdict") != "PASS" or not stats.get("contract_only"):
        fail("FR-CHAR-011 stats must identify a PASS mocked contract")
    if stats.get("clip_count") != 11 or stats.get("sample_rate_fps") != 30:
        fail("FR-CHAR-011 clip count/sample rate mismatch")
    clips = stats.get("clips", [])
    if [clip.get("name") for clip in clips] != expected_names:
        fail("FR-CHAR-011 clip name/order mismatch")
    expected_by_name = {name: {"frames": frames, "loop": loop} for name, frames, loop in ANIMATION_CLIPS}
    for clip in clips:
        name = clip.get("name")
        spec = expected_by_name[name]
        if abs(int(clip.get("frame_count", -999)) - spec["frames"]) > 3:
            fail(f"FR-CHAR-011 {name} frame count outside tolerance")
        if clip.get("loop") != spec["loop"]:
            fail(f"FR-CHAR-011 {name} loop flag mismatch")
        if clip.get("nla_strip_name") != name:
            fail(f"FR-CHAR-011 {name} NLA strip name drift")
        if clip.get("loop_close_delta", 99) is not None and float(clip.get("loop_close_delta", 99)) > 0.001:
            fail(f"FR-CHAR-011 {name} loop_close_delta exceeds limit")
        if name == "fly_in" and clip.get("easing_modifier") != "EASE_OUT_QUINT":
            fail("FR-CHAR-011 fly_in missing EASE_OUT_QUINT")
        if name in {"paint", "coil_idle"} and not any((span[1] - span[0]) >= 15 for span in clip.get("hold_subregions", [])):
            fail(f"FR-CHAR-011 {name} missing >=0.5s hold")
        if not clip.get("bones_animated") or int(clip.get("bones_animated_count", 0)) != len(clip.get("bones_animated", [])):
            fail(f"FR-CHAR-011 {name} bones_animated count mismatch")
        if int(clip.get("shape_keys_animated_count", 0)) != len(clip.get("shape_keys_animated", [])):
            fail(f"FR-CHAR-011 {name} shape_keys_animated count mismatch")
    if not stats.get("rig_unchanged") or not stats.get("shape_keys_unchanged"):
        fail("FR-CHAR-011 must preserve rig topology and shape-key names")
    if stats.get("scratch_actions_remaining") != []:
        fail("FR-CHAR-011 scratch actions must be empty")
    export = stats.get("gltf_trial_export", {})
    if export.get("animation_count") != 11 or export.get("animation_names") != expected_names:
        fail("FR-CHAR-011 trial export animation names mismatch")
    if export.get("optimize_animation_size") is not False:
        fail("FR-CHAR-011 trial export optimize flag must be false")

    for name in expected_names:
        with Image.open(thumb_dir / f"{name}-key-pose.png") as image:
            if image.size != (512, 512):
                fail(f"FR-CHAR-011 {name} thumbnail must be 512x512, got {image.size}")

    storyboard = (DESIGN / "lumi-animation-storyboard.md").read_text(encoding="utf-8")
    if len(storyboard.split()) > 1500:
        fail("FR-CHAR-011 storyboard exceeds 1500 words")
    for name in expected_names:
        if name not in storyboard:
            fail(f"FR-CHAR-011 storyboard missing {name!r}")

    spec = (DESIGN / "lumi-animation-spec.md").read_text(encoding="utf-8")
    if len(spec.split()) > 500:
        fail("FR-CHAR-011 animation spec exceeds 500 words")
    for snippet in ("Animator", "Founder", "EASE_OUT_QUINT", "Optimize Animation Size", "scratch actions"):
        if snippet not in spec:
            fail(f"FR-CHAR-011 animation spec missing {snippet!r}")

    validator = (ASSETS_SOURCE / "animation-validator.py").read_text(encoding="utf-8")
    for snippet in ("EXPECTED_CLIPS", "LOOP_CLOSE_DELTA_MAX", "optimize_animation_size", "EASE_OUT_QUINT"):
        if snippet not in validator:
            fail(f"FR-CHAR-011 validator missing {snippet!r}")

    note = (ASSETS_SOURCE / "FR-CHAR-011-mock-contract.md").read_text(encoding="utf-8")
    for snippet in ("Blender 4.4", "11 NLA strips", "Optimize Animation Size", "loop-close", "trial glTF"):
        if snippet not in note:
            fail(f"FR-CHAR-011 mock contract note missing {snippet!r}")

    return [
        "clips=11",
        "fps=30",
        f"trial_export={export['animation_count']}",
    ]


def check_fr_char_012() -> list[str]:
    texdir = ROOT / "assets-built" / "raw" / "textures"
    nonla_dir = DESIGN / "nonla"
    raw_glb = ROOT / "assets-built" / "raw" / "lumi-nonla.raw.glb"
    required = [
        ASSETS_SOURCE / "lumi-nonla.v01.blend",
        raw_glb,
        texdir / NONLA_TEXTURES["BaseColor"],
        texdir / NONLA_TEXTURES["Normal"],
        ASSETS_SOURCE / "lumi-nonla-stats.json",
        ASSETS_SOURCE / "nonla-validator.py",
        ASSETS_SOURCE / "FR-CHAR-012-mock-contract.md",
        nonla_dir / "lumi-nonla-render.png",
        nonla_dir / "lumi-nonla-spec.md",
        ASSETS_SOURCE / "archive" / "nonla-iterations" / "lumi-nonla-silhouette-a.blend.zst",
    ]
    for path in required:
        assert_file(path)

    blend = read_json(ASSETS_SOURCE / "lumi-nonla.v01.blend")
    if blend.get("format") != "BLENDER_4_4_PLACEHOLDER" or blend.get("fr_id") != "FR-CHAR-012":
        fail("FR-CHAR-012 blend placeholder marker missing")
    if blend.get("mesh_name") != "lumi_nonla" or blend.get("parent_bone") != "hat_socket":
        fail("FR-CHAR-012 blend mesh/parent contract mismatch")
    if blend.get("nonla_visible_default") is not False or not blend.get("casual_register_only"):
        fail("FR-CHAR-012 blend visibility/cultural contract mismatch")

    glb = read_glb_json(raw_glb)
    node_names = {node.get("name") for node in glb.get("nodes", [])}
    if "lumi_nonla" not in node_names:
        fail("FR-CHAR-012 raw GLB missing lumi_nonla node")
    if raw_glb.stat().st_size > 400 * 1024:
        fail("FR-CHAR-012 raw GLB exceeds 400 KB")

    stats = read_json(ASSETS_SOURCE / "lumi-nonla-stats.json")
    if stats.get("fr_id") != "FR-CHAR-012" or stats.get("verdict") != "PASS" or not stats.get("contract_only"):
        fail("FR-CHAR-012 stats must identify a PASS mocked contract")
    tri_count = stats.get("triangle_count")
    if not isinstance(tri_count, int) or tri_count > 600 or tri_count < 400:
        fail(f"FR-CHAR-012 triangle_count outside 400-600 contract: {tri_count}")
    if not (0.075 <= float(stats.get("brim_diameter_units", 0)) <= 0.080):
        fail("FR-CHAR-012 brim diameter outside range")
    if not (0.045 <= float(stats.get("cone_height_units", 0)) <= 0.055):
        fail("FR-CHAR-012 cone height outside range")
    if stats.get("parent_type") != "BONE" or stats.get("parent_bone") != "hat_socket":
        fail("FR-CHAR-012 must parent to hat_socket bone")
    if stats.get("nonla_visible_default") is not False:
        fail("FR-CHAR-012 nonla_visible default must be false")
    if stats.get("scale_applied") != [1.0, 1.0, 1.0] or stats.get("rotation_applied") != [0.0, 0.0, 0.0]:
        fail("FR-CHAR-012 scale/rotation must be applied")
    if stats.get("uv_atlas_size") != [512, 512] or not stats.get("uv_within_unit_square"):
        fail("FR-CHAR-012 UV atlas contract mismatch")
    if not stats.get("raw_glb_within_400kb_cap") or stats.get("raw_glb_bytes") != raw_glb.stat().st_size:
        fail("FR-CHAR-012 raw GLB size stats mismatch")

    for role, file_name in NONLA_TEXTURES.items():
        with Image.open(texdir / file_name) as image:
            if image.size != (512, 512):
                fail(f"FR-CHAR-012 {role} texture must be 512x512, got {image.size}")
            if image.mode != "RGB":
                fail(f"FR-CHAR-012 {role} texture must be RGB, got {image.mode}")
    with Image.open(nonla_dir / "lumi-nonla-render.png") as image:
        if image.size != (512, 512) or image.mode != "RGBA":
            fail(f"FR-CHAR-012 canonical render must be 512x512 RGBA, got {image.size} {image.mode}")

    base_stats = stats.get("textures", {}).get("BaseColor", {})
    expected_colours = {
        "exterior_red_hex": "#DA251D",
        "interior_gold_hex": "#F9D966",
        "star_yellow_hex": "#FFEB3B",
    }
    for key, value in expected_colours.items():
        if base_stats.get(key) != value:
            fail(f"FR-CHAR-012 {key} mismatch")
    if not base_stats.get("single_star_detected") or not base_stats.get("no_decorative_patterns_detected"):
        fail("FR-CHAR-012 single-star/casual-register checks failed")
    if stats.get("textures", {}).get("Normal", {}).get("opengl_convention") is not True:
        fail("FR-CHAR-012 normal map must use OpenGL convention")

    rig = read_json(ASSETS_SOURCE / "lumi-rig.v01.blend")
    accessory = rig.get("accessories", {}).get("lumi_nonla", {})
    if accessory.get("parent_bone") != "hat_socket" or accessory.get("nonla_visible_default") is not False:
        fail("FR-CHAR-012 rig accessory binding missing")

    spec = (nonla_dir / "lumi-nonla-spec.md").read_text(encoding="utf-8")
    if len(spec.split()) > 300:
        fail("FR-CHAR-012 nonla spec exceeds 300 words")
    for snippet in ("3D Modeler", "Founder", "casual", "#DA251D", "hat_socket"):
        if snippet not in spec:
            fail(f"FR-CHAR-012 nonla spec missing {snippet!r}")

    validator = (ASSETS_SOURCE / "nonla-validator.py").read_text(encoding="utf-8")
    for snippet in ("TRI_CAP", "hat_socket", "single-star", "raw GLB"):
        if snippet not in validator:
            fail(f"FR-CHAR-012 validator missing {snippet!r}")

    note = (ASSETS_SOURCE / "FR-CHAR-012-mock-contract.md").read_text(encoding="utf-8")
    for snippet in ("Blender 4.4", "hat_socket", "single star", "raw GLB <=400 KB", "casual"):
        if snippet not in note:
            fail(f"FR-CHAR-012 mock contract note missing {snippet!r}")

    return [
        f"triangles={tri_count}",
        f"raw_glb_bytes={raw_glb.stat().st_size}",
        "textures=512",
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--fr",
        choices=[
            "FR-CHAR-006",
            "FR-CHAR-007",
            "FR-CHAR-008",
            "FR-CHAR-009",
            "FR-CHAR-010",
            "FR-CHAR-011",
            "FR-CHAR-012",
        ],
        default="FR-CHAR-006",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.fr == "FR-CHAR-006":
            details = check_fr_char_006()
        elif args.fr == "FR-CHAR-007":
            details = check_fr_char_007()
        elif args.fr == "FR-CHAR-008":
            details = check_fr_char_008()
        elif args.fr == "FR-CHAR-009":
            details = check_fr_char_009()
        elif args.fr == "FR-CHAR-010":
            details = check_fr_char_010()
        elif args.fr == "FR-CHAR-011":
            details = check_fr_char_011()
        else:
            details = check_fr_char_012()
    except AssertionError as exc:
        print(f"FAIL - {exc}")
        return 1
    print("OK - P2 character mocked-dependency contracts satisfied (1 FR)")
    print(f" - {args.fr}: " + "; ".join(details))
    print("NOTE - Blender 4.4 validation is blocked because Blender is not installed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
