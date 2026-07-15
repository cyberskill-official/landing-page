---
id: TASK-SEO-016
title: "Deepen the three service pages into ranking, converting pages"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-3-item-14, audit-C/phase-2, audit-B/finding-16-low, growth/SEO-02]
---

# TASK-SEO-016: Deepen the three service pages into ranking, converting pages

## 0. Why (evidence)

Audit A: no pages target high-intent commercial queries; competitors rank on dozens. Audit C: some routes return thin
extracted body text. Audit B: /work and /careers carry roughly 200 words each. The three service pages are the site's best
ranking assets and are currently short and generic. Supersedes the closed TASK-WEB-008 (the routes already exist).

## 1. Description (normative)

- 1.1 Each /services/[slug] SHALL carry, per locale: who it is for, the scope taken on, the typical stack, the four-step process applied to that practice, a typical timeline, the engagement model and starting range (from TASK-CTA-017), 4-6 service-specific FAQ entries with FAQPage JSON-LD, and links to related work.
- 1.2 Each service page SHALL exceed roughly 800 words of real, non-boilerplate content per locale.
- 1.3 Content SHALL live in the content module and ship EN and VN in the same commit; any claim not yet approved SHALL be withheld, not published as placeholder.
- 1.4 Each page SHALL link to at least one work item and to the contact path.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every named section renders on all three service pages, both locales - test: `content/service-page-shape`
- [ ] AC for 1.2 - word count >= 800 per locale per page - test: `content/service-page-shape`
- [ ] AC for 1.3 - service FAQ JSON-LD validates - test: `seo/service-faq-jsonld`
- [ ] AC for 1.4 - no placeholder or FOR REVIEW string reaches production - test: `content/no-placeholders`

## 3. Edge cases

- Pricing ranges are commitments - the page must render correctly with the range block absent until approved.
- Vietnamese copy is a native pass, not a machine translation (TASK-CMS-003).

## 4. Out of scope / non-goals

- The notes/insights hub (TASK-CMS-007).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
