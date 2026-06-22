---
id: FR-CMS-003
title: "Complete Vietnamese localization with native-speaker review"
module: CMS
priority: MUST
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CMS-001]
blocks: []
source_pages:
  - "research doc §E (Vietnamese-first)"
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
