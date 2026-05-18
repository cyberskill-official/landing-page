---
id: FR-WEB-004
title: "Zustand state — sceneStore + lumiStore + scrollStore; typed selectors; banned-in-useFrame"
module: WEB
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 1
owner: Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
strict_audited: 2026-05-18
related_frs: [FR-WEB-001, FR-WEB-002, FR-WEB-003, FR-CTA-001, FR-PERF-006]
depends_on: [FR-WEB-001, FR-WEB-002]
blocks: [FR-CTA-001, FR-PERF-006, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.1 web stack — "State — Zustand built by R3F authors; no Provider; ~1 KB minified"
  - docs/01-master-plan-v2.md §6.2 render loop discipline — "No React state in useFrame; use ref.current; flush to store only on discrete events"
  - docs/01-master-plan-v2.md §5.1 — "Valtio only for shader-uniform proxy-mutated subtrees; default to Zustand"

language: typescript + react 19 + zustand 5
service: apps/web/
new_files:
  - apps/web/lib/stores/sceneStore.ts
  - apps/web/lib/stores/lumiStore.ts
  - apps/web/lib/stores/scrollStore.ts
  - apps/web/lib/stores/index.ts            # barrel re-export with typed selectors
  - apps/web/lib/stores/__tests__/stores.test.ts
  - apps/web/.eslintrc.stores.js            # custom rule banning useFrame + zustand setter
  - apps/web/tests/web/stores.spec.ts       # Playwright integration with scene navigation

effort_hours: 4
risk_if_skipped: "Without disciplined Zustand stores, scenes share state via React context (re-renders entire subtree per scroll tick, blowing perf budget) or via global mutable objects (race conditions, untestable). The `no React state in useFrame` rule from master plan §6.2 is the single most-violated R3F anti-pattern — silently allowing setState calls in useFrame drops mid-tier mobile from 60fps to 15fps as React's reconciler rebuilds tree per frame. Downstream CTA-001 (audience-roll state) and SCENE-020 (scene coordinator) both depend on these stores."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship **three Zustand stores** (Zustand 5.x, pinned via `pnpm add zustand@^5`):
   - `sceneStore` — `{ activeScene: number, sceneProgress: Record<string, number>, transitioning: boolean }`
   - `lumiStore` — `{ currentAnim: AnimationClipName, position: [x,y,z], lookAt: [x,y,z], nonlaVisible: boolean, focusedCta: CtaTrack | null, emissiveBoost: number }`
   - `scrollStore` — `{ velocity: number, direction: 'up'|'down'|'idle', lastScrollTop: number }` (mirrors Lenis state at non-per-frame cadence)

2. **MUST NOT** use Valtio for any of these three stores. Zustand is the default per master plan §5.1. Valtio is only acceptable for shader-uniform subtrees that genuinely need proxy-mutated state (e.g. a custom GLSL pass with dozens of uniforms updating each frame) — and that would be a separate dedicated FR. No accidental Valtio escape hatches.

3. **MUST NOT mutate Zustand state inside `useFrame`.** This is the master plan §6.2 hard rule. Inside useFrame, mutate `ref.current.position`, `ref.current.rotation`, etc. — direct Object3D mutation, NOT going through React. Flush to Zustand store ONLY on discrete events:
   - Scene boundary crossing (e.g. `setActiveScene(3)` when intersection observer fires the transition).
   - User CTA hover/click (`setFocusedCta('buy')`).
   - Animation clip completion (`setCurrentAnim('idle')` when `nonla_appear` finishes).
   - Reduced-motion toggle (`setNonlaVisible(true)` to skip animation).

4. **MUST** be SSR-safe. Zustand 5 creates stores at module-eval time. The store creation functions MUST NOT touch `window`, `document`, or `navigator`. Any browser-only initialization (e.g. reading localStorage for persisted state) happens in a `useEffect` inside a hydration component, not at store creation.

5. **MUST** export typed selectors at the barrel level (`apps/web/lib/stores/index.ts`):

   ```ts
   export const useActiveScene = () => useSceneStore(s => s.activeScene);
   export const useLumiPosition = () => useLumiStore(s => s.position);
   export const useScrollVelocity = () => useScrollStore(s => s.velocity);
   // ... one selector per leaf field
   ```

   This enables React tree-shaking: components that need only `activeScene` re-render only when `activeScene` changes, not when other `sceneStore` fields change. Reduces unnecessary renders by 5-10×.

6. **MUST** ship the custom ESLint rule `apps/web/.eslintrc.stores.js` that bans:
   - `useFrame(...)` callback bodies containing any `useStore.setState(...)` or destructured `set` from a Zustand store.
   - Direct `useSceneStore.setState(...)` (or any other store's `.setState`) outside of approved discrete-event handlers (event listeners, intersection-observer callbacks, animation onFinished handlers).

7. **MUST** keep each store under 100 lines of code. If a store grows past 100 lines, split it. Smaller stores are cheaper to subscribe to (selectors run once per .setState; large stores hit selectors more often).

8. **MUST** type every action with explicit return-type annotations (avoid `(s) => ({...s, foo: bar})` inference; prefer explicit `(s): SceneState => ({...})`). This catches accidental shape drift between actions.

9. **MUST** include shallow-equality `subscribeWithSelector` middleware on each store for selectors returning objects/arrays (e.g. `useLumiPosition()` returns `[x,y,z]`). Without shallow-equality, the array reference changes per selector call and triggers re-renders even when values are unchanged.

10. **MUST** include `devtools` middleware in development builds (gated by `process.env.NODE_ENV !== 'production'`). Redux DevTools integration helps debug state flow without leaking into the production bundle.

11. **MUST NOT** include `persist` middleware on any store. Persistence is out of scope — landing-page state is session-only. If a future FR adds persistence (e.g. "remember which scene the user last viewed"), it's an additive amendment.

12. **MUST** include Vitest unit tests for each store covering: initial state, each action's effect, selector typing (TypeScript-level test), shallow-equality behavior (action that returns same array contents doesn't trigger re-render).

13. **MUST** include Playwright integration tests verifying: scene navigation updates `activeScene`, CTA hover updates `focusedCta`, animation completion updates `currentAnim`, scroll velocity updates `scrollStore` at discrete-event cadence (not per-frame).

14. **MUST NOT** export the raw `useSceneStore` hook to scene components. Scenes import via the typed selectors barrel; direct hook access bypasses tree-shaking. Allowed exception: dev-mode debug overlays.

15. **MUST** keep total bundle size impact ≤ 8 KB minified (Zustand 5 is ~ 2 KB; three stores + selectors + middleware adds ~ 6 KB). FR-PERF-001 bundle gate catches regressions.

16. **SHOULD** include a dev-mode `?debug=stores` query-param overlay showing each store's current state. Disabled in production builds.

## §2 — Why this design

**Why three stores instead of one?** A monolithic store causes every component to re-render whenever any field changes (without selectors). With three logical stores partitioned by concern (scenes / Lumi / scroll), the wider tree's selector graph is naturally sparser — Scene 3's section component doesn't subscribe to `lumiStore` and never re-renders when Lumi's position changes mid-animation. Three is also the natural cardinality from the master plan §5.1: scenes (cinematic state), Lumi (character state), scroll (input layer state).

**Why Zustand 5 specifically (not Jotai, not Redux Toolkit)?** Zustand 5 added explicit `subscribeWithSelector` middleware and improved TypeScript inference over 4.x. It's the dominant choice in the R3F ecosystem (Pmndrs maintains both R3F and Zustand). Jotai's atom-based model fragments state across dozens of atoms — fine for some apps, but R3F scenes naturally cluster state by concern (sceneStore, lumiStore), which Zustand expresses cleanly. Redux Toolkit is heavier and brings ceremony (actions, reducers, slices) that's unwarranted for a single-page marketing site.

**Why ban Zustand-setter in useFrame?** useFrame fires up to 60 times per second. Each `setState` call in Zustand schedules a React render (even when batched, React still reconciles the affected subtree). Repeating that 60 times per second on a 7-scene page causes the reconciler to run hot, dropping fps. Master plan §6.2 calls this the most-violated R3F anti-pattern — and it's silent: dev mode shows 60fps until you profile. The discipline is: mutate `Object3D` refs directly inside useFrame (which is what Three.js wants anyway — direct mutation propagates to the renderer without React's involvement); flush to Zustand only on discrete state transitions (scene boundaries, user input).

