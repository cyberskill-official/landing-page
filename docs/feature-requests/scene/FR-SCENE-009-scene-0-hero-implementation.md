---
id: FR-SCENE-009
title: "Scene 0 Hero implementation — DOM headline as LCP, canvas mounts post-FCP, fly_in→idle Lumi"
module: SCENE
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 2
owner: Frontend Lead + R3F Architect
created: 2026-05-16
shipped: 2026-05-18
strict_audited: 2026-05-18
mocked_dependency: "Final Lumi GLB animation clips are represented by a deterministic R3F mock mesh and store-sequence contract until the production /lumi.glb replaces FR-CHAR-011's mocked asset."
related_frs: [FR-WEB-001, FR-WEB-003, FR-WEB-005, FR-WEB-006, FR-SCENE-001, FR-CHAR-011, FR-CMS-002, FR-DS-007, FR-PERF-001, FR-PERF-004]
depends_on: [FR-WEB-001, FR-SCENE-001, FR-CHAR-011, FR-CMS-002]
blocks: [FR-SCENE-010, FR-SCENE-011, FR-SCENE-012, FR-PERF-004]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 0 row — "Hook: 'What if your will became real?' Lumi fly_in + idle"
  - docs/01-master-plan-v2.md §5.3 loading strategy — "Hero h1 in SSR HTML for LCP; canvas mounts post-hydration"
  - docs/01-master-plan-v2.md §6.1 perf budgets — "LCP ≤ 2.5s; canvas mount ≤ 3s post-FCP"
  - docs/01-master-plan-v2.md §3.3a animation library — "fly_in 2.0s no-loop, idle 4.0s loop"

language: typescript + react 19 + r3f 9
service: apps/web/components/scenes/scene-0-hero/
new_files:
  - apps/web/components/scenes/scene-0-hero/Scene0Hero.tsx
  - apps/web/components/scenes/scene-0-hero/Scene0Hero.client.tsx
  - apps/web/components/scenes/scene-0-hero/Scene0HeroCanvas.tsx
  - apps/web/tests/web/scene-0-hero.spec.ts
  - apps/web/components/scenes/scene-0-hero/__tests__/scene-0.unit.test.ts

effort_hours: 10
risk_if_skipped: "Without Scene 0 polished implementation, the cinematic doesn't open — the hero LCP element is missing, the fly_in→idle sequence doesn't fire, and the entire P3 phase-gate (Scene 0 staging URL, Lighthouse ≥ 95) fails. This is the only FR that integrates FR-WEB-001 + FR-WEB-003 + FR-CHAR-011 + FR-CMS-002 into a user-visible experience."
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

1. **MUST** render the hero `<h1>` in **SSR HTML** as the LCP target. The text MUST be byte-identical to FR-CMS-002 line `scene-0-hero-primary`: "What if your will became real?" (or VI variant on /vi route). The element MUST be present in `curl http://localhost:3000/` response — verifiable via plain HTTP inspection, no JS required.

2. **MUST** register the Scene 0 canvas tunnel via `<SceneTunnel>` from FR-WEB-003. The tunnel's `id` MUST be `"scene-0-hero"` matching `content/narrative/scene-defs.json`.

