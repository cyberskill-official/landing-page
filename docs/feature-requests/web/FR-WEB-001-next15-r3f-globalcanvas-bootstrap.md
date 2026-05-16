---
id: FR-WEB-001
engineering_anchor: true
title: "Next.js 15 + React 19 + R3F 9 monorepo bootstrap with persistent GlobalCanvas outside router"
module: WEB
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
milestone: P3 · slice 1
slice: 1
owner: Frontend Lead / R3F Architect
created: 2026-05-16
shipped: null
brain_chain_hash: null
related_frs: [FR-WEB-002, FR-WEB-003, FR-WEB-004, FR-WEB-005, FR-WEB-006, FR-WEB-007, FR-WEB-008, FR-WEB-009, FR-DS-003]
depends_on: [FR-DS-003]               # Cinematic Pack must exist as a workspace member
blocks:
  - FR-WEB-002..009    # all other WEB FRs build on this
  - FR-SCENE-009       # Scene 0 implementation
  - FR-OPS-010         # CI assumes the workspace exists
  - FR-PERF-001        # budget gates assume the build target exists

source_pages:
  - docs/01-master-plan-v2.md §5.1 (Framework choice)
  - docs/01-master-plan-v2.md §5.2 (Component architecture)
  - docs/01-master-plan-v2.md §5.3 (Loading strategy — GlobalCanvas outside router)
  - docs/01-master-plan-v2.md §6.1 (Total initial JS < 200 KB gz)

source_decisions:
  - "v2 §5.1 stack lock: Next 15 App Router · React 19 · R3F 9 · Three r184 · Drei latest · 14islands/r3f-scroll-rig 8.15+"
  - "v2 §5.2 critical pattern: GlobalCanvas lives OUTSIDE the router so navigation doesn't tear down WebGL context"
  - "v2 §6.1 JS budget: total initial < 200 KB gz; three.js (~168 KB gz) is intentionally NOT in critical path"

language: typescript 5.6
service: apps/web/
new_files:
  - apps/web/package.json
  - apps/web/next.config.ts
  - apps/web/tsconfig.json
  - apps/web/postcss.config.mjs
  - apps/web/app/layout.tsx
  - apps/web/app/page.tsx
  - apps/web/app/(lite)/page.tsx
  - apps/web/app/api/health/route.ts
  - apps/web/components/canvas/GlobalCanvasShell.tsx
  - apps/web/components/canvas/CanvasMount.tsx
  - apps/web/components/scroll/SmoothScrollProvider.tsx
  - apps/web/lib/feature-detect.ts
  - apps/web/lib/dynamic-three.ts
  - apps/web/tests/bootstrap.spec.ts
  - apps/web/tests/bundle-budget.spec.ts
  - apps/web/playwright.config.ts
modified_files:
  - package.json                      # workspace root
  - pnpm-workspace.yaml
  - .gitignore                        # add .next/, .turbo/, etc.
