---
id: FR-DS-007
title: "Cinematic typography pairing — display face (Inter Display) + caption mono (JetBrains Mono)"
module: DS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P1
slice: 1
owner: Designer + Frontend Lead
created: 2026-05-16
shipped: null
related_frs: [FR-DS-003, FR-DS-004, FR-SCENE-009, FR-A11Y-006, FR-PERF-001]
depends_on: [FR-DS-003]
blocks: [FR-SCENE-009, FR-A11Y-006, FR-PERF-001]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.2 (Cinematic typography pairing)
  - docs/01-master-plan-v2.md §6.1 (LCP performance budget — font-display: swap)

language: typescript 5.6 + css
service: packages/ds-cinematic/src/tokens/ + apps/web/public/fonts/
new_files:
  - packages/ds-cinematic/src/tokens/typography.ts
  - packages/ds-cinematic/src/tokens/typography.css
  - apps/web/public/fonts/inter-display/InterDisplay-{Bold,ExtraBold}-subset.woff2
  - apps/web/public/fonts/jetbrains-mono/JetBrainsMono-{Regular,Bold}-subset.woff2
  - packages/ds-cinematic/src/tokens/__tests__/typography.test.ts

effort_hours: 4
risk_if_skipped: "Without a locked typography pairing, every scene comp picks a font in isolation; the hero LCP regresses because fonts aren't preloaded; the subtitle-card feel that distinguishes Lumi narration from body copy gets lost."
---

## §1 — Description (BCP-14 normative)

The `@cyberskill/ds-cinematic/tokens/typography` module **MUST** export the locked typography pairing — Inter Display for cinematic display type, JetBrains Mono for Lumi's caption track, existing system sans for body — with size scale and font-loading metadata.

1. **MUST** export 3 font families:
   - `display: 'Inter Display, system-ui, sans-serif'` — used for scene titles + hero headline.
   - `caption: 'JetBrains Mono, ui-monospace, monospace'` — used for Lumi's narration captions (subtitle-card feel).
   - `body: 'system-ui, -apple-system, sans-serif'` — paragraph + UI text (inherits from existing DS).
2. **MUST** export a 9-step size scale using `clamp()` for fluid scaling per master plan §3.2:
   - `display.hero: clamp(40px, 6vw, 96px)` (Scene 0 headline)
   - `display.scene-title: clamp(32px, 4.5vw, 72px)`
   - `display.scene-sub: clamp(20px, 2.2vw, 32px)`
   - `body.base: 16px`
   - `body.sm: 14px`
   - `body.lg: 18px`
   - `caption.lumi: clamp(16px, 1.5vw, 22px)` (Lumi narration)
   - `caption.meta: 13px` (timestamps, secondary)
   - `cta.label: clamp(16px, 1.2vw, 18px)` (CTA buttons)
