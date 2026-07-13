---
id: FR-CTA-006
title: "Map form leads to the CRM via a server-side webhook"
status: ready_to_review
class: product
priority: SHOULD
owner: agent
depends_on: [FR-OPS-010]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-O, growth/LEAD-02]
---

# FR-CTA-006: Map form leads to the CRM via a server-side webhook

## 0. Why (evidence)

Research doc §O. app/api/lead/route.ts already fans out to a CRM webhook URL, but there is no documented field mapping and
no test that the mapping survives the hop - so a schema change on either side would break the pipeline silently. FR-BIZ-002
provides the endpoint; FR-OPS-010 provides the alert when the hop fails.

## 1. Description (normative)

- 1.1 The route handler SHALL POST a mapped payload to the CRM webhook on every valid submission, server-side only.
- 1.2 A field-mapping table SHALL be recorded in the repo, defining how each form field (name, email, company, intent, message, locale, source, utm_*) maps to a CRM property, including the default owner and the lead source.
- 1.3 A failed CRM call SHALL be logged and SHALL NOT fail the visitor's submission (best-effort fan-out), but SHALL count toward the total-failure alert in FR-OPS-010.
- 1.4 The CRM endpoint and token SHALL come from server env; no secret SHALL reach the client.
- 1.5 Without the CRM env vars the webhook sink SHALL be skipped (not failed), and the mapping SHALL still be unit-tested against a mock so a schema drift is caught before the endpoint exists.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a valid lead produces a CRM record with every mapped field - test: `api/lead-crm-mapping`
- [ ] AC for 1.2 - the mapping table exists and the test asserts it field by field - test: `api/lead-crm-mapping`
- [ ] AC for 1.3 - a CRM outage returns 200 to the visitor, logs the error and counts toward the alert - test: `lead/total-failure-alert`
- [ ] AC for 1.4 - no CRM credential appears in the client bundle - test: `ci/no-public-secrets`
- [ ] AC for 1.5 - with no CRM env, the lead is accepted, no call is attempted, and the mapping test still runs against the mock - test: `api/lead-crm-mapping`

## 3. Edge cases

- A CRM schema change must fail the mapping test, not silently drop a field.
- A duplicate submission must not create two records.

## 4. Out of scope / non-goals

- Deploying the CRM endpoint (FR-BIZ-002).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.2: every secret lives only in server env; no NEXT_PUBLIC_ secret, ever (NFR-SEC-001).
- A submitted lead is never silently lost.
