---
id: TASK-CMS-019
title: "Partnership offer for agencies and studios abroad"
status: done
class: improvement
priority: COULD
owner: mixed
depends_on: [TASK-BIZ-013]
routed_back_count: 0
awh: N/A
traces_to: [growth/COPY-05, audit-C/closing-note]
---

# TASK-CMS-019: Partnership offer for agencies and studios abroad

## 0. Why (evidence)

The stated business goal is scaling globally and building relationships with new clients and partners; the site speaks only
to direct clients. Agencies and studios abroad are a distinct buyer with a distinct ask (capacity, senior engineers, NDA
comfort, time-zone overlap).

## 1. Description (normative)

- 1.1 A partnership section (or page) SHALL address agencies and studios: what CyberSkill takes on as a partner, how white-label engagements work, time-zone overlap, NDA and IP posture, and how to start.
- 1.2 It SHALL route enquiries through /api/lead with intent "partnership" and be tagged for the partner track (TASK-BIZ-009).
- 1.3 The offer SHALL be owner-approved before it ships; EN and VN together.

## 2. Acceptance criteria

- [x] AC for 1.1 - the section renders every named element, both locales - test: `content/partnership-shape`
- [x] AC for 1.2 - the enquiry carries intent=partnership through to the CRM payload - test: `api/lead-intent-routing`
- [x] AC for 1.3 - no unapproved commitment ships - test: `content/no-placeholders`

## 3. Edge cases

- A partner enquiry must not land in the same triage queue as a direct client without a tag.

## 4. Out of scope / non-goals

- Outbound partner prospecting.

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
