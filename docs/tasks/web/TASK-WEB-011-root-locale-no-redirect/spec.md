---
id: TASK-WEB-011
title: "Serve the negotiated locale at the root without a visible redirect hop"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-3-high, audit-B/phase-1]
---

# TASK-WEB-011: Serve the negotiated locale at the root without a visible redirect hop

## 0. Why (evidence)

Audit B: cyberskill.world/ returns a 307 to /en and Lighthouse measured ~0.84 s of mobile delay from that hop ahead of any content - a full round trip on every first visit. middleware.ts currently redirects "/" after negotiating the locale (TASK-WEB-004).

## 1. Description (normative)

- 1.1 A request to `/` SHALL return the negotiated locale's page in the first response (an edge rewrite, not a redirect), with HTTP 200.
- 1.2 The response SHALL carry the correct `<html lang>`, canonical and hreflang for the served locale, and `/` SHALL canonicalise to the locale URL so no duplicate content is indexed.
- 1.3 The cs-locale cookie SHALL keep priority over Accept-Language negotiation (the TASK-WEB-004 contract is preserved).
- 1.4 The measured navigation to `/` on mobile SHALL show no redirect entry in the resource timeline.

## 2. Acceptance criteria

- [x] AC for 1.1 - GET / returns 200 with rendered content - test: `routing/root-no-redirect`
- [x] AC for 1.2 - the served page's canonical points at /en or /vi and hreflang stays reciprocal - test: `seo/canonical-hreflang`
- [x] AC for 1.3 - a cs-locale=vi cookie serves the VN page at / - test: `routing/root-cookie-priority`
- [x] AC for 1.4 - zero redirects in the navigation timeline - test: `perf/no-root-redirect`

## 3. Edge cases

- Bots with no Accept-Language must get the x-default (EN) without a redirect chain.
- Caching: the rewrite must vary correctly so a VN visitor never gets a cached EN page.
- Sitemap and internal links keep pointing at /en and /vi, never at bare /.

## 4. Out of scope / non-goals

- Changing the locale negotiation rules (TASK-WEB-004).

## 5. Protected invariants this task must not weaken

- Every locale stays a crawlable URL with reciprocal hreflang (AGENTS.md §4.5).
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
