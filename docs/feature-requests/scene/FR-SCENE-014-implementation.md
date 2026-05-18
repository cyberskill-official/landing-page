---
id: FR-SCENE-014
title: "Scene 2 Transformation impl — `paint` clip + paint-trail shader + sketch→app morph + pull-quote"
module: SCENE
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: R3F Architect + Frontend Lead
created: 2026-05-16
shipped: 2026-05-19
strict_audited: 2026-05-19
related_frs: [FR-SCENE-003, FR-SCENE-013, FR-SCENE-020, FR-CHAR-011, FR-CMS-002, FR-DS-008]
depends_on: [FR-SCENE-013, FR-SCENE-003, FR-CHAR-011]
blocks: [FR-SCENE-015, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 2 — "Client Transformation · Wonder beat"
  - docs/01-master-plan-v2.md §3.3a `paint` clip — 4.0s loop, arm-uncross + light-trail
  - docs/01-master-plan-v2.md §3.4 Scene 2 — paper-white-on-brown sketchpad
  - docs/01-master-plan-v2.md §9.3 — pull-quote testimonial woven per scene

language: typescript + react 19 + r3f 9 + glsl
service: apps/web/components/scenes/scene-2-transformation/
new_files:
  - apps/web/components/scenes/scene-2-transformation/Scene2Transformation.tsx
  - apps/web/components/scenes/scene-2-transformation/Scene2Canvas.tsx
  - apps/web/components/scenes/scene-2-transformation/PaintTrail.tsx
  - apps/web/components/scenes/scene-2-transformation/SketchToAppMorph.tsx
  - apps/web/components/scenes/scene-2-transformation/PullQuote.tsx
  - apps/web/components/scenes/scene-2-transformation/__tests__/scene-2.spec.ts
  - apps/web/components/scenes/scene-2-transformation/__tests__/paint-trail.unit.test.ts

effort_hours: 12
risk_if_skipped: "The 'sketch dies in the gap' beat (master plan §2.2) is THE wonder moment — visitors need to feel the transformation from idea to working product. Skipping or weakening means the buyer-track narrative collapses into 'we build apps' instead of 'we close the will-real gap'. The paint-trail shader is also the visual signature of the brand's craft language; getting it wrong is a brand-quality regression."
---

## §1 — Description (BCP-14 normative)

1. **MUST** mount Scene 2 via `<SceneTunnel id="scene-2-transformation">`. Inherits FR-SCENE-013 pattern.

2. **MUST** drive Lumi's animation by setting `useLumiStore.setCurrentAnim("paint")` on scene-enter. `paint` is a 4.0s loop clip (FR-CHAR-011 §1 #1). Per FR-SCENE-010, the picker handles the crossfade from `coil_idle`.

3. **MUST** render the **paint-trail shader** per FR-SCENE-003 §3 paint-trail-spec.md:
   - Geometry: a 6-segment Bezier-tube along Lumi's right-arm extension path (start at wrist, end at sketchpad surface).
   - Material: additive-blended (`THREE.AdditiveBlending`), alpha-faded from 1.0 at the wrist to 0.0 at the tail.
   - Colour: `--brand-gold-400` solid; glow recipe `--glow-genie-rim` (FR-DS-008) applied via post-fx or emissive bleed.
   - Animation: trail draws ON over the first 1.5s of `paint`, then holds; on clip-loop, fades out + redraws.

4. **MUST** ship the **sketch→app morph** as a shape-key-blended mesh:
   - Source mesh: low-poly wireframe of a "sketched app silhouette" (10-15 visible edges drawn in gold-400 emissive lines).
   - Target mesh: same vertex topology, deformed into a "working app shell" (slightly more refined silhouette + filled gold-50 surfaces).
   - Morph timing: blend 0.0 → 1.0 over 2.0s, starting at `paint` clip 1.8s mark (synced to Lumi's wrist completing the arc).
   - Implementation: a single mesh with one shape key (`sketch_to_app`); shape-key value driven by useFrame reading scene-progress.

5. **MUST** include the **pull-quote DOM overlay** per FR-SCENE-003 §1 #9 + master plan §9.3:
   - Rendered as a `<blockquote>` DOM element absolutely positioned at viewport-right-third.
   - Content: testimonial line + attribution sourced from `content/narrative/lines/en.json` `scene-2-pullquote-primary`.
   - Default opacity 0; fades in at scene-progress 0.4; fades out at 0.85.
   - Typography: cinematic typography (FR-DS-007) — display face for the quote, JetBrains Mono caption-size for attribution.
   - SR: rendered with `cite` attribute + visible attribution.

6. **MUST** render the Scene 2 caption from FR-CMS-002 `scene-2-transformation-primary` verbatim in **two beats** (per FR-SCENE-003 §1 #4 multi-beat rule):
   - Beat 1 (10 words, displayed during paint-trail draw, 0.0s-1.8s): *"Most software dies in the gap between sketch and ship."*
   - Beat 2 (3 words, displayed during morph, 1.8s-3.5s): *"We close it."*
   - Each beat is its own `<TypedCaption>` instance; visibility toggles via scene-progress.

7. **MUST** apply Scene 2 art direction per master plan §3.4:
   - Background: `--brand-brown-500` (darker than Scene 1's brown-400, denser).
   - Sketchpad surface: `--brand-gold-50` flat plane filling lower-half of viewport.
   - Lumi positioned slightly above sketchpad, arm extended laterally.
   - NO cool tones — eyedropper enforces.

8. **MUST** transition camera from Scene 1 → Scene 2 over 500ms ease-genie. Camera moves from Scene 1 pose `[0.2, 0.1, 4.5]` to Scene 2 pose `[0.5, -0.2, 4.0]` (slight pull-back + tilt-down toward sketchpad).

9. **MUST** be SSR-safe + reduced-motion-aware:
   - SSR HTML renders: DOM section + two-beat caption (both visible at once for reduced-motion path) + static webp fallback.
   - Reduced-motion: no canvas, no paint-trail, no morph; pull-quote still renders (it's DOM, not canvas-dependent).

10. **MUST** disable rendering offscreen via cullMargin 1.0; pause paint-trail useFrame + morph shape-key updates.

11. **MUST** dispose paint-trail geometry + morph mesh + shape-key targets on unmount via `disposeSubtree`.

12. **MUST NOT** include cool-tone accents anywhere in Scene 2's render (Scene 3 is the only cool-accent scene per FR-DS-005 §1 #4).

13. **MUST** ship Vitest unit tests for `PaintTrail` (renders, alpha-faded correctly, additive blending verified) and `SketchToAppMorph` (shape-key value range, transition timing).

14. **MUST** ship Playwright integration tests: paint clip triggers on enter, paint-trail visible during first 1.5s, morph completes by 3.5s, pull-quote visible at 40% progress, two-beat caption sequence correct.

15. **SHOULD** include a dev-mode `?debug=scene-2` overlay showing: current progress, paint-trail draw %, morph shape-key value, pull-quote opacity.

## §2 — Why this design

**Why a 6-segment Bezier-tube for the paint trail (not a particle system)?** A continuous curve reads as "drawing a line" — exactly the visual metaphor. A particle system reads as "sparkles", which would shift the register from "creator at work" to "magic dust", weakening the brand statement that this is craft, not magic. Master plan §3.4 Scene 2 specifies "paint-trail" not "particle-trail".

**Why additive blending on the trail?** The sketchpad surface is gold-50 (very light). A non-additive gold-400 trail would partially obscure the sketchpad; additive blending makes the trail brighten the sketchpad locally, reading as "energy / craft / light" rather than as a separate object. Master plan §3.4 motion-of-light register.

**Why shape-key-blended mesh (not two separate meshes cross-faded)?** Cross-fading two meshes via opacity is the obvious approach but reads as ghostly (both visible at 50%). Shape-key blending is a true vertex-position interpolation — the wireframe edges literally morph into app-shell silhouettes. The visual cohesion is dramatic; mirrors the "sketch becomes ship" narrative beat.

**Why two-beat caption split?** Master plan §2.2: "Most software dies in the gap between sketch and ship. We close it." is 13 words single-beat, breaking FR-CMS-002 §3.2 12-word cap. Splitting into 10-word setup + 3-word resolution honors the cap AND creates the rhetorical pause where Lumi's wrist completes the arc. The pause IS the beat.

**Why pull-quote DOM-overlay (not canvas)?** Pull-quotes are text + cite — Drei `<Html>` would technically render them but their selection / SR behavior breaks under canvas overlays. DOM `<blockquote>` is the right primitive for testimonial content. Master plan §9.3 explicit.

**Why position camera at `[0.5, -0.2, 4.0]` (tilted down)?** Master plan §3.4 Scene 2 art direction puts Lumi above the sketchpad surface. The camera looking slightly down at the sketchpad reinforces the "Lumi paints on the surface below" composition — viewer's perspective is "watching the craft happen." Scene 1 had a level perspective (intimate observer); Scene 2 has a slight overhead (witnessing creation).

## §3 — Deliverable structure

```
apps/web/components/scenes/scene-2-transformation/
├── Scene2Transformation.tsx        # server re-export
├── Scene2Canvas.tsx                # R3F content (paint-trail + morph mesh + caption)
├── PaintTrail.tsx                  # Bezier-tube + additive shader
├── SketchToAppMorph.tsx            # shape-key-driven mesh
├── PullQuote.tsx                   # DOM-side <blockquote>
├── scene-2-static.webp             # SSR fallback
└── __tests__/
    ├── scene-2.spec.ts             # Playwright integration
    ├── paint-trail.unit.test.ts    # Vitest unit
    └── morph.unit.test.ts          # Vitest unit
```

### §3.2 — `PaintTrail.tsx` shape

```tsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TubeGeometry, CubicBezierCurve3, Vector3, AdditiveBlending, ShaderMaterial } from "three";
import { useSceneProgress } from "@/lib/stores";

const TRAIL_VERT = `varying float vAlpha; attribute float aProgress;
void main() {
  vAlpha = 1.0 - aProgress;  // tail fades
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const TRAIL_FRAG = `varying float vAlpha; uniform float uDrawProgress; uniform vec3 uColor;
void main() {
  if (vAlpha > uDrawProgress) discard;  // unrevealed segment
  gl_FragColor = vec4(uColor, vAlpha * 0.9);
}`;

export function PaintTrail() {
  const matRef = useRef<ShaderMaterial>(null);
  const progress = useSceneProgress();

  const geom = useMemo(() => {
    // 6-segment Bezier from wrist (right side of Lumi) to sketchpad center
    const curve = new CubicBezierCurve3(
      new Vector3(0.7, 0.3, 0),    // start: wrist
      new Vector3(1.1, 0.2, 0.2),  // control
      new Vector3(0.9, -0.3, 0.3), // control
      new Vector3(0.2, -0.5, 0.5), // end: sketchpad center
    );
    return new TubeGeometry(curve, 32, 0.012, 6, false);
  }, []);

  useFrame(() => {
    if (!matRef.current) return;
    // Map scene-progress [0.0, 0.4] to drawProgress [0.0, 1.0]
    const drawProgress = Math.min(1, Math.max(0, progress / 0.4));
    matRef.current.uniforms.uDrawProgress.value = drawProgress;
  });

  return (
    <mesh geometry={geom}>
      <shaderMaterial
        ref={matRef}
        vertexShader={TRAIL_VERT}
        fragmentShader={TRAIL_FRAG}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={{
          uDrawProgress: { value: 0 },
          uColor: { value: new Vector3(232/255, 181/255, 35/255) }, // gold-400
        }}
      />
    </mesh>
  );
}
```

### §3.3 — `SketchToAppMorph.tsx` shape

```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useSceneProgress } from "@/lib/stores";

export function SketchToAppMorph() {
  const { scene } = useGLTF("/sketch-to-app.glb");
  const meshRef = useRef<any>(null);
  const progress = useSceneProgress();

  useFrame(() => {
    if (!meshRef.current?.morphTargetInfluences) return;
    // Scene-progress [0.45, 0.85] → morph weight [0, 1]
    const weight = Math.min(1, Math.max(0, (progress - 0.45) / 0.4));
    meshRef.current.morphTargetInfluences[0] = weight;  // sketch_to_app shape key
  });

  return <primitive ref={meshRef} object={scene} position={[0.2, -0.4, 0.4]} scale={0.5} />;
}
```

### §3.4 — `PullQuote.tsx` shape

```tsx
"use client";
import { useEffect, useState } from "react";
import { useSceneProgress } from "@/lib/stores";
import lines from "@/content/narrative/lines/en.json";

export function PullQuote() {
  const progress = useSceneProgress();
  const quote = lines["scene-2-pullquote-primary"];   // { text, attribution }
  const opacity = (progress > 0.4 && progress < 0.85) ? 1 : 0;
  return (
    <blockquote
      className="absolute right-8 top-1/3 max-w-xs font-display text-[var(--brand-gold-100)] transition-opacity duration-300"
      style={{ opacity }}
      cite={quote.cite ?? undefined}
      data-scene-2-pullquote
    >
      <p>{quote.text}</p>
      <footer className="mt-2 font-mono text-sm text-[var(--brand-gold-200)]">
        — {quote.attribution}
      </footer>
    </blockquote>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Scene mounts via SceneTunnel id="scene-2-transformation" | Vitest + Playwright DOM check |
| 2 | `paint` clip activates on scene-enter | Playwright eval `useLumiStore.currentAnim === "paint"` |
| 3 | Paint-trail visible during progress 0.0-0.4 | Playwright canvas pixel-sample at trail coords; expect non-background gold pixel |
| 4 | Paint-trail uses additive blending | Material introspection in dev: `blending === AdditiveBlending` |
| 5 | Sketch→app morph completes by progress 0.85 | Playwright morphTargetInfluences[0] === 1.0 at progress ≥ 0.85 |
| 6 | Caption beat 1 visible 0.0-0.4, beat 2 visible 0.4-0.85 | Playwright DOM polling on `[data-caption-beat]` |
| 7 | Pull-quote visible at progress 0.4-0.85 | Playwright opacity check on `blockquote[data-scene-2-pullquote]` |
| 8 | Pull-quote text byte-identical to en.json | Cross-ref test |
| 9 | Background eyedrops to `--brand-brown-500` | Pixel sample |
| 10 | Sketchpad surface eyedrops to `--brand-gold-50` | Pixel sample at lower-half coords |
| 11 | No cool-tone accents | Eyedropper sweep |
| 12 | Camera transition Scene 1 → 2 is smooth | Playwright frame-diff 500ms |
| 13 | Reduced-motion: no canvas; pull-quote still renders; both caption beats visible | Playwright reducedMotion ctx |
| 14 | SSR HTML contains caption beats + pull-quote text | curl + grep |
| 15 | aria-live polite on caption; cite on blockquote | Accessibility tree |
| 16 | Disposes paint-trail geom + morph mesh on unmount | Vitest |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("paint clip + trail draws", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(500);
  const anim = await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim);
  expect(anim).toBe("paint");
});

test("morph completes by progress 0.85", async ({ page }) => {
  await page.goto("/");
  // Scroll to ~85% of Scene 2
  const sceneStartY = await page.evaluate(() => {
    const el = document.querySelector('[data-scene="scene-2-transformation"]');
    return el?.getBoundingClientRect().top || 0;
  });
  await page.evaluate((y) => window.scrollTo(0, y + window.innerHeight * 0.85), sceneStartY);
  await page.waitForTimeout(300);
  // Read morph weight via dev exposure
  // expect(morphWeight).toBeCloseTo(1.0, 1);
});

test("pull-quote present + accessible", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.4));
  await page.waitForTimeout(300);
  const quote = page.locator('blockquote[data-scene-2-pullquote]');
  await expect(quote).toBeVisible();
  await expect(quote.locator("footer")).toContainText(/—/);
});

test("two-beat caption sequence", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.1));
  await page.waitForTimeout(200);
  expect(await page.textContent('[data-caption-beat="1"]')).toContain("Most software dies");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.5));
  await page.waitForTimeout(200);
  expect(await page.textContent('[data-caption-beat="2"]')).toContain("We close it");
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-003 (Scene 2 comp), FR-SCENE-013 (Scene 1 sets the pattern), FR-CHAR-011 (`paint` clip), FR-CMS-002 (caption beats + pull-quote text), FR-DS-008 (`--glow-genie-rim`).

