# Font Subsetting Notes — FR-DS-007

**Status:** v1.0.0, 2026-05-17  
**Families:** Inter Display display alias, JetBrains Mono caption track  
**Source packages:** Fontsource `@fontsource/inter@5.2.8` and `@fontsource/jetbrains-mono@5.2.8`

## Files

| File | Role | Weight | Bytes |
|---|---|---:|---:|
| `inter-display/InterDisplay-Bold-subset.woff2` | Hero / scene title fallback weight | 700 | 36,244 |
| `inter-display/InterDisplay-ExtraBold-subset.woff2` | Hero emphasis | 800 | 36,128 |
| `jetbrains-mono/JetBrainsMono-Regular-subset.woff2` | Lumi captions | 400 | 7,336 |
| `jetbrains-mono/JetBrainsMono-Bold-subset.woff2` | Caption emphasis | 700 | 7,472 |

Total: 87,180 bytes, under the FR-DS-007 200 KB compressed-font budget.

## Unicode Coverage

The CSS declares Latin, Vietnamese, and narrative punctuation ranges:

- `U+0000-007F` basic Latin
- `U+0102-0103`, `U+0110-0111`, `U+0128-0129`, `U+0168-0169`
- `U+01A0-01A1`, `U+01AF-01B0`
- `U+1EA0-1EF9` Vietnamese tone-marked vowels and related Latin Extended Additional glyphs
- `U+2010-2027` hyphen, en dash, em dash, curly quotes, bullets, and narrative punctuation

These ranges cover FR-CMS-003 Vietnamese lines including `Sài Gòn`, `Việt Nam`, `ý chí`, and `nguyện ước`.

## Loading Policy

`packages/ds-cinematic/src/tokens/typography.css` uses `font-display: swap` for every `@font-face` to avoid FOIT and protect the Scene 0 headline LCP. FR-WEB-001 owns the eventual Next.js preload tags for:

- `/fonts/inter-display/InterDisplay-Bold-subset.woff2`
- `/fonts/jetbrains-mono/JetBrainsMono-Regular-subset.woff2`

No Google Fonts or other runtime CDN dependency is allowed; these files are self-hosted under `/fonts`.
