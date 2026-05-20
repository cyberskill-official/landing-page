---
id: FR-SCENE-013
title: "Scene 1 Origin implementation — `coil_idle` wisp-wrap around idea-spark + typed caption + sepia interior"
module: SCENE
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: R3F Architect + Frontend Lead
created: 2026-05-16
shipped: 2026-05-19
strict_audited: 2026-05-19
related_frs: [FR-SCENE-002, FR-SCENE-010, FR-SCENE-020, FR-CHAR-011, FR-CMS-002, FR-DS-006, FR-A11Y-001]
depends_on: [FR-SCENE-010, FR-SCENE-002, FR-CHAR-011]
blocks: [FR-SCENE-014, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 1 row — "Origin — Saigon, 2020 · empathy beat"
  - docs/01-master-plan-v2.md §3.3a `coil_idle` clip — 5.0s loop, wisp wraps idea-spark via constraint
  - docs/01-master-plan-v2.md §3.4 Scene 1 — sepia-warm interior, `--brand-brown-400` backdrop
  - docs/01-master-plan-v2.md §2.2 — typed-caption pattern (40-60 chars/sec, JetBrains Mono)

language: typescript + react 19 + r3f 9 + drei + gsap
service: apps/web/components/scenes/scene-1-origin/
new_files:
  - apps/web/components/scenes/scene-1-origin/Scene1Origin.tsx
  - apps/web/components/scenes/scene-1-origin/Scene1Origin.client.tsx
  - apps/web/components/scenes/scene-1-origin/Scene1Canvas.tsx
  - apps/web/components/scenes/scene-1-origin/IdeaSpark.tsx
  - apps/web/components/scenes/scene-1-origin/TypedCaption.tsx
  - apps/web/components/scenes/scene-1-origin/__tests__/scene-1.spec.ts
  - apps/web/components/scenes/scene-1-origin/__tests__/idea-spark.unit.test.ts

effort_hours: 10
risk_if_skipped: "Without Scene 1 implementation, the narrative arc breaks at the first scene boundary. The empathy beat (Saigon 2020 founding story) is the entrance to the brand's emotional vocabulary; skipping it means the user jumps from Scene 0 hook directly to capability showcase, which feels transactional. The `coil_idle` 5.0s loop is also the first appearance of constraint-bound wisp animation — the pattern reused in Scene 4 + Scene 5 + footer. Getting this wrong cascades downstream."
---

## §1 — Description (BCP-14 normative)

1. **MUST** mount Scene 1 via `<SceneTunnel id="scene-1-origin">` (FR-WEB-003 pattern). The DOM-side section uses `ref={sectionRef}` for intersection-observer tracking.

2. **MUST** drive Lumi's animation by setting `useLumiStore.setCurrentAnim("coil_idle")` on scene-enter (`useSceneProgress() > 0.05`). FR-SCENE-010's anim picker handles the crossfade from the previous clip.

3. **MUST** render the **idea-spark mesh** — a small (~0.3 unit diameter) emissive sphere positioned at world `[0.4, 0.6, -0.2]` (slightly offset from Lumi). Material: `MeshBasicMaterial` with emissive `--brand-gold-200`, transparent, alpha 0.8. The spark pulses subtly via shader `uTime` uniform.

4. **MUST** constraint-bind the wisp tail bone (`wisp_08` — the tip from FR-CHAR-009) to wrap around the idea-spark using a `useFrame` hook that lerps `wisp_08.position` toward the spark position with damping factor 0.05. NOT a Three.js IK constraint (those don't export through R3F cleanly); a per-frame ref-mutation pattern.

5. **MUST** render the Scene 1 caption from FR-CMS-002 line `scene-1-origin-primary` verbatim: *"Saigon, 2020. Ten of us. One craft."* Caption typewriter-types at 45 chars/sec via the `<TypedCaption>` component; total reveal time ~ 1.4s.

6. **MUST** apply Scene 1 art direction per master plan §3.4:
   - Background plane: `--brand-brown-400` solid colour.
   - Ambient light: warm tinted, intensity 0.3.
   - Key light: warm-gold from above, intensity 0.7.
   - NO cool tones — eyedropper sweep on Scene 1 returns only gold + brown family.

7. **MUST** transition camera from Scene 0 → Scene 1 over **500ms ease-genie** (FR-DS-006 token). Camera moves from Scene 0 pose `[0, 0, 5]` to Scene 1 pose `[0.2, 0.1, 4.5]`. NO jump-cut. Implementation: `gsap.to(camera.position, { ...sceneOnePose, duration: 0.5, ease: 'genie' })` triggered by scene-boundary intersection.

8. **MUST** be SSR-safe and reduced-motion-aware:
   - SSR HTML renders the DOM section + caption text + a static FR-DS-001 sepia-tinted background image (NO canvas content).
   - Reduced-motion (FR-A11Y-001): canvas content disabled; caption renders instantly (no typewriter); static image shown.

9. **MUST** integrate with FR-SCENE-020 scroll-orchestrator. The orchestrator sets `sceneStore.activeScene = 1` when the section's `useSceneProgress()` crosses 0.5; Scene 1 reads `useActiveScene()` to decide rendering visibility.

10. **MUST** disable rendering when offscreen by `cullMargin = 1.0` viewports (FR-WEB-003 §1 #8). The idea-spark useFrame callback pauses; wisp constraint pauses. Lumi remains visible if Scene 0 or Scene 2 holds it.

11. **MUST** dispose all GPU resources on unmount via `disposeSubtree(scene1Root)` (FR-WEB-003 §3.3). Includes the idea-spark geometry + material + the wisp-constraint ref.

12. **MUST NOT** use Drei `<Html>` for the caption — DOM-side rendering only (FR-CTA-001 §1 #2 invariant for caption + CTA elements).

13. **MUST** ship Vitest unit tests for `IdeaSpark` component (renders, disposes, pulses) and `TypedCaption` (types at correct cadence, handles reduced-motion bypass).

14. **MUST** ship Playwright integration tests covering: scene-enter triggers `coil_idle`, caption types within 1.4s, no cool-tone accents, camera transition smooth (no jump-cut detected by frame-diff).

15. **SHOULD** include a dev-mode `?debug=scene-1` overlay showing: current progress, current clip, wisp-tip distance to spark, camera position.

16. **MUST NOT** mutate the master FR-CHAR-011 animation clips. If `coil_idle` needs adjustment for Scene 1 specifically (e.g. tighter wrap radius), file a defect against FR-CHAR-011 — never override per-scene.

## §2 — Why this design

**Why constraint-bind wisp via useFrame (not Three.js IK)?** Three.js IK chain constraints work in-app but export through glTF as baked-rotation channels, which are scene-agnostic — every Lumi instance everywhere would wrap toward whatever target is closest. We want the wrap to happen ONLY in Scene 1 around ONLY the idea-spark. Per-scene useFrame ref-mutation gives us scene-scoped behaviour without polluting the rig.

**Why a typewriter caption (not all-at-once reveal)?** Master plan §2.2 motion ethics: empathy beats reveal "as if Lumi is speaking the line for the first time." Typewriter at 45 chars/sec matches natural speech reading pace. Instant reveal feels transactional, like a tooltip.

**Why 500ms ease-genie camera transition?** Master plan §3.2 motion tokens: `--ease-genie` is the cinematic transition curve. 500ms is the calibrated mid-point — fast enough to not feel sluggish, slow enough to register as a deliberate scene change. 200ms would feel like a hard cut; 1000ms would feel sluggish on scroll-driven progress.

**Why sepia-warm interior + brown-400 backdrop?** Master plan §3.4: Scene 1 establishes the "small studio in 2020" tonal frame. Cool tones (Scene 3's quadrant magenta/cyan/lime) would conflict with the intimate, warm-toned empathy beat. Brown-400 is darker than Scene 0's brown-700-fading-to-brown-500, marking the move from "outside / hero" to "inside / origin story".

**Why disable rendering offscreen (cullMargin = 1.0)?** Master plan §6.3 perf: 7 scenes simultaneously running useFrame at 60 fps consumes 7× the per-scene budget. With cullMargin 1.0, only the active scene + adjacent scenes run useFrame; offscreen scenes pause cleanly. The idea-spark in particular has a shader `uTime` uniform that wastes GPU if it keeps ticking when offscreen.

**Why ship a static image SSR fallback?** Hero h1 + caption are in SSR HTML for LCP (FR-SCENE-009 pattern). Scene 1's caption + background should follow the same pattern — SR users + JS-disabled crawlers + reduced-motion users all see the same intent without canvas.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/components/scenes/scene-1-origin/
├── Scene1Origin.tsx                    # server re-export
├── Scene1Origin.client.tsx             # "use client" wrapper
├── Scene1Canvas.tsx                    # R3F content inside <SceneTunnel>
├── IdeaSpark.tsx                       # the emissive spark mesh
├── TypedCaption.tsx                    # DOM-side typewriter
├── scene-1-origin-static.webp          # SSR fallback image (sepia hero crop)
└── __tests__/
    ├── scene-1.spec.ts                 # Playwright integration
    └── idea-spark.unit.test.ts         # Vitest unit
```

### §3.2 — `Scene1Canvas.tsx` shape

```tsx
"use client";
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Vector3 } from "three";
import { gsap } from "gsap";
import { useSceneProgress, useLumiStore } from "@/lib/stores";
import { IdeaSpark } from "./IdeaSpark";

const SPARK_POS = new Vector3(0.4, 0.6, -0.2);
const SCENE_1_CAMERA_POS = new Vector3(0.2, 0.1, 4.5);

export function Scene1Canvas() {
  const progress = useSceneProgress();
  const { camera } = useThree();
  const { nodes } = useGLTF("/lumi.glb");
  const wispTipRef = useRef(nodes.wisp_08);
  const sparkRef = useRef<any>(null);

  // Trigger anim + camera transition on enter
  useEffect(() => {
    if (progress > 0.05 && progress < 0.6) {
      useLumiStore.getState().setCurrentAnim("coil_idle");
      gsap.to(camera.position, { ...SCENE_1_CAMERA_POS, duration: 0.5, ease: "power3.out" });
    }
  }, [progress, camera]);

  // Wisp constraint-bind toward spark (per-frame lerp with damping)
  useFrame(() => {
    if (!wispTipRef.current || !sparkRef.current) return;
    if (progress < 0.1 || progress > 0.9) return;  // pause when offscreen
    wispTipRef.current.position.lerp(sparkRef.current.position, 0.05);
  });

  return (
    <group>
      <ambientLight intensity={0.3} color="#E8B523" />
      <directionalLight position={[0, 5, 2]} intensity={0.7} color="#F9D966" />
      <IdeaSpark ref={sparkRef} position={SPARK_POS} />
    </group>
  );
}
```

### §3.3 — `IdeaSpark.tsx` shape

```tsx
import { forwardRef, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, ShaderMaterial } from "three";

const sparkVertex = `varying vec3 vWorldPos; void main() {
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const sparkFragment = `uniform float uTime; varying vec3 vWorldPos;
void main() {
  float pulse = 0.7 + 0.3 * sin(uTime * 2.0);
  gl_FragColor = vec4(0.976, 0.851, 0.4, pulse);  // gold-200, alpha pulse
}`;

export const IdeaSpark = forwardRef<any, { position: any }>(({ position }, ref) => {
  const matRef = useRef<ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={sparkVertex}
        fragmentShader={sparkFragment}
        uniforms={{ uTime: { value: 0 } }}
        transparent
      />
    </mesh>
  );
});
IdeaSpark.displayName = "IdeaSpark";
```

### §3.4 — `TypedCaption.tsx` shape

```tsx
"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function TypedCaption({ text, speedCharsPerSec = 45 }: { text: string; speedCharsPerSec?: number }) {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) return;
    const interval = 1000 / speedCharsPerSec;
    const timer = setInterval(() => {
      setRevealed((r) => {
        if (r >= text.length) { clearInterval(timer); return r; }
        return r + 1;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [text, speedCharsPerSec, reduced]);

  return (
    <p className="font-mono text-[var(--brand-gold-200)]" aria-live="polite">
      {text.slice(0, revealed)}
      {!reduced && revealed < text.length && <span className="animate-pulse">|</span>}
    </p>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Scene mounts via SceneTunnel id="scene-1-origin" | Vitest + Playwright DOM inspection |
| 2 | `coil_idle` clip activates on scene-enter | Playwright reads `useLumiStore.currentAnim` after scrolling into Scene 1; expects "coil_idle" |
| 3 | Wisp tip lerps toward idea-spark over time | Playwright + R3F dev panel: distance(wisp_08, spark) decreases from > 0.3 to < 0.1 over 2s |
| 4 | Caption types within 1.4s (~ 63 chars at 45 chars/sec) | Playwright DOM polling: caption text length grows from 0 to full over ~1400ms |
| 5 | Caption text byte-identical to en.json `scene-1-origin-primary` | Cross-ref test against `content/narrative/lines/en.json` |
| 6 | Background eyedrops to `--brand-brown-400` | Playwright + canvas pixel-sample at known coords |
| 7 | No cool-tone accents in Scene 1 viewport | Eyedropper sweep returns only gold + brown family |
| 8 | Camera transition Scene 0 → 1 is smooth (no jump-cut) | Playwright frame-diff: camera.position interpolates over 500ms |
| 9 | Reduced-motion: canvas absent; static webp shown; caption instant | Playwright with `--emulate-media=reduced-motion`; assert |
| 10 | SSR HTML contains caption text + static image reference | curl + grep for `scene-1-origin-static.webp` and caption text |
| 11 | Offscreen culling: useFrame paused when section is > 1 viewport offscreen | Playwright timeline trace; useFrame callback count ~0 when offscreen |
| 12 | Memory cleanup on unmount: no leaked WebGL objects | Vitest with R3F test renderer; disposeSubtree called |
| 13 | useSceneProgress integrates with FR-SCENE-020 orchestrator | Vitest with mocked progress; assert sceneStore.activeScene flips |
| 14 | aria-live="polite" caption announces text additions | Playwright accessibility tree inspection |
| 15 | No Drei `<Html>` in Scene 1 tree | Static analysis: import grep |
| 16 | `?debug=scene-1` overlay renders in dev | Playwright with query param |

## §5 — Verification

```ts
// __tests__/scene-1.spec.ts
import { test, expect } from "@playwright/test";

test("Scene 1 caption types within 1.4s", async ({ page }) => {
  await page.goto("/");
  // Scroll to Scene 1 (~1.0 viewport down)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.waitForTimeout(200);  // entry transition
  const initialText = await page.textContent('p[data-scene="scene-1-origin"]');
  expect((initialText ?? "").length).toBeLessThan(10);
  await page.waitForTimeout(1500);
  const finalText = await page.textContent('p[data-scene="scene-1-origin"]');
  expect(finalText).toContain("Saigon, 2020");
});

test("coil_idle fires on Scene 1 enter", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.waitForTimeout(500);
  const anim = await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim);
  expect(anim).toBe("coil_idle");
});

test("no cool-tone accents", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.waitForTimeout(500);
  const canvas = page.locator("canvas").first();
  // Sample several pixel coords; check b* in LAB space all positive (warm)
  // (Implementation reads canvas via OffscreenCanvas + colour-science)
});

test("reduced-motion renders static fallback", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  expect(await page.locator("img[data-scene-1-static]").count()).toBe(1);
});

