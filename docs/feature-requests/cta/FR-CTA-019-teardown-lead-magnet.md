---
id: FR-CTA-019
title: "Teardown lead magnet funnel"
status: ready_to_implement
class: improvement
priority: COULD
owner: mixed
depends_on: [FR-CTA-014]
routed_back_count: 0
awh: N/A
traces_to: [growth/NURT-08]
---

# FR-CTA-019: Teardown lead magnet funnel

## 0. Why (evidence)

"A 15-point teardown of your website or internal tool, free, in 3 business days" converts qualified buyers and productizes
work the team already does one-off - including the very audits this backlog is built from.

## 1. Description (normative)

- 1.1 A landing section (or page) SHALL present the offer, EN and VN, with a dedicated form (email, URL, context) posting to /api/lead with source "teardown".
- 1.2 Submissions SHALL be capped by a configurable weekly volume; beyond the cap the form SHALL say so honestly rather than accept work that will not be done.
- 1.3 The delivered teardown SHALL be emailed as a PDF and the funnel SHALL be tracked end to end.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the form posts with source teardown and validates - test: `api/lead-validation`
- [ ] AC for 1.2 - beyond the weekly cap the form shows the honest closed state - test: `cta/teardown-cap`
- [ ] AC for 1.3 - the funnel events fire (start, submit, delivered) - test: `analytics/both-lead-paths`

## 3. Edge cases

- A submitted URL that is unreachable or hostile.
- The cap must reset on schedule.

## 4. Out of scope / non-goals

- Doing the teardowns.

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- A promise of delivery in N days is only made when the capacity to keep it exists.
