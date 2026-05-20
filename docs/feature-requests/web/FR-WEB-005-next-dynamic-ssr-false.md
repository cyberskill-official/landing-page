---
id: FR-WEB-005
title: "next/dynamic({ ssr: false }) discipline — three.js + R3F off the SSR + critical-path"
module: WEB
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 1
owner: Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
strict_audited: 2026-05-18
related_frs: [FR-WEB-001, FR-WEB-003, FR-WEB-006, FR-PERF-001, FR-PERF-004]
depends_on: [FR-WEB-001]
blocks: [FR-WEB-006, FR-PERF-004]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.3 loading strategy — "three.js NOT in critical path; client-only via next/dynamic"
  - docs/01-master-plan-v2.md §6.1 perf budgets — "Total initial JS < 200 KB gz"
  - docs/01-master-plan-v2.md §5.1 web stack — "Next.js 15 App Router; client components must be explicit"
  - docs/01-master-plan-v2.md §7.2 — "SSR HTML must be parsable on no-JS preview (LinkedIn, OG bots)"

language: typescript + next.js 15 (app router)
service: apps/web/
new_files:
  - apps/web/lib/dynamic-three.ts                 # canonical dynamic factories
  - apps/web/lib/dynamic-three.types.ts           # typed re-export shapes
  - apps/web/components/canvas/CanvasLoadingFallback.tsx
  - apps/web/tests/web/dynamic-three.spec.ts      # Playwright SSR HTML check
  - apps/web/tests/unit/no-three-in-ssr.test.ts   # build-time grep test
  - apps/web/.eslintrc.dynamic-three.js           # custom rule banning scattered dynamic imports

effort_hours: 4
risk_if_skipped: "Without disciplined `next/dynamic({ ssr: false })` boundaries, Next.js bundles three.js (~ 600 KB raw, ~ 180 KB gzipped) into the SSR-rendered main chunk. First Contentful Paint (FCP) slips past 3.5s on mid-tier 4G mobile. SSR build fails outright if any R3F component runs at server-render time (window/document undefined). Master plan §6.1 budget of 200 KB initial JS becomes impossible — three.js alone consumes 90% of it. Lighthouse perf score drops below 80, failing FR-PERF-001 CI gate."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `apps/web/lib/dynamic-three.ts` as the single canonical place where `next/dynamic({ ssr: false })` factories live. Every dynamic import of `three`, `@react-three/fiber`, `@react-three/drei`, `@14islands/r3f-scroll-rig`, `gsap` (with ScrollTrigger), or any R3F-touching component MUST go through this file.

2. **MUST NOT** import `three`, `@react-three/*`, `@14islands/r3f-scroll-rig`, or `three/examples/jsm/*` from any code path reachable by Next.js server rendering. SSR-rendered code paths include:
   - Server components (default in App Router).
   - Pages, layouts, route handlers.
   - Metadata generators (`generateMetadata`).
   - Middleware (`middleware.ts`).
   - Static-imports at the top of files that are SSR-rendered.

3. **MUST** ensure the main JS chunk (the bundle served on the initial HTML response) is ≤ **200 KB gzipped**. Three.js + R3F + drei + scroll-rig total ~ 250 KB gzipped; loading them dynamically after hydration keeps them OUT of the critical-path bundle.

4. **MUST** be the **single conventional place** where dynamic R3F factories live. Scattered `dynamic(() => import('@react-three/...'))` calls in route components are FORBIDDEN. The discipline is: a route component imports a typed factory from `lib/dynamic-three.ts`, which internally calls `next/dynamic` with the right options.

5. **MUST** ship typed exports from `dynamic-three.ts`:

   ```ts
   export const CanvasMount: ComponentType<CanvasMountProps>;
   export const SceneTunnel: ComponentType<SceneTunnelProps>;
   export const LumiMesh: ComponentType<LumiMeshProps>;
   // ... one per R3F-touching component used by routes
   ```

   Each is wrapped with `dynamic(() => import('...'), { ssr: false, loading: () => <CanvasLoadingFallback /> })`.

