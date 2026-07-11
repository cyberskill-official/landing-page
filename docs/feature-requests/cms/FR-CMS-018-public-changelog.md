---
id: FR-CMS-018
title: "Public changelog (/now) seeded from real shipped history"
status: ready_to_implement
class: improvement
priority: COULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/NURT-05]
---

# FR-CMS-018: Public changelog (/now) seeded from real shipped history

## 0. Why (evidence)

Returning visitors and the newsletter need fresh, low-cost material, and the team ships constantly while none of it is
visible. A changelog is the cheapest proof of momentum.

## 1. Description (normative)

- 1.1 A /[lang]/now route SHALL render a reverse-chronological list of shipped items (month, one line, optional link) from a typed content module.
- 1.2 It SHALL be seeded only from real, public-safe history; no aspirational or unshipped item.
- 1.3 It SHALL be linked from the footer, appear in the sitemap with real dates, and be reusable by the newsletter.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the route renders the entries in both locales - test: `routes/now-page`
- [ ] AC for 1.2 - every entry has a real date and shipped state - test: `content/changelog-truth`
- [ ] AC for 1.3 - it appears in the sitemap with a real lastmod - test: `seo/sitemap-completeness`

## 3. Edge cases

- A stale changelog is worse than none - if nothing shipped in a quarter, the page must say so honestly.

## 4. Out of scope / non-goals

- Automating the feed from git history.

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
