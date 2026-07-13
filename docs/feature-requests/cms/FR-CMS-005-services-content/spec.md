---
id: FR-CMS-005
title: "Long-form bilingual services content for the detail pages"
status: done
class: product
priority: SHOULD
owner: agent
depends_on: [FR-SEO-016]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-D, audit-C/on-page-seo]
---

# FR-CMS-005: Long-form bilingual services content for the detail pages

## 0. Why (evidence)

Research doc §D. The /services/[slug] routes exist and render short copy; audit C found some routes return thin extracted
body text. This FR owns the content module those pages read - FR-SEO-016 owns the page shape and the depth target.

## 1. Description (normative)

- 1.1 Every service detail page SHALL draw its copy from the FR-CMS-001 content module; no detail copy SHALL be hardcoded in a component.
- 1.2 Each service entry SHALL carry a summary, the problem it solves, the approach, the typical stack and a call to action, in English and Vietnamese.
- 1.3 A field present in one locale SHALL be present in the other; a missing localized field SHALL be a build-time error, never a runtime blank.
- 1.4 The content shape SHALL be typed and identical across all services so the pages render uniformly.

## 2. Acceptance criteria

- [ ] AC for 1.1 - no service copy literal exists in a component file - test: `lint/no-hardcoded-copy`
- [ ] AC for 1.2 - each service page renders all five fields in both locales - test: `content/service-page-shape`
- [ ] AC for 1.3 - deleting a VN field fails the build - test: `content/vi-key-parity`
- [ ] AC for 1.4 - all three services satisfy the same type - test: `content/service-page-shape`

## 3. Edge cases

- A service with no case study to link to yet.
- VN copy is a native pass, not a translation (FR-CMS-003).

## 4. Out of scope / non-goals

- The page depth target and the FAQ blocks (FR-SEO-016).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