3. **MUST** specify weights as enum: `weights = { regular: 400, semibold: 600, bold: 700, extrabold: 800 }`.
4. **MUST** specify letter-spacing: `display: -0.03em` (per master plan §3.2: "Inter Display at weights 600/800 with -3% letter-spacing"); `body: 0`; `caption: 0.01em` (slight track for readability).
5. **MUST** ship `typography.css` with `@font-face` declarations for Inter Display + JetBrains Mono using `font-display: swap` (master plan §6.1 — prevents FOIT blocking LCP).
6. **MUST** specify `unicode-range` subsetting for Vietnamese diacritics: `U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9` (Vietnamese-specific code points). This subset MUST be present in the .woff2 files.
7. **MUST** preload the 2 critical-path fonts (Inter Display Bold + JetBrains Mono Regular) via `<link rel="preload" as="font" type="font/woff2" crossorigin>` in the Next.js `app/layout.tsx` (FR-WEB-001's responsibility to add; this FR specifies the contract).
8. **MUST NOT** load > 4 font files in the critical path. Total font weight ≤ 200 KB compressed (subset, woff2). Asserted by the `tools/perf-budgets/check-asset-sizes.mjs` extension.
9. **MUST** include a `subsettingNotes.md` documenting which characters are in the subset and why (Vietnamese diacritics for FR-CMS-003, em-dash + curly quotes for narrative typography).

---

## §2 — Why this design (rationale for humans)

**Why Inter Display + JetBrains Mono?** Master plan §3.2 names Inter Display (open-source alternative to Söhne Breit) for display + JetBrains Mono for captions. Both are open-source (no licensing friction), have excellent Vietnamese diacritic coverage, and ship subset-friendly woff2.

**Why mono for Lumi captions?** Master plan §3.2: "Reserve a third 'caption' variant (mono, e.g. JetBrains Mono) for Lumi's quoted lines, which gives them a subtitle-card feel." Mono signals "this is being spoken" — distinguishes Lumi narration from page body copy at a glance.

**Why `clamp()` for sizes?** Fluid scaling across viewports. The hero clamps to ~40px on mobile (readable) and ~96px on desktop (cinematic) without media-query stair-stepping.

**Why subset for Vietnamese?** Full Inter Display covers 1000+ glyphs. The site needs ~200 (Latin + Vietnamese diacritics + punctuation). Subsetting drops ~80% of the font weight — buys back ~50KB of the page-weight budget.

**Why `font-display: swap`?** Without it, the browser hides text until the font loads (FOIT — Flash of Invisible Text), spiking LCP. With `swap`, the browser shows fallback text immediately, then swaps when the custom font loads. Master plan §6.1 mandates this.

---

## §3 — Public surface

```ts
// packages/ds-cinematic/src/tokens/typography.ts
export const family = {
  display: 'Inter Display, system-ui, sans-serif',
  caption: 'JetBrains Mono, ui-monospace, monospace',
  body: 'system-ui, -apple-system, sans-serif',
} as const;

export const size = {
  'display.hero':      'clamp(40px, 6vw, 96px)',
  'display.scene-title': 'clamp(32px, 4.5vw, 72px)',
  'display.scene-sub': 'clamp(20px, 2.2vw, 32px)',
  'body.base': '16px',
  'body.sm':   '14px',
  'body.lg':   '18px',
  'caption.lumi': 'clamp(16px, 1.5vw, 22px)',
  'caption.meta': '13px',
  'cta.label':    'clamp(16px, 1.2vw, 18px)',
} as const;

export const weight = {
  regular: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const letterSpacing = {
  display: '-0.03em',
  body: '0',
  caption: '0.01em',
} as const;

export type FontFamily = keyof typeof family;
export type FontSize = keyof typeof size;
export type FontWeight = keyof typeof weight;
```

```css
/* packages/ds-cinematic/src/tokens/typography.css */
@font-face {
  font-family: 'Inter Display';
  src: url('/fonts/inter-display/InterDisplay-Bold-subset.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+0102-0103, U+0110-0111, U+0128-0129,
                 U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9,
                 U+2010-2027;
}
@font-face {
  font-family: 'Inter Display';
  src: url('/fonts/inter-display/InterDisplay-ExtraBold-subset.woff2') format('woff2');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+0102-0103, U+0110-0111, U+0128-0129,
                 U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9,
                 U+2010-2027;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/jetbrains-mono/JetBrainsMono-Regular-subset.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+0102-0103, U+0110-0111, U+0128-0129,
                 U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9;
}
```

---

## §4 — Acceptance criteria

1. **typography.ts present, typed, family/size/weight/letterSpacing exports** — typecheck clean.
2. **typography.css present with 3+ @font-face declarations** — `grep -c '@font-face' typography.css >= 3`.
3. **font-display: swap on every @font-face** — `grep -c 'font-display: swap' typography.css` MUST equal the @font-face count.
4. **Vietnamese unicode-range present** — `grep 'U+1EA0-1EF9' typography.css` MUST match (the main Vietnamese block).
5. **Sizes match master plan §3.2 hero spec** — `expect(size['display.hero']).toBe('clamp(40px, 6vw, 96px)')`.
6. **Letter-spacing display = -0.03em** — `expect(letterSpacing.display).toBe('-0.03em')` (≈ -3% per master plan).
7. **Font files present + ≤ 200 KB total** — `find apps/web/public/fonts -name '*.woff2' | xargs ls -l` total bytes ≤ 200 * 1024.
8. **subsettingNotes.md present** — file exists at `apps/web/public/fonts/subsettingNotes.md`.
9. **Preload hint required from FR-WEB-001 documented** — typography.css carries a comment block listing the two critical-path preload URLs.

---

## §5 — Verification

```ts
// packages/ds-cinematic/src/tokens/__tests__/typography.test.ts
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { family, size, weight, letterSpacing } from '../typography';

describe('FR-DS-007 — typography tokens', () => {
  test('AC#5: hero clamp matches plan §3.2', () => {
    expect(size['display.hero']).toBe('clamp(40px, 6vw, 96px)');
  });
  test('AC#6: display letter-spacing -3%', () => {
    expect(letterSpacing.display).toBe('-0.03em');
  });
  test('display family includes Inter Display', () => {
    expect(family.display).toMatch(/Inter Display/);
  });
  test('caption family includes JetBrains Mono', () => {
    expect(family.caption).toMatch(/JetBrains Mono/);
  });
  test('weights enum matches plan', () => {
    expect(weight).toEqual({ regular: 400, semibold: 600, bold: 700, extrabold: 800 });
  });
});

// AC#2-#4, #7-#9 covered by shell assertion (Bash test in CI):
// grep / find / stat against typography.css + fonts directory.
```

---

## §6 — Dependencies

- FR-DS-003 — Cinematic Pack package skeleton.
- (downstream) FR-WEB-001 — adds the `<link rel="preload" as="font">` tags in app/layout.tsx.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Font weight blows page budget | AC#7 size check | Tighter subset (drop CJK; keep only Latin + VI) |
| FOIT visible on slow connections | Lighthouse `cls`/`render-blocking-resources` audit | Verify font-display: swap; verify preload tag in layout.tsx |
| Vietnamese diacritics render as boxes | Visual smoke on /vi route | Verify unicode-range includes U+1EA0-1EF9; re-subset if missing |
| Designer hand-codes 96px instead of token | Code review | Replace with `var(--font-size-display-hero)` or import from typography.ts |
| Font CDN goes down (if accidentally used) | Build/CI 404 | Fonts MUST be self-hosted under /fonts; no Google Fonts CDN |
| `unicode-range` typo breaks Vietnamese | AC#4 grep | Test against the canonical block U+1EA0-1EF9 |
| Mono font picked at wrong size for captions | Scene-FR review | Specify `caption.lumi` token; lint for hardcoded mono sizes |

---

*End of FR-DS-007. Audit: `FR-DS-007-cinematic-typography.audit.md`.*
