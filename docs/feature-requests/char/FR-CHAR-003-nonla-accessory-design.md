---
id: FR-CHAR-003
title: "Nón lá accessory design — exterior red, interior gold lining, single yellow star"
module: CHAR
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P0
milestone: P0 · slice 1
slice: 1
owner: Designer (Art Director) + Stephen Cheng (cultural authority)
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-CHAR-001, FR-CHAR-012, FR-SCENE-006, FR-SCENE-017, FR-CMS-002]
depends_on: [FR-CHAR-001]
blocks:
  - FR-CHAR-012     # production nón lá mesh inherits this design
  - FR-SCENE-006    # Scene 5 Figma comp depends on the accessory design
  - FR-SCENE-017    # Scene 5 implementation depends on the mesh

source_pages:
  - docs/01-master-plan-v2.md §1.1 (Layer 2: A red nón lá with a single yellow star)
  - docs/01-master-plan-v2.md §3.3b (The nón lá accessory — spec table)
  - docs/01-master-plan-v2.md §3.4 Scene 5 (only scene that uses the flag-red + flag-yellow accents)

source_decisions:
  - "v2 §1.1: 'we deliberately reject the Chinese-coded dragon iconography'; nón lá + red+yellow-star is the explicit Vietnamese signal"
  - "v2 §3.3b: cone diameter ~12 cm at brim, ~8 cm tall (relative to 1.6m Lumi); ≤ 600 tri; toggle via nonla_visible bool; cultural note 'functional headwear, not ceremonial'"
  - "v2 §3.4: --accent-flag-red (#DA251D) + --accent-star-yellow (#FFEB3B) reserved for Scene 5 only"

language: figma + sketch
service: design/character-sheets/nonla/
new_files:
  - design/character-sheets/nonla/nonla-design-v1.fig
  - design/character-sheets/nonla/nonla-front.png
  - design/character-sheets/nonla/nonla-side.png
  - design/character-sheets/nonla/nonla-three-quarter.png
  - design/character-sheets/nonla/nonla-interior.png
  - design/character-sheets/nonla/nonla-on-lumi-composite.png
  - design/character-sheets/nonla/cultural-note.md
modified_files:
  - design/character-sheets/lumi-character-sheet-v1.fig    # add accessory artboard reference
