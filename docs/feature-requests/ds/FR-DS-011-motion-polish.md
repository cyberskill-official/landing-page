---
id: FR-DS-011
title: "Premium motion-polish layer (aurora, kinetic hero, cursor, intro veil, marquee)"
module: DS
priority: COULD
status: shipped
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-07-02
shipped: 2026-07-02
depends_on: [FR-DS-001, FR-DS-009]
source_pages:
  - "operator request 2026-07-02: Awwwards/motionsites-tier polish pass, keep structure/content"
new_files:
  - lib/motion/kinetic.ts
  - components/motion/MotionExtras.tsx
  - components/motion/IntroVeil.tsx
  - components/motion/Aurora.tsx
  - components/sections/Marquee.tsx
  - tests/motion-polish.test.ts
modified_files:
  - app/globals.css
  - app/layout.tsx
  - app/[lang]/layout.tsx
  - app/[lang]/page.tsx
  - components/sections/Hero.tsx
  - components/sections/{Services,ValueProp,Process,WorkPreview,SocialProof,Careers,ContactCta,Faq,StoryArc}.tsx
  - lib/i18n/dictionaries.ts
  - tests/axe.test.ts
---

## §1 Requirement (BCP-14 normative)

1.1 The site MUST gain a cohesive premium motion layer on top of the existing
motion infra (Reveal, ScrollStoryProvider, canvas, grain) without redesigning
structure or content: (a) an animated brand-gold aurora backdrop behind the
hero and contact sections; (b) a kinetic masked hero headline with a
continuous gold shimmer; (c) a custom cursor with trailing ring and soft
spotlight glow plus magnetic CTAs and 3D card tilt; (d) a once-per-session
branded page-load intro that resolves into the hero; (e) a kinetic keyword
marquee; (f) a thin gold scroll-progress bar; (g) masked/staggered section
heading reveals; (h) animated link underlines and a button hover shine.

1.2 Every new movement MUST be transform/opacity only (CLS-safe, space always
reserved). New JS-driven interactions (cursor, magnetic, tilt, intro gating)
MUST respect prefers-reduced-motion with static fallbacks and MUST be limited
to fine pointers that can hover; the scroll-progress bar MAY remain for all
users because it mirrors scroll 1:1. All decorative surfaces MUST be
aria-hidden with the real content unchanged beneath (the H1 keeps its full
slogan as the accessible name), and the intro veil MUST be unable to trap
focus, block input, or fail to dismiss (CSS-only timeline, pointer-events
none, forwards fill ending hidden; skipped entirely for no-JS/crawlers).

1.3 The layer MUST stay within the existing gates: keyless, bilingual EN/VN,
brand tokens only (no new colors outside the gold/umber ramp), no new runtime
dependencies, CI build + REQUIRED served-route axe + Lighthouse (CLS < 0.1)
green, and `npm run check:assets` within budget.

## §2 Design

One client manager (`components/motion/MotionExtras.tsx`) owns all pointer
and scroll JS: progress bar (rAF-throttled scaleX), custom cursor (1:1 dot,
lerped ring + spotlight glow, hidden over text fields), magnetic pull and
tilt via a capturing pointerover delegate (no per-card listeners; rects read
per frame so scroll never staleness-drifts), and the [data-mask-reveal]
IntersectionObserver (shows-only, rescans per pathname). Media-query changes
attach/detach the whole cursor layer live. Everything else is CSS:
`Aurora.tsx` (three pre-blurred radial blobs, transform drift, no filter at
paint time), the kinetic headline (per-word overflow masks + rise animation +
a background-clip:text shimmer whose background-position only travels 0-100%
so the no-repeat gradient always covers the glyphs), the intro veil (gated by
an inline script setting `<html data-intro="play">` once per sessionStorage
session, never under reduced motion), the marquee (two identical halves,
-50% translate loop, hover pause), underlines, button shine, and the guards
(reduced-motion, forced-colors, print) kept last in the cascade.

## §3 Verification evidence (2026-07-02, Mac gate)

- `npm run typecheck` EXIT=0; `npm test` 16 files / 60 tests green (8 new in
  tests/motion-polish.test.ts: slogan word-split EN/VN, magnetic cap, tilt
  edges, Hero aria-label + mask count, marquee/veil aria-hidden); `npm run
  lint` EXIT=0; `npm run build` Compiled successfully, 26/26 pages, First
  Load JS shared 175 kB; `npm run check:assets` OK (client JS 2363KB <
  2800KB budget, public/ 95KB).
- Served-route axe (jsdom, wcag2a/aa, color-contrast deferred to the CI
  Chrome job): /en and /vi = 0 violations.
- Visual QA (puppeteer + OS Chrome against `next start`): reduced-motion
  fallbacks correct (static headline, no veil, no cursor, static marquee);
  motion-on round (emulated no-preference) verified veil -> hero handoff,
  word rise, cursor ring + magnetic CTA, marquee glide, dark-theme aurora.
  Found + fixed in-session: shimmer background-position outside 0-100% broke
  gradient coverage and visually clipped the slogan words in every theme.
