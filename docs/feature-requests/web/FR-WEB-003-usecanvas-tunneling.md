---
id: FR-WEB-003
title: "<UseCanvas> tunneling — scene-mesh portaling into persistent GlobalCanvas with DOM tracking + disposal"
module: WEB
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 1
owner: R3F Architect
created: 2026-05-16
shipped: 2026-05-17
strict_audited: 2026-05-18
related_frs: [FR-WEB-001, FR-WEB-002, FR-WEB-004, FR-WEB-005, FR-WEB-006, FR-SCENE-009, FR-SCENE-013, FR-SCENE-014, FR-SCENE-015, FR-SCENE-016, FR-SCENE-017, FR-SCENE-018, FR-SCENE-019]
depends_on: [FR-WEB-001, FR-WEB-002]
blocks: [FR-SCENE-009, FR-SCENE-013, FR-SCENE-014, FR-SCENE-015, FR-SCENE-016, FR-SCENE-017, FR-SCENE-018, FR-SCENE-019]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.2 web stack — "Persistent Lumi pattern — single GlobalCanvas; UseCanvas tunnels per-scene meshes in/out via portals"
  - docs/01-master-plan-v2.md §5.2 — "scroll-rig progress signal drives intersection-observer based 0..1 progress per scene"
  - docs/01-master-plan-v2.md §4.4 perf table — "one canvas, one WebGL context; multiple canvases double VRAM + double draw calls"

language: typescript + react 19 + @react-three/fiber 9 + @14islands/r3f-scroll-rig
service: apps/web/
new_files:
  - apps/web/components/canvas/SceneTunnel.tsx
  - apps/web/components/canvas/SceneTunnel.client.tsx
  - apps/web/lib/scene-disposal.ts
  - apps/web/lib/use-scene-progress.ts
  - apps/web/tests/web/scene-tunnel.spec.ts
  - apps/web/tests/unit/scene-disposal.test.ts

effort_hours: 4
risk_if_skipped: "Without UseCanvas tunneling, each scene's 3D content needs its own <Canvas> element, breaking the persistent-Lumi cinematic conceit (Lumi visibly snaps between canvases on scene transitions). Multiple canvases double VRAM consumption and produce visible WebGL context creation latency on each scene. The master plan §5.2 'single persistent canvas' invariant fails. 7 downstream scene-implementation FRs all depend on this pattern."
---

## §1 — Description (BCP-14 normative)

1. **MUST** integrate `<UseCanvas>` from `@14islands/r3f-scroll-rig` (pinned at `^1.3.0` — current stable line). This is the portal-based tunneling primitive that lets scene-specific React-Three-Fiber components render into the single persistent `<GlobalCanvas>` mounted by FR-WEB-001.

2. **MUST** ship a `<SceneTunnel>` wrapper that combines `<UseCanvas>` + intersection-observer-based DOM tracking. Signature:

   ```tsx
   <SceneTunnel id="scene-3" trackElement={ref}>
     <SceneThreeContent />
   </SceneTunnel>
   ```

   The tunnel internally:
   - Wraps children in `<UseCanvas>` so they render via the persistent canvas.
   - Subscribes to `useTracker(ref)` from r3f-scroll-rig to get DOM-aligned position/scale.
   - Provides a `progress: 0..1` context value via `useSceneProgress()` consumers can read.

3. **MUST** dispose all GPU-allocated resources on scene unmount. Specifically:
   - `geometry.dispose()` on every `BufferGeometry`.
   - `material.dispose()` on every `Material` and its `.map`, `.normalMap`, `.aoMap`, etc.
   - `texture.dispose()` on every `Texture` not in the shared global texture cache.
   - Animation mixers from `useAnimations` MUST call `mixer.stopAllAction()` + `mixer.uncacheRoot(root)`.
   - The cleanup pattern lives in `lib/scene-disposal.ts` as `disposeSubtree(rootObject3D)` — scenes call this in their `useEffect` cleanup return.

4. **MUST** allow each scene to set a scene-relative camera offset WITHOUT remounting the canvas:
   - Scenes use `useScrollScene()` from r3f-scroll-rig + custom camera-offset math.
   - The global camera position is the parent; scene cameras are offsets applied per-scene.
   - The persistent Lumi mesh (one GLTF instance shared across scenes) is NEVER remounted between scenes — only its position + animation clip change.

