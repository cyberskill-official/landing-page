---
id: FR-WEB-002
title: "Lenis 1.3 smooth-scroll provider — singleton, ScrollTrigger-integrated, no scroll-hijack, reduced-motion aware"
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
related_frs: [FR-WEB-001, FR-WEB-003, FR-WEB-004, FR-A11Y-001, FR-SCENE-020]
depends_on: [FR-WEB-001]
blocks: [FR-WEB-003, FR-WEB-004, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.1 web stack — "Smooth scroll — Lenis 1.3+, singleton, RAF-driven"
  - docs/01-master-plan-v2.md §2.3 motion ethics — "Never override scroll velocity; scroll-hijack is a non-starter"
  - docs/01-master-plan-v2.md §7.3 a11y — "@media (prefers-reduced-motion: reduce) disables smoothing"
  - docs/01-master-plan-v2.md §5.2 — "ScrollTrigger reads Lenis progress; never instantiate ScrollTrigger.scrollerProxy twice"

language: typescript + react 19 + next.js 15 (app router)
service: apps/web/
new_files:
  - apps/web/components/scroll/SmoothScrollProvider.tsx
  - apps/web/components/scroll/SmoothScrollProvider.client.tsx
  - apps/web/lib/lenis-singleton.ts
  - apps/web/lib/lenis-scrolltrigger-bridge.ts
  - apps/web/tests/web/scroll.spec.ts
modified_files:
  - apps/web/app/layout.tsx  # already mounts <SmoothScrollProvider/>; wire singleton handoff

effort_hours: 4
risk_if_skipped: "Without Lenis, scroll-choreographed scenes (every SCENE-NNN) render without the cinematic 'butter' that defines the visual brand. GSAP ScrollTrigger reads native scroll progress, which jitters at 60 fps with macOS trackpad inertia. The Scene 0 hero `fly_in` corkscrew arc reads choppy. Reverting to native scroll downstream costs ~ 2 days of ScrollTrigger refactor across 7 scenes."
---

## §1 — Description (BCP-14 normative)

1. **MUST** integrate Lenis 1.3.x (pinned via `pnpm add lenis@~1.3`) as the smooth-scroll layer. Mount via `<SmoothScrollProvider>` in `app/layout.tsx` (already scaffolded by FR-WEB-001 §3.1). Library version pinned to `~1.3` — Lenis 1.4+ introduced breaking changes to the `Lenis.options` shape that ripple into the ScrollTrigger bridge.

2. **MUST NOT override scroll velocity.** Lenis smooths the *visual* — the user's wheel/trackpad delta MUST drive `lenis.targetScroll` 1:1; `lenis.actualScroll` lerps toward it. Banned options: `infinite: true`, `direction: "horizontal"` (unless future horizontal-scroll FR adds it), `mouseMultiplier > 1.0`, `wheelMultiplier > 1.0`. Master plan §2.3 motion-ethics: "we never override the user's scroll velocity".

3. **MUST** expose the Lenis instance as a **singleton** via `lib/lenis-singleton.ts`. The pattern: a module-level `let lenisInstance: Lenis | null = null` with `getLenis()` returning the current instance and `setLenis(l)` called once from `SmoothScrollProvider`'s effect. This lets GSAP ScrollTrigger (FR-WEB-003 consumer), R3F scroll-rig (FR-WEB-003), Zustand stores (FR-WEB-004), and individual scenes read scroll progress without re-instantiating Lenis.

4. **MUST** respect `@media (prefers-reduced-motion: reduce)`:
   - If reduced-motion is detected at provider-mount time, MUST NOT instantiate Lenis at all. Native browser scroll handles everything.
   - If user toggles reduced-motion mid-session (rare but possible via OS-level toggle), provider MUST listen on `matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', ...)` and destroy/recreate Lenis accordingly.
   - The singleton MUST report `getLenis() === null` when in reduced-motion mode so consumers degrade to native scroll.

5. **MUST NOT block native keyboard scrolling. PageDown / PageUp / arrow keys / Home / End / Space MUST all work and produce smooth scroll. Lenis 1.3 has built-in keyboard support (`syncTouch: false`, default settings); the provider must NOT disable it.

6. **MUST** be SSR-safe. Lenis touches `window` + `document` directly. Therefore:
   - The `SmoothScrollProvider` component MUST be a **client component** (`"use client"` directive) — but its outer wrapper for layout.tsx imports MUST be a server component re-export to avoid forcing the whole layout client-side.
   - Lenis instantiation MUST happen inside `useEffect(() => { ... }, [])` — never at module-eval time.
   - `lib/lenis-singleton.ts` MUST be importable in server components (returns null pre-hydration).

7. **MUST** bridge Lenis ↔ GSAP ScrollTrigger via `lib/lenis-scrolltrigger-bridge.ts`:
   - Use `gsap.ticker.add(time => lenis.raf(time * 1000))` to drive Lenis from GSAP's RAF loop (NOT a separate RAF — competing RAFs cause jitter).
   - Disable `gsap.ticker.lagSmoothing()` (Lenis is the smoothing layer; GSAP's lag-smoothing competes).
   - Call `ScrollTrigger.scrollerProxy(document.body, { scrollTop, scrollLeft, getBoundingClientRect })` exactly ONCE. Master plan §5.2 documents this — double-instantiation produces erratic progress values.
   - Call `ScrollTrigger.refresh()` after Lenis is fully mounted.

8. **MUST** expose a typed React hook `useScrollProgress()` (in `lib/lenis-singleton.ts` exports) that returns `0..1` mapped to viewport-progress through total document height. This is what scene components consume; they MUST NOT import Lenis directly.

9. **MUST NOT** disable the browser's overscroll-bounce behaviour (macOS rubber-banding, iOS bounce). Banned config: `overscroll: "none"` in CSS, `lenis.options.overscroll = false`. Native overscroll is an a11y affordance — disabling it confuses users who expect "I'm at the bottom" feedback.

10. **MUST** maintain anchor-link navigation. `<a href="#scene-3">` MUST scroll smoothly to the target via Lenis's `lenis.scrollTo(target, { duration: 1.2, easing: ... })` API. The provider MUST hook into `next/link` clicks AND raw `<a href="#...">` clicks to route through Lenis.

11. **MUST** include the **lenis CSS** import in `app/globals.css`: `@import 'lenis/dist/lenis.css';` — provides the required `html.lenis` body classes that Lenis applies for momentum scrolling. Without this, scroll-progress sync is correct but visual feel reverts to ungated native scroll under some browser versions.

12. **MUST NOT** mount Lenis on the `/lite` route (the reduced-motion fallback path from FR-A11Y-001). The `/lite` route uses a flat scroll experience with the 7-panel SVG storyboard. Wrapping `/lite` in `<SmoothScrollProvider>` MUST be guarded against by route detection.

13. **MUST** ship Playwright integration tests (`apps/web/tests/web/scroll.spec.ts`) covering: singleton accessibility, reduced-motion bypass, keyboard scroll, no-velocity-override (synthetic wheel event), SSR build success, anchor-link navigation, `/lite` route bypass.

14. **MUST** include the type-safe singleton API: `getLenis(): Lenis | null`, `setLenis(l: Lenis | null): void`, `useScrollProgress(): number`, `useLenis(): Lenis | null` (hook returning the instance — null in reduced-motion).

15. **SHOULD** include a development-mode debug overlay (toggleable via `?debug=scroll` query param) showing the current `lenis.scroll`, `lenis.velocity`, and `lenis.progress` in a fixed-corner panel. Disabled in production.

## §2 — Why this design

**Why Lenis 1.3 specifically (not native CSS `scroll-behavior: smooth`)?** Native `scroll-behavior: smooth` only handles anchor-link jumps — wheel/trackpad scrolling is still instant. Native browser smooth-scroll polyfills don't allow programmatic access to the smoothed velocity for GSAP ScrollTrigger integration. Lenis is the de-facto standard for cinematic scroll in 2025-2026 — it pairs cleanly with GSAP ScrollTrigger, ships with reduced-motion support out of the box, and weighs ~ 18 KB minified. Alternatives (LocomotiveScroll, scroll-rig) either bring more weight, lock you into specific component patterns, or are abandoned. The master plan §5.1 spec calls out Lenis 1.3+ by name.

**Why singleton instead of provider-scoped state?** GSAP ScrollTrigger's `scrollerProxy` registers ONE scroller per page. Re-registering produces erratic progress. R3F scroll-rig also expects a single scroll source. Putting Lenis in React state means it would re-create on hot reload, on layout re-mount, on prop changes — and any of those creates a fresh Lenis with a fresh `scrollerProxy` registration, which silently breaks all ScrollTriggers. A module-level singleton (initialized once in useEffect) sidesteps all of those re-render hazards.

**Why bridge through `gsap.ticker.add` instead of running Lenis's own RAF?** Lenis's default behavior is to run its own `requestAnimationFrame` loop. GSAP also runs one. Two RAFs scheduled by separate Node-event-loop systems desync at 60 fps — Lenis ticks at frame N, GSAP ticks at frame N+epsilon, and ScrollTrigger reads a slightly stale Lenis state. The user sees micro-jitter on long scrolls. Routing both through GSAP's single RAF (`gsap.ticker.add(time => lenis.raf(time * 1000))`) ensures both update in lockstep. Master plan §5.2 documents this exact pattern as the canonical Lenis + ScrollTrigger integration.

**Why disable `gsap.ticker.lagSmoothing()`?** GSAP's lag-smoothing is a generic dropped-frame compensator — if a frame takes > 500ms, GSAP "freezes" its animation clock and resumes after the lag. Lenis already implements its own smoothing/lerp that handles the same case. With both running, you get double-smoothing artifacts (a "rubber band" feel on long scrolls after a jank). Disabling GSAP's layer makes Lenis the single source of truth for smoothing behavior.

**Why no Lenis on `/lite`?** The `/lite` route (FR-A11Y-001) is the reduced-motion / non-WebGL fallback that ships a flat 7-panel SVG storyboard with native scroll. Wrapping it in Lenis defeats the purpose — users on `/lite` have explicitly opted into reduced motion, and smooth-scroll IS motion. Master plan §7.3 a11y spec is unambiguous: reduced-motion means no programmatic scroll smoothing, just native browser behavior.

**Why expose a `useScrollProgress()` hook AND a `useLenis()` hook?** Most consumers (scene components, animation triggers) only need 0..1 progress. Few consumers need raw Lenis (e.g. a debug overlay, an in-canvas scroll-driven shader). By exposing a narrow `useScrollProgress()` hook, consumers don't need to import Lenis types or handle the null-in-reduced-motion case — the hook returns 0 if Lenis is null, which is the right behavior for "what fraction of the page have I scrolled".

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/
├── app/
│   ├── layout.tsx                                    # MOUNTS <SmoothScrollProvider/> (already wired by FR-WEB-001)
│   └── globals.css                                   # ADD: @import 'lenis/dist/lenis.css';
├── components/scroll/
│   ├── SmoothScrollProvider.tsx                      # NEW — server-component re-export
│   └── SmoothScrollProvider.client.tsx               # NEW — "use client" effect-mount
├── lib/
│   ├── lenis-singleton.ts                            # NEW — module-level singleton + hooks
│   └── lenis-scrolltrigger-bridge.ts                 # NEW — gsap.ticker + scrollerProxy wiring
└── tests/web/
    └── scroll.spec.ts                                # NEW — Playwright integration tests

package.json:
  dependencies:
    "lenis": "~1.3.0"                                 # PIN to 1.3 minor
    "gsap": "^3.12.5"                                 # (already from FR-WEB-001)
```

### §3.2 — `lib/lenis-singleton.ts` interface

```ts
import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function setLenis(l: Lenis | null): void {
  lenisInstance = l;
}

export function useLenis(): Lenis | null { /* React hook — re-renders on set */ }
export function useScrollProgress(): number { /* 0..1, mapped through document height */ }
```

### §3.3 — `lib/lenis-scrolltrigger-bridge.ts` interface

```ts
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function bridgeLenisToScrollTrigger(lenis: Lenis): () => void {
  // Returns a cleanup function.
  // 1) gsap.ticker.add(time => lenis.raf(time * 1000));
  // 2) gsap.ticker.lagSmoothing(0);
  // 3) ScrollTrigger.scrollerProxy(document.body, { scrollTop, scrollLeft, getBoundingClientRect });
  // 4) ScrollTrigger.refresh();
}
```

### §3.4 — Provider component shape (client)

```tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { setLenis } from "@/lib/lenis-singleton";
import { bridgeLenisToScrollTrigger } from "@/lib/lenis-scrolltrigger-bridge";
import { usePathname } from "next/navigation";

export function SmoothScrollProviderClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced || pathname?.startsWith("/lite")) return;  // §1 #4, §1 #12
    const lenis = new Lenis({
      smoothWheel: true,
      smoothTouch: false,         // master plan §7.3: respect mobile-native
      wheelMultiplier: 1.0,       // §1 #2: no velocity override
      duration: 1.2,
    });
    lenisRef.current = lenis;
    setLenis(lenis);
    const cleanup = bridgeLenisToScrollTrigger(lenis);
    return () => { cleanup(); lenis.destroy(); setLenis(null); };
  }, [reduced, pathname]);

  return <>{children}</>;
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Lenis singleton accessible | `import { getLenis } from '@/lib/lenis-singleton'` returns Lenis-or-null; Playwright `window.__lenis` exposed in dev |
| 2 | reduced-motion disables Lenis | Playwright with `--emulate-media=reduced-motion`; `getLenis() === null` |
| 3 | Keyboard scroll works | Playwright: focus body, press PageDown, observe `window.scrollY` increased |
| 4 | No wheel-velocity override | Playwright `page.mouse.wheel(0, 1000)`; `lenis.velocity` peaks at ~ 1000 (within smoothing), not clamped |
| 5 | SSR-safe — `pnpm -F web build` succeeds | CI workflow `apps/web/build`; no `ReferenceError: window is not defined` |
| 6 | Anchor-link navigation routes through Lenis | Playwright clicks `<a href="#scene-3">`; observe smooth-scroll animation > 500ms |
| 7 | `/lite` route bypass | Playwright navigates to `/lite`; `getLenis() === null` |
| 8 | `gsap.ticker.lagSmoothing` is disabled | Playwright eval: `gsap.ticker.deltaRatio()` behavior verifies lag-smoothing off |
| 9 | `ScrollTrigger.scrollerProxy` registered once | Playwright eval: `ScrollTrigger.getAll()` reports the proxy; spy on registration call |
| 10 | `useScrollProgress` returns 0..1 | Vitest unit test with mocked Lenis state |
| 11 | Lenis 1.3.x pinned in package.json | `pnpm list lenis` outputs `1.3.x` |
| 12 | `lenis/dist/lenis.css` imported | Playwright checks `<html>` for `lenis-scrolling` class after wheel event |
| 13 | Overscroll-bounce preserved on macOS | Playwright on macOS runner: scroll past top; observe page resilience |
| 14 | OS-level reduced-motion toggle mid-session destroys Lenis | Playwright `--emulate-media=reduced-motion` flipped mid-test; observe Lenis destroyed |
| 15 | Dev-mode `?debug=scroll` overlay renders | Playwright navigates with query param; observe debug panel |

