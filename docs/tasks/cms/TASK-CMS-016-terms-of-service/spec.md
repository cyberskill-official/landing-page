---
id: TASK-CMS-016
title: "Publish a Terms of Service page"
status: done
class: improvement
priority: SHOULD
owner: mixed
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/section-8]
---

# TASK-CMS-016: Publish a Terms of Service page

## 0. Why (evidence)

Audit A: only Privacy and Accessibility appear in the footer; a Terms of Service is absent, and it is an enterprise
procurement checklist item.

## 1. Description (normative)

- 1.1 A /[lang]/terms route SHALL exist, be indexable, appear in the footer and the sitemap, and carry a last-updated date.
- 1.2 It SHALL cover at minimum: who the contracting entity is, site use, intellectual property, the Lumi chat's terms (including the cross-border transfer to Anthropic), limitation of liability, and governing law.
- 1.3 It SHALL ship EN and VN, and SHALL be reviewed by the owner (and counsel where the clauses bind) before publication.

## 2. Acceptance criteria

- [x] AC for 1.1 - the route renders, is in the footer and the sitemap - test: `routes/terms-page`
- [x] AC for 1.2 - every required section is present, both locales - test: `content/terms-shape`
- [x] AC for 1.3 - the page carries a real last-updated date - test: `content/terms-shape`

## 3. Edge cases

- A machine-drafted legal page is a liability - it must be marked for owner review before it ships.
- The chat terms must match what TASK-OPS-013 discloses in-product.

## 4. Out of scope / non-goals

- Legal counsel review (TASK-BIZ-012).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
