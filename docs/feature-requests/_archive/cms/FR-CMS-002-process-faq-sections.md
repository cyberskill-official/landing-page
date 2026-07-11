---
id: FR-CMS-002
title: "On-page Process and FAQ sections (FAQ mirrors the JSON-LD)"
module: CMS
priority: SHOULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-002, FR-CMS-001, FR-SEO-001]
blocks: []
source_pages:
  - "research doc §D (process + FAQ), §K (FAQ structured data), §E (bilingual)"
new_files:
  - components/sections/Process.tsx
  - components/sections/Faq.tsx
modified_files:
  - app/[lang]/page.tsx
  - app/globals.css
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The page MUST explain how we work and MUST answer common questions, and the
visible FAQ MUST agree with the structured data.

1. A four-step how-we-work Process section MUST be added to the home page.
2. A visible FAQ section MUST be added, and its questions MUST match
   `components/seo/HomeFaqJsonLd.tsx` so the page and the FAQ JSON-LD agree.
3. Both sections MUST render in EN and VN.

## §2 Acceptance

- The home page shows a four-step Process and a visible FAQ.
- Every visible FAQ question matches a question emitted by `HomeFaqJsonLd.tsx`.
- Both sections read correctly in `/en` and `/vi`.

## §3 Evidence

Static: `components/sections/Process.tsx` and `components/sections/Faq.tsx` are
mounted in `app/[lang]/page.tsx`; the FAQ source array is shared with
`components/seo/HomeFaqJsonLd.tsx` so page and structured data stay in sync;
styling in `app/globals.css`. Deferred: rich-result validation on the operator
machine.
