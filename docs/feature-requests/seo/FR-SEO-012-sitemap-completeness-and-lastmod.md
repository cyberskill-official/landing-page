---
id: FR-SEO-012
title: "Complete the sitemap and stamp real lastModified dates"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-6-medium, audit-B/phase-1, growth/SEO-04]
---

# FR-SEO-012: Complete the sitemap and stamp real lastModified dates

## 0. Why (evidence)

Audit B's crawl of the deployed sitemap found only the two homepages. The repository's app/sitemap.ts does emit services,
work, careers and how-we-build - so either the deploy lagged or the crawl hit a stale cache; either way the omission of
/privacy and /accessibility is real, and every entry stamps `new Date()` at build time, which is fake freshness that
teaches crawlers to ignore lastmod.

## 1. Description (normative)

- 1.1 app/sitemap.ts SHALL enumerate every indexable route in both locales, including /privacy, /accessibility and (when it ships) /team and /notes, and SHALL exclude the noindex /lite route.
- 1.2 Each entry's lastModified SHALL come from a per-entry `lastUpdated` field in the content module, never from build time; the fallback SHALL be a fixed site-launch date.
- 1.3 A CI check SHALL fetch the built sitemap and assert the route count matches the indexable route set.
- 1.4 The deployed sitemap SHALL be re-verified against the live site after release and the result recorded.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the built sitemap contains every indexable route x 2 locales and no /lite - test: `seo/sitemap-completeness`
- [ ] AC for 1.2 - two consecutive builds with no content change emit identical lastmod values - test: `seo/sitemap-stable-lastmod`
- [ ] AC for 1.3 - adding a route without a lastUpdated fails the check - test: `seo/sitemap-completeness`
- [ ] AC for 1.4 - the live sitemap is verified post-deploy and logged - test: `docs/post-deploy-verification`

## 3. Edge cases

- A new content entry with no lastUpdated must fail loudly, not silently fall back.
- hreflang alternates inside the sitemap must stay reciprocal.

## 4. Out of scope / non-goals

- Search Console submission (FR-BIZ-008).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
