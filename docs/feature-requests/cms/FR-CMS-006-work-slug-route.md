---
id: FR-CMS-006
title: "/work/[slug] case-study route — Sanity-driven content + Article JSON-LD + draft preview mode"
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
related_frs: [FR-CMS-004, FR-CMS-005, FR-CMS-007, FR-WEB-008, FR-SEO-002, FR-A11Y-001]
depends_on: [FR-CMS-005, FR-WEB-008]
blocks: []
language: typescript 5.6 + next 15 app router
service: apps/web/app/work/[slug]/
new_files:
  - apps/web/app/work/[slug]/page.tsx
  - apps/web/app/work/[slug]/not-found.tsx
  - apps/web/app/work/[slug]/__tests__/page.unit.test.tsx
  - apps/web/lib/sanity/queries.ts
  - apps/web/lib/sanity/draft-mode.ts
  - apps/web/lib/sanity/sanity-fetch.ts
  - apps/web/components/cms/CaseStudyHero.tsx
  - apps/web/components/cms/CaseStudyBody.tsx

source_pages:
  - docs/01-master-plan-v2.md §5.2 — "Case study routes via Sanity"
  - docs/01-master-plan-v2.md §9.3 — "Case-study deep links from /work index"
  - schema.org/Article structured data documentation
  - Next 15 dynamic routing + draftMode

effort_hours: 6
risk_if_skipped: "Case studies are CyberSkill's proof of work. Without per-case-study deep linking: shares on Twitter/LinkedIn point to /work index, not the actual story. Conversion drops. SEO suffers (no per-page meta + JSON-LD). Editor preview also broken."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `apps/web/app/work/[slug]/page.tsx` as Next.js 15 App Router dynamic route.

2. **MUST** fetch case study by slug from Sanity at build / ISR time:
   ```ts
   const data = await sanityFetch(caseStudyBySlugQuery, { params: { slug }, tags: [`case_study:${slug}`] });
   ```

