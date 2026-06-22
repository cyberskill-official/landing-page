---
id: FR-SEO-003
title: "BreadcrumbList JSON-LD on sub-pages"
module: SEO
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SEO-001]
blocks: []
source_pages:
  - "research doc §E (SEO/GEO, structured data), §K (site hierarchy)"
planned_files:
  - components/seo/BreadcrumbJsonLd.tsx
---

## §1 Requirement (BCP-14 normative)

Sub-pages SHOULD declare their position in the site hierarchy so search engines
can render breadcrumb trails and understand structure.

1. Each sub-page under `/work`, `/careers`, `/services`, and case studies SHOULD
   embed `BreadcrumbList` JSON-LD describing the path from home to the current
   page.
2. The breadcrumb items MUST use absolute URLs and MUST match the visible
   navigation order and labels on the page.
3. The home page MUST be the first item in every trail, and the current page
   MUST be the last item without an outgoing link.
4. Breadcrumb names SHOULD honour the active locale so `en` and `vi` trails read
   in their own language.

## §2 Acceptance

- A case-study page source contains valid `application/ld+json` of type
  `BreadcrumbList` with home as the first item.
- Breadcrumb item URLs are absolute and resolve to real routes.
- Trails on `vi` pages use Vietnamese labels.

## §3 Evidence

Not yet implemented; acceptance pending build.
