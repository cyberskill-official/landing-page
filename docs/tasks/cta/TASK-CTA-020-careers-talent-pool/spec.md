---
id: TASK-CTA-020
title: "Careers talent-pool email capture"
status: done
class: improvement
priority: COULD
owner: agent
depends_on: [TASK-CTA-014]
routed_back_count: 0
awh: N/A
traces_to: [growth/COPY-04]
---

# TASK-CTA-020: Careers talent-pool email capture

## 0. Why (evidence)

Recruiting is one of the site's three stated goals, and /careers currently offers no way to stay in touch when no role is open.

## 1. Description (normative)

- 1.1 The careers page SHALL offer a talent-pool capture (email, role interest, locale) reusing the subscribe API with a distinct audience tag.
- 1.2 It SHALL make the double opt-in and the retention period explicit, EN and VN.
- 1.3 Candidate data SHALL be deleted on request and after the stated retention period.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the capture works and tags the audience - test: `api/subscribe-audience-tag`
- [ ] AC for 1.2 - the retention statement renders, both locales - test: `content/careers-talent-pool`
- [ ] AC for 1.3 - a deletion request removes the record - test: `api/subscribe-unsubscribe`

## 3. Edge cases

- Candidate data is personal data under PDPL - the basis and retention must be stated at collection.

## 4. Out of scope / non-goals

- An applicant tracking system.

## 5. Protected invariants this task must not weaken

- Personal data is collected only with explicit, informed consent and a stated retention period (PDPL).
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
