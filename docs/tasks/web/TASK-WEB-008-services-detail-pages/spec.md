---
id: TASK-WEB-008
title: "Per-service detail pages with static params and hreflang"
module: WEB
priority: SHOULD
status: closed
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [TASK-WEB-002, TASK-CMS-005]
source_pages:
  - "research doc §C (information architecture), §E (hreflang), §F (Next.js App Router)"
new_files:
  - app/[lang]/services/[slug]/page.tsx
routed_back_count: 0
awh: N/A
closed_reason: superseded by TASK-SEO-016 (service-page depth); the /services/[slug] routes already ship
---

## §1 Requirement (BCP-14 normative)

Each service SHOULD have its own crawlable detail page per locale, so the offer can rank and be linked on its own URL.

1. The route `/[lang]/services/[slug]` MUST exist and MUST use `generateStaticParams` to pre-render every service in both locales from the content source (TASK-CMS-005).
2. Each page MUST emit per-locale metadata and hreflang alternates (`en`, `vi`, `x-default`), and an unknown slug MUST `notFound()`.
3. Page copy MUST come from the shared content source for the active locale, not be duplicated in the route.

## §2 Acceptance

- Every service resolves at `/en/services/[slug]` and `/vi/services/[slug]` with correct hreflang links; an unknown slug returns 404.
- View-source shows the service title and body as text per locale.

## §3 Evidence

Not yet implemented; acceptance pending build.
