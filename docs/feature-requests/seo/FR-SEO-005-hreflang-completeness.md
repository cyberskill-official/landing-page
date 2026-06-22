---
id: FR-SEO-005
title: "hreflang and canonical completeness across all routes"
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
  - "research doc §E (hreflang alternates), §K (route inventory)"
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

Not yet implemented; acceptance pending build.
