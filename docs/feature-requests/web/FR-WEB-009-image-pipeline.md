---
id: FR-WEB-009
title: "Responsive next/image pipeline that protects LCP"
module: WEB
priority: SHOULD
status: shipped
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-002]
source_pages:
  - "research doc §F (Next.js App Router, performance), §D (Core Web Vitals)"
new_files:
  - public/brand/aurora-gold.jpg
modified_files:
  - components/sections/ContactCta.tsx
  - app/globals.css
---

## §1 Requirement (BCP-14 normative)

Images SHOULD be served responsively so they help, not hurt, the largest
contentful paint and the layout stability of the page.

1. Content images SHOULD render through `next/image` with explicit `sizes` so the
   browser fetches an appropriately sized source per viewport.
2. The hero or any above-the-fold image that is the LCP candidate MUST be marked
   `priority`, and below-the-fold images MUST NOT preempt it.
3. Images MUST reserve their intrinsic dimensions so loading them causes no
   layout shift.

## §2 Acceptance

- Content images request a viewport-appropriate source via `sizes`, and the LCP
  image is prioritized.
- No image load shifts surrounding layout.

## §3 Evidence

Shipped 2026-06-22. The first real content image - a licensed Adobe Stock aurora
(golden particle wave, on-brand Umber/Ochre), resized to 2000px and committed at
`public/brand/aurora-gold.jpg` - is rendered through `next/image` as the contact
section backdrop. It uses a static import (so Next emits intrinsic dimensions and
a blur placeholder), explicit `sizes="100vw"`, and `fill` inside an absolutely
positioned `inset:0` container, so it reserves its space and causes no layout
shift (clauses 1, 3). It is below the fold and deliberately not `priority`, so it
never preempts the LCP - which on this site is the server-rendered hero H1, not
an image, so there is no above-the-fold LCP image to prioritize (clause 2). It
shows only in dark theme (0.28 opacity) and is hidden in light theme to avoid
muddying it. Verified by `next build` (rc=0, image optimizer active) plus tsc +
lint + 37 vitest tests. Work-card and per-service images can adopt the same
pattern when those assets exist.
