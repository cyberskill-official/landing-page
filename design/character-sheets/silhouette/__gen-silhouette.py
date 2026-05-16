#!/usr/bin/env python3
"""Programmatic silhouette generator for FR-CHAR-002. See silhouette-test-results.md §note for context.
Re-run after editing this file: python3 design/character-sheets/silhouette/__gen-silhouette.py"""
from PIL import Image, ImageDraw
from pathlib import Path
import hashlib

OUT_DIR = Path(__file__).resolve().parent
BG = (0x2C, 0x13, 0x04, 255)
FG = (0, 0, 0, 255)

def draw(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)
    s = size
    hood = [(int(s*.50), int(s*.06)), (int(s*.65), int(s*.32)),
            (int(s*.82), int(s*.53)), (int(s*.72), int(s*.58)),
            (int(s*.28), int(s*.58)), (int(s*.18), int(s*.53)),
            (int(s*.35), int(s*.32))]
    d.polygon(hood, fill=FG)
    body = [(int(s*.30), int(s*.57)), (int(s*.70), int(s*.57)),
            (int(s*.66), int(s*.78)), (int(s*.60), int(s*.86)),
            (int(s*.40), int(s*.86)), (int(s*.34), int(s*.78))]
    d.polygon(body, fill=FG)
    wisp = [(int(s*.40), int(s*.85)), (int(s*.60), int(s*.85)),
            (int(s*.66), int(s*.92)), (int(s*.74), int(s*.95)),
            (int(s*.60), int(s*.97)), (int(s*.48), int(s*.94)),
            (int(s*.44), int(s*.97)), (int(s*.38), int(s*.95)),
            (int(s*.42), int(s*.90))]
    d.polygon(wisp, fill=FG)
    # Force no-AA: snap each pixel to nearest of FG/BG
    px = img.load()
    for y in range(s):
        for x in range(s):
            r, g, b, _ = px[x, y]
            if r + g + b < BG[0] + BG[1] + BG[2]:
                px[x, y] = FG
            else:
                px[x, y] = BG
    return img

for size, label in [(32, ""), (64, "-2x"), (256, "-8x-debug")]:
    img = draw(size)
    out = OUT_DIR / f"silhouette-32x32{label}.png"
    img.save(out, "PNG", optimize=True)
    if size == 32:
        sha = hashlib.sha256(out.read_bytes()).hexdigest()
        (OUT_DIR / "silhouette-32x32.sha256").write_text(f"{sha}  silhouette-32x32.png\n")
        print(f"32×32: {sha}")
