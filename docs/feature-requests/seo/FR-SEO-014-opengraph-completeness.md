---
id: FR-SEO-014
title: "Complete the OpenGraph and Twitter card fields"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-15-low, audit-B/phase-1]
---

# FR-SEO-014: Complete the OpenGraph and Twitter card fields

## 0. Why (evidence)

Audit B: og:title, og:description and a generated og:image are present, but og:url, og:type, og:site_name and twitter:site
are missing, so shared links render less richly than they could. app/layout.tsx sets type/siteName at the root but the
per-locale layout overrides openGraph without re-declaring url.

## 1. Description (normative)

- 1.1 Every indexable route SHALL emit og:url (absolute, locale-correct), og:type, og:site_name, og:locale, og:image with dimensions and alt, twitter:card and twitter:site.
- 1.2 The values SHALL be derived from the same site config as the canonical URL so they cannot drift.
- 1.3 A test SHALL assert the full field set on a representative route per template (home, service, work, team, notes, legal).

## 2. Acceptance criteria

- [ ] AC for 1.1 - all listed fields present on every template - test: `seo/og-field-matrix`
- [ ] AC for 1.2 - og:url equals the canonical URL for that locale - test: `seo/og-field-matrix`
- [ ] AC for 1.3 - a missing field fails CI - test: `seo/og-field-matrix`

## 3. Edge cases

- twitter:site requires an actual handle - if none exists, the field is omitted rather than faked (FR-BIZ-007).
- The dynamic OG image route must keep its byte budget.

## 4. Out of scope / non-goals

- Designing new OG artwork (FR-SEO-008 shipped).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
