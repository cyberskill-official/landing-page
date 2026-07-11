---
id: FR-CMS-003
title: "Complete Vietnamese localization with native-speaker review"
module: CMS
priority: MUST
status: ready_to_implement
class: product
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CMS-001]
blocks: []
source_pages:
  - "research doc §E (Vietnamese-first)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Every user-facing string MUST have a complete, correct Vietnamese value reviewed
by a native speaker before launch.

1. All UI labels, section copy, form fields, error messages, and metadata MUST
   resolve a Vietnamese value; a key present in English MUST be present in
   Vietnamese.
2. Vietnamese text MUST use correct diacritics and locale typography; no string
   may carry mojibake, stripped tone marks, or English punctuation conventions.
3. A native Vietnamese speaker MUST review the full set and sign off; placeholder
   or machine-only translations MUST NOT ship.
4. Locale-specific formats (dates, numbers, phone, address) MUST follow Vietnam
   conventions, with Ho Chi Minh City as the stated base.

## §2 Acceptance

- Switching to Vietnamese shows no English fallback on any route.
- A reviewer confirms diacritics and tone marks are correct site-wide.

## §3 Evidence

Not yet implemented; acceptance pending build.

## Addendum - 2026-07-11 audits

Audits A and C add three concrete VN defects this FR must close, on top of the
native-speaker pass already specified:

- The `/vi` routes serve the **English `<title>`** ("Turn Your Will Into Real - CyberSkill")
  while the H1 and description are translated. The title work itself is FR-SEO-011;
  this FR owns the Vietnamese copy it uses.
- The VN **stat-badge labels** differ from EN and are reordered.
- The case-study **category tags** ("Logistics operations", "Education", "Retail")
  remain in English on the VN pages (also FR-CMS-011 clause 1.5).
- Diacritic rendering in the kinetic type must be verified after FR-SEO-010 changes
  the word-splitting (migrated growth task PERF-04).

Traces: audit-A/section-6, audit-C/technical-seo-gaps, growth/PERF-04.
