---
id: FR-SEO-010
title: "Restore word spacing in the machine-readable text of kinetic headings"
status: ready_to_review
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/on-page-seo, audit-C/phase-1, growth/SEO-09]
---

# FR-SEO-010: Restore word spacing in the machine-readable text of kinetic headings

## 0. Why (evidence)

components/motion/KineticText.tsx renders each word in its own aria-hidden <span> with no whitespace between spans, so
the serialized DOM text of the big section headings reads "Thearcofawish" and "TurnYourWillIntoReal". Screen readers are
fine (the heading carries aria-label), but crawlers, AI answer engines and text extractors that ignore ARIA see
run-together strings on the site's most important headings. Audit C names this as a Phase 1, low-effort, high-priority fix.

## 1. Description (normative)

- 1.1 The serialized text content of every heading rendered through KineticText SHALL contain the same word boundaries as the visible text.
- 1.2 The fix SHALL preserve the existing accessibility contract: the heading keeps its aria-label, the visual word spans stay aria-hidden, and the reduced-motion / scripting:none guards still force the words visible.
- 1.3 The rendered visual output SHALL be pixel-identical to today's (no added gaps, no reflow).
- 1.4 A test SHALL fetch the server-rendered HTML of `/en` and `/vi` and assert that each kinetic heading's extracted text equals the intended string, spaces included.

## 2. Acceptance criteria

- [ ] AC for 1.1 - extracted text of every kinetic heading contains spaces - test: `seo/kinetic-heading-text`
- [ ] AC for 1.2 - axe reports no new violations; aria-label unchanged - test: `check:a11y:routes`
- [ ] AC for 1.3 - visual regression on the hero and section headings is nil - test: `visual/kinetic-heading-snapshot`
- [ ] AC for 1.4 - the SSR HTML assertion runs on both locales - test: `seo/kinetic-heading-text`

## 3. Edge cases

- Vietnamese headings with diacritics and longer words must not wrap differently after the fix.
- Headings that contain punctuation or a line break.
- An sr-only duplicate must not be read twice by a screen reader.

## 4. Out of scope / non-goals

- Changing the heading copy.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
