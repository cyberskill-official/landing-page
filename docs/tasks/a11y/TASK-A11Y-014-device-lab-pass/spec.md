---
id: TASK-A11Y-014
title: "On-device responsiveness and contrast verification pass"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: mixed
depends_on: [TASK-A11Y-011, TASK-A11Y-012]
routed_back_count: 0
awh: N/A
traces_to: [audit-C/responsiveness, audit-C/phase-2, audit-A/section-5]
---

# TASK-A11Y-014: On-device responsiveness and contrast verification pass

## 0. Why (evidence)

Audit C states plainly that its browser tool clamped the render viewport near 1406px, so true phone and tablet
rendering was never exercised; audit A likewise could not pixel-test touch targets or 320px behaviour. Both name an
on-device pass as the way to close the verification gap. Audit C also asks for a WCAG AA contrast check on the muted
labels and the gold-on-dark micro-labels, which the automated APCA script may not cover.

## 1. Description (normative)

- 1.1 The site SHALL be exercised on at least one real Android phone, one real iPhone and one tablet, at 320px, 360px, 390px and 768px, on both locales and every route.
- 1.2 Keyboard-only navigation and one screen-reader pass (VoiceOver or NVDA) SHALL be run on the same builds.
- 1.3 The muted body labels and the gold-on-dark micro-labels SHALL be measured against WCAG 2.2 AA contrast and recorded, with any failure fixed via the design tokens.
- 1.4 The findings SHALL be recorded in docs/verification/ with device, OS, browser version and a pass/fail per route.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a dated device-matrix report exists with per-route results - test: `docs/device-lab-report`
- [ ] AC for 1.2 - keyboard and SR findings recorded with fixes or tickets - test: `docs/device-lab-report`
- [ ] AC for 1.3 - every text/background pair meets AA or is fixed in tokens - test: `check:apca`
- [ ] AC for 1.4 - no route reports a blocking failure at 320px - test: `docs/device-lab-report`

## 3. Edge cases

- Low-end Android with a weak GPU: the scene must degrade to the poster.
- iOS Safari safe-area and 100vh quirks.

## 4. Out of scope / non-goals

- Buying a device lab; a borrowed-device pass is acceptable if recorded.

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.3 progressive enhancement: the 3D scene stays code-split, gated, and ships with its static poster fallback.
