---
id: FR-PERF-005
title: "disposeAll audit — geometries/materials/textures/render-targets on unmount + Vitest no-leak gate"
module: PERF
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: R3F Architect
created: 2026-05-16
related_frs: [FR-WEB-003, FR-WEB-001, FR-PERF-006, FR-PERF-009]
depends_on: [FR-WEB-003]
blocks: []
language: typescript 5.6 + react 19 + three.js
service: apps/web/lib/three/ + apps/web/components/canvas/
new_files:
  - apps/web/lib/three/use-dispose-on-unmount.ts
  - apps/web/lib/three/dispose-all.ts
  - apps/web/lib/three/__tests__/dispose-on-unmount.unit.test.ts
  - eslint-rules/no-undisposed-three-ref.ts

source_pages:
  - docs/01-master-plan-v2.md §6.2 — "Memory hygiene: dispose every geometry, material, texture, render target"
  - Three.js memory management docs

effort_hours: 6
risk_if_skipped: "Three.js objects do NOT garbage-collect automatically — leaked geometries + textures accumulate ~5 MB GPU memory per scene change. After ~10 minutes of scrolling, mobile devices hit GPU memory exhaustion → tab crash. WebGL out-of-memory errors visible in console; user sees blank canvas."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ensure every R3F component manually calls `dispose()` on Three.js resources it created:
   - `BufferGeometry.dispose()`
   - `Material.dispose()` (and per-texture)
   - `Texture.dispose()`
   - `WebGLRenderTarget.dispose()`
   - `RawShaderMaterial.dispose()`
2. **MUST** ship a `useDisposeOnUnmount(refs)` custom hook that takes refs to Three.js objects and disposes them on unmount.
3. **MUST** ship a `disposeAll(scene)` helper that recursively walks a Three.js scene/group and disposes every resource.
4. **MUST** ship an ESLint rule `no-undisposed-three-ref` (companion to FR-PERF-006) that flags React refs to Three.js objects without corresponding `useDisposeOnUnmount`.
5. **MUST** be tested via Vitest: mount/unmount cycles ≥ 100 times don't grow WebGL memory beyond a 5 MB threshold.
6. **MUST** be tested via Playwright: 30-second scroll through all scenes; assert GPU memory stable (via stats-gl).
7. **MUST** apply to FR-WEB-003 dynamic-three.ts boundary — all R3F components loaded through it auto-import the hook.
8. **MUST NOT** double-dispose (idempotent) — calling dispose twice causes Three.js console warnings.
9. **MUST** handle cached resources (Drei useGLTF cache) — do NOT dispose cached resources that Drei manages.

## §2 — Why this design

**Why manual dispose (not GC)?** WebGL resources live in GPU memory which JavaScript GC doesn't track. JS object can be collected while the GPU buffer remains allocated. Without explicit dispose, memory accumulates until GPU exhausts.

**Why custom hook (not just cleanup function)?** Hook standardizes pattern; lint rule can detect missing hook. Without hook, every component reimplements the cleanup, inconsistently.

**Why ESLint rule?** Compile-time enforcement. Catches "I added a new geometry but forgot dispose" at commit time, not at production OOM crash.

**Why 100-cycle test?** Real-world: user scrolls back and forth through scenes ~10 times. 100 cycles is the safety margin.

**Why don't dispose cached resources?** Drei's useGLTF caches loaded models. Disposing them = next load re-fetches = doubles bandwidth. Drei manages its own lifecycle; respect the boundary.

## §3 — Public surface

```ts
// apps/web/lib/three/use-dispose-on-unmount.ts
import { useEffect } from "react";
import type { Object3D, BufferGeometry, Material, Texture, WebGLRenderTarget } from "three";

type Disposable = BufferGeometry | Material | Texture | WebGLRenderTarget;

export function useDisposeOnUnmount(refs: React.RefObject<Disposable | Disposable[] | null>[]) {
  useEffect(() => {
    return () => {
      for (const ref of refs) {
        if (!ref.current) continue;
        const items = Array.isArray(ref.current) ? ref.current : [ref.current];
        for (const item of items) {
          if (typeof (item as any).dispose === "function") {
            (item as any).dispose();
          }
        }
      }
    };
  }, [refs]);
}
```

```ts
// apps/web/lib/three/dispose-all.ts
import type { Object3D, Mesh, Material } from "three";

export function disposeAll(root: Object3D): void {
  root.traverse(node => {
    if ((node as Mesh).isMesh) {
      const mesh = node as Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(disposeMaterial);
      } else if (mesh.material) {
        disposeMaterial(mesh.material as Material);
      }
    }
  });
}

function disposeMaterial(mat: Material): void {
  for (const key in mat) {
    const val = (mat as any)[key];
    if (val?.isTexture) val.dispose();
  }
  mat.dispose();
}
```