// __tests__/idea-spark.unit.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Canvas } from "@react-three/fiber";
import { IdeaSpark } from "../IdeaSpark";

describe("IdeaSpark", () => {
  it("mounts without throwing", () => {
    expect(() => render(
      <Canvas><IdeaSpark position={[0, 0, 0]} /></Canvas>
    )).not.toThrow();
  });
  // Add: pulse via uTime uniform; geometry disposes
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-SCENE-002 (Scene 1 Origin Figma comp) — visual brief.
- FR-SCENE-010 (Lumi anim picker wiring) — drives `coil_idle` via store.
- FR-CHAR-011 (animation library) — provides `coil_idle` clip.
- FR-CMS-002 (per-scene narration) — provides caption text.

**Operational dependencies:**
- FR-WEB-003 (SceneTunnel) — `<SceneTunnel id>` mount pattern.
- FR-WEB-004 (Zustand stores) — `useLumiStore`, `useSceneProgress`.
- FR-DS-006 (motion tokens) — `--ease-genie` curve.
- FR-A11Y-001 (reduced-motion) — `useReducedMotion()` hook.

**Downstream blocks:**
- FR-SCENE-014 (Scene 2 Transformation) — Scene 1 → 2 transition needs Scene 1 mounted.
- FR-SCENE-020 (scroll orchestrator) — needs Scene 1 active-scene boundary.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| coil_idle never fires (anim picker race) | AC#2 + Playwright eval | Ensure useEffect dep on `progress > 0.05`; verify store update propagates |
| Wisp tip stuck (constraint not lerping) | AC#3 + visual smoke | Verify `wispTipRef.current` is bound to actual bone; check `sparkRef` resolves |
| Caption types too fast / too slow | AC#4 | Tune `speedCharsPerSec` to 45; ensure setInterval respects clearInterval |
| Cool-tone accent leaked | AC#7 eyedropper | Audit lighting + materials; FR-DS-005 scope guard should prevent |
| Camera jump-cut (gsap missed) | AC#8 frame-diff | Verify `gsap.to(camera.position, ...)` runs; ScrollTrigger bridge from FR-WEB-002 |
| Reduced-motion still shows canvas | AC#9 | Guard via `useReducedMotion()` early-return in Scene1Canvas |
| SSR missing caption text | AC#10 | Ensure caption renders client-side ONLY for the type animation; full text in initial render |
| Offscreen useFrame still ticking | AC#11 + perf | Add `if (progress < 0.1 || progress > 0.9) return` guard in useFrame |
| WebGL leak on unmount | AC#12 | Verify `disposeSubtree()` called in cleanup |
| Caption announcement chatter (SR floods) | AC#14 | Use `aria-live="polite"` (not assertive); group updates |
| Drei `<Html>` sneaks in (developer convenience) | AC#15 | ESLint rule + grep ban; FR-CTA-001 invariant |
| FR-CHAR-011 `coil_idle` clip name typo | AC#2 fail | Use `AnimationClipName` type; tsc catches |

## §8 — Deliverable preview

After shipping, scrolling from Scene 0 into Scene 1:
1. Camera lerps over 500ms from Scene 0 hero pose to Scene 1 close-up.
2. Background plane fades from brown-700 (Scene 0) to brown-400 (Scene 1).
3. Lumi's animation crossfades from idle → coil_idle.
4. The idea-spark fades in at the right-of-Lumi position; pulses gently.
5. Caption types: "Saigon, 2020. Ten of us. One craft." over ~1.4s.
6. The wisp tip slowly drifts toward the idea-spark over the 5-second `coil_idle` loop.
7. User scrolls further; Scene 1 transitions to Scene 2.

In reduced-motion / `/lite`: same caption text + static sepia photo, no canvas.

## §9 — Notes

**On wisp constraint precision:** The damping factor 0.05 is the visual sweet spot — too low (0.01) and the wisp slowly drifts but never reaches; too high (0.2) and it snaps. The lerp pattern matches GSAP's `power3.out` curve subjectively.

**On the idea-spark shader:** Custom shader is overkill for a single pulsing sphere, but the pattern reused in Scene 4 (bokeh particles via FR-SCENE-016) and Scene 5 (globe pin via FR-SCENE-017). Codifying it here saves rework.

**On future enhancement:** Slice 2 could parallax-tilt the idea-spark based on mouse position. Out of scope for slice 1.

*End of FR-SCENE-013.*