**Why typed selectors at the barrel?** Without selectors, a component using `useLumiStore()` receives the entire store object and re-renders on any field change. With selectors (`useLumiPosition()`), the component subscribes only to `position` — when `nonlaVisible` flips, the position-consuming component doesn't re-render. Empirically, selector discipline halves the render count in scenes with multiple state-consuming components.

**Why `subscribeWithSelector` + shallow equality?** Without it, a selector like `s => [s.x, s.y, s.z]` returns a new array reference on every selector call, triggering a re-render even when the underlying scalars are unchanged. Shallow equality compares array elements and treats `[1,2,3] === [1,2,3]` as no-change. This is the standard Zustand pattern; omitting it silently doubles re-renders for vector-returning selectors.

**Why ban `persist` middleware?** Persistence adds complexity (versioning, migrations, hydration timing) without business value for a marketing landing page. The user's last-viewed-scene doesn't need to survive a refresh — they'll scroll naturally. If a future FR adds user-account-bound persistence, that's a separate consideration with its own auth + storage choices.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/lib/stores/
├── sceneStore.ts                    # NEW — scene state
├── lumiStore.ts                     # NEW — Lumi character state
├── scrollStore.ts                   # NEW — scroll input state (mirrors Lenis)
├── index.ts                         # NEW — barrel + typed selectors
└── __tests__/
    └── stores.test.ts               # NEW — Vitest unit tests

