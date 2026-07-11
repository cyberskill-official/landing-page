---
id: FR-CTA-004
title: "Progressive profiling across visits and steps"
module: CTA
priority: COULD
status: on_hold
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

The form MUST stay short on first contact and MAY ask for more detail on later
visits or later steps, never re-asking for what the lead already gave.

1. First contact MUST keep the five-field minimum from FR-CTA-001; richer fields
   (budget, timeline, team size) MUST be optional and MUST appear only after the
   minimum is satisfied.
2. A returning visitor MUST NOT be asked again for a field already on record; the
   form MUST pre-fill or skip known fields.
3. Profile state MUST persist client-side with explicit consent and MUST carry no
   secret; the server MUST treat every field as untrusted and re-validate.
4. Each extra prompt MUST ship English and Vietnamese copy (EN: "A few more
   details help us prepare." / VN: "Mot vai chi tiet giup chung toi chuan bi.").

## §2 Acceptance

- A first-time lead can submit with only the five base fields.
- A known lead sees prior answers pre-filled and is not asked twice.

## §3 Evidence

Not yet implemented; acceptance pending build.
