---
id: FR-SEO-013
title: "Replace non-descriptive link text ("Learn more") sitewide"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-10-medium, audit-B/phase-1]
---

# FR-SEO-013: Replace non-descriptive link text ("Learn more") sitewide

## 0. Why (evidence)

Audit B: three service links use the bare text "Learn more". Lighthouse flags it and it is the reason the SEO score is 92
rather than 100; it also weakens the link for screen-reader users navigating by link list.

## 1. Description (normative)

- 1.1 Every link SHALL have accessible text that identifies its destination out of context ("Learn more about web app development"), in EN and VN.
- 1.2 Where the visible text must stay short for layout, the link SHALL carry a visually hidden suffix rather than an aria-label that contradicts the visible text (WCAG 2.5.3).
- 1.3 The axe route check SHALL run the link-name rule and the Lighthouse SEO category SHALL reach 100 on mobile.

## 2. Acceptance criteria

- [ ] AC for 1.1 - no link's accessible name is a generic phrase from the blocklist - test: `a11y/link-name-quality`
- [ ] AC for 1.2 - the accessible name starts with the visible text where both exist - test: `check:a11y:routes`
- [ ] AC for 1.3 - Lighthouse mobile SEO = 100 - test: `lighthouse:mobile-seo`

## 3. Edge cases

- Icon-only links (social row, theme toggle) need names but no visible text - they are exempt from the prefix rule.
- Vietnamese link text must be idiomatic, not a literal translation.

## 4. Out of scope / non-goals

- Redesigning the service cards.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
