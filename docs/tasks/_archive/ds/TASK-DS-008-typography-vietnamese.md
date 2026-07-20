---
id: TASK-DS-008
title: "Type scale and a typeface with full Vietnamese diacritic coverage"
module: DS
priority: SHOULD
status: done
class: product
verify: T
phase: P1
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-07-02
depends_on: [TASK-DS-001]
source_pages:
  - "research doc §C (typography, design tokens), §E (Vietnamese-first)"
  - "operator report 2026-07-02: Vietnamese headings render with mixed fallback glyphs"
new_files: []
modified_files:
  - app/layout.tsx
  - app/globals.css
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Type MUST be tokenized and the chosen typeface MUST render Vietnamese correctly, since Vietnamese is a first-class locale for this site.

1. The system MUST express the type scale (sizes, line heights, weights) as `--cs-*` tokens that components consume rather than literal pixel values.
2. The primary typeface MUST cover the full Vietnamese diacritic set, including stacked tone marks, with no tofu or fallback substitution on any in-content Vietnamese string.
3. Font loading MUST avoid invisible text that blocks first paint and SHOULD use a swap-friendly strategy.

## §2 Acceptance

- A Vietnamese pangram with stacked diacritics renders in the chosen face with no glyph falling back.
- Headings and body read their size and line height from `--cs-*` tokens.

## §3 Evidence (2026-07-02)

- Display face is now Space Grotesk via `next/font/google` with explicit `subsets: ["latin", "vietnamese"]` (app/layout.tsx). next/font fails the build if a declared subset does not exist, so the Vietnamese coverage is build-verified; the woff2 files are self-hosted into `.next/static/media` at build time (keyless, no runtime request to Google), `display: "swap"` with next/font's size-adjusted fallback (no invisible text, no swap CLS).
- The old stack (Iowan Old Style/Palatino/Georgia) lacked Vietnamese diacritics: VN headings rendered with per-glyph fallback substitution (mixed typefaces mid-word) - the operator-reported bug. Visual QA screenshots (puppeteer, /vi at 1440x900, dark + light) now show the full slogan "Hiện Thực Hoá Ý Chí", section headings, and StoryArc beats (stacked marks: ệ, ự, ẫ, ổ) in one face with no substitution.
- Scale stays tokenized: sizes read `--cs-text-*`, the face reads `--cs-font-display` (`var(--font-display, ...)` so isolated renders and tests keep a sane fallback), and the new `--cs-font-mono` token feeds the HUD micro-meta. Display tuning for the grotesk: h1 700 / -0.03em / 1.02, h2-h3 600 / -0.02em, `--cs-text-4xl` up to 5.6rem.
- Gate green on the Mac (2026-07-02): tsc, vitest 16 files / 60 tests, lint, next build 26/26 pages, check:assets, served-route jsdom axe 0 violations on /en + /vi. lib/theme/typography.ts was not needed - tokens live in globals.css like every other DS token.
