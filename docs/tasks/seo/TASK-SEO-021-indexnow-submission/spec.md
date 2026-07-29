---
id: TASK-SEO-021
title: "IndexNow submission so Bing and Yandex learn about changes without waiting for a crawl"
status: ready_to_review
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [bing-wmt/2026-07-29-top-recommendation, gsc/2026-07-29-coverage]
---

# TASK-SEO-021: IndexNow submission so Bing and Yandex learn about changes without waiting for a crawl

## 0. Why (evidence)

Bing Webmaster Tools, 29 Jul 2026, lists exactly one Top Recommendation for cyberskill.world: "Set up IndexNow and boost your site's visibility in search engines within minutes." The repo has no IndexNow implementation of any kind - a grep for `indexnow` across the tree returns nothing.

The Google Search Console coverage export for the same day shows 37 URLs in "Discovered - currently not indexed" and 23 in "Crawled - currently not indexed" against 51 indexed. Those two states are crawl-budget and discovery-latency states, not content-quality verdicts. IndexNow does not fix quality, and it does nothing for Google, which has not adopted the protocol. What it does fix is the interval between publishing a change and Bing or Yandex learning about it: a push instead of a wait for the next crawl.

The cost is one static key file and one HTTP POST per publish. The protocol is documented at https://www.bing.com/indexnow/getstarted.

## 1. Description (normative)

- 1.1 The site SHALL serve an IndexNow key file at `/<key>.txt` returning the key as `text/plain`, where the key is read from a single environment variable and never hardcoded in the repo.
- 1.2 The submission helper SHALL POST the JSON body form documented by the protocol (`host`, `key`, `keyLocation`, `urlList`) to the IndexNow endpoint, and SHALL batch at most 10000 URLs per request.
- 1.3 When the IndexNow key is absent from the environment, the key route SHALL return 404 and the submission helper SHALL no-op with a logged reason, so that a deploy without the credential is degraded rather than broken.
- 1.4 The submission helper SHALL treat any 2xx response as success and SHALL NOT throw on a non-2xx response, so that a search-engine outage can never fail a deploy or a request.
- 1.5 A repository script SHALL submit every URL in the generated sitemap, so a publish can push the full set without hand-maintaining a URL list.
- 1.6 The key SHALL be validated as protocol-conformant (8 to 128 characters, hexadecimal) before any request is made, and an invalid key SHALL be treated as an absent key per 1.3.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the key route returns 200 text/plain with exactly the configured key as its body - test: `seo/indexnow-key-route`
- [ ] AC for 1.2 - a submission builds the documented payload shape and chunks a list longer than 10000 into multiple requests - test: `seo/indexnow-payload`
- [ ] AC for 1.3 - with no key in the environment the route 404s and the helper reports a skip without making a request - test: `seo/indexnow-degrades-without-key`
- [ ] AC for 1.4 - a 500 or a network error from the endpoint resolves to a non-throwing failure result - test: `seo/indexnow-never-throws`
- [ ] AC for 1.5 - the submit script derives its URL list from the same route registry the sitemap uses - test: `seo/indexnow-sitemap-parity`
- [ ] AC for 1.6 - a key that is too short, too long, or non-hexadecimal is rejected and treated as absent - test: `seo/indexnow-key-validation`

## 3. Edge cases

- Empty URL list: submit nothing and report a skip rather than posting an empty `urlList`.
- A key containing a path separator or a dot must not be interpolated into the route path, or the key file becomes a path-traversal surface. The route derives its filename from the validated key only.
- The endpoint returns 422 when the key file cannot be fetched. That is a configuration error, not a transient one, and must be distinguishable in the logged result.
- Preview and local deploys must not submit production URLs. Submission is gated on the production environment.
- A duplicate URL in the list is the caller's problem, not the endpoint's: de-duplicate before sending so the quota is not spent twice.

## 4. Out of scope / non-goals

- Google indexing. Google does not participate in IndexNow; nothing here changes Googlebot behaviour.
- The IndexNow key file for practice.cyberskill.world, which is a different application in a different repository (TASK-BIZ-017).
- Automatic submission on every content edit. This task ships the mechanism and a manual script; wiring it into a deploy hook is a follow-on decision.

## 5. Protected invariants this task must not weaken

- No secret is exposed to the browser. The IndexNow key is a server-only environment variable and never reaches a `NEXT_PUBLIC_` binding.
- A missing or invalid credential degrades the feature and never fails a build, a deploy, or a page render.
- The route registry in `lib/content/metadata.ts` stays the single source of truth for the site's URL set; IndexNow reads it rather than keeping a second list.
