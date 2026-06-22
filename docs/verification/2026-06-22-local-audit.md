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

## Live browser pass (driven in Chrome on the dev server)

Ran `npm run dev` on the machine and drove Chrome through the real UI:

- Hero (EN and VN), value props, services, selected work, careers, contact,
  and footer all render correctly and on-brand.
- Lead form submitted end to end: filled name + email, ticked consent, clicked
  Send, got the "Thank you. Your note reached us." success state.
- Genie chat opened, accepted a message, and returned the no-key fallback
  ("Lumi is resting right now. Please use the contact form...") as designed.
- Vietnamese page renders full diacritics throughout (nav, H1, CTAs).
- RESOLVED: the Vietnamese OG image renders diacritics correctly with the
  default `next/og` font ("Hiện thực hoá ý chí", "Di động - Hệ thống nội bộ -
  TP Hồ Chí Minh"). No font embedding needed.
- The middot and 404-diacritic fixes confirmed live.

## Not covered (needs real keys / deployment / specific OS state)

- Live Genie streaming with a real ANTHROPIC_API_KEY (only the fallback path
  was exercisable locally).
- The live R3F 3D scene: this machine has macOS Reduce Motion on, so the
  capability gate correctly serves the static poster and the WebGL scene never
  mounts. To see it, test on a machine with motion enabled.
- Lighthouse field Core Web Vitals on a deployed build.

Note (design choice, not a bug): the in-page motion toggle controls CSS
animation, but the 3D scene also hard-respects the OS reduced-motion setting, so
the toggle alone will not force the WebGL scene on when the OS prefers reduced
motion. If you want the explicit toggle to override that for 3D too, it is a
small change to `CanvasMount`.
