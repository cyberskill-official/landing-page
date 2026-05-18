#!/usr/bin/env python3
"""Validate deterministic P1 storyboard/comp handoff artifacts."""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover - local contract requires Pillow.
    raise SystemExit(f"ERROR: Pillow is required to inspect image dimensions: {exc}") from exc


ROOT = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class SceneContract:
    fr_id: str
    folder: str
    fig_file: str
    pdf_file: str
    signoff_file: str
    frames: dict[str, tuple[str, tuple[int, int]]]
    required_annotations: tuple[str, ...]
    extra_files: tuple[str, ...] = ()
    story_max_words: int = 250
    manifest_checks: dict[str, Any] = field(default_factory=dict)
    file_snippets: dict[str, tuple[str, ...]] = field(default_factory=dict)

    @property
    def root(self) -> Path:
        return ROOT / "design" / "scenes" / self.folder


CONTRACTS: dict[str, SceneContract] = {
    "FR-SCENE-001": SceneContract(
        fr_id="FR-SCENE-001",
        folder="scene-0-hero",
        fig_file="scene-0-hero-v1.fig",
        pdf_file="scene-0-hero-v1.pdf",
        signoff_file="signoff-FR-SCENE-001.eml",
        frames={
            "desktop-1920": ("scene-0-hero-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("scene-0-hero-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("scene-0-hero-mobile-390.png", (390, 844)),
        },
        required_annotations=(
            "LCP target - headline DOM",
            "R3F canvas - post-FCP mount",
            "Canvas/DOM boundary visible on all breakpoints",
            "Skip story, Skip 3D, Mute controls in DOM",
            "Scroll-linked, never scroll-hijacked",
        ),
        extra_files=(
            "motion-frame-01-empty.png",
            "motion-frame-02-flyin-start.png",
            "motion-frame-03-flyin-mid.png",
            "motion-frame-04-flyin-end.png",
            "motion-frame-05-idle-with-cta.png",
            "motion-frame-06-scroll-cue.png",
        ),
        manifest_checks={"motionFrames": 6},
    ),
    "FR-SCENE-002": SceneContract(
        fr_id="FR-SCENE-002",
        folder="scene-1-origin",
        fig_file="scene-1-origin-v1.fig",
        pdf_file="scene-1-origin-v1.pdf",
        signoff_file="signoff-FR-SCENE-002.eml",
        frames={
            "desktop-1920": ("scene-1-origin-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("scene-1-origin-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("scene-1-origin-mobile-390.png", (390, 844)),
        },
        required_annotations=(
            "Idea-spark",
            "Typed caption is DOM overlay",
            "Camera path documented in camera-path.md",
            "Wisp curl path is constraint-driven",
        ),
        extra_files=("camera-path.md", "idea-spark-frames.png"),
        file_snippets={
            "camera-path.md": ("## Start", "## End", "## Curve", "ease-genie", "coil_idle"),
            "storyboard.md": ("Stephen had one rule", "constraint-driven", "Mute off"),
        },
    ),
    "FR-SCENE-003": SceneContract(
        fr_id="FR-SCENE-003",
        folder="scene-2-transformation",
        fig_file="scene-2-v1.fig",
        pdf_file="scene-2-v1.pdf",
        signoff_file="signoff-FR-SCENE-003.eml",
        frames={
            "desktop-1920": ("scene-2-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("scene-2-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("scene-2-mobile-390.png", (390, 844)),
        },
        required_annotations=(
            "Sketchpad",
            "Paint trail",
            "Caption split into two DOM beats",
            "Includes DOM blockquote proof slot",
        ),
        extra_files=("paint-trail-spec.md", "sketch-to-app-morph-frames.png"),
        file_snippets={
            "paint-trail-spec.md": ("additive", "--brand-gold-400", "6 visible segments", "reduced motion"),
            "storyboard.md": ("Most software dies", "We close it", "<blockquote>"),
        },
    ),
    "FR-SCENE-004": SceneContract(
        fr_id="FR-SCENE-004",
        folder="scene-3-capabilities",
        fig_file="scene-3-v1.fig",
        pdf_file="scene-3-v1.pdf",
        signoff_file="signoff-FR-SCENE-004.eml",
        frames={
            "desktop-1920": ("scene-3-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("scene-3-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("scene-3-mobile-390.png", (390, 844)),
        },
        required_annotations=(
            "Cool accents appear only",
            "Design Systems satellite remains gold-400",
            "Caption is DOM overlay",
            "Includes DOM logos strip slot",
        ),
        extra_files=("satellite-orbits.md",),
        manifest_checks={"satellites": 4},
        file_snippets={
            "satellite-orbits.md": ("React", "Three.js", "AI/RAG", "Design Systems", "MUST NOT cross"),
            "storyboard.md": ("four hands of the same craft", "cool tints", "grayscale logos"),
        },
    ),
    "FR-SCENE-005": SceneContract(
        fr_id="FR-SCENE-005",
        folder="scene-4-team",
        fig_file="scene-4-v1.fig",
        pdf_file="scene-4-v1.pdf",
        signoff_file="signoff-FR-SCENE-005.eml",
        frames={
            "desktop-1920": ("scene-4-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("scene-4-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("scene-4-mobile-390.png", (390, 844)),
        },
        required_annotations=(
            "Exactly 10 abstract avatar proxies",
            "MeshTransmissionMaterial bokeh layer",
            "We're hiring 3 is a subordinate text link",
            "Hover reveals first name + role only",
        ),
        extra_files=("avatar-placement.md",),
        manifest_checks={"avatarCount": 10},
        file_snippets={
            "avatar-placement.md": ("No photos", "no LinkedIn", "Lumi emissive target"),
            "storyboard.md": ("Ten of us", "We're hiring 3", "first name + role only"),
        },
    ),
    "FR-SCENE-006": SceneContract(
        fr_id="FR-SCENE-006",
        folder="scene-5-vietnam-global",
        fig_file="scene-5-v1.fig",
        pdf_file="scene-5-v1.pdf",
        signoff_file="signoff-FR-SCENE-006.eml",
        frames={
            "desktop-1920": ("scene-5-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("scene-5-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("scene-5-mobile-390.png", (390, 844)),
        },
        required_annotations=(
            "Stylized flat-shaded globe",
            "Vietnam pin uses #DA251D",
            "Lumi wears the red",
            "Time-zone live-clock widget slot",
            "Trust strip",
        ),
        extra_files=("arc-spec.md", "globe-spec.md"),
        manifest_checks={"destinations": 3},
        file_snippets={
            "arc-spec.md": ("HCMC", "--accent-star-yellow", "--brand-gold-400"),
            "globe-spec.md": ("about 6,000 triangles", "no photo Earth map", "Reduced motion"),
            "storyboard.md": ("From S\u00e0i G\u00f2n to your time zone", "n\u00f3n l\u00e1", "DUNS 673219568"),
        },
    ),
    "FR-SCENE-007": SceneContract(
        fr_id="FR-SCENE-007",
        folder="scene-6-cta-hub",
        fig_file="scene-6-v1.fig",
        pdf_file="scene-6-v1.pdf",
        signoff_file="signoff-FR-SCENE-007.eml",
        frames={
            "desktop-1920": ("scene-6-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("scene-6-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("scene-6-mobile-390.png", (390, 844)),
            "focus-variants": ("lumi-focus-variants.png", (1800, 720)),
            "partner-deep-link": ("scene-6-partner-deeplink.png", (1920, 1080)),
        },
        required_annotations=(
            "Exactly 3 portals",
            "Focus ring is 2px gold-400",
            "Every portal target is annotated at >= 44x44",
            "Modal fallback shows Loading",
        ),
        extra_files=("portal-focus-states.md",),
        manifest_checks={"portalCount": 3, "focusStates": 5},
        file_snippets={
            "portal-focus-states.md": ("buy", "partner", "join", "aria-live", "+/-30deg"),
            "storyboard.md": ("You bring the will", "44x44", "?track=partner"),
        },
    ),
    "FR-SCENE-008": SceneContract(
        fr_id="FR-SCENE-008",
        folder="footer",
        fig_file="footer-v1.fig",
        pdf_file="footer-v1.pdf",
        signoff_file="signoff-FR-SCENE-008.eml",
        frames={
            "desktop-1920": ("footer-desktop-1920.png", (1920, 1080)),
            "tablet-1024": ("footer-tablet-1024.png", (1024, 1366)),
            "mobile-390": ("footer-mobile-390.png", (390, 844)),
        },
        required_annotations=(
            "wave_goodbye",
            "Footer caption is DOM overlay",
            "Language switcher is text-only",
            "No aspirational certification claims",
        ),
        extra_files=("lumi-corner-state-diagram.md",),
        manifest_checks={"cornerAvatar": {"position": "top-right", "size": [48, 48], "nonla": "on"}},
        file_snippets={
            "lumi-corner-state-diagram.md": ("48x48", "n\u00f3n l\u00e1", "EN / VI"),
            "storyboard.md": ("Until your next wish", "D-U-N-S 673219568", "/accessibility"),
        },
    ),
}


def fail(message: str) -> None:
    raise AssertionError(message)


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"{path.relative_to(ROOT)} is not valid JSON: {exc}")
    raise AssertionError("unreachable")


def word_count(path: Path) -> int:
    return len(path.read_text(encoding="utf-8").split())


def image_size(path: Path) -> tuple[int, int]:
    with Image.open(path) as image:
        return image.size


def assert_file(path: Path) -> None:
    if not path.exists():
        fail(f"missing {path.relative_to(ROOT)}")
    if path.is_file() and path.stat().st_size <= 0:
        fail(f"empty file {path.relative_to(ROOT)}")


def validate_manifest(contract: SceneContract, manifest: dict[str, Any]) -> None:
    if manifest.get("format") != "figma-handoff-manifest":
        fail(f"{contract.fr_id}: invalid manifest format")
    frames = {frame.get("name"): frame for frame in manifest.get("frames", [])}
    for frame_name, (file_name, expected_size) in contract.frames.items():
        frame = frames.get(frame_name)
        if not frame:
            fail(f"{contract.fr_id}: missing manifest frame {frame_name}")
        if frame.get("path") != file_name:
            fail(f"{contract.fr_id}: frame {frame_name} path mismatch")
        if tuple(frame.get("size", [])) != expected_size:
            fail(f"{contract.fr_id}: frame {frame_name} manifest size mismatch")

    annotations = "\n".join(manifest.get("annotations", []))
    for required in contract.required_annotations:
        if required not in annotations:
            fail(f"{contract.fr_id}: missing annotation containing {required!r}")

    for key, expected in contract.manifest_checks.items():
        actual = manifest.get(key)
        if isinstance(expected, int):
            if isinstance(actual, int):
                if actual != expected:
                    fail(f"{contract.fr_id}: manifest {key} expected {expected}, got {actual!r}")
            elif not hasattr(actual, "__len__") or len(actual) != expected:
                fail(f"{contract.fr_id}: manifest {key} expected length {expected}, got {actual!r}")
        elif actual != expected:
            fail(f"{contract.fr_id}: manifest {key} expected {expected!r}, got {actual!r}")


def validate_contract(contract: SceneContract) -> list[str]:
    root = contract.root
    fig = root / contract.fig_file
    pdf = root / contract.pdf_file
    signoff = root / contract.signoff_file
    storyboard = root / "storyboard.md"
    for path in (fig, pdf, signoff, storyboard):
        assert_file(path)
    if pdf.stat().st_size > 5 * 1024 * 1024:
        fail(f"{contract.fr_id}: PDF exceeds 5 MB")

    manifest = read_json(fig)
    validate_manifest(contract, manifest)

    for file_name, expected_size in contract.frames.values():
        path = root / file_name
        assert_file(path)
        actual_size = image_size(path)
        if actual_size != expected_size:
            fail(f"{contract.fr_id}: {file_name} expected {expected_size}, got {actual_size}")

    for file_name in contract.extra_files:
        path = root / file_name
        assert_file(path)
        if file_name.endswith(".png"):
            image_size(path)

    for file_name, snippets in contract.file_snippets.items():
        text = (root / file_name).read_text(encoding="utf-8")
        for snippet in snippets:
            if snippet not in text:
                fail(f"{contract.fr_id}: {file_name} missing snippet {snippet!r}")

    for file_name in manifest.get("motionFrames", []):
        path = root / file_name
        assert_file(path)
        if image_size(path) != (1920, 1080):
            fail(f"{contract.fr_id}: {file_name} must be 1920x1080")

    words = word_count(storyboard)
    if words > contract.story_max_words:
        fail(f"{contract.fr_id}: storyboard has {words} words, max {contract.story_max_words}")

    signoff_text = signoff.read_text(encoding="utf-8", errors="replace")
    if "APPROVED" not in signoff_text or contract.fr_id not in signoff_text:
        fail(f"{contract.fr_id}: signoff lacks APPROVED + FR id")

    if contract.fr_id == "FR-SCENE-001":
        fig_text = fig.read_text(encoding="utf-8", errors="replace").lower()
        forbidden = ("nonla", "n\u00f3n", "hat")
        if any(term in fig_text for term in forbidden):
            fail("FR-SCENE-001: Scene 0 manifest must not include nonla/hat layer names")

    return [
        f"{contract.fr_id}: {len(contract.frames)} frames",
        f"storyboard={words} words",
        f"extras={len(contract.extra_files) + len(manifest.get('motionFrames', []))}",
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fr", choices=sorted(CONTRACTS), help="Validate one P1 scene FR.")
    parser.add_argument("--all", action="store_true", help="Validate all P1 scene FRs.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    selected = [args.fr] if args.fr else []
    if args.all or not selected:
        selected = sorted(CONTRACTS)
    details: list[str] = []
    try:
        for fr_id in selected:
            details.append("; ".join(validate_contract(CONTRACTS[fr_id])))
    except AssertionError as exc:
        print(f"ERROR - {exc}", file=sys.stderr)
        return 1
    print(f"OK - P1 scene storyboard contracts satisfied ({len(selected)} FRs)")
    for line in details:
        print(f" - {line}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
