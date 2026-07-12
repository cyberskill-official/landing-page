---
id: FR-BIZ-009
title: "Lead system of record, SLA ritual, and the weekly funnel review"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: mixed
depends_on: [FR-BIZ-002, FR-OPS-011]
routed_back_count: 0
awh: N/A
traces_to: [growth/NURT-04, growth/MEAS-04, growth/NURT-03, audit-A/section-9]
---

# FR-BIZ-009: Lead system of record, SLA ritual, and the weekly funnel review

## 0. Why (evidence)

The site promises a reply within one business day. That promise is currently unmeasured and unowned. Audit A's conversion
review ("form starts vs completions") needs a weekly rhythm and a system of record, or the instrumentation in FR-OPS-011
produces numbers nobody reads.

## 1. Description (normative)

- 1.1 Every lead SHALL land in one system of record with a status (new, contacted, proposal, won, lost) and a next-action date; before CyberOS is live, a shared sheet with the same columns SHALL serve.
- 1.2 Intent SHALL route deterministically: project -> sales nurture, partnership -> partner track, role -> talent pool, other -> manual triage; the routing map SHALL be documented and the tag carried in the payload.
- 1.3 A weekly 15-minute review SHALL be run: leads by source, status moves, median first-reply time against the one-business-day promise, and one note on what changed.
- 1.4 The measured median first-reply time SHALL be the number the site is allowed to publish (FR-CMS-014); if it exceeds the promise, the promise changes, not the measurement.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every lead in the last month has a status and a next action - evidence: the record
- [ ] AC for 1.2 - the routing map is documented and the payload carries the track - test: `api/lead-intent-routing`
- [ ] AC for 1.3 - two consecutive weekly reviews are logged - test: `docs/funnel-log`
- [ ] AC for 1.4 - the median first-reply time is measured at least once - evidence: the log

## 3. Edge cases

- A lead that arrives on a Friday evening - the one-business-day clock must be defined precisely.
- A lead that arrives only by email because a sink failed (FR-OPS-010) must still enter the record.

## 4. Out of scope / non-goals

- Building the CRM (FR-BIZ-002).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- A published response-time promise must be backed by the measured number.
