---
id: FR-WEB-006
title: "Suspense boundary per scene + Drei useGLTF.preload chaining — soft golden fallback"
module: WEB
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 1
owner: R3F Architect
created: 2026-05-16
shipped: 2026-05-17
strict_audited: 2026-05-18
mocked_dependency: "/lumi.glb is currently seeded from assets-built/optimized/lumi-greybox.glb until the final Lumi production GLB replaces it."
related_frs: [FR-WEB-001, FR-WEB-003, FR-WEB-005, FR-DS-008, FR-PERF-004]
depends_on: [FR-WEB-003, FR-WEB-005]
blocks: [FR-PERF-004, FR-SCENE-013]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.3 loading strategy — "Suspense boundaries one per scene; preload chaining N→N+1"
  - docs/01-master-plan-v2.md §5.3 — "Lumi GLB preloaded at module-eval; LCP-after-canvas-mount priority"
  - docs/01-master-plan-v2.md §3.4 motion register — "soft golden pulse for loading; NEVER spinner"
  - docs/01-master-plan-v2.md §5.2 — "Persistent canvas NEVER suspends"

language: typescript + react 19 + @react-three/drei
service: apps/web/
new_files:
  - apps/web/components/canvas/ScenePreloader.tsx
  - apps/web/components/canvas/SceneSuspenseFallback.tsx
  - apps/web/lib/scene-preload-chain.ts
  - apps/web/tests/web/suspense.spec.ts
  - apps/web/tests/unit/scene-preload-chain.test.ts

effort_hours: 4
risk_if_skipped: "Without per-scene Suspense, a single GLB fetch stall blocks the entire canvas tree — Lumi disappears mid-scroll. Without preload chaining, users hit a network wait at every scene boundary. Spinner-style fallback breaks the cinematic register (master plan §3.4: golden-pulse only). FR-PERF-004 LCP gate fails without preload chaining."
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

1. **MUST** wrap each scene's R3F content (inside its `<SceneTunnel>` per FR-WEB-003) in a `<Suspense fallback={<SceneSuspenseFallback />}>` boundary. Total: 8 boundaries (7 scenes + footer). This isolates per-scene GLB streaming — a stall in Scene 4's asset doesn't block Scene 3 or Scene 5's renders.

2. **MUST** preload the Lumi GLB at module-evaluation time. Current implementation calls `preloadGltfWithLocalDecoders('/lumi.glb')` from the dynamically loaded `CanvasMount.tsx`, and `/lumi.glb` is seeded from the optimized Lumi greybox until the final production GLB replaces it. Lumi is the LCP-after-canvas-mount priority asset — fetching it lazily delays first paint of the hero scene by 200-800ms depending on network.

3. **MUST** implement **preload chaining** (master plan §5.3): while the user reads Scene N, prefetch Scene N+1's scene-specific GLB. Implementation:
   - Intersection-observer with `rootMargin: '200% 0px'` on each scene's tracked DOM element.
   - When intersection fires, call `useGLTF.preload(SCENE_GLBS[currentSceneIndex + 1])`.
   - Skip if next scene is already preloaded (idempotent).

4. **MUST** render the Suspense fallback as a **soft golden pulse** — NEVER a spinner. Master plan §3.4: spinners belong in transactional UIs (forms, dashboards); the cinematic register uses motion-of-light, not motion-of-spinning. Implementation uses `--glow-genie-soft` token (FR-DS-008) with a 1.5s ease-in-out keyframe animation.

5. **MUST NOT** suspend the global canvas itself. The `<GlobalCanvas>` (FR-WEB-001) renders synchronously the moment hydration completes. Suspense boundaries live INSIDE the canvas tree at each scene's tunneled subtree — the canvas's own rendering tree is sync.

6. **MUST** preload chain in BOTH scroll directions. If user scrolls back up to Scene 2 from Scene 4, the chain MUST consider scrolling-up direction too and preload Scene 1's GLB. The `scrollStore.direction` from FR-WEB-004 informs the prefetch direction.

7. **MUST NOT** preload more than ONE scene ahead. Preloading all 7 scenes upfront defeats the per-scene Suspense purpose and bloats network bandwidth on slow connections. The discipline: preload N+1 (and N-1 on scroll-up), nothing further.

