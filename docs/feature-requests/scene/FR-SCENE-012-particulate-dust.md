---
id: FR-SCENE-012
title: "Particulate dust — 200 instanced points (responsive: 100 tablet / 50 mobile), additive-blend + alpha-fade, reduced-motion-aware"
module: SCENE
priority: SHOULD
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 2
owner: R3F Architect
created: 2026-05-16
related_frs: [FR-SCENE-009, FR-SCENE-022, FR-A11Y-001, FR-PERF-006, FR-DS-008, FR-WEB-009]
depends_on: [FR-SCENE-009]
blocks: [FR-PERF-004]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.4 Scene 0 — "Subtle particulate dust in the warm-key-light cone"
  - docs/01-master-plan-v2.md §6.3 perf — "DPR-scaling: high-end 1.5, mid 1.0, low 0.75"
  - docs/01-master-plan-v2.md §7.3 a11y — "Particulate effects disable under reduced-motion"

language: typescript + react 19 + r3f 9 + drei
service: apps/web/components/scenes/scene-0-hero/
new_files:
  - apps/web/components/scenes/scene-0-hero/ParticulateDust.tsx
  - apps/web/components/scenes/scene-0-hero/dust-shader.ts
  - apps/web/components/scenes/scene-0-hero/__tests__/particulate-dust.unit.test.ts

effort_hours: 4
risk_if_skipped: "Scene 0 reads as static / sterile without the subtle dust motes drifting through the warm key-light. The cinematic register (master plan §3.4) softens. Perceptual quality drop is noticeable in A/B but not measurable in conversion — hence SHOULD not MUST. Skip → 'looks like a static render'."
---

## §1 — Description (BCP-14 normative)

1. **MUST** render via **InstancedMesh** or `<Points>` from Drei — exactly one draw call regardless of particle count. Per-instance attributes (position, velocity, lifetime) MUST live in a typed array, not React state.

2. **MUST** instance count per breakpoint:
   - Desktop (≥ 1024): **200 points**
   - Tablet (640-1023): **100 points**
   - Mobile (< 640): **50 points**
   - Low-memory mode (FR-WEB-009 detected): **drop to 50 regardless of viewport**

3. **MUST** use **additive blending** (`THREE.AdditiveBlending`) — dust motes brighten where they overlap the warm key-light cone, never darken. Reads as light particles, not dust shadows.

4. **MUST** alpha-fade per-particle based on `distance(particle, canvasCenter)`:
   - Center of canvas: alpha 1.0
   - Edges (50% distance from center): alpha 0.3
   - Outside 70% radius: alpha 0.0 (culled)

5. **MUST** disable entirely under `prefers-reduced-motion: reduce` (FR-A11Y-001). Component returns `null`; no GPU resource allocation.

6. **MUST** be DPR-scale-aware (FR-SCENE-022): the visual size scales with DPR but the count stays at the §1 #2 breakpoint value. Don't fight DPR-scaling.

7. **MUST NOT** allocate per-frame in useFrame — all buffers, materials, and geometries are created once at mount and reused.

8. **MUST** use the `--glow-genie-soft` rgba value as the per-particle color (FR-DS-008 token). Imported from motion-tokens module.

9. **MUST** animate motion via shader-side time uniform (per-vertex GLSL math), NOT JavaScript-side per-frame position updates. Per-particle CPU updates at 200 points × 60 fps = 12,000 ops/s — wasteful when GPU does it for free.

10. **MUST** include lifetime-loop: each particle has a `lifetime` (3-8s random), respawns at random position when expired. Looping is shader-side (`fract(time / lifetime)` pattern).

11. **MUST** ship Vitest unit tests verifying: instance count per viewport, additive blending mode, reduced-motion no-render, single draw call (R3F dev panel).

12. **SHOULD** include a dev-mode `?debug=dust` overlay showing current particle count + GPU draw-call count.

## §2 — Why this design

**Why InstancedMesh / Points (single draw call)?** Drawing 200 separate sprites = 200 draw calls = perf budget death on mobile. Instanced rendering bundles all 200 into one GPU command. Master plan §6.3 perf table requires < 100 draw calls total; particulate alone shouldn't consume 200.

**Why additive blending?** Master plan §3.4 explicit: dust motes are *light* particles in a warm cone, not *dust shadows*. Additive blending guarantees they brighten on overlap (light + light = brighter) rather than darken (alpha-over composite).

**Why shader-side animation?** JavaScript per-frame loops fight the React reconciler + main-thread budget. GPU does sin/cos/fract trivially in parallel for all 200 vertices in one shader invocation. The visual result is identical, the CPU cost is zero.

**Why disable under reduced-motion (not just slow down)?** Master plan §7.3 + WCAG 2.3.3: motion-of-bright-particles is a documented vestibular trigger. Slowing the motion doesn't help — disabling it entirely is the right behavior.

**Why low-memory drop to 50 regardless of viewport?** Low-memory detection (FR-WEB-009) triggers when `navigator.deviceMemory < 4`. These devices typically struggle with GPU shader invocations + alpha-blended overdraw. 50 particles is the perceptual threshold where dust is still visible but render cost stays manageable.

## §3 — Public surface

