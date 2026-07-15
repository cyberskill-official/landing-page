---
id: TASK-CMS-010
title: "Insights post template enforces author, dates and a TLDR"
status: done
class: improvement
priority: COULD
owner: agent
depends_on: [TASK-CMS-007]
routed_back_count: 0
awh: N/A
traces_to: [audit-C/geo, audit-C/phase-2, growth/GEO-04]
---

# TASK-CMS-010: Insights post template enforces author, dates and a TLDR

## 0. Why (evidence)

Answer engines prefer pages with visible authorship, freshness and an extractable summary; audit C asks for quotable,
statistic-rich, cited content. The insights collection (TASK-CMS-007) must not be able to ship a post that lacks those.

## 1. Description (normative)

- 1.1 The post type SHALL require author (rendered with Person JSON-LD), publishedAt, updatedAt and a TLDR block rendered near the top.
- 1.2 A post missing any required field SHALL fail typecheck or the build - it SHALL NOT render with a blank slot.
- 1.3 Article JSON-LD SHALL be emitted per post (TASK-SEO-004 contract), with the correct dates.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a post without an author fails the build - test: `content/notes-post-schema`
- [ ] AC for 1.2 - the TLDR renders above the fold and appears in the Article description - test: `content/notes-post-schema`
- [ ] AC for 1.3 - Article + Person JSON-LD validate - test: `seo/article-jsonld`

## 3. Edge cases

- An updated post must move updatedAt, and the sitemap lastmod with it (TASK-SEO-012).

## 4. Out of scope / non-goals

- Writing the posts (TASK-CMS-007).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
