---
id: FR-DS-002
title: "Approved colour palette swatch sheet + WCAG contrast matrix"
module: DS
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P0
milestone: P0 · slice 1
slice: 1
owner: Designer (Art Director) + QA / Accessibility
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-DS-001, FR-DS-003, FR-DS-004, FR-DS-005, FR-CHAR-001, FR-A11Y-001]
depends_on: [FR-DS-001]
blocks:
  - FR-DS-003       # Cinematic Pack package skeleton consumes these tokens
  - FR-DS-004       # gold + brown CSS token export uses these exact hex values
  - FR-DS-005       # flag accent tokens defined here

source_pages:
  - docs/01-master-plan-v2.md §3.2 (Saigon Dusk palette — full hex list)
  - docs/01-master-plan-v2.md §3.4 (per-scene tonal injections)
  - docs/01-master-plan-v2.md §7.5 (WCAG 2.2 AA criteria — 1.4.3, 1.4.11)

source_decisions:
  - "v2 §3.2: explicit hex values for 4 gold + 4 brown shades + 2 flag accents + 3 glow recipes"
  - "v2 §3.2: 'always pair gold against a surface ≥ --brand-brown-500 to maintain WCAG AA 4.5:1'"
  - "v2 §7.5: SC 1.4.3 body ≥ 4.5:1, large ≥ 3:1, UI ≥ 3:1"

language: figma + json + markdown
service: design/tokens/
new_files:
  - design/tokens/palette-swatch-v1.fig
  - design/tokens/palette-swatch-v1.pdf
  - design/tokens/palette-canonical.json
  - design/tokens/wcag-contrast-matrix.md
  - design/tokens/wcag-contrast-matrix.json
