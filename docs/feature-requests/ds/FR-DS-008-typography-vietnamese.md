---
id: FR-DS-008
title: "Type scale and a typeface with full Vietnamese diacritic coverage"
module: DS
priority: SHOULD
status: planned
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-DS-001]
source_pages:
  - "research doc §C (typography, design tokens), §E (Vietnamese-first)"
new_files:
  - app/globals.css
  - lib/theme/typography.ts
---

## §1 Requirement (BCP-14 normative)

Type MUST be tokenized and the chosen typeface MUST render Vietnamese correctly,
since Vietnamese is a first-class locale for this site.

1. The system MUST express the type scale (sizes, line heights, weights) as
   `--cs-*` tokens that components consume rather than literal pixel values.
2. The primary typeface MUST cover the full Vietnamese diacritic set, including
   stacked tone marks, with no tofu or fallback substitution on any in-content
   Vietnamese string.
3. Font loading MUST avoid invisible text that blocks first paint and SHOULD use
   a swap-friendly strategy.

## §2 Acceptance

- A Vietnamese pangram with stacked diacritics renders in the chosen face with no
  glyph falling back.
- Headings and body read their size and line height from `--cs-*` tokens.

## §3 Evidence

Not yet implemented; acceptance pending build.
