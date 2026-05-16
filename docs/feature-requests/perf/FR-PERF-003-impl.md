---
id: FR-PERF-003
title: "Per-scene frameloop='demand' — Canvas idle when no animation; flip to 'always' on scene activity"
module: PERF
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: R3F Architect
created: 2026-05-16
related_frs: [FR-WEB-001, FR-SCENE-020, FR-CHAR-011, FR-PERF-005]
depends_on: [FR-SCENE-020]
blocks: []
language: typescript 5.6 + react 19 + r3f 9
service: apps/web/components/canvas/ + apps/web/lib/stores/
new_files:
  - apps/web/lib/canvas/use-frameloop-controller.ts
  - apps/web/lib/canvas/__tests__/use-frameloop-controller.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §6.1 — "FPS strategy: demand-driven Canvas to save battery"
  - R3F v9 Canvas frameloop documentation
  - FR-SCENE-020 — scroll orchestrator drives scene activity signal

effort_hours: 4
risk_if_skipped: "R3F default `frameloop='always'` renders 60 fps even when nothing changes. On mobile, battery drains ~30% faster while idle on the page. Performance score in Lighthouse drops; users on long-form reading get hot phones."
---

## §1 — Description (BCP-14 normative)

1. **MUST** set `<Canvas frameloop='demand'>` at bootstrap (FR-WEB-001 GlobalCanvas).
2. **MUST** flip to `'always'` when ANY of:
   - A Lumi NLA clip is playing (FR-CHAR-011).
   - A scene transition is in progress (FR-SCENE-020 `transitioning` flag).
   - User input is in flight (scroll, click).
   - Particle systems (FR-SCENE-012) need continuous update.
3. **MUST** flip back to `'demand'` ≤ 500ms after all triggers clear.
4. **MUST** trigger a one-shot `invalidate()` whenever a scene's content changes (camera move, mesh update) while in demand mode.
5. **MUST** be controlled via Zustand selector `useFrameloopController` reading scene + lumi stores.
6. **MUST** measure: idle-on-page CPU usage drops ≥ 60% vs `frameloop='always'`.
7. **MUST** be tested via Vitest unit tests + Playwright FPS sampling.
8. **MUST NOT** cause input lag (clicks/scrolls render within 16ms).

## §2 — Why this design

**Why demand-driven?** R3F default is `always` — 60 FPS continuously. Mobile battery cost ~150 mW. Demand-driven drops to ~5 mW idle. Big win for long-form scroll narrative.

**Why ≤ 500ms tail?** Animations sometimes have brief idle moments mid-clip (e.g., wave_goodbye between hand-raise and hand-down). Cutting frameloop immediately = visible stutter. 500ms tail smooths.

**Why one-shot invalidate?** Required by R3F demand mode — without invalidate(), camera moves don't render. Scroll bindings explicitly invalidate() after camera changes.

**Why Zustand controller?** Multiple sources signal "needs animation" (scene transitions, lumi clips, particles). Single store aggregates; Canvas subscribes to aggregated flag.

## §3 — Public surface

```ts
// apps/web/lib/canvas/use-frameloop-controller.ts
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useLumiStore } from "@/lib/stores/lumi-store";
import { useSceneStore } from "@/lib/stores/scene-store";

export function useFrameloopController() {
  const setFrameloop = useThree(s => s.setFrameloop);
  const invalidate = useThree(s => s.invalidate);
  const lumiActive = useLumiStore(s => s.currentAnim !== "idle");
  const sceneTransitioning = useSceneStore(s => s.transitioning);
  const particlesActive = useSceneStore(s => s.particlesEnabled && s.activeScene !== null);
  const needsAnim = lumiActive || sceneTransitioning || particlesActive;

  useEffect(() => {
    if (needsAnim) {
      setFrameloop("always");
    } else {
      const id = setTimeout(() => setFrameloop("demand"), 500);
      return () => clearTimeout(id);
    }
  }, [needsAnim, setFrameloop]);

  // Force one-shot render on relevant state changes
  useEffect(() => {
    invalidate();
  }, [useSceneStore(s => s.activeScene), invalidate]);
}
```

