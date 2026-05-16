---
id: FR-SEO-004
title: "OpenGraph + Twitter meta — 1200×630 hero render, per-route OG variants, absolute URLs"
module: SEO
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: SEO + Designer + Frontend Lead
created: 2026-05-16
related_frs: [FR-SCENE-019, FR-CMS-006, FR-CMS-007, FR-SEO-001, FR-DS-001]
depends_on: [FR-SCENE-019]
blocks: []
language: typescript 5.6 + react 19 + next 15 metadata API
service: apps/web/app/ + apps/web/public/
new_files:
  - apps/web/public/og.jpg  (1200×630 default OG image)
  - apps/web/public/og-vi.jpg  (Vietnamese variant)
  - apps/web/app/work/[slug]/opengraph-image.tsx  (dynamic per-case-study OG)
  - apps/web/lib/seo/og-image-helpers.ts
  - apps/web/components/seo/__tests__/og-meta.unit.test.tsx

source_pages:
  - docs/01-master-plan-v2.md §8.3 — "OG + Twitter meta with 1200×630 hero render"
  - OpenGraph Protocol specification
  - Twitter Cards documentation

effort_hours: 4
risk_if_skipped: "Social sharing previews look generic without OG meta. LinkedIn / X / Slack share shows plain URL + title. Click-through rate from social ~0.5% (vs 3-5% with rich OG card). Brand image opportunity lost on every share."
---

## §1 — Description (BCP-14 normative)

1. **MUST** include OpenGraph meta on every public route:
   - `og:title`, `og:description`, `og:image`, `og:image:width=1200`, `og:image:height=630`, `og:url`, `og:type` (website / article), `og:locale` (`en_US` / `vi_VN`).
2. **MUST** include Twitter Card meta:
   - `twitter:card` = `summary_large_image`
   - `twitter:title`, `twitter:description`, `twitter:image`
3. **MUST** ship the default OG image at `/og.jpg` (1200×630, Lumi against gold-on-brown + slogan "Turn Your Will Into Real" baked in).
4. **MUST** ship a Vietnamese OG variant at `/og-vi.jpg` (same composition, slogan localized).
5. **MUST** support per-route OG variants for case studies — `/work/[slug]` generates OG image from case-study hero + title via Next.js `opengraph-image.tsx` API.
6. **MUST** use absolute URLs for `og:image` (LinkedIn requires; relative URLs are silently ignored).
7. **MUST** apply via Next.js `generateMetadata()` API:
   ```ts
   export async function generateMetadata({ params }): Promise<Metadata> {
     return {
       openGraph: { title, description, images: [{ url, width: 1200, height: 630 }], type: "article", locale: "en_US" },
       twitter: { card: "summary_large_image", title, description, images: [url] },
     };
   }
   ```
8. **MUST** be tested by Playwright fetch + DOM inspection on every route.
9. **MUST** validate via LinkedIn Post Inspector + Twitter Card Validator + Facebook Debugger before launch.
10. **MUST** include alt-text-equivalent for og:image via `og:image:alt` — accessibility on social platforms.

## §2 — Why this design

**Why 1200×630?** Universal standard. LinkedIn, X, Facebook, Slack all preview at this ratio. Smaller images get cropped.

**Why static og.jpg (not dynamic)?** Root page is stable. Static file = fastest CDN delivery. Dynamic only when content varies (case studies).

**Why Vietnamese variant?** Vietnamese-language pages need Vietnamese slogan in OG image. Localization signal extends to social sharing.

**Why dynamic per case study?** Each case study has unique hero + title. Static OG would be generic. Next.js `opengraph-image.tsx` generates at build/ISR time.

**Why absolute URLs?** LinkedIn's crawler resolves relative URLs against its own domain (broken). Always use `https://cyberskill.world/og.jpg`.

**Why og:image:alt?** Screen readers on social platforms read alt text. Without it, sharer hears nothing for the image. WCAG-adjacent best practice.

## §3 — Public surface

```tsx
// apps/web/app/layout.tsx (root metadata)
export const metadata: Metadata = {
  metadataBase: new URL("https://cyberskill.world"),
  title: "CyberSkill — Turn Your Will Into Real",
  description: "Vietnamese software studio for cinematic web, AI, and global delivery.",
  openGraph: {
    title: "CyberSkill — Turn Your Will Into Real",
    description: "Vietnamese software studio for cinematic web, AI, and global delivery.",
    url: "https://cyberskill.world",
    siteName: "CyberSkill",
    images: [{
      url: "https://cyberskill.world/og.jpg",
      width: 1200,
      height: 630,
      alt: "Lumi, the golden genie of CyberSkill, against a sunset Saigon rooftop",
    }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberSkill — Turn Your Will Into Real",
    description: "Vietnamese software studio for cinematic web.",
    images: ["https://cyberskill.world/og.jpg"],
  },
};
```

