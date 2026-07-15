---
id: TASK-PERF-007
title: "Eliminate the mobile hero layout shift (CLS 0.431 -> below 0.1)"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-1-critical, audit-B/phase-1, audit-C/performance]
---

# TASK-PERF-007: Eliminate the mobile hero layout shift (CLS 0.431 -> below 0.1)

## 0. Why (evidence)

Live mobile Lighthouse on 10 July 2026 measured CLS 0.431 on the home page against 0.002 on desktop; Google's
"good" threshold is 0.1. It is the worst layout shift in the four-site benchmark and the single reason the mobile
performance score sits at 47 while desktop scores 97 - the page is already the lightest in the set (573 KB) and its
blocking time is lower than both higher-scoring rivals. Audit B estimates this one metric is worth 20-25 performance
points. Named causes: the hero mascot/poster loads without reserved space, the display font swaps without a matched
fallback, and the rotating placeholder in the wish input resizes its container.

## 1. Description (normative)

- 1.1 The hero mascot and its static poster (public/lumi-poster.webp, the CanvasMount gate, LumiHotspot) SHALL reserve their layout box before load: explicit width/height (or an aspect-ratio box) on every viewport, so no element below them moves when the asset arrives.
- 1.2 The display font (Space_Grotesk via next/font in app/layout.tsx) SHALL load with a size-adjusted fallback (or `display: optional`) such that the swap produces no measurable shift in the hero H1 or the eyebrow line.
- 1.3 The rotating placeholder inside the wish input SHALL be pinned: its container height SHALL be fixed to the tallest rotation string so cycling placeholders cannot resize the field.
- 1.4 The measured mobile CLS of `/en` and `/vi` SHALL be at or below 0.1 at the 75th percentile in the Lighthouse mobile run used by CI.
- 1.5 The Lighthouse CI configuration (lighthouserc.json) SHALL assert `cumulative-layout-shift <= 0.1` on mobile and fail the build above it.

## 2. Acceptance criteria

- [ ] AC for 1.1 - hero renders with reserved boxes; a mobile Lighthouse run reports zero layout-shift entries attributable to the mascot or poster - test: `lighthouse:mobile-cls`
- [ ] AC for 1.2 - font swap contributes no shift; the fallback metric override is present in the built CSS - test: `perf/font-swap-no-shift`
- [ ] AC for 1.3 - placeholder rotation does not change the input's bounding box - test: `wish-input/placeholder-stable`
- [ ] AC for 1.4 - mobile CLS <= 0.1 on /en and /vi - test: `lighthouse:mobile-cls`
- [ ] AC for 1.5 - lighthouserc assertion exists and a seeded 0.2 CLS fails CI - test: `ci/lighthouse-assertions`

## 3. Edge cases

- 360px and 390px widths; landscape phone; slow 3G where the poster arrives after first paint.
- prefers-reduced-motion: the static poster path must also be shift-free.
- Vietnamese hero copy is longer than English - the reserved boxes must hold for the VN line-count too.
- No-JS: the canvas never mounts; the poster must still occupy its box.

## 4. Out of scope / non-goals

- Reducing JavaScript weight (TASK-PERF-008).
- Redesigning the hero layout (TASK-A11Y-012 handles the CTA-bar overlap).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.3 progressive enhancement: the 3D scene stays code-split, gated, and ships with its static poster fallback.
