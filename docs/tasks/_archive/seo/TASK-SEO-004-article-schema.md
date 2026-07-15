---
id: TASK-SEO-004
title: "CreativeWork/Article JSON-LD on case studies and insights"
module: SEO
priority: SHOULD
status: done
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-WEB-003]
blocks: []
source_pages:
  - "research doc §E (SEO/GEO, structured data), §F (content model)"
new_files:
  - "app/[lang]/work/[slug]/page.tsx (inline CreativeWork JSON-LD)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Long-form pages SHOULD expose article-level structured data so they can earn
rich results and feed answer engines.

1. Each case study SHOULD embed `CreativeWork` JSON-LD, and each insight SHOULD
   embed `Article` JSON-LD, with headline, description, author, and publisher.
2. The structured data MUST carry `datePublished` and, when known,
   `dateModified`, both as ISO 8601 dates.
3. Headline and description MUST match the on-page title and summary so the
   markup never contradicts visible copy.
4. The publisher block MUST name CyberSkill and reference the same logo used by
   the Organization JSON-LD from TASK-SEO-001.

## §2 Acceptance

- A case-study source contains valid `CreativeWork` JSON-LD with author and
  publisher.
- An insight source contains valid `Article` JSON-LD with `datePublished`.
- Headline and description in the markup equal the rendered title and summary.

## §3 Evidence

Shipped 2026-06-22 for the case-study scope. Each `work/[slug]` page emits inline
`CreativeWork` JSON-LD whose `headline`/`name` equal the on-page h1
(`item.title`) and whose `description` equals the on-page lead (`item.result`),
so markup and visible copy agree (clause 3). It carries `datePublished` and
`dateModified` as ISO 8601 dates (clause 2), an `author` Organization, and a
`publisher` that references the same `#organization` node emitted by
`OrganizationJsonLd` in the `[lang]` layout (clause 4), so author and publisher
resolve to one entity. Verified by `next build` (6 case-study pages prerendered)
and tsc + lint green.

Insight `Article` JSON-LD (clause 1, second half) is deferred: there is no
insights route yet (TASK-WEB-003 and the insights content tasks are still planned).
When the insights route ships, the same pattern applies with `@type: Article`.
