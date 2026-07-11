---
id: FR-CMS-003
title: "Complete Vietnamese localization with native-speaker review"
status: ready_to_implement
class: product
priority: MUST
owner: mixed
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-D, audit-A/section-6, audit-C/technical-seo-gaps, growth/PERF-04]
---

# FR-CMS-003: Complete Vietnamese localization with native-speaker review

## 0. Why (evidence)

Research doc §D, plus three concrete defects the 2026-07-11 audits found:

- The `/vi` routes serve the English `<title>` ("Turn Your Will Into Real - CyberSkill") while the H1 and description are
  translated. The title mechanism is FR-SEO-011; this FR owns the Vietnamese copy it uses.
- The VN stat-badge labels differ from the EN ones and are reordered.
- The case-study category tags ("Logistics operations", "Education", "Retail") stay in English on the VN pages.

Vietnamese-first is a stated non-negotiable (AGENTS.md §4.5), and Vietnam is the home market: a half-translated VN site is
worse than an English-only one.

## 1. Description (normative)

- 1.1 Every user-facing string SHALL resolve a Vietnamese value: a key present in English SHALL be present in Vietnamese, and a missing key SHALL fail the build, not fall back silently.
- 1.2 Vietnamese text SHALL carry correct diacritics and locale typography; no string may ship with mojibake, stripped tone marks or English punctuation conventions - including inside the kinetic type after FR-SEO-010 changes the word splitting.
- 1.3 A native Vietnamese speaker SHALL review the full set and record sign-off; machine-only or placeholder translations SHALL NOT ship.
- 1.4 Locale-specific formats (dates, numbers, phone, address) SHALL follow Vietnamese conventions, with Ho Chi Minh City as the stated base.
- 1.5 The three known defects SHALL be closed: VN page titles, VN stat-badge labels and order, and VN case-study category tags.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a missing VN key fails the build - test: `content/vi-key-parity`
- [ ] AC for 1.2 - every VN string renders with correct diacritics, including in kinetic headings - test: `content/vi-diacritics`
- [ ] AC for 1.3 - a dated native-speaker sign-off is recorded in the repo - test: `docs/vi-review-signoff`
- [ ] AC for 1.4 - dates, numbers and phone render in VN conventions on the VN routes - test: `content/vi-formats`
- [ ] AC for 1.5 - VN titles, stat badges and category tags are Vietnamese - test: `content/vi-parity`

## 3. Edge cases

- Vietnamese is longer than English - layouts must not break at 320px with the VN copy.
- A string that is legitimately identical in both locales (a brand name) must not be flagged as untranslated.
- The kinetic word-splitter must not break a diacritic across spans.

## 4. Out of scope / non-goals

- The title mechanism itself (FR-SEO-011).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
