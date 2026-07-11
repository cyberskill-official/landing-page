---
id: FR-CMS-011
title: "Work-detail template that can carry proof: metrics band, client quote, screenshots"
status: ready_to_implement
class: improvement
priority: MUST
owner: agent
depends_on: [FR-CMS-009]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-1, audit-B/finding-8-medium, audit-C/content-credibility, growth/PROOF-02]
---

# FR-CMS-011: Work-detail template that can carry proof: metrics band, client quote, screenshots

## 0. Why (evidence)

This is the #1 gap in all three audits. Case studies are anonymized ("a logistics client"), three short paragraphs each,
with no company name, no numbers, no screenshots, no quote. Audit A: best-in-class reads "reduced time-to-deploy from six
weeks to two days for a major global retailer"; CyberSkill reads "the operations team works from one live view". Audit C
calls named case studies with measurable results table stakes and the highest-impact conversion asset. The template must
exist before the content can land.

## 1. Description (normative)

- 1.1 The work-detail template SHALL support: client name or (under NDA) industry + size + region, the problem, the approach, the tech stack, a metrics band of 2-3 quantified outcomes with labels and units, a client quote with name/title/company, and screenshots.
- 1.2 Every block SHALL be optional at the type level and SHALL degrade gracefully, so an NDA case study renders without the client name and an un-quoted one renders without the quote - but a case study with zero quantified outcomes SHALL be labelled explicitly as an anonymized pattern, not presented as a client result.
- 1.3 Metrics SHALL carry a source note (measured how, over what period) held in the content module and visible on the page.
- 1.4 Screenshots SHALL be lazy-loaded, sized within the image budget, and carry alt text (FR-A11Y-013).
- 1.5 EN and VN ship together; category tags SHALL be localized (they are English on the VN pages today).

## 2. Acceptance criteria

- [ ] AC for 1.1 - a fully populated case study renders every block - test: `content/case-study-template`
- [ ] AC for 1.2 - an NDA case study renders without the name and without a broken layout - test: `content/case-study-template`
- [ ] AC for 1.3 - a case study with no metrics renders the 'anonymized pattern' label - test: `content/case-study-template`
- [ ] AC for 1.4 - each metric shows its source note - test: `content/case-study-template`
- [ ] AC for 1.5 - VN pages show localized category tags - test: `content/vi-parity`

## 3. Edge cases

- A metric with no baseline is not a metric - the type requires before/after or an absolute with a period.
- Screenshots may contain client data - they must be cleared (FR-BIZ-006).
- Image budget must hold with three screenshots per case study.

## 4. Out of scope / non-goals

- Obtaining the client permissions and numbers (FR-BIZ-006).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- No client name, logo, quote, photo or metric is published without recorded written permission.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
