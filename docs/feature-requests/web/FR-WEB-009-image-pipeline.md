---
id: FR-WEB-009
title: "Responsive next/image pipeline that protects LCP"
module: WEB
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-WEB-002]
source_pages:
  - "research doc §F (Next.js App Router, performance), §D (Core Web Vitals)"
modified_files:
  - components/sections/Hero.tsx
  - components/sections/WorkPreview.tsx
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

Not yet implemented; acceptance pending build.
