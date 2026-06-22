---
id: FR-SEO-004
title: "CreativeWork/Article JSON-LD on case studies and insights"
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
  - "research doc §E (SEO/GEO, structured data), §F (content model)"
planned_files:
  - components/seo/ArticleJsonLd.tsx
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
   the Organization JSON-LD from FR-SEO-001.

## §2 Acceptance

- A case-study source contains valid `CreativeWork` JSON-LD with author and
  publisher.
- An insight source contains valid `Article` JSON-LD with `datePublished`.
- Headline and description in the markup equal the rendered title and summary.

## §3 Evidence

Not yet implemented; acceptance pending build.
