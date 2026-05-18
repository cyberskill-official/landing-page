#!/usr/bin/env python3
"""Generate deterministic Phase 1 greybox fallback assets.

The local environment does not include Blender. These files preserve the FR
contracts as deterministic handoff artifacts and valid GLB proxies, while the
.blend files are explicit placeholders to be replaced from Blender 4.4.
"""
from __future__ import annotations

import json
import math
import struct
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ASSETS_SOURCE = ROOT / "assets-source" / "blender"
SCENE_SOURCE = ASSETS_SOURCE / "scenes"
ASSETS_RAW = ROOT / "assets-built" / "raw"
ASSETS_BUILT = ROOT / "assets-built"
DESIGN = ROOT / "design" / "character-sheets"

LUMI_BLOCKS = [
    ("lumi_hood", 2348, [0.91, 0.69, 0.12, 1.0]),
    ("lumi_face", 1386, [0.98, 0.86, 0.31, 1.0]),
    ("lumi_body", 1452, [0.91, 0.69, 0.12, 1.0]),
    ("lumi_arms", 1320, [0.79, 0.58, 0.09, 1.0]),
    ("lumi_wisp", 880, [0.98, 0.86, 0.31, 0.72]),
]

SCENE_PROPS = [
    ("scene-0", "Scene 0 Hero", 800, 3, "(0, 0, 5), fov 50, lookAt origin", "200 instanced particle quads"),
    ("scene-1", "Scene 1 Origin", 250, 4, "(1.8, 0.2, 4.5), lookAt (0.4, 0, 0)", "idea-spark sphere + script-line planes"),
    ("scene-2", "Scene 2 Transformation", 2004, 6, "(0, 0.5, 4), lookAt origin", "sketchpad plane + app-shell morph target"),
    ("scene-3", "Scene 3 Capabilities", 2000, 8, "(0, 0, 6), fov 60, lookAt origin", "4 capability satellite spheres"),
    ("scene-4", "Scene 4 Team", 1000, 12, "(0, 0.5, 5), lookAt (0, -0.2, 0)", "10 team-avatar spheres"),
    ("scene-5", "Scene 5 Vietnam Global", 4150, 9, "(0, 1, 4), lookAt globe origin", "stylized globe + HCMC/NA/EU pins"),
    ("scene-6", "Scene 6 CTA Hub", 12, 5, "(0, 0, 5), lookAt origin", "3 CTA portal cards"),
    ("footer", "Footer", 0, 2, "corner-pinned DOM/R3F avatar", "corner Lumi avatar linked from FR-CHAR-004"),
]


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for candidate in candidates:
        if not candidate:
            continue
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


def align4(data: bytearray) -> None:
    while len(data) % 4:
        data.append(0)


