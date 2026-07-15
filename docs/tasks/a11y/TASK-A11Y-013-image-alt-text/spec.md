---
id: TASK-A11Y-013
title: "Give the logo and every content image meaningful alt text"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/on-page-seo, audit-C/phase-1, audit-A/section-1]
---

# TASK-A11Y-013: Give the logo and every content image meaningful alt text

## 0. Why (evidence)

Audit C: only two image elements exist on the home page and both lack alt text. Most visuals are CSS or WebGL so the
exposure is small, but the logo and any content image must carry meaningful alternatives - audit A adds that decorative
Lumi/aurora images correctly declare themselves decorative but the brand and work images forfeit image-search value.

## 1. Description (normative)

- 1.1 Every <img>/next/image that conveys meaning SHALL carry descriptive alt text in the active locale; purely decorative images SHALL carry `alt=""` and `aria-hidden`.
- 1.2 Alt strings SHALL live in the locale dictionaries, never hardcoded in components.
- 1.3 The axe route check SHALL fail on any image-alt violation.

## 2. Acceptance criteria

- [ ] AC for 1.1 - zero image-alt violations across all routes, EN and VN - test: `check:a11y:routes`
- [ ] AC for 1.2 - no alt string literal appears in a component file - test: `lint/no-hardcoded-alt`
- [ ] AC for 1.3 - a seeded missing alt fails CI - test: `check:a11y:routes`

## 3. Edge cases

- Work thumbnails once real screenshots land (TASK-CMS-011).
- Client logos (TASK-CMS-013) need the company name as alt.

## 4. Out of scope / non-goals

- Adding new imagery.

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