3. **MUST** invoke Lumi animation sequence on canvas mount: `fly_in` clip (2.0s, ease-out-quint via FR-CHAR-011 §1 #9) immediately, then transition to `idle` (4.0s loop) on `fly_in` clip completion. Clip names MUST be byte-identical to FR-CHAR-011 §1 #1 enumeration.

4. **MUST** include the Scene 0 caption from FR-CMS-002 line `scene-0-hero-primary` verbatim. Caption rendered in JetBrains Mono per FR-DS-007 typography pairing, positioned below the hero `<h1>` per FR-SCENE-001 comp.

5. **MUST** mount the canvas within 3s post-FCP per FR-WEB-001 §1 #5. Playwright test asserts `<canvas>` element appears in DOM within 3000ms of `domContentLoaded`.

6. **MUST NOT** include the canvas in the SSR HTML (per FR-WEB-005 dynamic-three.ts boundary). Initial SSR response contains only DOM scaffold + loading fallback; canvas hydrates client-side.

7. **MUST** preload Lumi GLB at canvas-mount time per FR-WEB-006 §1 #2 (`useGLTF.preload('/lumi.glb')`). Lumi is the LCP-after-canvas-mount priority asset.

8. **MUST** integrate with Zustand `useLumiStore` (FR-WEB-004) — setting `currentAnim` to `"fly_in"` initially, then `"idle"` on completion. Animation state flows through the store so other scenes (and the corner avatar in FR-SCENE-008) can react.

9. **MUST** be axe-core clean at Scene 0 viewport: no aria-label violations, no missing alt text on canvas (canvas should have `aria-label="Lumi the golden genie waving hello"` or similar — FR-A11Y-005 specifies).

10. **MUST** respect reduced-motion per FR-A11Y-001: if `prefers-reduced-motion: reduce`, Scene 0 renders the DOM h1 + caption + static FR-DS-001 hero image (no canvas, no animation).

11. **MUST** ship Vitest unit tests + Playwright integration tests in `__tests__/`.

12. **MUST NOT** block the main thread > 50ms during canvas mount (FR-PERF-006 INP budget). Use `requestIdleCallback` for non-critical setup; defer Lumi animation mixer initialization to after first paint.

## §2 — Why this design

**Why DOM headline as LCP, not canvas content?** LCP requires the largest contentful paint to be in the SSR HTML — canvas content paints post-hydration (1-3 seconds later). If the hero is a canvas-rendered 3D text, LCP slips past 2.5s on every device. DOM h1 + canvas mounted alongside gives us "LCP at h1 paint" (fast) + "cinematic Lumi at canvas hydration" (the polish). Master plan §5.3 explicit.

**Why exactly fly_in → idle (no other clips on Scene 0)?** Scene 0 is the entrance. `fly_in` is Lumi entering the camera frame in a corkscrew arc. `idle` is the loop while user reads the headline. Any other clip would distract from the hook. Scene-specific clips (point, summon, wave) belong to later scenes. Master plan §3.3a + §2.1 Scene 0 row.

**Why integrate with `useLumiStore`?** The corner avatar (FR-SCENE-008) and other scenes need to know what Lumi is doing. Centralized state in Zustand is the clean cross-scene contract — Scene 0 sets `currentAnim`; corner avatar reads it for the wave-goodbye on scroll-up; Scene 3 reads it to coordinate the split_to_4 entrance.

## §3 — Deliverable structure

```
apps/web/components/scenes/scene-0-hero/
├── Scene0Hero.tsx                    # server-component re-export
├── Scene0Hero.client.tsx             # "use client" DOM + tunnel-register
├── Scene0HeroCanvas.tsx              # R3F content inside <SceneTunnel>
└── __tests__/
    ├── scene-0.unit.test.ts          # Vitest
    └── scene-0.spec.ts               # Playwright
```

`Scene0Hero.tsx` (server) imports the client component + `SceneTunnel` from `@/lib/dynamic-three`. The client component:

```tsx
"use client";
import { useRef, useEffect } from "react";
import { SceneTunnel } from "@/lib/dynamic-three";
import { useLumiStore } from "@/lib/stores";

export function Scene0HeroClient() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => { useLumiStore.getState().setCurrentAnim("fly_in"); }, []);
  return (
    <section ref={sectionRef} className="h-screen">
      <h1>What if your will became real?</h1>
      <p className="font-mono">Whisper an idea. I'll show you the rest.</p>
      <SceneTunnel id="scene-0-hero" trackElement={sectionRef}>
        <Scene0HeroCanvas />
      </SceneTunnel>
    </section>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | SSR HTML contains `<h1>What if your will became real?</h1>` | curl + grep |
| 2 | Canvas appears within 3s of page load | Playwright timing |
| 3 | Lumi clip sequence: fly_in → idle (no other clips fired) | Playwright with R3F dev mode |
| 4 | Caption text byte-identical to en.json `scene-0-hero-primary` | Cross-ref test |
| 5 | axe-core clean on Scene 0 viewport | Playwright + @axe-core/playwright |
| 6 | Reduced-motion: canvas absent, static image rendered | Playwright `--emulate-media=reduced-motion` |
| 7 | useLumiStore.currentAnim transitions fly_in → idle | Playwright eval of store state |
| 8 | INP ≤ 50ms during mount | Lighthouse / Web Vitals JS API |
| 9 | LCP ≤ 2.5s on simulated 4G mobile | Lighthouse CI |
| 10 | aria-label on canvas present | Playwright accessibility tree |
| 11 | `pnpm -F web test:e2e` passes | CI |
| 12 | `pnpm -F web test` passes Vitest | CI |

## §5 — Verification

```ts
// __tests__/scene-0.spec.ts
import { test, expect } from "@playwright/test";

test("Scene 0 h1 is in SSR HTML", async ({ request }) => {
  const resp = await request.get("/");
  const html = await resp.text();
  expect(html).toContain("<h1>What if your will became real?</h1>");
});

test("Canvas mounts within 3s", async ({ page }) => {
  const start = Date.now();
  await page.goto("/");
  await page.waitForSelector("canvas");
  expect(Date.now() - start).toBeLessThan(3000);
});

test("fly_in transitions to idle", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim)).toBe("fly_in");
  await page.waitForTimeout(2200);  // fly_in duration + buffer
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim)).toBe("idle");
});

