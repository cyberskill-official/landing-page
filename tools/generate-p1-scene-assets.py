#!/usr/bin/env python3
"""Generate deterministic Phase 1 scene storyboard assets."""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
SCENE0_OUT = ROOT / "design" / "scenes" / "scene-0-hero"
SCENE1_OUT = ROOT / "design" / "scenes" / "scene-1-origin"
SCENE2_OUT = ROOT / "design" / "scenes" / "scene-2-transformation"
SCENE3_OUT = ROOT / "design" / "scenes" / "scene-3-capabilities"
SCENE4_OUT = ROOT / "design" / "scenes" / "scene-4-team"
SCENE5_OUT = ROOT / "design" / "scenes" / "scene-5-vietnam-global"
SCENE6_OUT = ROOT / "design" / "scenes" / "scene-6-cta-hub"
FOOTER_OUT = ROOT / "design" / "scenes" / "footer"

PALETTE = {
    "gold50": "#FEF6D9",
    "gold100": "#FCEAA8",
    "gold200": "#F9D966",
    "gold400": "#E8B523",
    "gold500": "#C99317",
    "brown400": "#6E3A18",
    "brown500": "#4A2208",
    "brown700": "#2C1304",
    "cyan": "#7DD3FC",
    "magenta": "#F0ABFC",
    "lime": "#BEF264",
    "grayLogo": "#B7B7B7",
    "flagRed": "#DA251D",
    "starYellow": "#FFCD00",
    "glowSoft": (232, 181, 35, 90),
}


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