allowed_tools:
  - file_read: packages/ds-cinematic/**
  - file_read: docs/01-master-plan-v2.md
  - file_write: apps/web/**
  - bash: pnpm install
  - bash: pnpm -F web build
  - bash: pnpm -F web test
  - bash: pnpm -F web exec playwright test
disallowed_tools:
  - import three / @react-three/* from any module that is not lazy-loaded via next/dynamic({ssr:false})
  - place <GlobalCanvas> inside any route segment (it MUST live at layout level, outside router transitions)
  - introduce SWC plugin that prevents tree-shaking of three.js
  - add framer-motion or react-spring (we use GSAP per master plan §5.1)

effort_hours: 8
sub_tasks:
  - "0.5h: apps/web workspace registration + Next 15 install"
  - "1.0h: app/layout.tsx with SmoothScrollProvider + GlobalCanvasShell wrappers"
  - "1.0h: app/page.tsx stub with hero <h1> as static SSR LCP target"
  - "0.5h: app/(lite)/page.tsx — pure-DOM fallback stub"
  - "1.0h: lib/dynamic-three.ts — next/dynamic({ssr:false}) factory for R3F clients"
  - "1.0h: components/canvas/* — GlobalCanvasShell mounts <Canvas frameloop='demand'> with empty scene"
  - "1.0h: tests/bootstrap.spec.ts (Vitest) — assert SSR HTML carries headline, no three.js in main chunk"
  - "1.0h: tests/bundle-budget.spec.ts — programmatic next/bundle-analyzer assertion main < 200 KB gz"
  - "0.5h: playwright.config.ts + minimal e2e — page loads, headline visible, canvas mounts post-FCP"
  - "0.5h: api/health/route.ts (200 OK) for uptime checks; smoke test"

risk_if_skipped: |
  Without a locked stack bootstrap, every subsequent WEB / SCENE FR makes incompatible scaffolding
  choices (Pages vs App router; framer-motion vs GSAP; canvas-inside-route vs outside-router). The
  WebGL-context-loss-on-navigation bug from canvas-inside-route is impossible to retrofit cleanly
  once scenes are built on it. Skip → 1-2 weeks of P3 rework.
---

## §1 — Description (BCP-14 normative)

The `apps/web` Next.js application **MUST** be bootstrapped on Next.js 15 (App Router) + React 19 + React Three Fiber 9 + Three.js r184 + Drei latest + 14islands/r3f-scroll-rig 8.15+, with the persistent `<GlobalCanvas>` mounted at **layout** level so that navigation never tears down the WebGL context.

1. **MUST** create an `apps/web` workspace package using Next.js 15 with the App Router. Pages Router is forbidden.
2. **MUST** pin React 19 (the default that pairs with Next 15) and R3F 9 (which pairs with React 19). Mismatched versions are a release blocker.
3. **MUST** place `<SmoothScrollProvider>` (Lenis) and `<GlobalCanvasShell>` in `app/layout.tsx` so they wrap every route segment. `<GlobalCanvasShell>` MUST NOT live inside any `app/page.tsx`, `app/<segment>/page.tsx`, or any route component.
4. **MUST** lazy-load `three`, `@react-three/fiber`, `@react-three/drei`, and `@14islands/r3f-scroll-rig` via `next/dynamic({ ssr: false })`. None of these modules MAY appear in the SSR-rendered HTML or the main client chunk.
5. **MUST** render the hero `<h1>` ("What if your will became real?" — Scene 0 headline) in the SSR HTML of `app/page.tsx` so it is the LCP element per FR-SEO-005 + master plan §5.3.
6. **MUST** mount the R3F `<Canvas>` after First Contentful Paint via `requestIdleCallback` (or `setTimeout(0)` as a fallback in browsers without RIC). The canvas MAY remain unmounted indefinitely if `prefers-reduced-motion: reduce` is set, in which case the `/lite` route is used instead (FR-A11Y-001).
7. **MUST** set `<Canvas frameloop="demand">` at bootstrap. Scene-specific FRs flip to `"always"` when their scene is in viewport (FR-PERF-003 governs the policy).
8. **MUST** configure `next.config.ts` with `transpilePackages: ['three']` (master plan §6.1) and `webpack: (config) => { config.optimization.usedExports = true; return config; }` for tree-shaking.
9. **MUST** ship a `/lite` route at `app/(lite)/page.tsx` rendering a pure-DOM fallback (no canvas, no R3F imports, no three). FR-A11Y-001 fills in the storyboard content.
10. **MUST** include `lib/feature-detect.ts` exporting `hasWebGL2()`, `saveDataEnabled()`, `deviceMemoryGB()`. WebGL2 detection at `app/page.tsx` mount → if absent, auto-redirect to `/lite` (FR-WEB-009).
11. **MUST NOT** import `framer-motion`, `react-spring`, or `react-motion`. The motion library is GSAP (master plan §5.1).
12. **MUST** include an `/api/health` route returning `{ status: "ok", ts: <iso> }` 200 OK for uptime probes.
13. **MUST** pass two Vitest tests + one Playwright e2e: (a) bootstrap.spec.ts — SSR HTML contains the hero `<h1>` and does NOT contain the strings `react-three-fiber` or `three.module.js`; (b) bundle-budget.spec.ts — `next build` artifact main chunk size ≤ 200 KB gzipped; (c) Playwright — load `/`, verify `<h1>` is visible within 500ms of navigation, verify a `<canvas>` element appears within 3s.
14. **MUST** set `output: 'standalone'` in `next.config.ts` for the production deployment (FR-OPS-014).
15. **SHOULD** seed the `package.json` `scripts` with `dev`, `build`, `start`, `test`, `test:e2e`, `typecheck`, `lint`, `clean`, all routed through the workspace tool.
16. **MUST** configure `<Canvas dpr={[1, 1.5]}>` at desktop, with breakpoint-aware overrides governed by FR-SCENE-022 (master plan §5.5).

---

## §2 — Why this design (rationale for humans)

**Why GlobalCanvas at layout level, not inside the route?** When `<Canvas>` is inside a route segment, navigating between routes (e.g. `/` → `/work/<slug>` for a case study) unmounts and remounts the WebGL context. WebGL context creation is expensive (~50-150ms even on desktop) AND causes a visible flicker. The 14islands `<GlobalCanvas>` pattern keeps the context alive across navigation; scenes use `<UseCanvas>` to tunnel additional meshes in/out (FR-WEB-003). This is the same pattern Lusion v3 and Igloo Inc. (Awwwards SOTY 2024) use — see master plan §1.4.

**Why next/dynamic({ssr:false}) for three and R3F?** Three.js alone is ~168 KB gz. The total initial JS budget is < 200 KB gz (master plan §6.1). If three is in the main chunk, the budget is blown before a single component renders. Lazy-loading lets the headline render from SSR HTML (LCP-fast), then three loads on RIC + canvas mounts after FCP. The user perceives the page as instant; the cinematic experience layers in.

**Why GSAP, not framer-motion?** Master plan §5.1 — GSAP ScrollTrigger has the strongest scrub-timeline / pinning / named-scenes support. framer-motion is excellent for component-level state animations but underspecialised for scroll-choreographed cinematic timelines.

**Why `frameloop="demand"` at bootstrap?** R3F's default `"always"` runs requestAnimationFrame at 60fps even when nothing has changed. On a marketing page that idles between scene transitions, this wastes 60 × 16.67ms of main-thread time per second. `"demand"` only runs the loop when a scene declares it needs an animation tick. FR-PERF-003 turns it back on per-scene.

**Why hero `<h1>` in SSR HTML?** Two reasons. (1) LCP — Googlebot, Lighthouse, and Core Web Vitals all measure LCP from the first contentful paint of the largest element. Rendering the `<h1>` server-side is the only way to keep LCP < 2.5s at p75 mobile. (2) SEO — Googlebot's HTML crawler doesn't run JS reliably. Every word of narration must be in SSR HTML to be indexed (FR-CMS-005 covers content-side; this FR covers the rendering pipeline).

**Why /lite as a separate route?** Master plan §7.3 mandates `prefers-reduced-motion` and "skip 3D entirely" paths. A separate route with no three import is the cleanest way to honour both — the user lands on `/lite` and three is never even fetched. FR-A11Y-001 fills in the storyboard.

---

## §3 — Public surface contract

### §3.1 `package.json` (apps/web — excerpt)

```jsonc
{
  "name": "@cyberskill/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "clean": "rm -rf .next .turbo"
  },
  "dependencies": {
    "@cyberskill/ds-cinematic": "workspace:*",
    "next": "^15",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@react-three/drei": "latest",
    "@react-three/fiber": "^9",
    "@14islands/r3f-scroll-rig": "^8.15",
    "@playwright/test": "^1",
    "@types/three": "^0.184",
    "gsap": "^3",
    "lenis": "^1.3",
    "three": "^0.184",
    "typescript": "^5.6",
    "vitest": "^2",
    "zustand": "latest"
  }
}
```

Note: `@react-three/fiber`, `@react-three/drei`, `three`, `@14islands/r3f-scroll-rig`, `gsap` are in **devDependencies** because they are loaded only via `next/dynamic({ ssr: false })`. This is a deliberate optimisation to keep them out of the production server bundle. The lazy loader pulls them at runtime client-side.

(Pragmatic note: some teams put these in `dependencies` instead — Next's lazy-load tooling works either way. We pick `devDependencies` to make the "not in critical path" signal explicit at the package.json level.)

### §3.2 `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: { typedRoutes: true },
  transpilePackages: ['three'],
  webpack: (config) => {
    config.optimization = { ...config.optimization, usedExports: true };
    return config;
  },
};
export default nextConfig;
```

### §3.3 `app/layout.tsx`

```tsx
import { SmoothScrollProvider } from '@/components/scroll/SmoothScrollProvider';
import { GlobalCanvasShell } from '@/components/canvas/GlobalCanvasShell';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>
          {children}
          <GlobalCanvasShell />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
```

### §3.4 `components/canvas/GlobalCanvasShell.tsx` (client component)

```tsx
'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { hasWebGL2 } from '@/lib/feature-detect';

const CanvasMount = dynamic(() => import('./CanvasMount'), { ssr: false });

export function GlobalCanvasShell() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasWebGL2()) return;                            // /lite redirect handled elsewhere (FR-WEB-009)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mount = () => setShouldMount(true);
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(mount, { timeout: 500 });
    } else {
      setTimeout(mount, 0);
    }
  }, []);

  if (!shouldMount) return null;
  return <CanvasMount />;
}
```

### §3.5 `components/canvas/CanvasMount.tsx` (client component, dynamic-loaded)

```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { GlobalCanvas } from '@14islands/r3f-scroll-rig';

export default function CanvasMount() {
  return (
    <GlobalCanvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      {/* Scenes push meshes here via <UseCanvas> — FR-WEB-003 */}
    </GlobalCanvas>
  );
}
```

### §3.6 `app/page.tsx` (hero stub — SSR-rendered)

```tsx
export default function HomePage() {
  return (
    <main>
      <header style={{ /* Skip-3D + mute + Skip-story toggles — FR-A11Y-003/004/005 */ }} />
      <section id="hero">
        <h1>What if your will became real?</h1>
        <p>Senior software from Vietnam. Turn your will into real.</p>
        <a href="#cta-hub">Book a Discovery Call →</a>
        <a href="/lite" rel="alternate">Skip 3D — read-only mode</a>
      </section>
      {/* Scene <UseCanvas> hooks land here — FR-SCENE-009 */}
    </main>
  );
}
```

### §3.7 `lib/feature-detect.ts`

```ts
export function hasWebGL2(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function saveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  // @ts-expect-error — Network Information API not in lib.dom yet
  return navigator.connection?.saveData === true;
}