```tsx
// apps/web/app/work/[slug]/opengraph-image.tsx (dynamic OG image for case studies)
import { ImageResponse } from "next/og";
import { sanityFetch } from "@/lib/sanity/sanity-fetch";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export default async function Image({ params }: { params: { slug: string } }) {
  const cs = await sanityFetch(`*[_type == "case_study" && slug.current == $slug][0]`, { params });
  if (!cs) return new ImageResponse(<DefaultOg />, size);

  return new ImageResponse(
    (
      <div style={{
        display: "flex",
        width: "100%", height: "100%",
        background: "linear-gradient(135deg, #2C1F1A 0%, #5C3F2E 100%)",
        color: "#D0B070",
        padding: "60px",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 48, fontWeight: 700 }}>{cs.title}</div>
        <div style={{ fontSize: 24 }}>{cs.client_name}</div>
        <div style={{ fontSize: 18, opacity: 0.7 }}>cyberskill.world</div>
      </div>
    ),
    size,
  );
}
```

```ts
// apps/web/lib/seo/og-image-helpers.ts
export function buildOgImageMeta(url: string, alt: string) {
  return {
    url,
    width: 1200,
    height: 630,
    alt,
  };
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | OG meta present on every public route | DOM inspection |
| 2 | og:image is 1200×630 + absolute URL | Header check |
| 3 | Twitter card meta with summary_large_image | DOM |
| 4 | Per-route variants on case studies | curl /work/x; assert different image |
| 5 | Vietnamese OG variant on /vi/* | curl /vi; assert /og-vi.jpg or localized |
| 6 | LinkedIn Post Inspector validates | Manual |
| 7 | Twitter Card Validator validates | Manual |
| 8 | Facebook Debugger validates | Manual |
| 9 | og:image:alt present | DOM |
| 10 | Vitest unit tests pass | pnpm vitest |
| 11 | Image accessible at URL (200) | curl |
| 12 | Image ≤ 5 MB (LinkedIn limit) | du |

## §5 — Verification

```tsx
import { describe, it, expect } from "vitest";
import { buildOgImageMeta } from "../og-image-helpers";

describe("OG image helpers", () => {
  it("builds metadata with 1200×630", () => {
    const meta = buildOgImageMeta("https://cyberskill.world/og.jpg", "alt");
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
  });

  it("requires absolute URL", () => {
    const meta = buildOgImageMeta("https://cyberskill.world/og.jpg", "alt");
    expect(meta.url).toMatch(/^https:\/\//);
  });

  it("includes alt text", () => {
    const meta = buildOgImageMeta("https://x", "Lumi golden genie");
    expect(meta.alt).toBe("Lumi golden genie");
  });
});
```

```ts
// Playwright OG meta test
import { test, expect } from "@playwright/test";

test("OG meta on /", async ({ page }) => {
  await page.goto("/");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBe("https://cyberskill.world/og.jpg");
  const w = await page.locator('meta[property="og:image:width"]').getAttribute("content");
  expect(w).toBe("1200");
});

test("OG variant on /work/[slug]", async ({ page }) => {
  await page.goto("/work/museum-exhibit-acme");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toContain("/work/museum-exhibit-acme/opengraph-image");
});

test("Vietnamese OG on /vi/", async ({ page }) => {
  await page.goto("/vi/");
  const locale = await page.locator('meta[property="og:locale"]').getAttribute("content");
  expect(locale).toBe("vi_VN");
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-019 (Lumi corner avatar inspiration for OG render), FR-CMS-006 (case-study OG via Sanity), FR-CMS-007 (locale-aware), FR-DS-001 (mood board for OG composition).

**Operational:** Next 15 `generateMetadata()` API, Next 15 ImageResponse for dynamic.

**Downstream:** LinkedIn / X / Slack / Facebook share previews.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| LinkedIn ignores OG (relative URL) | AC#6 | Absolute URL via metadataBase |
| Cache stale (old image after update) | Manual | LinkedIn Post Inspector "refresh" button |
| Image > 5 MB | AC#12 | Compress JPEG q85; chroma subsampling |
| Twitter Card validator fails | AC#7 | Use summary_large_image; not summary |
| Dynamic OG generation slow (case studies) | Build/ISR time | Cache via Vercel ISR; revalidate per FR-CMS-005 |
| og:image:alt missing | AC#9 | Always include alt |
| Per-case-study OG missing | AC#4 | opengraph-image.tsx per dynamic route |
| Vietnamese variant has wrong slogan | AC#5 | Designer reviews |
| Facebook Debugger reports issues | AC#8 | Use og:type article for case studies; website for /  |
| Encoding issue with Vietnamese characters | Header UTF-8 | Set charset; verify diacritics in og:title |
| Bot crawler doesn't follow OG | OK; only social | Different from search SEO |
| Image hosted on third-party CDN | Cross-origin | Vercel hosts /public; same-origin |

## §8 — Deliverable preview

User shares `/work/museum-exhibit-acme` on LinkedIn:
- Preview card: hero image (1200×630, museum interior) + title "Museum Exhibit — ACME Studio" + description.
- Click-through rate ~5%.

User shares `/vi/work/trien-lam-bao-tang-acme`:
- Card: same hero image + Vietnamese title + Vietnamese description.
- Locale-aware preview.

User shares `/`:
- Card: default Lumi OG image + slogan + description.

## §9 — Notes

**On dynamic OG image cost:** Vercel ImageResponse runs at edge; ~50ms per generation. Cached via ISR. Cost minimal.

**On future OG enhancements:** Animated WebP / MP4 OG (some platforms support) — slice 3.

**On Vietnamese OG variant:** Could fully generate at edge (no static file). Slice 2.

*End of FR-SEO-004.*