6. **MUST** ship `<CanvasLoadingFallback>` — a lightweight (~ 1 KB) HTML-only placeholder rendered during dynamic-load. MUST NOT itself touch three.js. Renders the brand `--brand-gold-400` background tint + accessible loading text ("Loading 3D scene…") for screen readers.

7. **MUST NOT** dynamic-import `next/link`, `react`, `next/router`, or other framework-default packages. The dynamic-three.ts file is exclusively for the heavy 3D/animation stack.

8. **MUST** be SSR-build-test-gated:
   - `pnpm -F web build` MUST succeed.
   - Build output's `.next/server/chunks/` MUST NOT contain `three` module-level imports.
   - Build output's `.next/static/chunks/` (client-only) MAY contain three; this is by design.

9. **MUST** ship `tests/unit/no-three-in-ssr.test.ts` — a build-time grep test that scans `.next/server/` (post-build artifacts) for `three`, `@react-three`, or `@14islands/r3f-scroll-rig` strings. Expected zero matches outside source-map comments.

10. **MUST** ship `tests/web/dynamic-three.spec.ts` — a Playwright test that:
    - `curl http://localhost:3000/` and verify SSR HTML response.
    - Assert the response body does NOT contain any `<script src="...">` referencing chunks named with `three`, `r3f`, or `scroll-rig` substrings (those load post-hydration).
    - Assert the loading-fallback HTML IS present in the initial response (proves dynamic boundary is correct).

11. **MUST** ship the custom ESLint rule `.eslintrc.dynamic-three.js` that flags any `dynamic(() => import('@react-three/...'))` call outside `lib/dynamic-three.ts`. Build fails on violation.

12. **MUST** preserve type safety. The `dynamic-three.ts` factories MUST return components with the same Props type as the underlying components. Use the `dynamic(() => import('...').then(m => m.default), { ssr: false })` pattern to preserve type inference.

13. **MUST NOT** pre-render any R3F content as a static HTML fallback. The SSR HTML for routes containing 3D content MUST render only DOM scaffolding + loading fallback. R3F renders happen post-hydration on the client.

14. **MUST** export a type guard `isClient()` returning `typeof window !== 'undefined'` for use in non-component code (e.g. inside `lib/lenis-singleton.ts`). This is the canonical client-detection helper across the codebase.

15. **MUST** verify bundle-size impact in CI. The FR-PERF-001 budget gates check `apps/web/.next/static/chunks/main-*.js` size. CI fails if main exceeds 200 KB gzipped.

16. **SHOULD** include a build-time analyzer pass (`@next/bundle-analyzer`) gated behind `ANALYZE=true` env var, runnable via `pnpm -F web analyze`, that emits a visual bundle map for debug review.

## §2 — Why this design

**Why `next/dynamic({ ssr: false })` instead of dynamic `import()` in useEffect?** Next.js's `next/dynamic` is the framework-blessed way to defer client-only modules. It handles the SSR HTML scaffolding (rendering a loading placeholder server-side), the hydration boundary (mounting the real component client-side), and the code-splitting (separate chunk per dynamic import). Doing `import()` manually in useEffect bypasses the SSR placeholder and produces flicker. Master plan §5.3 explicitly names `next/dynamic({ ssr: false })` as the canonical pattern.

**Why a single canonical file (`dynamic-three.ts`)?** Three reasons. First, discoverability — when a new developer needs to use R3F in a new route, they import from the conventional location; they don't write a new `dynamic(...)` call from scratch. Second, the ESLint rule (§1 #11) can enforce the boundary by flagging scattered `dynamic(import('@react-three/...'))` calls outside this file. Third, consolidation simplifies refactoring — if Next.js dynamic options change in a future version, one file edit covers the whole project.

**Why is the 200 KB gz budget so tight?** Master plan §6.1 derives it from the mobile-perf research: at 3G slow / 1 Mbps, 200 KB transfers in ~ 2 seconds. With browser parse + execute overhead, that's ~ 2.5 seconds to TTI. Going to 400 KB doubles TTI on the same network. The marketing site's target Lighthouse score is ≥ 95, which requires LCP < 2.5s and TTI < 3.8s. Three.js + R3F + drei combined exceed the budget on their own — they MUST load post-hydration.