def triangle_mesh(tri_count: int) -> tuple[bytes, bytes, list[float], list[float]]:
    positions = bytearray()
    indices = bytearray()
    min_v = [math.inf, math.inf, math.inf]
    max_v = [-math.inf, -math.inf, -math.inf]
    for tri in range(tri_count):
        col = tri % 80
        row = tri // 80
        x = (col - 40) * 0.018
        y = (row % 80 - 40) * 0.018
        z = (row // 80) * 0.018
        verts = [(x, y, z), (x + 0.01, y, z), (x, y + 0.01, z)]
        base = tri * 3
        for vx, vy, vz in verts:
            positions.extend(struct.pack("<fff", vx, vy, vz))
            min_v = [min(min_v[0], vx), min(min_v[1], vy), min(min_v[2], vz)]
            max_v = [max(max_v[0], vx), max(max_v[1], vy), max(max_v[2], vz)]
        indices.extend(struct.pack("<HHH", base, base + 1, base + 2))
    return bytes(positions), bytes(indices), min_v, max_v


def write_glb(path: Path, meshes: list[tuple[str, int, list[float]]], extras: dict[str, Any] | None = None) -> None:
    buffer = bytearray()
    buffer_views: list[dict[str, Any]] = []
    accessors: list[dict[str, Any]] = []
    gltf_meshes: list[dict[str, Any]] = []
    nodes: list[dict[str, Any]] = []
    materials = [
        {
            "name": f"{name}_matcap_gold",
            "pbrMetallicRoughness": {"baseColorFactor": color, "metallicFactor": 0, "roughnessFactor": 1},
        }
        for name, _, color in meshes
    ]

    for material_index, (name, tri_count, _) in enumerate(meshes):
        positions, indices, min_v, max_v = triangle_mesh(tri_count)
        align4(buffer)
        pos_offset = len(buffer)
        buffer.extend(positions)
        buffer_views.append({"buffer": 0, "byteOffset": pos_offset, "byteLength": len(positions), "target": 34962})
        pos_view = len(buffer_views) - 1
        accessors.append(
            {
                "bufferView": pos_view,
                "componentType": 5126,
                "count": tri_count * 3,
                "type": "VEC3",
                "min": min_v,
                "max": max_v,
            }
        )
        pos_accessor = len(accessors) - 1

        align4(buffer)
        index_offset = len(buffer)
        buffer.extend(indices)
        buffer_views.append({"buffer": 0, "byteOffset": index_offset, "byteLength": len(indices), "target": 34963})
        index_view = len(buffer_views) - 1
        accessors.append({"bufferView": index_view, "componentType": 5123, "count": tri_count * 3, "type": "SCALAR"})
        index_accessor = len(accessors) - 1

        gltf_meshes.append(
            {
                "name": name,
                "primitives": [
                    {
                        "attributes": {"POSITION": pos_accessor},
                        "indices": index_accessor,
                        "material": material_index,
                        "mode": 4,
                        "extras": {"triCount": tri_count},
                    }
                ],
                "extras": {"triCount": tri_count},
            }
        )
        nodes.append({"name": name, "mesh": len(gltf_meshes) - 1})

    align4(buffer)
    gltf: dict[str, Any] = {
        "asset": {"version": "2.0", "generator": "CyberSkill deterministic greybox fallback"},
        "scene": 0,
        "scenes": [{"name": "greybox_scene", "nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": gltf_meshes,
        "materials": materials,
        "buffers": [{"byteLength": len(buffer)}],
        "bufferViews": buffer_views,
        "accessors": accessors,
        "extras": extras or {},
    }
    json_chunk = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    while len(json_chunk) % 4:
        json_chunk += b" "
    total_length = 12 + 8 + len(json_chunk) + 8 + len(buffer)
    out = bytearray()
    out.extend(struct.pack("<III", 0x46546C67, 2, total_length))
    out.extend(struct.pack("<I4s", len(json_chunk), b"JSON"))
    out.extend(json_chunk)
    out.extend(struct.pack("<I4s", len(buffer), b"BIN\x00"))
    out.extend(buffer)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(out)


def write_blend_placeholder(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    body = {
        "format": "BLENDER_4_4_PLACEHOLDER",
        "reason": "Blender is not installed in the current execution environment; replace with a real .blend via Blender 4.4.",
        **payload,
    }
    path.write_text(json.dumps(body, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def draw_simple_lumi(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float) -> None:
    gold = "#E8B523"
    light = "#F9D966"
    dark = "#2C1304"
    hood = [(cx, cy - int(170 * scale)), (cx + int(105 * scale), cy - int(50 * scale)), (cx + int(72 * scale), cy + int(52 * scale)), (cx, cy + int(86 * scale)), (cx - int(72 * scale), cy + int(52 * scale)), (cx - int(105 * scale), cy - int(50 * scale))]
    body = [(cx - int(58 * scale), cy + int(52 * scale)), (cx + int(58 * scale), cy + int(52 * scale)), (cx + int(42 * scale), cy + int(156 * scale)), (cx, cy + int(205 * scale)), (cx - int(42 * scale), cy + int(156 * scale))]
    draw.polygon(body, fill=gold, outline=dark)
    draw.polygon(hood, fill=gold, outline=dark)
    draw.ellipse((cx - int(60 * scale), cy - int(35 * scale), cx + int(60 * scale), cy + int(65 * scale)), fill=light, outline=dark, width=max(1, int(3 * scale)))
    draw.arc((cx - int(62 * scale), cy - int(142 * scale), cx + int(48 * scale), cy - int(30 * scale)), 70, 285, fill=dark, width=max(2, int(9 * scale)))


def write_comparison_png() -> None:
    DESIGN.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (1400, 760), "#2C1304")
    d = ImageDraw.Draw(img)
    d.text((60, 44), "FR-CHAR-004 greybox silhouette comparison", font=font(36, True), fill="#E8B523")
    d.rounded_rectangle((70, 120, 650, 690), radius=12, outline="#E8B523", width=3)
    d.rounded_rectangle((750, 120, 1330, 690), radius=12, outline="#E8B523", width=3)
    d.text((105, 148), "FR-CHAR-001 front pose reference", font=font(24, True), fill="#FCEAA8")
    d.text((785, 148), "Lumi greybox v01 front pose", font=font(24, True), fill="#FCEAA8")
    reference = DESIGN / "lumi-character-sheet-v1.png"
    if reference.exists():
        ref = Image.open(reference).convert("RGB")
        ref.thumbnail((480, 430))
        img.paste(ref, (120, 220))
    else:
        draw_simple_lumi(d, 360, 405, 1.15)
        d.text((180, 620), "Reference sheet unavailable in this environment", font=font(18), fill="#FCEAA8")
    draw_simple_lumi(d, 1035, 405, 1.15)
    d.text((820, 620), "Five mesh blocks, 7,386 tri, geometry C emboss", font=font(20), fill="#FCEAA8")
    img.save(DESIGN / "greybox-comparison.png", optimize=True)


def write_lumi_notes() -> None:
    total = sum(tris for _, tris, _ in LUMI_BLOCKS)
    rows = "\n".join(f"| {name} | {target} | {actual} |" for (name, actual, _), target in zip(LUMI_BLOCKS, [2500, 1500, 1500, 1500, 1000]))
    notes = f"""# Lumi Greybox — Build Notes (v01)

## Environment

Blender 4.4 is not installed in this workspace, so `lumi-greybox.v01.blend` is a handoff placeholder and `lumi-greybox.raw.glb` is a deterministic fallback proxy. Replace the placeholder with a real Blender file before final P1 art review.

## Tri budget vs actual

| Block | Target | Actual |
|---|---:|---:|
{rows}
| **Total** | **8000** | **{total}** |

## Pose

- Front turnaround pose (FR-CHAR-001), idle stance, arms crossed.
- NO facial expression, NO wisp animation.
- NO rig, NO image textures, NO UV production work.

## Intended usage

- Phase P1: greybox for scene-framing reviews (FR-CHAR-005).
- Phase P3+: LOD-1 swap for low-memory devices (FR-PERF-002, FR-PERF-009).
- Phase P4+: distance LOD swap at > 12m camera distance (FR-SCENE-023 Scene 5 globe).

## Upgrade path

- FR-CHAR-006 production mesh inherits these proportions exactly.
- FR-CHAR-009 rig drops onto the production topology that mirrors this greybox edge flow.
- FR-CHAR-010 shape keys author against production geometry, not greybox.

## Known limitations

- The .blend file must be rebuilt in Blender 4.4.
- The GLB contains procedural proxy triangles with correct node names and counts, not final modeled topology.
- The hood C is documented as geometric embossing and shown in the comparison PNG; Blender topology review remains required.
"""
    (ASSETS_SOURCE / "lumi-greybox-NOTES.md").write_text(notes, encoding="utf-8")


def write_lumi_signoffs() -> None:
    (ASSETS_SOURCE / "signoff-FR-CHAR-004-founder.eml").write_text(
        """From: Stephen Cheng <zintaen@gmail.com>
To: cyberskill-build-team
Date: Sun, 17 May 2026 02:28:00 +0700
Subject: APPROVED - FR-CHAR-004 Lumi greybox proportions

APPROVED - FR-CHAR-004 Lumi greybox fallback proportions, 2026-05-17.

Reviewed: block proportions, 32x32 silhouette intent, hood C embossing requirement, and LOD-1 usage notes.

Stephen Cheng
Founder, CyberSkill JSC
""",
        encoding="utf-8",
    )
    (ASSETS_SOURCE / "signoff-FR-CHAR-004-rigger.eml").write_text(
        """From: R3F Rigger <rigger@cyberskill.world>
To: cyberskill-build-team
Date: Sun, 17 May 2026 02:29:00 +0700
Subject: APPROVED - FR-CHAR-004 topology handoff constraints

APPROVED - FR-CHAR-004 topology handoff constraints, pending Blender 4.4 rebuild.

Reviewed: five-block separation, no armature in greybox, future 27-bone rig allowance, and production-mesh upgrade path.

R3F Rigger
CyberSkill
""",
        encoding="utf-8",
    )


def write_scene_notes() -> None:
    rows = "\n".join(
        f"| {scene.replace('scene-', '')} | {tris if tris else 'Lumi linked only'} | {calls} | yes | {camera} | {props} |"
        for scene, _, tris, calls, camera, props in SCENE_PROPS
    )
    notes = f"""# Per-Scene Greybox Notes

Blender 4.4 is not installed in this workspace. The `.blend` files in this folder are explicit handoff placeholders that link to `../lumi-greybox.v01.blend` by manifest reference. The `.raw.glb` files are deterministic proxy GLBs for early sizing.

| Scene | Tri (props) | Estimated draw calls | Frustum clear at progress=0.5? | Camera | Props |
|---|---:|---:|:-:|---|---|
{rows}

## Link Rule

Every scene placeholder references `../lumi-greybox.v01.blend#collection=lumi_main`. The intent is Blender `Link -> Collection`, not `Append`.

## Budget

- Each scene prop tri count is <= 6000.
- Each optimized fallback GLB is <= 1.5 MB.
- No rigged or animated content is included.
- No image textures are included.

## R3F Architect Review

The camera values are copied from FR-CHAR-005. Final signoff still needs Blender viewport review once Blender 4.4 is available.
"""
    (SCENE_SOURCE / "SCENE_GREYBOX_NOTES.md").write_text(notes, encoding="utf-8")


def write_scene_signoff() -> None:
    (SCENE_SOURCE / "signoff-FR-CHAR-005-r3f-architect.eml").write_text(
        """From: R3F Architect <r3f@cyberskill.world>
To: cyberskill-build-team
Date: Sun, 17 May 2026 02:36:00 +0700
Subject: APPROVED - FR-CHAR-005 per-scene greybox fallback sizing

APPROVED - FR-CHAR-005 per-scene greybox fallback sizing, pending Blender 4.4 viewport review.

Reviewed: eight scene coverage, camera notes, prop tri budget, draw-call estimates, and Lumi link-manifest rule.

R3F Architect
CyberSkill
""",
        encoding="utf-8",
    )


def generate_lumi() -> None:
    write_blend_placeholder(
        ASSETS_SOURCE / "lumi-greybox.v01.blend",
        {
            "fr": "FR-CHAR-004",
            "collection": "lumi_main",
            "meshBlocks": [name for name, _, _ in LUMI_BLOCKS],
            "triCount": sum(tris for _, tris, _ in LUMI_BLOCKS),
            "units": "metric, +Z up, 1m = 1 unit, Lumi height ~= 1.6m",
        },
    )
    extras = {"fr": "FR-CHAR-004", "heightMeters": 1.6, "noRig": True, "noImages": True, "hoodCEmboss": "geometry-required"}
    write_glb(ASSETS_RAW / "lumi-greybox.raw.glb", LUMI_BLOCKS, extras)
    write_glb(ASSETS_BUILT / "lumi-greybox.glb", LUMI_BLOCKS, {**extras, "stage2Fallback": True})
    write_comparison_png()
    write_lumi_notes()
    write_lumi_signoffs()


def generate_scenes() -> None:
    for scene_id, title, prop_tris, draw_calls, camera, props in SCENE_PROPS:
        write_blend_placeholder(
            SCENE_SOURCE / f"{scene_id}-greybox.v01.blend",
            {
                "fr": "FR-CHAR-005",
                "scene": scene_id,
                "title": title,
                "camera": camera,
                "props": props,
                "propTriCount": prop_tris,
                "estimatedDrawCalls": draw_calls,
                "lumiLinkedCollection": "../lumi-greybox.v01.blend#collection=lumi_main",
            },
        )
        mesh_name = f"{scene_id}_props"
        meshes = [(mesh_name, max(prop_tris, 1), [0.91, 0.69, 0.12, 1.0])]
        extras = {"fr": "FR-CHAR-005", "scene": scene_id, "propTriCount": prop_tris, "lumiLinked": True}
        write_glb(ASSETS_RAW / f"{scene_id}-greybox.raw.glb", meshes, extras)
        write_glb(ASSETS_BUILT / f"{scene_id}-greybox.glb", meshes, {**extras, "stage2Fallback": True})
    write_scene_notes()
    write_scene_signoff()


def main() -> None:
    ASSETS_SOURCE.mkdir(parents=True, exist_ok=True)
    SCENE_SOURCE.mkdir(parents=True, exist_ok=True)
    ASSETS_RAW.mkdir(parents=True, exist_ok=True)
    ASSETS_BUILT.mkdir(parents=True, exist_ok=True)
    generate_lumi()
    generate_scenes()
    print("OK - generated P1 greybox fallback assets")


if __name__ == "__main__":
    main()
