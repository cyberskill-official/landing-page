---
id: FR-CMS-008
title: "hreflang link tags + x-default — SEO locale signaling across all routes with Google Search Console validation"
module: CMS
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: Frontend Lead + SEO
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-CMS-006, FR-CMS-007, FR-SEO-001, FR-SEO-002, FR-A11Y-001]
depends_on: [FR-CMS-007]
blocks: []
language: typescript 5.6 + next 15
service: apps/web/app/ + apps/web/lib/seo/
new_files:
  - apps/web/lib/seo/hreflang.ts
  - apps/web/lib/seo/__tests__/hreflang.unit.test.ts
  - apps/web/tests/seo/hreflang.e2e.spec.ts
  - apps/web/app/layout.tsx  (extend metadata)
  - apps/web/app/work/[slug]/page.tsx  (already covered via generateMetadata in FR-CMS-006)

source_pages:
  - docs/01-master-plan-v2.md §8.3 — "hreflang link tags for SEO"
  - Google Search Console hreflang documentation
  - W3C / IETF BCP 47 language tag spec
  - FR-CMS-007 locale infrastructure (this builds on it)

effort_hours: 2
risk_if_skipped: "Without hreflang, Google can't tell which page is the English version vs Vietnamese version. Results: Vietnamese visitors see English page in search (or vice versa), reducing organic CTR ~30%. Also: duplicate-content penalty risk for /work/x and /vi/work/x. hreflang is SEO baseline for international sites."
---

## §1 — Description (BCP-14 normative)

1. **MUST** include `<link rel="alternate" hreflang="...">` tags in `<head>` for every public route:

   ```html
   <link rel="alternate" hreflang="en" href="https://cyberskill.world/work/museum-exhibit" />
   <link rel="alternate" hreflang="vi" href="https://cyberskill.world/vi/work/museum-exhibit" />
   <link rel="alternate" hreflang="x-default" href="https://cyberskill.world/work/museum-exhibit" />
   ```

2. **MUST** apply on ALL public routes:
   - `/` and `/vi/`
   - `/work` and `/vi/work`
   - `/work/[slug]` and `/vi/work/[slug]` (per case study)
   - `/capabilities` and `/vi/capabilities`
   - `/team` and `/vi/team`
   - `/careers` and `/vi/careers`
   - `/lite` and `/vi/lite`
   - `/accessibility` and `/vi/accessibility`

3. **MUST NOT** mis-pair hreflang with content language:
   - `hreflang="vi"` MUST point to URL containing Vietnamese content (`/vi/...`)
   - `hreflang="en"` MUST point to URL containing English content (`/...`)
   - `hreflang="x-default"` MUST point to the default (English) version, NOT a separate selector page