```ts
// ParticulateDust.tsx
"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { AdditiveBlending } from "three";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useSceneStore } from "@/lib/stores";

const COUNT_BY_VIEWPORT = { desktop: 200, tablet: 100, mobile: 50 };

export function ParticulateDust() {
  const reduced = useReducedMotion();
  const lowMemory = useSceneStore(s => s.lowMemoryMode);
  if (reduced) return null;

  const count = lowMemory ? 50 : COUNT_BY_VIEWPORT[useViewportTier()];
  const positions = useMemo(() => new Float32Array(count * 3).map(() => (Math.random() - 0.5) * 2), [count]);
  const ref = useRef<any>(null);

  useFrame(({ clock }) => {
    if (ref.current?.material) {
      ref.current.material.uniforms.uTime.value = clock.elapsedTime;  // ref mutation, NOT setState
    }
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        size={0.04}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        color="var(--glow-genie-soft)"
        // Custom shader injection for alpha-fade + lifetime
      />
    </Points>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Desktop renders 200 instances | Vitest with mocked viewport ≥1024 |
| 2 | Tablet renders 100 instances | Vitest with mocked viewport 640-1023 |
| 3 | Mobile renders 50 instances | Vitest with mocked viewport <640 |
| 4 | Low-memory mode drops to 50 regardless | Vitest with mocked `lowMemoryMode=true` |
| 5 | Additive blending mode set | Material inspection: `blending === AdditiveBlending` |
| 6 | Reduced-motion: component returns null | Vitest with mocked reduced-motion; no Points rendered |
| 7 | Single draw call | R3F dev panel + Playwright eval: `gl.info.render.calls += 1` |
| 8 | No setState in useFrame | ESLint + grep |
| 9 | Per-particle color = `--glow-genie-soft` | Shader inspection / Playwright eval |
| 10 | Alpha-fade from center (alpha 1.0) to 70% radius (alpha 0) | Visual smoke + shader unit |
| 11 | `?debug=dust` overlay renders in dev | Playwright with query param |
| 12 | Vitest unit tests pass | CI |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ParticulateDust } from "../ParticulateDust";

describe("ParticulateDust", () => {
  it("renders null under reduced-motion", () => {
    vi.mock("@/lib/use-reduced-motion", () => ({ useReducedMotion: () => true }));
    const { container } = render(<ParticulateDust />);
    expect(container.firstChild).toBeNull();
  });

  it("uses 200 instances at desktop viewport", () => {
    vi.mock("@/lib/use-viewport-tier", () => ({ useViewportTier: () => "desktop" }));
    // Inspect Points geometry count
  });

  it("uses AdditiveBlending", () => {
    // Inspect material.blending
  });
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-009 (Scene 0 host — particles render inside Scene 0's SceneTunnel).

**Operational:** FR-A11Y-001 (reduced-motion hook), FR-WEB-009 (lowMemoryMode signal), FR-DS-008 (glow-genie-soft color), FR-SCENE-022 (DPR scaling).

**Downstream blocks:** FR-PERF-004 (LCP gate verifies particles don't blow budget).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Multiple draw calls (instancing miswired) | AC#7 + R3F dev panel | Use `<Points>` from Drei, not loop of `<sprite>` |
| Per-frame JS position updates (CPU thrash) | AC#8 + perf profile | Move to shader uniform `uTime` driven motion |
| Additive blending forgotten (dust looks dark) | AC#5 + visual | Set `blending={AdditiveBlending}` explicitly |
| Reduced-motion still renders particles | AC#6 | Early-return null before any GPU allocation |
| Mobile count too high (FPS drop on cheap Android) | AC#3 + Lighthouse mobile | Verify viewport detection; lowMemoryMode triggers further cap to 50 |
| Particles culled too aggressively (visible only at center) | AC#10 + visual | Tune alpha-fade radius from 50% to 60% |
| Color drift from --glow-genie-soft | AC#9 | Import from FR-DS-008 module, not hardcoded |
| GPU resource leak on HMR | Perf | useEffect cleanup disposes Points geometry + material |
| Lifetime not respawning particles (visible "drain") | Visual smoke | Verify `fract(time / lifetime)` shader pattern |
| Particles render BEHIND Lumi (depth issue) | Visual | `depthWrite: false` + render after Lumi in scene tree |
| Dev debug overlay ships to production | Bundle inspection | Gate via NODE_ENV check |
| Viewport breakpoint thresholds drift from FR-DS-007 | AC#1-3 | Import VIEWPORT_TIERS from FR-DS-007 typography module |

## §8 — Deliverable preview

Scene 0 with dust enabled: subtle golden motes drift through the warm key-light cone. On mobile, sparser but still visible. Under reduced-motion or low-memory: completely absent (no perceived loss of "Lumi is alive"). Dev `?debug=dust` shows `count: 200 | drawCalls: 1 | culled: 67`.

## §9 — Notes

**On future enhancement:** Slice 3 could add scroll-driven dust direction (particles drift downward as user scrolls). Out of scope for slice 2.

**On VRAM cost:** 200 points × 32 bytes (position + lifetime + velocity) = 6.4 KB. Negligible. The cost is GPU shader invocations, not memory.

**On post-processing interaction:** Bloom post-pass (if FR-PERF-003 enables it) interacts beautifully with additive-blended dust. No special handling needed.

*End of FR-SCENE-012.*
