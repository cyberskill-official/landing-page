---
id: FR-CMS-004
title: "Replace placeholder testimonials with cleared client quotes"
module: CMS
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CMS-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture), §F (trust)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Testimonials MUST be real, attributed, and cleared for use, replacing every
placeholder.

1. Each testimonial MUST carry a named person and role; logos MUST appear only
   where the client has granted permission.
2. No placeholder, invented, or unattributed quote may remain on any route.
3. Each quote MUST have written clearance on file before it ships; an uncleared
   quote MUST stay out of the build.
4. Quotes MUST ship in their original language with a Vietnamese or English
   translation as needed, and the displayed translation MUST be reviewed.

## §2 Acceptance

- Every visible testimonial has a name, a role, and recorded clearance.
- No placeholder testimonial text remains in the content source.

## §3 Evidence

Not yet implemented; acceptance pending build.

## Addendum - 2026-07-11 audits

All three audits rate the absence of testimonials as a top-three conversion gap
(audit A cites ~34% lift, SalesHive, and the "social proof next to the ask"
placement pattern). Two hard constraints are added:

- No quote may ship without a recorded written permission (name, title, company,
  photo where used). The permission record is obtained by **FR-BIZ-006** and
  referenced from the content module - see FR-CMS-012 clause 1.4.
- With zero cleared quotes, the site emits **no testimonial markup at all** - never
  a placeholder, never a paraphrase. FR-CMS-012 owns the component and its
  placement beside every major CTA.

Traces: audit-A/phase-1-item-2, audit-C/trust-table, growth/PROOF-01, growth/PROOF-03.
