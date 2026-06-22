---
id: FR-SEO-006
title: "RSS/Atom feed for the insights collection"
module: SEO
priority: COULD
status: planned
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CMS-007]
blocks: []
source_pages:
  - "research doc §F (content syndication), §E (discoverability)"
planned_files:
  - app/insights/feed.xml/route.ts
---

## §1 Requirement (BCP-14 normative)

The insights collection COULD publish a machine-readable feed so readers and
aggregators can subscribe.

1. The app COULD expose an RSS or Atom feed listing published insights, newest
   first, with title, link, summary, and publish date per item.
2. The feed MUST use absolute item links and a stable feed URL.
3. Each insights page MUST advertise the feed via a `<link rel="alternate">` in
   the head so clients can auto-discover it.
4. The feed SHOULD include only published items and MUST exclude drafts.

## §2 Acceptance

- The feed URL resolves and validates as well-formed RSS or Atom.
- Items are ordered newest first with absolute links and publish dates.
- The insights page head references the feed via `rel="alternate"`.

## §3 Evidence

Not yet implemented; acceptance pending build.
