---
id: TASK-SEO-023
title: "Emit x-default in the sitemap so it agrees with the head hreflang set"
status: ready_to_review
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [gsc/2026-07-29-coverage]
---

# TASK-SEO-023: Emit x-default in the sitemap so it agrees with the head hreflang set

## 0. Why (evidence)

`resolveMetadata` in `lib/content/metadata.ts` emits three hreflang alternates into the document head: `en`, `vi`, and `x-default` pointing at the English URL. `app/sitemap.ts` builds its `alternates.languages` map with only `en` and `vi`. The live sitemap confirms it: every `<url>` entry carries two `xhtml:link` elements, never three.

The two signals therefore disagree about whether an x-default exists. Google reconciles conflicting hreflang sets by discarding the annotation it cannot verify, so the cheapest reading of this is that the x-default is being ignored for every route. The comparison case is instructive: `practice.cyberskill.world/sitemap.xml` already emits all three, including x-default, on every entry.

The GSC coverage export shows one page under "Alternate page with proper canonical tag", which is the expected and correct state for an hreflang pair and is not a defect. This task is not about that row. It is about removing a genuine inconsistency between two hreflang declarations of the same route set, which is the kind of ambiguity that suppresses the whole annotation.

## 1. Description (normative)

- 1.1 Every URL entry in the sitemap SHALL declare the same hreflang key set the document head declares for that route, including `x-default`.
- 1.2 The `x-default` target SHALL be the English URL for the route, matching the head exactly.
- 1.3 The head and the sitemap SHALL derive their alternate maps from one shared builder, so the two cannot drift again.
- 1.4 The sitemap's entry point to that builder SHALL reject a route outside the registry, because the sitemap only ever iterates the registry and a miss there means drift.
- 1.5 A routable page deliberately absent from the sitemap registry SHALL still receive a complete alternate set in its head, because the strict entry point guards the sitemap and MUST NOT make a live page fail to render.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every entry the sitemap generates carries en, vi and x-default keys - test: `seo/sitemap-hreflang-complete`
- [ ] AC for 1.2 - the x-default href equals the en href for the same route - test: `seo/sitemap-x-default-target`
- [ ] AC for 1.3 - head and sitemap alternates are byte-identical for every route in the registry - test: `seo/hreflang-head-sitemap-parity`
- [ ] AC for 1.4 - the helper returns a three-key map for every registry route and rejects an unknown route - test: `seo/hreflang-helper-total`
- [ ] AC for 1.5 - /lite, which is routable but not in the registry, still resolves a three-key head alternate set - test: `seo/hreflang-helper-total`

## 3. Edge cases

- The root route builds its path as an empty string, not `/`; the helper must produce `/en` and not `/en/` for it.
- `/lite` is a real, routable page that is deliberately not in the sitemap registry. A strict helper wired into `resolveMetadata` turns that documented fallback into a build failure, which is why the strict check guards only the sitemap entry point and the builder underneath stays total.
- Adding a third locale later must extend both surfaces from the single helper, with x-default still resolving to the default locale rather than the newest one.
- A route present in the registry but not routable in the app would put a 404 in the sitemap; that pairing is checked by the existing sitemap-completeness gate and is not re-litigated here.

## 4. Out of scope / non-goals

- Adding or removing routes from the sitemap (TASK-SEO-012 owns completeness and lastmod).
- Canonical tag behaviour, which is already correct.
- The "Alternate page with proper canonical tag" row in the GSC export, which is the expected state for a working hreflang pair and needs no fix.

## 5. Protected invariants this task must not weaken

- The route registry stays the single source of truth for the site's URL set.
- The head hreflang set is already correct and must not be reduced to match the sitemap; the sitemap moves toward the head, not the reverse.
