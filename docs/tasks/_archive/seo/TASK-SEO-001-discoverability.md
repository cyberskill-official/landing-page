---
id: TASK-SEO-001
title: "SEO/GEO: sitemap, robots, hreflang, Organization + FAQ JSON-LD, OpenGraph"
module: SEO
priority: MUST
status: done
class: product
verify: T
phase: P1
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-WEB-001, TASK-WEB-002]
blocks: []
source_pages:
  - "research doc §E (SEO/GEO, hreflang), §B (HTML-first crawlability)"
new_files:
  - app/sitemap.ts
  - app/robots.ts
  - components/seo/OrganizationJsonLd.tsx
  - components/seo/HomeFaqJsonLd.tsx
  - public/favicon.svg
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Because a canvas exposes no indexable text, the meaningful facts MUST live in the DOM and in structured data.

1. The app MUST emit a sitemap and a robots policy via `app/sitemap.ts` and `app/robots.ts`, listing every meaningful URL for both locales.
2. Each meaningful state MUST map to exactly one indexable URL; the home, `/work`, and `/careers` routes MUST publish `en` and `vi` hreflang alternates plus `x-default`.
3. The home page MUST embed Organization JSON-LD (name, HCMC address, contact) and FAQ JSON-LD whose answers match the on-page copy.
4. Each route MUST emit OpenGraph metadata and reference `public/favicon.svg`.

## §2 Acceptance

- `/sitemap.xml` and `/robots.txt` resolve and include both locales.
- Home source contains valid `application/ld+json` for Organization and FAQ.
- hreflang alternates are present and self-consistent across locales.

## §3 Evidence

Static: sitemap/robots route handlers + both JSON-LD components + favicon authored; hreflang emitted from the locale metadata. Deferred: Rich Results and sitemap fetch validation on the operator machine after `next build`.
