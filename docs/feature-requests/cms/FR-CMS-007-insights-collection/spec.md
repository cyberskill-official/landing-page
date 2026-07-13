---
id: FR-CMS-007
title: "Bilingual insights/notes content collection"
status: ready_to_review
class: product
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-3-item-13, audit-C/content-credibility, growth/SEO-03]
---

# FR-CMS-007: Bilingual insights/notes content collection

## 0. Why (evidence)

All three audits name the same missing asset: there is no blog or insights section, so there is no authority content to
rank for, to be cited by AI answer engines, or to demonstrate expertise. Audit A: one original technical piece per month
compounds into authority no design spend can buy. Audit C: thoughtbot's content-led credibility is replicable without an
enterprise budget. Raised from COULD to SHOULD - this is the compounding channel, and FR-SEO-006, FR-CMS-010 and
FR-BIZ-010 all depend on it.

## 1. Description (normative)

- 1.1 Posts SHALL live in a typed content collection (MDX or a content module), not as ad hoc pages, so the listing and detail views derive from one source.
- 1.2 Each post SHALL carry a title, summary, body, slug, published date and updated date; a post present in one locale SHOULD declare its counterpart.
- 1.3 A post missing a required field SHALL fail the build rather than render a broken card or page.
- 1.4 Post metadata SHALL feed the SEO tags (title, description, canonical, locale alternates, OG image) consistently with the rest of the site, and each post SHALL appear in the sitemap with its real dates.
- 1.5 The route SHALL be server-rendered so a crawler and an AI answer engine see the full text without executing JavaScript.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a new post renders in the listing and the detail view in both locales from one file - test: `routes/notes`
- [ ] AC for 1.2 - every required field is typed and present - test: `content/notes-post-schema`
- [ ] AC for 1.3 - a post missing a field fails the build - test: `content/notes-post-schema`
- [ ] AC for 1.4 - the post appears in the sitemap with its real lastmod and a valid canonical - test: `seo/sitemap-completeness`
- [ ] AC for 1.5 - the post body is present in the server-rendered HTML - test: `seo/notes-ssr`

## 3. Edge cases

- A post published in EN only - the VN listing must handle the gap honestly, not render an empty card.
- A long post must not blow the page-weight budget (FR-PERF-008).

## 4. Out of scope / non-goals

- Writing the posts.
- The RSS feed (FR-SEO-006).
- The author/TLDR enforcement (FR-CMS-010).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