## §5 — Validator / test code (`apps/web/tests/web/scroll.spec.ts` shape)

```ts
import { test, expect } from "@playwright/test";

test("Lenis singleton instantiates on home route", async ({ page }) => {
  await page.goto("/");
  const has = await page.evaluate(() => !!(window as any).__lenis);
  expect(has).toBe(true);
});

test("reduced-motion prevents Lenis instantiation", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const has = await page.evaluate(() => !!(window as any).__lenis);
  expect(has).toBe(false);
});

test("keyboard PageDown scrolls the page", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(200);
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(0);
});

test("wheel velocity not clamped", async ({ page }) => {
  await page.goto("/");
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(100);
  const v = await page.evaluate(() => (window as any).__lenis?.velocity ?? 0);
  expect(Math.abs(v)).toBeGreaterThan(500);  // smoothed but not clamped
});

test("/lite route bypasses Lenis", async ({ page }) => {
  await page.goto("/lite");
  const has = await page.evaluate(() => !!(window as any).__lenis);
  expect(has).toBe(false);
});

test("anchor link triggers smooth scroll", async ({ page }) => {
  await page.goto("/");
  const before = await page.evaluate(() => window.scrollY);
  await page.click('a[href="#scene-3"]');
  await page.waitForTimeout(800);  // smooth-scroll duration
  const after = await page.evaluate(() => window.scrollY);
  expect(after - before).toBeGreaterThan(500);
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-001 (Next 15 + R3F bootstrap with `<SmoothScrollProvider/>` mount point) — `app/layout.tsx` scaffold.
- FR-A11Y-001 (reduced-motion fallback + `/lite` route) — defines the bypass condition.

**Operational dependencies:**
- Node 20+, pnpm 9+ for build.
- `lenis@~1.3.0`, `gsap@^3.12.5` in apps/web package.
- Playwright in CI for AC#1-9, AC#12-15.
- A11Y testing tooling for AC#2 (reducedMotion emulation).

**Downstream blocks:**
- FR-WEB-003 (UseCanvas tunneling + scroll-rig) — reads `useScrollProgress()`.
- FR-WEB-004 (Zustand stores) — `scroll` slice mirrors Lenis progress.
- FR-SCENE-020 (scene-progress coordinator) — orchestrates all 7 scenes off Lenis singleton.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Lenis instantiated at module-eval time (server crash with `window is not defined`) | AC#5 SSR build | Move Lenis import + `new Lenis()` strictly into `useEffect`; ensure parent component is `"use client"` |
| Singleton re-instantiated on layout re-mount (silent ScrollTrigger break) | Smoke test: scroll progress jumps to 0 randomly | Use ref + setLenis pattern; do NOT depend on rendering for Lenis lifetime |
| GSAP `lagSmoothing` left on (double-smoothing artifacts) | Visual smoke during long scroll | Call `gsap.ticker.lagSmoothing(0)` in bridge function |
| `scrollerProxy` registered twice (e.g. dev HMR) | Erratic ScrollTrigger progress; AC#9 | Bridge function MUST be idempotent; deregister on cleanup |
| Reduced-motion media query not re-checked mid-session | AC#14 fails | Add `matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', ...)` and rebuild Lenis state |
| `wheelMultiplier > 1` accidentally introduced (developer "tweaks for feel") | AC#4 fails | Code-review for `wheelMultiplier`; enforce ESLint rule banning non-1.0 values |
| Overscroll-bounce killed (CSS overscroll-behavior set globally) | AC#13 + a11y review | Remove `overscroll-behavior` CSS overrides |
| Anchor links route to native scroll (smooth-scroll missed) | AC#6 fails | Intercept anchor clicks at the provider level; call `lenis.scrollTo` |
| `/lite` route accidentally wrapped in Lenis | AC#7 fails | Add `pathname?.startsWith('/lite')` early-return in provider effect |
| Bundle size bloat (Lenis 1.4+ added Locomotive compat) | CI bundle-size budget | Pin to `lenis@~1.3.0`; ban 1.4+ in package.json |
| Mobile touch scroll feels "off" (smoothTouch enabled) | Mobile manual review | Set `smoothTouch: false` in Lenis options; native mobile touch is the gold standard |
| Type errors in singleton (Lenis types change between minor versions) | `pnpm typecheck` | Pin Lenis to `~1.3.0`; type the singleton with `Lenis | null` not the specific 1.3 shape |
| Debug overlay shipping to production | Bundle inspection | Gate `?debug=scroll` rendering with `process.env.NODE_ENV !== 'production'` |

