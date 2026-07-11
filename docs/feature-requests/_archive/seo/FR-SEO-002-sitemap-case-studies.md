---
id: FR-SEO-002
title: "Sitemap includes case-study URLs"
module: SEO
priority: SHOULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-SEO-001, FR-WEB-003]
blocks: []
source_pages:
  - "research doc §K (sitemap), §E (hreflang alternates)"
modified_files:
  - app/sitemap.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Every case study MUST be discoverable from the sitemap.

1. `app/sitemap.ts` MUST include every `/[lang]/work/[slug]` URL, each with
   `en` and `vi` alternates, so case studies are indexable.

## §2 Acceptance

- The generated sitemap lists each work slug for both locales.
- Each case-study entry carries `en` and `vi` alternates.

## §3 Evidence

Static: `app/sitemap.ts` maps over the work slugs and locales to emit each
`/[lang]/work/[slug]` URL with `en`/`vi` alternates. Deferred: sitemap fetch and
validation on the operator machine.