4. **MUST** include self-referential entry — page MUST include its own hreflang in the alternates list. (Google's spec: each page lists itself + all alternates.)

5. **MUST** be reciprocal — if page A lists page B as `hreflang="vi"`, then page B MUST list page A as `hreflang="en"`. Asymmetric pairing → Google ignores hreflang entirely for those URLs.

6. **MUST** use absolute URLs (with `https://cyberskill.world/...`) — relative URLs are not allowed by Google's hreflang spec.

7. **MUST** use ISO 639-1 language code (`en`, `vi`) — NOT `en-US` or `vi-VN` unless we ship region-specific variants. (We ship language-only, so plain `en` / `vi` is correct.)

8. **MUST** apply via Next.js `generateMetadata()` API at the layout level (per-route override allowed):
   ```ts
   export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
     return {
       alternates: {
         canonical: `/work/${params.slug}`,
         languages: {
           "en": `https://cyberskill.world/work/${params.slug}`,
           "vi": `https://cyberskill.world/vi/work/${params.slug}`,
           "x-default": `https://cyberskill.world/work/${params.slug}`,
         },
       },
     };
   }
   ```

9. **MUST** handle case-study slug variance between locales (en slug may differ from vi slug; FR-CMS-004 schema allows per-locale slug):
   - English: `/work/museum-exhibit-acme`
   - Vietnamese: `/vi/work/trien-lam-bao-tang-acme`
   - hreflang links reflect the actual locale-specific slug.

10. **MUST** verify hreflang setup via:
    - Google Search Console hreflang validator (manual + periodic).
    - Vitest unit tests on `buildHreflangTags()` helper.
    - Playwright E2E test that fetches HTML and asserts presence of tags on every route.

11. **MUST** include hreflang in robots.txt allow + sitemap.xml entries (FR-SEO-001) per Google's recommendation.

12. **MUST NOT** include hreflang on:
    - `/api/*` endpoints (not user-facing content)
    - `/sanity/*` (CMS Studio, not public)
    - Draft mode pages (not public)
    - 404 pages

13. **SHOULD** include hreflang in HTTP headers as belt-and-suspenders backup (`Link: <url>; rel="alternate"; hreflang="vi"`). Optional per Google's spec but useful for PDF / non-HTML content.

14. **MUST** be auditable — a single helper `buildHreflangTags(currentPath, locale)` returns the correct alternates object, eliminating per-page bespoke code.

15. **MUST** survive Sanity-driven slug changes — if editor renames a case study's Vietnamese slug, hreflang on English version updates within ISR window (FR-CMS-005 revalidate).

## §2 — Why this design

**Why hreflang at all?** Google needs to know which page is for which language. Without hreflang:
- Vietnamese visitor searches in Vietnamese → Google may show English page in results.
- English visitor searches in English → Google may show Vietnamese page in results.
- Both → bad CTR + bounce rate.

With hreflang: Google routes correctly. ~30% organic CTR improvement on international sites per Google's case studies.

**Why x-default = English?** Spec says x-default is the fallback for "unmatched languages" (Klingon, Esperanto, etc.). We default to English; common practice. Could be a country-selector page if we had one (we don't).

**Why self-referential + reciprocal?** Google's spec strict: any asymmetry → ALL hreflang for those URLs ignored. Self-referential entry is the cheapest way to satisfy both rules simultaneously.

**Why absolute URLs?** Spec requires. Google has rejected relative URLs since 2019. Don't try to be clever.

**Why ISO 639-1 language only (not `en-US`)?** We ship language-only content. `en-US` implies US-specific variant; we have one English variant for all English speakers. Using `en` is correct semantically and avoids "why does my Australian friend see US-specific text?" confusion.

**Why generateMetadata (vs `<head>` direct)?** Next.js 15 metadata API is the canonical way. Centralized, type-checked, server-rendered. Manual `<head>` requires duplicate handling per page.

**Why helper function?** Avoid copy-paste across 8+ routes. Single source; if Google's spec changes (rare), one edit.

**Why E2E verification?** Hreflang is invisible to humans; only Google sees it. Without automated tests, regressions go unnoticed for weeks. E2E test fetches HTML, asserts tags present.

**Why per-locale slugs?** Vietnamese case study titles in Vietnamese language; slugs derive from titles. English slug + Vietnamese title = mismatched URL. Per-locale slugs feel natural to local users.

## §3 — Public surface

```ts
// apps/web/lib/seo/hreflang.ts
import type { Metadata } from "next";

const SITE_URL = "https://cyberskill.world";

interface HreflangOptions {
  path: string;            // e.g. "/work/museum-exhibit-acme"
  vietnameseSlug?: string; // if Vietnamese has different slug
}

export function buildAlternates(opts: HreflangOptions): Metadata["alternates"] {
  const cleanPath = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const enPath = cleanPath;
  const viPath = opts.vietnameseSlug
    ? cleanPath.replace(/\/work\/[^/]+/, `/work/${opts.vietnameseSlug}`)
    : cleanPath;

  return {
    canonical: enPath,
    languages: {
      "en":        `${SITE_URL}${enPath}`,
      "vi":        `${SITE_URL}/vi${viPath}`,
      "x-default": `${SITE_URL}${enPath}`,
    },
  };
}

// For pages that don't have locale-specific slugs (most pages)
export function buildStandardAlternates(path: string): Metadata["alternates"] {
  return buildAlternates({ path });
}
```

```tsx
// apps/web/app/layout.tsx (root metadata)
import { buildStandardAlternates } from "@/lib/seo/hreflang";

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale = "en" } = await params;
  return {
    metadataBase: new URL("https://cyberskill.world"),
    alternates: buildStandardAlternates("/"),  // root page
    // ... other meta ...
  };
}
```

```tsx
// apps/web/app/work/[slug]/page.tsx (per-case-study)
import { buildAlternates } from "@/lib/seo/hreflang";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cs = await sanityFetch(caseStudyBySlugQuery, { params: { slug, locale: "en" } });
  // Look up Vietnamese counterpart's slug
  const vi = await sanityFetch(caseStudyBySlugQuery, { params: { slug, locale: "vi" } });

  return {
    title: cs.title,
    description: cs.summary,
    alternates: buildAlternates({
      path: `/work/${slug}`,
      vietnameseSlug: vi?.slug,
    }),
  };
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | 3 hreflang tags present on every route (en + vi + x-default) | curl HTML; grep `hreflang` |
| 2 | x-default points to English (root or canonical equivalent) | DOM inspection |
| 3 | Validation via Google Search Console hreflang report shows 0 errors | Manual check post-deploy |
| 4 | Self-referential entry (page lists itself in alternates) | Vitest assertion |
| 5 | Reciprocal — vi page links back to en | E2E fetch both; compare |
| 6 | Absolute URLs (start with https://) | Regex check on alternates values |
| 7 | ISO 639-1 codes only (en, vi — not en-US) | Regex check |
| 8 | Per-locale slugs reflected in hreflang | Test case: en slug ≠ vi slug |
| 9 | Not present on /api routes | curl /api/lead; grep absent |
| 10 | Vitest unit tests pass | `pnpm vitest run apps/web/lib/seo/__tests__/hreflang.unit.test.ts` |
| 11 | Playwright E2E test passes on every locale + route | `pnpm playwright test apps/web/tests/seo/hreflang.e2e.spec.ts` |
| 12 | hreflang values survive ISR after content rename | Manual + post-deploy check |
| 13 | Lighthouse SEO score includes hreflang signal | Lighthouse audit |
| 14 | Robots.txt + sitemap.xml include hreflang per FR-SEO-001 | Cross-check |

## §5 — Verification

```ts
// apps/web/lib/seo/__tests__/hreflang.unit.test.ts
import { describe, it, expect } from "vitest";
import { buildAlternates, buildStandardAlternates } from "../hreflang";

describe("buildStandardAlternates", () => {
  it("builds 3 entries with absolute URLs", () => {
    const r = buildStandardAlternates("/work");
    expect(r?.languages).toEqual({
      "en":        "https://cyberskill.world/work",
      "vi":        "https://cyberskill.world/vi/work",
      "x-default": "https://cyberskill.world/work",
    });
  });

  it("x-default matches English", () => {
    const r = buildStandardAlternates("/");
    expect(r?.languages?.["x-default"]).toBe(r?.languages?.["en"]);
  });

  it("uses ISO 639-1 codes only", () => {
    const r = buildStandardAlternates("/team");
    const codes = Object.keys(r?.languages ?? {}).filter(c => c !== "x-default");
    for (const code of codes) {
      expect(code).toMatch(/^[a-z]{2}$/);  // 2-letter code only
    }
  });

  it("absolute URLs only", () => {
    const r = buildStandardAlternates("/anything");
    for (const url of Object.values(r?.languages ?? {})) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("self-referential entry present", () => {
    const r = buildStandardAlternates("/work/x");
    const enUrl = r?.languages?.["en"];
    // 'en' entry should be the page's own URL when page is English
    expect(enUrl).toBe("https://cyberskill.world/work/x");
  });
});

describe("buildAlternates with locale-specific slug", () => {
  it("uses Vietnamese slug for vi alternate when provided", () => {
    const r = buildAlternates({ path: "/work/museum-exhibit-acme", vietnameseSlug: "trien-lam-bao-tang-acme" });
    expect(r?.languages?.["vi"]).toBe("https://cyberskill.world/vi/work/trien-lam-bao-tang-acme");
    expect(r?.languages?.["en"]).toBe("https://cyberskill.world/work/museum-exhibit-acme");
  });

  it("falls back to same slug when no vi variant", () => {
    const r = buildAlternates({ path: "/work/x" });
    expect(r?.languages?.["vi"]).toBe("https://cyberskill.world/vi/work/x");
  });
});
```

```ts
// apps/web/tests/seo/hreflang.e2e.spec.ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  "/", "/work", "/capabilities", "/team", "/careers", "/accessibility", "/lite",
  "/vi/", "/vi/work", "/vi/capabilities", "/vi/team", "/vi/careers", "/vi/accessibility", "/vi/lite",
];

for (const route of ROUTES) {
  test(`hreflang on ${route}`, async ({ page }) => {
    await page.goto(route);
    const tags = await page.locator("link[rel='alternate'][hreflang]").all();
    const hreflangs = await Promise.all(tags.map(t => t.getAttribute("hreflang")));
    expect(hreflangs).toContain("en");
    expect(hreflangs).toContain("vi");
    expect(hreflangs).toContain("x-default");
  });
}

test("absolute URLs only", async ({ page }) => {
  await page.goto("/");
  const tags = await page.locator("link[rel='alternate'][hreflang]").all();
  for (const tag of tags) {
    const href = await tag.getAttribute("href");
    expect(href).toMatch(/^https:\/\//);
  }
});

test("x-default matches English version", async ({ page }) => {
  await page.goto("/work/museum-exhibit-acme");
  const xDefault = await page.locator("link[hreflang='x-default']").getAttribute("href");
  const en = await page.locator("link[hreflang='en']").getAttribute("href");
  expect(xDefault).toBe(en);
});

test("hreflang absent on /api routes", async ({ page }) => {
  const res = await page.request.get("/api/lead");
  const html = await res.text();
  expect(html).not.toMatch(/hreflang/);
});

test("reciprocal — en page lists vi correctly", async ({ page }) => {
  await page.goto("/work/museum-exhibit-acme");
  const viUrl = await page.locator("link[hreflang='vi']").getAttribute("href");
  expect(viUrl).toMatch(/\/vi\/work\//);
  await page.goto(new URL(viUrl!).pathname);
  const enUrl = await page.locator("link[hreflang='en']").getAttribute("href");
  expect(enUrl).toMatch(/^https:\/\/cyberskill\.world\/work\//);
});
```

## §6 — Dependencies

**Concept:** FR-CMS-007 (locale infrastructure provides language detection + URLs), FR-CMS-006 (case-study routes need hreflang), FR-SEO-001 (sitemap consumes locale info), FR-SEO-002 (overall SEO meta).

**Operational:** Next.js 15 generateMetadata API.

**Downstream:** Google Search Console (external; reads our hreflang), FR-SEO-001 sitemap, FR-CMS-vi content publication.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Hreflang loop (en→vi→en→vi infinitely) | Google rejects | Self-referential entry + cap depth |
| Relative URL mistake | AC#6 regex | Helper enforces absolute via SITE_URL constant |
| Self-referential entry missing | AC#4 | helper always includes self |
| Reciprocal break (en lists vi but vi doesn't list en) | AC#5 | Same helper on both sides |
| Vietnamese slug different but EN page lists wrong slug | Sanity query | Both pages query each other's slug at metadata generation |
| `en-US` vs `en` typo | AC#7 | Lint regex |
| Hreflang on /api leaks | AC#9 | metadata only set on user-facing routes |
| Mismatch after slug rename | AC#12 | ISR revalidate on Sanity webhook (FR-CMS-005) |
| Lighthouse missed hreflang signal | AC#13 | Verify Lighthouse SEO output |
| Hreflang in HTTP headers + HTML conflicting | Optional Link header rejected | If used, exact same values |
| Region-specific variant requested (en-AU) | Out of scope | Stay language-only; document constraint |
| Sitemap hreflang missing | FR-SEO-001 cross-check | Sitemap entries include `<xhtml:link>` per locale |
| Manual hardcoded `<head>` link conflicting | grep | Single source via helper |
| URL trailing slash inconsistency | URL diff | Always trim trailing /, except root /; use consistent format |
| Future RTL language (e.g. Arabic) | Not in slice 1 | When added: lang attr + CSS direction |

## §8 — Deliverable preview

Example `/work/museum-exhibit-acme` HTML head:
```html
<head>
  <title>Museum Exhibit — ACME Studio | CyberSkill</title>
  <meta name="description" content="How we built..." />
  <link rel="canonical" href="https://cyberskill.world/work/museum-exhibit-acme" />
  <link rel="alternate" hreflang="en" href="https://cyberskill.world/work/museum-exhibit-acme" />
  <link rel="alternate" hreflang="vi" href="https://cyberskill.world/vi/work/trien-lam-bao-tang-acme" />
  <link rel="alternate" hreflang="x-default" href="https://cyberskill.world/work/museum-exhibit-acme" />
  ...
</head>
```

Vietnamese counterpart `/vi/work/trien-lam-bao-tang-acme` HTML head (reciprocal):
```html
<head>
  <title>Triển lãm Bảo tàng — ACME Studio | CyberSkill</title>
  ...
  <link rel="alternate" hreflang="en" href="https://cyberskill.world/work/museum-exhibit-acme" />
  <link rel="alternate" hreflang="vi" href="https://cyberskill.world/vi/work/trien-lam-bao-tang-acme" />
  <link rel="alternate" hreflang="x-default" href="https://cyberskill.world/work/museum-exhibit-acme" />
  ...
</head>
```

## §9 — Notes

**On Google Search Console validation cadence:** Post-deploy, run "International Targeting" report. Expect 0 errors. Re-check weekly during P5/P6 launch ramp.

**On hreflang vs canonical:** Both must coexist. Canonical = "this is the master URL for this content." Hreflang = "these other URLs are localized variants of the same content." Google reads both.

**On Vietnamese-locale-specific case studies:** Some case studies might only have Vietnamese version (no English counterpart). In that case, hreflang en alternate points to /work index (or simply omits en, with x-default = vi page). Document edge case.

**On future region targeting:** If we ever ship Australian-English variant (`en-AU` with different timezone clock defaults), would add `en-AU` and `en-GB` etc. Out of slice 1 scope.

**On AI search optimization:** ChatGPT, Perplexity, Claude assistants also consume hreflang. Same setup serves both Google and AI search.

**On RSS / Atom feeds:** If we ship a blog with feeds, each feed gets its own hreflang variant. Out of slice 1 scope.

*End of FR-CMS-008.*
