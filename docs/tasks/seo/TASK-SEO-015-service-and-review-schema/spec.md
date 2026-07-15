---
id: TASK-SEO-015
title: "Service schema per service page, and Review/AggregateRating once testimonials are verifiable"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/phase-2, audit-B/strength-3, audit-A/phase-1-item-5]
---

# TASK-SEO-015: Service schema per service page, and Review/AggregateRating once testimonials are verifiable

## 0. Why (evidence)

All three audits rate the existing structured data (Organization, WebSite, FAQPage, OfferCatalog) as richer than the
competitors' and ask for the same extension: Service schema on each /services/[slug], BreadcrumbList on every sub-page
(TASK-SEO-003 shipped it - this task re-verifies it on the service and work templates), Article schema when the notes hub
launches (TASK-SEO-004), and Review/AggregateRating once real, attributable testimonials exist.

## 1. Description (normative)

- 1.1 Each /[lang]/services/[slug] SHALL emit Service JSON-LD (name, description, provider -> #organization, areaServed, serviceType) generated from the content module.
- 1.2 BreadcrumbList JSON-LD SHALL be verified present and valid on /services/[slug], /work/[slug] and every future sub-page template.
- 1.3 Review and AggregateRating JSON-LD SHALL be emitted only when a testimonial carries a real named author, role, company and recorded permission; absent that, no rating markup is emitted.
- 1.4 All emitted JSON-LD SHALL validate against the Rich Results test and the result SHALL be recorded in the task audit.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every service page emits valid Service JSON-LD linked to #organization - test: `seo/service-jsonld`
- [ ] AC for 1.2 - breadcrumbs validate on both detail templates, EN and VN - test: `seo/breadcrumb-jsonld`
- [ ] AC for 1.3 - with zero cleared testimonials, no Review/AggregateRating node is emitted - test: `seo/review-jsonld-gate`
- [ ] AC for 1.4 - Rich Results validation output recorded - test: `docs/richresults-evidence`

## 3. Edge cases

- A fabricated or unattributed rating is a hard fail - the gate in 1.3 exists to make it impossible.
- Localised schema: names and descriptions follow the page locale.

## 4. Out of scope / non-goals

- Writing the service copy (TASK-SEO-016).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
