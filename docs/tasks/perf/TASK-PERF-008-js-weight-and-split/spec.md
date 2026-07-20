---
id: TASK-PERF-008
title: "Cut and defer first-load JavaScript (TBT 1,370 ms -> under 300 ms)"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-2-high, audit-B/phase-2, audit-C/performance]
---

# TASK-PERF-008: Cut and defer first-load JavaScript (TBT 1,370 ms -> under 300 ms)

## 0. Why (evidence)

Audit B measured ~900 KB of first-party JavaScript across 19 chunks plus a 157 KB Google Tag Manager file; on a throttled phone this yields 1,370 ms total blocking time, 2.4 s of script start-up and 8.4 s of main-thread work, with ~115 KB of the JavaScript unused on load. Audit C independently measured ~0.74 MB of decoded JS across 19 script files and at least one 197 ms long task. The site is the lightest page in the benchmark, so the cost is execution, not bytes.

## 1. Description (normative)

- 1.1 Every non-critical animation module (GSAP/Lenis choreography, MotionExtras, DepthField, BlackHole, IntroVeil, LumiMagic, SoundCues) SHALL be dynamically imported and mounted only when its section is within, or approaching, the viewport.
- 1.2 Sections that carry no interactivity SHALL be server components (or islands) so they do not hydrate.
- 1.3 The ~115 KB of first-load JavaScript reported unused SHALL be removed or deferred; `npm run analyze` output SHALL be recorded in the task audit as before/after.
- 1.4 Measured mobile total blocking time on `/en` SHALL be at or below 300 ms, and mobile LCP at or below 2,500 ms.
- 1.5 The CI asset-size guard (scripts/check-asset-size.mjs) SHALL enforce a first-load JS ceiling and fail the build above it.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the animation chunks are absent from the initial document's script set - test: `perf/initial-chunks-snapshot`
- [ ] AC for 1.2 - hydration count drops; the static sections emit no client bundle - test: `perf/server-component-inventory`
- [ ] AC for 1.3 - first-load JS is reduced by at least 200 KB against the 2026-07-10 baseline - test: `ci/asset-size-guard`
- [ ] AC for 1.4 - mobile TBT <= 300 ms and LCP <= 2500 ms - test: `lighthouse:mobile-perf`
- [ ] AC for 1.5 - a seeded oversize chunk fails CI - test: `ci/asset-size-guard`

## 3. Edge cases

- Deferred modules must not break the scroll choreography's ScrollTrigger registration order.
- A section entering the viewport during a fast scroll must not flash unstyled or unanimated content.
- Reduced-motion users must never download the animation chunks at all.
- The 3D scene chunk must remain separate and desktop-gated (TASK-SCENE-001 contract).

## 4. Out of scope / non-goals

- Removing the Lumi scene or the art direction.
- Analytics deferral (TASK-PERF-009).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.3 progressive enhancement: the 3D scene stays code-split, gated, and ships with its static poster fallback.