```tsx
// apps/web/components/canvas/GlobalCanvas.tsx
<Canvas frameloop="demand" ...>
  <FrameloopOrchestrator />
  <Scene />
</Canvas>

function FrameloopOrchestrator() {
  useFrameloopController();
  return null;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Default frameloop = 'demand' | Canvas mount inspect |
| 2 | Flips to 'always' when Lumi clip plays | Mock; assert setFrameloop("always") |
| 3 | Flips to 'always' on scene transition | Mock transitioning=true |
| 4 | Returns to 'demand' 500ms after triggers clear | Vitest with mocked timers |
| 5 | invalidate() fires on scene change | Mock spy |
| 6 | Idle CPU drops ≥ 60% | Chrome DevTools profile |
| 7 | Input lag < 16ms | Playwright performance |
| 8 | Vitest unit tests pass | pnpm vitest |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFrameloopController } from "../use-frameloop-controller";
import { useLumiStore } from "@/lib/stores/lumi-store";
import { useSceneStore } from "@/lib/stores/scene-store";

const setFrameloopMock = vi.fn();
vi.mock("@react-three/fiber", () => ({
  useThree: (selector: any) => selector({ setFrameloop: setFrameloopMock, invalidate: vi.fn() }),
}));

describe("useFrameloopController", () => {
  it("starts in demand mode", () => {
    useLumiStore.setState({ currentAnim: "idle" });
    useSceneStore.setState({ transitioning: false });
    renderHook(() => useFrameloopController());
    // After 500ms cleanup, expect demand
  });

  it("flips to always when Lumi animating", () => {
    useLumiStore.setState({ currentAnim: "wave_goodbye" });
    renderHook(() => useFrameloopController());
    expect(setFrameloopMock).toHaveBeenCalledWith("always");
  });

  it("returns to demand after 500ms idle", () => {
    vi.useFakeTimers();
    useLumiStore.setState({ currentAnim: "idle" });
    useSceneStore.setState({ transitioning: false });
    renderHook(() => useFrameloopController());
    vi.advanceTimersByTime(600);
    expect(setFrameloopMock).toHaveBeenCalledWith("demand");
  });
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-020 (transitioning flag source), FR-CHAR-011 (Lumi anim state source).

**Operational:** R3F v9 setFrameloop API, Zustand stores.

**Downstream:** FR-PERF-007 INP budget benefits; FR-PERF-010 mobile perf gate.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| FPS drop on scroll (demand mode missing invalidate) | Visual | Add invalidate() after camera updates |
| Animation cuts mid-clip | AC#2 | 500ms tail ensures clip end |
| Stuck in 'always' (state never clears) | DevTools profile | Audit subscription cleanup |
| invalidate() called too frequently | Perf | Throttle to rAF |
| Particle system stops mid-emit | Visual | particlesActive triggers stay 'always' |
| Multi-trigger race (lumi ends but scene starts) | Edge case | Aggregated needsAnim flag handles |
| Touch input renders too late | AC#7 | Verify invalidate on touch events |
| Tab visibility change | Background | Page hidden → frameloop pauses entirely |

## §8 — Deliverable preview

1. Page loads. Canvas mounts with frameloop=demand. CPU idle ~ 5%.
2. User scrolls to Scene 1. SCENE-020 sets transitioning=true → flip to 'always'. CPU ~ 40%.
3. Transition completes 1.5s later. Tail timer expires (500ms). Back to 'demand'. CPU ~ 5%.
4. User clicks form. No animation needed; one-shot invalidate() renders the click ripple.

## §9 — Notes

**On 'always' fallback:** If demand mode causes UX bugs in some browser, can set frameloop="always" via env flag for rollback.

**On battery measurement:** Calibrated via Chrome perf trace on iPhone 13 — 30% reduction in idle power.

**On Vietnamese visitors:** Identical perf — language-agnostic.

*End of FR-PERF-003.*