allowed_tools:
  - figma: design/character-sheets/nonla/**
  - file_read: docs/01-master-plan-v2.md
disallowed_tools:
  - decorate the nón lá with painted patterns / dragons / phoenixes (ceremonial register — wrong)
  - introduce text or characters on the surface
  - use any non-flag-red exterior colour (must be exactly --accent-flag-red #DA251D)
  - change the star count or placement (single star, front-centre, 30% of cone diameter)

effort_hours: 4
sub_tasks:
  - "1h: cone geometry — 4 views (front/side/3-quarter/interior) at correct proportions vs Lumi"
  - "0.5h: exterior colour fill --accent-flag-red #DA251D"
  - "0.5h: yellow star — flag-style 5-point, --accent-star-yellow #FFEB3B, ~30% cone diameter, front-centre"
  - "0.5h: interior lining --brand-gold-200 #F9D966 (visible on nonla_tip animation)"
  - "0.5h: composite on Lumi hood — verify scale/silhouette/hood-socket attachment"
  - "0.5h: cultural-note.md — register guidance for the 3D modeler"
  - "0.5h: founder cultural review (this is the one FR Stephen reviews as the Vietnamese-cultural authority, not just brand authority)"

risk_if_skipped: |
  Scene 5 is the climactic cultural reveal in the narrative arc — the moment the buyer realises
  "from Sài Gòn to your time zone" with a visual that lands without explainer text. The nón lá
  is the explicit Vietnamese signal. Skipping its design means either (a) Scene 5 ships without
  the cultural beat — site loses its distinguishing identity — or (b) the modeler improvises and
  potentially imports ceremonial register iconography that misfires (master plan §10.2 risk:
  "Vietnamese cultural reading misfires globally").
engineering_anchor: true
---

## §1 — Description (BCP-14 normative)

A 2D design specification for the nón lá accessory **MUST** be authored covering geometry, colour, proportions, and the cultural-register guidance the 3D modeler will follow when authoring `FR-CHAR-012` (production mesh).

1. **MUST** specify a conical hat shape with:
   - Brim diameter ≈ **12 cm** (relative to Lumi's 1.6 m height — a "casual cap" proportion, not a wide ceremonial nón quai thao).
   - Height ≈ **8 cm** from brim to apex.
   - Cone-side angle ≈ 30° from vertical (slight slope, recognisable as a Vietnamese nón lá, not a witch hat).
2. **MUST** specify exterior colour as `--accent-flag-red` (#DA251D) — the exact Vietnamese flag red. No other red variant.
3. **MUST** specify a single yellow star on the front-facing surface:
   - Colour `--accent-star-yellow` (#FFEB3B) — exact flag yellow.
   - 5-point star, geometry matching the Vietnamese flag (regular pentagram inscribed in a circle).
   - Diameter ≈ **30%** of the cone's brim diameter.
   - Front-centre placement on the visible exterior of the cone.
4. **MUST** specify interior lining as `--brand-gold-200` (#F9D966) — warm gold. Visible only on `nonla_tip` animation (when Lumi tips the hat).
5. **MUST NOT** include painted patterns, calligraphy, characters, dragons, phoenixes, lotus motifs, or any ceremonial decoration. The accessory is **functional / casual register** — the cultural note (§3.4) makes this explicit.
6. **MUST** specify the attachment point as the `hat_socket` bone on top of Lumi's hood. The accessory does not rest on the hood-leaf tip; it sits forward and slightly down, like a cap worn casually.
7. **MUST** specify the production-mesh budget as **≤ 600 tri** (master plan §3.3b hard cap). The 2D design MUST be implementable within this budget.
8. **MUST** specify UV layout: single 512×512 atlas (master plan §4.1) split into exterior-red (top half), interior-gold (lower-left quadrant), star-yellow (lower-right quadrant).
9. **MUST** include the **composite "Lumi wearing nón lá"** illustration showing the accessory in-place on the FR-CHAR-001 front-pose. This is the visual contract: the modeler matches this composite when authoring FR-CHAR-012.
10. **MUST** ship `cultural-note.md` documenting the **register**: this is a casual, functional accessory worn affectionately. The cultural note MUST cite master plan §3.3b: *"the nón lá is functional headwear, not ceremonial — its presence is warm and casual, not formal. Lumi wears it like one might wear a baseball cap."*
11. **MUST** be reviewed by Stephen Cheng (as the Vietnamese-cultural authority, not just brand). The signoff is gate-keeping for the cultural register, distinct from the brand-signoff on FR-CHAR-001.
12. **MUST NOT** appear in any scene other than Scene 5 entry / persisted-thereafter (master plan §3.4: "RESERVED for Scene 5 only" applies to the flag colours; the nón lá itself persists into the footer once it appears, as per master plan §3.3b "stays on through the footer").

---

## §2 — Why this design (rationale for humans)

**Why exact flag colours, not a "warmer" red?** Master plan §1.1 is unambiguous about the cultural signal: red + yellow-star = Vietnamese flag in micro-form. Softening the red toward burgundy / claret / brick reads as decorative; the moment of recognition for a buyer who knows the flag is gone. Exact flag colours preserve the "this is Vietnam, hello" beat.

**Why "no painted patterns"?** Decorated nón lá (nón bài thơ, embroidered nón) belong to ceremonial / áo dài / tourist-souvenir register. CyberSkill is a software services brand; the cultural signal is "Vietnamese roots", not "Vietnamese craft heritage". Casual register matches the brand. The cultural note enforces this for the modeler.

**Why exactly 30% star diameter?** The Vietnamese flag's actual star is 1/5 (20%) of flag width. At cone-scale this would be too small to read at typical scene-camera distance. 30% reads as "star + flag colours" without becoming a billboard. Master plan §3.3b doesn't pin the exact size; this FR ratifies 30% as the right point on the readability-vs-subtlety curve.

**Why "single star, front-centre", not "multiple stars" or "asymmetric placement"?** The Vietnamese flag has exactly one star. Multiple stars or unusual placements would read as a different national flag (China has 1 large + 4 small; North Korea has stripes; etc.) — cultural misfires that the master plan §10.2 risk register explicitly worries about.

**Why interior gold lining?** Master plan §3.3b spec — visible during `nonla_tip` animation when Lumi tilts the hat. The gold lining is a small Easter egg for visitors who hover over Vietnam (Scene 5) — it's the "you bring the will, we bring the real" warmth-signal in physical form. Exterior red says "Vietnam"; interior gold says "your wish, our craft".

**Why "MUST be reviewed by Stephen Cheng as cultural authority"?** Two separate signoffs for two separate concerns. FR-CHAR-001 is brand-signoff (does Lumi look like CyberSkill?). FR-CHAR-003 is cultural-signoff (does the nón lá land the right Vietnamese register — casual, not ceremonial?). Stephen is the only person on the team qualified to make the cultural-register call.

---

## §3 — Concrete content contract

### §3.1 The 4 view renderings

| View | Description |
|---|---|
| Front | Centred on cone, star clearly visible, slight 5° down-tilt to show top apex |
| Side | Profile silhouette — cone shape readability check (should be unmistakably nón lá, not witch hat / Chinese 笠 / Mexican sombrero) |
| Three-quarter | 30° rotation — depth + apex angle review |
| Interior | Cutaway / from-below showing the gold lining visible during `nonla_tip` |

### §3.2 Colour swatches block (on the Figma artboard)

| Token | Hex | Where |
|---|---|---|
| `--accent-flag-red` | `#DA251D` | Exterior of cone |
| `--accent-star-yellow` | `#FFEB3B` | The star |
| `--brand-gold-200` | `#F9D966` | Interior lining |

### §3.3 The composite on Lumi

A single artboard showing Lumi (front-pose from FR-CHAR-001) wearing the nón lá. The hat sits slightly forward and slightly down on the hood, leaving Lumi's face fully visible. The hood leaf-tip is partially obscured behind the cone — this is fine, expected, and matches the "casual" register.

### §3.4 `cultural-note.md` (canonical text)

```markdown
# Cultural register note — Nón lá on Lumi

This accessory is a CASUAL nón lá, not a ceremonial one. The reading we want from
a viewer (especially a Vietnamese viewer) is "a friendly genie has put on a hat
they wear every day", not "a formal mythic figure has donned a ceremonial garment".

## What this means for the modeler (FR-CHAR-012)
- Surface: smooth solid red. NO weave texture, NO crease lines, NO painted patterns.
- Edges: clean, slightly worn — not pristine new, not aged distressed. A hat someone
  wears.
- Wear: forward and slightly down on the hood, casual angle, like a baseball cap.
- Star: clean geometry, no shading, no inner detail. Flag-flat.
- Animation register: when Lumi tips the hat (nonla_tip clip), the gesture is a
  friendly tip — "hello" — not a deep bow.

## What this means for the writer (FR-CMS-002)
- Scene 5 narration MUST treat the hat as warm, casual, identity-affirming.
- Do NOT write "ancient", "ceremonial", "sacred", "honoured".
- DO write "from Sài Gòn", "our zone", "we wear it like a cap".

## What this means for the founder
- The nón lá is the explicit Vietnamese signal. The choice to keep it casual
  rather than ceremonial is intentional and aligned with the brand voice
  (modern Vietnamese, not tourist-Vietnamese).
- This signoff is your cultural authority, separate from the brand authority
  on FR-CHAR-001.
```

---

## §4 — Acceptance criteria

1. **All 5 visual files exist** — Front, side, 3-quarter, interior, composite — all PNGs at the documented paths.
2. **Colour compliance** — Eyedropper on the exterior of the cone in any view MUST return `#DA251D` exactly. Star sample MUST return `#FFEB3B`. Interior MUST return `#F9D966`. Zero tolerance for off-flag-colour drift.
3. **Geometry proportions** — Cone diameter at brim ≈ 12 cm (= 0.075 of Lumi's 1.6 m height). Height ≈ 8 cm (= 0.05). Star diameter ≈ 30% of cone brim diameter. Measured in the Figma file (constraints / inspector).
4. **No ceremonial decoration** — `grep -i 'pattern\|calligraphy\|character\|dragon\|phoenix\|lotus\|embroider' design/character-sheets/nonla/*.md` MUST return zero hits except in the cultural-note's "do NOT" block.
5. **Cultural-note exists** — `cultural-note.md` MUST exist and match the canonical text in §3.4 (≥ 90% identical; minor wording revisions allowed if cleared by founder).
6. **Composite on Lumi** — The composite illustration MUST show the hat at the FR-CHAR-001 front-pose with hat_socket attachment point clearly indicated.
7. **Founder cultural signoff** — Email or written approval from Stephen Cheng explicitly endorsing "the casual register call" archived to `design/character-sheets/nonla/signoff-FR-CHAR-003-cultural.eml`. This is distinct from the brand signoff in FR-CHAR-001.
8. **Single star, single placement** — Visual review: exactly one yellow star visible on the exterior, front-centre. No supplementary star elements anywhere on the cone.
9. **Mesh budget achievable** — A separate sanity check (modeler review, ~30 min): is this design implementable within the 600-tri budget? Modeler signs off in `design/character-sheets/nonla/modeler-feasibility-check.md`.
10. **No off-cyclescene appearance** — Cross-FR check: the nón lá MUST NOT appear in any scene comp other than Scene 5 entry-onwards (master plan §3.4). FR-SCENE-001's AC#6 already enforces this; this FR cross-refs.

---

## §5 — Verification method

**Inspection (`verify: I`)** by:

1. The Designer — files-exist + palette compliance + geometry proportions (~30 min).
2. The 3D Modeler — implementability check at 600-tri budget (~30 min).
3. The founder — cultural register signoff (~45 min — the single most important review on this FR).

There is no automated test; the cultural register is a judgment call. The colour-compliance check (AC#2) MAY be automated via Figma eyedropper plugin in a future tooling FR.

---

## §6 — Dependencies

- FR-CHAR-001 — needed for the Lumi front-pose composite.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Red drifts toward burgundy/claret | AC#2 eyedropper | Replace with exact `#DA251D` |
| Star placed off-centre or doubled | AC#8 visual review | Single, centred, front-facing |
| Decorative pattern slips in (designer instinct) | AC#4 grep + visual | Remove; cite cultural note |
| Founder reads as "too plain" / wants embellishment | Cultural review | Hold the line on casual register; if founder insists on ceremonial, open `FR-CHAR-003a-ceremonial-variant` as a successor (do not edit in place) |
| Mesh budget challenged at 600 tri | Modeler review | If the design is genuinely infeasible at 600 tri, the design (not the budget) is wrong — simplify visual; the budget is master plan §3.3b |
| Non-Vietnamese reviewer reads as "Mexican sombrero" / "witch hat" | Cultural risk § 10.2 | Increase cone-side angle slightly (away from vertical); test profile silhouette |
| Cultural note drift across reviews | Document is the source of truth | Re-anchor on master plan §3.3b verbatim quote |
| Used in non-Scene-5 mockup by mistake | FR-SCENE-001..008 audit | Each scene FR cross-checks; remove if found |

---

## §8 — Notes

- The "casual, not ceremonial" decision is the single most defining cultural call in the entire site. It distinguishes CyberSkill from tourist-Vietnamese branding and aligns with the buyer ICP (NA/EU enterprise who values authenticity over exoticism).
- The accessory animates via 2 clips per master plan §3.3a: `nonla_appear` (Scene 5 entry, 1.0s fade-in) and `nonla_tip` (Scene 5 Vietnam-pin hover, 1.5s tip-toward-camera). The interior gold lining (§1 #4) is visible only during `nonla_tip` — small, intentional Easter egg.
- The nón lá persists through the footer once it appears. This is master plan §3.3b: "stays on through the footer — Lumi has chosen its identity". It's a narrative-arc beat — once revealed, the cultural identity stays.

---

*End of FR-CHAR-003. Audit: `FR-CHAR-003-nonla-accessory-design.audit.md`.*
