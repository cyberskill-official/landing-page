# TASK-BIZ-017 — practice / ccaf robots.txt evidence (2026-07-30)

**Status:** clauses 1.1-1.4 satisfied and verified live. Clauses 1.5 and 1.6 outstanding (operator items).
**Repo changed:** `cyberskill-official/practice` (not landing-page). Commit `8eaed95`.
**Related:** `docs/ops/practice-subdomain-seo-patch.md` (patch spec, since corrected).

## 1. Correction to the original finding

The spec's §0 claimed `ccaf.cyberskill.world` served its own blocking robots.txt with a cross-host `Sitemap` directive, and that this made its 301s uncrawlable. **That was wrong.** It came from a `curl -L` that silently followed the 301 and displayed practice's robots.txt.

Verified without following redirects:

```
$ curl -sSI https://ccaf.cyberskill.world/robots.txt | head -1
HTTP/2 301

$ curl -sSI https://ccaf.cyberskill.world/exam | head -1
HTTP/2 301
```

`src/middleware.ts` 301s every path on the legacy host when `HOST_CUTOVER_REDIRECT=on`, including `/robots.txt`. The host serves no robots.txt of its own, nothing on it is blocked, and every 301 is crawlable. This is the preferred shape and was already shipped. **Clauses 1.1 and 1.4 required no change.**

## 2. The actual defect, on the destination host

`practice.cyberskill.world/robots.txt` contained `Disallow: /exam`. robots.txt matches by **prefix**, not by path segment, so that rule also matched the entire `/exams/*` tree.

Measured against the live sitemap using RFC 9309 resolution (longest match wins; tie goes to allow):

| | Before (2026-07-29) | After (2026-07-30) |
|---|---:|---:|
| Sitemap URLs | 52 | 52 |
| Blocked by robots.txt | **25 (48%)** | **0** |

Blocked set included `/exams`, every `/exams/{code}`, every `/exams/{code}/sample-questions`, and all pSEO paths (`practice-exam`, `practice-questions`, `free-mock-test`) — the pages targeting the exact query cluster in the Bing keyword report.

Note: Python's `urllib.robotparser` reports 0 blocked for the original file because it resolves first-match rather than longest-match. It does not model Googlebot; the measurement above implements RFC 9309 directly.

## 3. Why the entries were removed rather than narrowed

`src/lib/urlContract.ts` already declares the runtime routes "not in sitemap; must carry noindex". Verified that all six do:

| Path | `runtimeNoIndex` applied |
|---|---|
| `/exam` | yes |
| `/practice` | yes |
| `/result` | yes |
| `/flashcards` | yes |
| `/score` | yes |
| `/dashboard` | yes |

`noindex` can only be obeyed if the crawler may fetch the page and read the directive. Blocking these in robots.txt made the intended mechanism unreadable while adding nothing — a blocked URL can still be indexed from external links, with no snippet. The Disallow list was simultaneously too broad and redundant.

## 4. Post-change state (clause 1.2)

```
$ curl -s https://practice.cyberskill.world/robots.txt | head -8
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /account
Disallow: /dashboard
```

Verified live 2026-07-30:

- `/api/session`, `/admin`, `/account`, `/dashboard` — still blocked
- `/exam`, `/practice`, `/result`, `/score`, `/flashcards` — fetchable, `noindex` now readable
- 0 of 52 sitemap URLs blocked

Authentication for `/admin`, `/account`, `/dashboard` is enforced in the application; robots.txt was never the control. No surface was exposed by this change.

## 5. Regression guard

`tests/unit/robots-contract.test.ts` (practice repo) asserts the invariant, not the string:

- no `Disallow` may prefix-shadow any path in `indexedPaths()`
- the `/exams` tree is crawlable
- private surfaces stay blocked
- runtime paths stay fetchable so `noindex` is readable
- every `runtimePaths()` entry stays out of the sitemap

Confirmed the test **fails** against the original robots.ts (4 failures, naming all 31 shadowed paths). A regression test that cannot reproduce the bug proves nothing, so this was checked explicitly.

## 6. Search Console

"Blocked by robots.txt" → **Validate Fix** submitted 2026-07-30 by operator. Recrawl of the 25 released URLs runs over weeks, not days; absence of movement in the first fortnight is not evidence of failure.

## 7. Outstanding

| Clause | Item | Owner |
|---|---|---|
| 1.5 | Record the ccaf 301 retention decision and review date (minimum 12 months). Not yet documented. | operator |
| 1.6 | IndexNow on `practice.cyberskill.world` — key file at the **root** (`/<key>.txt`; the directory scopes submission) plus a submit script. Reference implementation: `lib/seo/indexnow.ts` and `scripts/indexnow-submit.mjs` in landing-page. | agent + operator (needs env var) |