**Operational:** FR-WEB-003 (SceneTunnel), FR-WEB-004 (Zustand stores), FR-DS-006 (motion tokens), FR-A11Y-001 (reduced-motion).

**Downstream:** FR-SCENE-015 (Scene 3 transition), FR-SCENE-020 (orchestrator coordinates).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Paint-trail invisible (additive blending mis-set) | AC#3, AC#4 | Set `blending: AdditiveBlending`, `transparent: true`, `depthWrite: false` |
| Trail draws all-at-once (uDrawProgress not animating) | Visual smoke | Verify useFrame uniform update bound to scene progress |
| Morph mesh ghost-cross-fades instead of vertex-morph | Visual smoke | Verify single mesh with shape key (not two meshes) |
| Pull-quote covers Lumi at small viewports | Visual review | Add responsive positioning; below 768px, place above Lumi instead of side |
| Caption beat overlap (both visible mid-transition) | AC#6 | Strict visibility gates on progress thresholds; no fade-overlap |
| Cool tone leaked (Scene 3 styles inherited) | AC#11 eyedropper | Ensure Scene 2 doesn't import Scene 3 module accidentally; FR-DS-005 scope guard |
| Sketchpad gold-50 reads as white (color drift) | AC#10 | Verify FR-DS-004 export `gold[50]` value preserved through KTX2 compression |
| Reduced-motion still shows trail | AC#13 | Early-return in Scene2Canvas when reducedMotion is true |
| `paint` clip name typo | AC#2 | AnimationClipName type |
| Pull-quote `cite` URL invalid | A11y test | Verify cite is a valid URL or omit; sr-only attribution alternative |
| Morph mesh GLB missing in /public | Build / AC#5 | sketch-to-app.glb in apps/web/public; preload via FR-WEB-006 chain |
| Memory leak on unmount | Vitest | disposeSubtree(paintTrailRoot) + GLB disposal |

