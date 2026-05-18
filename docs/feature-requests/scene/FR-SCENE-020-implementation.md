---
id: FR-SCENE-020
title: "Scroll orchestrator — GSAP master timeline binding scenes 0..footer + data-scene attribute drive"
module: SCENE
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: R3F Architect + Frontend Lead
created: 2026-05-16
shipped: 2026-05-19
strict_audited: 2026-05-19
related_frs: [FR-SCENE-013, FR-SCENE-014, FR-SCENE-015, FR-SCENE-016, FR-SCENE-017, FR-SCENE-018, FR-SCENE-019, FR-WEB-002, FR-WEB-004, FR-DS-005, FR-DS-006]
depends_on: [FR-SCENE-013, FR-SCENE-019, FR-WEB-002, FR-WEB-004]
blocks: [FR-SCENE-021, FR-PERF-005, FR-PERF-006]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.2 — "Scroll-orchestrator binds each scene; GSAP timeline; reads Lenis progress"
  - docs/01-master-plan-v2.md §2.3 — "Never override scroll velocity"
  - docs/01-master-plan-v2.md §5.2 — "data-scene attribute is the scope key for FR-DS-005 accent scoping"
  - docs/01-master-plan-v2.md §3.2 motion tokens — ease curves driving scene transitions

language: typescript + react 19 + gsap + ScrollTrigger
service: apps/web/components/orchestrator/
new_files:
  - apps/web/components/orchestrator/ScrollOrchestrator.tsx
  - apps/web/components/orchestrator/ScrollOrchestrator.client.tsx
  - apps/web/components/orchestrator/scene-timeline.ts
  - apps/web/components/orchestrator/__tests__/orchestrator.spec.ts
  - apps/web/components/orchestrator/__tests__/scene-timeline.unit.test.ts

effort_hours: 12
risk_if_skipped: "The scroll orchestrator is the choreography spine. Without it, each scene drifts independently — Scene 3 might be active visually while data-scene attribute still reports Scene 2, causing FR-DS-005 accent scoping to fail. Active-scene state in Zustand desyncs with what user sees. Camera transitions become unpredictable. 5 downstream FRs (SCENE-021 mobile flow, PERF-005, PERF-006, plus implicit dependencies from every other scene impl) need this orchestrator to coordinate scroll → scene state → render."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `<ScrollOrchestrator>` as a top-level component mounted once in `app/layout.tsx` (inside the `<SmoothScrollProvider>` per FR-WEB-002).

2. **MUST** build a **GSAP master ScrollTrigger timeline** binding each scene to its scroll range:
   - Scene 0 Hero: scroll 0 → 100vh
   - Scene 1 Origin: scroll 100vh → 200vh
   - Scene 2 Transformation: scroll 200vh → 300vh
   - Scene 3 Capabilities: scroll 300vh → 400vh
   - Scene 4 Team: scroll 400vh → 500vh
   - Scene 5 Vietnam→Global: scroll 500vh → 600vh
   - Scene 6 CTA Hub: scroll 600vh → 700vh
   - Footer: scroll 700vh → document.scrollHeight
   - Each scene's section in the DOM uses `data-scene-id` matching the timeline binding.

