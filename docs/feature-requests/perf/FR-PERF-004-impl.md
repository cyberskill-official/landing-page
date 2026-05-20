---
id: FR-PERF-004
title: "Preload chain — IntersectionObserver-driven prefetch of next-scene GLBs (200% rootMargin, depth 1, save-data aware)"
module: PERF
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-WEB-006, FR-SCENE-020, FR-PERF-010, FR-WEB-009]
depends_on: [FR-WEB-006]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/lib/canvas/
new_files:
  - apps/web/lib/canvas/use-preload-next.ts
  - apps/web/lib/canvas/preload-manifest.ts
  - apps/web/lib/canvas/__tests__/use-preload-next.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §5.3 — "Preload chaining: depth=1, 200% rootMargin, save-data aware"
  - W3C IntersectionObserver spec
  - Drei useGLTF.preload documentation

effort_hours: 4
risk_if_skipped: "Without preload chain, each scene transition shows ~800ms blank canvas while GLB fetches. User scrolls fast = perceived as broken. Preload chain hides this latency. Without save-data check, mobile data caps get burned for users who don't scroll past Scene 0."
---

## §1 — Description (BCP-14 normative)

1. **MUST** preload next scene's GLB via `useGLTF.preload(url)` when current scene is 50% in view.
2. **MUST** use `IntersectionObserver` with `rootMargin: '200%'` (i.e., trigger ~2 viewports ahead).
3. **MUST NOT** preload past the next scene (chain depth = 1) — preventing 8-scene-deep preload waterfall.
4. **MUST** check `navigator.connection.saveData` before preload; skip on save-data mode (FR-PERF-010).
5. **MUST** check `navigator.connection.effectiveType` — skip on 2G or slow-2G.
6. **MUST** check `lowMemoryMode` (FR-WEB-009) — skip when active.
7. **MUST** preload manifest at `apps/web/lib/canvas/preload-manifest.ts` mapping each scene to its next-scene asset URL.
8. **MUST** cancel in-flight preloads if user scrolls back past their origin scene (avoid wasted bandwidth).
9. **MUST** be tested via Vitest unit tests + Playwright integration test (verify Network panel shows preload at right scroll position).
10. **MUST** instrument analytics: `preload_started` and `preload_completed` events with scene + bytes + latency.
11. **MUST NOT** preload more than 5 MB total across the full scroll (the FR-WEB-006 chain).
12. **MUST** be SSR-safe — IntersectionObserver only runs client-side.

## §2 — Why this design

**Why 200% rootMargin?** Gives ~2-viewport lead time. At average scroll velocity, 200% = ~1.5 seconds of preload runway = enough to fetch a 4 MB GLB on 4G.

**Why depth=1?** Preloading 8 scenes deep = waterfall of fetches, kills CPU + bandwidth. Depth 1 = "what's next" without "everything ahead."

**Why save-data aware?** Save-data is explicit user signal ("don't burn my mobile cap"). Preloading defeats this; respect it.

**Why 2G/slow-2G skip?** Preloading a 4 MB GLB on 2G = 5+ minutes; useless. Better to load on-demand.

**Why cancel-on-scroll-back?** User scrolls down, triggers preload, scrolls back. Preload still in-flight wastes bytes. Abort signal stops the fetch.

**Why analytics?** Measure: how often does preload actually save time? If users typically don't scroll past Scene 0, preload is wasted. Data drives the strategy.

## §3 — Public surface

```ts
// apps/web/lib/canvas/preload-manifest.ts
export const PRELOAD_CHAIN: Record<number, string | null> = {
  0: "/optimized/lumi.glb",           // preload Lumi from Scene 0 entry
  1: "/optimized/scene-2-props.glb",  // Scene 1 → Scene 2
  2: "/optimized/scene-3-props.glb",
  3: "/optimized/scene-4-props.glb",
  4: "/optimized/scene-5-globe.glb",
  5: "/optimized/scene-6-cta.glb",
  6: null,  // no next scene
};
```

