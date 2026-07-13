---
id: FR-OPS-005
title: "Lead and transcript datastore behind /api/lead and /api/genie"
status: ready_to_review
class: product
priority: SHOULD
owner: agent
depends_on: [FR-OPS-004]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-O, growth/LEAD-02, audit-A/section-9]
---

# FR-OPS-005: Lead and transcript datastore behind /api/lead and /api/genie

## 0. Why (evidence)

Research doc §O. Today a lead exists as an email and a Slack ping; a chat transcript exists nowhere. Audit A's conversion
review ("form starts vs completions") and FR-BIZ-009's SLA ritual both need a queryable store. CyberOS is the intended
system of record (FR-BIZ-002) - this FR is the repo-side persistence contract, whether the store is CyberOS or a managed
database.

## 1. Description (normative)

- 1.1 A managed datastore SHALL persist every lead submission received by `/api/lead`, with its locale, source, intent and UTM context.
- 1.2 The same datastore SHALL persist Genie chat transcripts received by `/api/genie`, linked to a lead where one exists (FR-CHAR-028).
- 1.3 The schema SHALL be version-controlled in the repo so the data model changes only through a reviewed diff.
- 1.4 Personal data SHALL carry a retention date and SHALL be deleted when it passes, and a deletion request SHALL remove the record (PDPL right to erasure).
- 1.5 Without a configured datastore the persistence layer SHALL no-op safely behind the FR-OPS-010 alert rather than failing the visitor's request; provisioning the datastore is the operator's step.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a submission to /api/lead is stored and retrievable with all its context - test: `db/lead-persist`
- [ ] AC for 1.2 - a Genie conversation is stored and linkable to its lead - test: `db/transcript-link`
- [ ] AC for 1.3 - the schema lives in the repo and a migration is required to change it - test: `db/schema-versioned`
- [ ] AC for 1.4 - a record past retention is deleted, and a deletion request removes it - test: `db/retention-and-erasure`
- [ ] AC for 1.5 - with no store configured, a lead is still accepted and the zero-sinks alert fires - test: `db/no-store-noop`

## 3. Edge cases

- The store being down must not fail the visitor's submission - persistence is best-effort behind the alert (FR-OPS-010).
- A transcript can contain personal data the visitor typed about a third party.

## 4. Out of scope / non-goals

- Provisioning the database (operator step, via FR-BIZ-002 or a managed DB).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.2: every secret lives only in server env; no NEXT_PUBLIC_ secret, ever (NFR-SEC-001).
- A submitted lead is never silently lost.
- Personal data is stored only with a lawful basis and a bounded retention period (PDPL).
