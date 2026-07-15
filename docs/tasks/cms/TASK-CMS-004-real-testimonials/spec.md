---
id: TASK-CMS-004
title: "Replace placeholder testimonials with cleared client quotes"
status: ready_to_implement
class: product
priority: SHOULD
owner: mixed
depends_on: [TASK-BIZ-006, TASK-CMS-012, TASK-OPS-019]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-2, audit-C/trust-table, growth/PROOF-01]
---

# TASK-CMS-004: Replace placeholder testimonials with cleared client quotes

## 0. Why (evidence)

All three audits rate the absence of testimonials as a top-three conversion gap; audit A cites a ~34% lift (SalesHive) and
the pattern of placing social proof next to the ask. components/sections/SocialProof.tsx already reads a `testimonials`
array and falls back to first-person commitments when it is empty - so the component is not the gap. The quotes are.

## 1. Description (normative)

- 1.1 Each testimonial SHALL carry a named person, their role and their company; a logo SHALL appear only where that client granted permission.
- 1.2 No placeholder, invented, paraphrased or unattributed quote SHALL exist on any route or in the content source (git module **or** CyberOS-published entities via TASK-OPS-019).
- 1.3 Each quote SHALL have a written permission record on file, referenced from the content source (module and/or CyberOS content meta after TASK-OPS-019), before it ships; an uncleared quote SHALL be impossible to render.
- 1.4 Quotes SHALL ship in their original language with a reviewed translation line in the other locale.
- 1.5 With zero cleared quotes the site SHALL emit no testimonial markup at all.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every rendered quote has name, role and company - test: `content/testimonial-shape`
- [ ] AC for 1.2 - no placeholder quote string exists in the content source - test: `content/no-placeholders`
- [ ] AC for 1.3 - a quote without a permission reference fails the build - test: `content/testimonial-permission`
- [ ] AC for 1.4 - the original language renders with the translation line - test: `content/testimonial-placement`
- [ ] AC for 1.5 - with an empty testimonials array, no testimonial markup is emitted - test: `content/testimonial-placement`

## 3. Edge cases

- A client who permits the quote but not the logo.
- A permission later withdrawn must be removable in one commit.

## 4. Out of scope / non-goals

- Obtaining the quotes (TASK-BIZ-006).
- Placement beside the CTAs (TASK-CMS-012).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- No client name, logo, quote, photo or metric is published without recorded written permission.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
