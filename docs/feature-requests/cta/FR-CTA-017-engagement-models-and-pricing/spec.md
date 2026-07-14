---
id: FR-CTA-017
title: "Engagement models and price signals section"
status: done
class: improvement
priority: SHOULD
owner: mixed
depends_on: [FR-BIZ-013]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-2-item-9, audit-C/content-credibility, audit-C/phase-2, growth/CONV-06]
---

# FR-CTA-017: Engagement models and price signals section

## 0. Why (evidence)

All three audits name the same missing page: there is no stated engagement model or pricing signal. Audit C: strong
boutiques publish engagement types, a typical project size or a rate range to pre-qualify leads and reduce friction; audit A
notes buyers shortlist on this and competitors show it. Price is the question every visitor has and never asks.

## 1. Description (normative)

- 1.1 A section (and a linked page where depth warrants) SHALL present the engagement models the company actually offers - fixed-scope project, monthly product team, support retainer - each with: what it is, what it fits, a typical starting range, a typical timeline, and a CTA.
- 1.2 The ranges and timelines SHALL be the owner-approved values (FR-BIZ-013); the section SHALL NOT ship with placeholder numbers.
- 1.3 It SHALL be linked from the services pages and reflected in the FAQ (FR-SEO-020).
- 1.4 The section SHALL ship EN and VN in the same commit.

## 2. Acceptance criteria

- [x] AC for 1.1 - three model cards render with all five fields, both locales - test: `content/engagement-models`
- [x] AC for 1.2 - no FOR REVIEW or placeholder range reaches production - test: `content/no-placeholders`
- [x] AC for 1.3 - service pages and FAQ link to it - test: `content/engagement-models`
- [x] AC for 1.4 - both locales render in the same commit; no EN-only card ships - test: `content/engagement-models`

## 3. Edge cases

- Publishing a range is a commercial commitment - it must be reviewed before every change.
- A range that is too wide signals nothing; too narrow constrains the sale.

## 4. Out of scope / non-goals

- Publishing a full rate card.

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
