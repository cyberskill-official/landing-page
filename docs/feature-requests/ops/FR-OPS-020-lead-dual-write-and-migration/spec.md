---
id: FR-OPS-020
title: "Lead dual-write to CyberOS and historical migration"
status: draft
class: improvement
priority: MUST
owner: mixed
depends_on: [FR-BIZ-002, FR-OPS-005]
routed_back_count: 0
awh: N/A
traces_to: [docs/architecture/cyberos-central-data-source, growth/LEAD-02, FR-BIZ-009]
---

# FR-OPS-020: Lead dual-write to CyberOS and historical migration

## 0. Why (evidence)

`/api/lead` already best-effort fans out to CyberOS when `LEAD_CRM_WEBHOOK_URL` is set and also persists via `lib/db` (InMemory/Prisma). Without an explicit dual-write + migration FR, historical local leads never enter CyberOS and operators may treat Prisma as a second CRM.

## 1. Description (normative)

- 1.1 On every accepted lead, the handler SHALL attempt CyberOS intake as the **primary SoR write**; local `DbAdapter.saveLead` remains best-effort durability and must not replace CyberOS when both are configured.
- 1.2 CyberOS failure SHALL NOT fail the visitor response when another ack path succeeded; FR-OPS-010 style alerts SHALL fire.
- 1.3 A documented one-time migration SHALL export historical local leads (and linkable transcripts where present) into CyberOS without duplicating already-synced ids.
- 1.4 Intent, source, locale, and UTM fields SHALL survive dual-write unchanged (FR-OPS-011 / FR-CTA-006 mapping).

## 2. Acceptance criteria

- [ ] AC for 1.1 - with both CyberOS and DB configured, both receive the lead - test: `lead/dual-write`
- [ ] AC for 1.2 - CyberOS 5xx still returns ok to the visitor when validation passed - test: `lead/cyberos-outage-failopen`
- [ ] AC for 1.3 - migration script or runbook processes a fixture set idempotently - evidence: docs + dry-run log
- [ ] AC for 1.4 - CRM mapped payload equals submitted intent/source/locale/utm - test: `api/lead-intent-routing`

## 3. Edge cases

- Partial transcript already in local DB before CyberOS existed.
- Replayed migration must not create duplicate CyberOS contacts.

## 4. Out of scope / non-goals

- Building CyberOS UI for SLA (FR-BIZ-009).
- Content read model (FR-OPS-019).

## 5. Protected invariants this FR must not weaken

- A submitted lead is never silently lost.
- Secrets only in server env.