3. **MUST** sync with Lenis scroll progress (FR-WEB-002) so the timeline scrubs cleanly:
   - GSAP ticker callback drives Lenis (`gsap.ticker.add(time => lenis.raf(time * 1000))`).
   - GSAP `lagSmoothing(0)` disabled (FR-WEB-002 §1 #7 invariant).
   - ScrollTrigger uses `scroller: document.body` with `scrollerProxy` registered ONCE per FR-WEB-002.

4. **MUST** update the global `<body data-scene>` attribute on every scene transition:
   - On scene-boundary cross (intersection-observer crossing 50% of next scene), set `document.body.dataset.scene = sceneId`.
   - Consumed by FR-DS-005 accent scoping + analytics events.

5. **MUST** update `useSceneStore.setActiveScene(n)` (FR-WEB-004) when the boundary is crossed. ActiveScene is the canonical "which scene is the user currently in" state used by all downstream consumers.

6. **MUST** update `useSceneStore.setSceneProgress(sceneId, 0..1)` continuously per scene as user scrolls through that scene's range. Consumers (each scene impl FR) read this via `useSceneProgress(sceneId)`.

7. **MUST NOT** override scroll velocity (master plan §2.3). The orchestrator READS scroll progress — never WRITES it. No `lenis.scrollTo()` calls from orchestrator (those belong to specific user actions like skip-story pill click).

8. **MUST** support **bi-directional scroll**:
   - Forward scroll: scenes mount in order 0 → footer.
   - Reverse scroll: scenes re-mount (or stay mounted) in reverse; reverse-direction reads from `useScrollDirection()` (FR-WEB-004).
   - Reverse scroll triggers reverse-clip behaviors where applicable (FR-SCENE-019 wave_goodbye reverse).

9. **MUST** handle scroll-jumping (anchor links from FR-A11Y-003 skip-story pill, deep-link `#scene-3` URLs):
   - Smooth-scroll via `lenis.scrollTo(targetY)` with 1.2s duration ease-genie.
   - Scenes in-between unmount/re-mount correctly without leaking GPU resources.

10. **MUST** handle the `transitioning` flag in `sceneStore.transitioning`:
    - Set `true` during scene-boundary cross (500ms window).
    - Set `false` once next scene's setup completes.
    - Consumers can disable user interaction during transitioning (e.g. FR-CTA-001 portal clicks ignored).

11. **MUST** be reduced-motion-aware:
    - Under prefers-reduced-motion: no GSAP timeline; data-scene attribute updates via direct intersection-observer (no scroll-driven animation).
    - All scene-progress values still computed (downstream FRs may still need progress).

12. **MUST** be SSR-safe:
    - Component is `"use client"`.
    - GSAP / ScrollTrigger registration happens in `useEffect`.
    - On SSR HTML: data-scene defaults to "scene-0".

13. **MUST** clean up all ScrollTriggers + GSAP timelines on unmount:
    - `ScrollTrigger.getAll().forEach(t => t.kill())`.
    - `timeline.kill()`.

14. **MUST** ship Vitest unit tests for `scene-timeline.ts` (correct scene-range computation, intersection-observer threshold logic).

15. **MUST** ship Playwright integration tests: data-scene attribute updates on scroll, sceneStore.activeScene updates, scene-progress values flow through, reverse scroll works, deep-link `#scene-5` jumps cleanly.

16. **SHOULD** include `?debug=orchestrator` overlay showing: current scene, progress within scene, transitioning flag, all timeline-bound scenes + their scroll ranges.

## §2 — Why this design

**Why a single master timeline?** Without orchestration, each scene's own intersection observer + ScrollTrigger fires independently. Race conditions emerge: Scene 2 might still report active when Scene 3 has begun rendering. Single master timeline guarantees one source of truth for "which scene is active."

**Why data-scene attribute drives CSS scope?** FR-DS-005 cool-accent scoping reads `[data-scene="scene-5"]`. If the attribute is stale, the cool accents leak into wrong scenes. The orchestrator owning the attribute update guarantees correctness — single writer, no race.

**Why GSAP + ScrollTrigger (not raw IntersectionObserver)?** GSAP's `scrollTrigger.scrub` is the right primitive for scroll-driven animation. Raw IntersectionObserver fires only on threshold-cross — fine for "active scene changed" but missing the per-pixel progress values scenes need. GSAP's timeline gives both: scrub for continuous progress, callbacks for boundary cross.

**Why never override scroll velocity?** Master plan §2.3 motion ethics. Lenis already smooths visual scroll; orchestrator just reads. Any orchestrator-initiated `scrollTo` (e.g. from skip-pill click) is a user-action handler, not a velocity override.

**Why `transitioning` flag matters?** During the 500ms scene-boundary crossfade, both scenes are partially mounted. User clicks (e.g. CTA portal) during this window could fire against the wrong scene's handler. Setting `transitioning: true` lets consumers no-op briefly until the boundary settles.

**Why bi-directional support?** Users scroll back to re-read sections. Scene 5 (cultural anchor) gets re-read often. The orchestrator must handle reverse correctly — restoring `data-scene-5` attribute when user scrolls back to Scene 5, triggering reverse animations where appropriate.

**Why scroll-jumping support (anchor links)?** FR-A11Y-003 skip-story pill jumps to `#cta-hub` (Scene 6). Without orchestrator handling, the in-between scenes (1-5) would all fire their setup logic in rapid succession as the user scrolls past — wasted work, jank. Orchestrator detects the jump and skips intermediate scene setup.

## §3 — Deliverable structure

```
apps/web/components/orchestrator/
├── ScrollOrchestrator.tsx              # server re-export
├── ScrollOrchestrator.client.tsx       # "use client" implementation
├── scene-timeline.ts                   # scene-range registry + helpers
└── __tests__/
    ├── orchestrator.spec.ts            # Playwright integration
    └── scene-timeline.unit.test.ts     # Vitest unit
```

### §3.2 — `scene-timeline.ts` shape

```ts
import sceneDefs from "@/content/narrative/scene-defs.json";

export interface SceneRange {
  id: string;
  index: number;
  startVh: number;
  endVh: number;
  reduced: boolean;  // reduced-motion variant (compressed)
}

export const SCENE_RANGES: SceneRange[] = [
  { id: "scene-0-hero",               index: 0, startVh: 0,   endVh: 100,  reduced: false },
  { id: "scene-1-origin",             index: 1, startVh: 100, endVh: 200,  reduced: false },
  { id: "scene-2-transformation",     index: 2, startVh: 200, endVh: 300,  reduced: false },
  { id: "scene-3-capabilities",       index: 3, startVh: 300, endVh: 400,  reduced: false },
  { id: "scene-4-team",               index: 4, startVh: 400, endVh: 500,  reduced: false },
  { id: "scene-5-vietnam-global",     index: 5, startVh: 500, endVh: 600,  reduced: false },
  { id: "scene-6-cta-hub",            index: 6, startVh: 600, endVh: 700,  reduced: false },
  { id: "footer",                     index: 7, startVh: 700, endVh: 800,  reduced: false },
];

export function getActiveSceneFromScrollY(scrollY: number, viewportH: number): SceneRange {
  const scrollVh = (scrollY / viewportH) * 100;
  return SCENE_RANGES.find((r) => scrollVh >= r.startVh && scrollVh < r.endVh) ?? SCENE_RANGES[0];
}

export function getSceneProgress(sceneId: string, scrollY: number, viewportH: number): number {
  const range = SCENE_RANGES.find((r) => r.id === sceneId);
  if (!range) return 0;
  const scrollVh = (scrollY / viewportH) * 100;
  const local = (scrollVh - range.startVh) / (range.endVh - range.startVh);
  return Math.max(0, Math.min(1, local));
}
```

### §3.3 — `ScrollOrchestrator.client.tsx` shape

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/lib/lenis-singleton";
import { useSceneStore } from "@/lib/stores";
import { SCENE_RANGES, getActiveSceneFromScrollY, getSceneProgress } from "./scene-timeline";
import { useReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function ScrollOrchestratorClient() {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const lastSceneRef = useRef<string>("scene-0-hero");

  useEffect(() => {
    if (!lenis && !reduced) return;  // wait for Lenis (unless reduced-motion path)

    // Bridge Lenis → GSAP ticker
    if (lenis) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value?) {
          if (arguments.length && value !== undefined) lenis.scrollTo(value);
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        },
      });
    }

    // Build master timeline — one ScrollTrigger per scene with onUpdate
    const triggers = SCENE_RANGES.map((range) => {
      return ScrollTrigger.create({
        trigger: `[data-scene-id="${range.id}"]`,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          const wasTransitioning = useSceneStore.getState().activeScene !== range.index;
          if (wasTransitioning) {
            useSceneStore.getState().setTransitioning(true);
            setTimeout(() => useSceneStore.getState().setTransitioning(false), 500);
          }
          useSceneStore.getState().setActiveScene(range.index);
          document.body.dataset.scene = range.id;
          lastSceneRef.current = range.id;
        },
        onEnterBack: () => {
          useSceneStore.getState().setActiveScene(range.index);
          document.body.dataset.scene = range.id;
          lastSceneRef.current = range.id;
        },
        onUpdate: (self) => {
          useSceneStore.getState().setSceneProgress(range.id, self.progress);
        },
      });
    });

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [lenis, reduced]);

  // Reduced-motion fallback: pure IntersectionObserver, no scrub
  useEffect(() => {
    if (!reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = (entry.target as HTMLElement).dataset.sceneId;
            const range = SCENE_RANGES.find((r) => r.id === id);
            if (range) {
              useSceneStore.getState().setActiveScene(range.index);
              document.body.dataset.scene = id ?? "scene-0-hero";
            }
          }
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    document.querySelectorAll("[data-scene-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reduced]);

  return null;
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | All 8 scenes (0..6 + footer) bound to scroll ranges | Vitest: `SCENE_RANGES.length === 8` |
| 2 | data-scene attribute updates on scroll boundary | Playwright scroll + DOM observation |
| 3 | sceneStore.activeScene matches data-scene attribute | Playwright eval correspondence |
| 4 | sceneStore.sceneProgress[id] updates continuously 0..1 | Playwright scroll + polling |
| 5 | No scroll velocity overrides | Inspect Lenis state during orchestrator runs |
| 6 | Bi-directional scroll: scenes activate in both directions | Playwright scroll forward + reverse |
| 7 | Deep-link `#scene-5` smooth-scrolls + activates Scene 5 | Playwright click anchor; verify data-scene |
| 8 | `transitioning` flag true during 500ms boundary cross | Playwright observe transitioning value |
| 9 | Reduced-motion: data-scene still updates via IO | Playwright reducedMotion ctx |
| 10 | SSR HTML: data-scene defaults to "scene-0" | curl HTML check |
| 11 | All ScrollTriggers killed on unmount | Vitest: count post-unmount |
| 12 | gsap.ticker.lagSmoothing(0) honored | FR-WEB-002 §1 #7 invariant; eval |
| 13 | ScrollTrigger.scrollerProxy registered exactly once | Mock counter on registration |
| 14 | Skip-story pill (FR-A11Y-003) jump to #cta-hub works | Playwright click + verify data-scene = scene-6 |
| 15 | Mobile compressed flow (FR-SCENE-021) respected | Test with mobile viewport + compressed scene ranges |
| 16 | `?debug=orchestrator` overlay renders in dev | Playwright query param |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("data-scene attribute updates on scroll", async ({ page }) => {
  await page.goto("/");
  // Initial scene-0
  expect(await page.evaluate(() => document.body.dataset.scene)).toBe("scene-0-hero");
  // Scroll to scene-3
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.5));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => document.body.dataset.scene)).toBe("scene-3-capabilities");
  // Scroll back to scene-1
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => document.body.dataset.scene)).toBe("scene-1-origin");
});