**Why ban dynamic-import of `react`, `next/link`, etc.?** Those are framework-shipped already (in the main chunk). Dynamic-importing them adds extra round-trips for things that are already loaded. The dynamic-three.ts is exclusively for the heavy 3D/animation stack — it shouldn't become a general-purpose dynamic-imports file.

**Why a custom ESLint rule?** Without it, a developer can quietly write `const Canvas = dynamic(() => import('@react-three/fiber'))` in a route component. It compiles. It might even work. But it's not in the canonical file, so the team's perf-budget invariant becomes invisible. The lint rule fails the build, surfacing the violation immediately. This is the difference between "we should do this" and "we cannot ship without this".

**Why ship `<CanvasLoadingFallback>` as HTML-only?** During SSR, the loading fallback is what users see for ~ 200-500ms while the dynamic chunk downloads + hydrates. If the fallback itself touches three.js, we've defeated the purpose. A simple HTML+CSS placeholder (brand-tinted background + accessible text) is cheap to render, brand-consistent, and screen-reader-friendly.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/
├── lib/
│   ├── dynamic-three.ts                         # NEW — canonical dynamic factories
│   └── dynamic-three.types.ts                   # NEW — typed re-exports
├── components/canvas/
│   ├── CanvasMount.tsx                          # EXISTING (FR-WEB-001) — internal
│   ├── CanvasMount.client.tsx                   # EXISTING — "use client" implementation
│   └── CanvasLoadingFallback.tsx                # NEW — lightweight HTML-only placeholder
├── tests/
│   ├── unit/no-three-in-ssr.test.ts             # NEW — post-build grep test
│   └── web/dynamic-three.spec.ts                # NEW — Playwright SSR-HTML check
└── .eslintrc.dynamic-three.js                   # NEW — custom rule

next.config.js:
  // BundleAnalyzer wrapper gated by ANALYZE env var
```

### §3.2 — `lib/dynamic-three.ts` shape

```ts
import dynamic from "next/dynamic";
import { CanvasLoadingFallback } from "@/components/canvas/CanvasLoadingFallback";
import type { ComponentType } from "react";
import type { CanvasMountProps } from "@/components/canvas/CanvasMount.client";
import type { SceneTunnelProps } from "@/components/canvas/SceneTunnel.client";

export const CanvasMount: ComponentType<CanvasMountProps> = dynamic(
  () => import("@/components/canvas/CanvasMount.client").then((m) => m.CanvasMountClient),
  { ssr: false, loading: () => <CanvasLoadingFallback /> }
);

export const SceneTunnel: ComponentType<SceneTunnelProps> = dynamic(
  () => import("@/components/canvas/SceneTunnel.client").then((m) => m.SceneTunnelClient),
  { ssr: false, loading: () => null }
);

// ... one per R3F-touching component

export function isClient(): boolean {
  return typeof window !== "undefined";
}
```

### §3.3 — `CanvasLoadingFallback.tsx` shape

```tsx
export function CanvasLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 bg-[var(--brand-gold-400)] opacity-20"
    >
      <span className="sr-only">Loading 3D scene…</span>
    </div>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | `dynamic-three.ts` exists with factories for each R3F-touching component | File existence + grep for `dynamic(` |
