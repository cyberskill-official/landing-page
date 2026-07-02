---
id: FR-DS-012
title: "Futuristic art-direction pass: dark default, gold HUD language, native VN copy"
module: DS
priority: COULD
status: shipped
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-07-02
shipped: 2026-07-02
depends_on: [FR-DS-008, FR-DS-011]
source_pages:
  - "operator direction 2026-07-02: default dark, fix VN font + copy, push past $50k-tier, more futuristic"
new_files:
  - docs/feature-requests/ds/FR-DS-012-futuristic-art-direction.md
modified_files:
  - app/layout.tsx
  - app/globals.css
  - components/sections/{Hero,Process,Faq,StoryArc,SocialProof}.tsx
  - lib/content/site.ts
  - lib/i18n/dictionaries.ts
  - app/[lang]/layout.tsx
  - tests/motion-polish.test.ts
---

## §1 Requirement (BCP-14 normative)

1.1 Dark MUST become the default theme (SSR `data-theme="dark"`); a stored
light preference MUST still win before first paint.

1.2 The visual language MUST move to a precision "gold HUD" direction on top
of FR-DS-011: a blueprint grid behind the hero, a monospace micro-meta row
(coordinates, city, locales), ghost engineering indices on the home
sections, an orbiting conic gold border on card hover, a gold-gradient
final slogan word, a tilted marquee band, a gold hairline under the
scrolled header, and a breathing halo on the hero CTA.

1.3 All Vietnamese copy MUST read as written-in-Vietnamese, not translated:
home sections, story beats, process steps, FAQ, forms, genie strings, work
cards, and metadata descriptions. The slogan MUST use the brand-exact
casing from DESIGN.md ("Hiện Thực Hoá Ý Chí"). The duplicate "How we work"
heading (Process vs the SocialProof no-quotes fallback) MUST be resolved.

1.4 The FR-DS-011 rules keep applying: transform/opacity/paint-only
movement (CLS-safe), decorative pieces aria-hidden or pseudo-element,
reduced-motion/forced-colors/print guards, no new runtime dependencies,
budgets and the required CI gates stay green.

## §2 Design

Dark default flips one SSR attribute; the existing no-flash script already
prefers localStorage. The HUD pieces are CSS-only: the grid and section
indices are pseudo-elements (`content: counter() / ""` keeps them silent
for assistive tech), the orbit border is a masked conic-gradient rotated by
a registered @property angle (static ring where @property is unsupported),
and the gold final word overrides the travelling shimmer with a static
gilded gradient inside the same background-clip @supports block (per-theme
gold ramps keep it readable on paper). The VN pass rewrites strings in
place - no key changes, so no component or test plumbing moved.

## §3 Evidence (2026-07-02, Mac gate)

- tsc, vitest 16 files / 60 tests (VN slogan-casing expectation updated),
  lint, build 26/26 pages (First Load JS shared 175 kB), check:assets
  (client JS 2364KB < 2800KB), served-route jsdom axe 0 violations on /en +
  /vi - all EXIT=0.
- Visual QA (puppeteer, dark default + light opt-in + /vi): veil on umber,
  gold "Real"/"Chí" final word, grid + coordinates row, ghost indices (01,
  03...), orbit border + cursor + spotlight on card hover, tilted marquee,
  VN diacritics uniform (FR-DS-008), VN story copy reading native.
- Duplicate heading resolved: SocialProof fallback now "What we stand
  behind" / "Điều chúng tôi cam kết".
- Copy remains agent-polished, not native-reviewed: FR-CMS-003 (Vietnamese
  native review) intentionally stays planned as the human pass.
