---
id: FR-WEB-008
title: "App Router routes — / + /lite + /work/[slug] + /accessibility + minimal /api/* with canonical + hreflang"
module: WEB
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 1
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-WEB-001, FR-A11Y-001, FR-A11Y-011, FR-CMS-006, FR-CMS-008, FR-CTA-006, FR-SEO-001, FR-SEO-002, FR-SEO-007]
depends_on: [FR-WEB-001]
blocks: [FR-A11Y-001, FR-A11Y-011, FR-CMS-006, FR-CMS-008, FR-WEB-009, FR-SEO-002, FR-CTA-006]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.2 component architecture — "Routes — /, /lite, /work/[slug], /accessibility"
  - docs/01-master-plan-v2.md §7.6 a11y — "Public /accessibility page documenting WCAG conformance"
  - docs/01-master-plan-v2.md §8.1 SEO — "Canonical + hreflang on every route"
  - docs/01-master-plan-v2.md §6.4 — "App Router only; Pages Router banned"

language: typescript + next.js 15 (App Router)
service: apps/web/
new_files:
  - apps/web/app/(lite)/page.tsx                      # already exists via FR-A11Y-001 scaffold; THIS FR ratifies routing
  - apps/web/app/work/[slug]/page.tsx
  - apps/web/app/work/[slug]/loading.tsx
  - apps/web/app/work/[slug]/not-found.tsx
  - apps/web/app/accessibility/page.tsx
  - apps/web/app/api/health/route.ts                  # already from FR-WEB-001
  - apps/web/app/api/lead/route.ts                    # stub for FR-CTA-006 wiring
  - apps/web/app/api/analytics/route.ts               # stub for FR-SEO-007 wiring
  - apps/web/lib/metadata-helpers.ts                  # canonical + hreflang builder
  - apps/web/tests/web/routing.spec.ts                # Playwright route + head check

modified_files:
  - apps/web/next.config.ts                           # add experimental.typedRoutes: true
  - apps/web/app/layout.tsx                           # generateMetadata canonical for root

effort_hours: 4
risk_if_skipped: "Without typed App Router routes, Next 15 can't catch broken hrefs at build time — bad links ship to prod. Without canonical + hreflang, Google indexes /lite as duplicate of / and tanks rankings (FR-SEO-001 penalty). Without a /accessibility public page, WCAG conformance is unverifiable from the outside (FR-A11Y-011 fails). Without /work/[slug] dynamic routing, the case-study FR-CMS-006 can't ship. 5 downstream FRs depend on this routing surface."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship exactly these four public routes at slice 1:
   - `/` — the cinematic experience (FR-WEB-001 entry point).
   - `/lite` — DOM-only reduced-motion fallback (FR-A11Y-001 entry point).
   - `/work/[slug]` — Sanity-CMS-driven case-study dynamic route (FR-CMS-006 fills the data layer).
   - `/accessibility` — WCAG 2.2 AA conformance documentation (FR-A11Y-011 fills the content).

2. **MUST** use Next 15 **App Router** only. The `apps/web/pages/` directory MUST NOT exist (Pages Router is banned). Master plan §6.4 specifies App Router as the chosen architecture.

3. **MUST** enable typed routes:

   ```ts
   // next.config.ts
   const nextConfig: NextConfig = {
     experimental: { typedRoutes: true },
     // ... other from FR-WEB-007
   };
   ```

   Typed routes mean `<Link href="/work/abc">` is type-checked against generated route types; broken hrefs fail at `tsc --noEmit`.

4. **MUST** include a canonical `<link rel="canonical" href="...">` per route. Canonical for `/` is `https://cyberskill.world/` (the production domain). Canonical for `/lite` is `https://cyberskill.world/` (NOT `/lite` — `/lite` is the alternate, not the canonical). Canonical for `/work/[slug]` is the slug URL. Canonical for `/accessibility` is itself.

5. **MUST** include `<link rel="alternate" hreflang="x-default" href="/">` from `/lite`. This declares `/` as the default representation; SEO crawlers won't index `/lite` as a duplicate (FR-SEO-001 + FR-SEO-002 ratify this further).

6. **MUST NOT** ship `/api/*` routes other than the three sanctioned at slice 1:
   - `/api/health` — liveness check (returns `{ status: "ok", uptime: ... }`). Already shipped via FR-WEB-001.
   - `/api/lead` — POST endpoint for CTA form submission. FR-CTA-006 implements the body; this FR provides the route shell.
   - `/api/analytics` — POST endpoint for first-party analytics event capture. FR-SEO-007 implements the body; this FR provides the route shell.

7. **MUST** include `not-found.tsx` for the `/work/[slug]` dynamic route — when a slug doesn't match a published case study, the route MUST render a friendly 404 (not the default Next.js error page).