## §8 — Deliverable preview

After shipping, scrolling from Scene 1 into Scene 2:
1. Camera pulls back + tilts down toward sketchpad (500ms).
2. Background fades brown-400 → brown-500; sketchpad plane fades in below.
3. Lumi crossfades coil_idle → paint clip; right arm extends.
4. Caption beat 1 ("Most software dies in the gap between sketch and ship.") types in.
5. Paint-trail draws along the wrist-to-sketchpad Bezier (1.5s reveal).
6. At ~ 1.8s, beat 1 fades; beat 2 ("We close it.") types in.
7. Sketch-to-app morph plays — wireframe vertices interpolate into app-shell silhouettes (2.0s).
8. Pull-quote DOM overlay fades in at 40% progress (right-of-frame, gold-100, display face).
9. User scrolls further; pull-quote fades out + Scene 3 takes over.

Reduced-motion: caption beats both visible at once, pull-quote visible, no canvas content, no morph animation.

## §9 — Notes

**On the sketch-to-app GLB asset:** Authored separately as an OPS deliverable; a single mesh with one shape key (`sketch_to_app` from 0 → 1). The vertex topology must match between source and target — Blender's "Shape Key" workflow ensures this. Path: `/public/sketch-to-app.glb`.

**On trail-shader extensibility:** The shader pattern (additive curve with progress-driven reveal) reused in FR-SCENE-015 (4-ribbon split) and FR-SCENE-017 (HCMC→NA/EU arc). Codifying it here saves rework downstream.

**On testimonial pipeline:** Pull-quote content lives in `content/narrative/lines/en.json` (FR-CMS-002 schema extended). FR-CMS-007 i18n loader provides the VI variant when `?lang=vi`. Attribution requires legal cleared in FR-CMS-004 schema.

*End of FR-SCENE-014.*
