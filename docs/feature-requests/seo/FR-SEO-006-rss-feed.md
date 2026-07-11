---
id: FR-SEO-006
title: "RSS/Atom feed for the insights collection"
status: ready_to_implement
class: product
priority: COULD
owner: agent
depends_on: [FR-CMS-007]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-F, growth/SEO-03]
---

# FR-SEO-006: RSS/Atom feed for the insights collection

## 0. Why (evidence)

Research doc §F (content syndication) and §E (discoverability). The feed is the cheapest distribution the insights hub gets,
and it is what the newsletter (FR-CTA-014) and the share workflow (FR-BIZ-010) both reuse.

## 1. Description (normative)

- 1.1 The app SHALL expose an RSS or Atom feed listing published insights newest first, with a title, absolute link, summary and publish date per item.
- 1.2 The feed SHALL use absolute item links and a stable feed URL, and SHALL be locale-aware (per-locale feeds or language-tagged items).
- 1.3 Each insights page SHALL advertise the feed via `<link rel="alternate">` in the head so clients can auto-discover it.
- 1.4 The feed SHALL include only published items and SHALL exclude drafts.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the feed URL resolves and validates as well-formed RSS or Atom - test: `seo/feed-validates`
- [ ] AC for 1.2 - items are newest-first with absolute links and real dates, per locale - test: `seo/feed-validates`
- [ ] AC for 1.3 - the insights page head references the feed - test: `seo/feed-discovery`
- [ ] AC for 1.4 - a draft post never appears in the feed - test: `seo/feed-validates`

## 3. Edge cases

- A post updated after publication - the feed must reflect updatedAt without reordering the whole feed.
- An item summary containing markup must be escaped.

## 4. Out of scope / non-goals

- The insights collection itself (FR-CMS-007).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