8. **MUST** include `loading.tsx` for `/work/[slug]` to render a gold-pulse loading state during Sanity fetch. Reuses `<SceneSuspenseFallback>` DOM variant.

9. **MUST** ship `lib/metadata-helpers.ts` with `generateRouteMetadata(routePath: string, opts?: { hreflang?: { ... } })` returning a `Metadata` object with canonical + hreflang correctly populated. Each route's `generateMetadata` calls this helper rather than hand-rolling.

10. **MUST** type all `searchParams` and `params` per Next 15 App Router conventions:
    ```ts
    type WorkPageProps = { params: Promise<{ slug: string }> };
    ```
    Next 15 promisifies `params`; this FR enforces the new pattern.

11. **MUST** include sitemap.xml generation via `apps/web/app/sitemap.ts`. Lists `/`, `/lite`, `/accessibility`, and all `/work/[slug]` paths from Sanity at build time. FR-SEO-002 ratifies this further.

12. **MUST** include robots.txt at `apps/web/app/robots.ts` — allows all routes except `/api/*` (no point indexing API JSON responses).

13. **MUST** support both English and Vietnamese rendering at every public route (FR-CMS-008 hreflang). For slice 1, route-level locale switching uses a query param `?lang=vi` (NOT path-based `/vi/...`). FR-CMS-008 may upgrade to path-based later.

14. **MUST** ship Playwright integration tests covering: every route returns 200 OK, canonical link present per route, hreflang present where required, sitemap.xml lists all routes, robots.txt allows main routes + blocks /api.

15. **MUST NOT** introduce middleware (`middleware.ts`) at slice 1. Middleware adds edge-runtime complexity; if needed later (e.g. geolocation-based locale routing), it's a separate FR.

16. **SHOULD** include a route audit script `tools/route-audit.ts` that enumerates all App Router routes (by walking the app directory) and emits a CSV of `{ route, canonical, hreflang_x_default, sitemap_included }` for ops verification.

## §2 — Why this design

**Why App Router only (no Pages Router coexistence)?** Coexisting Pages + App Routers in one app means Next.js runs two routing systems with subtly different conventions (e.g. `useRouter` vs `useRouter` from different paths). Bug surface doubles, build time grows. Master plan §6.4 picks one — App Router — and the discipline is to remove the option to drift.

**Why typed routes?** Without `experimental.typedRoutes: true`, `<Link href="/work/typo">` compiles even when no such slug exists. The bug surfaces at runtime (production 404). With typed routes, the slug-shape is checked at `tsc` time — typos fail the build. The "experimental" flag is misleading; this has been stable since Next 13.4.

**Why explicit canonical for `/lite`?** Without canonical pointing to `/`, Google's indexer treats `/lite` and `/` as separate URLs with similar content (the same brand, same case studies, same CTAs) — that's classic duplicate-content territory. Google may pick the wrong one as the "real" page or split ranking authority. The canonical link tells Google "`/` is the page; `/lite` is just a representation". FR-SEO-001 + FR-SEO-002 enforce this rule.

**Why minimal `/api/*` at slice 1?** Each `/api` route is an attack surface, a rate-limit concern, a CORS configuration. At slice 1 the marketing site needs only health, lead, and analytics — adding more (e.g. `/api/contact`, `/api/newsletter`) without explicit FR justification bloats the API surface. The constraint forces consideration: "do I need this API route, or can the work be done client-side or via a third-party service?"

**Why a separate `metadata-helpers.ts` library?** Next 15's `generateMetadata` runs server-side per route. Hand-rolling canonical + hreflang per route invites drift — one route forgets hreflang, another has a typo in the canonical URL. A central helper enforces the pattern: every route calls `generateRouteMetadata(...)` and gets correctness by construction. FR-SEO-001 sets up the Schema.org JSON-LD via a similar helper.

**Why query-param locale at slice 1, not path-based?** Path-based locale routing (`/vi/...`) requires Next.js's i18n config, which interacts with App Router in subtle ways and triggers SSR re-paths. Query-param (`?lang=vi`) is simpler: same route renders different content based on the param, hreflang handles SEO. Slice 1 ships the simpler approach; if user research justifies path-based later, FR-CMS-008 amendment handles the migration.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/
├── app/
│   ├── layout.tsx                                      # MODIFIED — generateMetadata via helper
│   ├── page.tsx                                        # EXISTING — / (cinematic)
│   ├── (lite)/
│   │   └── page.tsx                                    # EXISTING (FR-A11Y-001) — /lite
│   ├── work/
│   │   └── [slug]/
│   │       ├── page.tsx                                # NEW — dynamic case study
│   │       ├── loading.tsx                             # NEW — gold-pulse loading
│   │       └── not-found.tsx                           # NEW — friendly 404
│   ├── accessibility/
│   │   └── page.tsx                                    # NEW — WCAG conformance doc
│   ├── api/
│   │   ├── health/route.ts                             # EXISTING (FR-WEB-001)
│   │   ├── lead/route.ts                               # NEW — stub
│   │   └── analytics/route.ts                          # NEW — stub
│   ├── sitemap.ts                                      # NEW — sitemap.xml generator
│   └── robots.ts                                       # NEW — robots.txt generator
├── lib/
│   └── metadata-helpers.ts                             # NEW — canonical + hreflang builder
├── tests/web/
│   └── routing.spec.ts                                 # NEW — Playwright route checks
└── tools/
    └── route-audit.ts                                  # SHOULD — route enumeration CSV