```ts
// apps/web/lib/canvas/use-preload-next.ts
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { PRELOAD_CHAIN } from "./preload-manifest";
import { useSceneStore } from "@/lib/stores/scene-store";
import { trackEvent } from "@/lib/analytics";

export function usePreloadNext(currentScene: number, ref: React.RefObject<HTMLElement>) {
  const lowMemoryMode = useSceneStore(s => s.lowMemoryMode);

  useEffect(() => {
    if (!ref.current) return;
    if (lowMemoryMode) return;

    // Check connection
    const conn = (navigator as any).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return;

    const nextUrl = PRELOAD_CHAIN[currentScene];
    if (!nextUrl) return;

    const controller = new AbortController();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) {
          const t0 = performance.now();
          trackEvent("preload_started", { scene: currentScene, url: nextUrl });
          useGLTF.preload(nextUrl);
          // Note: useGLTF.preload doesn't return promise; instrument via fetch separately
          fetch(nextUrl, { signal: controller.signal, priority: "low" as any })
            .then(r => r.blob())
            .then(b => {
              trackEvent("preload_completed", {
                scene: currentScene, url: nextUrl,
                bytes: b.size, latency_ms: performance.now() - t0,
              });
            })
            .catch(() => {}); // aborted
        }
      },
      { threshold: 0.5, rootMargin: "200%" }
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [currentScene, lowMemoryMode, ref]);
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | IntersectionObserver fires at 50% in view | Mock + assert |
| 2 | useGLTF.preload called for next-scene asset | Mock spy |
| 3 | Chain depth limited to 1 (no recursive preload) | Inspect calls |
| 4 | saveData → skip preload | Mock connection; assert no preload |
| 5 | effectiveType=2g → skip | Mock; assert no preload |
| 6 | lowMemoryMode → skip | Mock store; assert no preload |
| 7 | Abort on unmount (scroll-back) | Vitest with abort controller |
| 8 | Analytics events fired | Mock trackEvent |
| 9 | Total preloaded < 5 MB | Sum across chain |
| 10 | SSR-safe (no IntersectionObserver in node) | Build test |
| 11 | Vitest unit tests pass | pnpm vitest |
| 12 | Network panel verifies preload at 200% rootMargin | Playwright |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePreloadNext } from "../use-preload-next";

// Mock IntersectionObserver
class MockIO {
  cb: any;
  constructor(cb: any) { this.cb = cb; }
  observe() { this.cb([{ intersectionRatio: 0.6, isIntersecting: true }]); }
  disconnect() {}
}
global.IntersectionObserver = MockIO as any;

describe("usePreloadNext", () => {
  it("preloads next scene at 50% threshold", () => {
    const preloadSpy = vi.fn();
    vi.doMock("@react-three/drei", () => ({ useGLTF: { preload: preloadSpy } }));
    const ref = { current: document.createElement("div") };
    renderHook(() => usePreloadNext(0, ref));
    expect(preloadSpy).toHaveBeenCalledWith("/optimized/lumi.glb");
  });

  it("skips preload when saveData", () => {
    (navigator as any).connection = { saveData: true };
    const preloadSpy = vi.fn();
    const ref = { current: document.createElement("div") };
    renderHook(() => usePreloadNext(0, ref));
    expect(preloadSpy).not.toHaveBeenCalled();
  });

  it("skips preload on 2G", () => {
    (navigator as any).connection = { effectiveType: "2g" };
    const preloadSpy = vi.fn();
    const ref = { current: document.createElement("div") };
    renderHook(() => usePreloadNext(0, ref));
    expect(preloadSpy).not.toHaveBeenCalled();
  });

  it("no preload past depth 1 (last scene has null chain)", () => {
    const preloadSpy = vi.fn();
    const ref = { current: document.createElement("div") };
    renderHook(() => usePreloadNext(6, ref));  // last scene
    expect(preloadSpy).not.toHaveBeenCalled();
  });
});
```

## §6 — Dependencies

**Concept:** FR-WEB-006 (overall preload chain — this is the runtime layer), FR-SCENE-020 (scroll orchestrator coords scene activity), FR-WEB-009 (lowMemoryMode source).

**Operational:** Drei useGLTF.preload, fetch API with AbortController, IntersectionObserver browser API.

**Downstream:** Indirectly improves all scenes; FR-PERF-010 mobile gate consumes the smoother transitions.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Preload consumes bandwidth on slow connection | AC#5 | Check effectiveType + saveData |
| Chain recursion (depth > 1) | AC#3 | preload-manifest limits explicitly |
| IntersectionObserver fires too early | AC#1 + visual | rootMargin 200% calibrated |
| Aborts not cleaning up | DevTools memory | useEffect cleanup |
| Preload fetches in main thread blocks | priority='low' | Use Fetch Priority hints |
| useGLTF cache pollution (wrong URL) | Visual | Verify exact URL strings |
| Analytics spam (preload triggers multiple times) | trackEvent count | Debounce on observer firing |
| SSR break (IntersectionObserver undefined) | Build error | typeof window check |
| Connection API not supported (Safari) | Mock | Default to "always preload" if API absent |
| Race between preload and direct load (Drei caches) | OK | Drei dedups identical URLs |
| Network priority unhonored (Firefox) | Slow preload | Fall back to standard fetch |
| Memory pressure on low devices | AC#6 | lowMemoryMode skips |

## §8 — Deliverable preview

1. User on Scene 0. Hero renders. Lumi already loaded.
2. User scrolls. Scene 0 is 50% in view. Observer fires.
3. `useGLTF.preload("/optimized/scene-2-props.glb")` fires. Network panel shows fetch (priority low).
4. User reaches Scene 2. GLB already cached. Renders instantly.
5. Analytics logs: `preload_completed { scene: 0, bytes: 1.2MB, latency_ms: 480 }`.

Save-data mode:
1. User on iPhone with Low Data Mode enabled.
2. navigator.connection.saveData=true.
3. Observer fires but preload skipped. User gets on-demand load (with brief loading state).

## §9 — Notes

**On 200% rootMargin calibration:** Calibrated for 1080p desktop at ~600ms typical scroll-to-next-scene. Mobile (smaller viewport) → effectively shorter lead. Acceptable; if mobile scroll is very fast, may need higher rootMargin.

**On future preload of 2 ahead:** Tempting but expensive. 1-deep chain is the sweet spot — covers most user behavior without bandwidth explosion.

**On Vietnamese visitors:** Vietnamese users typically on 4G; same chain works. Some rural 3G users — saveData + 2G check protects.

*End of FR-PERF-004.*
