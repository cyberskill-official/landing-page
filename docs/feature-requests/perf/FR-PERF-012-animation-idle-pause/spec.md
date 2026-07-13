---
id: FR-PERF-012
title: "Pause off-screen and idle animation to protect INP and battery"
status: ready_to_review
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/performance, audit-C/phase-2, audit-A/section-3]
---

# FR-PERF-012: Pause off-screen and idle animation to protect INP and battery

## 0. Why (evidence)

Audit C: the home page runs a continuous WebGL genie and particle system that animate constantly, with at least one
197 ms long main-thread task observed; INP (which replaced FID in March 2024) now reflects every interaction in a visit,
so always-on motion is the main responsiveness risk, and the target markets are phone-heavy. Audit A raises the same
concern for battery and CPU on lower-end phones.

## 1. Description (normative)

- 1.1 The R3F render loop SHALL stop (`frameloop="never"` or an equivalent pause) when the canvas is out of the viewport, when the document is hidden, or when the tab loses focus, and SHALL resume on re-entry.
- 1.2 Particle and marquee animations SHALL be driven by IntersectionObserver and paused when their section is off-screen.
- 1.3 Measured mobile INP on the home page SHALL be at or below 200 ms once field data exists (FR-PERF-013).
- 1.4 Long tasks attributable to the scene SHALL be at or below 50 ms after the first frame.

## 2. Acceptance criteria

- [ ] AC for 1.1 - hiding the document stops rAF ticks - test: `scene/frameloop-pause`
- [ ] AC for 1.2 - off-screen sections report zero animation ticks - test: `motion/offscreen-pause`
- [ ] AC for 1.3 - INP target recorded in the FR audit once field data lands - test: `perf/inp-field-baseline`
- [ ] AC for 1.4 - no scene long task exceeds 50 ms after first frame - test: `perf/long-task-budget`

## 3. Edge cases

- Scroll-tied choreography must resume at the correct progress, not from zero.
- Reduced-motion users: the loop must never start (FR-A11Y-010).
- Background tabs must not accumulate a work backlog that fires on focus.

## 4. Out of scope / non-goals

- Removing the scene.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.3 progressive enhancement: the 3D scene stays code-split, gated, and ships with its static poster fallback.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
