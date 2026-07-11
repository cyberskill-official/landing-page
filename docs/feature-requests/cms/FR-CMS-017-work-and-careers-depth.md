---
id: FR-CMS-017
title: "Deepen the work index and careers pages"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-16-low, audit-C/on-page-seo, audit-A/section-6]
---

# FR-CMS-017: Deepen the work index and careers pages

## 0. Why (evidence)

Audit B: /en/work and /en/careers carry roughly 200 words each - light for pages meant to convert a client or a candidate.
Audit A adds that there is no dedicated about/company-story page and no culture/process depth for recruiting.

## 1. Description (normative)

- 1.1 The work index SHALL introduce the practice areas, the shape of a typical engagement, and link every case study with its outcome line.
- 1.2 The careers page SHALL cover: how the team works, the hiring process end to end, what seniority means here, the tools and gates a new engineer will meet, and current openings (or the honest statement that none are open, with the talent-pool capture from FR-CTA-020).
- 1.3 Each page SHALL exceed roughly 500 words of real content per locale.
- 1.4 EN and VN ship together.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the work index renders the new sections and links every case study - test: `content/work-index-shape`
- [ ] AC for 1.2 - the careers page renders every named section - test: `content/careers-shape`
- [ ] AC for 1.3 - word count >= 500 per locale on both pages - test: `content/page-depth`

## 3. Edge cases

- 'No openings' must not read as a dead end - the talent pool is the fallback.

## 4. Out of scope / non-goals

- The team page (FR-WEB-012).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
