---
id: FR-SEO-008
title: "Per-page dynamic OpenGraph images"
module: SEO
priority: SHOULD
status: done
class: product
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-003]
blocks: []
source_pages:
  - "research doc §E (OpenGraph, social sharing), §F (content model)"
new_files:
  - app/[lang]/work/[slug]/opengraph-image.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Each page SHOULD present a distinct social preview image so shared links look
deliberate rather than generic.

1. Each route SHOULD generate a per-page OpenGraph image at 1200 by 630 pixels,
   including case studies and insights.
2. The image SHOULD render the page title and the CyberSkill mark using the
   brand palette and type, derived from page content.
3. Each page MUST set `og:image`, its width and height, and a matching
   `twitter:image` so previews are consistent across networks.
4. A safe default image MUST exist for routes that supply no specific title.

## §2 Acceptance

- A case-study and an insight page each emit a unique 1200x630 OpenGraph image.
- The image shows the page title and brand mark.
- `og:image` dimensions and `twitter:image` are present and correct.

## §3 Evidence

Shipped 2026-06-22. `app/[lang]/work/[slug]/opengraph-image.tsx` generates a
1200x630 PNG per case study: it reads the slug, looks up the work item, and
renders the localized case title plus the client and the CYBERSKILL mark on the
Umber/Ochre brand palette, using system fonts so it builds offline. Next wires
`og:image` (with width/height) and `twitter:image` automatically from the file
convention. The existing `app/[lang]/opengraph-image.tsx` is the safe default for
routes with no specific title (clause 4). Verified by `next build`, which
registers both `/[lang]/opengraph-image` and `/[lang]/work/[slug]/opengraph-image`.

Scope note: the insight OG image (clause 1) waits on the insights route, which
does not exist yet; the same component pattern will apply when it ships.
