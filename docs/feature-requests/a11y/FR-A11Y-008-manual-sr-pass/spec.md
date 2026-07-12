---
id: FR-A11Y-008
title: "Manual VoiceOver and NVDA screen-reader pass"
status: ready_to_implement
class: product
priority: SHOULD
owner: mixed
depends_on: [FR-A11Y-004]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-H, audit-C/responsiveness]
---

# FR-A11Y-008: Manual VoiceOver and NVDA screen-reader pass

## 0. Why (evidence)

Research doc §H. Automated checks (axe, Lighthouse) cannot hear what a screen reader says. Audit C independently notes
that its browser tool clamped the viewport and could not exercise real assistive technology, and recommends the pass.

## 1. Description (normative)

- 1.1 A manual pass SHALL run with VoiceOver and with NVDA across the home page, /work, /careers, /team and the chat widget, in both locales.
- 1.2 The pass SHALL follow a written checklist stored in the repository covering landmarks, heading order, link and button names, form labels and errors, and live-region announcements.
- 1.3 Each finding SHALL be logged with the route, the tool, the observed behaviour and the expected behaviour, and tracked to a fix or an FR.
- 1.4 The checklist and its results SHALL live in docs/a11y/ so a later run repeats the same steps and the delta is visible.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a dated report exists covering all five surfaces on both tools, both locales - test: `docs/screen-reader-report`
- [ ] AC for 1.2 - the checklist exists and every item has a recorded result - test: `docs/screen-reader-report`
- [ ] AC for 1.3 - every finding carries route, tool, observed and expected - test: `docs/screen-reader-report`
- [ ] AC for 1.4 - a second run can be diffed against the first - test: `docs/screen-reader-report`

## 3. Edge cases

- The streaming chat's live region is the hardest surface - it must announce without flooding.
- Vietnamese content read by an English-voice screen reader: the lang attributes must switch the voice.

## 4. Out of scope / non-goals

- Fixing what the pass finds - each finding becomes its own FR or a fix in the owning FR.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
