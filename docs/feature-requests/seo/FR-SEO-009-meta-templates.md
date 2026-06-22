---
id: FR-SEO-009
title: "Structured per-page metadata templates from content"
module: SEO
priority: COULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §E (metadata), §F (content model)"
planned_files:
  - lib/seo/metadata.ts
---

## §1 Requirement (BCP-14 normative)

Page metadata COULD be derived from content through shared templates so titles
and descriptions stay consistent and never go missing.

1. A shared helper COULD build each route's title, description, and OpenGraph
   fields from its content rather than hand-written tags per page.
2. Titles MUST follow one template per page type and MUST stay within sensible
   length limits for search results.
3. When a page omits a description, the helper MUST fall back to a content-
   derived summary, never an empty value.
4. The helper SHOULD localise output so `en` and `vi` pages read naturally in
   their own language.

## §2 Acceptance

- Two pages of the same type produce titles in the same template shape.
- A page with no explicit description still emits a non-empty, content-derived
  one.
- `vi` metadata reads in Vietnamese.

## §3 Evidence

Not yet implemented; acceptance pending build.
