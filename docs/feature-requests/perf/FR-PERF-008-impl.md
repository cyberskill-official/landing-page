---
id: FR-PERF-008
title: "Draw-call ceiling — < 100 per scene + instancing audit (particles, avatars, repeated meshes)"
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
related_frs: [FR-SCENE-020, FR-SCENE-012, FR-OPS-011, FR-PERF-005]
depends_on: [FR-SCENE-020]
blocks: []
language: typescript 5.6 + react 19 + three.js
service: apps/web/components/scenes/ + apps/web/lib/perf/
new_files:
  - apps/web/lib/perf/draw-call-monitor.ts
  - apps/web/lib/perf/__tests__/draw-call-monitor.unit.test.ts
  - apps/web/components/canvas/DrawCallStats.tsx

source_pages:
  - docs/01-master-plan-v2.md §6.1 — "Draw calls < 100 per scene at any moment"
  - Three.js InstancedMesh documentation
  - Drei <Instances> component docs

effort_hours: 4
risk_if_skipped: "Each draw call = ~0.5ms GPU+CPU overhead on mobile. 200 draw calls = 100ms/frame = 10 FPS. Lighthouse FPS budget fails. Master plan §6.1 explicitly caps at 100. Without enforcement, scope creep (each new scene adds 20 props) silently busts budget."
---

## §1 — Description (BCP-14 normative)

1. **MUST** audit each scene's draw call count via stats-gl (`renderer.info.render.calls`).
2. **MUST** use `<Instances>` from Drei for repeated meshes (particles, multiple avatars, props of same geometry).
3. **MUST** merge static geometry where possible via `BufferGeometryUtils.mergeGeometries()`.
4. **MUST** fail Lighthouse CI (FR-OPS-011) if any scene exceeds **100 draw calls**.
5. **MUST** ship `apps/web/lib/perf/draw-call-monitor.ts` that:
   - Subscribes to R3F render loop.
   - Polls `renderer.info.render.calls` every frame.
   - Reports per-scene peak.
   - Warns in dev if peak > 80 (early signal).
   - Surfaces via `?debug=draws` overlay.
6. **MUST** export instancing helpers for common patterns:
   - `<InstancedParticles count={100} geometry={...} material={...} />` — particle systems.
   - `<InstancedAvatars members={teamMembers} />` — avatar wall.
7. **MUST** ship a dev-mode overlay `<DrawCallStats>` showing live draw count.
8. **MUST NOT** instance dissimilar geometries — instancing requires shared geometry + material.
9. **MUST** be tested via Vitest unit tests on the monitor + Playwright integration test (visit each scene, assert peak draws < 100).

## §2 — Why this design

**Why 100 draw calls cap?** Master plan §6.1 calibration:
- Mobile-low (Adreno 5xx GPU) handles ~50-100 draw calls at 60 FPS.
- Mobile-high (Apple A15) handles ~200-300.
- Desktop handles 500+.
- Setting the cap at 100 ensures mobile-low gets 60 FPS.

**Why <Instances>?** Particles (FR-SCENE-012) and avatar walls could naively be 100 separate meshes = 100 draw calls. Instancing batches them into 1 draw call. ~99% reduction.

**Why merge static geometry?** Multiple static props (Scene 5 globe + props) can become 1 mesh + 1 draw call. Loses per-prop transform control but acceptable when props are baked.

**Why dev-mode overlay?** Devs need real-time feedback. "Did my change spike draws?" — overlay shows. Production has no overlay (zero perf overhead).

**Why warn at 80?** Early warning. 80 = "you have headroom, but you're close." 100 = "stop, you'll fail CI."

## §3 — Public surface

```ts
// apps/web/lib/perf/draw-call-monitor.ts
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

const peakPerScene = new Map<number, number>();

export function useDrawCallMonitor(currentScene: number) {
  const renderer = useThree(s => s.gl);
  const peakRef = useRef(0);

  useFrame(() => {
    const calls = renderer.info.render.calls;
    if (calls > peakRef.current) peakRef.current = calls;
    if (calls > peakPerScene.get(currentScene) ?? 0) {
      peakPerScene.set(currentScene, calls);
    }
    if (calls > 80 && process.env.NODE_ENV === "development") {
      console.warn(`[perf] Scene ${currentScene} draw calls: ${calls} (target < 100)`);
    }
  });
}

export function getPeakDrawCalls(scene: number): number {
  return peakPerScene.get(scene) ?? 0;
}
```

```tsx
// apps/web/components/canvas/DrawCallStats.tsx (dev overlay)
"use client";
import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";

export function DrawCallStats() {
  const renderer = useThree(s => s.gl);
  const [calls, setCalls] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCalls(renderer.info.render.calls), 100);
    return () => clearInterval(id);
  }, [renderer]);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, background: "rgba(0,0,0,0.7)", color: "white", padding: 8, fontSize: 12, zIndex: 9999 }}>
      Draws: {calls} {calls > 80 ? "⚠" : "✅"}
    </div>
  );
}
```

