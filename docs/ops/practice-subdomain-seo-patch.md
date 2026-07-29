# Patch spec: practice / ccaf subdomain SEO

**For:** the application serving `practice.cyberskill.world` and `ccaf.cyberskill.world` (a different repository from landing-page).
**Task:** TASK-BIZ-017.
**Measured:** 29 Jul 2026.
**Impact:** this is the highest-value SEO fix available to CyberSkill right now. Everything in landing-page is secondary to it.

---

## 1. What is wrong

### 1.1 The finding

```
$ curl -s https://ccaf.cyberskill.world/robots.txt
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /exam          <-- blocks the highest-ranking URL on the property
Disallow: /practice      <-- blocks the second
...
Sitemap: https://practice.cyberskill.world/sitemap.xml   <-- cross-host, ignored

$ curl -sI https://ccaf.cyberskill.world/exam | head -1
HTTP/2 301
location: https://practice.cyberskill.world/exam
```

`practice.cyberskill.world/robots.txt` carries the same `Disallow` block.

### 1.2 Why it compounds

A `Disallow` forbids Google from **fetching** the URL. It does not forbid indexing.

`ccaf.cyberskill.world/exam` is disallowed **and** returns a 301. Google cannot fetch it, so it never sees the 301, so the redirect cannot consolidate anything. The migration from `ccaf` to `practice` is currently dropping its accumulated authority rather than transferring it, and will keep doing so for as long as the source URLs stay blocked.

This is the classic robots-blocked-redirect failure. It is silent: nothing in Search Console says "your migration is not working", it just reports 2 pages "Blocked by robots.txt" and 2 pages with "Page with redirect" and leaves you to connect them.

### 1.3 What it is costing

From the Bing keyword report for the same day, the blocked paths are the demand:

| Query | Impressions | CTR | Avg. position |
|---|---|---|---|
| `ccaf mock exam` | 18 | 22.2% | 4.1 |
| `claude certified architect practice test` | 15 | 13.3% | 7.3 |
| `claude certified architect mock exam` | 14 | 21.4% | 4.6 |
| `anthropic mock exam` | 10 | 30.0% | 6.1 |
| `https://ccaf.cyberskill.world/exam` | 8 | 37.5% | 1.5 |

Roughly 45 of the top 50 queries are this one intent cluster. People are searching for the exam URL by name, at position 1.5, and the URL is disallowed.

### 1.4 The likely original intent

Keeping a logged-in, per-user exam session out of the index. That is a reasonable goal and `Disallow` is the wrong instrument for it:

- `Disallow` blocks crawling, not indexing. A blocked URL can still be indexed from external links, showing in results with no title and no snippet. That is strictly worse than either alternative.
- `noindex` is the instrument that removes a page from the index, and it only works if the page is **crawlable**, because the crawler has to fetch the page to see the directive.

So the two directives are not interchangeable, and blocking in robots.txt actively prevents the thing that would have worked.

---

## 2. The patch

### 2.1 `practice.cyberskill.world/robots.txt`

Keep `Disallow` only for surfaces that must never be fetched. Move everything that is merely "should not appear in results" to `noindex`.

```diff
  User-Agent: *
  Allow: /
  Disallow: /api/
- Disallow: /exam
- Disallow: /practice
- Disallow: /result
  Disallow: /dashboard
  Disallow: /account
  Disallow: /admin
- Disallow: /score
- Disallow: /flashcards

  Sitemap: https://practice.cyberskill.world/sitemap.xml
```

Judgement per path, to be confirmed against the actual routes:

| Path | Keep blocked? | Why |
|---|---|---|
| `/api/` | Yes | Never a search result. |
| `/admin`, `/account`, `/dashboard` | Yes | Authenticated surfaces, no public value. |
| `/exam`, `/practice` | **No** | These are the ranking pages. Unblock. |
| `/flashcards` | **No** | Public study content; likely rankable. |
| `/result`, `/score` | No, but add `noindex` | Per-user output. Crawlable so the directive is seen, `noindex` so it stays out. |