test("reduced-motion renders static, no canvas", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await page.locator("canvas").count()).toBe(0);
  expect(await page.locator("img[data-lumi-static]").count()).toBe(1);
});
```

## §6 — Dependencies

**Concept:** FR-WEB-001 (canvas bootstrap), FR-SCENE-001 (Scene 0 comp), FR-CHAR-011 (animation library), FR-CMS-002 (caption).

**Operational:** FR-WEB-003 (SceneTunnel), FR-WEB-004 (Zustand stores), FR-WEB-005 (dynamic-three), FR-WEB-006 (Suspense + preload), FR-DS-007 (typography).

**Downstream blocks:** FR-SCENE-010 (Lumi fly_in idle wiring detail), FR-SCENE-011 (above-fold CTA), FR-SCENE-012 (particulate dust), FR-PERF-004 (LCP gate).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| LCP > 2.5s (h1 not in SSR) | AC#1 + Lighthouse | Verify font-display:swap + h1 SSR-rendered + no client-only render guards |
| Canvas mount > 3s | AC#2 | Audit dynamic-three.ts bundle size; verify preload working |
| Wrong clip name fires (e.g. "flyIn" vs "fly_in") | AC#3 + FR-CHAR-011 trial export | Use exact name from animation library; type-check via AnimationClipName |
| Caption drift from en.json | AC#4 | Restore from canonical content/narrative/lines/en.json |
| Reduced-motion still mounts canvas | AC#6 | Guard via FR-A11Y-001 useReducedMotion hook |
| axe violations on canvas | AC#5 + AC#10 | Add aria-label per FR-A11Y-005 |
| INP > 50ms during fly_in (animation mixer init blocks main thread) | AC#8 | Defer mixer init to requestIdleCallback; pre-warm via FR-WEB-006 preload |
| Store transition fly_in → idle missed (race condition) | AC#7 | Use onFinished callback from mixer, not setTimeout |
| Both fly_in and idle play simultaneously | Visual | Stop all actions before crossFadeTo idle |
| Memory leak on remount (HMR) | Perf profile | useEffect cleanup calls disposeSubtree per FR-WEB-003 §1 #3 |
| Hero h1 hidden by canvas overlay | Visual | z-index: canvas behind DOM by default; h1 has explicit z-index 1 |
| Tunnel id mismatch with scene-defs.json | Build-time | Validator script scans tunnel ids vs scene-defs.json |

## §8 — Deliverable preview

Loading `/` in browser:
1. SSR HTML arrives with hero h1 visible at ~ 100-300ms (LCP).
2. Loading fallback (golden pulse) appears briefly.
3. Canvas mounts at ~ 1.5-2.5s; Lumi fly_in starts immediately.
4. After 2.0s, fly_in completes; idle loop begins.
5. User scrolls; FR-SCENE-013+ takes over.

## §9 — Notes

**On LCP attribution:** Some Lighthouse runs may attribute LCP to a background image or large character. Test on cold-cache 4G; manually inspect `web-vitals` LCP attribution.

**On future enhancement:** Slice 3 could add subtle parallax on hero h1 driven by mouse position. Out of scope for this slice.

## §10 — Zero-touch strict audit evidence (2026-05-18)

### Implementation

- Added `apps/web/components/scenes/scene-0-hero/Scene0Hero.tsx`, `Scene0Hero.client.tsx`, and `Scene0HeroCanvas.tsx`.
- Replaced the inline home-page hero with `<Scene0Hero />` while preserving SSR h1 output and the canonical FR-CMS-002 caption.
- Added canvas accessibility labeling in `apps/web/components/canvas/CanvasMount.tsx`.
- Added contract tests and browser tests for SSR, mount timing, reduced motion, and `fly_in -> idle` state.
- Wrote `docs/contracts/FR-SCENE-009-lumi-animation-contract.md` because the final animation-bearing Lumi GLB remains a mocked dependency.

### Edge-case matrix

| Vector | Edge case | Coverage |
|---|---|---|
| Null inputs | Locale or narrative line is absent | `getScene0HeroCopy()` falls back to EN canonical text and unit tests assert fallback. |
| Malformed payload | `/lumi.glb` exists without final animation clips | Mock contract renders `scene-0-hero-lumi-mock-contract` and asserts store sequence. |
| Extreme bounds | WebGL2 missing or reduced motion enabled | Capability gate and reduced-motion Playwright path keep canvas absent and static image visible. |
| Invalid content | Tunnel id, caption, or Scene 0 accessory scope drifts | Unit tests assert `scene-0-hero`, FR-CMS-002 caption, and no nón lá/hat content. |
| Concurrent race | Canvas appears after React hydration or the R3F child readiness signal races DOM mount | Animation start is idempotent and probes the persistent canvas DOM before setting `fly_in`. |
| Observability | Scene 0 runtime state is opaque | `window.__scene0HeroState.sequence`, `window.__stores.lumi.currentAnim`, and `scene_enter` analytics expose state. |

### Verification

```text
$ cd apps/web && node_modules/.bin/vitest run components/scenes/scene-0-hero/__tests__/scene-0.unit.test.ts components/scenes/scene-0-hero/__tests__/scene-0.client.test.tsx components/scenes/scene-0-hero/__tests__/scene-0.canvas.test.tsx --config vitest.config.ts --coverage.enabled true --coverage.provider v8 --coverage.include 'components/scenes/scene-0-hero/Scene0Hero.tsx' --coverage.include 'components/scenes/scene-0-hero/Scene0Hero.client.tsx' --coverage.include 'components/scenes/scene-0-hero/Scene0HeroCanvas.tsx'
Test Files  3 passed (3)
Tests  9 passed (9)
Coverage: All files 98.72% statements, 94.73% branches, 75% functions, 98.72% lines
```

```text
$ cd apps/web && node_modules/.bin/vitest run components/scenes/scene-0-hero/__tests__/scene-0.unit.test.ts components/scenes/scene-0-hero/__tests__/scene-0.client.test.tsx components/scenes/scene-0-hero/__tests__/scene-0.canvas.test.tsx tests/bootstrap.test.ts tests/unit/no-three-in-ssr.test.ts --config vitest.config.ts
Test Files  5 passed (5)
Tests  21 passed (21)
```

```text
$ cd apps/web && node_modules/.bin/tsc -p tsconfig.json --noEmit
exit 0
```

```text
$ cd apps/web && node_modules/.bin/next build
Compiled successfully
/ First Load JS 112 kB
/lite First Load JS 105 kB
```

```text
$ cd apps/web && node_modules/.bin/vitest run tests/unit/no-three-in-ssr.test.ts --config vitest.config.ts
Test Files  1 passed (1)
Tests  1 passed (1)
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/web/scene-0-hero.spec.ts tests/web/dynamic-three.spec.ts --project=chromium
5 passed
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/a11y/all-routes.spec.ts --project=chromium
34 passed
```

*End of FR-SCENE-009.*
