---
id: TASK-SEO-005
title: "hreflang and canonical completeness across all routes"
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
depends_on: [TASK-SEO-001]
blocks: []
source_pages:
  - "research doc §E (hreflang alternates), §K (route inventory)"
new_files:
  - lib/seo/metadata.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Every route, including dynamic ones, SHOULD declare correct language alternates
and a canonical so duplicate-locale signals stay clean.

1. Every static and dynamic route SHOULD emit `en` and `vi` hreflang alternates
   plus a single `x-default`, including `/work/[slug]` and `/insights/[slug]`.
2. Each page MUST declare exactly one self-referential canonical URL that
   matches the route it serves.
3. The `x-default` alternate MUST point to a stable default-locale URL and MUST
   be consistent across the whole site.
4. Alternates MUST be reciprocal: the `en` page MUST link its `vi` twin and vice
   versa, with no dangling or mismatched pairs.

## §2 Acceptance

- A dynamic case-study and insight URL each expose `en`, `vi`, and `x-default`
  alternates.
- Each route declares one self-referential canonical.
- Spot-checked alternate pairs are reciprocal and resolve.

## §3 Evidence

Shipped 2026-06-22. `lib/seo/metadata.ts` `pageMetadata()` returns one
self-referential canonical (`/{locale}{path}`) and a complete, reciprocal
hreflang set (`en`, `vi`, `x-default` -> `/en{path}`) for any route. The
`[lang]` layout already emits the same set for the home route, and the helper is
now applied to work, work/[slug], careers, privacy, and accessibility, so static
and dynamic routes alike expose `en`/`vi`/`x-default` and exactly one canonical.
A vitest unit test (`tests/seo-metadata.test.ts`) asserts the canonical and the
three-key language map for both a sub-path and the home path. Verified by
`next build` (26/26 pages) plus tsc + lint green.

Scope note: the insight route in clause 1/acceptance does not exist yet (insights
content tasks are still planned); the same helper will cover `/insights/[slug]`
when that route ships.