Verify each unblocked path enforces authentication in the application before shipping. Robots.txt was never a privacy control, but if anything has been relying on it as one, unblocking exposes that.

### 2.2 `ccaf.cyberskill.world` — pick one

**Option A (preferred): serve no robots.txt of its own.** The host exists only to redirect. Let `/robots.txt` 301 to the practice host along with every other path. Nothing is blocked, every redirect is crawlable.

**Option B: serve a permissive robots.txt** and fix the cross-host `Sitemap:` line, which is ignored today because a sitemap reference must be on the same host:

```
User-Agent: *
Allow: /
```

Either way: **no `Disallow` on the ccaf host.** Every path on it must be fetchable so Google can observe the 301.

### 2.3 `noindex` on the genuinely private routes

For `/result`, `/score`, and anything else per-user. In a Next.js App Router page:

```ts
export const metadata = {
  robots: { index: false, follow: true },
};
```

Or as a header, which also covers non-HTML responses:

```
X-Robots-Tag: noindex, follow
```

`follow: true` is deliberate. The page should not be indexed, but links out of it should still pass.

The existing `Cache-Control: private, no-cache, no-store` on `/exam` is correct and should stay. `noindex` and a private cache header are complementary, not redundant.

### 2.4 Canonical direction

Before lifting the block, confirm the practice pages do **not** canonicalise back to `ccaf`. A canonical pointing at the old host would run the consolidation backwards and undo the migration.

```
$ curl -s https://practice.cyberskill.world/exam | grep -i 'rel="canonical"'
```

The canonical must be the `practice` URL.

### 2.5 IndexNow on the practice host

Bing raises the same recommendation for this property. Mirror what landing-page ships in TASK-SEO-021:

- Serve the key file **at the root**, `/<key>.txt`. This is not a convention, it is a scope rule: IndexNow authorises only URLs inside the key file's directory, so a key at `/indexnow/<key>.txt` cannot submit `/exam`. We hit exactly this on the main domain (live 422 on 2026-07-29 despite the key file returning a correct 200). If a root route file is impossible because a dynamic segment owns the root, use a `beforeFiles` rewrite, as `next.config.ts` in landing-page now does.
- POST `{ host, key, keyLocation, urlList }` to `https://api.indexnow.org/IndexNow` after a publish.
- Same key may be reused across both hosts only if each host serves its own copy of the key file. Simpler to generate one per host.

Reference implementation to copy: `lib/seo/indexnow.ts` and `scripts/indexnow-submit.mjs` in landing-page.

---

## 3. Order of operations

1. Audit authentication on every path about to be unblocked (§2.1).
2. Confirm canonical direction on the practice host (§2.4).
3. Add `noindex` to `/result` and `/score` (§2.3).
4. Ship the practice robots.txt change (§2.1).
5. Ship the ccaf robots.txt change (§2.2).
6. In Search Console, use **Validate Fix** on the "Blocked by robots.txt" issue.
7. Submit the practice sitemap in both Search Console and Bing Webmaster Tools.
8. Add IndexNow (§2.5).

Steps 3 to 5 are the ones that matter. The rest is verification and acceleration.

---

## 4. What to expect

- **Recrawl latency is weeks, not days.** No movement in the first fortnight is not evidence the fix failed.
- **Keep the ccaf 301s for at least twelve months.** Removing them early strands every external link still pointing at the old host. Set a review date rather than an expiry.
- **The 60 URLs in "Discovered / Crawled - currently not indexed" will not all resolve from this.** Those are largely a crawl-budget and authority signal. This fix plus the internal links from landing-page (TASK-SEO-022) addresses the discovery half; the rest is a content and link-earning problem, not a configuration one.
- **IndexNow does nothing for Google.** It shortens discovery latency on Bing and Yandex only.

---

## 5. Separately: `www.cyberskill.world` does not resolve

```
$ curl -sI https://www.cyberskill.world/
curl: (6) Could not resolve host
```

Not part of this patch and not currently costing measurable traffic, but any external link or manually typed address using `www.` fails outright. Worth a DNS record plus a 301 to the apex. Needs its own task.