| 2 | Main chunk ≤ 200 KB gzipped | FR-PERF-001 bundle-size CI gate; `wc -c apps/web/.next/static/chunks/main-*.js.gz` |
| 3 | No `three` / `@react-three` imports in SSR-rendered code | `.next/server/chunks/` grep returns zero matches |
| 4 | No scattered `dynamic(() => import('@react-three/...'))` outside `dynamic-three.ts` | ESLint custom rule + grep |
| 5 | SSR HTML response contains loading fallback, NOT three.js | Playwright `curl` test asserts |
| 6 | `<CanvasLoadingFallback>` does NOT import three | Static analysis: import list of CanvasLoadingFallback.tsx |
| 7 | TypeScript types preserved through dynamic factories | `tsc --noEmit`; consumer code uses `<CanvasMount {...typed props} />` without `any` |
| 8 | `pnpm -F web build` succeeds | CI build step |
| 9 | `pnpm -F web analyze` produces bundle visualization | CI artifact upload |
| 10 | `isClient()` helper exported and used by lib/lenis-singleton.ts | Grep + tsc |
| 11 | `next/link`, `react`, etc. NOT dynamic-imported | Grep + ESLint rule scope |
| 12 | ESLint rule fails on scattered dynamic R3F import | `pnpm lint` with intentional violation test |
| 13 | No static fallback HTML pre-renders R3F content | Playwright `curl` HTML inspection: no `<canvas>` in initial response |
| 14 | Bundle analyzer gated by `ANALYZE=true` env var only | Production build doesn't include analyzer overhead |
| 15 | LCP ≤ 2.5s on simulated 4G mobile | Lighthouse CI run on `/` route |

## §5 — Test code shapes

### §5.1 — `tests/unit/no-three-in-ssr.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SERVER_DIR = ".next/server/chunks";
const FORBIDDEN = ["three", "@react-three", "@14islands/r3f-scroll-rig"];