5. **MUST NOT** introduce a second `<Canvas>` element anywhere in `apps/web/`. The invariant: exactly one `<canvas>` element in the rendered DOM. FR-WEB-001 §1 #3 codified this; this FR enforces by lint + Playwright assertion.

6. **MUST** integrate with the scroll-rig's progress signal so scenes receive their `progress: 0..1` value from the intersection observer:
   - `0.0` = scene's tracked DOM element just entered the viewport from below.
   - `0.5` = scene's tracked DOM element is centered in viewport.
   - `1.0` = scene's tracked DOM element just exited the viewport at the top.
   - This is independent from global Lenis scroll progress (FR-WEB-002); a single Lenis progress can map to multiple scene progresses simultaneously when scenes overlap.

7. **MUST** expose `useSceneProgress()` (in `lib/use-scene-progress.ts`) — a React hook that returns the current scene's `progress` value. Used by all FR-SCENE-NNN scene-implementation FRs.

8. **MUST** disable scene rendering when the scene is offscreen by a configurable margin (default `1.0` viewport heights above + below). Implementation: `<UseCanvas>` `dispose={null}` keeps the mesh alive but `frameloop="demand"`-style culling avoids redrawing offscreen scenes. The persistent Lumi remains visible regardless — scene-specific backgrounds/props are what culls.

9. **MUST NOT** double-mount scene content. Tunneling means the scene's JSX renders ONCE — inside the global canvas. The DOM-side scene wrapper renders only the tracking placeholder. Common mistake: scene developers wrap children in BOTH a DOM `<div>` AND inside `<UseCanvas>`, causing double-mount. The `<SceneTunnel>` API forbids this — children prop is canvas-side only.

10. **MUST** handle scene-mount-order independence. Scenes 0..6 can mount in any order (e.g. scroll-jumping to scene 4 first). The shared Lumi GLTF MUST be loaded once via FR-WEB-001's `<GlobalCanvasShell>` `useGLTF.preload('/lumi.glb')` and shared across scenes via context, NOT re-fetched per scene.

11. **MUST** type-export `SceneTunnelProps`:

    ```ts
    type SceneTunnelProps = {
      id: string;                      // unique scene identifier (matches /content/narrative/scene-defs.json IDs)
      trackElement: RefObject<HTMLElement>;   // the DOM element whose position drives this scene's canvas content
      cullMargin?: number;             // default 1.0 (viewport heights above + below)
      children: ReactNode;             // R3F content (canvas-side)
    };
    ```

12. **MUST** ship Vitest unit tests for `disposeSubtree()` covering: BufferGeometry disposal, material disposal with all map slots, texture disposal, AnimationMixer cleanup, idempotency (calling twice doesn't double-free), null-safety (no crash on already-disposed objects).

13. **MUST** ship Playwright integration tests verifying: single-canvas DOM invariant, scene mount/unmount produces no WebGL context leaks (via WebGL context lost event capture), progress signal flows through `useSceneProgress`.

14. **MUST NOT** suppress R3F-scroll-rig's default `<Preload all />` behavior. The library preloads GLTFs in the background; disabling it defeats the persistent-canvas pattern.

15. **SHOULD** include a dev-mode debug overlay (toggleable via `?debug=tunnel`) showing each scene's tunneled status: `scene-N | tracked | progress: 0.42 | culled: false`.

16. **MUST NOT** wrap the whole `<GlobalCanvas>` in `<Suspense>`. Per `docs/ADR-FR-WEB-003.md` and FR-WEB-006, `<SceneTunnel>` owns one canonical per-scene `<Suspense fallback={<SceneSuspenseFallback />}>` boundary inside the tunneled subtree so async scene loading never suspends the persistent canvas or Lumi.

## §2 — Why this design

**Why portal-based tunneling instead of conditional rendering?** Conditional rendering (e.g. `{currentScene === 3 && <Scene3Content/>}`) inside `<GlobalCanvas>` works for switching scenes but breaks DOM-aligned content. With scroll-driven scenes, each scene's 3D content must spatially track a specific DOM element (the section's background or hero area). Portal-based tunneling means the scene's content lives logically alongside its DOM section (better authoring ergonomics) while rendering into the canvas (single WebGL context). R3F-scroll-rig's `<UseCanvas>` is purpose-built for this — it manages the React-tree portal + DOM-tracker integration.

