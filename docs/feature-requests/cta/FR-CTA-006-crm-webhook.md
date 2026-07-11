---
id: FR-CTA-006
title: "Map form leads to a CRM via webhook"
module: CTA
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CTA-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Every valid lead MUST be deliverable to a CRM (HubSpot or Pipedrive) through a
server-side webhook, with a documented field mapping.

1. The route handler MUST POST a mapped payload to the CRM webhook on each valid
   submission; the call MUST run server-side only.
2. A field-mapping table MUST define how form fields (name, email, company,
   intent, message) map to CRM properties, including the default deal or contact
   owner and the lead source.
3. A failed CRM call MUST be logged and MUST NOT fail the user's submission, per
   the best-effort fan-out rule in FR-CTA-001.
4. The CRM endpoint and token MUST come from `process.env`; no secret may reach
   the client.

## §2 Acceptance

- A valid lead produces a CRM contact or deal with fields mapped per the table.
- A CRM outage returns 200 to the user and a logged server-side error.

## §3 Evidence

Not yet implemented; acceptance pending build.
