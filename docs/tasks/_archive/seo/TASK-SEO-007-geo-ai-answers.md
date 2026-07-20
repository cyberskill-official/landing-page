---
id: TASK-SEO-007
title: "GEO: structure content so AI answer engines can cite it"
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
  - "research doc §E (GEO, answer engines), §B (DOM-first content)"
new_files:
  - components/seo/ServicesJsonLd.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Content COULD be structured so generative answer engines can extract and cite CyberSkill directly.

1. Key pages COULD carry a short, self-contained summary near the top that states the answer in plain text before any elaboration.
2. Service and process pages SHOULD include question-and-answer blocks and one-sentence definitions that an engine can lift verbatim.
3. Cite-worthy facts MUST live in the DOM as readable text, never only inside the canvas or images.
4. Answer-oriented blocks SHOULD align with the FAQ JSON-LD from TASK-SEO-001 so structured and prose forms agree.

## §2 Acceptance

- A service page exposes a leading plain-text summary in the DOM.
- Question-and-answer blocks and definitions are present and readable without the canvas.
- FAQ prose matches the FAQ JSON-LD answers.

## §3 Evidence

Shipped 2026-06-22 on the home page (the key page; dedicated `/services/[slug]` pages are TASK-WEB-008, still planned). The existing DOM already satisfies the prose clauses: the Services section opens with a plain-text lead summary (clause 1) and gives each service a one-sentence definition; the FAQ section is readable text that mirrors the FAQ JSON-LD from TASK-SEO-001/CMS-002 (clauses 2, 4); all of it lives in the DOM, not the canvas (clause 3). The added citable layer is `components/seo/ServicesJsonLd.tsx`, an `OfferCatalog` of `Offer` -> `Service` entries built from the same `lib/content/site.ts` service facts, each provided by the `#organization` node, localized en/vi, rendered on the home page next to the FAQ JSON-LD. So an answer engine can extract the services as structured data that agrees with the visible prose. Verified by `next build` (rc=0) plus tsc + lint + vitest green.
