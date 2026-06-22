# Local run audit - 2026-06-22

Ran the production build in the sandbox (`next start`) and exercised every route
and API, then inspected the rendered HTML for markup, accessibility, and i18n.
Method: curl each URL, save HTML, grep for structure; plus the vitest suite.

Scope limit: the server runs in the sandbox, so this covers behaviour, markup,
and accessibility from real responses. Pixel-level visuals (spacing, colour,
responsive breakpoints, the live WebGL scene, animation feel) still need a
browser on a real machine - see "Not covered" below.

## Routes (all pass)

| URL | Result |
|---|---|
| `/` | 307 -> `/en` |
| `/en`, `/vi` | 200, full SSR HTML (42 KB / 46 KB) |
| `/en/work`, `/vi/work` | 200 |
| `/en/careers`, `/vi/careers` | 200 |
| `/en/lite` | 200, 6 storyboard panels, `noindex` |
| `/en/zz-bad`, bad paths | 404 (custom not-found) |
| `/en/opengraph-image` | 200, `image/png` |
| `/robots.txt`, `/sitemap.xml` | 200 |

## APIs (all pass)

| Call | Result |
|---|---|
| `POST /api/lead` valid | 200 `{"ok":true}` |
| `POST /api/lead` invalid | 422 with per-field errors (email, intent, consent, locale) |
| `POST /api/genie` (no key) | 503 `{"error":"unavailable"}` -> client shows contact-form fallback |

## Markup / a11y / SEO (all pass)

- `<html lang="en">` on `/en`, `<html lang="vi-VN">` on `/vi` (per-locale, correct).
- Exactly one `<h1>` per page; hero H1 is the slogan ("Turn Your Will Into Real").
- hreflang alternates present (`en`, `vi`, `x-default`) plus a self canonical.
- 4 JSON-LD blocks, all valid JSON (Organization graph + FAQPage).
- Meta description and 9 OpenGraph tags; `og:image` points to the per-locale card.
- Lead form: labelled fields, required consent checkbox, hidden honeypot.
- Skip link is the first focusable element; section anchors present
  (`#services`, `#work`, `#proof`, `#contact`).
- VN content renders with correct diacritics; EN/VN dictionary key parity is unit-tested.

## Findings fixed in this pass

1. Three user-facing middot ("·") separators violated the keyboard-characters-only
   rule. Replaced with plain characters: value-prop stat ("Web, mobile, internal"),
   footer email/phone separator, and the lite "CyberSkill - Lumi" label.
2. The 404 page had Vietnamese without diacritics. Corrected to "Không tìm thấy
   trang." and "Trang tiếng Việt" (wrapped in `lang="vi"`).
3. The Vietnamese OG-image tagline was ASCII while the slogan carried diacritics.
   Made it consistent ("Web - Di động - Hệ thống nội bộ - TP Hồ Chí Minh").

No functional defects were found; every feature works.

## Caveat to eyeball on a deployed preview

The Vietnamese OG image relies on the default `next/og` font for diacritic
glyphs. If they render as boxes on a preview, embed a Noto Sans Vietnamese font
in `app/[lang]/opengraph-image.tsx` (pass `fonts` to `ImageResponse`). The page
itself is unaffected (browser fonts render Vietnamese fine).

## Not covered here (needs a real browser / deployment)

- Visual and responsive review across breakpoints; Liquid Glass surfaces.
- The live R3F scene (mounts only on capable desktop) and animation feel.
- Live Genie streaming and lead routing with real keys.
- Lighthouse field Core Web Vitals on a deployed build.
