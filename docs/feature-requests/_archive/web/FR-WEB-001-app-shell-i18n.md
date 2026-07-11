---
id: FR-WEB-001
engineering_anchor: true
title: "Next.js App Router shell with EN/VN [lang] routing and per-locale <html lang>"
module: WEB
priority: MUST
status: done
class: product
verify: T
phase: P1
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-DS-001]
blocks: [FR-WEB-002, FR-SEO-001, FR-CTA-001, FR-CHAR-012]
source_pages:
  - "research doc §F (Next.js App Router), §E (Vietnamese-first, hreflang)"
new_files:
  - app/layout.tsx
  - app/page.tsx
  - app/[lang]/layout.tsx
  - middleware.ts
  - lib/i18n/config.ts
  - lib/i18n/dictionaries.ts
  - lib/i18n/types.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

1. MUST route every page under `/[lang]` with `lang in {en, vi}` and
   `generateStaticParams` for both; an invalid locale MUST `notFound()`.
2. The root layout MUST own `<html>`/`<body>` and MUST set `<html lang>` to the
   active locale (BCP-47), supplied by middleware via the `x-cs-locale` request
   header. Bare `/` MUST redirect to the default locale.
3. The locale layout MUST mount the shared chrome (skip link, header, footer,
   persistent CTA, Genie, canvas) and MUST emit per-locale metadata with
   hreflang alternates (`en`, `vi`, `x-default`).

## §2 Acceptance

- `/en` and `/vi` resolve; `<html lang>` matches; `/` redirects to `/en`.
- `/zz` (invalid) returns 404.

## §3 Evidence

Static: routes + middleware + generateStaticParams authored; `@/` imports
resolve (verify script). Deferred: `next build` + route smoke test (operator).
