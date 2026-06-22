---
id: FR-CTA-009
title: "Track form-start and abandonment events"
module: CTA
priority: COULD
status: planned
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-OPS-002]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
---

## §1 Requirement (BCP-14 normative)

The funnel MUST expose where leads drop off, so form friction can be found and
fixed.

1. The form MUST emit a form-start event on first field interaction and a
   form-submit event on success, through the analytics layer from FR-OPS-002.
2. An abandonment event MUST fire when a started form is left without submitting,
   and SHOULD record the last field reached.
3. No event may carry raw personal data (email, message body) or any secret; only
   field names and coarse state may be sent.
4. Events MUST respect the consent state; tracking MUST NOT run before consent is
   given.

## §2 Acceptance

- Starting then leaving the form produces start and abandonment events.
- No event payload contains the lead's email or message text.

## §3 Evidence

Not yet implemented; acceptance pending build.
