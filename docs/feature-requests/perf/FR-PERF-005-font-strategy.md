---
id: FR-PERF-005
title: "Font subset, display, and preload strategy including Vietnamese glyphs"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-J, audit-B/finding-1-critical, growth/PERF-02]
---

# FR-PERF-005: Font subset, display, and preload strategy including Vietnamese glyphs

## 0. Why (evidence)

Research doc §J, and now a named cause of the worst metric on the site: audit B attributes part of the 0.431 mobile CLS to
the display font swapping without a matched fallback. app/layout.tsx already self-hosts Space Grotesk with the Vietnamese
subset via next/font (keyless, size-adjusted fallback) - this FR centralises and completes the strategy so FR-PERF-007 can
rely on it.

## 1. Description (normative)

- 1.1 Self-hosted fonts SHALL be subset to the Latin and Vietnamese ranges so every accented glyph the content uses renders without a fallback swap.
- 1.2 Each web font SHALL declare an explicit `font-display` policy, and the primary text font SHALL be preloaded so first paint does not wait on a late fetch.
- 1.3 The fallback SHALL be metric-matched (size-adjust) so the swap produces no measurable layout shift in the hero or any heading.
- 1.4 The strategy SHALL be centralised in one module consumed by the root layout, so the policy is declared once.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every Vietnamese diacritic in the content renders in the intended face - test: `content/vi-diacritics`
- [ ] AC for 1.2 - the primary font is preloaded and declares its display policy - test: `perf/lcp-preload`
- [ ] AC for 1.3 - the font swap contributes zero layout shift - test: `perf/font-swap-no-shift`
- [ ] AC for 1.4 - no component imports a font directly; all font usage flows through the module - test: `lint/font-single-source`

## 3. Edge cases

- A Vietnamese glyph missing from the subset falls back per-glyph and produces a visibly mixed typeface.
- Preloading too many weights costs more than it saves.

## 4. Out of scope / non-goals

- The rest of the CLS fix (FR-PERF-007).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.2: every secret lives only in server env; no NEXT_PUBLIC_ secret, ever (NFR-SEC-001).