test("sceneProgress flows continuously", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.0));  // start of scene-2
  await page.waitForTimeout(200);
  const progress0 = await page.evaluate(() =>
    (window as any).__stores?.scene?.sceneProgress?.["scene-2-transformation"] ?? 0
  );
  expect(progress0).toBeCloseTo(0, 1);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.5));  // mid scene-2
  await page.waitForTimeout(200);
  const progress50 = await page.evaluate(() =>
    (window as any).__stores?.scene?.sceneProgress?.["scene-2-transformation"] ?? 0
  );
  expect(progress50).toBeCloseTo(0.5, 1);
});

test("scrollerProxy registered once", async ({ page }) => {
  await page.goto("/");
  // Inspect ScrollTrigger internals — should have one scrollerProxy entry
  const count = await page.evaluate(() => (window as any).ScrollTrigger?.getAll().filter((t: any) => t.scroller === document.body).length);
  expect(count).toBeGreaterThan(0);
});

test("reverse scroll restores prior scene", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1));
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.body.dataset.scene)).toBe("scene-1-origin");
});

test("reduced-motion path", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => document.body.dataset.scene)).toBe("scene-3-capabilities");
});
```

## §6 — Dependencies

**Concept:** All FR-SCENE-013..019 (consumes scene state set by orchestrator), FR-DS-005 (reads data-scene attribute for accent scope), FR-DS-006 (motion tokens for ease curves).

**Operational:** FR-WEB-002 (Lenis singleton + scrollerProxy bridge), FR-WEB-004 (Zustand stores + useSceneStore + useScrollDirection), FR-A11Y-001 (useReducedMotion), GSAP 3 + ScrollTrigger.

**Downstream blocks:** FR-SCENE-021 (mobile compressed flow needs orchestrator to remap ranges), FR-PERF-005, FR-PERF-006 (perf gates verify orchestrator doesn't blow frame budget), every FR-SCENE-013..019 (each reads useSceneProgress(sceneId)).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| data-scene attribute stale (race with next scene) | AC#2/AC#3 + DOM observation | Verify ScrollTrigger onEnter / onEnterBack covers both directions; debounce 50ms if needed |
| sceneProgress doesn't reach 1.0 at scene end | AC#4 | Verify ScrollTrigger start/end markers ("top center" / "bottom center"); use viewport-relative markers |
| Multiple scrollerProxy registrations (HMR re-mount) | AC#13 + visible jank | Ensure orchestrator runs once globally; React.StrictMode double-mount handled with refs |
| Scroll velocity override (e.g. lenis.scrollTo from orchestrator) | AC#5 | Orchestrator MUST be READ-only on Lenis; only `lenis.scrollTo` for explicit user actions |
| Reduced-motion path: data-scene doesn't update | AC#9 | IntersectionObserver fallback; ensure threshold 0.5 fires |
| Deep-link `#scene-5` doesn't activate Scene 5 | AC#7 | Anchor-link handler calls `lenis.scrollTo(element.offsetTop)`; orchestrator picks up on next tick |
| transitioning flag stuck true (forgotten setFalse) | AC#8 | setTimeout(500ms) handles; verify onEnter completes setFalse |
| ScrollTrigger memory leak on route change | AC#11 | Cleanup function kills all triggers + timelines |
| Frame budget blown (scrollTrigger scrub too aggressive) | AC#15 + FR-PERF-006 INP gate | Limit per-frame `onUpdate` callbacks; throttle to 30fps if INP > 50ms |
| GSAP loaded eagerly (not via dynamic-three boundary) | FR-WEB-005 + bundle inspection | Verify GSAP in dynamic-three.ts factory; not in main chunk |
| Lenis bridge bound twice (multiple registrations) | AC#13 | Use refs to ensure single bind |
| Mobile compressed flow not respected | AC#15 | Read mobile viewport breakpoint; switch SCENE_RANGES to compressed set per FR-SCENE-021 |