apps/web/.eslintrc.stores.js         # NEW — custom rule no-setstate-in-useFrame
apps/web/tests/web/stores.spec.ts    # NEW — Playwright integration

package.json:
  dependencies:
    "zustand": "^5.0.0"
```

### §3.2 — `sceneStore.ts` shape

```ts
import { create } from "zustand";
import { subscribeWithSelector, devtools } from "zustand/middleware";

export type SceneState = {
  activeScene: number;           // 0..6 + 7 (footer)
  sceneProgress: Record<string, number>;  // per-scene 0..1
  transitioning: boolean;        // true during scroll-driven boundary cross
  setActiveScene: (n: number) => void;
  setSceneProgress: (id: string, p: number) => void;
  setTransitioning: (t: boolean) => void;
};

export const useSceneStore = create<SceneState>()(
  subscribeWithSelector(
    devtools(
      (set): SceneState => ({
        activeScene: 0,
        sceneProgress: {},
        transitioning: false,
        setActiveScene: (n) => set({ activeScene: n }),
        setSceneProgress: (id, p) =>
          set((s) => ({ sceneProgress: { ...s.sceneProgress, [id]: p } })),
        setTransitioning: (t) => set({ transitioning: t }),
      }),
      { name: "scene-store", enabled: process.env.NODE_ENV !== "production" }
    )
  )
);
```

### §3.3 — `lumiStore.ts` shape

```ts
export type AnimationClipName =
  | "idle" | "fly_in" | "point" | "summon" | "wave"
  | "coil_idle" | "paint" | "split_to_4" | "wave_goodbye"
  | "nonla_appear" | "nonla_tip";

export type CtaTrack = "buy" | "partner" | "join";

export type LumiState = {
  currentAnim: AnimationClipName;
  position: [number, number, number];
  lookAt: [number, number, number];
  nonlaVisible: boolean;
  focusedCta: CtaTrack | null;
  emissiveBoost: number;          // 0..1 driving "C" emboss pulse
  setCurrentAnim: (a: AnimationClipName) => void;
  setPosition: (p: [number, number, number]) => void;
  setLookAt: (l: [number, number, number]) => void;
  setNonlaVisible: (v: boolean) => void;
  setFocusedCta: (c: CtaTrack | null) => void;
  setEmissiveBoost: (b: number) => void;
};

export const useLumiStore = create<LumiState>()(
  subscribeWithSelector(
    devtools((set) => ({
      currentAnim: "idle",
      position: [0, 0, 0],
      lookAt: [0, 0, -1],
      nonlaVisible: false,
      focusedCta: null,
      emissiveBoost: 0.1,
      setCurrentAnim: (a) => set({ currentAnim: a }),
      setPosition: (p) => set({ position: p }),
      setLookAt: (l) => set({ lookAt: l }),
      setNonlaVisible: (v) => set({ nonlaVisible: v }),
      setFocusedCta: (c) => set({ focusedCta: c }),
      setEmissiveBoost: (b) => set({ emissiveBoost: b }),
    }), { name: "lumi-store", enabled: process.env.NODE_ENV !== "production" })
  )
);
```

### §3.4 — Typed selectors barrel (`index.ts`)

```ts
import { useSceneStore } from "./sceneStore";
import { useLumiStore, type AnimationClipName, type CtaTrack } from "./lumiStore";
import { useScrollStore } from "./scrollStore";
import { shallow } from "zustand/shallow";

// Scene selectors
export const useActiveScene = () => useSceneStore((s) => s.activeScene);
export const useSceneProgress = (id: string) =>
  useSceneStore((s) => s.sceneProgress[id] ?? 0);
