---
id: FR-CMS-007
title: "Bilingual insights/blog content collection"
module: CMS
priority: COULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CMS-001]
blocks: []
source_pages:
  - "research doc §C (information architecture), §H (SEO + discovery)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The site MUST support an insights collection (MDX or a content layer) whose posts
ship in both locales.

1. Posts MUST live in a typed content collection (MDX or content layer), not as
   ad hoc pages, so listing and detail views derive from one source.
2. Each post MUST carry a title, summary, body, date, and slug in English and
   Vietnamese; a post present in one locale SHOULD declare its counterpart.
3. A post missing a required field MUST fail the build rather than render a
   broken card or page.
4. Post metadata MUST feed SEO tags (title, description, canonical, locale
   alternates) consistently with the rest of the site.

## §2 Acceptance

- A new post renders in listing and detail views in both locales from one file.
- A post missing a required field fails the build.

## §3 Evidence

Not yet implemented; acceptance pending build.
