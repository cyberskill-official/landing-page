---
id: TASK-A11Y-012
title: "Contain the persistent CTA bar in a landmark and keep it clear of content on mobile"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-5-medium, audit-B/phase-1, growth/CONV-08]
---

# TASK-A11Y-012: Contain the persistent CTA bar in a landmark and keep it clear of content on mobile

## 0. Why (evidence)

Audit B: the floating "Start my project" / "Talk to Lumi" bar covers body text on most mobile sections, and axe flags it as content not contained by a landmark region. The growth backlog independently asked for a mobile CTA audit across every chapter, including the 11,808px-tall home page and the /vi routes.

## 1. Description (normative)

- 1.1 The persistent CTA (components/cta/PersistentCta.tsx) SHALL be wrapped in a labelled landmark (e.g. `<aside aria-label="Primary actions">` or a complementary region) so assistive technology can find and skip it.
- 1.2 On viewports below 768px the bar SHALL collapse to one compact action and SHALL NOT overlap body text at any scroll position on any route, in either locale.
- 1.3 The bar SHALL respect the safe-area insets on notched devices and SHALL NOT collide with the chapter rail.
- 1.4 Content SHALL keep its own bottom padding equal to the bar's height so the last line of every section stays readable.

## 2. Acceptance criteria

- [ ] AC for 1.1 - axe reports zero region violations on every route - test: `check:a11y:routes`
- [ ] AC for 1.2 - at 360px and 390px, no text node intersects the bar's box at any chapter, EN and VN - test: `a11y/cta-overlap-scan`
- [ ] AC for 1.3 - safe-area insets applied; no overlap with the rail - test: `a11y/cta-overlap-scan`
- [ ] AC for 1.4 - the bottom spacer exists on every route - test: `a11y/cta-overlap-scan`

## 3. Edge cases

- Long work-detail pages and the /lite route.
- Keyboard focus order: the bar must not trap focus.
- Landscape phones where vertical space is scarce.

## 4. Out of scope / non-goals

- Changing the CTA copy (TASK-CTA-015).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
