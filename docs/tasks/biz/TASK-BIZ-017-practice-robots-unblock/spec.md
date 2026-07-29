---
id: TASK-BIZ-017
title: "Unblock the practice subdomain exam routes in robots.txt so the ccaf redirects can transfer"
status: ready_to_implement
class: improvement
priority: MUST
owner: mixed
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [gsc/2026-07-29-coverage, bing-wmt/2026-07-29-keyword-report]
---

# TASK-BIZ-017: Unblock the practice subdomain exam routes in robots.txt so the ccaf redirects can transfer

## 0. Why (evidence)

This task is off-site for this repository: the fix lands in the practice/ccaf application, not in landing-page. It is filed here because the evidence arrived through this property's Search Console and because TASK-SEO-022 links toward the affected pages.

Measured 29 Jul 2026:

- `https://ccaf.cyberskill.world/robots.txt` and `https://practice.cyberskill.world/robots.txt` both contain `Disallow: /exam` and `Disallow: /practice`.
- `https://ccaf.cyberskill.world/exam` returns `301 -> https://practice.cyberskill.world/exam`.
- The GSC coverage export lists 2 pages under "Blocked by robots.txt" and 2 under "Page with redirect".
- The Bing keyword report ranks `https://ccaf.cyberskill.world/exam` at average position 1.5 with a 37.5 percent CTR, and the surrounding query cluster (`ccaf mock exam`, `claude certified architect practice test`, `anthropic mock exam`) is the site's entire organic demand.

The compounding failure is the interaction, not either fact alone. A `Disallow` on `ccaf.cyberskill.world/exam` forbids Google from fetching that URL at all, which means it never observes the 301 sitting behind it. A redirect that cannot be crawled cannot consolidate signals: the migration from ccaf to practice is currently dropping its accumulated authority rather than transferring it, and will keep doing so for as long as the source URLs stay disallowed.

The likely original intent was to keep a logged-in exam session out of the index. `Disallow` is the wrong instrument for that. It blocks crawling, not indexing, and a blocked URL can still be indexed from external links with no snippet, which is the worst of both outcomes. `noindex` is the instrument that removes a page from the index, and it requires the page to be crawlable to be seen at all.

The copy-pasteable patch, with the diffs, the per-path judgement table and the order of operations, is in `docs/ops/practice-subdomain-seo-patch.md`.

## 1. Description (normative)

- 1.1 `ccaf.cyberskill.world/robots.txt` MUST remove `Disallow: /exam` and `Disallow: /practice` so the 301 responses on those paths become crawlable and the migration can consolidate.
- 1.2 `practice.cyberskill.world/robots.txt` MUST remove the `Disallow` rules for any path intended to rank, and SHALL retain `Disallow` only for genuinely non-public surfaces (`/api/`, `/admin`, `/account`, `/dashboard`).
- 1.3 Any route that must stay out of the index while remaining crawlable SHALL carry a `noindex` robots meta tag or `X-Robots-Tag` header instead of a robots.txt `Disallow`.
- 1.4 The `Sitemap:` directive in `ccaf.cyberskill.world/robots.txt` SHALL reference a sitemap on its own host, or the ccaf host SHALL serve only a redirect and no robots.txt of its own, because a cross-host sitemap reference is ignored.
- 1.5 The ccaf host SHALL keep its 301 responses in place for at least twelve months after the block is lifted, so Google has a full recrawl window to observe them.
- 1.6 The practice application SHALL serve an IndexNow key file and submit its own URL set, mirroring TASK-SEO-021, since Bing raises the same recommendation for that property.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a fetch of the ccaf robots.txt shows no Disallow for /exam or /practice - evidence: `docs/verification/<date>-ccaf-robots.md`
- [ ] AC for 1.2 - a fetch of the practice robots.txt shows Disallow only for non-public surfaces - evidence: `docs/verification/<date>-practice-robots.md`
- [ ] AC for 1.3 - each formerly disallowed private route returns a noindex directive in its markup or headers - evidence: `docs/verification/<date>-practice-noindex.md`
- [ ] AC for 1.4 - the ccaf robots.txt either names its own host in the Sitemap directive or is no longer served - evidence: `docs/verification/<date>-ccaf-robots.md`
- [ ] AC for 1.5 - the redirect retention window is recorded with a review date - evidence: `docs/verification/<date>-ccaf-redirect-retention.md`
- [ ] AC for 1.6 - the practice IndexNow key file returns 200 and a submission is accepted - evidence: `docs/verification/<date>-practice-indexnow.md`

## 3. Edge cases

- Lifting the block exposes any genuinely private page that was relying on robots.txt for privacy. Robots.txt was never a privacy control; audit each unblocked path for an authentication check before shipping 1.1 and 1.2.
- An exam page that renders per-user state must not be cached by a search engine. `noindex` plus the existing `Cache-Control: private, no-store` on that route is the correct pairing, and that header is already present.
- Removing robots.txt from the ccaf host entirely means the host must still answer the 301 for every path, including `/robots.txt` itself.
- Google may take several weeks to recrawl the unblocked URLs. Absence of movement in the first fortnight is not evidence the fix failed.
- If the practice pages carry a canonical pointing back to ccaf, the consolidation runs backwards; verify canonical direction before lifting the block.

## 4. Out of scope / non-goals

- Anything inside landing-page. The internal links from the main domain are TASK-SEO-022; landing-page IndexNow is TASK-SEO-021.
- Content or ranking work on the practice pages themselves.
- The `www.cyberskill.world` hostname, which currently does not resolve at all. That is a DNS matter and needs its own task.

## 5. Protected invariants this task must not weaken

- Authentication is enforced in the application, never by robots.txt. Nothing here may become the only thing keeping a private page private.
- Per-user exam state is never cacheable by an intermediary or a search engine.
- The ccaf 301s stay intact for the full retention window; removing them early strands every external link that still points at the old host.