8. **MUST** ship `ScenePreloader.tsx` as the component that manages the preload chain. It mounts once at the layout level, subscribes to `useActiveScene()` from FR-WEB-004, and triggers preloads as the active scene changes.

9. **MUST** ship `scene-preload-chain.ts` with a typed mapping `SCENE_GLBS: Record<number, string>` listing each scene's GLB path. Sources from the master plan §3.5 asset table.

10. **MUST** include a typed prefetch budget — `MAX_PRELOAD_AHEAD: 1`. Constant defined in `scene-preload-chain.ts`. Linter rule forbids modifying without an amendment FR.

11. **MUST NOT** trigger preload from a `useFrame` callback (per FR-WEB-004 §1 #3 banned pattern). Preload triggers from intersection-observer callbacks or `useEffect` reacting to `useActiveScene()` changes.

12. **MUST** handle preload failures gracefully. If `useGLTF.preload` rejects (network error, 404), log the error, fall back to lazy-load when the scene actually enters the viewport, and emit a Sentry breadcrumb (post-FR-OPS-NNN if Sentry is wired). Don't crash the render.

13. **MUST** include the fallback's `aria-live` region with `"Loading scene..."` text for screen readers. Visual fallback is just the gold pulse; SR users get the textual cue.

14. **MUST** ship Vitest unit tests for `scene-preload-chain.ts` covering: next-scene resolution, scroll-up resolution, idempotency (same scene preload doesn't re-fetch), bounds (Scene 6 has no Scene 7; preload chain returns null), `MAX_PRELOAD_AHEAD = 1` enforcement.

15. **MUST** ship Playwright integration tests verifying: 8 Suspense boundaries in component tree, Lumi GLB preloaded at module-eval (one request before first scene mount), next-scene preload fires at 200% rootMargin, fallback renders as gold pulse not spinner, persistent canvas never suspends.

16. **SHOULD** include a dev-mode `?debug=suspense` overlay showing each scene's load state: `scene-0 | preloaded | loaded | rendered`.

## §2 — Why this design

**Why one Suspense per scene instead of one wrapping the whole canvas?** A whole-canvas Suspense means any scene's GLB fetch blocks the entire 3D experience — including Lumi (the persistent character that must be alive across all scenes). One Suspense per scene isolates the stalls: Scene 4 buffering doesn't make Lumi disappear from Scene 3. The persistent-canvas pattern (master plan §5.2) demands the canvas itself never suspends.

**Why preload chaining at 200% rootMargin?** The 200% margin means the chain triggers when the user is one viewport away from the next scene — typically 1-2 seconds of scrolling. Network round-trip + decode time for a typical scene GLB (~ 500 KB - 1 MB) is ~ 1-3 seconds on 4G mobile. The chain fires early enough that by the time the user reaches the next scene, the GLB is decoded and ready. Master plan §5.3 specifies 200% as the calibrated value.

**Why limit `MAX_PRELOAD_AHEAD: 1`?** Aggressive preloading (e.g. N+2, N+3) bloats network usage on slow connections. Users on data-capped plans (common in Vietnam mobile markets) shouldn't pay for assets they may never reach. Predictively fetching one scene ahead covers the common-case latency window without over-fetching.

**Why no spinner in the fallback?** Spinners encode "blocking, transactional, please wait". The cinematic register encodes "alive, anticipating, illuminating". Master plan §3.4 explicitly bans spinners. The gold-pulse fallback feels coherent with Lumi's emissive — when a scene is loading, the user sees a "Lumi's getting ready over there" feel rather than a "server is thinking" feel.

**Why preload-chain bidirectional?** Users scroll back up — to re-read a section, to verify a CTA, to return to the hero. If preload chain is unidirectional, scrolling up triggers a cold-fetch every time, breaking the cinematic flow. Bidirectional chain uses minimal additional logic (track scroll direction via FR-WEB-004's `scrollStore`) for a major UX win.

**Why fail gracefully on preload errors?** Preloads are an optimization, not a correctness requirement. If `/scene-3.glb` 404s during preload, the scene component will lazy-load it via `useGLTF` when the scene mounts — slower but still functional. Crashing on preload failure breaks the whole canvas for a non-critical reason.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/
├── components/canvas/
│   ├── ScenePreloader.tsx                       # NEW — preload-chain orchestrator
│   └── SceneSuspenseFallback.tsx                # NEW — golden-pulse fallback
├── lib/
│   └── scene-preload-chain.ts                   # NEW — SCENE_GLBS + chain logic
└── tests/
    ├── unit/scene-preload-chain.test.ts         # NEW — Vitest unit
    └── web/suspense.spec.ts                     # NEW — Playwright integration
```

### §3.2 — `scene-preload-chain.ts` shape

```ts
import { useGLTF } from "@react-three/drei";

export const SCENE_GLBS: Record<number, string | null> = {
  0: "/scene-0.glb",
  1: "/scene-1.glb",
  2: "/scene-2.glb",
  3: "/scene-3.glb",
  4: "/scene-4.glb",
  5: "/scene-5.glb",
  6: "/scene-6.glb",
  7: null,  // footer has no scene-specific GLB
};

export const MAX_PRELOAD_AHEAD = 1 as const;

const preloaded = new Set<string>();

export function resolvePreloadTargets(currentScene: number, direction: "up" | "down" | "idle"): string[] {
  const targets: string[] = [];
  const step = direction === "up" ? -1 : 1;
  for (let i = 1; i <= MAX_PRELOAD_AHEAD; i++) {
    const idx = currentScene + (step * i);
    const glb = SCENE_GLBS[idx];
    if (glb) targets.push(glb);
  }
  return targets;
}

export function preloadScene(glbPath: string): void {
  if (preloaded.has(glbPath)) return;
  preloaded.add(glbPath);
  try {
    useGLTF.preload(glbPath);
  } catch (e) {
    console.warn(`[preload] failed: ${glbPath}`, e);
    preloaded.delete(glbPath);  // allow retry on next intersection fire
  }
}
```

### §3.3 — `SceneSuspenseFallback.tsx` shape

```tsx
export function SceneSuspenseFallback() {
  return (
    <group>
      <mesh aria-hidden>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#E8B523"  // --brand-gold-400
          transparent
          opacity={0.2}
        />
      </mesh>
      {/* DOM-side aria-live region rendered via portal to document root */}
    </group>
  );
}
```

(The `aria-live="polite"` region is rendered DOM-side via a separate `<SuspenseAriaCue/>` portal — not via Three.js, which can't drive aria semantics.)

### §3.4 — `ScenePreloader.tsx` shape

```tsx
"use client";
import { useEffect } from "react";
import { useActiveScene, useScrollDirection } from "@/lib/stores";
import { resolvePreloadTargets, preloadScene } from "@/lib/scene-preload-chain";

export function ScenePreloader() {
  const activeScene = useActiveScene();
  const direction = useScrollDirection();

  useEffect(() => {
    const targets = resolvePreloadTargets(activeScene, direction);
    targets.forEach(preloadScene);
  }, [activeScene, direction]);

  return null;
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | 8 Suspense boundaries (7 scenes + footer) | Vitest tree-snapshot count == 8 |
| 2 | Lumi preloaded at module-eval | Playwright: `lumi.glb` request fires before first scene mount |
| 3 | Next-scene preload at 200% rootMargin | Playwright with intersection-observer mock; assert preload at correct viewport offset |
| 4 | Fallback uses gold pulse, no spinner | Static analysis: no `<Spinner>` or `<CircularProgress>` import; grep "spinner" returns 0 |
| 5 | Canvas itself doesn't suspend | Component tree: `<Suspense>` boundaries live INSIDE `<GlobalCanvas>`, never wrapping it |
| 6 | Preload chain bidirectional (scroll-up triggers N-1 preload) | Vitest: `resolvePreloadTargets(4, 'up')` returns scene-3 path |
| 7 | `MAX_PRELOAD_AHEAD = 1` enforced | Vitest: `resolvePreloadTargets(2, 'down')` returns single item array |
| 8 | Idempotent preload (same scene doesn't refetch) | Vitest: call `preloadScene` twice; second is no-op |
| 9 | Bounds-safe (Scene 6 has no next; returns empty) | Vitest: `resolvePreloadTargets(6, 'down')` returns [] |
| 10 | Preload failure logs warning, doesn't crash | Vitest with mocked rejected preload; observe `console.warn` but no throw |
| 11 | aria-live "Loading scene..." region present | Playwright accessibility tree inspection |
| 12 | `?debug=suspense` overlay renders | Playwright with query param |
| 13 | Preload not triggered from useFrame | ESLint rule (FR-WEB-004 §1 #6) + grep |
| 14 | Vitest unit tests pass | `pnpm -F web test` covers preload-chain logic |
| 15 | Playwright integration tests pass | `pnpm -F web test:e2e` covers suspense behavior |

## §5 — Test code shapes

### §5.1 — `tests/unit/scene-preload-chain.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { resolvePreloadTargets, preloadScene, MAX_PRELOAD_AHEAD } from "@/lib/scene-preload-chain";

describe("resolvePreloadTargets", () => {
  it("returns next scene on scroll-down", () => {
    expect(resolvePreloadTargets(2, "down")).toEqual(["/scene-3.glb"]);
  });

  it("returns prev scene on scroll-up", () => {
    expect(resolvePreloadTargets(4, "up")).toEqual(["/scene-3.glb"]);
  });

  it("returns empty at bounds", () => {
    expect(resolvePreloadTargets(6, "down")).toEqual([]);
    expect(resolvePreloadTargets(0, "up")).toEqual([]);
  });

  it("respects MAX_PRELOAD_AHEAD", () => {
    const targets = resolvePreloadTargets(2, "down");
    expect(targets.length).toBeLessThanOrEqual(MAX_PRELOAD_AHEAD);
  });
});

describe("preloadScene idempotency", () => {
  it("does not re-fetch same scene", () => {
    const useGLTFMock = vi.fn();
    vi.doMock("@react-three/drei", () => ({ useGLTF: { preload: useGLTFMock } }));
    preloadScene("/scene-1.glb");
    preloadScene("/scene-1.glb");
    expect(useGLTFMock).toHaveBeenCalledTimes(1);
  });
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-003 (SceneTunnel) — provides the per-scene boundary where Suspense lives.
- FR-WEB-005 (dynamic-three) — the Suspense fallback ships in the main bundle, not dynamic.
- FR-WEB-004 (Zustand stores) — `useActiveScene` + `useScrollDirection` drive the preload chain.
- FR-DS-008 (glow recipes) — `--glow-genie-soft` token used by the fallback.

**Operational dependencies:**
- `@react-three/drei` for `useGLTF.preload`.
- Vitest, Playwright.

**Downstream blocks:**
- FR-PERF-004 (LCP gate) — fails without preload chaining.
- FR-SCENE-013 (Scene 4 implementation) — first scene to consume the chain.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Whole-canvas Suspense (one boundary, not 8) | AC#1 + AC#5 | Move `<Suspense>` inside `<SceneTunnel>`, one per scene |
| Spinner used in fallback (cinematic register break) | AC#4 + visual smoke | Replace with `<SceneSuspenseFallback>` golden-pulse |
| Lumi GLB lazy-loaded (LCP slip) | AC#2 + Lighthouse | Add `useGLTF.preload('/lumi.glb')` at module-eval in `lumi/Lumi.tsx` |
| Preload chain misses scroll-up case | AC#6 | Add direction parameter to `resolvePreloadTargets`; FR-WEB-004 provides direction |
| Over-fetch (MAX_PRELOAD_AHEAD > 1) | AC#7 | Cap; constant defined in chain lib |
| Preload failure crashes render | AC#10 | Wrap in try/catch; log warning, don't rethrow |
| Bounds error at Scene 6 → Scene 7 preload | AC#9 | Return empty array; UI handles gracefully |
| Race condition: preload fires before stores hydrate | Playwright SSR | Gate ScenePreloader on `useActiveScene !== undefined` |
| aria-live missing (screen-reader UX gap) | AC#11 + axe-core | Add `<SuspenseAriaCue>` DOM-side; portal to document body |
| Preload chain triggers from useFrame (per-frame thrash) | AC#13 ESLint | Move to useEffect or intersection-observer callback only |
| Network exhausts on 7-scene direct-jump | Throttled-3G manual review | Confirm only N+1 preloaded; scroll-jumping to mid-scene loads only that scene + neighbor |
| Multiple ScenePreloaders mounted (dev HMR) | Smoke: duplicate preload calls | Render `<ScenePreloader>` once at layout level, not per scene |

## §8 — Deliverable preview

After shipping, scrolling through the page produces:

1. Initial render: Lumi GLB loaded; canvas mounts; Scene 0 visible.
2. User scrolls to ~ 50% through Scene 0: intersection-observer fires; Scene 1 GLB preloads.
3. User scrolls into Scene 1: Suspense boundary momentarily shows golden-pulse fallback (~ 50-200ms); GLB resolves; scene renders.
4. User scrolls back to Scene 0: scroll-direction flips to "up"; Scene -1 (none) preloads — i.e. no-op, no network.
5. Network panel: 1 request for `/lumi.glb` + 1 request per scene visited. No bulk-fetching of all 7 scene GLBs.

## §9 — Notes

**On Drei version:** `useGLTF.preload` is from `@react-three/drei`. Pin `drei@^9.x` for API stability.

**On the alternative `<link rel="preload">`:** Could be added in document `<head>` for instant browser-level preload. Trade-off: less control over timing (browser decides), but cheaper than runtime intersection-observer. Slice 1 ships intersection-based; future amendment could add `<link rel="preload">` for first-paint scenes only.

**On Scene 7 (footer):** No scene-specific GLB; Lumi's footer "wave_goodbye" animation lives in the shared `/lumi.glb`. The preload chain returns null for index 7 by design.

---

## §10 — Strict audit evidence (2026-05-18)

Status: `shipped + mocked-dependency + strict-audited`.

Mocked dependency: `/lumi.glb` exists and is currently copied from `assets-built/optimized/lumi-greybox.glb` (78,988 bytes). This keeps preload contracts and route behavior testable while final Lumi production GLB remains dependent on mocked character deliverables.

Implementation delta:

- Added guarded module-evaluation Lumi preload in `CanvasMount.tsx`.
- Added active-scene/direction preload trigger in `ScenePreloader.tsx` while preserving the 200% `IntersectionObserver` path from `useScenePreloadObservers`.
- Added unit guardrails that verify both Lumi preload and active-scene direction resolution are wired.

Edge-case matrix coverage:

| Vector | Evidence |
|---|---|
| Null inputs | Bounds tests return no target for Scene 6 down and Scene 0 up; public `/lumi.glb` exists before runtime preload. |
| Malformed payload | Preload failures warn, mark state as failed, and allow retry without throwing. |
| Extreme bounds | `MAX_PRELOAD_AHEAD` remains `1`; build keeps `/` First Load JS at 110 kB. |
| Invalid content | SSR route contains no spinner-style loading UI; fallback userData remains `gold-pulse`. |
| Concurrent race | Active-scene/direction effect and observer path both flow through idempotent `preloadScene`. |
| Observability | `data-scene-suspense-aria`, `window.__scenePreloadStates`, and `?debug=suspense` expose preload state. |

Validation log:

```text
$ cd apps/web && node_modules/.bin/vitest run tests/unit/scene-preload-chain.test.ts lib/canvas/__tests__/use-preload-next.unit.test.ts lib/canvas/decoder-config.test.ts --config vitest.config.ts
Test Files  3 passed (3)
Tests       13 passed (13)
```

```text
$ cd apps/web && node_modules/.bin/tsc -p tsconfig.json --noEmit
passed
```

```text
$ cd apps/web && node -e "const fs=require('fs'); const size=fs.statSync('public/lumi.glb').size; console.log('public/lumi.glb bytes='+size);"
public/lumi.glb bytes=78988
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/web/suspense.spec.ts --project=chromium
Running 3 tests using 1 worker
  ✓ scene preloader exposes aria cue and preloads one neighbor scene
  ✓ suspense debug overlay renders in development
  ✓ SSR route does not expose spinner-style loading UI
3 passed (4.5s)
```

```text
$ cd apps/web && node_modules/.bin/next build
✓ Compiled successfully in 1370ms
✓ Generating static pages (18/18)
Route (app)                                 Size  First Load JS
┌ ƒ /                                    7.54 kB         110 kB
```

*End of FR-WEB-006.*
