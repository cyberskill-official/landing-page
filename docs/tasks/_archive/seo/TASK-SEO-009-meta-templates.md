---
id: TASK-SEO-009
title: "Structured per-page metadata templates from content"
module: SEO
priority: COULD
status: done
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: []
blocks: []
source_pages:
  - "research doc §E (metadata), §F (content model)"
new_files:
  - lib/seo/metadata.ts
routed_back_count: 0
awh: N/A
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

Shipped 2026-06-22. `lib/seo/metadata.ts` `pageMetadata()` builds title,
optional description, alternates, OpenGraph, and Twitter for a route from
caller-supplied content, and is applied to work, work/[slug], careers, privacy,
and accessibility. The root layout's `title.template` (`"%s - CyberSkill"`)
gives every page-type title one consistent shape (clause 2), and the layout's
non-empty default `description` is the fallback when a page passes none, so a
rendered description is never empty (clause 3). Descriptions are authored per
locale, so `vi` pages read in Vietnamese (clause 4). `tests/seo-metadata.test.ts`
asserts the title mirrors into OG/Twitter and the OG locale maps correctly.
Verified by `next build` + tsc + lint green.