## §8 — Deliverable preview

After shipping, opening `http://localhost:3000/` in dev mode:
1. Scrolling with a trackpad produces smooth, momentum-style scroll.
2. Pressing PageDown jumps smoothly by viewport height.
3. Clicking an anchor link smoothly scrolls to the target over ~ 1.2s.
4. Opening with `?debug=scroll` shows a corner panel reading `scroll: 1234 | velocity: 250 | progress: 0.34`.
5. Toggling macOS "Reduce motion" mid-session destroys Lenis; subsequent scrolls are instant native scroll.
6. Navigating to `/lite` exits Lenis; the `/lite` page scrolls natively.

## §9 — Notes

**On framework choice:** Lenis is opinionated about being the "smoothing layer", not a "scroll library". It deliberately doesn't manage scroll *position* — it just lerps between current and target. This is the right separation: ScrollTrigger handles "what to animate at scroll position X", R3F scroll-rig handles "what to render at scroll progress Y", and Lenis just makes the transition between scroll positions feel smooth.

**On dev HMR:** Hot module reload in Next.js dev mode can re-fire the provider effect, leaving the old Lenis dangling. The cleanup function must call `lenis.destroy()` to avoid memory leaks. The bridge cleanup must deregister the GSAP ticker callback.

**On Safari iOS specifics:** Safari iOS's momentum scroll is excellent native — `smoothTouch: false` is the right default. Forcing Lenis on iOS introduces a perceptible delay between finger lift and momentum end.

*End of FR-WEB-002.*
