# WCAG 2.2 Contrast Matrix — CyberSkill Landing Page

> **Generated.** Edit `palette-canonical.json` and re-run `python3 design/tokens/contrast-check-script.py`. Do NOT hand-edit this file.

References: FR-DS-002 · WCAG 2.2 SC 1.4.3 (text) · WCAG 2.2 SC 1.4.11 (non-text UI).

## Matrix

| Pair (fg × bg) | Hex | Ratio | Body ≥4.5:1 | Large ≥3:1 | UI ≥3:1 | Verdict | Notes |
|---|---|---:|:-:|:-:|:-:|:-:|---|
| `gold.200` × `brown.700` | #F9D966 on #2C1304 | 12.60 | ✓ | ✓ | ✓ | **PASS** | body on deepest surface |
| `gold.100` × `brown.500` | #FCEAA8 on #4A2208 | 11.47 | ✓ | ✓ | ✓ | **PASS** | sub-headline contrast |
| `gold.200` × `brown.500` | #F9D966 on #4A2208 | 9.94 | ✓ | ✓ | ✓ | **PASS** | body text on cinematic surface |
| `brown.700` × `gold.400` | #2C1304 on #E8B523 | 9.21 | ✓ | ✓ | ✓ | **PASS** | dark label on gold button fill |
| `gold.400` × `brown.700` | #E8B523 on #2C1304 | 9.21 | ✓ | ✓ | ✓ | **PASS** | heading on deepest surface |
| `gold.400` × `brown.500` | #E8B523 on #4A2208 | 7.26 | ✓ | ✓ | ✓ | **PASS** | heading text on cinematic surface |
| `gold.400` × `brown.400` | #E8B523 on #6E3A18 | 4.85 | ✓ | ✓ | ✓ | **PASS** | rim-light against Scene 1 backdrop |
| `accent.star_yellow` × `accent.flag_red` | #FFEB3B on #DA251D | 4.03 | ✗ | ✓ | ✓ | **PARTIAL** | yellow star on red nón lá exterior |
| `accent.flag_red` × `brown.700` | #DA251D on #2C1304 | 3.55 | ✗ | ✓ | ✓ | **PARTIAL** | Scene 5 nón lá / arc pulse (non-text decorative only) |

## Forbidden pairings

These combinations MUST NOT appear anywhere on the site.

| Pair | Ratio | Reason |
|---|---:|---|
| `gold.200` × `brown.50` | 1.12 | never pair light-gold on cream (illustrative) |
| `gold.50` × `gold.100` | 1.11 | never pair light-gold on light-gold (illustrative) |

## Reading the verdict

- **PASS** — meets the threshold for the role (body / large / ui-only).
- **PARTIAL** — passes a relaxed threshold; restricted to its documented usage (e.g. decorative non-text only).
- **FAIL** — falls below the role's threshold; do not use.
- **FORBIDDEN** — explicit anti-pattern; never use.

## Thresholds (WCAG 2.2)

- Body text: ≥ 4.5 : 1 (SC 1.4.3)
- Large text (≥ 18pt or ≥ 14pt bold): ≥ 3 : 1 (SC 1.4.3)
- Non-text UI (icons, borders, focus rings): ≥ 3 : 1 (SC 1.4.11)