export const useTransitioning = () => useSceneStore((s) => s.transitioning);

// Lumi selectors
export const useLumiPosition = () => useLumiStore((s) => s.position, shallow);
export const useLumiLookAt = () => useLumiStore((s) => s.lookAt, shallow);
export const useLumiAnim = () => useLumiStore((s) => s.currentAnim);
export const useNonlaVisible = () => useLumiStore((s) => s.nonlaVisible);
export const useFocusedCta = () => useLumiStore((s) => s.focusedCta);
export const useEmissiveBoost = () => useLumiStore((s) => s.emissiveBoost);

// Scroll selectors
export const useScrollVelocity = () => useScrollStore((s) => s.velocity);
export const useScrollDirection = () => useScrollStore((s) => s.direction);

// Action accessors (escape hatch; use sparingly)
export const setActiveScene = (n: number) => useSceneStore.getState().setActiveScene(n);
export const setFocusedCta = (c: CtaTrack | null) => useLumiStore.getState().setFocusedCta(c);
// ... etc.

export type { AnimationClipName, CtaTrack };
```

### §3.5 — `.eslintrc.stores.js` custom rule

```js
module.exports = {
  rules: {
    "no-setstate-in-useframe": {
      meta: { type: "problem", docs: { description: "Ban setState inside useFrame callbacks" } },
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.name === "useFrame") {
              const cb = node.arguments[0];
              if (cb && cb.body) {
                // Walk callback body for .setState or set( calls on Zustand stores
                // Implementation: traverse AST; flag if a Zustand store's set/setState is invoked
              }
            }
          },
        };
      },
    },
  },
};
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Three stores present and typed | `sceneStore.ts`, `lumiStore.ts`, `scrollStore.ts` exist; `tsc --noEmit` passes |
| 2 | No `useFrame` body contains store setter | ESLint custom rule `no-setstate-in-useframe` passes; grep for `useFrame.*set` returns 0 outside ref.current mutations |
| 3 | SSR build clean | `pnpm -F web build` succeeds with no `ReferenceError: window is not defined` |
| 4 | Typed selectors compile | Vitest: import `useActiveScene` and assert type is `() => number` |
| 5 | No Valtio in dependencies | `pnpm list valtio` returns nothing in apps/web tree |
| 6 | Shallow equality on vector selectors | Vitest: `useLumiPosition()` returning same `[x,y,z]` array contents does NOT trigger re-render |
| 7 | Each store ≤ 100 lines | `wc -l apps/web/lib/stores/*.ts`; each file under 100 |
| 8 | `devtools` middleware gated on `NODE_ENV !== 'production'` | Production bundle inspection: `redux-devtools` connector NOT present |
| 9 | No `persist` middleware on any store | `grep -r 'persist' apps/web/lib/stores/` returns 0 |
| 10 | Total bundle impact ≤ 8 KB minified | FR-PERF-001 bundle-size check: `apps/web/.next/server/chunks/*stores*` under 8 KB |
| 11 | Vitest unit tests pass (initial state, actions, shallow-eq) | `pnpm -F web test` covers each store; expected 100% statement coverage on store logic |
| 12 | Playwright integration: scene-navigation updates `activeScene` | Scroll through scenes; `useSceneStore.getState().activeScene` matches |
| 13 | Playwright integration: CTA hover updates `focusedCta` | Hover CTA buttons; `useLumiStore.getState().focusedCta` matches |
| 14 | Selectors barrel is the canonical import path | Grep shows scene/CTA components import from `@/lib/stores` (barrel), NOT from individual store files |
| 15 | `?debug=stores` overlay renders in dev | Playwright with debug param; observe overlay panel |

## §5 — Test code shapes

### §5.1 — `tests/__tests__/stores.test.ts` (Vitest)

```ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSceneStore } from "../sceneStore";
import { useLumiStore } from "../lumiStore";
import { useLumiPosition } from "../index";

describe("sceneStore", () => {
  it("starts at scene 0", () => {
    const { result } = renderHook(() => useSceneStore());
    expect(result.current.activeScene).toBe(0);
  });

  it("setActiveScene updates", () => {
    const { result } = renderHook(() => useSceneStore());
    act(() => { result.current.setActiveScene(3); });
    expect(result.current.activeScene).toBe(3);
  });

  it("setSceneProgress merges per-scene progress", () => {
    const { result } = renderHook(() => useSceneStore());
    act(() => { result.current.setSceneProgress("scene-0", 0.5); });
    act(() => { result.current.setSceneProgress("scene-1", 0.2); });
    expect(result.current.sceneProgress).toEqual({ "scene-0": 0.5, "scene-1": 0.2 });
  });
});

describe("lumiStore — shallow equality", () => {
  it("re-renders only when position values change", () => {
    let renderCount = 0;
    const { result, rerender } = renderHook(() => { renderCount++; return useLumiPosition(); });
    const initial = renderCount;
    act(() => { useLumiStore.setState({ position: [0, 0, 0] }); });  // same values
    rerender();
    expect(renderCount).toBe(initial);  // no re-render
    act(() => { useLumiStore.setState({ position: [1, 0, 0] }); });  // different
    rerender();
    expect(renderCount).toBeGreaterThan(initial);
  });
});
```

### §5.2 — `tests/web/stores.spec.ts` (Playwright)

```ts
import { test, expect } from "@playwright/test";

test("scrolling through scenes updates activeScene", async ({ page }) => {
  await page.goto("/");
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(500);
  }
  const scene = await page.evaluate(() => {
    return (window as any).__stores?.scene?.activeScene ?? 0;
  });
  expect(scene).toBeGreaterThan(0);
});

test("CTA hover updates focusedCta", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-cta-track="buy"]').hover();
  await page.waitForTimeout(200);
  const focused = await page.evaluate(() => {
    return (window as any).__stores?.lumi?.focusedCta;
  });
  expect(focused).toBe("buy");
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-001 (Next 15 + R3F bootstrap) — provides app shell where stores import.
- FR-WEB-002 (Lenis singleton) — `scrollStore` mirrors Lenis state on discrete-event cadence.

**Operational dependencies:**
- `zustand@^5.0.0`.
- Vitest + React Testing Library for unit tests.
- Playwright for integration tests.
- Custom ESLint plugin or rule definition.

**Downstream blocks:**
- FR-CTA-001 (three-track CTA hub) — uses `setFocusedCta` on hover.
- FR-PERF-006 (render-loop perf gate) — verifies no setState-in-useFrame regression.
- FR-SCENE-020 (scene coordinator) — orchestrates `setActiveScene` + `setTransitioning` based on scroll.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| `setState` inside `useFrame` (the master plan §6.2 anti-pattern) | AC#2 ESLint + perf profile | Move mutation to `ref.current`; flush to store only on discrete events |
| Selectors return new array/object every call (shallow-eq missing) | AC#6 Vitest | Add `shallow` as second arg to selector hooks returning composites |
| Bundle bloat from `devtools` shipping to production | AC#8 + bundle inspection | Wrap `devtools(...)` in NODE_ENV check; tree-shake out |
| `persist` middleware sneaking in (developer "just in case") | AC#9 grep | Delete persist middleware; persistence is out of scope for slice 1 |
| Components importing raw store hook (bypasses selectors) | AC#14 grep | Refactor imports to barrel; ban raw hook import via ESLint |
| SSR build fails due to `window` access at store creation | AC#3 + CI build log | Move browser-only init into `useEffect` inside a hydration component |
| Valtio sneaks in via subpackage dependency | AC#5 + `pnpm list` | Remove; document why Zustand is the project default in CLAUDE.md |
| Store file grows past 100 lines (god-store anti-pattern) | AC#7 wc -l | Split by concern; smaller stores are cheaper to subscribe |
| TypeScript inference breaks on action returns | tsc --noEmit | Add explicit return-type annotations on action functions |
| Devtools name collision in Redux DevTools panel | Manual check | Set unique `name` field per store in `devtools` config |
| `subscribeWithSelector` middleware order wrong (devtools before subscribeWithSelector breaks selector subscription) | AC#11 Vitest | Order: `subscribeWithSelector(devtools(creator))` — outer-to-inner. |
| `scrollStore.velocity` updated at per-frame cadence accidentally | AC#2 + perf | Throttle scroll-update to discrete events (50ms debounce); never per-frame |

## §8 — Deliverable preview

After shipping, scene components use stores cleanly:

```tsx
"use client";
import { useActiveScene, useLumiAnim, setFocusedCta } from "@/lib/stores";

