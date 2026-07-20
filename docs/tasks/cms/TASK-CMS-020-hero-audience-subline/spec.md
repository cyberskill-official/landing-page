---
id: TASK-CMS-020
title: "Hero subline that names the audience"
status: done
class: improvement
priority: COULD
owner: mixed
depends_on: [TASK-BIZ-013]
routed_back_count: 0
awh: N/A
traces_to: [growth/COPY-03, audit-A/section-1]
---

# TASK-CMS-020: Hero subline that names the audience

## 0. Why (evidence)

The hero is brand-poetic ("Turn Your Will Into Real", "the arc of a wish") and never says who it is for. Audit A rates the copy as excellent but search- and buyer-intent-poor; one subline naming the audience costs nothing and helps both.

## 1. Description (normative)

- 1.1 The hero SHALL carry a subline naming the audience and the offer in plain words (who, what, where), owner-approved, EN and VN.
- 1.2 It SHALL be server-rendered text, not a kinetic-only element, and SHALL be present in the crawled HTML.

## 2. Acceptance criteria

- [x] AC for 1.1 - the subline renders in the SSR HTML on both locales - test: `content/hero-subline`
- [x] AC for 1.2 - the approved wording matches the content module - test: `content/no-placeholders`

## 3. Edge cases

- It must not compete with the H1 for the LCP element (TASK-PERF-007).

## 4. Out of scope / non-goals

- Rewriting the brand story.

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
