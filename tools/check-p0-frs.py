#!/usr/bin/env python3
"""Validate Phase 0 feature-request deliverables.

This is intentionally narrower than a full FR auditor: it checks the concrete
file and data contracts listed in BACKLOG.md §2 and the eight P0 FR files.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent

REQUIRED_FILES = {
    "FR-CHAR-001": [
        "design/character-sheets/lumi-character-sheet-v1.fig",
        "design/character-sheets/lumi-character-sheet-v1.pdf",
        "design/character-sheets/lumi-character-sheet-v1.png",
        "design/character-sheets/lumi-poses-quad-1024.png",
        "design/character-sheets/lumi-expressions-grid-1024.png",
        "design/character-sheets/signoff-FR-CHAR-001.eml",
    ],
    "FR-CHAR-002": [
        "design/character-sheets/silhouette/silhouette-32x32.png",
        "design/character-sheets/silhouette/silhouette-32x32-2x.png",
        "design/character-sheets/silhouette/silhouette-test-protocol.md",
        "design/character-sheets/silhouette/silhouette-test-results.md",
        "design/character-sheets/silhouette/signoff-FR-CHAR-002.eml",
    ],
    "FR-CHAR-003": [
        "design/character-sheets/nonla/nonla-design-v1.fig",
        "design/character-sheets/nonla/nonla-front.png",
        "design/character-sheets/nonla/nonla-side.png",
        "design/character-sheets/nonla/nonla-three-quarter.png",
        "design/character-sheets/nonla/nonla-interior.png",
        "design/character-sheets/nonla/nonla-on-lumi-composite.png",
        "design/character-sheets/nonla/cultural-note.md",
        "design/character-sheets/nonla/modeler-feasibility-check.md",
        "design/character-sheets/nonla/signoff-FR-CHAR-003-cultural.eml",
    ],
    "FR-CMS-001": [
        "content/narrative/master-arc.md",
        "content/narrative/voice-rules.md",
        "content/narrative/scene-defs.json",
        "content/narrative/__tests__/scene-defs-shape.test.ts",
        "content/narrative/signoff-FR-CMS-001.eml",
    ],
    "FR-CMS-002": [
        "content/narrative/lines/en.json",
        "content/narrative/lines/lines-schema.json",
        "content/narrative/lines/__tests__/lines-en.test.ts",
        "content/narrative/lines/AUTHORING_NOTES.md",
        "content/narrative/lines/signoff-FR-CMS-002.eml",
    ],
    "FR-CMS-003": [
        "content/narrative/lines/vi.json",
        "content/narrative/lines/VI_REGISTER_NOTES.md",
        "content/narrative/lines/__tests__/lines-vi.test.ts",
        "content/narrative/lines/signoff-FR-CMS-003.eml",
    ],
    "FR-DS-001": [
        "design/mood-boards/saigon-dusk-mood-board-v1.fig",
        "design/mood-boards/saigon-dusk-mood-board-v1.pdf",
        "design/mood-boards/references-catalog.json",
        "design/mood-boards/rationale.md",
        "design/mood-boards/signoff-FR-DS-001.eml",
    ],
    "FR-DS-002": [
        "design/tokens/palette-swatch-v1.fig",
        "design/tokens/palette-swatch-v1.pdf",
        "design/tokens/palette-canonical.json",
        "design/tokens/wcag-contrast-matrix.md",
        "design/tokens/wcag-contrast-matrix.json",
        "design/tokens/__tests__/palette-vs-plan.test.ts",
        "design/tokens/signoff-FR-DS-002.eml",
        "design/tokens/signoff-FR-DS-002-a11y.eml",
    ],
}

EXPECTED_IMAGE_SIZES = {
    "design/character-sheets/lumi-character-sheet-v1.png": (4096, 2048),
    "design/character-sheets/lumi-poses-quad-1024.png": (4096, 1024),
    "design/character-sheets/lumi-expressions-grid-1024.png": (1536, 1024),
    "design/character-sheets/silhouette/silhouette-32x32.png": (32, 32),
    "design/character-sheets/silhouette/silhouette-32x32-2x.png": (64, 64),
    "design/character-sheets/nonla/nonla-front.png": (1024, 1024),
    "design/character-sheets/nonla/nonla-side.png": (1024, 1024),
    "design/character-sheets/nonla/nonla-three-quarter.png": (1024, 1024),
    "design/character-sheets/nonla/nonla-interior.png": (1024, 1024),
    "design/character-sheets/nonla/nonla-on-lumi-composite.png": (1400, 1100),
    "design/mood-boards/saigon-dusk-mood-board-v1.png": (2480, 3508),
    "design/tokens/palette-swatch-v1.png": (2200, 1600),
}


def rel(path: str) -> Path:
    return ROOT / path


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def load_json(path: str) -> object:
    return json.loads(rel(path).read_text(encoding="utf-8"))


def check_required_files(errors: list[str]) -> None:
    for fr_id, paths in REQUIRED_FILES.items():
        for path in paths:
            if not rel(path).exists():
                fail(errors, f"{fr_id}: missing {path}")


def check_images(errors: list[str]) -> None:
    for path, expected_size in EXPECTED_IMAGE_SIZES.items():
        p = rel(path)
        if not p.exists():
            continue
        with Image.open(p) as img:
            if img.size != expected_size:
                fail(errors, f"{path}: expected {expected_size}, got {img.size}")


def check_silhouette(errors: list[str]) -> None:
    png = rel("design/character-sheets/silhouette/silhouette-32x32.png")
    sha_path = rel("design/character-sheets/silhouette/silhouette-32x32.sha256")
    results = rel("design/character-sheets/silhouette/silhouette-test-results.md")
    if png.exists() and sha_path.exists():
        sha = hashlib.sha256(png.read_bytes()).hexdigest()
        if sha not in sha_path.read_text(encoding="utf-8"):
            fail(errors, "FR-CHAR-002: silhouette-32x32.sha256 does not match PNG")
    if results.exists():
        text = results.read_text(encoding="utf-8")
        verdict_rows = re.findall(r"^\| [ABC] .*?\|\s*(PASS|FAIL)\s*\|", text, flags=re.MULTILINE)
        if len(verdict_rows) != 3:
            fail(errors, "FR-CHAR-002: results table must contain exactly 3 viewer verdicts")
        if verdict_rows.count("PASS") < 2:
            fail(errors, "FR-CHAR-002: silhouette test did not log >= 2 PASS verdicts")


def check_narrative(errors: list[str]) -> None:
    scene_defs = load_json("content/narrative/scene-defs.json")
    if not isinstance(scene_defs, list) or len(scene_defs) != 8:
        fail(errors, "FR-CMS-001: scene-defs.json must contain exactly 8 entries")
    else:
        ids = [scene.get("id") for scene in scene_defs]
        if ids != ["scene-0", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5", "scene-6", "footer"]:
            fail(errors, f"FR-CMS-001: unexpected scene order {ids}")

    en = load_json("content/narrative/lines/en.json")
    vi = load_json("content/narrative/lines/vi.json")
    en_lines = en.get("lines", []) if isinstance(en, dict) else []
    vi_lines = vi.get("lines", []) if isinstance(vi, dict) else []
    if not en_lines:
        fail(errors, "FR-CMS-002: en.json has no lines")
    if not vi_lines:
        fail(errors, "FR-CMS-003: vi.json has no lines")
    en_ids = {line.get("id") for line in en_lines}
    vi_ids = {line.get("id") for line in vi_lines}
    if en_ids != vi_ids:
        fail(errors, f"FR-CMS-003: VI/EN id parity mismatch: {sorted(en_ids ^ vi_ids)}")

    en_raw = rel("content/narrative/lines/en.json").read_text(encoding="utf-8")
    vi_raw = rel("content/narrative/lines/vi.json").read_text(encoding="utf-8")
    if "!" in en_raw or "!" in vi_raw:
        fail(errors, "FR-CMS-002/003: narration JSON must not contain exclamation marks")
    if re.search(r"synergize|world-class|cutting-edge|best-in-class|\bleverage\b", en_raw, re.I):
        fail(errors, "FR-CMS-002: EN narration contains banned marketing language")
    if "Lumi — vì ánh sáng biến nguyện ước thành sự thật" not in vi_raw:
        fail(errors, "FR-CMS-003: VI hover tagline missing or not verbatim")


def check_design_system(errors: list[str]) -> None:
    catalog = load_json("design/mood-boards/references-catalog.json")
    positive_refs = []
    for cluster in catalog.get("clusters", {}).values():
        positive_refs.extend(cluster.get("references", []))
    if not 12 <= len(positive_refs) <= 18:
        fail(errors, f"FR-DS-001: expected 12-18 positive references, got {len(positive_refs)}")
    for ref in positive_refs:
        card = rel(f"design/mood-boards/references/{ref['id']}.png")
        if not card.exists():
            fail(errors, f"FR-DS-001: missing generated reference card {card.relative_to(ROOT)}")

    palette = load_json("design/tokens/palette-canonical.json")
    expected_hex = {
        "#FEF6D9", "#FCEAA8", "#F9D966", "#E8B523", "#C99317", "#9F730E",
        "#F4E5D6", "#DDB995", "#A36A3F", "#6E3A18", "#4A2208", "#2C1304",
        "#DA251D", "#FFEB3B",
    }
    actual_hex = set()
    for group in ("gold", "brown", "accent"):
        actual_hex.update(palette.get(group, {}).values())
    if actual_hex != expected_hex:
        fail(errors, "FR-DS-002: palette-canonical.json hex set drifted from master plan")

    matrix = load_json("design/tokens/wcag-contrast-matrix.json")
    pairs = {f"{row['fg']}/{row['bg']}" for row in matrix}
    for pair in (
        "gold.200/brown.500",
        "gold.400/brown.500",
        "gold.400/brown.700",
        "gold.200/brown.700",
        "brown.700/gold.400",
        "accent.flag_red/brown.700",
        "accent.star_yellow/accent.flag_red",
        "gold.400/brown.400",
        "gold.100/brown.500",
    ):
        if pair not in pairs:
            fail(errors, f"FR-DS-002: missing contrast matrix pair {pair}")


def check_fig_manifests(errors: list[str]) -> None:
    for path in (
        "design/character-sheets/lumi-character-sheet-v1.fig",
        "design/character-sheets/nonla/nonla-design-v1.fig",
        "design/mood-boards/saigon-dusk-mood-board-v1.fig",
        "design/tokens/palette-swatch-v1.fig",
    ):
        p = rel(path)
        if not p.exists():
            continue
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            fail(errors, f"{path}: not valid JSON handoff manifest ({exc})")
            continue
        if data.get("format") != "figma-handoff-manifest":
            fail(errors, f"{path}: unexpected handoff manifest format")


def main() -> int:
    errors: list[str] = []
    check_required_files(errors)
    check_images(errors)
    check_silhouette(errors)
    check_narrative(errors)
    check_design_system(errors)
    check_fig_manifests(errors)

    if errors:
        print("P0 FR check FAILED")
        for error in errors:
            print(f" - {error}")
        return 1

    total_files = sum(len(paths) for paths in REQUIRED_FILES.values())
    print(f"OK - P0 FR contracts satisfied ({len(REQUIRED_FILES)} FRs, {total_files} required files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