modified_files: []
allowed_tools:
  - figma: design/tokens/**
  - file_read: docs/01-master-plan-v2.md
  - file_read: design/mood-boards/**
  - bash: python3 contrast-check-script.py
disallowed_tools:
  - introduce a new colour outside the 13 swatches enumerated in master plan §3.2
  - round or approximate hex values (they are exact and authoritative)
  - skip the contrast matrix (every pairing used in any scene MUST have a published ratio)

effort_hours: 4
sub_tasks:
  - "0.5h: palette-canonical.json — 13 typed swatches in master plan §3.2 order"
  - "0.5h: palette-swatch-v1.fig — visual sheet with hex + token name per swatch"
  - "1h: wcag-contrast-matrix.md — every meaningful pairing (gold-on-brown · brown-on-gold · accent pairings)"
  - "1h: contrast-check-script.py — programmatic verification per pair (WCAG 2.2 formula)"
  - "0.5h: PDF export + commit to LFS"
  - "0.5h: founder + QA review"

risk_if_skipped: |
  Without an authoritative palette swatch + contrast matrix, every downstream FR derives hex
  values from the master-plan §3.2 prose (error-prone — typos, rounding). The contrast matrix
  is the only way to enforce master plan §7.5 SC 1.4.3 / 1.4.11 mechanically. Skip → palette
  drift in 3-5 places + accidental a11y failures discovered in P5 audit.
engineering_anchor: true
---

## §1 — Description (BCP-14 normative)

A canonical palette swatch sheet **MUST** be authored carrying the **exact 13 hex values** from master plan §3.2, accompanied by a programmatic WCAG contrast matrix covering every meaningful colour pairing used in the site.

1. **MUST** ship `palette-canonical.json` enumerating the 13 master-plan §3.2 swatches with their canonical token names + exact hex values:

```json
{
  "gold": {
    "50":  "#FEF6D9",
    "100": "#FCEAA8",
    "200": "#F9D966",
    "400": "#E8B523",
    "500": "#C99317",
    "600": "#9F730E"
  },
  "brown": {
    "50":  "#F4E5D6",
    "100": "#DDB995",
    "200": "#A36A3F",
    "400": "#6E3A18",
    "500": "#4A2208",
    "700": "#2C1304"
  },
  "accent": {
    "flag_red":     "#DA251D",
    "star_yellow":  "#FFEB3B"
  },
  "glow": {
    "genie_rim":  "rgba(255, 196, 64, 0.85)",
    "genie_soft": "rgba(232, 181, 35, 0.45)",
    "scene_edge": "rgba(232, 181, 35, 0.15)"
  }
}
```

2. **MUST** ship a visual swatch sheet (`palette-swatch-v1.fig` + `.pdf`) displaying each swatch as a 200×200 chip with: hex code, RGB triple, the canonical token name, and an "intended usage" caption (e.g. "LOGO PRIMARY — Lumi base", "deepest — canvas/cinematic surface").
3. **MUST** ship `wcag-contrast-matrix.md` + `.json` enumerating every meaningful pairing with WCAG 2.2 contrast ratio, large/normal/UI verdict, and pass/fail flag.
4. **MUST** include in the contrast matrix at minimum these pairings:
   - `gold/200` × `brown/500` — body text on cinematic surface
   - `gold/400` × `brown/500` — heading text on cinematic surface
   - `gold/400` × `brown/700` — heading on deepest surface
   - `gold/200` × `brown/700` — body on deepest surface
   - `brown/700` × `gold/400` — dark text on gold button fill
   - `accent.flag_red` × `brown/700` — Scene 5 red on background
   - `accent.star_yellow` × `accent.flag_red` — star on nón lá exterior
   - `gold/400` × `brown/400` — rim-light against scene-1 backdrop
   - `gold/100` × `brown/500` — sub-headline contrast
5. **MUST** flag any pairing that fails **WCAG 1.4.3** (body text ≥ 4.5:1, large text ≥ 3:1) or **WCAG 1.4.11** (non-text UI ≥ 3:1) as `FAIL` and document the recovery path (alternative pairing OR usage restriction).
6. **MUST** compute contrast ratios using the WCAG 2.2 relative-luminance formula. Asserted programmatically — the `.json` matrix is generated from `palette-canonical.json` via the contrast-check script; manual ratios are forbidden.
7. **MUST NOT** introduce any colour outside the 13 swatches. Every downstream consumer (DS tokens, scene comps, schema) draws from this file only. New colours require a new FR + signoff per `AGENTS.md` §16.2.
8. **MUST** be reviewed by the QA / Accessibility lead (in addition to the Designer). The a11y signoff confirms the contrast matrix correctness, not aesthetic judgment.
9. **MUST** be reviewed by Stephen Cheng. Founder signoff archived to `design/tokens/signoff-FR-DS-002.eml`.
10. **SHOULD** include a "scene usage map" in the swatch sheet showing which swatches appear in which scenes per master plan §3.4 (e.g. flag-red appears ONLY in Scene 5).

---

## §2 — Why this design (rationale for humans)

**Why JSON + visual sheet + matrix?** Three consumers. (1) Engineers (FR-DS-004 et al.) read the JSON. (2) Designers + founder review the visual sheet. (3) The a11y team consumes the contrast matrix. One source of truth (the JSON) feeds all three; the others derive.

**Why "every pairing in the matrix is generated, not hand-typed"?** Hand-typed contrast ratios always drift. The script reads palette-canonical.json + an enumeration of pairings; computes WCAG 2.2 ratios; emits the .md + .json. CI runs it on every PR that touches palette-canonical.json. This makes palette mutations impossible without re-running the matrix.

**Why explicit scene-usage map?** Master plan §3.2 says flag-red and star-yellow are RESERVED for Scene 5. Without an explicit map, a future scene designer might "borrow" the flag red for emphasis elsewhere. The scene-usage map makes that violation visible at review time.

**Why "MUST NOT introduce new colour without amendment"?** The Cinematic Pack is governed by §12.1 lifecycle. Tokens proliferate when designers add "a slightly different gold" for a single moment. Locking the palette at 13 swatches forces every design problem to be solved within the existing range; that constraint is the whole reason the site reads as visually coherent.

---

## §3 — Public surface contract

### §3.1 `palette-canonical.json` — typed schema

See §1 #1 above.

### §3.2 `wcag-contrast-matrix.md` — sample row

```markdown
| Pair (label / hex)                       | Ratio | 1.4.3 body (≥4.5:1) | 1.4.3 large (≥3:1) | 1.4.11 UI (≥3:1) | Verdict |
|---|---:|:-:|:-:|:-:|:-:|
| gold/200 #F9D966 × brown/500 #4A2208     | 8.93  | ✓ | ✓ | ✓ | PASS |
| gold/400 #E8B523 × brown/500 #4A2208     | 6.42  | ✓ | ✓ | ✓ | PASS |
| gold/400 #E8B523 × brown/700 #2C1304     | 9.78  | ✓ | ✓ | ✓ | PASS |
| gold/100 #FCEAA8 × brown/500 #4A2208     | 11.27 | ✓ | ✓ | ✓ | PASS |
| brown/700 #2C1304 × gold/400 #E8B523 (label-on-button) | 9.78 | ✓ | ✓ | ✓ | PASS |
| accent.flag_red #DA251D × brown/700 #2C1304 | 3.65 | ✗ | ✓ | ✓ | PARTIAL — for non-text decorative use only (Scene 5 nón lá / arc pulse) |
| accent.star_yellow #FFEB3B × accent.flag_red #DA251D | 5.92 | ✓ | ✓ | ✓ | PASS — star on cone surface |
| gold/50 #FEF6D9 × gold/100 #FCEAA8 (do NOT pair) | 1.08 | ✗ | ✗ | ✗ | FAIL — never pair light-gold on light-gold |
```

### §3.3 `contrast-check-script.py` — sketch

```python
#!/usr/bin/env python3
"""Generate wcag-contrast-matrix.md + .json from palette-canonical.json."""
import json
from pathlib import Path

def relative_luminance(hex_rgb: str) -> float:
    r, g, b = int(hex_rgb[1:3], 16), int(hex_rgb[3:5], 16), int(hex_rgb[5:7], 16)
    def lin(c): return c/3294.6 if c <= 10 else ((c+14.025)/268.025)**2.4
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b)

def contrast(a: str, b: str) -> float:
    la, lb = relative_luminance(a), relative_luminance(b)
    L1, L2 = max(la, lb), min(la, lb)
    return (L1 + 0.05) / (L2 + 0.05)

PAIRS = [
    ('gold.200', 'brown.500'), ('gold.400', 'brown.500'),
    ('gold.400', 'brown.700'), ('gold.200', 'brown.700'),
    ('brown.700', 'gold.400'),
    ('accent.flag_red', 'brown.700'), ('accent.star_yellow', 'accent.flag_red'),
    ('gold.400', 'brown.400'), ('gold.100', 'brown.500'),
]

palette = json.loads(Path('design/tokens/palette-canonical.json').read_text())

def resolve(dotted):
    a, b = dotted.split('.')
    return palette[a][b]

rows = []
for fg, bg in PAIRS:
    r = contrast(resolve(fg), resolve(bg))
    pass_body = r >= 4.5
    pass_large = r >= 3.0
    rows.append({'fg': fg, 'bg': bg, 'ratio': round(r, 2),
                 'body_pass': pass_body, 'large_pass': pass_large})

Path('design/tokens/wcag-contrast-matrix.json').write_text(json.dumps(rows, indent=2))
# ... .md rendering ...
```

### §3.4 Scene-usage map (excerpt)

| Swatch | Scene 0 | Scene 1 | Scene 2 | Scene 3 | Scene 4 | Scene 5 | Scene 6 | Footer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| gold.400 | ● | ● | ● | ● | ● | ● | ● | ● |
| brown.700 | ● | ● | ● | — | — | — | — | — |
| brown.500 | — | — | ● | ● | ● | ● | ● | ● |
| brown.400 | — | ● | — | — | — | ● | — | ● |
| accent.flag_red | — | — | — | — | — | ● | — | — |
| accent.star_yellow | — | — | — | — | — | ● | — | — |

---

## §4 — Acceptance criteria

1. **palette-canonical.json valid + 13 swatches** — `jq '[.. | scalars] | length' design/tokens/palette-canonical.json` returns at least 13 (6 gold + 6 brown + 2 flag accents). Glow recipes counted separately.
2. **Hex values exact, verbatim from §3.2** — `palette-canonical.json` hex strings MUST match master plan §3.2 byte-for-byte. Asserted by `palette-vs-plan.test.ts` comparing against an inline expected dictionary.
3. **No off-palette colours used** — `grep -rE '#[0-9A-Fa-f]{6}' design/` (excluding palette-canonical.json + counter-examples documented as such) MUST only return hex values that appear in palette-canonical.json.
4. **wcag-contrast-matrix.json present + generated by script** — File exists; running `python3 contrast-check-script.py` MUST produce a byte-identical `.json`. (Idempotent generation.)
5. **All required pairings present** — Every pair listed in §1 #4 MUST be a row in the matrix.
6. **PASS pairings PASS** — Every pairing flagged `PASS` MUST have computed ratio ≥ its threshold (verified by re-running the script in CI).
7. **PARTIAL pairings carry usage restriction** — Pairings flagged `PARTIAL` MUST have a non-empty "verdict notes" field stating where the limited-usage is permitted (e.g. "decorative non-text only, Scene 5 nón lá / arc pulse").
8. **FAIL pairings forbidden** — Any pairing in the matrix flagged `FAIL` MUST appear in a `forbidden_pairings` section of the .md; downstream FRs MUST NOT use those pairings.
9. **Scene-usage map present** — `palette-swatch-v1.fig` MUST contain the scene-usage map artboard with check-marks per swatch × scene.
10. **a11y signoff** — Written signoff (email / Notion / etc.) from QA / a11y lead archived to `design/tokens/signoff-FR-DS-002-a11y.eml`.
11. **Founder signoff** — Written signoff from Stephen Cheng archived to `design/tokens/signoff-FR-DS-002.eml`.

---

## §5 — Verification method

**Test (`verify: T`):**

```typescript
// design/tokens/__tests__/palette-vs-plan.test.ts
import { describe, expect, test } from 'vitest';
import palette from '../palette-canonical.json' assert { type: 'json' };

const EXPECTED_FROM_PLAN_v2_S3_2 = {
  gold:  { '50': '#FEF6D9', '100': '#FCEAA8', '200': '#F9D966',
           '400': '#E8B523', '500': '#C99317', '600': '#9F730E' },
  brown: { '50': '#F4E5D6', '100': '#DDB995', '200': '#A36A3F',
           '400': '#6E3A18', '500': '#4A2208', '700': '#2C1304' },
  accent: { flag_red: '#DA251D', star_yellow: '#FFEB3B' },
};

describe('FR-DS-002 — palette vs master plan §3.2', () => {
  test('AC#2: every hex byte-identical', () => {
    expect(palette.gold).toEqual(EXPECTED_FROM_PLAN_v2_S3_2.gold);
    expect(palette.brown).toEqual(EXPECTED_FROM_PLAN_v2_S3_2.brown);
    expect(palette.accent).toEqual(EXPECTED_FROM_PLAN_v2_S3_2.accent);
  });
});
```

Plus the Python contrast-check script in §3.3 — runs in CI as a generator step; the generated `.json` is compared with the committed `.json` (re-generation must be idempotent).

CI gate: `pnpm exec vitest run design/tokens/__tests__/ && python3 design/tokens/contrast-check-script.py && diff design/tokens/wcag-contrast-matrix.json design/tokens/wcag-contrast-matrix.committed.json`.

---

## §6 — Dependencies

- FR-DS-001 — mood board ratifies the tonal direction these swatches express.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Hex value drifts vs master plan | AC#2 fails | Restore exact value; master plan §3.2 is the spec |
| Designer typos a hex into a comp | AC#3 cross-grep | Replace with canonical token |
| Contrast ratio drifts because formula off | AC#6 + script idempotency | Verify script uses WCAG 2.2 formula (sRGB linearisation correct) |
| PARTIAL pairing used for body text | Manual review at scene-comp time | Reject the usage; PARTIAL pairings are non-text decorative only |
| New "in-between" colour requested by designer | Designer asks | Reject; require FR-DS-NNN amendment per §16.2 |
| Scene-usage map drifts as scenes evolve | Scene-FR audits | Regenerate the map; it's the audit checklist |
| FAIL pairing slips through to production | Lighthouse / axe in P5 | Add to forbidden_pairings; restore palette discipline |
| a11y lead signs off without running the script | AC#10 review | Require the script-output diff to be attached to the signoff email |

---

## §8 — Notes

- This FR is the **single source of truth** for colour. Every other DS / scene / comp / schema FR resolves colour by name (`gold.400`, `brown.700`) against this JSON.
- The Python contrast-check-script can be ported to TypeScript later (FR-PERF-NNN) — for now Python is fastest to author. The output format (JSON) is portable.
- The `PARTIAL` row for `flag_red × brown/700` (3.65:1) is the most subtle entry — it passes the AA "large text" bar but not body. Master plan §3.4 uses flag-red ONLY as a decorative pulse / arc accent in Scene 5, never as text. The matrix encodes that restriction.

---

*End of FR-DS-002. Audit: `FR-DS-002-palette-swatch-wcag-matrix.audit.md`.*