export function deviceMemoryGB(): number | undefined {
  if (typeof navigator === 'undefined') return undefined;
  // @ts-expect-error — Device Memory API not in lib.dom yet
  return (navigator as any).deviceMemory;
}
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **Workspace member resolves** — `pnpm install` from repo root MUST resolve `@cyberskill/web`. `pnpm -F web build` MUST succeed with no errors.
2. **Next 15 + React 19 + R3F 9** — `node -e "console.log(require('./apps/web/package.json').dependencies.next)"` MUST report `^15.x` (or pinned). Same for react `^19`. `node -e "console.log(require('./apps/web/package.json').devDependencies['@react-three/fiber'])"` MUST report `^9`.
3. **Pages Router absent** — `test ! -d apps/web/pages` MUST pass (no `pages/` directory).
4. **GlobalCanvasShell in layout, NOT page** — `grep -c 'GlobalCanvasShell' apps/web/app/layout.tsx` MUST be ≥ 1; `grep -rn 'GlobalCanvasShell\|<GlobalCanvas' apps/web/app/page.tsx apps/web/app/(lite)/page.tsx` MUST return zero hits.
5. **SSR HTML carries `<h1>` and no three** — `curl -s http://localhost:3000/ | tee /tmp/ssr.html` then `grep -c 'What if your will became real' /tmp/ssr.html` MUST be ≥ 1; `grep -ciE 'three\.module|react-three' /tmp/ssr.html` MUST be 0.
6. **Bundle budget** — `next build` artifact main chunk ≤ 200 KB gz. Asserted in `tests/bundle-budget.spec.ts` via `@next/bundle-analyzer` JSON output.
7. **Canvas mounts post-FCP** — Playwright e2e: navigate to `/`, assert `<h1>` visible within 500ms; assert `canvas` element appears within 3000ms; assert `canvas` is NOT in the initial DOM (`page.locator('canvas').count() == 0` immediately after `goto`).
8. **transpilePackages includes 'three'** — `grep 'transpilePackages.*three' apps/web/next.config.ts` MUST match.
9. **/lite route renders without three** — `curl -s http://localhost:3000/lite` MUST 200 and the HTML body MUST NOT contain `canvas`, `three`, `react-three`. (Storyboard content fills in via FR-A11Y-001.)
10. **`/api/health` 200** — `curl -fs http://localhost:3000/api/health` MUST return JSON `{ status: "ok", ts: ... }`.
11. **No forbidden libraries** — `grep -rE 'framer-motion|react-spring|react-motion' apps/web/{package.json,app,components,lib}` MUST return zero hits.
12. **`prefers-reduced-motion` short-circuit** — Playwright with `emulateMedia: { reducedMotion: 'reduce' }` MUST verify the `<canvas>` element never mounts; the page MUST still render the headline and CTA.
13. **`frameloop="demand"` at bootstrap** — `grep "frameloop=[\"']demand[\"']" apps/web/components/canvas/CanvasMount.tsx` MUST match.
14. **WebGL2 detection works** — `lib/feature-detect.ts` exports `hasWebGL2()`; Vitest unit test stubs `document.createElement` to return a canvas without `webgl2` context and verifies `hasWebGL2()` returns false. Other branch returns true.