next.config.ts:
  experimental:
    typedRoutes: true                                   # MODIFIED
```

### §3.2 — `lib/metadata-helpers.ts` shape

```ts
import type { Metadata } from "next";

const BASE_URL = "https://cyberskill.world";

export type RouteMetadataOpts = {
  canonical?: string;            // override; defaults to routePath
  hreflang?: {
    "x-default"?: string;
    en?: string;
    vi?: string;
  };
  title?: string;
  description?: string;
};

export function generateRouteMetadata(routePath: string, opts: RouteMetadataOpts = {}): Metadata {
  const canonical = opts.canonical ?? `${BASE_URL}${routePath}`;
  const alternates: Metadata["alternates"] = {
    canonical,
    languages: opts.hreflang,
  };
  return {
    title: opts.title,
    description: opts.description,
    alternates,
  };
}
```

### §3.3 — Route metadata usage shape

```ts
// app/page.tsx
export async function generateMetadata(): Promise<Metadata> {
  return generateRouteMetadata("/", {
    title: "CyberSkill — Turn Your Will Into Real",
    description: "...",
    hreflang: { "x-default": "https://cyberskill.world/", en: "https://cyberskill.world/", vi: "https://cyberskill.world/?lang=vi" },
  });
}

// app/(lite)/page.tsx
export async function generateMetadata(): Promise<Metadata> {
  return generateRouteMetadata("/lite", {
    canonical: "https://cyberskill.world/",  // canonical points to /, not /lite
    hreflang: { "x-default": "https://cyberskill.world/" },
  });
}
```

### §3.4 — `work/[slug]/page.tsx` shape

```tsx
import { notFound } from "next/navigation";
import { generateRouteMetadata } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateRouteMetadata(`/work/${slug}`, { /* fetch title/description from Sanity */ });
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  // const study = await sanityFetch({ query: ..., params: { slug } });
  // if (!study) notFound();
  return <article>{/* case study render */}</article>;
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | `/` returns 200 + has canonical | Playwright + curl head |
| 2 | `/lite` returns 200 + has canonical pointing to `/` + hreflang x-default | Playwright + HTML head check |
| 3 | `/work/[slug]` for a known slug returns 200 | Playwright |
| 4 | `/work/[slug]` for unknown slug returns 404 with friendly page | Playwright + HTML body check |
| 5 | `/accessibility` returns 200 | Playwright |
| 6 | No Pages Router | `test ! -d apps/web/pages` |
| 7 | `experimental.typedRoutes: true` in next.config | Grep |
| 8 | Canonical + hreflang via `metadata-helpers.ts` | Grep route files for `generateRouteMetadata(` |
| 9 | `/api/*` is exactly health + lead + analytics | `find apps/web/app/api -name route.ts` lists 3 |
| 10 | `sitemap.xml` lists all routes | Playwright `GET /sitemap.xml`; parse XML |
| 11 | `robots.txt` allows /, blocks /api | Playwright `GET /robots.txt` |
| 12 | Typed routes catch broken hrefs at build time | tsc test with intentional bad href; expected error |
| 13 | `loading.tsx` renders gold-pulse fallback during fetch | Playwright slow-network throttle |
| 14 | No middleware.ts | `test ! -f apps/web/middleware.ts` |
| 15 | `route-audit.ts` enumerates routes correctly | CI artifact emits CSV |

## §5 — Test code shapes

### §5.1 — `tests/web/routing.spec.ts`

```ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", expected_canonical: "https://cyberskill.world/" },
  { path: "/lite", expected_canonical: "https://cyberskill.world/" },
  { path: "/accessibility", expected_canonical: "https://cyberskill.world/accessibility" },
];

for (const r of ROUTES) {
  test(`route ${r.path} returns 200 with correct canonical`, async ({ page, request }) => {
    const resp = await request.get(`http://localhost:3000${r.path}`);
    expect(resp.status()).toBe(200);
    const html = await resp.text();
    expect(html).toContain(`rel="canonical" href="${r.expected_canonical}"`);
  });
}

test("/lite has hreflang x-default to /", async ({ request }) => {
  const resp = await request.get("http://localhost:3000/lite");
  const html = await resp.text();
  expect(html).toContain('hreflang="x-default" href="https://cyberskill.world/"');
});

