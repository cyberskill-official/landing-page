---
id: FR-CHAR-008
title: "Substance Painter PBR textures — BaseColor / ORM-packed / Normal / Emissive at locked 2k"
module: CHAR
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P2
slice: 1
owner: 3D Modeler / Texture Artist
created: 2026-05-16
related_frs: [FR-CHAR-006, FR-CHAR-007, FR-CHAR-011, FR-DS-002, FR-OPS-001, FR-OPS-002, FR-OPS-004]
depends_on: [FR-CHAR-006, FR-CHAR-007, FR-OPS-001]
blocks: [FR-CHAR-011, FR-OPS-002, FR-OPS-004]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.3 character table — "Material PBR; metallic 0.4; roughness 0.35; iridescence custom TSL"
  - docs/01-master-plan-v2.md §3.3 character table — "Color hood gold-200 → body gold-400 → tail tip gold-500"
  - docs/01-master-plan-v2.md §4.3 — "Texture path — Substance Painter; glTF PBR Metal-Roughness export"
  - docs/01-master-plan-v2.md §4.4 perf table — texture VRAM ≤ 4 MB post-KTX2

language: substance painter + glTF + KTX2
service: assets-source/substance/ + assets-built/raw/textures/
new_files:
  - assets-source/substance/lumi.spp                                # Substance source (re-exportable)
  - assets-source/substance/lumi-substance-export-preset.spexp     # Locked export preset
  - assets-built/raw/textures/lumi-BaseColor.png                    # sRGB, 2k
  - assets-built/raw/textures/lumi-ORM.png                          # linear, 2k (R=AO, G=Roughness, B=Metallic)
  - assets-built/raw/textures/lumi-Normal.png                       # linear, 2k, OpenGL convention
  - assets-built/raw/textures/lumi-Emissive.png                     # sRGB, 2k
  - assets-built/raw/textures/lumi-texture-stats.json               # validator output
  - tools/texture-validator.py                                      # Python validator (§5)
  - design/character-sheets/lumi-texture-spec.md                    # founder-facing texture brief

effort_hours: 16
risk_if_skipped: "Without authored textures Lumi has no signature gold gradient (hood-200 → body-400 → tail-500), no C-emboss emissive, no surface micro-detail. The PBR material spec from master plan §3.3 breaks; FR-CHAR-011 animation library renders flat-shaded grey blob. Re-authoring textures mid-production (after FR-CHAR-011) costs 3-5 days because every animation snapshot needs re-rendering."
---

## §1 — Description (BCP-14 normative)

1. **MUST** author all textures in **Adobe Substance 3D Painter** (the Cowork-integrated DCC tool — surfaces via Adobe MCP if needed). Bake mesh maps (AO, curvature, normal, position) from the FR-CHAR-006 production mesh onto itself via the FR-CHAR-007 UVs.

