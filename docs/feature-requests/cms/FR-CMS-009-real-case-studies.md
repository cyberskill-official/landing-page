---
id: FR-CMS-009
title: "Replace placeholder case studies with cleared real outcomes"
module: CMS
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-WEB-003, FR-CMS-001]
blocks: []
source_pages:
  - "research doc §C (information architecture), §F (trust)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Case studies MUST present real, cleared outcomes with real assets, replacing
every placeholder on the work pages built in FR-WEB-003.

1. Each case study MUST carry a real client context, the problem, the work done,
   and measurable outcomes; no invented metric may appear.
2. Logos, screenshots, and quotes MUST be used only with the client's written
   permission on file; uncleared assets MUST stay out of the build.
3. No placeholder case-study text or image may remain on any work/[slug] route.
4. Each case study MUST ship English and Vietnamese values for narrative fields,
   with the Vietnamese reviewed by a native speaker.

## §2 Acceptance

- Every work/[slug] page shows real context, work, and outcomes with clearance.
- No placeholder case-study content remains in the content source.

## §3 Evidence

Not yet implemented; acceptance pending build.

## Addendum - 2026-07-11 audits

This is the #1 gap in all three audits. Two requirements are tightened:

- A case study without **quantified outcomes** does not count as proof. Audit A's
  benchmark: "reduced time-to-deploy from six weeks to two days for a major global
  retailer" versus the current "the operations team works from one live view".
  Every published case study carries 2-3 numbers with units, a period, and a source
  note (measured how) - see FR-CMS-011 clauses 1.1 and 1.3.
- A case study that stays anonymized **must be labelled an anonymized pattern**, not
  presented as a client result (FR-CMS-011 clause 1.2).

The template is FR-CMS-011; the client permission and the numbers are FR-BIZ-006.

Traces: audit-A/phase-1-item-1, audit-B/finding-8-medium, audit-C/content-credibility.