test("/work/unknown-slug returns 404", async ({ page }) => {
  await page.goto("/work/this-slug-does-not-exist");
  await expect(page.getByText(/page not found/i)).toBeVisible();
});

test("sitemap.xml contains all routes", async ({ request }) => {
  const resp = await request.get("http://localhost:3000/sitemap.xml");
  const xml = await resp.text();
  expect(xml).toContain("<loc>https://cyberskill.world/</loc>");
  expect(xml).toContain("<loc>https://cyberskill.world/lite</loc>");
  expect(xml).toContain("<loc>https://cyberskill.world/accessibility</loc>");
});

test("robots.txt blocks /api", async ({ request }) => {
  const resp = await request.get("http://localhost:3000/robots.txt");
  const text = await resp.text();
  expect(text).toContain("Disallow: /api");
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-001 (Next 15 + R3F bootstrap + `/api/health`) — provides app shell.

**Operational dependencies:**
- Next.js 15.x.
- Playwright for integration tests.

**Downstream blocks:**
- FR-A11Y-001 (reduced-motion fallback) — uses `/lite` route.
- FR-A11Y-011 (public a11y page) — uses `/accessibility` route.
- FR-CMS-006 (case-study CMS) — uses `/work/[slug]` route.
- FR-CMS-008 (hreflang locales) — depends on metadata-helpers.ts hreflang shape.
- FR-WEB-009 (WebGL2 detection) — uses `/lite` as the WebGL-unsupported fallback path.
- FR-SEO-002 (sitemap/robots) — extends this FR's sitemap + robots generators.
- FR-CTA-006 (lead form backend) — implements `/api/lead` POST body.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Pages Router accidentally created (e.g. starter template) | AC#6 | Delete `pages/` directory; migrate any handlers to App Router |
| Canonical pointing to wrong URL (e.g. `/lite` canonical → `/lite`) | AC#2 + AC#8 | Update `metadata-helpers.ts` usage; canonical for `/lite` MUST be `/` |
| Typed routes disabled (broken hrefs in production) | AC#7 + AC#12 | Set `experimental.typedRoutes: true` |
| `/api/*` proliferation (developer adds endpoint without FR) | AC#9 + code review | Question additions; each needs an FR amendment |
| Missing `not-found.tsx` for `/work/[slug]` (default Next 404) | AC#4 | Add `not-found.tsx` |
| Missing `loading.tsx` for `/work/[slug]` (Suspense skeleton missing) | AC#13 | Add `loading.tsx` |
| Hreflang missing on `/lite` (SEO duplicate-content penalty) | AC#2 | Add hreflang x-default via metadata helper |
| sitemap.xml stale (case studies added without sitemap rebuild) | AC#10 | sitemap.ts is build-time; rebuild on Sanity content change via webhook + ISR |
| robots.txt allows /api (bot indexing junk JSON) | AC#11 | Add `Disallow: /api` |
| `params` not awaited (Next 15 breaking change) | AC#1 build error | Use `await params` per Next 15 promisified shape |
| Middleware introduced at slice 1 (over-architecting) | AC#14 | Delete `middleware.ts`; if truly needed, file FR amendment |
| `(lite)` route group conflicts with `/lite` URL | Playwright | Verify both `/lite` and `/(lite)` patterns resolve correctly; Next 15 route groups don't appear in URL |

## §8 — Deliverable preview

After shipping:
- `curl https://cyberskill.world/` → 200, HTML with `<link rel="canonical" href="https://cyberskill.world/">` + hreflang block.
- `curl https://cyberskill.world/lite` → 200, HTML with canonical `https://cyberskill.world/` + hreflang x-default.
- `curl https://cyberskill.world/work/unknown` → 404 with friendly page.
- `curl https://cyberskill.world/sitemap.xml` → XML listing /, /lite, /accessibility, all /work/[slug] URLs.
- `curl https://cyberskill.world/robots.txt` → Allows /, /lite, /work, /accessibility; Disallows /api.
- `tsc --noEmit` catches broken `<Link href="/work/typo">` at build time.

## §9 — Notes

**On future i18n migration:** Slice 1 uses `?lang=vi` query param. Future amendment may move to path-based `/vi/...` for cleaner URLs. The metadata-helpers.ts shape supports both — switching just means updating `hreflang.vi` and the route structure.

**On case-study slug source:** Slugs come from Sanity via FR-CMS-006. Sitemap generation reads from the same Sanity query. Slug stability is a Sanity-side concern; redirects for renamed slugs are out of scope for slice 1.

**On `/accessibility` content:** FR-A11Y-011 fills the page body with WCAG 2.2 AA conformance statement, accessibility statement, known issues list. This FR provides the route shell.

*End of FR-WEB-008.*