3. **MUST** call `notFound()` if Sanity returns `null` (slug doesn't match) — renders `not-found.tsx` with 404 status.

4. **MUST** support draft mode preview for editors:
   - Editor visits `/api/draft?slug=museum-exhibit-acme&token=<editor-token>`.
   - Server sets `draftMode().enable()` cookie.
   - Subsequent visits to `/work/museum-exhibit-acme` fetch from Sanity with `perspective: 'previewDrafts'` flag → editor sees unpublished changes.
   - Editor visits `/api/draft/disable` to exit preview.

5. **MUST** include schema.org `Article` JSON-LD on each case study (extends FR-SEO-002 which covers Service schema at site level):
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "Article",
     "headline": "Museum Exhibit — ACME Studio",
     "image": "...hero_image url...",
     "datePublished": "2026-05-19",
     "author": [{ "@type": "Organization", "name": "CyberSkill" }],
     "publisher": { "@type": "Organization", "name": "CyberSkill", "logo": {...} },
     "description": "...summary..."
   }
   </script>
   ```

6. **MUST** include OpenGraph + Twitter Card meta tags via Next.js `generateMetadata()`:
   - `og:title`, `og:description`, `og:image` from Sanity SEO fields (fallback to defaults from case study fields).
   - `twitter:card: summary_large_image`.

7. **MUST** include `<link rel="canonical">` for SEO + `<link rel="alternate" hreflang="...">` per FR-CMS-008.

8. **MUST** render case study fields via dedicated components:
   - `<CaseStudyHero>` — title, client name, hero image, summary.
   - `<CaseStudyBody>` — portable text body via `@portabletext/react`.
   - `<OutcomeMetricsGrid>` — outcome_metrics array.
   - `<GalleryStrip>` — gallery images.
   - `<CallToAction>` — bottom-of-page CTA back to /#cta-hub.

9. **MUST** respect locale per FR-CMS-007:
   - URL `/work/<slug>` = English.
   - URL `/vi/work/<slug>` = Vietnamese.
   - Sanity query filters by `i18n_locale`.

10. **MUST** be ISR-cached (FR-CMS-005 `revalidate = 3600`).

11. **MUST** generate static paths at build time for known case studies via `generateStaticParams()`:
    ```ts
    export async function generateStaticParams() {
      const slugs = await sanityFetch(allCaseStudySlugsQuery);
      return slugs.map(s => ({ slug: s.current }));
    }
    ```

12. **MUST** be a11y compliant (FR-A11Y-001):
    - Single `<h1>` (case study title).
    - Semantic `<article>` root.
    - Image alt-text from Sanity required fields.
    - Skip-link / heading hierarchy.

13. **MUST** show a "Back to all work" link at top + bottom.

14. **MUST** include "Last updated" timestamp (subtle, footer of article).

15. **MUST** include a "Reading time" estimate ("~7 min read"). Computed from body word count.

16. **MUST** load related case studies at bottom — query Sanity for 3 case studies sharing services_used or by recency.

17. **MUST NOT** expose draft preview to non-editors (cookie scoped to editor session; tokenized).

18. **MUST** complete server render in ≤ 800ms (p95) — Sanity query + ISR cache hit.

## §2 — Why this design

**Why dynamic route (vs static export)?** Number of case studies grows; manual route per case study is unmaintainable. Dynamic + generateStaticParams = best of both: static at build time, ISR for new content.

**Why notFound() over redirect?** 404 is the SEO-correct response for "this resource doesn't exist." Redirect would imply "moved" — pollutes search index.

**Why draft mode?** Editor wants to see unpublished case study before clicking Publish. draftMode() is Next 15's first-class API for this — cookie-scoped, server-render-aware.

**Why Article JSON-LD (vs Service or none)?** Schema.org Article is specifically for editorial content (case studies fit). Google Search Console + AI search assistants extract these to enrich results. Without it, our case studies are "just pages."

**Why OG + Twitter meta?** Social sharing previews. Without rich meta, share preview shows generic site description. With it, share preview shows case study title + hero image → higher click-through.

**Why dedicated components per section?** CaseStudyHero and Body have different responsive layouts + perf characteristics (hero is LCP candidate; gallery is below-fold). Separation enables targeted optimization (e.g., hero image priority=true via Next/image).

**Why related case studies?** Increases dwell time + reduces bounce. Visitor finishes one case study → sees 3 more → explores. Empirical: ~25% click-through to related on similar sites.

**Why reading-time estimate?** UX signal — visitor decides whether to invest. Reduces bounce; sets expectation.

**Why 800ms p95 budget?** Total page render budget is ~1.5s (FR-PERF-001 LCP target). Sanity fetch + render = 60% of budget. Headroom for rendering.

**Why isolate draft mode authentication?** Editor session must be verifiable. Bearer token in URL for draft mode → cookie scope on success. Non-editor with leaked URL gets 401.

## §3 — Public surface

```ts
// apps/web/lib/sanity/queries.ts
import { groq } from "next-sanity";

export const caseStudyBySlugQuery = groq`
  *[_type == "case_study" && slug.current == $slug && i18n_locale == $locale][0] {
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    client_name,
    "client_logo": { "url": client_logo.asset->url, "alt": client_logo.alt },
    summary,
    body,
    "hero_image": { "url": hero_image.asset->url, "alt": hero_image.alt },
    gallery[]{ "url": asset->url, alt },
    outcome_metrics[]{ label, value, delta_direction },
    "services_used": services_used[]->{ _id, name, slug },
    published_at,
    i18n_locale,
    seo
  }
`;

export const allCaseStudySlugsQuery = groq`
  *[_type == "case_study" && defined(slug.current) && coalesce(featured_order, 1) > 0] {
    "slug": slug,
    i18n_locale
  }
`;