---

## §5 — Verification method

**Tests (`verify: T`):**

```typescript
// apps/web/tests/bootstrap.spec.ts
import { describe, expect, test } from 'vitest';

describe('FR-WEB-001 — bootstrap', () => {
  test('AC#3: no pages directory', async () => {
    const { existsSync } = await import('node:fs');
    expect(existsSync('apps/web/pages')).toBe(false);
  });

  test('AC#4: layout has GlobalCanvasShell; page does not', async () => {
    const { readFile } = await import('node:fs/promises');
    const layout = await readFile('apps/web/app/layout.tsx', 'utf8');
    const page = await readFile('apps/web/app/page.tsx', 'utf8');
    expect(layout).toMatch(/GlobalCanvasShell/);
    expect(page).not.toMatch(/GlobalCanvasShell/);
    expect(page).not.toMatch(/<GlobalCanvas/);
  });

  test('AC#11: no forbidden motion libs', async () => {
    const { readFile } = await import('node:fs/promises');
    const pkg = JSON.parse(await readFile('apps/web/package.json', 'utf8'));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(Object.keys(all)).not.toContain('framer-motion');
    expect(Object.keys(all)).not.toContain('react-spring');
    expect(Object.keys(all)).not.toContain('react-motion');
  });

  test('AC#13: frameloop=demand at bootstrap', async () => {
    const { readFile } = await import('node:fs/promises');
    const mount = await readFile('apps/web/components/canvas/CanvasMount.tsx', 'utf8');
    expect(mount).toMatch(/frameloop=["']demand["']/);
  });
});
```

