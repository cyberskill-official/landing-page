---
id: FR-SEO-008
title: "Per-page dynamic OpenGraph images"
module: SEO
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-WEB-003]
blocks: []
source_pages:
  - "research doc §E (OpenGraph, social sharing), §F (content model)"
planned_files:
  - app/[lang]/work/[slug]/opengraph-image.tsx
  - app/[lang]/insights/[slug]/opengraph-image.tsx
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

Not yet implemented; acceptance pending build.