def rgb(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def star_points(cx: float, cy: float, outer: float, inner: float) -> list[tuple[float, float]]:
    return [
        (
            cx + math.cos(-math.pi / 2 + i * math.pi / 5) * (outer if i % 2 == 0 else inner),
            cy + math.sin(-math.pi / 2 + i * math.pi / 5) * (outer if i % 2 == 0 else inner),
        )
        for i in range(10)
    ]


def draw_lumi(draw: ImageDraw.ImageDraw, cx: int, cy: int, height: int, alpha: int = 255) -> None:
    s = height / 520
    fill_gold = (*rgb(PALETTE["gold400"]), alpha)
    fill_light = (*rgb(PALETTE["gold200"]), alpha)
    fill_dark = (*rgb(PALETTE["brown700"]), alpha)
    hood = [
        (cx, cy - int(245 * s)),
        (cx + int(150 * s), cy - int(80 * s)),
        (cx + int(115 * s), cy + int(40 * s)),
        (cx + int(55 * s), cy + int(105 * s)),
        (cx - int(55 * s), cy + int(105 * s)),
        (cx - int(115 * s), cy + int(40 * s)),
        (cx - int(150 * s), cy - int(80 * s)),
    ]
    body = [
        (cx - int(82 * s), cy + int(70 * s)),
        (cx + int(82 * s), cy + int(70 * s)),
        (cx + int(62 * s), cy + int(220 * s)),
        (cx, cy + int(275 * s)),
        (cx - int(62 * s), cy + int(220 * s)),
    ]
    tail = [
        (cx - int(42 * s), cy + int(212 * s)),
        (cx + int(48 * s), cy + int(218 * s)),
        (cx + int(98 * s), cy + int(276 * s)),
        (cx + int(136 * s), cy + int(292 * s)),
        (cx + int(54 * s), cy + int(318 * s)),
        (cx - int(10 * s), cy + int(286 * s)),
    ]
    draw.polygon(tail, fill=fill_gold)
    draw.polygon(body, fill=fill_gold, outline=fill_dark)
    draw.polygon(hood, fill=fill_gold, outline=fill_dark)
    draw.ellipse((cx - int(82 * s), cy - int(58 * s), cx + int(82 * s), cy + int(82 * s)), fill=fill_light, outline=fill_dark, width=max(2, int(4 * s)))
    eye_y = cy - int(4 * s)
    draw.ellipse((cx - int(45 * s), eye_y - int(10 * s), cx - int(25 * s), eye_y + int(10 * s)), fill=fill_dark)
    draw.ellipse((cx + int(25 * s), eye_y - int(10 * s), cx + int(45 * s), eye_y + int(10 * s)), fill=fill_dark)
    draw.arc((cx - int(45 * s), cy + int(28 * s), cx + int(45 * s), cy + int(72 * s)), 20, 160, fill=fill_dark, width=max(2, int(4 * s)))
    draw.arc((cx - int(90 * s), cy + int(58 * s), cx + int(5 * s), cy + int(135 * s)), 25, 170, fill=fill_dark, width=max(4, int(9 * s)))
    draw.arc((cx - int(5 * s), cy + int(58 * s), cx + int(90 * s), cy + int(135 * s)), 10, 155, fill=fill_dark, width=max(4, int(9 * s)))


def draw_wisp_coil(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int) -> None:
    points = []
    for i in range(120):
        t = i / 119 * math.pi * 2.2
        r = radius * (0.25 + 0.75 * i / 119)
        points.append((cx + math.cos(t) * r, cy + math.sin(t) * r * 0.65))
    draw.line(points, fill=PALETTE["gold200"], width=5)


def draw_nonla(draw: ImageDraw.ImageDraw, cx: int, cy: int, height: int) -> None:
    s = height / 520
    top = (cx, cy - int(298 * s))
    brim_y = cy - int(210 * s)
    left = cx - int(118 * s)
    right = cx + int(118 * s)
    draw.polygon([top, (right, brim_y), (left, brim_y)], fill=PALETTE["flagRed"], outline=PALETTE["gold100"])
    draw.line((left, brim_y, right, brim_y), fill=PALETTE["starYellow"], width=max(2, int(5 * s)))
    draw.polygon(star_points(cx, cy - int(245 * s), int(24 * s), int(10 * s)), fill=PALETTE["starYellow"])


def draw_spotlight(base: Image.Image, intensity: float) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    w, h = base.size
    for i in range(8):
        r = int(max(w, h) * (0.18 + i * 0.09))
        alpha = max(0, int(PALETTE["glowSoft"][3] * intensity * (1 - i / 9)))
        d.ellipse((w - r - 80, -r // 2, w + r, r + 180), fill=(232, 181, 35, alpha))
    base.alpha_composite(overlay)


def draw_controls(d: ImageDraw.ImageDraw, w: int, compact: bool = False) -> None:
    f = font(18 if not compact else 13, bold=True)
    labels = ["Skip 3D", "Mute", "Skip story"]
    x = w - (420 if not compact else 246)
    y = 34
    for label in labels:
        tw = d.textbbox((0, 0), label, font=f)[2]
        pad_x = 18 if not compact else 10
        bw = tw + pad_x * 2
        d.rounded_rectangle((x, y, x + bw, y + 44), radius=22, outline=PALETTE["gold400"], width=2)
        d.text((x + pad_x, y + 12), label, font=f, fill=PALETTE["gold200"])
        x += bw + (12 if not compact else 6)


def draw_cta(d: ImageDraw.ImageDraw, x: int, y: int, compact: bool = False) -> None:
    f = font(22 if not compact else 17, bold=True)
    label = "Book a Discovery Call"
    bbox = d.textbbox((0, 0), label, font=f)
    bw = bbox[2] + (64 if not compact else 40)
    bh = 58 if not compact else 48
    d.rounded_rectangle((x, y, x + bw, y + bh), radius=8, fill=PALETTE["gold400"])
    d.text((x + (32 if not compact else 20), y + 16), label, font=f, fill=PALETTE["brown700"])


def draw_scene(width: int, height: int, path: Path, mode: str) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown700"]) + (255,))
    draw_spotlight(img, 1.0)
    d = ImageDraw.Draw(img)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "CyberSkill", font=font(24 if not compact else 17, bold=True), fill=PALETTE["gold400"])
    draw_controls(d, width, compact)

    if mode == "desktop":
        boundary = (150, 160, 1110, 900)
        d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
        d.text((boundary[0] + 24, boundary[1] + 22), "R3F canvas - post-FCP mount", font=font(22), fill=PALETTE["gold100"])
        draw_lumi(d, 580, 520, int(height * 0.6))
        hx, hy = 1215, 325
        d.text((hx, hy), "LCP target - headline DOM", font=font(18), fill=PALETTE["gold400"])
        d.text((hx, hy + 45), "What if your\nwill became\nreal?", font=font(76, bold=True), fill=PALETTE["gold200"], spacing=4)
        d.text((hx, hy + 310), "Senior software from Vietnam. Built by a small senior team.", font=font(25), fill=PALETTE["gold100"])
        draw_cta(d, hx, hy + 370)
    elif mode == "tablet":
        boundary = (130, 260, width - 130, 960)
        d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
        d.text((boundary[0] + 18, boundary[1] + 20), "R3F canvas - post-FCP mount", font=font(20), fill=PALETTE["gold100"])
        d.text((150, 135), "LCP target - headline DOM", font=font(18), fill=PALETTE["gold400"])
        d.text((150, 172), "What if your will\nbecame real?", font=font(64, bold=True), fill=PALETTE["gold200"], spacing=4)
        draw_lumi(d, width // 2, 620, int(height * 0.55))
        draw_cta(d, 330, 1040)
    else:
        boundary = (34, 250, width - 34, 630)
        d.rounded_rectangle(boundary, radius=14, outline=PALETTE["gold500"], width=2)
        d.text((48, 204), "LCP target - headline DOM", font=font(12), fill=PALETTE["gold400"])
        d.text((48, 228), "What if your\nwill became\nreal?", font=font(42, bold=True), fill=PALETTE["gold200"], spacing=0)
        d.text((54, 270), "R3F canvas - post-FCP", font=font(12), fill=PALETTE["gold100"])
        draw_lumi(d, width // 2, 440, int(height * 0.45))
        draw_cta(d, 54, 670, compact=True)

    cue_y = height - (86 if not compact else 54)
    d.polygon(star_points(width / 2, cue_y, 12, 5), fill=PALETTE["gold400"])
    d.text((width // 2 - (82 if not compact else 55), cue_y + 24), "Scroll to begin", font=font(18 if not compact else 13), fill=PALETTE["gold100"])
    d.text((48 if not compact else 22, height - 38), "Scroll-linked, never scroll-hijacked. User controls velocity.", font=font(15 if not compact else 10), fill=PALETTE["gold100"])
    img.convert("RGB").save(path, optimize=True)


def draw_motion_frame(out: Path, index: int, name: str, t: str, lumi_pos: tuple[int, int] | None, opacity: float, headline: float, cta: float, spotlight: float) -> None:
    width, height = 1920, 1080
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown700"]) + (255,))
    draw_spotlight(img, spotlight)
    d = ImageDraw.Draw(img)
    d.text((70, 58), f"Frame {index:02d} - {name} - t={t}", font=font(34, bold=True), fill=PALETTE["gold400"])
    d.text((1215, 320), "What if your\nwill became\nreal?", font=font(76, bold=True), fill=(*rgb(PALETTE["gold200"]), int(255 * headline)), spacing=4)
    if cta:
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        draw_cta(od, 1215, 695)
        overlay.putalpha(int(255 * cta))
        img.alpha_composite(overlay)
    if lumi_pos:
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        draw_lumi(od, lumi_pos[0], lumi_pos[1], 650, int(255 * opacity))
        if index in (2, 3):
            od.line((lumi_pos[0] + 80, lumi_pos[1] + 260, lumi_pos[0] + 260, lumi_pos[1] + 330), fill=(*rgb(PALETTE["gold200"]), 150), width=10)
        img.alpha_composite(overlay)
    if index == 6:
        d.text((860, 970), "Scroll to begin", font=font(24), fill=PALETTE["gold100"])
    img.convert("RGB").save(out / f"motion-frame-{index:02d}-{name}.png", optimize=True)


def save_pdf_from_png(png: Path, pdf: Path) -> None:
    Image.open(png).convert("RGB").save(pdf, "PDF", resolution=144.0)


def write_scene0_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Scene 0 Hero v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "scene-0-hero-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "scene-0-hero-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "scene-0-hero-mobile-390.png", "size": [390, 844]},
        ],
        "annotations": [
            "LCP target - headline DOM",
            "R3F canvas - post-FCP mount",
            "Canvas/DOM boundary visible on all breakpoints",
            "Skip story, Skip 3D, Mute controls in DOM",
            "Scroll-linked, never scroll-hijacked",
        ],
        "motionFrames": [
            "motion-frame-01-empty.png",
            "motion-frame-02-flyin-start.png",
            "motion-frame-03-flyin-mid.png",
            "motion-frame-04-flyin-end.png",
            "motion-frame-05-idle-with-cta.png",
            "motion-frame-06-scroll-cue.png",
        ],
    }
    (SCENE0_OUT / "scene-0-hero-v1.fig").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def generate_scene0() -> None:
    SCENE0_OUT.mkdir(parents=True, exist_ok=True)
    draw_scene(1920, 1080, SCENE0_OUT / "scene-0-hero-desktop-1920.png", "desktop")
    draw_scene(1024, 1366, SCENE0_OUT / "scene-0-hero-tablet-1024.png", "tablet")
    draw_scene(390, 844, SCENE0_OUT / "scene-0-hero-mobile-390.png", "mobile")
    save_pdf_from_png(SCENE0_OUT / "scene-0-hero-desktop-1920.png", SCENE0_OUT / "scene-0-hero-v1.pdf")
    draw_motion_frame(SCENE0_OUT, 1, "empty", "0.0", None, 0, 0, 0, 0)
    draw_motion_frame(SCENE0_OUT, 2, "flyin-start", "0.4", (1500, 120), 0.65, 0, 0, 0.3)
    draw_motion_frame(SCENE0_OUT, 3, "flyin-mid", "0.8", (1040, 360), 0.85, 0.5, 0, 0.6)
    draw_motion_frame(SCENE0_OUT, 4, "flyin-end", "1.2", (660, 510), 1.0, 0.9, 0.3, 0.85)
    draw_motion_frame(SCENE0_OUT, 5, "idle-with-cta", "1.6", (580, 520), 1.0, 1.0, 1.0, 1.0)
    draw_motion_frame(SCENE0_OUT, 6, "scroll-cue", "2.4", (580, 520), 1.0, 1.0, 1.0, 1.0)
    write_scene0_manifest()


def draw_scene1(width: int, height: int, path: Path, mode: str) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown500"]) + (255,))
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, width, height), fill=rgb("#6E3A18") + (255,))
    draw_spotlight(img, 0.75)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "Scene 1 - Saigon, 2020.", font=font(24 if not compact else 16, bold=True), fill=PALETTE["gold400"])
    draw_controls(d, width, compact)
    boundary = {
        "desktop": (170, 150, 1270, 780),
        "tablet": (120, 220, width - 120, 980),
        "mobile": (34, 210, width - 34, 610),
    }[mode]
    d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
    d.text((boundary[0] + 20, boundary[1] + 18), "R3F canvas - camera pan + coil_idle", font=font(20 if not compact else 11), fill=PALETTE["gold100"])
    if mode == "desktop":
        lx, ly, lh = 560, 485, 560
        sx, sy = 875, 420
        caption_x, caption_y = 360, 830
        caption_size = 30
    elif mode == "tablet":
        lx, ly, lh = width // 2 - 80, 580, 620
        sx, sy = width // 2 + 170, 500
        caption_x, caption_y = 155, 1040
        caption_size = 28
    else:
        lx, ly, lh = width // 2 - 50, 410, 360
        sx, sy = width // 2 + 92, 350
        caption_x, caption_y = 38, 655
        caption_size = 15
    draw_lumi(d, lx, ly, lh)
    d.ellipse((sx - 26, sy - 26, sx + 26, sy + 26), fill=PALETTE["gold200"], outline=PALETTE["gold400"], width=4)
    d.ellipse((sx - 58, sy - 58, sx + 58, sy + 58), outline=PALETTE["gold200"], width=3)
    draw_wisp_coil(d, sx, sy, 88 if not compact else 46)
    d.text((sx + 44 if not compact else sx - 80, sy + 42), "idea-spark\nconstraint-driven", font=font(18 if not compact else 10), fill=PALETTE["gold100"])
    d.text((caption_x, caption_y), "DOM caption - JetBrains Mono", font=font(16 if not compact else 10), fill=PALETTE["gold400"])
    caption = "\"Stephen had one rule: build what\nyou'd be proud to sign.\""
    d.text((caption_x, caption_y + 34), caption, font=font(caption_size), fill=PALETTE["gold200"], spacing=8)
    d.text((48 if not compact else 22, height - 36), "Camera: ease-genie pan-right + 0.5 unit zoom. Caption remains outside canvas.", font=font(14 if not compact else 9), fill=PALETTE["gold100"])
    img.convert("RGB").save(path, optimize=True)


def generate_idea_spark_frames() -> None:
    img = Image.new("RGB", (1800, 360), rgb("#6E3A18"))
    d = ImageDraw.Draw(img)
    frames = [(0.0, 0.06, 0.4), (0.4, 0.08, 0.7), (0.8, 0.10, 1.0), (1.2, 0.08, 0.7), (1.6, 0.07, 0.5), (2.0, 0.06, 0.4)]
    for i, (t, radius, intensity) in enumerate(frames, start=1):
        x = 150 + (i - 1) * 295
        y = 160
        r = int(210 * radius)
        halo = int(70 * intensity)
        d.ellipse((x - halo, y - halo, x + halo, y + halo), outline=PALETTE["gold200"], width=4)
        d.ellipse((x - r, y - r, x + r, y + r), fill=PALETTE["gold200"])
        d.text((x - 80, 270), f"{i}: t={t:.1f}s r={radius:.2f} e={intensity:.1f}", font=font(18), fill=PALETTE["gold100"])
    img.save(SCENE1_OUT / "idea-spark-frames.png", optimize=True)


