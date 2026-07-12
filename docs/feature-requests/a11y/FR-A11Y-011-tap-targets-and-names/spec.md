---
id: FR-A11Y-011
title: "Meet 44px tap targets and align the wordmark's accessible name with its visible text"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-14-low, audit-B/phase-1]
---

# FR-A11Y-011: Meet 44px tap targets and align the wordmark's accessible name with its visible text

## 0. Why (evidence)

Audit B (axe + Lighthouse, mobile): eighteen interactive elements are smaller than 44x44 px - mostly header icons and
the chapter-rail timeline dots - and the wordmark link's accessible name ("CyberSkill home") does not contain its visible
text, which breaks WCAG 2.5.3 Label in Name and confuses voice control.

## 1. Description (normative)

- 1.1 Every interactive control SHALL present a hit area of at least 44x44 CSS px on viewports below 768px (padding or a pseudo-element may supply it without changing the visual size).
- 1.2 The wordmark link's accessible name SHALL begin with its visible text ("CyberSkill"), e.g. `aria-label="CyberSkill - home"` or a visually hidden suffix.
- 1.3 The axe route check (scripts/axe-routes.mjs) SHALL run the target-size and label-in-name rules and fail on violation.

## 2. Acceptance criteria

- [ ] AC for 1.1 - zero target-size violations at 390px across all routes, EN and VN - test: `check:a11y:routes`
- [ ] AC for 1.2 - the wordmark passes label-in-name - test: `check:a11y:routes`
- [ ] AC for 1.3 - a seeded 24px control fails the check - test: `check:a11y:routes`

## 3. Edge cases

- The chapter rail dots are decorative-ish but focusable - either enlarge them or remove them from the tab order deliberately.
- Theme and language toggles sit in a tight header - enlarging must not break the layout at 320px.

## 4. Out of scope / non-goals

- Redesigning the header.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.6 token discipline: colours derive from --cs-* custom properties, no magic hex.
