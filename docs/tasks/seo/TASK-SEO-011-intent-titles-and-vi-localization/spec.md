---
id: TASK-SEO-011
title: "Intent-carrying, locale-correct titles and descriptions on every indexable route"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/technical-seo-gaps, audit-C/phase-1, audit-A/section-1, growth/SEO-01]
---

# TASK-SEO-011: Intent-carrying, locale-correct titles and descriptions on every indexable route

## 0. Why (evidence)

Two independent findings: (a) the Vietnamese routes keep the English title tag ("Turn Your Will Into Real - CyberSkill") even though the H1 and description are translated - app/[lang]/layout.tsx returns one hardcoded title for both locales; (b) titles are slogan-only, so no page targets what buyers actually type ("software development company Vietnam", "offshore development Ho Chi Minh City", "công ty phát triển phần mềm TP.HCM"). Audit A shows competitors ranking on dozens of such pages.

## 1. Description (normative)

- 1.1 Every indexable route SHALL declare a unique title and meta description per locale, generated from the content module, never hardcoded per-component.
- 1.2 Vietnamese titles SHALL be Vietnamese: no English title may be served on a /vi route.
- 1.3 Titles SHALL carry the commercial intent term for the page (service, city, practice) and stay within 50-60 characters where the language allows; descriptions within 140-160 characters and containing one concrete proof point.
- 1.4 The brand slogan MAY remain in the OpenGraph title but SHALL NOT be the whole <title>.
- 1.5 A test SHALL assert uniqueness and locale-correctness across the full route set.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every route has a unique (title, description) pair per locale - test: `seo/metadata-matrix`
- [ ] AC for 1.2 - no /vi route serves an English title - test: `seo/metadata-matrix`
- [ ] AC for 1.3 - titles and descriptions are within their length bounds - test: `seo/metadata-matrix`
- [ ] AC for 1.4 - OG title may differ; canonical stays self-referencing - test: `seo/canonical-hreflang`
- [ ] AC for 1.5 - the metadata matrix test runs across the full indexable route set in both locales and fails on a duplicate or an English title on /vi - test: `seo/metadata-matrix`

## 3. Edge cases

- Work and service slugs generated from content: their titles must be derived, not duplicated.
- Vietnamese is longer than English - the length rule is a target, not a hard failure, and the test asserts a soft bound.
- The /lite route stays noindex and is exempt.

## 4. Out of scope / non-goals

- Writing long-form page content (TASK-SEO-016, TASK-CMS-017).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