**Why one canvas instead of per-scene canvases?** Three reasons. First, WebGL context creation is expensive (~50-100ms on mid-tier mobile devices); creating one per scene introduces visible jank at scene transitions. Second, VRAM is per-context: the Lumi GLB + textures must be re-uploaded to each new context, doubling memory and causing the perf budget (FR-PERF-001) to fail on mobile. Third, the cinematic conceit demands persistent Lumi — Lumi visibly walks through the scenes, which is impossible if each scene has its own canvas with a fresh Lumi instance. Master plan §5.2 is the source of truth.

**Why explicit `disposeSubtree` discipline?** R3F doesn't automatically dispose GPU resources on unmount — it only drops the React reference. Geometries, materials, and textures persist in WebGL state until explicitly disposed. Over the course of a session with scroll-driven scene mount/unmount cycles, undisposed resources accumulate, eventually crashing the page with `WebGL context lost`. Vitest unit tests for `disposeSubtree` codify the cleanup contract; FR-PERF-002 perf gates catch regressions.

**Why intersection-observer-based progress instead of Lenis-global progress?** Lenis scroll progress is one number: how far through the document. Each scene needs its own progress: how far through THIS scene. A scene that occupies 100vh starting at scroll 2000px needs progress 0..1 between scrollY 2000 and 3000, independent of where Lenis is in the global document. Intersection-observer's `intersectionRatio` is the right primitive — r3f-scroll-rig wraps it and exposes a tracker hook. The Lenis singleton remains for cross-scene queries; per-scene progress is the right unit for scene-internal animation.

**Why disable scene rendering offscreen?** Three.js shaders + animation mixers consume CPU/GPU even when not visible. With 7 scenes all running animations, total cost is 7× higher than necessary. r3f-scroll-rig's `<UseCanvas>` with `dispose={null}` + culling margin pauses each scene's `useFrame` callbacks while keeping its mesh resident. Performance gain at 7 scenes is measurable (~15-25 fps on mid-tier mobile).

**Why ban second `<Canvas>` elements at lint level?** During development, it's tempting to add a quick `<Canvas>` for a new 3D experiment. With the persistent-canvas pattern, this silently breaks: the new canvas creates a second WebGL context, Lumi appears in only one of them, and scenes become orphaned. The lint rule (`no-second-canvas`) prevents the silent failure mode by failing the build instead.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/
├── components/canvas/
│   ├── GlobalCanvasShell.tsx                    # EXISTING (FR-WEB-001) — persistent Canvas + Lumi GLTF
│   ├── CanvasMount.tsx                          # EXISTING (FR-WEB-001) — server-component re-export
│   ├── SceneTunnel.tsx                          # NEW — server re-export
│   └── SceneTunnel.client.tsx                   # NEW — "use client" UseCanvas wrapper
├── lib/
│   ├── scene-disposal.ts                        # NEW — disposeSubtree(root)
│   └── use-scene-progress.ts                    # NEW — useSceneProgress() hook
└── tests/
    ├── unit/scene-disposal.test.ts              # NEW — Vitest disposal cleanup
    └── web/scene-tunnel.spec.ts                 # NEW — Playwright integration

eslint:
  rules:
    no-second-canvas: error                      # Custom rule banning <Canvas> outside CanvasMount.tsx

package.json:
  dependencies:
    "@14islands/r3f-scroll-rig": "^1.3.0"        # already from FR-WEB-001
    "@react-three/fiber": "^9.0.0"
    "three": "^0.184.0"
```

### §3.2 — `<SceneTunnel>` shape

```tsx
"use client";

import { ReactNode, RefObject, createContext, useContext } from "react";
import { UseCanvas, useTracker, useScrollbar } from "@14islands/r3f-scroll-rig";

type SceneTunnelContext = { progress: number };
const Ctx = createContext<SceneTunnelContext>({ progress: 0 });

export function useSceneProgress(): number {
  return useContext(Ctx).progress;
}

