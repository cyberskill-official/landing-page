---
id: TASK-CTA-009
title: "Track form-start and abandonment events"
module: CTA
priority: COULD
status: done
class: product
verify: T
phase: P6
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-OPS-002]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The funnel MUST expose where leads drop off, so form friction can be found and fixed.

1. The form MUST emit a form-start event on first field interaction and a form-submit event on success, through the analytics layer from TASK-OPS-002.
2. An abandonment event MUST fire when a started form is left without submitting, and SHOULD record the last field reached.
3. No event may carry raw personal data (email, message body) or any secret; only field names and coarse state may be sent.
4. Events MUST respect the consent state; tracking MUST NOT run before consent is given.

## §2 Acceptance

- Starting then leaving the form produces start and abandonment events.
- No event payload contains the lead's email or message text.

## §3 Evidence

Shipped 2026-06-22 in `components/cta/LeadForm.tsx` via the TASK-OPS-002 analytics layer. `form_start` fires once on first field focus (form `onFocus` + a one-shot ref); `lead_submitted` fires on a successful POST; `lead_abandoned` fires from a `pagehide` listener and on unmount when the form was started but not submitted, de-duplicated by a ref so it sends at most once (clauses 1-2). Both new names are added to the `AnalyticsEvent` union and the `/api/analytics` allowlist. Every payload carries only `{ source }` and the event name, never the email or message body (clause 3). Verified: tsc clean, vitest 21/21, next lint clean, build green.

Two honest notes for the operator to confirm:
- Clause 2 "last field reached" is a SHOULD and is not yet recorded; only start/submit/abandon state is sent.
- Clause 4 (consent): these events are cookieless and carry no personal data, matching the anonymous first-party analytics described in the privacy notice, so they are treated as not requiring the lead-data consent checkbox (which governs processing of submitted contact details). If you want analytics gated behind an explicit tracking consent, that is a separate decision to make.
