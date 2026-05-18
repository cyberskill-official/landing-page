#!/usr/bin/env python3
"""Generate deterministic Phase 0 design assets.

The P0 backlog contains several design deliverables that are exported artifacts
(PNG/PDF/Figma handoff files). This script keeps those outputs reproducible from
repo-native primitives instead of checking in one-off opaque binaries.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent

PALETTE = {
    "gold50": "#FEF6D9",
    "gold100": "#FCEAA8",
    "gold200": "#F9D966",
    "gold400": "#E8B523",
    "gold500": "#C99317",
    "gold600": "#9F730E",
    "brown50": "#F4E5D6",
    "brown100": "#DDB995",
    "brown200": "#A36A3F",
    "brown400": "#6E3A18",
    "brown500": "#4A2208",
    "brown700": "#2C1304",
    "flagRed": "#DA251D",
    "starYellow": "#FFEB3B",
}

FONT_CANDIDATES = (
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "/Library/Fonts/Arial.ttf",
)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = list(FONT_CANDIDATES)
    if bold:
        candidates.insert(0, "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rgb(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    return (*rgb(hex_color), alpha)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, fnt: ImageFont.ImageFont) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), trial, font=fnt)
        if bbox[2] <= max_width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def text_box(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    max_width: int,
    fnt: ImageFont.ImageFont,
    fill: str,
    line_gap: int = 8,
) -> int:
    x, y = xy
    for line in wrap_text(draw, text, max_width, fnt):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += draw.textbbox((0, 0), line, font=fnt)[3] + line_gap
    return y


def rounded_panel(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str) -> None:
    draw.rounded_rectangle(box, radius=18, fill=PALETTE["brown500"], outline=PALETTE["brown400"], width=3)
    draw.text((box[0] + 26, box[1] + 22), title, font=font(34, bold=True), fill=PALETTE["gold400"])


def star_points(cx: float, cy: float, outer: float, inner: float, start: float = -math.pi / 2) -> list[tuple[float, float]]:
    pts = []
    for i in range(10):
        r = outer if i % 2 == 0 else inner
        a = start + i * math.pi / 5
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    return pts


def lumi(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    scale: float,
    *,
    pose: str = "front",
    expression: str = "idle",
    action: str | None = None,
    with_hat: bool = False,
) -> None:
    """Draw stylized Lumi using only Saigon Dusk palette colours."""
    s = scale
    body_w = int(160 * s)
    body_h = int(230 * s)
    hood_w = int(260 * s)
    hood_h = int(270 * s)
    tail_h = int(130 * s)

    # Wisp tail.
    tail = [
        (cx - int(42 * s), cy + int(body_h * 0.4)),
        (cx + int(32 * s), cy + int(body_h * 0.44)),
        (cx + int(58 * s), cy + int(body_h * 0.75)),
        (cx + int(96 * s), cy + int(body_h * 0.86)),
        (cx + int(34 * s), cy + int(body_h * 0.96 + tail_h * 0.24)),
        (cx - int(28 * s), cy + int(body_h * 0.92 + tail_h * 0.1)),
        (cx - int(52 * s), cy + int(body_h * 0.74)),
    ]
    if pose == "side":
        tail = [(x + int(55 * s), y) for x, y in tail]
    elif pose == "back":
        tail = [(x - int(40 * s), y) for x, y in tail]
    draw.polygon(tail, fill=PALETTE["gold500"])
    draw.line(tail + [tail[0]], fill=PALETTE["gold200"], width=max(2, int(4 * s)))

    # Body and hood.
    body = [
        (cx - body_w // 2, cy + int(78 * s)),
        (cx + body_w // 2, cy + int(78 * s)),
        (cx + int(66 * s), cy + body_h),
        (cx, cy + int(body_h + 34 * s)),
        (cx - int(66 * s), cy + body_h),
    ]
    draw.polygon(body, fill=PALETTE["gold400"], outline=PALETTE["brown700"])
    draw.ellipse((cx - int(66 * s), cy + int(118 * s), cx + int(66 * s), cy + int(220 * s)), fill=PALETTE["gold200"])

    hood = [
        (cx, cy - hood_h // 2),
        (cx + hood_w // 2, cy + int(20 * s)),
        (cx + int(95 * s), cy + int(118 * s)),
        (cx + int(52 * s), cy + int(168 * s)),
        (cx - int(52 * s), cy + int(168 * s)),
        (cx - int(95 * s), cy + int(118 * s)),
        (cx - hood_w // 2, cy + int(20 * s)),
    ]
    if pose == "three-quarter":
        hood = [(x + int((x - cx) * 0.08), y) for x, y in hood]
    elif pose == "back":
        draw.polygon(hood, fill=PALETTE["gold600"], outline=PALETTE["brown700"])
        draw.arc((cx - int(95 * s), cy - int(30 * s), cx + int(95 * s), cy + int(165 * s)), 30, 150, fill=PALETTE["gold200"], width=max(2, int(5 * s)))
        if with_hat:
            nonla(draw, cx, cy - int(120 * s), int(160 * s), "front")
        return
    draw.polygon(hood, fill=PALETTE["gold400"], outline=PALETTE["brown700"])
    draw.line((cx - int(80 * s), cy + int(120 * s), cx + int(80 * s), cy + int(120 * s)), fill=PALETTE["gold200"], width=max(2, int(5 * s)))

    # Face.
    face = (cx - int(74 * s), cy - int(12 * s), cx + int(74 * s), cy + int(122 * s))
    draw.ellipse(face, fill=PALETTE["gold200"], outline=PALETTE["brown700"], width=max(2, int(4 * s)))
    eye_y = cy + int(42 * s)
    if expression == "winking":
        draw.arc((cx - int(48 * s), eye_y - int(8 * s), cx - int(18 * s), eye_y + int(10 * s)), 0, 180, fill=PALETTE["brown700"], width=max(2, int(4 * s)))
        draw.ellipse((cx + int(22 * s), eye_y - int(9 * s), cx + int(42 * s), eye_y + int(11 * s)), fill=PALETTE["brown700"])
    else:
        eye_r = int(9 * s) if expression != "surprised" else int(12 * s)
        draw.ellipse((cx - int(42 * s), eye_y - eye_r, cx - int(42 * s) + 2 * eye_r, eye_y + eye_r), fill=PALETTE["brown700"])
        draw.ellipse((cx + int(25 * s), eye_y - eye_r, cx + int(25 * s) + 2 * eye_r, eye_y + eye_r), fill=PALETTE["brown700"])

    mouth_box = (cx - int(42 * s), cy + int(72 * s), cx + int(42 * s), cy + int(112 * s))
    if expression in {"speaking", "surprised"}:
        draw.ellipse((cx - int(16 * s), cy + int(78 * s), cx + int(16 * s), cy + int(110 * s)), fill=PALETTE["brown700"])
    elif expression == "concerned":
        draw.arc(mouth_box, 200, 340, fill=PALETTE["brown700"], width=max(2, int(4 * s)))
    else:
        draw.arc(mouth_box, 20, 160, fill=PALETTE["brown700"], width=max(2, int(4 * s)))

    # Arms/action poses.
    arm_y = cy + int(150 * s)
    if action == "point":
        draw.line((cx - int(78 * s), arm_y, cx - int(15 * s), arm_y + int(12 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        draw.line((cx + int(48 * s), arm_y, cx + int(135 * s), arm_y + int(28 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
    elif action == "wave":
        draw.line((cx - int(78 * s), arm_y, cx - int(15 * s), arm_y + int(12 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        draw.line((cx + int(48 * s), arm_y, cx + int(90 * s), cy + int(36 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        draw.arc((cx + int(78 * s), cy - int(10 * s), cx + int(140 * s), cy + int(60 * s)), 290, 80, fill=PALETTE["gold200"], width=max(2, int(4 * s)))
    elif action == "summon":
        draw.line((cx - int(48 * s), arm_y, cx - int(104 * s), cy + int(52 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        draw.line((cx + int(48 * s), arm_y, cx + int(104 * s), cy + int(52 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        for r in (60, 95, 130):
            draw.arc((cx - r, cy - r, cx + r, cy + r), 205, 335, fill=PALETTE["gold200"], width=max(1, int(3 * s)))
    elif action == "paint":
        draw.line((cx - int(60 * s), arm_y, cx - int(10 * s), arm_y + int(8 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        draw.line((cx + int(40 * s), arm_y, cx + int(120 * s), arm_y - int(8 * s)), fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        draw.line((cx + int(122 * s), arm_y - int(8 * s), cx + int(220 * s), arm_y - int(42 * s)), fill=PALETTE["gold200"], width=max(2, int(6 * s)))
    else:
        draw.arc((cx - int(88 * s), arm_y - int(35 * s), cx + int(5 * s), arm_y + int(42 * s)), 25, 170, fill=PALETTE["brown700"], width=max(4, int(10 * s)))
        draw.arc((cx - int(5 * s), arm_y - int(35 * s), cx + int(88 * s), arm_y + int(42 * s)), 10, 155, fill=PALETTE["brown700"], width=max(4, int(10 * s)))

    if with_hat:
        nonla(draw, cx, cy - int(118 * s), int(155 * s), "front")


def nonla(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, view: str = "front") -> None:
    w = size
    h = int(size * 0.46)
    if view == "side":
        draw.ellipse((cx - w // 2, cy + h // 2 - 16, cx + w // 2, cy + h // 2 + 18), fill=PALETTE["flagRed"], outline=PALETTE["brown700"], width=3)
        draw.polygon([(cx - w // 2, cy + h // 2), (cx + w // 2, cy + h // 2), (cx + int(w * 0.18), cy - h // 2)], fill=PALETTE["flagRed"], outline=PALETTE["brown700"])
        return
    if view == "interior":
        draw.ellipse((cx - w // 2, cy - h // 4, cx + w // 2, cy + h // 3), fill=PALETTE["gold200"], outline=PALETTE["brown700"], width=3)
        draw.polygon([(cx - w // 2, cy), (cx + w // 2, cy), (cx, cy - h)], fill=PALETTE["flagRed"], outline=PALETTE["brown700"])
        draw.arc((cx - w // 2, cy - h // 4, cx + w // 2, cy + h // 3), 0, 180, fill=PALETTE["gold200"], width=8)
        return

    x_shift = int(w * 0.08) if view == "three-quarter" else 0
    draw.ellipse((cx - w // 2, cy + h // 2 - 18, cx + w // 2, cy + h // 2 + 18), fill=PALETTE["flagRed"], outline=PALETTE["brown700"], width=3)
    draw.polygon([(cx - w // 2, cy + h // 2), (cx + w // 2, cy + h // 2), (cx + x_shift, cy - h // 2)], fill=PALETTE["flagRed"], outline=PALETTE["brown700"])
    star_cy = cy + int(h * 0.12)
    draw.polygon(star_points(cx, star_cy, w * 0.12, w * 0.05), fill=PALETTE["starYellow"])


def save_pdf(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path, "PDF", resolution=144.0)


def fig_manifest(path: Path, title: str, frames: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    manifest = {
        "format": "figma-handoff-manifest",
        "note": "Repo-native stand-in for the Figma source named in the FR. Import the paired PNG/PDF into Figma for editable vector cleanup.",
        "title": title,
        "version": "1.0.0",
        "authored_at": "2026-05-16",
        "palette": PALETTE,
        "frames": frames,
    }
    path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def generate_character_sheet() -> None:
    out = ROOT / "design" / "character-sheets"
    img = Image.new("RGB", (4096, 2048), rgb(PALETTE["brown700"]))
    d = ImageDraw.Draw(img)
    d.text((96, 70), "LUMI - Character Sheet v1", font=font(78, bold=True), fill=PALETTE["gold400"])
    d.text((98, 154), "CyberSkill / FR-CHAR-001 / 2026-05-16", font=font(32), fill=PALETTE["gold200"])

    pose_box = (96, 230, 4000, 1010)
    rounded_panel(d, pose_box, "Turnaround poses")
    labels = [("FRONT", "front"), ("3/4", "three-quarter"), ("SIDE", "side"), ("BACK", "back")]
    for i, (label, pose) in enumerate(labels):
        x = 540 + i * 930
        d.text((x - 88, 930), label, font=font(42, bold=True), fill=PALETTE["gold200"])
        lumi(d, x, 430, 1.15, pose=pose)

    expr_box = (96, 1050, 1770, 1940)
    rounded_panel(d, expr_box, "6 expression heads")
    expressions = ["idle", "smiling", "speaking", "concerned", "winking", "surprised"]
    for idx, expr in enumerate(expressions):
        col = idx % 3
        row = idx // 3
        x = 360 + col * 500
        y = 1265 + row * 350
        lumi(d, x, y, 0.62, expression=expr)
        d.text((x - 95, y + 255), expr, font=font(30, bold=True), fill=PALETTE["gold200"])

    action_box = (1830, 1050, 3100, 1940)
    rounded_panel(d, action_box, "Arm-uncross posebook")
    for idx, action in enumerate(["point", "wave", "summon", "paint"]):
        col = idx % 2
        row = idx // 2
        x = 2110 + col * 560
        y = 1270 + row * 350
        lumi(d, x, y, 0.52, action=action)
        d.text((x - 70, y + 235), action, font=font(28, bold=True), fill=PALETTE["gold200"])

    note_box = (3160, 1050, 4000, 1940)
    rounded_panel(d, note_box, "Wisp + contrast + bilingual tag")
    for idx, label in enumerate(["idle drift", "flying trail", "settled neat"]):
        y = 1190 + idx * 140
        d.line((3260, y, 3480, y + 55), fill=PALETTE["gold500"], width=22)
        d.arc((3240, y - 28, 3520, y + 105), 10, 210, fill=PALETTE["gold200"], width=8)
        d.text((3560, y + 8), label, font=font(28), fill=PALETTE["gold200"])
    y = 1600
    d.text((3210, y), "WCAG block", font=font(28, bold=True), fill=PALETTE["gold400"])
    d.text((3210, y + 48), "gold.400 on brown.500: PASS", font=font(25), fill=PALETTE["gold200"])
    d.text((3210, y + 88), "gold.200 on brown.500: PASS", font=font(25), fill=PALETTE["gold200"])
    d.text((3210, y + 150), "EN: Lumi - light that turns wishes into truth", font=font(24), fill=PALETTE["gold200"])
    d.text((3210, y + 190), "VI: Lumi - vì ánh sáng biến nguyện ước thành sự thật", font=font(24), fill=PALETTE["gold200"])

    img.save(out / "lumi-character-sheet-v1.png", optimize=True)
    save_pdf(img, out / "lumi-character-sheet-v1.pdf")
    fig_manifest(
        out / "lumi-character-sheet-v1.fig",
        "Lumi Character Sheet v1",
        [
            {"name": "poses", "canvas": [4096, 1024], "labels": [x[0] for x in labels]},
            {"name": "expressions", "grid": "2x3", "labels": expressions},
            {"name": "actions", "labels": ["point", "wave", "summon", "paint"]},
            {"name": "wisp-states", "labels": ["idle drift", "flying trail", "settled neat"]},
            {"name": "contrast-block", "pairs": ["gold.400/brown.500", "gold.200/brown.500"]},
            {"name": "bilingual-tag", "vi": "Lumi - vì ánh sáng biến nguyện ước thành sự thật"},
        ],
    )

    poses = Image.new("RGB", (4096, 1024), rgb(PALETTE["brown700"]))
    pd = ImageDraw.Draw(poses)
    for i, (label, pose) in enumerate(labels):
        x = 512 + i * 1024
        lumi(pd, x, 270, 1.28, pose=pose)
        pd.text((x - 96, 910), label, font=font(44, bold=True), fill=PALETTE["gold200"])
    poses.save(out / "lumi-poses-quad-1024.png", optimize=True)

    exprs = Image.new("RGB", (1536, 1024), rgb(PALETTE["brown700"]))
    ed = ImageDraw.Draw(exprs)
    for idx, expr in enumerate(expressions):
        col = idx % 3
        row = idx // 3
        x = 256 + col * 512
        y = 170 + row * 420
        lumi(ed, x, y, 0.76, expression=expr)
        ed.text((x - 112, y + 305), expr, font=font(34, bold=True), fill=PALETTE["gold200"])
    exprs.save(out / "lumi-expressions-grid-1024.png", optimize=True)


def generate_nonla() -> None:
    out = ROOT / "design" / "character-sheets" / "nonla"
    out.mkdir(parents=True, exist_ok=True)
    views = [
        ("front", "nonla-front.png"),
        ("side", "nonla-side.png"),
        ("three-quarter", "nonla-three-quarter.png"),
        ("interior", "nonla-interior.png"),
    ]
    for view, filename in views:
        img = Image.new("RGB", (1024, 1024), rgb(PALETTE["brown700"]))
        d = ImageDraw.Draw(img)
        d.text((64, 58), f"Nón lá - {view}", font=font(46, bold=True), fill=PALETTE["gold400"])
        nonla(d, 512, 420, 560, view)
        d.text((96, 820), "Exterior #DA251D / star #FFEB3B / interior #F9D966", font=font(30), fill=PALETTE["gold200"])
        d.text((96, 865), "Single front-centre star. Casual register. <= 600 tri mesh target.", font=font(28), fill=PALETTE["gold200"])
        img.save(out / filename, optimize=True)

    comp = Image.new("RGB", (1400, 1100), rgb(PALETTE["brown700"]))
    d = ImageDraw.Draw(comp)
    d.text((80, 60), "Nón lá on Lumi - composite", font=font(52, bold=True), fill=PALETTE["gold400"])
    lumi(d, 700, 330, 1.45, with_hat=True)
    d.text((230, 960), "Hat socket: forward and slightly down on Lumi's hood, casual like a cap.", font=font(32), fill=PALETTE["gold200"])
    comp.save(out / "nonla-on-lumi-composite.png", optimize=True)

    fig_manifest(
        out / "nonla-design-v1.fig",
        "Nón lá accessory design v1",
        [
            {"name": "front", "path": "nonla-front.png"},
            {"name": "side", "path": "nonla-side.png"},
            {"name": "three-quarter", "path": "nonla-three-quarter.png"},
            {"name": "interior", "path": "nonla-interior.png"},
            {"name": "composite", "path": "nonla-on-lumi-composite.png"},
        ],
    )


def generate_mood_board() -> None:
    out = ROOT / "design" / "mood-boards"
    ref_dir = out / "references"
    ref_dir.mkdir(parents=True, exist_ok=True)
    catalog = json.loads((out / "references-catalog.json").read_text(encoding="utf-8"))

    cards: list[tuple[str, str, str, str]] = []
    for cluster_id, cluster in catalog["clusters"].items():
        for ref in cluster["references"]:
            cards.append((ref["id"], ref["title"], ref["annotation"], cluster_id))
    for ref in catalog["counter_examples"]:
        cards.append((ref["id"], ref["title"], ref["annotation"], "counter-example"))

    for idx, (ref_id, title, annotation, cluster) in enumerate(cards):
        img = Image.new("RGB", (900, 560), rgb(PALETTE["brown500"]))
        d = ImageDraw.Draw(img)
        base = [PALETTE["brown700"], PALETTE["brown500"], PALETTE["brown400"], PALETTE["gold600"], PALETTE["gold400"], PALETTE["gold200"]]
        if ref_id.startswith("AVOID"):
            base = [PALETTE["flagRed"], PALETTE["brown700"], PALETTE["brown500"]]
        for i, color in enumerate(base):
            x0 = int(i * 900 / len(base))
            x1 = int((i + 1) * 900 / len(base))
            d.rectangle((x0, 0, x1, 560), fill=color)
        for i in range(18):
            x = (idx * 61 + i * 47) % 900
            y = (idx * 43 + i * 31) % 560
            d.ellipse((x - 70, y - 70, x + 70, y + 70), fill=rgba(PALETTE["gold200"], 68))
        d.rounded_rectangle((36, 32, 864, 528), radius=18, fill=rgba(PALETTE["brown700"], 230), outline=PALETTE["gold400"], width=3)
        d.text((64, 58), ref_id, font=font(44, bold=True), fill=PALETTE["gold400"])
        d.text((64, 118), cluster, font=font(22), fill=PALETTE["gold200"])
        y = text_box(d, (64, 175), title, 760, font(34, bold=True), PALETTE["gold200"], 8)
        text_box(d, (64, y + 20), annotation, 760, font(27), PALETTE["gold100"], 8)
        img.save(ref_dir / f"{ref_id}.png", optimize=True)

    board = Image.new("RGB", (2480, 3508), rgb(PALETTE["brown700"]))
    d = ImageDraw.Draw(board)
    d.text((100, 84), "Saigon Dusk Mood Board", font=font(76, bold=True), fill=PALETTE["gold400"])
    d.text((104, 166), "FR-DS-001 / 4 clusters / 13 positive references + 3 counter-examples", font=font(34), fill=PALETTE["gold200"])
    x, y = 100, 250
    for ref_id, title, annotation, cluster in cards:
        card = Image.open(ref_dir / f"{ref_id}.png").resize((500, 311))
        board.paste(card, (x, y))
        d.text((x, y + 322), title[:36], font=font(22, bold=True), fill=PALETTE["gold200"])
        x += 570
        if x + 500 > 2380:
            x = 100
            y += 405
    board.save(out / "saigon-dusk-mood-board-v1.png", optimize=True)
    save_pdf(board, out / "saigon-dusk-mood-board-v1.pdf")
    fig_manifest(
        out / "saigon-dusk-mood-board-v1.fig",
        "Saigon Dusk Mood Board v1",
        [{"id": ref_id, "cluster": cluster, "title": title} for ref_id, title, _annotation, cluster in cards],
    )


def generate_palette_sheet() -> None:
    out = ROOT / "design" / "tokens"
    palette = json.loads((out / "palette-canonical.json").read_text(encoding="utf-8"))
    img = Image.new("RGB", (2200, 1600), rgb(PALETTE["brown700"]))
    d = ImageDraw.Draw(img)
    d.text((84, 70), "Saigon Dusk Palette - Swatch Sheet", font=font(64, bold=True), fill=PALETTE["gold400"])
    d.text((88, 142), "FR-DS-002 / canonical token export + WCAG matrix", font=font(30), fill=PALETTE["gold200"])

    def chip(x: int, y: int, name: str, value: str, text_fill: str) -> None:
        d.rounded_rectangle((x, y, x + 270, y + 210), radius=12, fill=value, outline=PALETTE["brown400"], width=2)
        d.text((x + 22, y + 28), name, font=font(25, bold=True), fill=text_fill)
        d.text((x + 22, y + 156), value, font=font(25, bold=True), fill=text_fill)

    d.text((88, 240), "Gold", font=font(42, bold=True), fill=PALETTE["gold400"])
    for i, (k, v) in enumerate(palette["gold"].items()):
        chip(90 + i * 330, 310, f"gold.{k}", v, PALETTE["brown700"])

    d.text((88, 580), "Brown", font=font(42, bold=True), fill=PALETTE["gold400"])
    for i, (k, v) in enumerate(palette["brown"].items()):
        fill = PALETTE["gold200"] if int(k) >= 200 else PALETTE["brown700"]
        chip(90 + i * 330, 650, f"brown.{k}", v, fill)

    d.text((88, 920), "Flag accents - Scene 5 only", font=font(42, bold=True), fill=PALETTE["gold400"])
    chip(90, 990, "accent.flag_red", palette["accent"]["flag_red"], PALETTE["starYellow"])
    chip(420, 990, "accent.star_yellow", palette["accent"]["star_yellow"], PALETTE["flagRed"])

    d.text((850, 960), "Scene usage", font=font(35, bold=True), fill=PALETTE["gold400"])
    scene_rows = [
        ("gold.400", "S0 S1 S2 S3 S4 S5 S6 Footer"),
        ("brown.700", "S0 S1 S2"),
        ("brown.500", "S2 S3 S4 S5 S6 Footer"),
        ("brown.400", "S1 S5 Footer"),
        ("accent.flag_red", "S5 only"),
        ("accent.star_yellow", "S5 only"),
    ]
    yy = 1020
    for name, scenes in scene_rows:
        d.text((850, yy), f"{name}: {scenes}", font=font(28), fill=PALETTE["gold200"])
        yy += 50

    img.save(out / "palette-swatch-v1.png", optimize=True)
    save_pdf(img, out / "palette-swatch-v1.pdf")
    fig_manifest(
        out / "palette-swatch-v1.fig",
        "Saigon Dusk Palette Swatch v1",
        [
            {"name": "gold-ramp", "tokens": list(palette["gold"].keys())},
            {"name": "brown-ramp", "tokens": list(palette["brown"].keys())},
            {"name": "flag-accents", "tokens": list(palette["accent"].keys())},
            {"name": "scene-usage-map", "rows": scene_rows},
        ],
    )


def main() -> None:
    generate_character_sheet()
    generate_nonla()
    generate_mood_board()
    generate_palette_sheet()
    print("OK - generated Phase 0 design assets")


if __name__ == "__main__":
    main()