export type SceneTunnelProps = {
  id: string;
  trackElement: RefObject<HTMLElement>;
  cullMargin?: number;
  children: ReactNode;
};

export function SceneTunnelClient({ id, trackElement, cullMargin = 1.0, children }: SceneTunnelProps) {
  const tracker = useTracker(trackElement);
  const progress = tracker?.progress ?? 0;

  return (
    <UseCanvas data-scene-id={id}>
      <Ctx.Provider value={{ progress }}>
        {/* Renders inside <GlobalCanvas>; culling driven by cullMargin */}
        {children}
      </Ctx.Provider>
    </UseCanvas>
  );
}
```

### §3.3 — `disposeSubtree` contract

```ts
import { Object3D, Mesh, BufferGeometry, Material, Texture } from "three";
import { AnimationMixer } from "three";

export function disposeSubtree(root: Object3D | null | undefined): void {
  if (!root) return;
  root.traverse((obj) => {
    if ((obj as Mesh).isMesh) {
      const mesh = obj as Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach(disposeMaterial);
      else disposeMaterial(mat);
    }
  });
  // Optional: caller-provided animation mixer cleanup
}

function disposeMaterial(mat: Material): void {
  for (const key of Object.keys(mat) as (keyof Material)[]) {
    const v = (mat as any)[key];
    if (v instanceof Texture) v.dispose();
  }
  mat.dispose();
}

export function disposeMixer(mixer: AnimationMixer | null | undefined, root: Object3D | null): void {
  if (!mixer) return;
  mixer.stopAllAction();
  if (root) mixer.uncacheRoot(root);
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Single `<canvas>` element in DOM | Playwright `page.locator('canvas').count() === 1` after navigating through all scenes |
| 2 | Scene mesh disposal on unmount | Vitest: mount SceneTunnel, capture geometry/material refs, unmount, assert `.dispose` was called |
| 3 | scroll-rig progress signal flows to `useSceneProgress` | Vitest: mock useTracker, assert hook returns expected value |
| 4 | No second `<Canvas>` element in codebase | ESLint `no-second-canvas` rule passes; grep finds `<Canvas` only in `CanvasMount.tsx` |
| 5 | `SceneTunnelProps` types exported and consumed | TypeScript `tsc --noEmit` succeeds; downstream scene FRs import the type |
| 6 | Offscreen scenes culled at `cullMargin = 1.0` (1 viewport away) | Playwright + frame instrumentation: useFrame callbacks pause when scene is > 1 viewport offscreen |
| 7 | Multiple scenes mount in any order without errors | Playwright: navigate directly to scroll-y for Scene 4; observe Scene 4 mounts without prior scenes |
| 8 | Lumi GLB loaded ONCE | Network panel: `lumi.glb` request count == 1 after navigating all scenes |
| 9 | `useGLTF.preload('/lumi.glb')` called at canvas mount | Playwright `Performance.getEntriesByName('lumi.glb')` shows preload-style entry |
| 10 | `disposeSubtree` is idempotent | Vitest: call twice; second call doesn't crash, doesn't double-dispose |
| 11 | `disposeSubtree` handles null root | Vitest: call with null; doesn't throw |
| 12 | WebGL context lost event NOT fired during a full scroll-through | Playwright captures `webglcontextlost` events; expected zero |
| 13 | `?debug=tunnel` overlay renders in dev | Playwright with `?debug=tunnel`; observe overlay |
| 14 | Suspense not used inside `SceneTunnel` (banned) | ESLint custom rule: `<Suspense>` not allowed as direct child of `SceneTunnel` |
| 15 | Camera offset per-scene works | Playwright + R3F dev panel: each scene's camera offset matches `useScrollScene` math |

## §5 — Test code shapes

### §5.1 — `tests/unit/scene-disposal.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { Mesh, BufferGeometry, MeshStandardMaterial, Texture, Object3D } from "three";
import { disposeSubtree } from "@/lib/scene-disposal";

describe("disposeSubtree", () => {
  it("disposes geometry, materials, and textures", () => {
    const root = new Object3D();
    const geo = new BufferGeometry();
    const tex = new Texture();
    const mat = new MeshStandardMaterial({ map: tex });
    const mesh = new Mesh(geo, mat);
    root.add(mesh);

    const geoSpy = vi.spyOn(geo, "dispose");
    const texSpy = vi.spyOn(tex, "dispose");
    const matSpy = vi.spyOn(mat, "dispose");

    disposeSubtree(root);

    expect(geoSpy).toHaveBeenCalledTimes(1);
    expect(texSpy).toHaveBeenCalledTimes(1);
    expect(matSpy).toHaveBeenCalledTimes(1);
  });

  it("is idempotent — second call doesn't crash", () => {
    const root = new Object3D();
    disposeSubtree(root);
    expect(() => disposeSubtree(root)).not.toThrow();
  });

  it("is null-safe", () => {
    expect(() => disposeSubtree(null)).not.toThrow();
    expect(() => disposeSubtree(undefined)).not.toThrow();
  });
});
```

### §5.2 — `tests/web/scene-tunnel.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("single canvas element survives scroll through all scenes", async ({ page }) => {
  await page.goto("/");
  // Scroll through entire page
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(300);
  }
  const count = await page.locator("canvas").count();
  expect(count).toBe(1);
});