export default function CtaHubSection() {
  const activeScene = useActiveScene();
  return (
    <section>
      <button
        data-cta-track="buy"
        onMouseEnter={() => setFocusedCta("buy")}
        onMouseLeave={() => setFocusedCta(null)}
      >
        Buy
      </button>
    </section>
  );
}
```

R3F components inside `<SceneTunnel>` (FR-WEB-003) consume Lumi state similarly but mutate `ref.current` directly inside `useFrame`:

```tsx
function LumiMesh({ glb }) {
  const ref = useRef();
  const targetPosition = useLumiPosition();   // store value; updates on discrete events
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.lerp(/* tween toward targetPosition */, 0.1);  // ref mutation, NOT setState
  });
  return <primitive ref={ref} object={glb.scene} />;
}
```

## §9 — Notes

**On future SSR/SSG concerns:** Next.js 15 App Router is SSR by default. Stores must remain SSR-safe even though they're consumed only by client components — Next sometimes pre-renders the initial state. Module-level store creation that touches `window` would crash the build.

**On testing edge:** `subscribeWithSelector` + `shallow` is the standard Zustand pattern for selector hooks returning arrays. The shallow comparison from `zustand/shallow` works element-wise; deeply nested objects need a custom compare function.

**On future amendments:** If a future requirement needs cross-tab state sync (rare for a marketing site), `zustand-broadcast` or similar middleware adds that capability — but this is amendment territory, not slice 1 scope.

---

## §10 — Strict audit evidence (2026-05-18)

Status: `shipped + strict-audited`.

Architectural decision: `docs/ADR-FR-WEB-004.md` makes the typed `@/lib/stores` barrel the runtime contract. Direct raw store imports are reserved for store implementation, tests, and the development-only `StoreHydrator` probe.

Implementation delta:

- Added `setEmissiveBoost()` to the stores barrel.
- Routed `BuyForm`, `PartnerForm`, `SceneCaption`, and `CapabilityGate` through barrel selectors/actions.
- Pinned `zustand` as `^5` in app package metadata and lockfile while preserving installed `5.0.13`.
- Added an import-boundary guardrail test for runtime components.

Edge-case matrix coverage:

| Vector | Evidence |
|---|---|
| Null inputs | Store initial-state tests reset and verify safe defaults for scene, Lumi, and scroll state. |
| Malformed payload | Progress and emissive boost are clamped; scroll direction handles idle/same-position snapshots. |
| Extreme bounds | Playwright verifies scene navigation, CTA hover, low-memory capability, and scroll velocity snapshots under browser input. |
| Invalid content | Guardrails fail on Valtio, persist middleware, useFrame store writes, and raw store imports outside the allowed dev bridge. |
| Concurrent race | `subscribeWithSelector` shallow equality suppresses equal vector updates; StoreHydrator subscriptions unsubscribe on cleanup. |
| Observability | Dev-only `window.__stores` and `?debug=stores` expose scene, Lumi, audio, and scroll state. |

Validation log:

```text
$ cd apps/web && node_modules/.bin/vitest run lib/stores/__tests__/stores.test.ts tests/stores-guardrails.test.ts --config vitest.config.ts
Test Files  2 passed (2)
Tests       9 passed (9)
```

```text
$ cd apps/web && node_modules/.bin/tsc -p tsconfig.json --noEmit
passed
```

```text
$ cd apps/web && node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('node_modules/zustand/package.json','utf8')); console.log(pkg.name+' '+pkg.version);"
zustand 5.0.13
```

```text
$ cd apps/web && rg -n "from ['\"]@/lib/stores/(sceneStore|lumiStore|scrollStore)['\"]" components lib --glob '!components/state/StoreHydrator.client.tsx' --glob '!lib/stores/**'
no matches
```

```text
$ cd apps/web && node_modules/.bin/vitest run components/cta/forms/__tests__/buy-form.spec.ts components/cta/forms/__tests__/PartnerForm.unit.test.tsx components/a11y/__tests__/SceneCaption.unit.test.tsx components/perf/__tests__/SaveDataBanner.unit.test.tsx tests/unit/skip-3d-toggle.test.ts --config vitest.config.ts
Test Files  5 passed (5)
Tests       16 passed (16)
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/web/stores.spec.ts --project=chromium
Running 4 tests using 1 worker
  ✓ scene navigation updates activeScene
  ✓ CTA hover updates focusedCta
  ✓ scrollStore receives throttled Lenis snapshots
  ✓ debug stores overlay renders in development
4 passed (4.5s)
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/cta/buy-form.spec.ts tests/cta/partner-form.spec.ts tests/web/capability-gate.spec.ts --project=chromium
Running 13 tests using 3 workers
13 passed (11.0s)
```

*End of FR-WEB-004.*
