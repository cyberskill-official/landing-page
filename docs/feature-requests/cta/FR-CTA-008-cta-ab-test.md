---
id: FR-CTA-008
title: "A/B testbed for first-person CTA copy"
module: CTA
priority: COULD
status: on_hold
class: product
verify: T
phase: P6
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

CTA copy MUST be testable across variants with conversion attributed back to the
variant that produced the lead.

1. The system MUST support at least two CTA copy variants (for example "Start my
   project" versus "Talk to an engineer") and MUST assign a visitor to one
   variant stably across the session.
2. Each lead MUST record the variant it came from so conversion can be attributed
   per variant.
3. Variant assignment MUST NOT block first paint and MUST degrade to the default
   copy if the assignment fails.
4. Every variant MUST ship English and Vietnamese copy, and a variant present in
   one locale MUST be present in the other.

## §2 Acceptance

- A visitor sees one stable variant for the session.
- A submitted lead carries the variant identifier for attribution.

## §3 Evidence

Not yet implemented; acceptance pending build.
