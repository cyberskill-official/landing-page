---
id: TASK-BIZ-017
title: "Unblock the practice subdomain exam routes in robots.txt so the ccaf redirects can transfer"
status: ready_to_review
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

> **Revised 2026-07-30 after inspecting the repo and re-measuring.** The original §0 asserted that the ccaf host served its own blocking robots.txt and that this made its 301s uncrawlable. That was an artefact of a `curl -L` which followed the redirect and displayed practice's robots.txt. The ccaf host serves no robots.txt and 301s every path. The real defect is on the destination host and is larger than first described.

Measured 29-30 Jul 2026:

- `practice.cyberskill.world/robots.txt` contained `Disallow: /exam`. robots.txt matches by PREFIX, so that rule also matched the whole `/exams/*` tree: `/exams`, every `/exams/{code}`, every `/exams/{code}/sample-questions`, and every pSEO path.
- Resolved against the live sitemap under RFC 9309 (longest match wins), **25 of 52 sitemap URLs, 48 percent, were blocked** - the site advertised URLs its own robots.txt forbade fetching.
- `ccaf.cyberskill.world` 301s every path including `/robots.txt`, so nothing on the legacy host is blocked and every redirect is crawlable. Already correct.
- The Bing keyword report's entire demand cluster (`ccaf mock exam`, `claude certified architect practice test`, `anthropic mock exam`, `free claude ai mock exam`) targets exactly the pSEO pages inside the blocked tree.

The likely original intent was to keep a logged-in exam session out of the index. `Disallow` is the wrong instrument for that, on two counts. It blocks crawling, not indexing, so a blocked URL can still be indexed from external links with no snippet. And `src/lib/urlContract.ts` already declares those routes "must carry noindex" - which all six do - but `noindex` can only be obeyed if the crawler may fetch the page and read it. The Disallow list was simultaneously too broad and redundant with the mechanism it was suppressing.

The copy-pasteable patch, with the diffs, the per-path judgement table and the order of operations, is in `docs/ops/practice-subdomain-seo-patch.md`.

## 1. Description (normative)

- 1.1 `ccaf.cyberskill.world` SHALL serve no blocking robots.txt, so every 301 on the legacy host stays crawlable and the migration can consolidate. **Verified 2026-07-30: already true.** The middleware 301s every path including `/robots.txt`; the earlier claim to the contrary was a `curl -L` artefact. No change required.
- 1.2 `practice.cyberskill.world/robots.txt` MUST remove the `Disallow` rules for any path intended to rank, and SHALL retain `Disallow` only for genuinely non-public surfaces (`/api/`, `/admin`, `/account`, `/dashboard`). The operative defect was `Disallow: /exam`, which by prefix matching also blocked the whole `/exams/*` tree: 25 of 52 sitemap URLs.
- 1.3 Any route that must stay out of the index while remaining crawlable SHALL carry a `noindex` robots meta tag or `X-Robots-Tag` header instead of a robots.txt `Disallow`. **Verified 2026-07-30: already true** for all six runtime routes via `runtimeNoIndex`; the robots.txt block was what made those directives unreadable.
- 1.4 A `Sitemap:` directive SHALL reference a sitemap on its own host. **Verified 2026-07-30: already true** — practice's robots.txt names practice's own sitemap, and ccaf serves no robots.txt. No change required.
- 1.5 The ccaf host SHALL keep its 301 responses in place for at least twelve months after the block is lifted, so Google has a full recrawl window to observe them.
- 1.6 The practice application SHALL serve an IndexNow key file at the site ROOT and submit its own URL set, mirroring TASK-SEO-021. Root placement is required, not stylistic: the protocol scopes a submission to the directory holding the key file, so a key under a subdirectory cannot authorise the whole host.
- 1.7 A regression test MUST assert that no `Disallow` rule prefix-shadows any path in `indexedPaths()`, so the same class of defect cannot return under a different path name, and that test MUST be shown to fail against the pre-fix rule set.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the ccaf host serves no blocking robots.txt and 301s every path, confirmed without following redirects - evidence: `docs/verification/task-biz-017-practice-robots-2026-07-30.md` §1
- [ ] AC for 1.2 - zero of the sitemap's URLs are blocked under RFC 9309 longest-match resolution, and Disallow covers only non-public surfaces - evidence: `docs/verification/task-biz-017-practice-robots-2026-07-30.md` §2, §4
- [ ] AC for 1.3 - every runtime route carries noindex and is now fetchable so the directive can be read - evidence: `docs/verification/task-biz-017-practice-robots-2026-07-30.md` §3
- [ ] AC for 1.4 - each host's Sitemap directive names its own host - evidence: `docs/verification/task-biz-017-practice-robots-2026-07-30.md` §1
- [ ] AC for 1.5 - the redirect retention window is recorded with a review date - evidence: OUTSTANDING, operator
- [ ] AC for 1.6 - the practice IndexNow key file returns 200 at the site root and a submission is accepted - evidence: OUTSTANDING, needs `INDEXNOW_KEY` on that project
- [ ] AC for 1.7 - the robots contract test fails against the pre-fix rule set and passes after - evidence: `docs/verification/task-biz-017-practice-robots-2026-07-30.md` §5

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