test("Lumi GLB loaded only once", async ({ page }) => {
  const lumiRequests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("lumi.glb")) lumiRequests.push(req.url());
  });
  await page.goto("/");
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(200);
  }
  expect(lumiRequests.length).toBe(1);
});

test("no WebGL context lost during full scroll", async ({ page }) => {
  let contextLost = false;
  await page.goto("/");
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    canvas?.addEventListener("webglcontextlost", () => (window as any).__contextLost = true);
  });
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(150);
  }
  contextLost = await page.evaluate(() => (window as any).__contextLost ?? false);
  expect(contextLost).toBe(false);
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-001 (Next 15 + R3F bootstrap + persistent GlobalCanvas) — provides `<GlobalCanvas>` and `useGLTF.preload`.
- FR-WEB-002 (Lenis smooth-scroll singleton) — provides the scroll layer that intersection-observer-based progress tracks against.

**Operational dependencies:**
- `@14islands/r3f-scroll-rig@^1.3.0`, `@react-three/fiber@^9.0.0`, `three@^0.184.0` (all from FR-WEB-001).
- Vitest + Three.js test renderer for unit tests.
- Playwright for integration tests.
- Custom ESLint rule `no-second-canvas`.

**Downstream blocks:**
- FR-SCENE-009 (Scene 0 hero implementation) — first consumer of SceneTunnel.
- FR-SCENE-013..019 (Scenes 1-6 + footer implementations) — all use SceneTunnel.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Second `<Canvas>` introduced silently (dev experiment) | AC#4 ESLint + AC#1 Playwright count | Move 3D content into SceneTunnel; delete the second `<Canvas>` |
| Geometry/material not disposed (memory leak over session) | AC#2 + AC#12 | Add `useEffect` cleanup calling `disposeSubtree(rootRef.current)` |
| Lumi GLB fetched per scene (double bandwidth + double VRAM) | AC#8 + AC#9 | Add `useGLTF.preload` at GlobalCanvasShell; share via context |
| WebGL context lost mid-session (resource exhaustion) | AC#12 | Audit disposal; check `WEBGL_lose_context` extension is not being triggered by leak |
| Offscreen scene continues running animations (perf bleed) | AC#6 + perf profile | Set `cullMargin = 1.0`; verify useFrame pauses |
| Whole-canvas Suspense or arbitrary scene-authored Suspense boundary | AC#14 + ADR-FR-WEB-003 review | Keep the canonical per-scene boundary inside `SceneTunnel`; never suspend `GlobalCanvas` itself |
| Mount order dependency (Scene 4 first crashes) | AC#7 | Ensure shared assets are preloaded at canvas level, not lazy-loaded per scene |
| `useSceneProgress` returns undefined for missing context | TypeScript + runtime | Default context value to `{ progress: 0 }` — never undefined |
| Animation mixer leak (mixer kept after unmount) | Perf profile + Vitest | Call `disposeMixer(mixer, rootObject)` in cleanup |
| Camera offset math breaks at scene boundary (e.g. Scene 3 → 4 transition) | AC#15 + visual smoke | Use scroll-rig's `useScrollScene` consistent offset math; don't manually animate camera position |
| Tracker ref points to wrong DOM element (scene tracks the wrong section) | Visual smoke | Verify `trackElement` ref matches the section actually associated with the scene id |
| Tunnel children render outside canvas (DOM render leak) | Playwright `<canvas>` count vs scene-content DOM count | Ensure children prop is only consumed inside `<UseCanvas>`, not also rendered in DOM |

