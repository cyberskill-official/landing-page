---
# ───── Machine-readable frontmatter (parsed by fr-audit + future backlog regenerator) ─────
id: FR-CHAR-001
engineering_anchor: true
title: "Lumi 2D character sheet — 4 poses + 6 expressions in brand palette"
module: CHAR
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I              # I (inspection) — sheet is reviewed in Figma against rubric
phase: P0
milestone: P0 · slice 1
slice: 1
owner: Stephen Cheng (creative direction) + Designer (Art Director)
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-CHAR-002, FR-CHAR-003, FR-CHAR-004, FR-DS-001]
depends_on: []                       # critical-path root
blocks:
  - FR-CHAR-002          # silhouette test
  - FR-CHAR-003          # nón lá design
  - FR-CHAR-004          # Blender greybox
  - FR-DS-001            # mood board assembly
  - FR-SCENE-001         # Scene 0 Hero comp

source_pages:
  - docs/01-master-plan-v2.md §1.1 (Lumi the Golden Genie — concept rationale)
  - docs/01-master-plan-v2.md §3.3 (Lumi character design brief)
  - docs/01-master-plan-v2.md §3.3b (nón lá accessory)
  - docs/01-master-plan-v2.md §3.3c (voice cues, audio-adjacent)

source_decisions:
  - "v2 master plan §1.1 caveat: 'we are not inventing a new character; we are bringing the logo to life'"
  - "v2 master plan §1.1 cultural framing: 3 layers of Vietnamese signal (palette → nón lá → no dragons)"

# Build envelope
language: figma + sketch
service: design/character-sheets/
new_files:
  - design/character-sheets/lumi-character-sheet-v1.fig
  - design/character-sheets/lumi-character-sheet-v1.pdf
  - design/character-sheets/lumi-character-sheet-v1.png
  - design/character-sheets/lumi-poses-quad-1024.png
  - design/character-sheets/lumi-expressions-grid-1024.png
