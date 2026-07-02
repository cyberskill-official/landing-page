---
id: FR-CHAR-026
title: "Conversational lead-capture sequence, value-first, with ICP qualification and a LEAD_CAPTURED state"
module: CHAR
priority: SHOULD
status: planned
verify: T
phase: P2
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-011]
related_frs: [FR-CHAR-027, FR-CHAR-028, FR-CTA-001]
source_pages:
  - "research doc §I (conversational Genie), §O (lead capture + qualification)"
---

## §1 Requirement (BCP-14 normative)

Lumi SHOULD capture a qualified lead through conversation, value first.

1. Lumi MUST give useful help before asking for details, then gather them in
   order: name, need, company, budget or timeline, email.
2. Each step MUST be a single conversational ask; the sequence MUST tolerate
   out-of-order answers and skipped fields without breaking.
3. Lumi MUST qualify against the ICP and MUST adapt follow-ups to the answers,
   not read a rigid script.
4. On a complete enough lead, the genie store MUST enter a `LEAD_CAPTURED`
   state holding the collected fields for downstream handoff.

## §2 Acceptance

- Lumi helps first, then collects the fields conversationally.
- Out-of-order or partial answers are handled without a dead end.
- A qualified lead sets `LEAD_CAPTURED` with the gathered fields.

## §3 Evidence

Not yet implemented; acceptance pending build.

Down-payment (2026-07-02): FR-CHAR-031 shipped the deterministic in-chat
wish flow - name/email/company/message/consent collected conversationally
with skips and explicit consent, submitting to /api/lead and celebrating
via the mascot. What keeps THIS FR planned: value-first help before the
ask, tolerance for out-of-order free-form answers, ICP-adaptive follow-ups
(needs the AI path plus agreed qualification criteria), and the formal
LEAD_CAPTURED store state for downstream handoff (FR-CHAR-027).