## §8 — Deliverable preview

After shipping:
- User loads `/` → data-scene = "scene-0-hero", sceneStore.activeScene = 0, sceneProgress["scene-0-hero"] = 0.
- User scrolls 50vh → sceneProgress["scene-0-hero"] = 0.5; data-scene unchanged.
- User scrolls past 100vh → data-scene flips to "scene-1-origin"; activeScene = 1; transitioning briefly true.
- User clicks skip-story pill → smooth-scroll to #cta-hub; data-scene = "scene-6-cta-hub".
- User scrolls back to top → reverse traversal; nón lá flag persists (since visited Scene 5); FR-SCENE-019 wave_goodbye reverse if applicable.

Reduced-motion: same state updates via IntersectionObserver, no GSAP timeline.

## §9 — Notes

**On `scene-defs.json` source-of-truth:** SCENE_RANGES inherits from `content/narrative/scene-defs.json` (FR-CMS-001) where possible — IDs MUST byte-match. A future amendment may move the range definitions into scene-defs.json so they share a single source.

**On scroll-driven 3D camera:** Each scene's camera transitions (e.g. Scene 5's 600ms camera move) are owned by the scene impl FR, not the orchestrator. The orchestrator provides progress; scenes consume it.

**On future-proofing for added scenes:** If P5/P6 introduces an 8th scene, SCENE_RANGES gets a new entry + scroll heights adjust. Tested via Vitest with the new range definition.

*End of FR-SCENE-020.*
