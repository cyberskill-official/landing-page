---
id: FR-CHAR-027
title: "On LEAD_CAPTURED, write the lead to CRM and fire a Slack/email notification with the transcript"
module: CHAR
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-026]
related_frs: [FR-CHAR-028, FR-CTA-001]
source_pages:
  - "research doc §O (lead capture + qualification), §G (secrets + privacy)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

A captured lead MUST reach the team promptly and reliably.

1. On `LEAD_CAPTURED` (FR-CHAR-026) the server MUST write the lead to the CRM
   of record with the collected fields.
2. The server MUST fire a Slack or email notification that includes the
   conversation transcript so the team has full context.
3. All CRM and notification credentials MUST be read server-side only and MUST
   NOT be exposed to the client.
4. A delivery failure MUST be logged and retried best-effort, and MUST NOT lose
   the lead silently or break the chat.

## §2 Acceptance

- A captured lead appears in the CRM with its fields.
- The team receives a Slack or email alert with the transcript.
- A simulated delivery failure is logged and does not drop the lead.

## §3 Evidence

Not yet implemented; acceptance pending build.