```ts
// Usage in R3F components
import { useRef } from "react";
import { useDisposeOnUnmount } from "@/lib/three/use-dispose-on-unmount";

function MyMesh() {
  const geomRef = useRef(null);
  const matRef = useRef(null);
  useDisposeOnUnmount([geomRef, matRef]);
  return (
    <mesh>
      <boxGeometry ref={geomRef} />
      <meshStandardMaterial ref={matRef} />
    </mesh>
  );
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | useDisposeOnUnmount hook present + used in all scene components | grep code |
| 2 | Vitest: 100 mount/unmount cycles GPU memory delta ≤ 5 MB | Vitest with mocked WebGL counters |
| 3 | ESLint rule flags missing dispose on geometry/material refs | Synthetic violation; CI fails |
| 4 | disposeAll(scene) recursively disposes | Vitest |
| 5 | Idempotent dispose (no double-dispose warnings) | Vitest |
| 6 | Drei cached resources not disposed | Verify useGLTF cache survives |
| 7 | Playwright 30s scroll: GPU memory stable | stats-gl reading |
| 8 | Vitest unit tests pass | pnpm vitest |
| 9 | All Scene components import the hook | grep |
| 10 | No console warnings on unmount | Playwright console listener |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDisposeOnUnmount } from "../use-dispose-on-unmount";

describe("useDisposeOnUnmount", () => {
  it("calls dispose on each ref's current on unmount", () => {
    const disposeSpy = vi.fn();
    const ref = { current: { dispose: disposeSpy } };
    const { unmount } = renderHook(() => useDisposeOnUnmount([ref as any]));
    unmount();
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it("handles array refs", () => {
    const d1 = vi.fn(), d2 = vi.fn();
    const ref = { current: [{ dispose: d1 }, { dispose: d2 }] };
    const { unmount } = renderHook(() => useDisposeOnUnmount([ref as any]));
    unmount();
    expect(d1).toHaveBeenCalled();
    expect(d2).toHaveBeenCalled();
  });

  it("skips null refs gracefully", () => {
    const ref = { current: null };
    const { unmount } = renderHook(() => useDisposeOnUnmount([ref as any]));
    expect(() => unmount()).not.toThrow();
  });

  it("100-cycle test does not exceed 5 MB delta", async () => {
    const start = (performance as any).memory?.usedJSHeapSize ?? 0;
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useDisposeOnUnmount([]));
      unmount();
    }
    const end = (performance as any).memory?.usedJSHeapSize ?? 0;
    expect(end - start).toBeLessThan(5_000_000);
  });
});
```

## §6 — Dependencies

**Concept:** FR-WEB-003 (dynamic-three.ts boundary; auto-imports hook), FR-PERF-006 (companion ESLint rule for useFrame), FR-PERF-009 (low-memory devices benefit most).

**Operational:** Three.js dispose API, React useEffect cleanup, ESLint custom rule infrastructure.

**Downstream:** All R3F components site-wide use this hook; FR-PERF-010 mobile budget benefits.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Memory grows over scroll | AC#7 | Verify hook used in cleanup; lint rule enforces |
| Double-dispose warning | Three.js console | Idempotent check inside hook |
| Drei cache disposed accidentally | Visual: model re-loads | disposeAll skips drei-managed objects |
| ESLint false positive on test fixtures | AC#3 | Exclude `**/__tests__/**` |
| Custom shader material not disposed | Visual artifact | Include in disposable union type |
| Render target survives unmount | GPU memory profile | Add WebGLRenderTarget to disposable types |
| TextureLoader-loaded texture missed | Profile | Either dispose manually or use Drei wrappers |
| dispose hook breaks SSR | typeof check | Hook is client-only useEffect |
| Recursive dispose on scene graph (depth limit) | Stack overflow | Iterative traversal or limit depth |
| Mesh.material as array not handled | Visual | Array.isArray check |
| Performance hit on dispose burst | Frame skip | Acceptable; happens only on unmount |
| Drei useGLTF.preload cached → manual dispose error | Console warn | Respect Drei boundary |

## §8 — Deliverable preview

After implementation:
- Scroll through all 8 scenes 10x → GPU memory stays at ~80 MB (vs ~1 GB without disposes).
- Vitest CI runs 100-cycle test in ~3s; passes.
- ESLint flags PR that adds `<bufferGeometry />` without a ref + hook.
- 30-second Playwright scroll test reports stable GPU memory.

## §9 — Notes

**On WebGL memory measurement:** `performance.memory.usedJSHeapSize` is JS heap, not GPU. For GPU, use Drei's `<Stats>` or `three-stdlib`'s `WebGLRenderer.info.memory`.

**On Vietnamese visitors:** Identical — memory management is locale-agnostic.

**On future R3F changes:** R3F may add auto-dispose in v10+. Until then, manual.

*End of FR-PERF-005.*
