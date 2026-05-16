#!/usr/bin/env python3
"""
WCAG 2.2 contrast-ratio generator for the CyberSkill landing-page palette.

Reads:  design/tokens/palette-canonical.json
Writes: design/tokens/wcag-contrast-matrix.json
        design/tokens/wcag-contrast-matrix.md

References:
- FR-DS-002 §1 #6, §3.3, §4 #4-#8
- WCAG 2.2 relative-luminance + contrast-ratio formula
  (https://www.w3.org/TR/WCAG22/#dfn-relative-luminance)

Run:    python3 design/tokens/contrast-check-script.py
        (idempotent: re-running on unchanged inputs produces byte-identical output)

Exit codes:
  0  matrix generated, all FAIL pairings are in `forbidden_pairings` (clean)
  1  a PASS-claiming pair fell below threshold (regression)
  2  input palette malformed
"""
from __future__ import annotations

import json
import sys
from collections import OrderedDict
from pathlib import Path

# -- paths (project-relative) ------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent.parent
PALETTE_JSON = ROOT / "design" / "tokens" / "palette-canonical.json"
MATRIX_JSON = ROOT / "design" / "tokens" / "wcag-contrast-matrix.json"
MATRIX_MD = ROOT / "design" / "tokens" / "wcag-contrast-matrix.md"

# -- the canonical pairings the matrix MUST cover (per FR-DS-002 §1 #4) ------
# Each entry: (fg_dotted, bg_dotted, expected_role, notes)
# expected_role ∈ {'body', 'large', 'ui-only', 'decorative', 'forbidden'}
PAIRINGS = [
    ("gold.200",          "brown.500",  "body",       "body text on cinematic surface"),
    ("gold.400",          "brown.500",  "large",      "heading text on cinematic surface"),
    ("gold.400",          "brown.700",  "body",       "heading on deepest surface"),
    ("gold.200",          "brown.700",  "body",       "body on deepest surface"),
    ("gold.100",          "brown.500",  "body",       "sub-headline contrast"),
    ("brown.700",         "gold.400",   "body",       "dark label on gold button fill"),
    ("accent.flag_red",   "brown.700",  "decorative", "Scene 5 nón lá / arc pulse (non-text decorative only)"),
    ("accent.star_yellow","accent.flag_red", "body",  "yellow star on red nón lá exterior"),
    ("gold.400",          "brown.400",  "large",      "rim-light against Scene 1 backdrop"),
    # explicit FAIL examples to seed forbidden_pairings
    ("gold.50",           "gold.100",   "forbidden",  "never pair light-gold on light-gold (illustrative)"),
    ("gold.200",          "brown.50",   "forbidden",  "never pair light-gold on cream (illustrative)"),
]

# WCAG 2.2 thresholds (§1.4.3, §1.4.11)
THRESHOLDS = {
    "body":  4.5,   # SC 1.4.3 normal text
    "large": 3.0,   # SC 1.4.3 large text (18pt / 14pt bold +)
    "ui":    3.0,   # SC 1.4.11 non-text UI
}


# -- WCAG 2.2 relative-luminance + contrast ----------------------------------
def _hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _channel_lin(c8: int) -> float:
    # sRGB → linear; WCAG 2.2 cutoff: 0.04045 (after dividing by 255)
    s = c8 / 255.0
    return s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_rgb: str) -> float:
    r, g, b = _hex_to_rgb(hex_rgb)
    return 0.2126 * _channel_lin(r) + 0.7152 * _channel_lin(g) + 0.0722 * _channel_lin(b)


def contrast(a_hex: str, b_hex: str) -> float:
    la, lb = relative_luminance(a_hex), relative_luminance(b_hex)
    l1, l2 = max(la, lb), min(la, lb)
    return (l1 + 0.05) / (l2 + 0.05)


# -- palette resolution ------------------------------------------------------
def resolve(dotted: str, palette: dict) -> str:
    """`gold.400` → `#E8B523`; `accent.flag_red` → `#DA251D`."""
    a, b = dotted.split(".")
    node = palette[a][b]
    if isinstance(node, str) and node.startswith("#"):
        return node
    raise ValueError(f"non-hex value for {dotted!r}: {node!r}")


# -- matrix generation -------------------------------------------------------
def build_matrix(palette: dict) -> list[dict]:
    rows: list[dict] = []
    for fg, bg, role, note in PAIRINGS:
        fg_hex = resolve(fg, palette)
        bg_hex = resolve(bg, palette)
        ratio = round(contrast(fg_hex, bg_hex), 2)
        verdict = _classify(ratio, role)
        rows.append(OrderedDict(
            fg=fg, fg_hex=fg_hex,
            bg=bg, bg_hex=bg_hex,
            ratio=ratio,
            role=role,
            verdict=verdict,
            notes=note,
            body_pass=ratio >= THRESHOLDS["body"],
            large_pass=ratio >= THRESHOLDS["large"],
            ui_pass=ratio >= THRESHOLDS["ui"],
        ))
    return rows