```typescript
// apps/web/tests/bundle-budget.spec.ts
import { describe, expect, test } from 'vitest';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { glob } from 'glob';

describe('FR-WEB-001 — bundle budget', () => {
  test('AC#6: main chunk ≤ 200 KB gz', async () => {
    const chunks = await glob('apps/web/.next/static/chunks/main-*.js');
    expect(chunks.length).toBeGreaterThan(0);
    const buf = await readFile(chunks[0]);
    const gz = gzipSync(buf);
    expect(gz.byteLength).toBeLessThanOrEqual(200 * 1024);
  });
});
```

```typescript
// apps/web/tests/e2e.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('AC#5+7: SSR <h1> + canvas mounts post-FCP', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible({ timeout: 500 });
  expect(await page.locator('canvas').count()).toBe(0);
  await expect(page.locator('canvas')).toBeVisible({ timeout: 3000 });
});

test('AC#12: prefers-reduced-motion → no canvas', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForTimeout(2000);
  expect(await page.locator('canvas').count()).toBe(0);
});

test('AC#9: /lite has no canvas / no three', async ({ page }) => {
  const resp = await page.goto('/lite');
  const html = await resp!.text();
  expect(html).not.toMatch(/canvas|three|react-three/i);
});
```

CI gate: `pnpm -F web test && pnpm -F web build && pnpm -F web exec playwright test`. Failure blocks merge.

