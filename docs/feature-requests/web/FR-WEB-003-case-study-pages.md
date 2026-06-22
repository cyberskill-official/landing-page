---
id: FR-WEB-003
title: "Indexable case-study detail pages with clickable cards"
module: WEB
priority: SHOULD
status: shipped
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-001, FR-WEB-002, FR-SEO-001]
blocks: [FR-SEO-002]
source_pages:
  - "research doc §D (case studies), §E (hreflang), §F (App Router static params)"
new_files:
  - app/[lang]/work/[slug]/page.tsx
modified_files:
  - components/sections/WorkPreview.tsx
  - app/[lang]/work/page.tsx
  - app/globals.css
---

## §1 Requirement (BCP-14 normative)

Each case study MUST be a real, indexable page reachable from its card.

1. Dynamic `/[lang]/work/[slug]` pages MUST exist with `generateStaticParams`
   over locales x work slugs (6 prerendered) and MUST `notFound()` for an
   unknown slug.
2. Each page MUST emit per-locale metadata with a canonical URL and hreflang
   alternates, and MUST present bilingual challenge, what-we-did, and outcome
   prose.
3. Work cards MUST link to the detail page via an accessible stretched link.

## §2 Acceptance

- `/en/work/<slug>` and `/vi/work/<slug>` resolve for known slugs; 6 routes
  prerender; an unknown slug returns 404.
- Each page exposes canonical + `en`/`vi` hreflang and reads in both locales.
- A work card is fully clickable to its case study and remains keyboard
  reachable.

## §3 Evidence

Static: `app/[lang]/work/[slug]/page.tsx` defines `generateStaticParams`
(locales x slugs), `notFound()` on miss, and per-locale canonical + hreflang
metadata; `components/sections/WorkPreview.tsx` and `app/[lang]/work/page.tsx`
add the stretched-link cards; styling in `app/globals.css`. Deferred: crawl and
route smoke test on the operator machine.