```tsx
// Example instancing pattern
import { Instances, Instance } from "@react-three/drei";

function InstancedParticles({ count = 100 }: { count: number }) {
  const positions = useMemo(() => Array.from({ length: count }, () => [
    Math.random() * 10 - 5, Math.random() * 10, Math.random() * 10 - 5,
  ]), [count]);

  return (
    <Instances limit={count}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color="gold" />
      {positions.map((p, i) => <Instance key={i} position={p as any} />)}
    </Instances>
  );
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Draw count < 100 per scene | Playwright per-scene assertion |
| 2 | Instancing used for particles | Code inspection |
| 3 | Instancing used for avatars | Code inspection |
| 4 | Static geometry merged where possible | Visual + code |
| 5 | Lighthouse CI fails on draws > 100 | Synthetic over-budget scene; CI red |
| 6 | Dev overlay shows live count | `?debug=draws` query param |
| 7 | Dev warning at 80 fires | Console listener |
| 8 | Vitest unit tests pass | pnpm vitest |
| 9 | Production bundle excludes dev overlay | Bundle analyzer |
| 10 | Monitor doesn't impact prod perf | Profile diff |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { getPeakDrawCalls } from "../draw-call-monitor";

describe("draw-call-monitor", () => {
  it("tracks peak per scene", () => {
    // Mock useFrame; trigger 5 frames at different counts
    // expect getPeakDrawCalls(0) === highest count
  });

  it("warns in dev mode above 80", () => {
    process.env.NODE_ENV = "development";
    const warnSpy = vi.spyOn(console, "warn");
    // simulate frame with 85 calls
    // expect warnSpy called
  });

  it("does not warn in production", () => {
    process.env.NODE_ENV = "production";
    const warnSpy = vi.spyOn(console, "warn");
    // simulate frame with 85 calls
    // expect warnSpy NOT called
  });
});
```

```ts
// Playwright integration (apps/web/tests/perf/draw-calls.e2e.spec.ts)
import { test, expect } from "@playwright/test";

test("Scene 0 draw calls < 100", async ({ page }) => {
  await page.goto("/?debug=draws");
  await page.waitForLoadState("networkidle");
  const calls = await page.evaluate(() => Number((document.querySelector("body")?.textContent?.match(/Draws: (\d+)/)?.[1]) ?? 0));
  expect(calls).toBeLessThan(100);
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-020 (scroll orchestrator coords scene loading), FR-SCENE-012 (particles use instancing), FR-OPS-011 (Lighthouse consumer).

**Operational:** Three.js `renderer.info.render.calls`, Drei `<Instances>` component.

**Downstream:** All scenes site-wide. FR-PERF-010 mobile budget tightens further.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| High draw count from un-instanced repeats | AC#1 + visual | Audit; add <Instances> |
| Instancing breaks per-instance transforms | Visual | Use Instance position/scale/rotation per item |
| Merging breaks material slot | Visual | Don't merge across material boundaries |
| Dev overlay impacts FPS | Profile | Use throttled interval (100ms not every frame) |
| Lighthouse can't measure draws directly | FR-OPS-011 integration | Embed peak count in HTML data attribute for CI to scrape |
| Counter resets on tab switch | OK | Re-measure on visibility return |
| Multiple Canvases double-count | Edge case | We use single GlobalCanvas |
| InstancedMesh shadow-cast broken | Visual | Drei <Instances> supports shadows |
| InstancedMesh instance count > limit | Three.js error | Pre-allocate buffer; cap at known max |
| Scene transition spikes draws | AC#1 | Audit during transition; budget accounts for peak |
| Sentry quota burned by warn flood | Sentry overage | Dev-only console.warn; not sent to Sentry |
| Production overlay accidentally shipped | AC#9 | Dynamic import dev-only |

## §8 — Deliverable preview

Dev experience:
1. Frontend lead adds new prop to Scene 4. `?debug=draws` shows count jumped from 65 to 92.
2. Console: "[perf] Scene 4 draw calls: 92 (target < 100)".
3. Lead checks: 25 of those are from 8 sample books on a shelf. Refactors to <Instances>.
4. New count: 68. Under threshold; CI passes.

Production:
1. No overlay, no monitoring overhead.
2. Lighthouse CI verifies via build-time scene scan.

## §9 — Notes

**On 100 cap rationale:** Calibrated per master plan §6.1. Mobile-low GPU is the bottleneck. Desktop has headroom (could go to 500), but cross-tier consistency = single target.

**On per-instance materials:** InstancedMesh requires single material. For varied materials, use color attribute per instance or accept multiple draw calls.

**On Vietnamese visitors:** Identical perf — locale-agnostic.

*End of FR-PERF-008.*