---

## §6 — Dependencies

- `@cyberskill/ds-cinematic` (FR-DS-003) — workspace peer for tokens.
- Workspace tool (pnpm) configured.
- TypeScript ≥ 5.6, Vitest ≥ 2, Playwright ≥ 1.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| three.js winds up in main chunk | `tests/bundle-budget.spec.ts` fails | Move three to `devDependencies` + `next/dynamic({ssr:false})`; verify `transpilePackages: ['three']` is set |
| WebGL context lost on `/` → `/work/<slug>` nav | Manual smoke during P4; OBS error log | Verify GlobalCanvasShell is in layout, not page; check Next.js routing doesn't unmount layout segment |
| LCP > 2.5s mobile p75 | Lighthouse CI (FR-OPS-011) | Audit critical CSS, defer fonts, verify `<h1>` is SSR-rendered |
| `prefers-reduced-motion` ignored | Playwright AC#12 fails | Verify GlobalCanvasShell short-circuits before three imports load |
| Pages Router accidentally introduced | AC#3 test fails | Delete `pages/`; verify App Router only |
| framer-motion smuggled in via transitive dep | AC#11 grep finds it | Locate consumer, replace with GSAP equivalent |
| Bundle analyzer artifact path differs across Next versions | Bundle test glob misses | Update glob in `bundle-budget.spec.ts`; check `.next/build-manifest.json` for canonical chunk name |
| WebGL2 detection false-positive (mock contexts) | Smoke on real browser | Add UA + extension probe; cross-check `gl.getParameter(gl.VERSION)` |
| dpr=[1, 1.5] causes janky scroll on high-DPI Android | Smoke on Pixel 6a (master plan §10.2 risk) | FR-SCENE-022 lowers DPR cap on tablet/mobile breakpoints |
| `transpilePackages` config silently ignored in Next 15 | `next build` logs report missing transform | Verify Next 15 changelog; the option moved out of `experimental` in 14.x |

---

## §8 — Notes

- The version pins (`next ^15`, `react ^19`, `three ^0.184`, R3F `^9`) are correct as of May 2026 per master plan §13.2. Verify at sprint kickoff that no security/perf advisory has bumped a minor.
- The `app/(lite)` route group convention (parentheses) creates the `/lite` URL without nesting in the layout — the lite path renders without `<GlobalCanvasShell>` in the layout chain. This is the cleanest way to get a three-free route in App Router.
- The "GlobalCanvas in layout" pattern is the same one used by Lusion v3 + Igloo Inc. + 14islands' Sanity case study (master plan §1.4 + §13.1). It's not novel; it's well-trodden.
- The `frameloop="demand"` default + per-scene flip pattern is governed by FR-PERF-003. Don't change it here.

---

*End of FR-WEB-001. Audit: `FR-WEB-001-next15-r3f-globalcanvas-bootstrap.audit.md`.*