export const relatedCaseStudiesQuery = groq`
  *[_type == "case_study" && _id != $id && i18n_locale == $locale && (
    count(services_used[@._ref in $services_used_ids]) > 0
  )] | order(published_at desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    "hero_image": { "url": hero_image.asset->url, "alt": hero_image.alt },
    summary,
    client_name
  }
`;
```

```tsx
// apps/web/app/work/[slug]/page.tsx
import { notFound } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/sanity-fetch";
import { draftMode } from "next/headers";
import { caseStudyBySlugQuery, relatedCaseStudiesQuery } from "@/lib/sanity/queries";
import { CaseStudyHero } from "@/components/cms/CaseStudyHero";
import { CaseStudyBody } from "@/components/cms/CaseStudyBody";
import { OutcomeMetricsGrid } from "@/components/cms/OutcomeMetricsGrid";
import { GalleryStrip } from "@/components/cms/GalleryStrip";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { computeReadingTime } from "@/lib/util/reading-time";
import type { Metadata } from "next";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string; locale?: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch(allCaseStudySlugsQuery);
  return slugs.map((s: any) => ({ slug: s.slug.current }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cs = await sanityFetch(caseStudyBySlugQuery, { params: { slug, locale: "en" } });
  if (!cs) return { title: "Case Study Not Found" };

  return {
    title: cs.seo?.meta_title ?? cs.title,
    description: cs.seo?.meta_description ?? cs.summary,
    openGraph: {
      title: cs.seo?.meta_title ?? cs.title,
      description: cs.seo?.meta_description,
      images: [cs.seo?.og_image?.url ?? cs.hero_image.url],
      type: "article",
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      canonical: `/work/${slug}`,
      languages: { "en": `/work/${slug}`, "vi": `/vi/work/${slug}` },
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug, locale = "en" } = await params;
  const isDraftMode = (await draftMode()).isEnabled;

  const cs = await sanityFetch(caseStudyBySlugQuery, {
    params: { slug, locale },
    tags: [`case_study:${slug}`],
    perspective: isDraftMode ? "previewDrafts" : "published",
  });

  if (!cs) notFound();

  const related = await sanityFetch(relatedCaseStudiesQuery, {
    params: { id: cs._id, locale, services_used_ids: cs.services_used.map((s: any) => s._id) },
  });

  const readingMin = computeReadingTime(cs.body);

  return (
    <article aria-labelledby="case-study-title">
      <ArticleJsonLd
        title={cs.title}
        image={cs.hero_image.url}
        datePublished={cs.published_at}
        description={cs.summary}
      />

      <a href="/work" className="back-link">← Back to all work</a>

      <CaseStudyHero
        title={cs.title}
        clientName={cs.client_name}
        clientLogo={cs.client_logo}
        heroImage={cs.hero_image}
        summary={cs.summary}
      />

      <p className="reading-time">~{readingMin} min read</p>

      <CaseStudyBody body={cs.body} />

      {cs.outcome_metrics?.length > 0 && <OutcomeMetricsGrid metrics={cs.outcome_metrics} />}
      {cs.gallery?.length > 0 && <GalleryStrip images={cs.gallery} />}

      <RelatedCaseStudies items={related} />

      <p className="updated-at" aria-label="Last updated">
        Last updated: {new Date(cs._updatedAt).toLocaleDateString(locale)}
      </p>

      <CallToAction />
    </article>
  );
}
```

```tsx
// apps/web/app/work/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div role="alert">
      <h1>Case study not found</h1>
      <p>That case study doesn't exist (yet).</p>
      <a href="/work">See all our work →</a>
    </div>
  );
}
```

```ts
// apps/web/lib/util/reading-time.ts
export function computeReadingTime(portableText: any[]): number {
  const wordsPerMinute = 200;
  const text = extractPlainText(portableText);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

function extractPlainText(blocks: any[]): string {
  return blocks
    ?.filter(b => b._type === "block")
    .map(b => b.children?.map((c: any) => c.text).join(" ") ?? "")
    .join(" ") ?? "";
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Route returns 200 for valid slug | Synthetic: visit known slug |
| 2 | Returns 404 for invalid slug | Visit unknown slug |
| 3 | Article JSON-LD present in HTML | `curl /work/x` includes `application/ld+json` |
| 4 | OG + Twitter meta correct | Inspect `<head>` |
| 5 | Hreflang alternates point to /vi/work/<slug> | `<head>` inspection |
| 6 | Draft mode shows unpublished content | Test with draft cookie |
| 7 | generateStaticParams returns all published slugs | Build log |
| 8 | Related case studies block renders (3 items) | Visual + DOM |
| 9 | Reading-time estimate present | DOM contains "~X min read" |
| 10 | Last updated timestamp present | DOM contains date |
| 11 | revalidate=3600 active | grep page.tsx |
| 12 | Single h1 element | DOM count |
| 13 | a11y: image alt text present | Vitest + AxeBuilder |
| 14 | p95 render time ≤ 800ms | Vercel analytics |
| 15 | Vitest unit tests pass | `pnpm vitest run apps/web/app/work/[slug]/__tests__/page.unit.test.tsx` |
| 16 | Vietnamese locale renders Vietnamese content | Visit /vi/work/<vi-slug> |
| 17 | Draft mode requires bearer token | Test without → 401 |

## §5 — Verification

```tsx
// apps/web/app/work/[slug]/__tests__/page.unit.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/sanity/sanity-fetch", () => ({
  sanityFetch: vi.fn(),
}));
vi.mock("next/headers", () => ({
  draftMode: () => ({ isEnabled: false }),
}));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
}));

import { sanityFetch } from "@/lib/sanity/sanity-fetch";
import CaseStudyPage from "../page";

describe("CaseStudyPage", () => {
  it("renders case study fields", async () => {
    (sanityFetch as any).mockResolvedValueOnce({
      _id: "cs1",
      _updatedAt: "2026-05-15T10:00:00Z",
      title: "Museum Exhibit",
      slug: "museum-exhibit",
      client_name: "ACME Studio",
      hero_image: { url: "https://cdn/x.jpg", alt: "Museum interior" },
      summary: "A museum exhibit...",
      body: [{ _type: "block", children: [{ text: "Lorem ipsum dolor sit amet ".repeat(100) }] }],
      services_used: [{ _id: "c1" }],
      published_at: "2026-05-01",
      i18n_locale: "en",
    }).mockResolvedValueOnce([]);  // related = empty

    const result = await CaseStudyPage({ params: Promise.resolve({ slug: "museum-exhibit" }) });
    render(result as any);

    expect(screen.getByText("Museum Exhibit")).toBeTruthy();
    expect(screen.getByText(/ACME Studio/)).toBeTruthy();
    expect(screen.getByText(/min read/i)).toBeTruthy();
  });

  it("calls notFound when Sanity returns null", async () => {
    (sanityFetch as any).mockResolvedValueOnce(null);
    await expect(CaseStudyPage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("respects draft mode for editors", async () => {
    vi.doMock("next/headers", () => ({ draftMode: () => ({ isEnabled: true }) }));
    (sanityFetch as any).mockResolvedValueOnce({ /* ... */ });
    await CaseStudyPage({ params: Promise.resolve({ slug: "x" }) });
    expect(sanityFetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      perspective: "previewDrafts",
    }));
  });

  it("renders Article JSON-LD", async () => {
    (sanityFetch as any).mockResolvedValueOnce({ /* ... */ }).mockResolvedValueOnce([]);
    const result = await CaseStudyPage({ params: Promise.resolve({ slug: "x" }) });
    render(result as any);
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!.textContent!);
    expect(parsed["@type"]).toBe("Article");
  });

  it("hreflang alternates set in metadata", async () => {
    // Test generateMetadata
    const { generateMetadata } = await import("../page");
    (sanityFetch as any).mockResolvedValueOnce({ title: "x", summary: "y", hero_image: { url: "z" } });
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "x" }) });
    expect(meta.alternates?.languages).toEqual({ en: "/work/x", vi: "/vi/work/x" });
  });

  it("reading time estimates ~X min", async () => {
    const body = [{ _type: "block", children: [{ text: "word ".repeat(400) }] }];
    expect(computeReadingTime(body)).toBe(2);  // 400 / 200 = 2
  });
});
```

## §6 — Dependencies

**Concept:** FR-CMS-004 (schema source), FR-CMS-005 (ISR + revalidate), FR-CMS-007 (locale routing), FR-SEO-002 (overall JSON-LD).

**Operational:** Next 15 App Router, `next-sanity`, `@portabletext/react`, FR-WEB-008 Sanity client.

**Downstream:** FR-SCENE-018 footer "View all case studies" link, FR-CMS-008 hreflang depends on this route pattern.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Slow Sanity query | Vercel analytics | server-side cache 300s; revalidateTag for invalidation |
| 404 on legitimate slug (typo) | Sanity slug mismatch | Editor verifies in Studio; redirect old slugs via `redirects` config |
| Draft mode leaks to non-editor | Cookie leak | Cookie scoped to editor token; auto-expire 24h |
| Article JSON-LD malformed | Schema.org validator | Use type-checked builder |
| Hero image too large (causes slow LCP) | Lighthouse | Next/image with priority + sizes; Sanity image pipeline transforms |
| Reading time miscount on portable text with images/code | Visual check | Filter to `_type === 'block'`; handle child types |
| Related case studies overlap (same as current) | Filter `_id != $id` | AC#8 query |
| Hreflang link points to wrong slug variant | Manual | Sanity i18n_locale match enforces |
| Build-time generateStaticParams excludes new case study | New CS added post-build | ISR catches on first request; 1h max stale |
| Editor sees stale draft data | Cache | Draft mode bypasses cache; revalidate manually on save |
| Portable text custom blocks not rendered | Console warning | Define custom component for each block type |
| Mobile gallery overflow | Visual | Carousel pattern; max-width container |
| 404 returns generic HTML (not branded) | UX | Custom not-found.tsx |
| Vietnamese slug collision with English | Slug unique per locale | Schema validates per-locale uniqueness; document IDs differ |
| `published_at` future date renders as upcoming | UX | Filter `published_at <= now` in query |

## §8 — Deliverable preview

Visitor experience:
1. Visitor lands on `/work/museum-exhibit-acme`.
2. Page renders in ~400ms (ISR cache hit).
3. Hero section: Title "Museum Exhibit — ACME Studio", client logo, hero image (16:9, LCP candidate).
4. "~7 min read" indicator below hero.
5. Portable text body renders with rich formatting.
6. Outcome metrics grid: "30% lift in dwell time", "5x faster load".
7. Image gallery (8 images, lazy-loaded).
8. Related case studies (3 cards, fetched from Sanity).
9. Footer: "Last updated: May 15, 2026" + CTA to /#cta-hub.

Editor preview flow:
1. Editor in Sanity Studio clicks "Preview".
2. Studio links to `/api/draft?slug=...&token=editor-jwt`.
3. Server validates token, enables draft mode cookie.
4. Editor sees unpublished content at `/work/...`.
5. Editor finishes editing; clicks Publish; webhook fires (FR-CMS-005).
6. Visitor sees published version within ~5 seconds.

Sharing on social:
1. Visitor shares URL on LinkedIn.
2. LinkedIn fetches OG meta. Renders preview: title + hero image + description.
3. Click-through rate from social: ~3% (typical for B2B).

## §9 — Notes

**On Article vs CaseStudy JSON-LD:** Schema.org has no `CaseStudy` type. `Article` with `articleSection: "Case Study"` is closest. Some sites use `Product` for case studies — semantically less correct.

**On future enhancements:**
- Video embed support in portable text (slice 2).
- Interactive embeds (sliders, before/after) (slice 3).
- Audio narration of case study via FR-A11Y-004 audio infrastructure (slice 3).

**On Vietnamese case study workflow:** Editor creates Vietnamese version as separate Sanity document with same slug pattern but `i18n_locale: 'vi'`. Frontend URL: `/vi/work/triển-lãm-bảo-tàng-acme`. URLs may differ between locales (different slug).

**On URL slugs in Vietnamese:** Vietnamese diacritics + URL = tricky. Sanity slug auto-slugify removes diacritics by default. Could allow Unicode slugs (Next supports), but reduces shareability. We prefer ASCII slugs even for Vietnamese pages (similar to en).

**On SEO indexing:** Robots.txt allows /work/* crawling. Sitemap.xml lists all published case studies. FR-SEO-001 (sitemap generation) covers.

**On future caching strategies:** Consider stale-while-revalidate edge cache at Vercel CDN level — already on by default for ISR.

*End of FR-CMS-006.*