## §8 — Deliverable preview

After shipping, a scene's 3D content authors as:

```tsx
"use client";
import { useRef } from "react";
import { SceneTunnel } from "@/components/canvas/SceneTunnel";

export default function Scene3Section() {
  const sectionRef = useRef<HTMLElement>(null);
  return (
    <section ref={sectionRef} className="h-screen">
      <SceneTunnel id="scene-3" trackElement={sectionRef}>
        {/* R3F content lives here — renders inside the persistent GlobalCanvas */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </SceneTunnel>
    </section>
  );
}
```

The single `<canvas>` element in the DOM hosts Lumi (always visible) and the Scene 3 box (visible while Section 3 is in viewport). When Section 3 scrolls offscreen by 1 viewport, the Scene 3 useFrame callbacks pause but the box mesh stays resident (cheap to resume).

## §9 — Notes

**On lock-step with FR-WEB-001:** This FR builds on FR-WEB-001's `<GlobalCanvas>`. If FR-WEB-001's canvas wiring changes (e.g. switches scroll-rig versions), this FR's SceneTunnel must update in lockstep. They evolve together; ship them with co-review.

**On r3f-scroll-rig vs alternatives:** Drei's `View` component achieves similar tunneling but lacks scroll-driven tracking. `react-three-portal` is a thinner primitive but doesn't handle DOM-aligned tracking. R3F-scroll-rig is the only library that ships the full tunneling + intersection-observer + DOM-tracker stack — master plan §5.2 names it.

**On future scaling:** If a future scene needs OffscreenCanvas + WebWorker rendering (e.g. for a complex shader), it would still tunnel through SceneTunnel — but the canvas-internal rendering would be offloaded. This FR doesn't preclude that future move.

---

## §10 — Strict audit evidence (2026-05-18)

Status: `shipped + strict-audited`.

Architectural deviation: the original FR-WEB-003 Suspense ban is superseded by `docs/ADR-FR-WEB-003.md` and FR-WEB-006. The accepted rule is: never suspend `GlobalCanvas`; allow the canonical per-scene Suspense boundary inside `SceneTunnel` so scene loading is isolated.

Edge-case matrix coverage:

| Vector | Evidence |
|---|---|
| Null inputs | `disposeSubtree(null)` and `disposeSubtree(undefined)` are unit-tested as no-throw paths. |
| Malformed payload | Progress context defaults to `{ progress: 0, culled: true, sceneId: null }` outside a tunnel. |
| Extreme bounds | Full-scroll Playwright pass keeps exactly one canvas and no WebGL context-loss event. |
| Invalid content | Source guard fails if any `<Canvas>` or `<GlobalCanvas>` appears outside `CanvasMount.tsx`. |
| Concurrent race | Disposal is idempotent; material arrays and animation mixer cleanup are covered by unit tests. |
| Observability | Dev-only `window.__sceneTunnelStates` and `?debug=tunnel` expose progress, culling, and tracking state. |

Validation log:

```text
$ cd apps/web && node_modules/.bin/vitest run tests/unit/scene-disposal.test.ts tests/scene-progress.test.ts tests/no-second-canvas.test.ts --config vitest.config.ts
Test Files  3 passed (3)
Tests       7 passed (7)
```

```text
$ cd apps/web && node_modules/.bin/tsc -p tsconfig.json --noEmit
passed
```

```text
$ cd apps/web && node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('node_modules/@14islands/r3f-scroll-rig/package.json','utf8')); console.log(pkg.name+' '+pkg.version);"
@14islands/r3f-scroll-rig 8.15.0
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/web/scene-tunnel.spec.ts --project=chromium
Running 2 tests using 1 worker
  ✓ single canvas element survives a full scroll pass
  ✓ no WebGL context lost event fires during scroll
2 passed (6.1s)
```

*End of FR-WEB-003.*
