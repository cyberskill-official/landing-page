---
id: TASK-SEO-020
title: "Expand the FAQ to 15-20 answerable, citable Q&As"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/section-2, audit-C/geo, audit-C/phase-2, growth/GEO-01]
---

# TASK-SEO-020: Expand the FAQ to 15-20 answerable, citable Q&As

## 0. Why (evidence)

Structured Q&A pairs are the highest-yield asset for AI answer engines, and all three audits name the FAQ as a strength
worth extending: it has five entries today. Audit C asks for quotable, statistic-rich, citable blocks; audit A notes that
LLMs preferentially cite specific facts.

## 1. Description (normative)

- 1.1 The FAQ SHALL carry 15-20 question/answer pairs per locale, keeping the FAQPage JSON-LD in components/sections/Faq.tsx in sync with the visible copy.
- 1.2 The set SHALL cover at minimum: what we build, where we are, how to start, reply speed, international clients, IP ownership, contract and payment terms, NDAs, typical timelines, typical starting budgets, team seniority and English level, time-zone overlap, maintenance after launch, taking over existing codebases, preferred stacks, and the first two weeks of an engagement.
- 1.3 Any answer that constitutes a commercial commitment (terms, budgets, timelines, SLAs) SHALL NOT ship until the owner has approved it; the FAQ renders correctly with that entry absent.
- 1.4 Answers SHALL be self-contained and quotable: each answers its question in the first sentence.

## 2. Acceptance criteria

- [ ] AC for 1.1 - >= 15 pairs render per locale and the JSON-LD matches the DOM exactly - test: `seo/faq-jsonld-parity`
- [ ] AC for 1.2 - every topic in the minimum set is present - test: `content/faq-coverage`
- [ ] AC for 1.3 - an unapproved commitment answer is absent from the build - test: `content/no-placeholders`
- [ ] AC for 1.4 - each answer's first sentence answers the question - reviewed in the task audit - test: `content/faq-coverage`

## 3. Edge cases

- A long FAQ hurts the page weight - render it as an accordion with server-rendered content (HTML-first).
- Vietnamese answers are native copy, not translation of the English commitments.

## 4. Out of scope / non-goals

- The notes/insights hub (TASK-CMS-007).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