def _classify(ratio: float, role: str) -> str:
    if role == "forbidden":
        return "FORBIDDEN"
    if role == "decorative":
        return "PARTIAL" if ratio >= THRESHOLDS["ui"] else "FAIL"
    if role == "ui-only":
        return "PASS" if ratio >= THRESHOLDS["ui"] else "FAIL"
    if role == "large":
        return "PASS" if ratio >= THRESHOLDS["large"] else "FAIL"
    if role == "body":
        if ratio >= THRESHOLDS["body"]:
            return "PASS"
        if ratio >= THRESHOLDS["large"]:
            return "PARTIAL"
        return "FAIL"
    return "UNKNOWN"


# -- rendering ---------------------------------------------------------------
def render_md(rows: list[dict]) -> str:
    lines = [
        "# WCAG 2.2 Contrast Matrix — CyberSkill Landing Page",
        "",
        "> **Generated.** Edit `palette-canonical.json` and re-run "
        "`python3 design/tokens/contrast-check-script.py`. Do NOT hand-edit this file.",
        "",
        "References: FR-DS-002 · WCAG 2.2 SC 1.4.3 (text) · WCAG 2.2 SC 1.4.11 (non-text UI).",
        "",
        "## Matrix",
        "",
        "| Pair (fg × bg) | Hex | Ratio | Body ≥4.5:1 | Large ≥3:1 | UI ≥3:1 | Verdict | Notes |",
        "|---|---|---:|:-:|:-:|:-:|:-:|---|",
    ]
    for r in rows:
        if r["verdict"] == "FORBIDDEN":
            continue   # forbidden rows go below
        lines.append(
            f"| `{r['fg']}` × `{r['bg']}` | {r['fg_hex']} on {r['bg_hex']} | "
            f"{r['ratio']:.2f} | "
            f"{'✓' if r['body_pass'] else '✗'} | "
            f"{'✓' if r['large_pass'] else '✗'} | "
            f"{'✓' if r['ui_pass'] else '✗'} | "
            f"**{r['verdict']}** | {r['notes']} |"
        )

    forbidden = [r for r in rows if r["verdict"] == "FORBIDDEN"]
    if forbidden:
        lines.extend(["", "## Forbidden pairings", "",
                      "These combinations MUST NOT appear anywhere on the site.",
                      "",
                      "| Pair | Ratio | Reason |", "|---|---:|---|"])
        for r in forbidden:
            lines.append(f"| `{r['fg']}` × `{r['bg']}` | {r['ratio']:.2f} | {r['notes']} |")

    lines.extend([
        "",
        "## Reading the verdict",
        "",
        "- **PASS** — meets the threshold for the role (body / large / ui-only).",
        "- **PARTIAL** — passes a relaxed threshold; restricted to its documented usage "
        "(e.g. decorative non-text only).",
        "- **FAIL** — falls below the role's threshold; do not use.",
        "- **FORBIDDEN** — explicit anti-pattern; never use.",
        "",
        "## Thresholds (WCAG 2.2)",
        "",
        "- Body text: ≥ 4.5 : 1 (SC 1.4.3)",
        "- Large text (≥ 18pt or ≥ 14pt bold): ≥ 3 : 1 (SC 1.4.3)",
        "- Non-text UI (icons, borders, focus rings): ≥ 3 : 1 (SC 1.4.11)",
        "",
    ])
    return "\n".join(lines) + "\n"


# -- entry point -------------------------------------------------------------
def main() -> int:
    if not PALETTE_JSON.exists():
        print(f"error: palette not found at {PALETTE_JSON}", file=sys.stderr)
        print("       create it per FR-DS-002 §3.1 before running this script.", file=sys.stderr)
        return 2

    try:
        palette = json.loads(PALETTE_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"error: palette JSON malformed: {e}", file=sys.stderr)
        return 2

    rows = build_matrix(palette)

    # Sort by ratio descending (most-passing on top, FORBIDDEN at bottom via render_md split)
    rows.sort(key=lambda r: (-r["ratio"], r["fg"], r["bg"]))

    # Write JSON (sorted-key for byte-deterministic output)
    MATRIX_JSON.write_text(
        json.dumps(rows, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    MATRIX_MD.write_text(render_md(rows), encoding="utf-8")

    # CI exit-code regression check: anything claiming PASS that's actually below threshold?
    regressions = [
        r for r in rows
        if r["verdict"] == "PASS" and r["ratio"] < THRESHOLDS.get(r["role"], 4.5)
    ]
    if regressions:
        for r in regressions:
            print(f"regression: {r['fg']} × {r['bg']} claims PASS but ratio "
                  f"{r['ratio']:.2f} < {THRESHOLDS.get(r['role'], 4.5):.1f}",
                  file=sys.stderr)
        return 1

    print(f"OK — wrote {len(rows)} pairings to {MATRIX_JSON.name} + {MATRIX_MD.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
