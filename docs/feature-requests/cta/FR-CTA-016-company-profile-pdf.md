---
id: FR-CTA-016
title: "Company profile one-pager PDF, EN and VN"
status: ready_to_implement
class: improvement
priority: COULD
owner: mixed
depends_on: [FR-BIZ-013]
routed_back_count: 0
awh: N/A
traces_to: [growth/CONV-07]
---

# FR-CTA-016: Company profile one-pager PDF, EN and VN

## 0. Why (evidence)

Procurement and directors get forwarded a PDF, not a scroll story. The site already holds every fact the one-pager needs
(entity sentence, services, process, proof, contact, DUNS).

## 1. Description (normative)

- 1.1 A one-page profile per locale SHALL be generated from the site's content module, styled on the design system, and stored under public/downloads/.
- 1.2 Each file SHALL be under 1 MB, linked from the footer and the thank-you panel, and its download SHALL emit an event.
- 1.3 The PDF SHALL contain no claim that is not already true and published on the site.

## 2. Acceptance criteria

- [ ] AC for 1.1 - both PDFs build and are under 1 MB - test: `assets/profile-pdf-size`
- [ ] AC for 1.2 - links render and downloads emit the event - test: `analytics/both-lead-paths`
- [ ] AC for 1.3 - every fact in the PDF traces to the content module - test: `content/profile-pdf-parity`

## 3. Edge cases

- Regenerating on every content change - stale PDFs are a truth risk.
- Vietnamese diacritics must render in the PDF font.

## 4. Out of scope / non-goals

- Design of a full capability deck.

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
