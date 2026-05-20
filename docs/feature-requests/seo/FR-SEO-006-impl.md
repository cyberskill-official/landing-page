---
id: FR-SEO-006
title: "XML sitemap + robots.txt + canonical — Next 15 sitemap/robots routes, dynamic case-study inclusion, hreflang"
module: SEO
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: SEO + Frontend Lead
created: 2026-05-16
related_frs: [FR-WEB-008, FR-CMS-006, FR-CMS-008, FR-SEO-001]
depends_on: [FR-WEB-008]
blocks: []
language: typescript 5.6 + next 15
service: apps/web/app/sitemap.ts + apps/web/app/robots.ts
new_files:
  - apps/web/app/sitemap.ts
  - apps/web/app/robots.ts
  - apps/web/app/sitemap-news.ts  (if blog launches; deferred)
  - apps/web/lib/seo/__tests__/sitemap.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §8.4 — "Sitemap + robots + canonical"
  - sitemap.org spec
  - Google Search Console robots.txt + sitemap guidance

effort_hours: 3
risk_if_skipped: "Without sitemap, Google crawler discovers pages slowly (~6 weeks vs ~1 day with sitemap submission). New case studies don't appear in search results for weeks. Without robots.txt, crawler may waste budget on /api or /admin (if added). Without canonical, duplicate /work/x and /vi/work/x compete; both rank lower."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `apps/web/app/sitemap.ts` generating XML sitemap including:
   - `/` (EN home)
   - `/vi/` (VI home)
   - `/lite` and `/vi/lite`
   - `/accessibility` and `/vi/accessibility`
   - `/capabilities`, `/team`, `/careers` and VI variants
   - `/work/[slug]` for every published case study (both locales)
2. **MUST** include `<lastmod>` per URL — derived from Sanity `_updatedAt`.
3. **MUST** include `<changefreq>` and `<priority>` per URL.
4. **MUST** include `<xhtml:link rel="alternate" hreflang="..." href="..."/>` per locale variant (works with FR-CMS-008).
5. **MUST** ship `apps/web/app/robots.ts`:
   - Allow all crawlers on public routes.
   - Disallow `/api/*`, `/sanity/*`, draft URLs.
   - Reference sitemap URL.
6. **MUST** set per-route `<link rel="canonical">` per FR-WEB-008 + FR-CMS-008 alternates.
7. **MUST NOT** include preview/draft URLs in sitemap (draftMode cookie scope).
8. **MUST** be regenerated on case-study publish via FR-CMS-005 revalidate webhook (sitemap re-emits with new URLs).
9. **MUST** be tested via Vitest unit tests + Playwright fetch + sitemap.xml validation.
10. **MUST** submit to Google Search Console + Bing Webmaster post-deploy.

## §2 — Why this design

**Why per-locale URLs in sitemap?** Google indexes both /work/x and /vi/work/x. Listing both signals "these are different content for different audiences."

**Why xhtml:link hreflang in sitemap?** Belt-and-suspenders to HTML `<link>` tags. Some crawlers prefer sitemap; both surfaces.

**Why disallow /api?** Crawlers can waste crawl budget on JSON endpoints. /api isn't user-facing content; no SEO value.

**Why submit to Search Console post-deploy?** Manual one-time submission accelerates indexing.

**Why <lastmod> from Sanity _updatedAt?** Honest signal. Crawlers re-fetch on lastmod change.

**Why <changefreq> + <priority>?** Hints to crawler. Home = high priority, daily changefreq. Case studies = medium priority, weekly.

## §3 — Public surface

```ts
// apps/web/app/sitemap.ts
import { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/sanity-fetch";

const SITE_URL = "https://cyberskill.world";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caseStudies = await sanityFetch<Array<{ slug: { current: string }; _updatedAt: string; i18n_locale: string }>>(
    `*[_type == "case_study" && defined(slug.current)] { "slug": slug, _updatedAt, i18n_locale }`
  );

  const staticRoutes = [
    { url: `${SITE_URL}/`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${SITE_URL}/vi/`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${SITE_URL}/work`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/vi/work`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/capabilities`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/team`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/careers`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/lite`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/accessibility`, priority: 0.5, changeFrequency: "monthly" as const },
    // Vietnamese variants
    { url: `${SITE_URL}/vi/capabilities`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/vi/team`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/vi/careers`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/vi/lite`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/vi/accessibility`, priority: 0.5, changeFrequency: "monthly" as const },
  ];

  const dynamicRoutes = caseStudies.map(cs => {
    const prefix = cs.i18n_locale === "vi" ? "/vi" : "";
    return {
      url: `${SITE_URL}${prefix}/work/${cs.slug.current}`,
      lastModified: new Date(cs._updatedAt),
      priority: 0.8,
      changeFrequency: "monthly" as const,
      // hreflang alternates per FR-CMS-008
      alternates: {
        languages: {
          "en": `${SITE_URL}/work/${cs.slug.current}`,
          "vi": `${SITE_URL}/vi/work/${cs.slug.current}`,
        },
      },
    };
  });

  return [...staticRoutes, ...dynamicRoutes];
}
```