def write_scene1_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Scene 1 Origin v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "scene-1-origin-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "scene-1-origin-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "scene-1-origin-mobile-390.png", "size": [390, 844]},
        ],
        "annotations": [
            "Background #6E3A18 / brown-400",
            "Idea-spark #F9D966 with glow-genie-soft rim",
            "Typed caption is DOM overlay, outside canvas",
            "Camera path documented in camera-path.md",
            "Wisp curl path is constraint-driven",
        ],
    }
    (SCENE1_OUT / "scene-1-origin-v1.fig").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def generate_scene1() -> None:
    SCENE1_OUT.mkdir(parents=True, exist_ok=True)
    draw_scene1(1920, 1080, SCENE1_OUT / "scene-1-origin-desktop-1920.png", "desktop")
    draw_scene1(1024, 1366, SCENE1_OUT / "scene-1-origin-tablet-1024.png", "tablet")
    draw_scene1(390, 844, SCENE1_OUT / "scene-1-origin-mobile-390.png", "mobile")
    save_pdf_from_png(SCENE1_OUT / "scene-1-origin-desktop-1920.png", SCENE1_OUT / "scene-1-origin-v1.pdf")
    generate_idea_spark_frames()
    write_scene1_manifest()


def draw_app_shell(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], progress: float) -> None:
    x0, y0, x1, y1 = box
    width = x1 - x0
    height = y1 - y0
    inset = max(8, min(28, width // 9, height // 7))
    stroke = max(2, min(4, width // 120 + 2))
    radius = max(8, min(16, width // 14, height // 10))
    draw.rounded_rectangle(box, radius=radius, fill=PALETTE["gold50"], outline=PALETTE["gold400"], width=stroke)

    header_h = max(22, min(56, int(height * 0.18)))
    header_y0 = y0 + inset
    header_y1 = min(y1 - inset, header_y0 + header_h)
    if x1 - inset > x0 + inset and header_y1 > header_y0:
        draw.rectangle((x0 + inset, header_y0, x1 - inset, header_y1), fill=PALETTE["brown500"])

    cols = int(1 + progress * 3)
    card_top = header_y1 + max(8, height // 12)
    card_bottom = y1 - inset
    available_width = max(1, width - inset * 2)
    gap = max(6, min(18, width // 28))
    min_card_width = 36
    cols = max(1, min(cols, max(1, (available_width + gap) // (min_card_width + gap))))
    card_width = max(min_card_width, (available_width - gap * (cols - 1)) // cols)
    if card_bottom <= card_top + 20:
        return

    for i in range(cols):
        cx0 = x0 + inset + i * (card_width + gap)
        cx1 = min(x1 - inset, cx0 + card_width)
        draw.rounded_rectangle((cx0, card_top, cx1, card_bottom), radius=max(5, radius // 2), outline=PALETTE["brown400"], width=max(2, stroke - 1))
        line_inset = max(8, min(18, card_width // 7))
        line_y1 = card_top + max(16, int((card_bottom - card_top) * 0.3))
        line_y2 = card_top + max(30, int((card_bottom - card_top) * 0.58))
        draw.line((cx0 + line_inset, line_y1, cx1 - line_inset, line_y1), fill=PALETTE["gold400"], width=max(2, stroke))
        if line_y2 < card_bottom - 8:
            draw.line((cx0 + line_inset, line_y2, cx1 - line_inset * 2, line_y2), fill=PALETTE["brown500"], width=max(2, stroke - 1))


def draw_scene2(width: int, height: int, path: Path, mode: str) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown500"]) + (255,))
    draw_spotlight(img, 0.65)
    d = ImageDraw.Draw(img)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "Scene 2 - From sketch to system.", font=font(24 if not compact else 15, bold=True), fill=PALETTE["gold400"])
    draw_controls(d, width, compact)
    boundary = {
        "desktop": (145, 140, 1300, 760),
        "tablet": (105, 220, width - 105, 930),
        "mobile": (30, 205, width - 30, 590),
    }[mode]
    d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
    d.text((boundary[0] + 20, boundary[1] + 16), "R3F canvas - paint clip + sketch-to-system morph", font=font(19 if not compact else 10), fill=PALETTE["gold100"])
    if mode == "desktop":
        lx, ly, lh = 420, 470, 520
        shell = (690, 265, 1190, 615)
        cap_x, cap_y = 1390, 330
        qbox = (1388, 650, 1780, 770)
    elif mode == "tablet":
        lx, ly, lh = 340, 560, 540
        shell = (435, 360, 870, 700)
        cap_x, cap_y = 150, 970
        qbox = (150, 1160, 850, 1265)
    else:
        lx, ly, lh = 142, 420, 350
        shell = (175, 305, 350, 470)
        cap_x, cap_y = 36, 625
        qbox = (36, 748, 354, 814)
    draw_lumi(d, lx, ly, lh)
    draw_app_shell(d, shell, 1.0)
    trail_start = (lx + int(lh * 0.18), ly + int(lh * 0.05))
    trail_end = (shell[0] + 45, shell[1] + 65)
    d.line((trail_start, trail_end), fill=PALETTE["gold400"], width=max(5, width // 120))
    d.text((shell[0], shell[3] + 20), "sketch -> system morph", font=font(18 if not compact else 10), fill=PALETTE["gold100"])
    d.text((cap_x, cap_y), "DOM caption beat 1", font=font(16 if not compact else 10), fill=PALETTE["gold400"])
    d.text((cap_x, cap_y + 32), "\"Most software dies in the gap\nbetween sketch and ship.\"", font=font(25 if not compact else 14), fill=PALETTE["gold200"], spacing=7)
    d.text((cap_x, cap_y + (125 if not compact else 74)), "DOM caption beat 2", font=font(16 if not compact else 10), fill=PALETTE["gold400"])
    d.text((cap_x, cap_y + (158 if not compact else 96)), "\"We close it.\"", font=font(30 if not compact else 17, bold=True), fill=PALETTE["gold200"])
    d.rounded_rectangle(qbox, radius=10, outline=PALETTE["gold400"], width=2)
    d.text((qbox[0] + 18, qbox[1] + 16), "<blockquote> Proof slot", font=font(18 if not compact else 11, bold=True), fill=PALETTE["gold400"])
    d.text((qbox[0] + 18, qbox[1] + 50), "\"They closed the gap from sketch to system.\"", font=font(17 if not compact else 10), fill=PALETTE["gold100"])
    img.convert("RGB").save(path, optimize=True)


def generate_morph_frames() -> None:
    img = Image.new("RGB", (1800, 420), rgb(PALETTE["brown500"]))
    d = ImageDraw.Draw(img)
    for i in range(6):
        x = 50 + i * 290
        box = (x, 72, x + 235, 292)
        draw_app_shell(d, box, i / 5)
        d.text((x + 18, 330), f"frame {i + 1} / t={i * 0.8:.1f}s", font=font(19), fill=PALETTE["gold100"])
    img.save(SCENE2_OUT / "sketch-to-app-morph-frames.png", optimize=True)


def write_scene2_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Scene 2 Transformation v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "scene-2-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "scene-2-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "scene-2-mobile-390.png", "size": [390, 844]},
        ],
        "annotations": [
            "Background #4A2208 / brown-500",
            "Sketchpad #FEF6D9 / gold-50",
            "Paint trail #E8B523 / gold-400",
            "Caption split into two DOM beats",
            "Includes DOM blockquote proof slot",
        ],
    }
    (SCENE2_OUT / "scene-2-v1.fig").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def generate_scene2() -> None:
    SCENE2_OUT.mkdir(parents=True, exist_ok=True)
    draw_scene2(1920, 1080, SCENE2_OUT / "scene-2-desktop-1920.png", "desktop")
    draw_scene2(1024, 1366, SCENE2_OUT / "scene-2-tablet-1024.png", "tablet")
    draw_scene2(390, 844, SCENE2_OUT / "scene-2-mobile-390.png", "mobile")
    save_pdf_from_png(SCENE2_OUT / "scene-2-desktop-1920.png", SCENE2_OUT / "scene-2-v1.pdf")
    generate_morph_frames()
    write_scene2_manifest()


def draw_curve(
    draw: ImageDraw.ImageDraw,
    start: tuple[int, int],
    control: tuple[int, int],
    end: tuple[int, int],
    color: str,
    width: int,
) -> None:
    points = []
    for i in range(28):
        t = i / 27
        x = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * control[0] + t**2 * end[0]
        y = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * control[1] + t**2 * end[1]
        points.append((x, y))
    draw.line(points, fill=color, width=width)


def draw_satellite(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    radius: int,
    label: str,
    color: str,
    compact: bool,
) -> None:
    mesh_radius = radius
    draw.ellipse((cx - mesh_radius - 8, cy - mesh_radius - 8, cx + mesh_radius + 8, cy + mesh_radius + 8), outline=color, width=2)
    draw.ellipse((cx - mesh_radius, cy - mesh_radius, cx + mesh_radius, cy + mesh_radius), fill=color, outline=PALETTE["gold100"], width=2)
    draw.line((cx - mesh_radius + 8, cy, cx + mesh_radius - 8, cy), fill=PALETTE["brown500"], width=2)
    draw.line((cx, cy - mesh_radius + 8, cx, cy + mesh_radius - 8), fill=PALETTE["brown500"], width=2)
    text_font = font(18 if not compact else 9, bold=True)
    text_box = draw.textbbox((0, 0), label, font=text_font)
    draw.text((cx - (text_box[2] - text_box[0]) / 2, cy + mesh_radius + (10 if not compact else 5)), label, font=text_font, fill=PALETTE["gold100"])


def draw_logos_strip(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], compact: bool) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=10, outline=PALETTE["gold400"], width=2)
    draw.text((x0 + 18, y0 + 14), "DOM logos strip - grayscale proof", font=font(16 if not compact else 10, bold=True), fill=PALETTE["gold400"])
    logo_count = 6
    gap = max(8, (x1 - x0 - 36) // (logo_count * 4))
    logo_w = max(24, (x1 - x0 - 36 - gap * (logo_count - 1)) // logo_count)
    logo_h = max(18, min(34, y1 - y0 - 64))
    y = y1 - logo_h - 18
    for i in range(logo_count):
        x = x0 + 18 + i * (logo_w + gap)
        draw.rounded_rectangle((x, y, x + logo_w, y + logo_h), radius=4, fill=PALETTE["grayLogo"])


def draw_scene3(width: int, height: int, path: Path, mode: str) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown500"]) + (255,))
    draw_spotlight(img, 0.55)
    d = ImageDraw.Draw(img)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "Scene 3 - Four hands of the same craft.", font=font(24 if not compact else 14, bold=True), fill=PALETTE["gold400"])
    draw_controls(d, width, compact)
    boundary = {
        "desktop": (145, 140, 1300, 760),
        "tablet": (105, 220, width - 105, 920),
        "mobile": (30, 205, width - 30, 560),
    }[mode]
    d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
    d.text((boundary[0] + 20, boundary[1] + 16), "R3F canvas - split_to_4 ribbons + capability satellites", font=font(19 if not compact else 9), fill=PALETTE["gold100"])

    if mode == "desktop":
        center = (720, 455)
        orbit = 245
        sat_r = 52
        lumi_h = 315
        cap_x, cap_y = 1390, 280
        logos = (1388, 625, 1780, 745)
    elif mode == "tablet":
        center = (512, 555)
        orbit = 255
        sat_r = 48
        lumi_h = 330
        cap_x, cap_y = 142, 970
        logos = (142, 1170, 882, 1285)
    else:
        center = (195, 382)
        orbit = 112
        sat_r = 26
        lumi_h = 180
        cap_x, cap_y = 34, 610
        logos = (34, 748, 356, 816)

    satellites = [
        ("React", (center[0], center[1] - orbit), PALETTE["cyan"], (center[0] - orbit // 3, center[1] - orbit // 2)),
        ("Three.js", (center[0] + orbit, center[1]), PALETTE["magenta"], (center[0] + orbit // 2, center[1] - orbit // 3)),
        ("AI/RAG", (center[0], center[1] + orbit), PALETTE["lime"], (center[0] + orbit // 3, center[1] + orbit // 2)),
        ("Design Systems", (center[0] - orbit, center[1]), PALETTE["gold400"], (center[0] - orbit // 2, center[1] + orbit // 3)),
    ]
    ribbon_width = max(3, width // 180)
    for _, end, _, control in satellites:
        draw_curve(d, center, control, end, PALETTE["gold400"], ribbon_width)

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    draw_lumi(od, center[0], center[1] + int(lumi_h * 0.08), lumi_h, 150)
    img.alpha_composite(overlay)
    d = ImageDraw.Draw(img)

    for label, pos, color, _ in satellites:
        draw_satellite(d, pos[0], pos[1], sat_r, label, color, compact)

    d.text((cap_x, cap_y), "DOM caption - JetBrains Mono", font=font(16 if not compact else 10), fill=PALETTE["gold400"])
    d.text(
        (cap_x, cap_y + 34),
        "React, Three.js, AI, design systems —\nfour hands of the same craft.",
        font=font(24 if not compact else 13),
        fill=PALETTE["gold200"],
        spacing=8 if not compact else 3,
    )
    draw_logos_strip(d, logos, compact)
    d.text((48 if not compact else 22, height - 36), "Cool accents are constrained to the React / Three.js / AI satellite meshes only.", font=font(14 if not compact else 9), fill=PALETTE["gold100"])
    img.convert("RGB").save(path, optimize=True)


def write_scene3_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Scene 3 Capabilities v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "scene-3-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "scene-3-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "scene-3-mobile-390.png", "size": [390, 844]},
        ],
        "satellites": [
            {"clock": "12", "capability": "React", "color": "#7DD3FC"},
            {"clock": "3", "capability": "Three.js", "color": "#F0ABFC"},
            {"clock": "6", "capability": "AI/RAG", "color": "#BEF264"},
            {"clock": "9", "capability": "Design Systems", "color": "#E8B523"},
        ],
        "annotations": [
            "Background #4A2208 / brown-500",
            "Cool accents appear only on the React, Three.js, and AI/RAG satellite meshes",
            "Design Systems satellite remains gold-400 home base",
            "Lumi remains warm gold and partially faded during split_to_4",
            "Caption is DOM overlay: React, Three.js, AI, design systems — four hands of the same craft.",
            "Includes DOM logos strip slot, grayscale-on-dark, six logo placeholders",
        ],
    }
    (SCENE3_OUT / "scene-3-v1.fig").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def generate_scene3() -> None:
    SCENE3_OUT.mkdir(parents=True, exist_ok=True)
    draw_scene3(1920, 1080, SCENE3_OUT / "scene-3-desktop-1920.png", "desktop")
    draw_scene3(1024, 1366, SCENE3_OUT / "scene-3-tablet-1024.png", "tablet")
    draw_scene3(390, 844, SCENE3_OUT / "scene-3-mobile-390.png", "mobile")
    save_pdf_from_png(SCENE3_OUT / "scene-3-desktop-1920.png", SCENE3_OUT / "scene-3-v1.pdf")
    write_scene3_manifest()


TEAM_AVATARS = [
    ("Minh", "Senior Engineer", -0.78, -0.12, -2.0, 0.15, 0.08),
    ("Linh", "Design Systems Lead", -0.48, 0.16, -1.6, 0.17, 0.10),
    ("An", "AI Engineer", -0.28, -0.34, -1.2, 0.19, 0.14),
    ("Bao", "Three.js Engineer", 0.08, 0.22, -0.9, 0.21, 0.18),
    ("Trang", "Product Engineer", 0.36, -0.20, -0.5, 0.22, 0.22),
    ("Quang", "Backend Engineer", 0.68, 0.08, -0.2, 0.24, 0.26),
    ("Nhi", "QA Lead", -0.62, 0.44, 0.0, 0.24, 0.30),
    ("Duc", "Frontend Engineer", -0.05, -0.02, 0.35, 0.26, 0.34),
    ("Hanh", "Delivery Lead", 0.46, 0.42, 0.7, 0.28, 0.40),
    ("Khoa", "Founder Engineer", 0.82, -0.42, 1.0, 0.30, 0.46),
]

CTA_TRACKS = [
    {
        "id": "buy",
        "label": "Book a Discovery Call",
        "subhead": "For builders who need senior partners.",
        "describedBy": "For NA/EU enterprise and SMB buyers — find a senior, English-fluent dev partner without paying NA prices.",
        "fill": "gold400",
        "edge": "gold400",
        "text": "brown700",
        "rotation": -24,
    },
    {
        "id": "partner",
        "label": "Partner With Us",
        "subhead": "For agencies seeking white-label & co-delivery.",
        "describedBy": "For tech partners and agencies — find a white-label or co-delivery partner with React, Three.js, and AI specialisation.",
        "fill": "brown500",
        "edge": "gold400",
        "text": "gold200",
        "rotation": 0,
    },
    {
        "id": "join",
        "label": "Join the Team",
        "subhead": "For senior craftspeople, remote-first.",
        "describedBy": "For talent and recruits — join a craft-driven remote Vietnamese team. Senior peers. Founder-accessible.",
        "fill": "gold100",
        "edge": "brown500",
        "text": "brown500",
        "rotation": 24,
    },
]


def draw_transmission_bokeh(img: Image.Image, boundary: tuple[int, int, int, int], compact: bool) -> None:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    x0, y0, x1, y1 = boundary
    bokeh_points = [
        (0.12, 0.18, 34, 22),
        (0.25, 0.74, 52, 18),
        (0.38, 0.28, 44, 20),
        (0.50, 0.82, 38, 16),
        (0.61, 0.18, 58, 19),
        (0.72, 0.62, 46, 20),
        (0.82, 0.34, 64, 17),
        (0.90, 0.78, 36, 15),
        (0.18, 0.48, 42, 16),
        (0.56, 0.50, 50, 14),
    ]
    scale = 0.62 if compact else 1.0
    for nx, ny, radius, alpha in bokeh_points:
        cx = int(x0 + (x1 - x0) * nx)
        cy = int(y0 + (y1 - y0) * ny)
        r = int(radius * scale)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*rgb(PALETTE["gold200"]), alpha), outline=(*rgb(PALETTE["gold100"]), alpha + 20))
    img.alpha_composite(overlay)


def draw_team_avatar(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    radius: int,
    index: int,
    compact: bool,
) -> None:
    draw.ellipse((cx - radius - 5, cy - radius - 5, cx + radius + 5, cy + radius + 5), outline=PALETTE["gold200"], width=2)
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=PALETTE["brown700"], outline=PALETTE["gold400"], width=2)
    draw.ellipse((cx - radius // 2, cy - radius // 2, cx + radius // 2, cy + radius // 2), fill=PALETTE["gold200"])
    badge = str(index)
    text_font = font(13 if not compact else 8, bold=True)
    bbox = draw.textbbox((0, 0), badge, font=text_font)
    draw.text((cx - (bbox[2] - bbox[0]) / 2, cy - (bbox[3] - bbox[1]) / 2 - 1), badge, font=text_font, fill=PALETTE["brown700"])


def draw_scene4(width: int, height: int, path: Path, mode: str) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown400"]) + (255,))
    draw_spotlight(img, 0.45)
    d = ImageDraw.Draw(img)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "Scene 4 - Ten people. One craft.", font=font(24 if not compact else 14, bold=True), fill=PALETTE["gold400"])
    draw_controls(d, width, compact)
    boundary = {
        "desktop": (145, 140, 1300, 760),
        "tablet": (105, 220, width - 105, 930),
        "mobile": (30, 205, width - 30, 575),
    }[mode]
    d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
    d.text((boundary[0] + 20, boundary[1] + 16), "R3F canvas - MeshTransmissionMaterial bokeh + avatar parallax", font=font(19 if not compact else 9), fill=PALETTE["gold100"])
    draw_transmission_bokeh(img, boundary, compact)
    d = ImageDraw.Draw(img)

    x0, y0, x1, y1 = boundary
    cx = (x0 + x1) // 2
    cy = (y0 + y1) // 2
    span_x = int((x1 - x0) * (0.42 if not compact else 0.38))
    span_y = int((y1 - y0) * (0.34 if not compact else 0.30))

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    draw_lumi(od, cx, cy - int((y1 - y0) * 0.08), int((y1 - y0) * (0.36 if not compact else 0.30)), 92)
    img.alpha_composite(overlay)
    d = ImageDraw.Draw(img)
    d.text((cx - (118 if not compact else 58), cy - int((y1 - y0) * 0.29)), "Lumi emissive 0.1", font=font(16 if not compact else 9), fill=PALETTE["gold100"])

    for index, (_, _, sx, sy, z, scale, _) in enumerate(sorted(TEAM_AVATARS, key=lambda item: item[4]), start=1):
        ax = int(cx + sx * span_x)
        ay = int(cy + sy * span_y)
        radius = max(9, int((38 if not compact else 22) * (scale / 0.22) * (1 + max(z, -1) * 0.08)))
        draw_team_avatar(d, ax, ay, radius, index, compact)

    if mode == "desktop":
        cap_x, cap_y = 1390, 310
        link_y = 548
    elif mode == "tablet":
        cap_x, cap_y = 142, 982
        link_y = 1116
    else:
        cap_x, cap_y = 34, 615
        link_y = 720
    d.text((cap_x, cap_y), "DOM caption - JetBrains Mono", font=font(16 if not compact else 10), fill=PALETTE["gold400"])
    d.text((cap_x, cap_y + 34), "\"Ten of us. All senior.\nAll Vietnamese. All remote.\"", font=font(28 if not compact else 15), fill=PALETTE["gold200"], spacing=8)
    d.text((cap_x, link_y), "We're hiring 3", font=font(18 if not compact else 11), fill=PALETTE["gold100"])
    d.line((cap_x, link_y + (24 if not compact else 14), cap_x + (122 if not compact else 76), link_y + (24 if not compact else 14)), fill=PALETTE["gold100"], width=1)
    d.text((48 if not compact else 22, height - 36), "Hover spec: first name + role only. No photos, no LinkedIn links.", font=font(14 if not compact else 9), fill=PALETTE["gold100"])
    img.convert("RGB").save(path, optimize=True)


def write_scene4_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Scene 4 Team v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "scene-4-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "scene-4-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "scene-4-mobile-390.png", "size": [390, 844]},
        ],
        "avatarCount": 10,
        "annotations": [
            "Background #6E3A18 / brown-400 warm golden-hour",
            "MeshTransmissionMaterial bokeh layer: 10 soft depth orbs",
            "Exactly 10 abstract avatar proxies with gold-200 rim-light",
            "Lumi pulled back above frame center, emissive 0.1",
            "Caption is DOM overlay: Ten of us. All senior. All Vietnamese. All remote.",
            "We're hiring 3 is a subordinate text link, not a CTA button",
            "Hover reveals first name + role only; no photos, no LinkedIn links",
        ],
    }
    (SCENE4_OUT / "scene-4-v1.fig").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def generate_scene4() -> None:
    SCENE4_OUT.mkdir(parents=True, exist_ok=True)
    draw_scene4(1920, 1080, SCENE4_OUT / "scene-4-desktop-1920.png", "desktop")
    draw_scene4(1024, 1366, SCENE4_OUT / "scene-4-tablet-1024.png", "tablet")
    draw_scene4(390, 844, SCENE4_OUT / "scene-4-mobile-390.png", "mobile")
    save_pdf_from_png(SCENE4_OUT / "scene-4-desktop-1920.png", SCENE4_OUT / "scene-4-v1.pdf")
    write_scene4_manifest()


def mix_hex(start: str, end: str, t: float) -> tuple[int, int, int]:
    a = rgb(start)
    b = rgb(end)
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def globe_xy(cx: int, cy: int, radius: int, lat: float, lon: float) -> tuple[int, int]:
    x = cx + int((lon / 180) * radius * 0.78)
    y = cy - int((lat / 90) * radius * 0.72)
    dx = x - cx
    dy = y - cy
    dist = math.sqrt(dx * dx + dy * dy)
    if dist > radius * 0.9:
        scale = (radius * 0.9) / dist
        x = cx + int(dx * scale)
        y = cy + int(dy * scale)
    return x, y


def draw_globe(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int, compact: bool) -> None:
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=PALETTE["brown700"], outline=PALETTE["gold400"], width=3)
    for i in range(-3, 4):
        offset = int(radius * i / 4)
        width = max(10, int(math.sqrt(max(radius * radius - offset * offset, 0))))
        draw.arc((cx - width, cy - radius, cx + width, cy + radius), 90, 270, fill=PALETTE["brown400"], width=2)
        draw.arc((cx - width, cy - radius, cx + width, cy + radius), -90, 90, fill=PALETTE["gold500"], width=2)
    for j in range(-2, 3):
        y = cy + int(radius * j / 4)
        half = int(math.sqrt(max(radius * radius - (y - cy) * (y - cy), 0)))
        draw.arc((cx - half, y - radius // 5, cx + half, y + radius // 5), 0, 180, fill=PALETTE["gold500"], width=2)
    for i in range(9):
        angle = i * math.tau / 9
        x1 = cx + math.cos(angle) * radius * 0.82
        y1 = cy + math.sin(angle) * radius * 0.82
        x2 = cx + math.cos(angle + math.tau / 18) * radius * 0.35
        y2 = cy + math.sin(angle + math.tau / 18) * radius * 0.35
        draw.line((x1, y1, x2, y2), fill=PALETTE["gold400"], width=1 if compact else 2)
    draw.text((cx - radius + 18, cy + radius - (42 if not compact else 24)), "~6k tri stylized globe", font=font(16 if not compact else 9), fill=PALETTE["gold100"])


def draw_pin(draw: ImageDraw.ImageDraw, x: int, y: int, color: str, label: str, compact: bool, pulse: bool = False) -> None:
    r = 12 if not compact else 7
    if pulse:
        draw.ellipse((x - r * 2, y - r * 2, x + r * 2, y + r * 2), outline=color, width=2)
    draw.ellipse((x - r, y - r, x + r, y + r), fill=color, outline=PALETTE["gold100"], width=2)
    draw.text((x + r + 5, y - r), label, font=font(15 if not compact else 8, bold=True), fill=PALETTE["gold100"])


def draw_gradient_arc(
    draw: ImageDraw.ImageDraw,
    start: tuple[int, int],
    control: tuple[int, int],
    end: tuple[int, int],
    width: int,
) -> None:
    points = []
    for i in range(36):
        t = i / 35
        x = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * control[0] + t**2 * end[0]
        y = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * control[1] + t**2 * end[1]
        points.append((x, y))
    for i in range(len(points) - 1):
        color = mix_hex(PALETTE["gold400"], PALETTE["starYellow"], i / (len(points) - 2))
        draw.line((points[i], points[i + 1]), fill=color, width=width)


def draw_clock_widget(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], compact: bool) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=10, outline=PALETTE["gold400"], width=2)
    f_head = font(16 if not compact else 9, bold=True)
    f_body = font(18 if not compact else 10)
    draw.text((x0 + 16, y0 + 12), "Live clock widget slot", font=f_head, fill=PALETTE["gold400"])
    draw.text((x0 + 16, y0 + (42 if not compact else 30)), "HCMC UTC+7 09:00", font=f_body, fill=PALETTE["gold100"])
    draw.text((x0 + 16, y0 + (72 if not compact else 50)), "Visitor local 22:00", font=f_body, fill=PALETTE["gold100"])
    draw.text((x0 + 16, y0 + (102 if not compact else 70)), "Overlap highlighted", font=f_body, fill=PALETTE["starYellow"])


def draw_trust_strip(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], compact: bool) -> None:
    x0, y0, x1, y1 = box
    signals = ["DUNS 673219568", "Founded 2020", "10 senior engineers", "2 active engagements", "Time-zone honesty", "GDPR-ready", "NDAs standard"]
    draw.rounded_rectangle(box, radius=10, outline=PALETTE["gold400"], width=2)
    f = font(15 if not compact else 8, bold=True)
    x = x0 + 16
    y = y0 + 16
    max_x = x1 - 16
    for signal in signals:
        bbox = draw.textbbox((0, 0), signal, font=f)
        chip_w = bbox[2] - bbox[0] + (28 if not compact else 14)
        chip_h = 34 if not compact else 20
        if x + chip_w > max_x:
            x = x0 + 16
            y += chip_h + (10 if not compact else 6)
        draw.rounded_rectangle((x, y, x + chip_w, y + chip_h), radius=6, outline=PALETTE["gold500"], width=1)
        draw.text((x + (14 if not compact else 7), y + (8 if not compact else 5)), signal, font=f, fill=PALETTE["gold100"])
        x += chip_w + (10 if not compact else 6)


def draw_scene5(width: int, height: int, path: Path, mode: str) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown500"]) + (255,))
    draw_spotlight(img, 0.7)
    d = ImageDraw.Draw(img)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "Scene 5 - Vietnam to global.", font=font(24 if not compact else 14, bold=True), fill=PALETTE["gold400"])
    draw_controls(d, width, compact)
    boundary = {
        "desktop": (120, 130, 1280, 760),
        "tablet": (95, 210, width - 95, 920),
        "mobile": (28, 198, width - 28, 575),
    }[mode]
    d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
    d.text((boundary[0] + 20, boundary[1] + 16), "R3F canvas - stylized globe + nonla_appear + HCMC arcs", font=font(19 if not compact else 9), fill=PALETTE["gold100"])

    if mode == "desktop":
        globe = (610, 435, 245)
        lumi = (1125, 515, 305)
        cap_x, cap_y = 1380, 255
        widget = (1378, 472, 1800, 620)
        trust = (155, 820, 1765, 930)
    elif mode == "tablet":
        globe = (500, 510, 270)
        lumi = (750, 620, 295)
        cap_x, cap_y = 135, 960
        widget = (135, 1080, 890, 1190)
        trust = (135, 1222, 890, 1320)
    else:
        globe = (188, 365, 122)
        lumi = (312, 480, 155)
        cap_x, cap_y = 34, 604
        widget = (34, 668, 356, 748)
        trust = (34, 760, 356, 832)

    gx, gy, gr = globe
    draw_globe(d, gx, gy, gr, compact)
    hcmc = globe_xy(gx, gy, gr, 10.776, 106.701)
    destinations = [
        ("NYC", globe_xy(gx, gy, gr, 40.7128, -74.0060)),
        ("London", globe_xy(gx, gy, gr, 51.5072, -0.1276)),
        ("Berlin", globe_xy(gx, gy, gr, 52.5200, 13.4050)),
    ]
    for label, end in destinations:
        control = ((hcmc[0] + end[0]) // 2, min(hcmc[1], end[1]) - int(gr * 0.42))
        draw_gradient_arc(d, hcmc, control, end, max(3, width // 220))
    draw_pin(d, hcmc[0], hcmc[1], PALETTE["flagRed"], "HCMC", compact, pulse=True)
    for label, end in destinations:
        draw_pin(d, end[0], end[1], PALETTE["starYellow"], label, compact)

    lx, ly, lh = lumi
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    draw_lumi(od, lx, ly, lh, 230)
    draw_nonla(od, lx, ly, lh)
    img.alpha_composite(overlay)
    d = ImageDraw.Draw(img)
    d.text((lx - (110 if not compact else 55), ly + int(lh * 0.58)), "nonla_appear: first scene use", font=font(16 if not compact else 8), fill=PALETTE["gold100"])

    d.text((cap_x, cap_y), "DOM caption - JetBrains Mono", font=font(16 if not compact else 10), fill=PALETTE["gold400"])
    d.text((cap_x, cap_y + (34 if not compact else 26)), "\"From Sài Gòn to your\ntime zone.\"", font=font(30 if not compact else 16), fill=PALETTE["gold200"], spacing=8)
    draw_clock_widget(d, widget, compact)
    draw_trust_strip(d, trust, compact)
    img.convert("RGB").save(path, optimize=True)


def write_scene5_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Scene 5 Vietnam Global v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "scene-5-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "scene-5-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "scene-5-mobile-390.png", "size": [390, 844]},
        ],
        "coordinates": {"hcmc": {"lat": 10.776, "lon": 106.701}},
        "destinations": ["NYC", "London", "Berlin"],
        "annotations": [
            "Stylized flat-shaded globe, approximately 6k triangles, no photo texture",
            "Vietnam pin uses #DA251D at HCMC 10.776N 106.701E",
            "Destination pins use #FFCD00 endpoints for NYC, London, Berlin",
            "Arc draw uses #E8B523 shading to #FFCD00",
            "Lumi wears the red nón lá here for the first time",
            "Caption is DOM overlay: From Sài Gòn to your time zone.",
            "Time-zone live-clock widget slot appears in the bottom third",
            "Trust strip: DUNS 673219568, founded 2020, 10 senior engineers, 2 active engagements, time-zone honesty, GDPR-ready, NDAs standard",
        ],
    }
    (SCENE5_OUT / "scene-5-v1.fig").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def generate_scene5() -> None:
    SCENE5_OUT.mkdir(parents=True, exist_ok=True)
    draw_scene5(1920, 1080, SCENE5_OUT / "scene-5-desktop-1920.png", "desktop")
    draw_scene5(1024, 1366, SCENE5_OUT / "scene-5-tablet-1024.png", "tablet")
    draw_scene5(390, 844, SCENE5_OUT / "scene-5-mobile-390.png", "mobile")
    save_pdf_from_png(SCENE5_OUT / "scene-5-desktop-1920.png", SCENE5_OUT / "scene-5-v1.pdf")
    write_scene5_manifest()


def wrap_lines(draw: ImageDraw.ImageDraw, text: str, text_font: ImageFont.ImageFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = word if not current else f"{current} {word}"
        if draw.textbbox((0, 0), candidate, font=text_font)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_focus_ring(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle((x0 - 4, y0 - 4, x1 + 4, y1 + 4), radius=12, outline=PALETTE["gold400"], width=2)
    draw.rounded_rectangle((x0 - 2, y0 - 2, x1 + 2, y1 + 2), radius=10, outline=PALETTE["brown700"], width=2)


def draw_portal(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    track: dict[str, object],
    compact: bool,
    focused: bool = False,
) -> None:
    if focused:
        draw_focus_ring(draw, box)
    x0, y0, x1, y1 = box
    fill = PALETTE[str(track["fill"])]
    edge = PALETTE[str(track["edge"])]
    text = PALETTE[str(track["text"])]
    draw.rounded_rectangle(box, radius=14, fill=fill, outline=edge, width=3)
    draw.rounded_rectangle((x0 + 12, y0 + 12, x0 + 56, y0 + 56), radius=6, outline=edge if fill != edge else PALETTE["brown500"], width=2)
    draw.text((x0 + 15, y0 + 25), "44", font=font(11 if not compact else 8, bold=True), fill=text)
    label_font = font(23 if not compact else 15, bold=True)
    sub_font = font(15 if not compact else 10)
    desc_font = font(13 if not compact else 8)
    draw.text((x0 + 72, y0 + 24), str(track["label"]), font=label_font, fill=text)
    draw.text((x0 + 72, y0 + (60 if not compact else 50)), str(track["subhead"]), font=sub_font, fill=text)
    desc_lines = wrap_lines(draw, str(track["describedBy"]), desc_font, x1 - x0 - 42)
    desc_y = y0 + (103 if not compact else 72)
    for line in desc_lines[:3]:
        draw.text((x0 + 22, desc_y), line, font=desc_font, fill=text)
        desc_y += 20 if not compact else 12


def draw_lumi_focus(draw: ImageDraw.ImageDraw, cx: int, cy: int, height: int, rotation: int, compact: bool) -> None:
    draw_lumi(draw, cx, cy, height, 240)
    s = height / 520
    head_y = cy - int(8 * s)
    direction = 1 if rotation > 0 else -1 if rotation < 0 else 0
    if direction:
        draw.line((cx, head_y, cx + direction * int(92 * s), head_y - int(30 * s)), fill=PALETTE["gold100"], width=max(2, int(5 * s)))
    else:
        draw.line((cx - int(45 * s), head_y - int(42 * s), cx + int(45 * s), head_y - int(42 * s)), fill=PALETTE["gold100"], width=max(2, int(5 * s)))
    draw.text((cx - int(88 * s), cy + int(278 * s)), f"head {rotation:+d} deg", font=font(13 if compact else 17), fill=PALETTE["gold100"])


def draw_modal_fallback(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], compact: bool) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=12, fill=PALETTE["brown700"], outline=PALETTE["gold400"], width=2)
    draw.text((x0 + 18, y0 + 16), "Form modal lazy-load", font=font(17 if not compact else 10, bold=True), fill=PALETTE["gold400"])
    draw.text((x0 + 18, y0 + (50 if not compact else 36)), "Loading...  aria-live=\"polite\"", font=font(18 if not compact else 10), fill=PALETTE["gold100"])
    draw.text((x0 + 18, y0 + (84 if not compact else 56)), "Then selected form replaces fallback.", font=font(15 if not compact else 9), fill=PALETTE["gold200"])


def draw_scene6(width: int, height: int, path: Path, mode: str, focused_track: str | None = None, show_modal: bool = False) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown700"]) + (255,))
    draw_spotlight(img, 0.8)
    d = ImageDraw.Draw(img)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "Scene 6 - CTA Hub.", font=font(24 if not compact else 14, bold=True), fill=PALETTE["gold400"])
    draw_controls(d, width, compact)
    boundary = {
        "desktop": (120, 130, 1800, 865),
        "tablet": (95, 190, width - 95, 1035),
        "mobile": (28, 188, width - 28, 790),
    }[mode]
    d.rounded_rectangle(boundary, radius=18, outline=PALETTE["gold500"], width=3)
    d.text((boundary[0] + 20, boundary[1] + 16), "DOM portals + R3F Lumi focus bridge", font=font(19 if not compact else 9), fill=PALETTE["gold100"])

    active_track = focused_track or "buy"
    active = next(track for track in CTA_TRACKS if track["id"] == active_track)
    if mode == "desktop":
        d.text((180, 205), "DOM caption - JetBrains Mono", font=font(16), fill=PALETTE["gold400"])
        d.text((180, 242), "\"You bring the will.\nWe bring the real.\"", font=font(45, bold=True), fill=PALETTE["gold200"], spacing=8)
        draw_lumi_focus(d, 410, 555, 360, int(active["rotation"]), compact)
        portal_boxes = [(720, 315, 1050, 590), (1084, 315, 1414, 590), (1448, 315, 1778, 590)]
        modal = (880, 650, 1540, 800)
    elif mode == "tablet":
        d.text((145, 245), "DOM caption - JetBrains Mono", font=font(15), fill=PALETTE["gold400"])
        d.text((145, 282), "\"You bring the will. We bring the real.\"", font=font(38, bold=True), fill=PALETTE["gold200"])
        draw_lumi_focus(d, 515, 455, 250, int(active["rotation"]), compact)
        portal_boxes = [(175, 560, 850, 690), (175, 715, 850, 845), (175, 870, 850, 1000)]
        modal = (195, 1064, 830, 1185)
    else:
        d.text((42, 214), "DOM caption", font=font(10), fill=PALETTE["gold400"])
        d.text((42, 238), "\"You bring the will.\nWe bring the real.\"", font=font(26, bold=True), fill=PALETTE["gold200"], spacing=2)
        draw_lumi_focus(d, 196, 340, 145, int(active["rotation"]), compact)
        portal_boxes = [(44, 430, 346, 518), (44, 542, 346, 630), (44, 654, 346, 742)]
        modal = (44, 750, 346, 832)

    for box, track in zip(portal_boxes, CTA_TRACKS):
        draw_portal(d, box, track, compact, focused=str(track["id"]) == active_track)

    d.text((portal_boxes[0][0], portal_boxes[-1][3] + (20 if not compact else 10)), ":focus-visible = 2px gold outline + 2px offset; each target >= 44x44", font=font(14 if not compact else 8), fill=PALETTE["gold100"])
    if show_modal:
        draw_modal_fallback(d, modal, compact)
    img.convert("RGB").save(path, optimize=True)


def generate_scene6_focus_variants() -> None:
    img = Image.new("RGBA", (1800, 720), rgb(PALETTE["brown700"]) + (255,))
    draw_spotlight(img, 0.55)
    d = ImageDraw.Draw(img)
    for i, track in enumerate(CTA_TRACKS):
        x0 = 70 + i * 575
        panel = (x0, 70, x0 + 500, 645)
        d.rounded_rectangle(panel, radius=16, outline=PALETTE["gold500"], width=2)
        d.text((x0 + 24, 96), f"Lumi-facing-{track['id']}", font=font(24, bold=True), fill=PALETTE["gold400"])
        draw_lumi_focus(d, x0 + 250, 305, 250, int(track["rotation"]), False)
        draw_portal(d, (x0 + 70, 455, x0 + 430, 590), track, False, focused=True)
    img.convert("RGB").save(SCENE6_OUT / "lumi-focus-variants.png", optimize=True)


def write_scene6_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Scene 6 CTA Hub v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "scene-6-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "scene-6-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "scene-6-mobile-390.png", "size": [390, 844]},
            {"name": "focus-variants", "path": "lumi-focus-variants.png", "size": [1800, 720]},
            {"name": "partner-deep-link", "path": "scene-6-partner-deeplink.png", "size": [1920, 1080]},
        ],
        "portalCount": 3,
        "deepLinkVariant": "?track=partner",
        "focusStates": ["default", "hover", "focused-keyboard", "focused-deep-link", "clicked-opens-modal"],
        "annotations": [
            "Exactly 3 portals: buy, partner, join",
            "Buy portal: #E8B523 fill with dark label",
            "Partner portal: #4A2208 fill with #E8B523 edge",
            "Join portal: #FCEAA8 fill with #4A2208 edge",
            "Caption is DOM overlay: You bring the will. We bring the real.",
            "Focus ring is 2px gold-400 with 2px offset",
            "Every portal target is annotated at >= 44x44",
            "Partner deep-link variant shows ?track=partner pre-focused",
            "Modal fallback shows Loading... aria-live=\"polite\"",
        ],
    }
    (SCENE6_OUT / "scene-6-v1.fig").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def generate_scene6() -> None:
    SCENE6_OUT.mkdir(parents=True, exist_ok=True)
    draw_scene6(1920, 1080, SCENE6_OUT / "scene-6-desktop-1920.png", "desktop")
    draw_scene6(1024, 1366, SCENE6_OUT / "scene-6-tablet-1024.png", "tablet")
    draw_scene6(390, 844, SCENE6_OUT / "scene-6-mobile-390.png", "mobile")
    draw_scene6(1920, 1080, SCENE6_OUT / "scene-6-partner-deeplink.png", "desktop", focused_track="partner", show_modal=True)
    save_pdf_from_png(SCENE6_OUT / "scene-6-desktop-1920.png", SCENE6_OUT / "scene-6-v1.pdf")
    generate_scene6_focus_variants()
    write_scene6_manifest()


def draw_corner_avatar(draw: ImageDraw.ImageDraw, x: int, y: int, size: int) -> None:
    cx = x + size // 2
    cy = y + size // 2 + 5
    draw.ellipse((x + 7, y + 14, x + size - 7, y + size - 3), fill=PALETTE["gold400"], outline=PALETTE["brown700"], width=2)
    draw.ellipse((cx - 9, cy - 5, cx + 9, cy + 9), fill=PALETTE["gold100"], outline=PALETTE["brown700"], width=1)
    draw.ellipse((cx - 5, cy, cx - 2, cy + 3), fill=PALETTE["brown700"])
    draw.ellipse((cx + 2, cy, cx + 5, cy + 3), fill=PALETTE["brown700"])
    draw.polygon([(cx, y + 1), (x + size - 5, y + 19), (x + 5, y + 19)], fill=PALETTE["flagRed"], outline=PALETTE["gold100"])
    draw.polygon(star_points(cx, y + 14, 5, 2), fill=PALETTE["starYellow"])


def draw_footer_trust(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], compact: bool) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=10, outline=PALETTE["gold400"], width=2)
    f_head = font(17 if not compact else 10, bold=True)
    f_body = font(15 if not compact else 8)
    trust_lines = [
        "CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY",
        "D-U-N-S 673219568 - external dnb.com link",
        "Founded 2020",
        "1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward, Ho Chi Minh City, Vietnam",
        "Phone: (+84) 906 878 091",
        "info@cyberskill.world",
        "Founder: Stephen Cheng · Trịnh Thái Anh",
    ]
    draw.text((x0 + 18, y0 + 16), "Trust signals", font=f_head, fill=PALETTE["gold400"])
    y = y0 + (50 if not compact else 34)
    for line in trust_lines:
        for wrapped in wrap_lines(draw, line, f_body, x1 - x0 - 36):
            draw.text((x0 + 18, y), wrapped, font=f_body, fill=PALETTE["gold100"])
            y += 22 if not compact else 13


def draw_footer_nav(draw: ImageDraw.ImageDraw, x: int, y: int, compact: bool) -> None:
    f_head = font(17 if not compact else 10, bold=True)
    f_body = font(16 if not compact else 9)
    draw.text((x, y), "Secondary nav", font=f_head, fill=PALETTE["gold400"])
    links = ["/work", "/lite", "/accessibility", "/privacy", "/terms"]
    for i, link in enumerate(links):
        draw.text((x, y + 34 + i * (28 if not compact else 18)), link, font=f_body, fill=PALETTE["gold100"])
    draw.text((x, y + (190 if not compact else 128)), "Language", font=f_head, fill=PALETTE["gold400"])
    draw.text((x, y + (224 if not compact else 148)), "EN / VI", font=f_body, fill=PALETTE["gold100"])


def draw_wave_sequence(draw: ImageDraw.ImageDraw, positions: list[tuple[int, int, int]], compact: bool) -> None:
    labels = ["wave_goodbye start", "wave_goodbye mid", "curl to corner"]
    for i, (x, y, h) in enumerate(positions):
        draw_lumi(draw, x, y, h, 220)
        draw_nonla(draw, x, y, h)
        s = h / 520
        if i < 2:
            draw.arc((x - int(95 * s), y - int(20 * s), x + int(15 * s), y + int(95 * s)), 190, 320, fill=PALETTE["gold100"], width=max(2, int(7 * s)))
            draw.arc((x - int(10 * s), y - int(20 * s), x + int(100 * s), y + int(95 * s)), 220, 350, fill=PALETTE["gold100"], width=max(2, int(7 * s)))
        draw.text((x - int(90 * s), y + int(310 * s)), labels[i], font=font(15 if not compact else 8), fill=PALETTE["gold100"])


def draw_footer_scene(width: int, height: int, path: Path, mode: str) -> None:
    img = Image.new("RGBA", (width, height), rgb(PALETTE["brown400"]) + (255,))
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, width, int(height * 0.38)), fill=rgb(PALETTE["brown700"]) + (255,))
    draw_spotlight(img, 0.35)
    d = ImageDraw.Draw(img)
    compact = width < 700
    d.text((48 if not compact else 22, 38), "Footer - closure.", font=font(24 if not compact else 14, bold=True), fill=PALETTE["gold400"])
    draw_corner_avatar(d, width - 72, 32, 48)
    d.text((width - (290 if not compact else 170), 86), "Persistent corner avatar 48x48, z-index above footer DOM", font=font(13 if not compact else 7), fill=PALETTE["gold100"])

    if mode == "desktop":
        d.text((120, 150), "DOM caption - JetBrains Mono", font=font(16), fill=PALETTE["gold400"])
        d.text((120, 190), "\"Until your next wish.\"", font=font(52, bold=True), fill=PALETTE["gold200"])
        draw_wave_sequence(d, [(690, 292, 215), (920, 300, 190), (1140, 320, 145)], compact)
        draw_footer_trust(d, (120, 585, 1240, 915), compact)
        draw_footer_nav(d, 1375, 610, compact)
    elif mode == "tablet":
        d.text((105, 155), "DOM caption - JetBrains Mono", font=font(15), fill=PALETTE["gold400"])
        d.text((105, 194), "\"Until your next wish.\"", font=font(44, bold=True), fill=PALETTE["gold200"])
        draw_wave_sequence(d, [(320, 390, 205), (520, 400, 175), (705, 418, 130)], compact)
        draw_footer_trust(d, (105, 705, 785, 1115), compact)
        draw_footer_nav(d, 820, 730, compact)
    else:
        d.text((30, 124), "DOM caption", font=font(10), fill=PALETTE["gold400"])
        d.text((30, 150), "\"Until your\nnext wish.\"", font=font(29, bold=True), fill=PALETTE["gold200"], spacing=2)
        draw_wave_sequence(d, [(96, 300, 105), (198, 310, 92), (292, 322, 70)], compact)
        draw_footer_trust(d, (30, 476, 360, 710), compact)
        draw_footer_nav(d, 34, 722, compact)
    img.convert("RGB").save(path, optimize=True)


def write_footer_manifest() -> None:
    manifest = {
        "format": "figma-handoff-manifest",
        "title": "Footer Persistent Lumi Corner v1",
        "version": "1.0.0",
        "authored_at": "2026-05-17",
        "frames": [
            {"name": "desktop-1920", "path": "footer-desktop-1920.png", "size": [1920, 1080]},
            {"name": "tablet-1024", "path": "footer-tablet-1024.png", "size": [1024, 1366]},
            {"name": "mobile-390", "path": "footer-mobile-390.png", "size": [390, 844]},
        ],
        "cornerAvatar": {"position": "top-right", "size": [48, 48], "nonla": "on"},
        "dunsExternalLink": "https://www.dnb.com/business-directory/company-profiles/cyberskill.673219568",
        "trustSignals": [
            "CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY",
            "D-U-N-S 673219568",
            "Founded 2020",
            "1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward, Ho Chi Minh City, Vietnam",
            "Phone: (+84) 906 878 091",
            "info@cyberskill.world",
            "Founder: Stephen Cheng · Trịnh Thái Anh",
        ],
        "annotations": [
            "wave_goodbye start, mid, and curl-to-corner poses visible",
            "Footer caption is DOM overlay: Until your next wish.",
            "Language switcher is text-only: EN / VI",
            "Secondary nav includes /work, /lite, /accessibility, /privacy, /terms",
            "No aspirational certification claims in this comp",
        ],
    }
    (FOOTER_OUT / "footer-v1.fig").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def generate_footer() -> None:
    FOOTER_OUT.mkdir(parents=True, exist_ok=True)
    draw_footer_scene(1920, 1080, FOOTER_OUT / "footer-desktop-1920.png", "desktop")
    draw_footer_scene(1024, 1366, FOOTER_OUT / "footer-tablet-1024.png", "tablet")
    draw_footer_scene(390, 844, FOOTER_OUT / "footer-mobile-390.png", "mobile")
    save_pdf_from_png(FOOTER_OUT / "footer-desktop-1920.png", FOOTER_OUT / "footer-v1.pdf")
    write_footer_manifest()


def main() -> None:
    generate_scene0()
    generate_scene1()
    generate_scene2()
    generate_scene3()
    generate_scene4()
    generate_scene5()
    generate_scene6()
    generate_footer()
    print("OK - generated P1 scene assets")


if __name__ == "__main__":
    main()
