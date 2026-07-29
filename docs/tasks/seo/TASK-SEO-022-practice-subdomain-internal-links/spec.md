---
id: TASK-SEO-022
title: "Link the practice subdomain from the main site so it stops being an orphan"
status: ready_to_review
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [bing-wmt/2026-07-29-keyword-report, gsc/2026-07-29-coverage]
---

# TASK-SEO-022: Link the practice subdomain from the main site so it stops being an orphan

## 0. Why (evidence)

The Bing keyword report for cyberskill.world, 29 Jul 2026, is almost entirely one intent cluster. Of the top 50 queries, roughly 45 are CCAF mock-exam terms: `ccaf mock exam` (18 impressions, position 4.1), `claude certified architect practice test` (15), `claude certified architect mock exam` (14), `anthropic mock exam` (10). Several are navigational queries for the property itself - `cyberskill ccaf`, `ccaf cyberskill world`, `cyberskill ccaf exam` - all converting at 25 to 60 percent CTR from position 1.5. One query is the literal URL `https://ccaf.cyberskill.world/exam`.

That demand lands on `practice.cyberskill.world` (migrated from `ccaf.cyberskill.world`, which now 301s). A grep across `lib`, `app` and `components` for `ccaf` or `practice.cyberskill` returns zero matches: the main domain does not link to the subdomain even once. The subdomain is an orphan carrying the site's entire organic demand, and the authority the main domain has accrued does not reach it.

This is the cheapest available fix for the 60 URLs sitting in "Discovered / Crawled - currently not indexed": discovery and internal PageRank both follow links, and there are currently none to follow.

## 1. Description (normative)

- 1.1 The site SHALL link to `https://practice.cyberskill.world` from at least one persistent, crawlable, site-wide surface, using a server-rendered anchor with a real `href`.
- 1.2 The link text SHALL be descriptive of the destination and SHALL NOT be a bare URL or a generic label such as "click here", so it carries the query intent the destination ranks for.
- 1.3 Both locales SHALL ship the link in the same commit, with the label sourced from the content or dictionary layer and never hardcoded in a component.
- 1.4 The destination URL SHALL be declared once in `lib/content/site.ts` alongside the other company facts, so no component holds a second copy.
- 1.5 The anchor SHALL NOT carry `rel="nofollow"` or `rel="sponsored"`, because the target is a first-party property and the link is intended to pass authority.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the rendered footer markup for every route contains an anchor whose href is the practice subdomain - test: `seo/practice-link-present`
- [ ] AC for 1.2 - the link label matches neither a bare URL nor the generic-label denylist already used by the descriptive-link-text gate - test: `seo/practice-link-descriptive`
- [ ] AC for 1.3 - the EN and VN dictionaries both define the label, and a missing key fails the build - test: `seo/practice-link-bilingual`
- [ ] AC for 1.4 - the URL resolves from the site config and appears exactly once as a literal in the source tree - test: `seo/practice-link-single-source`
- [ ] AC for 1.5 - the anchor carries no nofollow or sponsored rel token - test: `seo/practice-link-follows`

## 3. Edge cases

- The subdomain being down must not break the footer render: this is a plain anchor, not a fetch, so there is nothing to fail.
- `target="_blank"` requires `rel="noopener"`. That rel token is permitted and does not conflict with 1.5.
- The Vietnamese label must not be an English string transliterated; the destination serves a `/vi` variant and the label should read naturally.
- A future rename of the subdomain must be a one-line change, which is what 1.4 buys.

## 4. Out of scope / non-goals

- Content about the CCAF exam on the main domain. Publishing a landing page targeting those queries is a separate content decision (a CMS task).
- The robots.txt rules on the practice subdomain that currently block the pages this task links toward (TASK-BIZ-017). Linking to a disallowed path is still correct: the link is the discovery path once the block is lifted.
- Any change to the ccaf to practice redirect chain, which lives in the other repository.

## 5. Protected invariants this task must not weaken

- EN and VN ship together; a key present in one dictionary and absent in the other is a build failure, not a silent fallback.
- Company facts and first-party URLs have exactly one source in the repo.
- No client component is added to the home page for this; a link is server-rendered DOM.
