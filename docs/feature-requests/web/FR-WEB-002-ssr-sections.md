---
id: FR-WEB-002
title: "Server-rendered home sections (hero through contact), story-driven and crawlable"
module: WEB
priority: MUST
status: shipped
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-001, FR-CMS-001]
blocks: [FR-SEO-001]
source_pages:
  - "research doc §B (HTML-first storytelling), §C (information architecture)"
new_files:
  - components/sections/Hero.tsx
  - components/sections/ValueProp.tsx
  - components/sections/Services.tsx
  - components/sections/WorkPreview.tsx
  - components/sections/SocialProof.tsx
  - components/sections/Careers.tsx
  - components/sections/ContactCta.tsx
  - components/motion/Reveal.tsx
  - app/[lang]/page.tsx
  - app/[lang]/work/page.tsx
  - app/[lang]/careers/page.tsx
---

## §1 Requirement (BCP-14 normative)

The home story MUST be server-rendered DOM, not painted by the canvas, so that
every meaningful state is crawlable and survives with JavaScript disabled.

1. The home route MUST render hero, value proposition, services, work preview,
   social proof, careers, and contact as server components reading copy from the
   content source (FR-CMS-001) for the active locale.
2. The hero H1 MUST be the slogan "Turn Your Will Into Real" rendered in the SSR
   DOM, and MUST be the LCP element. The 3D canvas MUST NOT own LCP and MUST NOT
   be required for any text to be present.
3. Reveal animations MUST be opacity-only (no layout shift) and MUST be motion-
   safe: under `prefers-reduced-motion: reduce` the `Reveal` wrapper MUST render
   its children fully visible with no transform.
4. `/work` and `/careers` MUST exist as their own crawlable routes per locale.

## §2 Acceptance

- View-source on `/en` and `/vi` shows the slogan H1 and all seven section
  headings as text before any client script runs.
- With motion reduced, content is visible immediately (no opacity:0 trap).

## §3 Evidence

Static: seven section components + `Reveal` + three routes authored; copy is
read from `lib/content/site.ts`; `Reveal` branches on reduced motion. Deferred:
`next build` render and LCP-element confirmation on the operator machine.
