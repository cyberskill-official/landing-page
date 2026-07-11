---
id: FR-CMS-012
title: "Testimonial component placed beside every major CTA"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: [FR-CMS-004, FR-BIZ-006]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-2, audit-A/section-9, audit-C/trust-table, growth/PROOF-03]
---

# FR-CMS-012: Testimonial component placed beside every major CTA

## 0. Why (evidence)

Audit A: testimonials can lift landing-page conversions by up to ~34% (SalesHive) and the high-converting pattern places
social proof next to the ask, not in the footer - CyberSkill has none to place. components/sections/SocialProof.tsx already
reads a `testimonials` array and falls back to first-person commitments when it is empty, so the component exists; what is
missing is real quotes and their placement beside the CTAs.

## 1. Description (normative)

- 1.1 A compact Testimonial component (quote, name, title, company, optional photo) SHALL render beside the hero CTA, the contact band and the services section, sourced from the typed testimonials array.
- 1.2 It SHALL render nothing at all when no cleared testimonial exists - never a placeholder, never a fabricated quote.
- 1.3 Quotes SHALL be shown in their original language with a translation line in the other locale.
- 1.4 Each testimonial SHALL carry a permission record reference in the content module (who approved it, when).

## 2. Acceptance criteria

- [ ] AC for 1.1 - with >= 1 cleared quote, it renders in all three placements - test: `content/testimonial-placement`
- [ ] AC for 1.2 - with zero quotes, no testimonial markup is emitted anywhere - test: `content/testimonial-placement`
- [ ] AC for 1.3 - the original language renders with the translation line - test: `content/testimonial-placement`
- [ ] AC for 1.4 - a testimonial without a permission reference fails the build - test: `content/testimonial-permission`

## 3. Edge cases

- More than three quotes: rotate, do not stack.
- A quote whose author later withdraws permission must be removable in one commit.

## 4. Out of scope / non-goals

- Collecting the quotes (FR-BIZ-006).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- No client name, logo, quote, photo or metric is published without recorded written permission.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
