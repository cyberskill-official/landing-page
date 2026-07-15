---
id: TASK-CTA-015
title: "Outcome-led CTA promise instead of an action label"
status: done
class: improvement
priority: SHOULD
owner: mixed
depends_on: [TASK-BIZ-013]
routed_back_count: 0
awh: N/A
traces_to: [growth/CONV-01, audit-A/section-9]
---

# TASK-CTA-015: Outcome-led CTA promise instead of an action label

## 0. Why (evidence)

"Start my project" names an action; a result ("Get a scoped build plan within 3 business days") converts better and is
testable. Audit A rates the positioning as strong in voice but weak in evidence - a concrete, kept promise is evidence.

## 1. Description (normative)

- 1.1 The hero and contact-band CTAs SHALL carry the owner-approved outcome promise, EN and VN, sourced from the dictionaries.
- 1.2 The promise SHALL be a real commitment the company can keep; it SHALL NOT ship until approved (TASK-BIZ-013).
- 1.3 Every CTA click SHALL emit cta_clicked with its location so variants can be compared later.
- 1.4 The previous strings SHALL remain in the dictionary history so a rollback is one commit.

## 2. Acceptance criteria

- [x] AC for 1.1 - both locales render the approved promise - test: `content/cta-copy`
- [x] AC for 1.2 - no unapproved promise string exists in the build - test: `content/no-placeholders`
- [x] AC for 1.3 - clicks carry the location - test: `analytics/both-lead-paths`
- [x] AC for 1.4 - the previous CTA strings remain retrievable from the dictionary history, so a rollback is one commit - test: `content/cta-copy`

## 3. Edge cases

- A promise the company cannot keep is worse than a weak label - the gate in 1.2 exists for that.
- Vietnamese phrasing must be a native promise, not a translated slogan.

## 4. Out of scope / non-goals

- A/B testing infrastructure (TASK-CTA-008, on hold).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
