---
id: FR-PERF-011
title: "Preload the LCP element and give background images correct responsive sizes"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [FR-PERF-005]
routed_back_count: 0
awh: N/A
traces_to: [audit-B/phase-2, growth/PERF-01, growth/PERF-02]
---

# FR-PERF-011: Preload the LCP element and give background images correct responsive sizes

## 0. Why (evidence)

Audit B phase 2 asks to preload the hero poster and display font and to prioritise the largest element. The growth
backlog additionally found the aurora background image requested at width 3840 on the contact section, so phones pull a
desktop-sized variant.

## 1. Description (normative)

- 1.1 The hero LCP element SHALL carry `priority` (next/image) or an explicit preload, and SHALL NOT be lazily loaded.
- 1.2 Every next/image usage that renders a background or decorative surface (Aurora, WorkThumb, poster) SHALL declare a `sizes` attribute that resolves to at most the rendered CSS width at each breakpoint.
- 1.3 A 390px-wide fetch of the contact section SHALL request an image variant no wider than 828px.
- 1.4 The image budget in lighthouse/budget.json SHALL continue to pass.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the hero image element is marked priority and appears in the preload list - test: `perf/lcp-preload`
- [ ] AC for 1.2 - every next/image call site has a sizes attribute - test: `lint/next-image-sizes`
- [ ] AC for 1.3 - the generated srcset selection at 390px is <= 828w - test: `perf/aurora-sizes`
- [ ] AC for 1.4 - image budget green - test: `ci/asset-size-guard`

## 3. Edge cases

- Retina phones (DPR 3) must still get a sharp variant.
- Dark and light themes may use different assets.

## 4. Out of scope / non-goals

- Font subsetting and display strategy (FR-PERF-005).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