modified_files: []
allowed_tools:
  - figma: design/character-sheets/**
  - adobe-photoshop-via-cowork: design/character-sheets/exports/**
  - file_read: design/brand/logo-source/**
disallowed_tools:
  - rasterise the source logo without keeping the vector version
  - introduce any dragon, phoenix, or ceremonial-Vietnamese-headwear iconography
  - introduce cool-tone (cyan / magenta / blue) into Lumi's base palette
  - change the silhouette away from the source CyberSkill logo

# Estimated work
effort_hours: 12
sub_tasks:
  - "1h: import CyberSkill logo as vector reference into Figma"
  - "2h: 4 turnaround poses (front · 3/4 · side · back) at proportions 1.0 unit = 0.4m"
  - "3h: 6 expression heads (idle · smiling · speaking · concerned · winking · surprised)"
  - "1h: arm-uncross posebook (point · wave · summon · paint)"
  - "1h: wisp-tail behaviour storyboard (idle drift · trail · settle)"
  - "1h: 32×32 silhouette test render (locks FR-CHAR-002)"
  - "1h: WCAG contrast pass on Lumi-on-brand-brown-500 background"
  - "2h: founder review + 1 revision round"
risk_if_skipped: |
  Every visual decision downstream — DS palette, Blender greybox, Scene 0 Figma comp, all 7 scene
  comps, the production 3D model, the rig, the animation library, the nón lá accessory — depends
  on this single sheet to ratify Lumi's silhouette, proportions, palette, and expression range.
  Without it the team will fragment into incompatible Lumi interpretations and Phase 1 will slip
  by 1–2 weeks recovering coherence.
---

## §1 — Description (BCP-14 normative)

A character sheet for "Lumi the Golden Genie" **MUST** be authored in Figma and exported as PNG + PDF at 1× / 2× / 4× scales. The sheet:

1. **MUST** be derived from the existing CyberSkill logo (vector source). The silhouette MUST remain unmistakable as the logo when viewed at 32×32 px.
2. **MUST** include exactly **4 turnaround poses**: front, three-quarter, side, back. All four MUST share the same proportions (head/hood ≈ ⅔ of figure, wisp tail ≈ ⅓) and the same canonical lighting direction (upper-right warm spotlight at 30°).
3. **MUST** include exactly **6 expression heads** at 512×512 each: `idle` (default), `smiling`, `speaking` (mouth_o open), `concerned` (brow_concern), `winking` (eye_squint right), `surprised` (brow_raise + cheek_puff). Expressions MUST correspond 1:1 with shape keys that FR-CHAR-010 will later author in Blender.
4. **MUST** include an **arm-uncross posebook** of 4 actions: `point` (right arm extended forward + down), `wave` (right arm raised), `summon` (both arms raised), `paint` (right arm extended laterally with light-trail indicated). These prefigure the `point` / `wave` / `summon` / `paint` clips in the animation library (FR-CHAR-011).
5. **MUST** include a **wisp-tail behaviour storyboard** of 3 states: idle drift (curls naturally), flying trail (alpha fade at ≥ 6m/s), settled (collapsed neat).
6. **MUST** use **only** the Saigon Dusk palette (`--brand-gold-{200,400,500}` + `--brand-brown-{100,400,500,700}`). No other base colours. No cool tones (cyan / magenta / blue) anywhere on Lumi itself.
7. **MUST** declare and pass the **silhouette test**: rendered at 32×32 px against pure `--brand-brown-700`, Lumi MUST be recognisable as "the CyberSkill logo come to life" without text caption. FR-CHAR-002 is the test fixture.
8. **MUST** include a **WCAG contrast block** documenting `brand-gold-400` against `brand-brown-500` (must be ≥ 3:1 for non-text-UI, ≥ 4.5:1 for any narrative caption planned to overlay Lumi).
9. **SHOULD** include a **bilingual tag block**: `EN: "Lumi — light that turns wishes into truth"` / `VI: "Lumi — vì ánh sáng biến nguyện ước thành sự thật"`. Used later by FR-CMS-010 (Vietnamese hover-reveal).
10. **MUST NOT** introduce any dragon, phoenix, kirin, or ceremonial-Vietnamese headwear iconography. The nón lá is the only Vietnamese visual signal (and is authored in FR-CHAR-003, not this FR).
11. **MUST** be reviewed and approved by Stephen Cheng (founder, creative director). The signoff is the gate for Phase P0 → P1.

This is the **critical-path root** of the entire 18-week roadmap. Every downstream FR — DS palette, Blender greybox, Scene 0 Figma comp, the production 3D model, the rig, the animation library — refers back to this sheet to ratify proportions, silhouette, palette, and expression range.

---

## §2 — Why this design (rationale for humans)

**Why a paper character sheet before any 3D work?** Because the cheapest revision cycle is ink-on-paper (or pixels-in-Figma). The single most expensive mistake in animated-mascot production is committing to a 3D model that the founder then asks to "look more friendly / less cocky / more Vietnamese / less stylised" after the rigger has burned a week. A character sheet costs ~12 hours and prevents 1–2 weeks of cascading rework.

**Why exactly 4 poses, 6 expressions, 4 actions, 3 wisp states?** These map 1:1 onto downstream Blender deliverables: 4 poses calibrate the silhouette under camera rotation, 6 expressions calibrate the 10 shape keys (4 of the 10 are eye_close/squint/blink combinatorics derived from these 6), 4 actions calibrate the arm-IK targets, 3 wisp states calibrate the chain-rig's pose extremes. Anything less misses a shape key; anything more is bloat that delays signoff.

**Why "no cool tones on Lumi"?** Master plan §3.4 specifies cool tones (cyan / magenta / lime) appear only as Scene 3 satellite accents. Lumi himself is brand-coherent gold; that's the single most repeated cell on the page and must not visually drift across scenes. Locking this on the character sheet is enforcement by reference.

**Why this is FR-CHAR-001 specifically.** It's the only FR with no `depends_on`. Every other FR in the backlog ultimately traces back to this sheet — see `BACKLOG.md §10 Dependency-graph health`. It must ship in P0 week 1 or the whole roadmap slides.

---

## §3 — Concrete content contract

### §3.1 The 4 turnaround poses

| Pose | Camera angle | Arm state | Wisp state | Hood orientation |
|---|---|---|---|---|
| Front | 0° | crossed (idle) | settled neutral | facing camera |
| Three-quarter | 30° camera-right | crossed (idle) | drifting natural | turned 15° camera-right |
| Side | 90° camera-right | crossed (idle) | drifting natural | profile, leaf-tip visible |
| Back | 180° | crossed (idle, visible from back) | trailing slightly | back of hood — show seam-line/silhouette only |

All four poses on a single 4096×2048 canvas, equal spacing, labelled. Export at 1× / 2× / 4×.

### §3.2 The 6 expression heads

| Expression | Mouth | Eyes | Brows | Cheeks | Hood emissive |
|---|---|---|---|---|---|
| `idle` | gentle smile | open, natural | neutral | neutral | default 0.2 |
| `smiling` | wider smile | slightly squinted (1/3) | slightly raised | slightly raised | default 0.2 |
| `speaking` | `mouth_o` open | open | neutral | neutral | pulse 0.4 (suggest with rim line) |
| `concerned` | small downturn | open, slightly narrow | inner brows up (`brow_concern`) | neutral | default 0.2 |
| `winking` | gentle smile | right eye `eye_squint`, left eye open | right brow up | right cheek slightly puffed | default 0.2 |
| `surprised` | `mouth_o` small | wide | both up (`brow_raise`) | slightly puffed (`cheek_puff`) | brief 0.5 |

Six 512×512 portrait crops on a 2-row × 3-column grid (1536×1024 final).

### §3.3 The 4 action poses

Same camera angle as the front turnaround. Each shows Lumi mid-action with motion-line indicators (where applicable) and the wisp-tail in a state consistent with the action:

- `point` — right arm uncrossed, extended forward + 15° down, hand open palm-down, wisp trailing slightly forward.
- `wave` — right arm raised, hand open, wisp settled.
- `summon` — both arms raised, hood emissive heightened (rim line glow), wisp spiralling upward in motion-line shorthand.
- `paint` — right arm extended laterally, indicator showing light-trail in `--brand-gold-400` extending from hand tip.

### §3.4 The 3 wisp-tail states

Three side-profile crops of just the wisp tail (no Lumi body): `idle drift` (natural curl), `flying trail` (extended with alpha-fade at tail tip ~15%), `settled neat` (compact coil under Lumi when seated/still).

### §3.5 The silhouette test

A 32×32 PNG rendered at full opacity against pure `#2C1304` (`--brand-brown-700`). Acceptance: a panel of 3 non-team viewers seeing only the 32×32 silhouette MUST identify "CyberSkill" or "the CyberSkill logo" within 5 seconds (≥ 2 of 3). Failure → revise pose proportions until the silhouette tightens.

### §3.6 The WCAG contrast block

A small table on the sheet documenting:

| Pair | Ratio | Standard | Pass |
|---|---:|---|:-:|
| `--brand-gold-400` (`#E8B523`) on `--brand-brown-500` (`#4A2208`) | ≥ 6:1 (target) | WCAG 1.4.11 non-text + 1.4.3 large text | ✓ |
| `--brand-gold-200` (`#F9D966`) on `--brand-brown-500` | ≥ 8:1 (target) | WCAG 1.4.3 body text | ✓ |

Computed values, not aspirational. Use Figma's contrast checker or `axe DevTools` colour audit.

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **Files exist** — Five files MUST exist at the paths in `new_files:` of the frontmatter. The Figma source file MUST contain all artboards labelled (`poses`, `expressions`, `actions`, `wisp-states`, `silhouette-test`, `contrast-block`, `bilingual-tag`).
2. **Palette compliance** — Eyedropper sampling of any pixel on Lumi (excluding the bilingual-tag panel) MUST return one of the 7 colours in the locked palette (4 gold + 3 brown shades). 0 sampled pixels MAY return cyan, magenta, lime, blue, or unbranded gold/brown variants.
3. **Silhouette test** — The 32×32 silhouette PNG, shown to a panel of 3 non-team viewers in isolation (no caption, no context), MUST yield ≥ 2 of 3 identifying it as the CyberSkill logo / a "golden genie / spirit". Test recorded in `design/character-sheets/silhouette-test-results.md` (separate small file, log-style).
4. **Expression matrix matches shape-key list** — The 6 expressions on the sheet MUST be uniquely nameable using the same identifiers in master plan §3.3 (`eye_close`, `eye_squint`, `mouth_smile`, `mouth_speak`/`mouth_o`, `brow_raise`, `brow_concern`, `cheek_puff`, `glow_pulse`, `hood_tip`). The mapping table is on the sheet.
5. **Action poses match clip names** — The 4 action poses MUST be uniquely nameable as `point`, `wave`, `summon`, `paint`. These names MUST match exactly the clip names in master plan §3.3a.
6. **Contrast block present** — The contrast block MUST be on the sheet, numerically computed, with the values reproducible by any Figma plugin (no hand-rounded numbers).
7. **No forbidden iconography** — No dragon, phoenix, kirin, áo dài, lotus, or ceremonial-Vietnamese headwear element appears anywhere on the sheet. The only Vietnamese visual signal allowed is the bilingual tag in `--brand-gold-200` text on `--brand-brown-500`.
8. **Founder signoff** — The PDF export MUST carry a signoff stamp / signature block from Stephen Cheng dated within the P0 phase window (weeks 1–2). A bare email reply "approved" suffices and MUST be archived in `design/character-sheets/signoff-FR-CHAR-001.eml`.

---

## §5 — Verification method

**Inspection (`verify: I`)** by:

1. The Designer (Art Director) — files-exist + palette-compliance + contrast-block checks (~30 min).
2. The founder — silhouette test + forbidden-iconography + signoff (~45 min).

There is no automated test for an inspection-verified FR. Future CI can lint the file paths exist + the palette by sampling a fixed pixel grid against the locked palette JSON; not in scope for slice 1.

**Test record:** `design/character-sheets/silhouette-test-results.md` — a 5-line log of panel identifications, dated.

---

## §6 — Implementation hint (suggested authoring flow)

```
hour 0: import CyberSkill logo SVG into Figma → set up 4096×2048 master canvas
hour 1: lay out 4-pose turnaround block (front, 3/4, side, back) - keep proportions locked via grid
hour 2: refine front-pose to logo-silhouette parity; use 32×32 preview tab as the constant gate
hour 3: 6 expression heads at 512×512 each, in a 2×3 grid below the turnaround
hour 5: arm-uncross posebook — 4 actions, all from front angle, with motion-line indicators
hour 6: wisp-tail storyboard — 3 side-profile states
hour 7: silhouette test panel - 32×32 render on --brand-brown-700 background
hour 8: WCAG contrast block - sampled values, exact ratios
hour 9: bilingual tag panel (EN + VI)
hour 10: export PDF / PNG at 1× / 2× / 4×; commit to Git LFS
hour 11: founder review session - walk through the sheet, capture revision notes
hour 12: one revision round + final signoff
```

If the silhouette test fails at hour 7, return to hour 2 and re-tighten proportions — the rule of thumb is: hood + face read at 32×32, body and wisp drop out.

---

## §7 — Dependencies

**Asset dependencies (must exist before this FR can be authored):**

- The CyberSkill logo SVG (vector source) — already in `design/brand/logo-source/` of this repo. If missing, the FR is blocked.
- Figma file storage + Git LFS configured — covered by FR-OPS-008.
- Saigon Dusk palette spec — per master plan §3.2; the exact hex values used as eyedropper reference.

**No FR depends on this FR being audited at 10/10 except by phase gate.** P0 cannot exit until this FR ships.

---

## §8 — Example deliverable preview

Sheet master layout, 4096×2048 PDF page 1:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  LUMI — Character Sheet v1                          CyberSkill / FR-CHAR-001    │
│  Stephen Cheng · 2026-05-16                                                      │
│                                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                                │
│  │  FRONT  │ │   ¾     │ │  SIDE   │ │  BACK   │   ← TURNAROUND (1024×1024 each)│
│  │         │ │         │ │         │ │         │                                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                                │
│                                                                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                                      │
│  │idle│ │smi-│ │spe-│ │con-│ │wink│ │surp│   ← EXPRESSIONS (512×512 each)       │
│  │    │ │ling│ │king│ │cern│ │ing │ │rise│                                      │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                                      │
│                                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                                    │
│  │ POINT  │ │ WAVE   │ │ SUMMON │ │ PAINT  │   ← ACTION POSEBOOK                │
│  └────────┘ └────────┘ └────────┘ └────────┘                                    │
│                                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         ┌──────────────────────────────┐  │
│  │drift    │ │trail    │ │settled  │         │ Contrast: G400/Br500 = 6.4:1 │  │
│  └─────────┘ └─────────┘ └─────────┘         │ G200/Br500 = 8.9:1            │  │
│   ← WISP                                     │ ✓ WCAG 1.4.3 / 1.4.11         │  │
│                                              └──────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────┐    ┌────┐                              │
│  │ EN: Lumi — light that turns wishes   │    │ ▣  │ 32×32 silhouette test       │
│  │     into truth                       │    └────┘                              │
│  │ VI: Lumi — vì ánh sáng biến nguyện   │    Panel verdict: 3/3 ✓               │
│  │     ước thành sự thật                │                                        │
│  └──────────────────────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## §9 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Silhouette test fails (≤ 1/3 panel identification) | Inspection step 7 | Return to hour 2; tighten hood/leaf proportions; re-test |
| Palette violation (cool tone sampled) | Eyedropper grid by Designer | Replace the offending pixel range; lock paint-tool to palette swatch only |
| Founder requests change after signoff | Email reply 2026-05-N + 1d | Open `FR-CHAR-001a-character-sheet-revision-1` as a superseding FR; do not edit this one in place |
| Forbidden iconography slip (e.g. dragon scale accidentally on hood seam) | Designer or founder catches | Remove element; re-export; log in revision history on the sheet |
| Bilingual tag VI text rendered incorrectly (font fallback dropping diacritics) | Founder review | Embed the font; re-export; verify diacritics on the PDF rasteriser |
| Contrast value rounded / incorrect | Designer cross-check with axe colour audit | Recompute via independent tool; update the contrast block |
| Files missing at the documented paths | Filesystem inspection | Re-export at hour 10; commit; verify via `ls` |

---

## §10 — Notes (informational, no normative force)

- This sheet exists to be *referenced*, not iterated on. Once shipped + signed off, all subsequent visual decisions cite this sheet rather than re-deciding. The `FR-CHAR-001a` pattern (a successor FR) is the only sanctioned path to "version 2".
- The 4 actions on this sheet correspond 1:1 with 4 of the 11 clips in master plan §3.3a. The other 7 clips (`idle`, `fly_in`, `coil_idle`, `split_to_4`, `wave_goodbye`, `nonla_appear`, `nonla_tip`) are NOT depicted here — they're behaviour states / rigged animations that don't have a single sheet pose. The Animator infers them from the sheet's tone + the master plan.
- Reuse: the same sheet doubles as recruitment + partner-credibility collateral. The PDF export is publishable (without the contrast block — strip on the marketing variant).

---

*End of FR-CHAR-001. Audit: `FR-CHAR-001-lumi-2d-character-sheet.audit.md`.*