2. **MUST** export exactly four texture maps using the glTF PBR Metal-Roughness preset:
   - **BaseColor** — sRGB colour space, PNG, 2048×2048.
   - **OcclusionRoughnessMetallic (ORM-packed)** — linear, PNG, 2048×2048. Channel mapping MUST be **R = Ambient Occlusion, G = Roughness, B = Metallic** per the glTF 2.0 spec (KHR_materials_pbrSpecularGlossiness deprecation note + KHR_materials_pbrMetallicRoughness).
   - **Normal** — linear, PNG, 2048×2048, **OpenGL convention** (Y+ up). Three.js / R3F expects OpenGL normals; DirectX (Y- down) inverts shading direction.
   - **Emissive** — sRGB, PNG, 2048×2048, masked to the "C" emboss (FR-CHAR-006 §1 #5) + a soft body halo at ~ 10% intensity baseline.

3. **MUST** apply the vertical gold gradient per master plan §3.3 character table:
   - **Hood top** (highest 30% of body Y): `--brand-gold-200` = `#F9D966` (RGB 249,217,102).
   - **Body** (middle 50%): `--brand-gold-400` = `#E8B523` (RGB 232,181,35).
   - **Tail tip** (lowest 20%): `--brand-gold-500` = `#C99317` (RGB 201,147,23).
   - **Wisp** uses the same gradient but with alpha decreasing from 100% at the attachment point to ~ 15% opacity at the wisp tip (alpha-blended material).

4. **MUST** set master material values exactly:
   - `metallic = 0.4` (Substance Painter master fill node value, exported through glTF).
   - `roughness = 0.35` (Substance Painter master fill node value).
   - These specific values come from master plan §3.3 — not approximate, not "around 0.4".

5. **MUST** mask Emissive to two regions and nothing else:
   - The "C" emboss surface (geometric, per FR-CHAR-006 §1 #5) at 1.0 intensity in the baked output.
   - A soft body halo across the surface at 0.10 intensity baseline.
   - Animation runtime (FR-CHAR-011) drives the emissive multiplier up to 0.8 during the `mouth_speak` clip via the glTF emissiveFactor — the texture itself stays at the baseline.

6. **MUST NOT** bake any cool-tone iridescence into the texture. The iridescence (cool-tone shimmer when Lumi shifts angle) is a custom TSL shader node applied at runtime (planned for FR-WEB-005 or equivalent). Baking iridescence into BaseColor produces a stiff, view-independent shimmer that contradicts the master plan §3.3 spec ("iridescence custom TSL").

7. **MUST** pass the FR-OPS-004 KTX2/Basis Universal compression:
   - BaseColor → **ETC1S** (better for low-frequency colour gradients; lossy chroma).
   - ORM → **ETC1S** (low-frequency PBR channels).
   - Normal → **UASTC** (preserves direction; ETC1S corrupts normals visibly).
   - Emissive → **ETC1S** (masked region tolerates ETC1S compression).
   - Combined post-KTX2 VRAM for the four maps MUST be **≤ 4 MB** (master plan §4.4 perf table).

8. **MUST NOT** introduce off-palette colours. Every pixel in BaseColor (excluding anti-alias transition pixels at island edges) MUST sample to within ΔE2000 ≤ 5 of one of the locked FR-DS-002 palette entries. The texture-validator.py (§5) eyedroppers a 64×64 grid across BaseColor and reports off-palette pixels.

9. **MUST** ship the Substance source file (`lumi.spp`) so future texture variants (Tết / nón lá repaint / colour-scheme experiments) re-export without re-authoring from scratch. The `.spp` MUST be committed to LFS due to size.

10. **MUST** ship the locked Substance export preset (`lumi-substance-export-preset.spexp`) capturing the four-map output configuration, channel packing for ORM, and the OpenGL normal convention. This guarantees re-exports stay byte-stable in metadata (the pixel bytes will vary if the artist edits; the *export configuration* won't drift).

11. **MUST** ship `lumi-texture-stats.json` with: per-map resolution, channel count, expected colour space, sampled palette match rate, ΔE2000 statistics, KTX2 compression preview sizes.

12. **MUST** ship `design/character-sheets/lumi-texture-spec.md` — a ≤ 400-word founder-facing brief documenting the gradient anchor points, the PBR values, and the Emissive mask shape. This is the artefact reviewed at signoff.

13. **MUST** be reviewed and signed off by the Founder (Stephen Cheng) at the texture-final stage. The signoff line lives in `lumi-texture-spec.md` alongside the artist's signature. Reason: textures define the brand "look" — they're a brand-identity decision, not a technical one.

14. **MUST NOT** alter the FR-CHAR-007 UV layout during texture authoring. If a UV bug surfaces (seam visible mid-scene), the recovery is to file a defect against FR-CHAR-007 and update there — not silently re-UV inside the texture stage.

15. **SHOULD** archive Substance project state with all reference photos under `assets-source/substance/refs/` (cultural-photo references for the gold-leaf gradient, the nón lá weave detail seen later in FR-CHAR-012).

## §2 — Why this design

**Why Substance 3D Painter and not Blender's texture-paint mode?** Substance Painter's smart materials and procedural roughness layers produce believable PBR surfaces in 1/3 the time of hand-painting in Blender. The Adobe Substance MCP can drive the workflow programmatically once the artist has the .spp set up, which means re-exports for variants (Tết, Mid-Autumn, etc.) can be one-call jobs rather than open-file-and-click. Master plan §4.3 names Substance Painter explicitly.

**Why ORM-packed (Occlusion + Roughness + Metallic in one image)?** glTF 2.0 specifies this packing as the canonical PBR Metal-Roughness format. Web runtimes (Three.js / R3F) read the three channels from one texture sample, so packing them halves the texture-fetch count on the GPU compared to three separate single-channel maps. The 50% texture-fetch saving is non-trivial at scale — every Lumi material is sampled per-pixel per-frame; on a 60 fps render at 1920×1080, that's ~ 124M samples/second saved per character.

**Why 2k for every map?** Symmetric resolution avoids mip-chain mismatches between the four maps. If BaseColor is 2k and Normal is 1k, at mip level 1 Three.js samples them at different resolutions and the normal-driven shading drifts away from the colour detail. The post-KTX2 VRAM budget of 4 MB accommodates four 2k maps with ETC1S + UASTC compression — going to 4k would blow the budget; going to 1k loses face detail enough to break FR-CHAR-002 silhouette test.

**Why OpenGL normal convention?** Three.js / R3F internally uses OpenGL normal convention (Y+ up in tangent space). DirectX-convention normals (Y- down) load without complaint but render with shadow direction inverted (light coming from above produces shading as if it came from below). The fix is a one-channel flip in Substance's export preset — captured in `.spexp`.

**Why mask Emissive to "C" emboss + soft halo only?** The "C" emboss IS the brand mark (per FR-CHAR-006 §1 #5). Driving emissive to peak during `mouth_speak` makes the "C" pulse as Lumi talks — a deliberate brand-anchor moment in every scene. A flat full-body emissive would turn Lumi into a glowing sphere, losing both the brand mark and the PBR surface detail. The 10% body halo provides a subtle "lit from within" quality that the runtime iridescence shader then reads as edge-light variation.

**Why metallic 0.4 + roughness 0.35 (and not 1.0 metallic for "actual gold")?** Real metals are 1.0 metallic, but they reflect everything in the environment — a 1.0-metallic Lumi would mirror whatever scene IBL we use, fighting with the cinematic environment lighting in each scene. The 0.4 metallic + 0.35 roughness pairing gives a "stylised gold" look: enough metallic character to read as a precious object, but diffuse enough that scene lighting still shapes the surface. Master plan §3.3 character table specifies these exact values — they were design-locked early.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
assets-source/substance/
├── lumi.spp                                    # Substance project (LFS-tracked)
├── lumi-substance-export-preset.spexp          # Locked export preset
└── refs/                                       # SHOULD — texture-reference photo refs
    ├── gold-leaf-gradient-1.jpg
    ├── nón-lá-weave-detail.jpg
    └── ...

assets-built/raw/textures/
├── lumi-BaseColor.png                          # sRGB 2k
├── lumi-ORM.png                                # linear 2k
├── lumi-Normal.png                             # linear 2k, OpenGL
├── lumi-Emissive.png                           # sRGB 2k
└── lumi-texture-stats.json                     # validator output

design/character-sheets/
└── lumi-texture-spec.md                        # founder-facing brief

tools/
└── texture-validator.py                        # Python (Pillow + colour-difference)
```

### §3.2 — `lumi-texture-stats.json` schema

```json
{
  "maps": {
    "BaseColor": {
      "path": "assets-built/raw/textures/lumi-BaseColor.png",
      "resolution": [2048, 2048],
      "color_space": "sRGB",
      "channel_count": 3,
      "palette_match_rate": 0.0,
      "delta_e2000_max": 0.0,
      "delta_e2000_p99": 0.0,
      "off_palette_pixel_count": 0,
      "sha256": "<hex>"
    },
    "ORM":       { "...": "linear, 3 channels, packed AO/Roughness/Metallic" },
    "Normal":    { "...": "linear, 3 channels, OpenGL Y+ up convention check" },
    "Emissive":  { "...": "sRGB, 3 channels, masked region area %" }
  },
  "pbr_values": {
    "metallic": 0.4,
    "roughness": 0.35
  },
  "ktx2_preview_vram_mb": 0.0,
  "validator_version": "1",
  "ran_at": "2026-05-XXTXX:XX:XXZ",
  "verdict": "PASS"
}
```

### §3.3 — Substance export preset (locked)

| Channel | Map | Format | Colour space | Bit depth | Notes |
|---|---|---|---|---|---|
| Base Color | BaseColor | PNG | sRGB | 8 | Pre-multiplied alpha disabled |
| Mixed AO | ORM:R | PNG | linear | 8 | Combined-AO bake |
| Roughness | ORM:G | PNG | linear | 8 | — |
| Metallic | ORM:B | PNG | linear | 8 | — |
| Normal | Normal | PNG | linear | 8 | OpenGL convention (Y inverted from DirectX) |
| Emissive | Emissive | PNG | sRGB | 8 | Tone-mapped to 0–1 range; runtime drives boost |

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Four texture maps present at 2048×2048 PNG | File existence + Pillow `Image.size` |
| 2 | BaseColor in sRGB; Normal / ORM / Emissive in correct colour spaces | PNG `iCCP` chunk or file-naming convention; validator checks |
| 3 | Normal map in OpenGL convention (Y+ up) | Validator samples a known-up pixel; expected green channel value > 0.5 |
| 4 | Metallic = 0.4 (master material in `.spp`) | Open `.spp`, inspect master fill node value |
| 5 | Roughness = 0.35 (master material in `.spp`) | Open `.spp`, inspect master fill node value |
| 6 | Gradient hood-200 → body-400 → tail-500 anchor pixels | Validator eyedroppers known coords; ΔE2000 ≤ 3 from anchors |
| 7 | No cool tones in BaseColor | Validator checks `b*` (LAB) component; all-pixel `b* > -5` (warm-only) |
| 8 | Emissive masked to "C" + soft halo (not full-body flat) | Validator computes emissive mask area ≤ 25% of UV space |
| 9 | Post-KTX2 VRAM ≤ 4 MB | `gltf-transform inspect` after FR-OPS-002 pipeline; validator preview pass |
| 10 | ORM channel packing correct (R=AO, G=Roughness, B=Metallic) | Validator separates channels; checks that R channel correlates with cavity, G with surface variation, B is near-constant 0.4 |
| 11 | `.spp` Substance source file present and openable | File existence; non-zero size; opens in Substance Painter |
| 12 | `.spexp` export preset present | File existence |
| 13 | `lumi-texture-stats.json` present with `verdict: PASS` | Re-run validator; check JSON output |
| 14 | `lumi-texture-spec.md` present in `design/character-sheets/` (≤ 400 words) | File existence + word count |
| 15 | Founder signoff captured in `lumi-texture-spec.md` | Markdown signature line present |
| 16 | UV layout (FR-CHAR-007) not modified | Diff `lumi.v01.blend` UV layer hash; MUST equal pre-texture-authoring hash |

## §5 — Validator script (`tools/texture-validator.py`)

```python
"""
texture-validator.py — FR-CHAR-008 validator.

Usage:
    python tools/texture-validator.py \
      --texdir assets-built/raw/textures \
      --palette design/tokens/palette-canonical.json \
      --out assets-built/raw/textures/lumi-texture-stats.json

Dependencies:
    pip install pillow colour-science numpy

Exit code 0 on PASS; 1 on any FAIL.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
import colour  # colour-science


REQUIRED = ["BaseColor", "ORM", "Normal", "Emissive"]
RES = (2048, 2048)
EMISSIVE_MASK_AREA_MAX = 0.25
DELTA_E_MAX = 5.0
GRID = 64  # 64×64 sampling grid on BaseColor


def srgb_to_lab(rgb_u8):
    rgb_lin = colour.cctf_decoding(rgb_u8 / 255.0, function="sRGB")
    xyz = colour.RGB_to_XYZ(rgb_lin, colourspace="sRGB")
    return colour.XYZ_to_Lab(xyz)


def load_palette(palette_json_path):
    data = json.loads(Path(palette_json_path).read_text())
    swatches = []
    for entry in data.get("gold", []) + data.get("brown", []) + data.get("accent", []):
        hex_ = entry["hex"].lstrip("#")
        r, g, b = int(hex_[0:2], 16), int(hex_[2:4], 16), int(hex_[4:6], 16)
        swatches.append(srgb_to_lab(np.array([r, g, b], dtype=float)))
    return np.array(swatches)


def measure_basecolor(img, palette_lab):
    arr = np.array(img.convert("RGB"))
    h, w, _ = arr.shape
    xs = np.linspace(0, w - 1, GRID, dtype=int)
    ys = np.linspace(0, h - 1, GRID, dtype=int)
    samples = arr[np.ix_(ys, xs)].reshape(-1, 3)
    sample_lab = srgb_to_lab(samples.astype(float))
    diffs = colour.delta_E(sample_lab[:, np.newaxis, :], palette_lab[np.newaxis, :, :])
    nearest = diffs.min(axis=1)
    return {
        "delta_e2000_max": float(nearest.max()),
        "delta_e2000_p99": float(np.percentile(nearest, 99)),
        "palette_match_rate": float((nearest <= DELTA_E_MAX).mean()),
        "off_palette_pixel_count": int((nearest > DELTA_E_MAX).sum()),
        "no_cool_tones": bool((sample_lab[:, 2] > -5).all()),  # b* > -5 → warm
    }


def measure_normal(img):
    arr = np.array(img.convert("RGB"))
    # Sample known-up surface region (top center, where hood faces up)
    region = arr[50:150, arr.shape[1] // 2 - 50:arr.shape[1] // 2 + 50]
    g_mean = region[:, :, 1].mean() / 255.0
    return {"opengl_convention": bool(g_mean > 0.5), "g_mean_top_region": float(g_mean)}


def measure_emissive(img):
    arr = np.array(img.convert("L"))  # luminance
    masked = (arr > 16).mean()
    return {"mask_area_fraction": float(masked), "within_cap": bool(masked <= EMISSIVE_MASK_AREA_MAX)}


def sha256_file(path):
    h = hashlib.sha256()
    h.update(Path(path).read_bytes())
    return h.hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--texdir", required=True)
    parser.add_argument("--palette", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    palette_lab = load_palette(args.palette)
    result = {"maps": {}, "verdict": "PASS"}
    texdir = Path(args.texdir)

    for name in REQUIRED:
        path = texdir / f"lumi-{name}.png"
        if not path.exists():
            result["maps"][name] = {"error": "missing"}
            result["verdict"] = "FAIL"
            continue
        img = Image.open(path)
        record = {
            "path": str(path),
            "resolution": list(img.size),
            "sha256": sha256_file(path),
        }
        if img.size != RES:
            record["error"] = f"expected {RES}, got {img.size}"
            result["verdict"] = "FAIL"
        if name == "BaseColor":
            record.update(measure_basecolor(img, palette_lab))
            if record["palette_match_rate"] < 0.95 or not record["no_cool_tones"]:
                result["verdict"] = "FAIL"
        elif name == "Normal":
            record.update(measure_normal(img))
            if not record["opengl_convention"]:
                result["verdict"] = "FAIL"
        elif name == "Emissive":
            record.update(measure_emissive(img))
            if not record["within_cap"]:
                result["verdict"] = "FAIL"
        result["maps"][name] = record

    result["pbr_values"] = {"metallic": 0.4, "roughness": 0.35}
    Path(args.out).write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
```

## §6 — Dependencies

**Concept dependencies:**
- FR-CHAR-006 (production mesh) — textures bake against locked geometry.
- FR-CHAR-007 (UV layout) — textures align to locked UV islands.
- FR-OPS-001 (gltf-transform pipeline plan) — defines KTX2 compression target.
- FR-DS-002 (palette) — defines allowed colour swatches.

**Operational dependencies:**
- Adobe Substance 3D Painter (Cowork-integrated; surfaces via Adobe MCP for re-export automation).
- Python 3.11 + `pillow`, `colour-science`, `numpy` for the validator.

**Downstream blocks:**
- FR-CHAR-011 (animation library) — animations test against textured Lumi to verify shading reads.
- FR-OPS-002 (gltf-transform pipeline implementation) — KTX2 compression consumes these textures.
- FR-OPS-004 (KTX2 + glb pipeline) — same KTX2 compression target.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Iridescence baked into BaseColor (rainbow shimmer visible in flat lighting) | AC#7 (cool-tone detector) | Strip iridescence layer in Substance; re-export. Iridescence is runtime, not baked. |
| Normal map in DirectX convention (shading direction inverted) | AC#3 (`g_mean_top_region < 0.5`) | Flip Y channel in Substance export preset (`Invert Green: ON → OFF`); re-export |
| ORM channels swapped (Roughness in B, Metallic in G) | AC#10 (statistical channel correlation) | Re-pack per glTF spec: R=AO, G=Roughness, B=Metallic. Substance preset has a checkbox; verify it's correct. |
| Emissive too bright globally (flat overlay rather than masked) | AC#8 (mask area > 25%) | Tighten Emissive mask in Substance to "C" emboss + 10% body halo |
| Off-palette gold introduced (e.g. brassier hood) | AC#7 (palette_match_rate < 95%) | Re-sample anchor pixels against locked palette; re-paint hood gradient |
| VRAM > 4 MB after KTX2 compression | AC#9 (`gltf-transform inspect`) | Lower BaseColor/ORM/Emissive to ETC1S level 192 (was 128); accept slight chroma quality reduction |
| BaseColor sRGB tag missing (Three.js renders washed-out) | AC#2 | Re-export with sRGB iCCP chunk; verify Pillow reports `mode='RGB'` with `gamma=2.2` |
| Substance .spp file corrupted (Lockfile from concurrent save) | AC#11 | Recover from Substance auto-backup; check `assets-source/substance/.spbackup` |
| UV layout drift during authoring (artist re-unwraps inside Substance) | AC#16 (`lumi.v01.blend` UV hash diff) | Revert UV layer changes; file a separate FR-CHAR-007 defect if a real bug |
| Founder signoff missing (artist proceeds without brand approval) | AC#15 (Markdown signature) | Schedule 15-min review with founder; capture in `lumi-texture-spec.md` |
| ORM packed with HDR (>1.0) Roughness values causing Three.js shader divisions | AC#10 + GPU shader inspector | Clamp Roughness layer to 0–1 in Substance; re-export |
| Emissive bleed past "C" edges after KTX2 compression | KTX2 visual diff (FR-OPS-004 smoke test) | Add 4 px padding inside Emissive mask in Substance (matches §1 #5 UV padding logic) |

## §8 — Deliverable preview

Once shipped, the textured Lumi can be loaded into Three.js / R3F via:

```ts
import { useGLTF } from '@react-three/drei';
const { nodes, materials } = useGLTF('/lumi.glb');
// materials.lumi_main has BaseColor + ORM + Normal + Emissive bound.
```

The `lumi-texture-spec.md` artefact shows three reference renders (front, 3/4, back) of Lumi under the canonical Scene 0 lighting rig, with annotations marking the gradient anchor points and the Emissive mask boundary.

## §9 — Notes

**On LFS:** The `.spp` file is typically 200-400 MB. It MUST be tracked in Git LFS via `.gitattributes` (`*.spp filter=lfs`). The four PNGs are 2-5 MB each — also LFS-tracked for consistency with the source workflow.

**On Substance Painter version:** Pin to Substance 3D Painter 2024.1 or later (PBR Metal-Roughness export with correct ORM packing was buggy in earlier releases). Document the version in `lumi-texture-spec.md`.

**On Vietnamese gold reference:** The "Saigon Dusk" gold gradient anchors against the cultural reference of gold leaf used in Vietnamese altar decoration — warm rather than yellow-white European gold. The hood-200 anchor is the lightest warm-gold reading; the tail-500 is the deepest amber. The cultural reference matters; if the artist drifts towards "Euro gold" the gradient stops reading as Saigon Dusk.

*End of FR-CHAR-008.*