describe("no three.js in SSR bundles", () => {
  it("server chunks contain no R3F imports", () => {
    const files = readdirSync(SERVER_DIR).filter((f) => f.endsWith(".js"));
    for (const f of files) {
      const content = readFileSync(join(SERVER_DIR, f), "utf-8");
      for (const forbidden of FORBIDDEN) {
        expect(content.includes(`require("${forbidden}`)).toBe(false);
        expect(content.includes(`from"${forbidden}`)).toBe(false);
      }
    }
  });
});
```

### §5.2 — `tests/web/dynamic-three.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("SSR HTML contains loading fallback, not three.js", async ({ request }) => {
  const resp = await request.get("http://localhost:3000/");
  const html = await resp.text();

  // Loading fallback present
  expect(html).toContain("Loading 3D scene");

  // No <canvas> in SSR HTML
  expect(html).not.toMatch(/<canvas\b/);

  // No three.js chunks in initial <script> tags
  const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of scriptSrcs) {
    expect(src.includes("three")).toBe(false);
    expect(src.includes("r3f")).toBe(false);
  }
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-001 (Next 15 + R3F bootstrap) — provides `CanvasMount` + the components this FR makes dynamic-loadable.

**Operational dependencies:**
- Next.js 15.
- `@next/bundle-analyzer` (dev dependency).
- Playwright + Vitest.
- Custom ESLint rule definition.

**Downstream blocks:**
- FR-WEB-006 (Suspense per scene) — uses the same dynamic-load pattern at scene granularity.
- FR-PERF-004 (LCP gate) — fails if dynamic-load boundary is broken.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Three.js imported at top of route component (SSR build crash) | AC#8 build log: `ReferenceError: window is not defined` | Move import behind `dynamic-three.ts` factory |
| Scattered `dynamic(() => import('@react-three/...'))` in route component | AC#4 ESLint | Move to `dynamic-three.ts`; export typed factory |
| Loading fallback imports three (defeats the purpose) | AC#6 + static analysis | Strip three imports from fallback; render only HTML+CSS |
| Main chunk creeps over 200 KB (a vendor lib pulled R3F transitively) | AC#2 CI gate | Audit dependency tree; mark offending lib as `transpilePackages` or replace |
| Bundle analyzer ships in production (size bloat) | AC#14 + production-bundle inspection | Wrap analyzer plugin in `ANALYZE` env check |
| Types lost through `dynamic()` factory (consumer sees `ComponentType<any>`) | AC#7 tsc | Use `.then(m => m.default)` pattern with explicit type annotation |
| Pre-render HTML includes R3F-mounted DOM (e.g. `<canvas>` ssg leak) | AC#13 Playwright | Confirm components are `"use client"` and wrapped in dynamic ssr-false |
| `next/dynamic` ssr-false works in dev but fails in production build | Build log | Verify Next.js version compatibility; pin Next 15 minor |
| `isClient()` helper not used in lenis-singleton (window crash on SSR) | AC#10 + AC#8 build | Add `isClient()` guard; import from dynamic-three |
| Lighthouse LCP fails at 4G (dynamic chunk too large) | AC#15 | Split dynamic-three.ts into multiple chunks via separate `dynamic()` calls per concern |
| Loading fallback flickers visibly on slow networks (FOUC) | Visual smoke | Make fallback opacity:0 with fade-in transition |
| Hydration mismatch on dynamic boundary (SSR HTML ≠ client render) | React hydration error | Ensure fallback HTML matches what dynamic produces server-side |

## §8 — Deliverable preview

After shipping, a route component using 3D content reads cleanly:

```tsx
// app/page.tsx (server component)
import { CanvasMount } from "@/lib/dynamic-three";

export default function Home() {
  return (
    <>
      <CanvasMount />
      <main>...DOM scenes...</main>
    </>
  );
}
```

The `curl http://localhost:3000/` response includes the loading fallback HTML and no three.js chunks. The Next.js bundle analyzer shows three.js + R3F + drei in dedicated chunks loaded post-hydration.

## §9 — Notes

**On bundling strategy:** Each `dynamic()` call in `dynamic-three.ts` creates a separate chunk by default. If three.js + R3F should ship together (often the case — R3F is useless without three), use the `chunkName: 'three-r3f'` option on `dynamic()` to coalesce them.

**On future framework upgrades:** Next.js 16 may change `next/dynamic` API. Pin the project to 15.x and revisit on framework upgrade.

**On RSC + Suspense (FR-WEB-006):** This FR provides the dynamic-load boundary; FR-WEB-006 layers Suspense boundaries on top per scene. They're complementary, not redundant.

---

## §10 — Strict audit evidence (2026-05-18)

Status: `shipped + strict-audited`.

Edge-case matrix coverage:

| Vector | Evidence |
|---|---|
| Null inputs | `CanvasLoadingFallback` is HTML-only and SSR-safe before the client R3F chunk hydrates. |
| Malformed payload | Scattered dynamic imports are forbidden outside `lib/dynamic-three.ts`; grep found no offenders. |
| Extreme bounds | Production build reports `/` First Load JS at 110 kB and main chunk gzip at 36.5 KiB. |
| Invalid content | Post-build server chunk grep found no direct `three`, `@react-three`, or scroll-rig imports. |
| Concurrent race | SSR HTML contains the loading fallback and no `<canvas>`, so hydration owns the only R3F mount. |
| Observability | Chunk gzip script and Playwright SSR response check provide repeatable boundary evidence. |

Validation log:

```text
$ cd apps/web && node_modules/.bin/next build
✓ Compiled successfully in 1591ms
✓ Generating static pages (18/18)
Route (app)                                 Size  First Load JS
┌ ƒ /                                    7.54 kB         110 kB
+ First Load JS shared by all             103 kB
```

```text
$ cd apps/web && node_modules/.bin/vitest run tests/unit/no-three-in-ssr.test.ts --config vitest.config.ts
Test Files  1 passed (1)
Tests       1 passed (1)
```

```text
$ cd apps/web && node_modules/.bin/tsc -p tsconfig.json --noEmit
passed
```

```text
$ cd apps/web && node - <<'NODE'
main-92f645139bfbf979.js gzip=37368 bytes (36.5 KiB)
main-app-72bbfac3d2b420a8.js gzip=226 bytes (0.2 KiB)
NODE
```

```text
$ cd apps/web && rg -n "dynamic\s*\(\s*\(\)\s*=>\s*import\(['\"](@react-three|three|@14islands)" app components lib --glob '!lib/dynamic-three.ts'
no matches
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/web/dynamic-three.spec.ts --project=chromium
Running 1 test using 1 worker
  ✓ SSR HTML contains the loading fallback and no Three/R3F script names
1 passed (4.0s)
```

*End of FR-WEB-005.*