```ts
// apps/web/app/robots.ts
import { MetadataRoute } from "next";

const SITE_URL = "https://cyberskill.world";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/sanity/",
          "/_next/",
          "/admin/",
          "/__draft/",
        ],
      },
      // Optionally tighter rules for known bot UAs (e.g., GPTBot)
      // {
      //   userAgent: "GPTBot",
      //   allow: "/",
      // },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | /sitemap.xml served + valid XML | curl + xmllint |
| 2 | robots.txt served at / robots.txt | curl |
| 3 | Robots allows crawlers; disallows /api, /sanity | grep content |
| 4 | sitemap.xml lists all static + dynamic routes | URL count |
| 5 | hreflang alternates in sitemap entries | XML inspection |
| 6 | lastmod from Sanity _updatedAt | Date check |
| 7 | Canonical per route present | DOM |
| 8 | No preview/draft URLs in sitemap | Sanity perspective=published only |
| 9 | Vitest unit tests pass | pnpm vitest |
| 10 | Google Search Console submission OK | Manual |
| 11 | Sitemap regenerates on case-study publish | FR-CMS-005 webhook triggers revalidate |
| 12 | XML namespaces correct (xhtml:link) | Schema validate |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import sitemap from "../sitemap";

vi.mock("@/lib/sanity/sanity-fetch", () => ({
  sanityFetch: vi.fn().mockResolvedValue([
    { slug: { current: "test-en" }, _updatedAt: "2026-05-15T10:00:00Z", i18n_locale: "en" },
    { slug: { current: "test-vi" }, _updatedAt: "2026-05-14T10:00:00Z", i18n_locale: "vi" },
  ]),
}));

describe("sitemap", () => {
  it("includes static routes", async () => {
    const entries = await sitemap();
    const urls = entries.map(e => e.url);
    expect(urls).toContain("https://cyberskill.world/");
    expect(urls).toContain("https://cyberskill.world/vi/");
  });

  it("includes case studies dynamically", async () => {
    const entries = await sitemap();
    const urls = entries.map(e => e.url);
    expect(urls).toContain("https://cyberskill.world/work/test-en");
    expect(urls).toContain("https://cyberskill.world/vi/work/test-vi");
  });

  it("includes hreflang alternates on case studies", async () => {
    const entries = await sitemap();
    const csEntry = entries.find(e => e.url.endsWith("/work/test-en"));
    expect(csEntry?.alternates?.languages).toEqual({
      "en": "https://cyberskill.world/work/test-en",
      "vi": "https://cyberskill.world/vi/work/test-en",
    });
  });

  it("uses lastModified from Sanity", async () => {
    const entries = await sitemap();
    const csEntry = entries.find(e => e.url.endsWith("/work/test-en"));
    expect(csEntry?.lastModified).toEqual(new Date("2026-05-15T10:00:00Z"));
  });
});
```

## §6 — Dependencies

**Concept:** FR-WEB-008 (canonical setup), FR-CMS-006 (case-study source), FR-CMS-008 (hreflang co-publication), FR-SEO-001 (overall SEO).

**Operational:** Next 15 MetadataRoute.Sitemap + Robots, Sanity query for dynamic.

**Downstream:** Google Search Console, Bing Webmaster Tools.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Sitemap pings stale URL | AC#11 | Webhook regenerates on publish |
| Robots.txt blocks legitimate crawler | AC#3 | Test with `User-Agent: Googlebot` |
| Sitemap XML malformed | AC#1 + xmllint | Test in CI |
| Sanity fetch fails at build | Build error | Cache last good sitemap; serve stale rather than break |
| /api leak in sitemap | AC#3 | Exclude pattern explicit |
| Draft URLs in sitemap | AC#8 | perspective=published only |
| hreflang missing on dynamic routes | AC#5 | alternates per entry |
| Sitemap URL > 50K (sitemap.org limit) | At ~1000 case studies | Split into sitemap-index + per-section sitemaps |
| Google Search Console rejects | Manual | Validate XML; check submit cadence |
| Last-modified header missing on sitemap.xml | OK; sitemap has its own lastmod | N/A |
| robots syntax error | Robots Testing Tool | Use exact spec syntax |
| Sitemap regen frequency too high (every PR) | Slow CI | Static at build; dynamic on webhook only |
| Bingbot / DuckDuckGo behave differently | Periodic check | Validate each via their tools |
| Canonical loop (a → b → a) | Google Console warning | Always self-canonical |
| Vietnamese URLs URL-encoded (ASCII fallback) | Spec | ASCII slugs (see FR-CMS-006) |

## §8 — Deliverable preview

`/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://cyberskill.world/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://cyberskill.world/" />
    <xhtml:link rel="alternate" hreflang="vi" href="https://cyberskill.world/vi/" />
  </url>
  <url>
    <loc>https://cyberskill.world/work/museum-exhibit-acme</loc>
    <lastmod>2026-05-15T10:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://cyberskill.world/work/museum-exhibit-acme" />
    <xhtml:link rel="alternate" hreflang="vi" href="https://cyberskill.world/vi/work/museum-exhibit-acme" />
  </url>
  ...
</urlset>
```

`/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /sanity/
Disallow: /_next/
Disallow: /admin/
Disallow: /__draft/

Sitemap: https://cyberskill.world/sitemap.xml
Host: https://cyberskill.world
```

## §9 — Notes

**On sitemap index (future scale):** When case studies exceed 1000, split sitemap. Slice 3.

**On GPTBot / Claude-Web:** AI crawlers respect robots.txt. We allow them by default (no Disallow). Could selectively block per company policy.

**On Vietnamese URLs:** ASCII slugs per FR-CMS-006. Sitemap doesn't need URL encoding.

*End of FR-SEO-006.*
