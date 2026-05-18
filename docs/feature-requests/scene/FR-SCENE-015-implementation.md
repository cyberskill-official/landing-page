---
id: FR-SCENE-015
title: "Scene 3 Capabilities impl — `split_to_4` anim + 4 satellites at 12/3/6/9 + cool-tone discipline"
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
related_frs: [FR-SCENE-004, FR-SCENE-014, FR-SCENE-020, FR-CHAR-011, FR-CMS-002, FR-DS-005]
depends_on: [FR-SCENE-014, FR-SCENE-004, FR-CHAR-011]
blocks: [FR-SCENE-016, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 3 — "Capability Showcase · Confidence beat"
  - docs/01-master-plan-v2.md §3.3a `split_to_4` clip — 2.5s no-loop; body fades + wisp splits
  - docs/01-master-plan-v2.md §3.4 Scene 3 — only scene with cool-tone accents
  - docs/01-master-plan-v2.md §9.3 — logos-strip social-proof slot

language: typescript + react 19 + r3f 9
service: apps/web/components/scenes/scene-3-capabilities/
new_files:
  - apps/web/components/scenes/scene-3-capabilities/Scene3Capabilities.tsx
  - apps/web/components/scenes/scene-3-capabilities/Scene3Canvas.tsx
  - apps/web/components/scenes/scene-3-capabilities/Satellite.tsx
  - apps/web/components/scenes/scene-3-capabilities/WispRibbon.tsx
  - apps/web/components/scenes/scene-3-capabilities/LogosStrip.tsx
  - apps/web/components/scenes/scene-3-capabilities/__tests__/scene-3.spec.ts

effort_hours: 14
risk_if_skipped: "Scene 3 is the confidence beat where the brand makes its capability claim. Skipping or weakening means the four-hands-of-the-same-craft message muddies; visitors may bounce thinking 'just another agency'. The cool-accent scoping is also the only place in the cinematic where cool tones appear — getting it wrong leaks cool palette into other scenes, breaking the warm-cinematic register."
---

## §1 — Description (BCP-14 normative)

1. **MUST** mount Scene 3 via `<SceneTunnel id="scene-3-capabilities">`.

2. **MUST** drive Lumi's animation by setting `useLumiStore.setCurrentAnim("split_to_4")` on scene-enter. `split_to_4` is a 2.5s no-loop clip — at completion, the picker (FR-SCENE-010) reverts to `idle` (or `coil_idle` if user scrolls back).

3. **MUST** apply `data-scene="scene-3"` attribute on the scene's section element. This activates the FR-DS-005 cool-accent CSS scope; cool-tint variables for the 3 satellites are scoped per-scene.

4. **MUST** render **exactly 4 Satellite meshes** at the documented clock positions per FR-SCENE-004 §1 #2:
   - 12 o'clock (top, world-y +2): **React** — cyan tint `#7DD3FC`
   - 3 o'clock (right, world-x +2): **Three.js** — magenta tint `#E879F9`
   - 6 o'clock (bottom, world-y -2): **AI / RAG** — lime tint `#84CC16`
   - 9 o'clock (left, world-x -2): **Design Systems** — warm gold `--brand-gold-400` (home base, NOT cool)

5. **MUST** render **4 WispRibbon meshes** during the `split_to_4` clip — Lumi's wisp tail visually splits into 4 ribbons that orbit each Satellite:
   - Each ribbon: 8-segment Bezier curve from Lumi's wisp_08 bone to its target Satellite.
   - Ribbon timing per FR-SCENE-004 satellite-orbits.md: ribbons emerge at clip 0.4s, reach targets at 2.0s, hold until clip ends at 2.5s.
   - Ribbon non-crossing constraint: the 4 ribbons orbit clockwise from their start positions; AC#10 verifies via path-intersection check.

6. **MUST** include the Scene 3 caption from FR-CMS-002 `scene-3-capabilities-primary` verbatim. The 16-word source line is split into 2 beats per FR-CMS-002 multi-beat rule: *"React, Three.js, AI, design systems —"* + *"four hands of the same craft."*

7. **MUST** include the **logos-strip DOM overlay** per FR-SCENE-004 §1 #8 + master plan §9.3:
   - 6 client logos rendered in grayscale-on-dark.
   - Logos sourced from FR-CMS-004 Sanity `CaseStudy.logo` field; anonymizable as "industry: fintech/healthtech" if NDA per master plan §1.5.
   - Position: bottom-third of viewport, horizontal strip.
   - aria-label: "Selected client industries"; each logo has `<img alt>` with the industry label.

8. **MUST** keep Lumi visibly warm-gold throughout — Lumi's body, hood, face, and the 9-o'clock home-base Satellite all use only gold + brown family. The cool tints apply ONLY to the 3 cool-position Satellites (12/3/6 o'clock). Eyedropper enforces on AC#11.

9. **MUST** transition camera Scene 2 → 3 over 500ms ease-genie. Camera moves from Scene 2 pose `[0.5, -0.2, 4.0]` to Scene 3 pose `[0, 0, 6.0]` (pulled back to fit all 4 satellites).

10. **MUST** disable rendering offscreen (cullMargin 1.0); pause Satellite + WispRibbon useFrame callbacks.

11. **MUST** be SSR-safe + reduced-motion-aware:
    - SSR HTML: caption + logos-strip (DOM elements, no canvas).
    - Reduced-motion: no Satellite meshes, no Ribbon animation; static webp showing the 4-satellite layout.

12. **MUST** dispose all 4 Satellite + 4 Ribbon geometries + materials on unmount.

13. **MUST NOT** introduce a 5th capability satellite. The number 4 is brand-anchor copy (master plan §1.2 "four hands"); any change requires master-plan amendment per AGENTS.md §16.2.

14. **MUST** ship Vitest unit tests for `Satellite` (renders with correct tint) and `WispRibbon` (Bezier curve correct, non-crossing).

15. **MUST** ship Playwright integration tests: `split_to_4` triggers, 4 Satellites at correct world positions, 3 cool-tinted + 1 gold, no cool tones leak, logos-strip present + accessible.

16. **SHOULD** include `?debug=scene-3` overlay showing per-satellite distance + ribbon-target-reached %.

## §2 — Why this design

**Why exactly 4 capability satellites?** Master plan §1.2 + Scene 3 caption: "four hands of the same craft." The number is brand-proof. Showing 3 or 5 weakens the line.

**Why clock-position layout (not radial random)?** Predictable spatial layout aids comprehension. 12/3/6/9 is the canonical orbit pattern. Each Satellite has a unique "address" — React always at top, regardless of viewport. Radial randomization would feel chaotic on a scene meant to convey confidence.

**Why 3 cool-tinted + 1 gold?** Cool tones (cyan/magenta/lime) read as "tech / engineering / data" — natural fit for React/Three.js/AI. Design Systems is the craft anchor — keeping it warm-gold says "Design Systems is home; the other three are how we ship." It's brand-positioning visual.

**Why constrain cool tones via `data-scene="scene-3"`?** FR-DS-005 established CSS-cascade scoping. Without the scope, cool-tint variables leak globally; Scenes 4-6 would inherit cyan/magenta/lime by accident.

**Why 8-segment Bezier ribbons?** Consistency with FR-SCENE-014 paint-trail (6-segment) and FR-SCENE-017 arc (16-segment). The Bezier-curve pattern is the brand's craft language across scenes.

**Why logos-strip grayscale-on-dark?** Logos in colour fight with the cool-tone Satellites + warm Lumi. Grayscale neutralizes them so social proof reads as background context.

## §3 — Deliverable structure

```
apps/web/components/scenes/scene-3-capabilities/
├── Scene3Capabilities.tsx          # server re-export
├── Scene3Canvas.tsx                # R3F content
├── Satellite.tsx                   # individual satellite mesh + label
├── WispRibbon.tsx                  # Bezier-tube ribbon (additive blend)
├── LogosStrip.tsx                  # DOM logos overlay
├── scene-3-static.webp             # SSR fallback
└── __tests__/
    ├── scene-3.spec.ts             # Playwright integration
    ├── satellite.unit.test.ts      # Vitest unit
    └── wisp-ribbon.unit.test.ts    # Vitest unit
```

### §3.2 — `Satellite.tsx` shape

```tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

type SatelliteProps = {
  position: [number, number, number];
  label: string;
  tint: string;
  isHomeBase?: boolean;
};

export function Satellite({ position, label, tint, isHomeBase }: SatelliteProps) {
  const ref = useRef<any>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.2 + position[0]) * 0.08;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={tint}
          emissive={tint}
          emissiveIntensity={isHomeBase ? 0.6 : 0.4}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      <Text position={[0, -0.55, 0]} fontSize={0.14} color={isHomeBase ? "#FCEAA8" : tint} anchorX="center">
        {label}
      </Text>
    </group>
  );
}
```

### §3.3 — `WispRibbon.tsx` shape

```tsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TubeGeometry, CubicBezierCurve3, Vector3, AdditiveBlending, ShaderMaterial } from "three";
import { useSceneProgress } from "@/lib/stores";

const RIBBON_VERT = `varying float vSeg; attribute float aSeg;
void main() { vSeg = aSeg; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RIBBON_FRAG = `varying float vSeg; uniform float uDrawProgress; uniform vec3 uColor;
void main() {
  if (vSeg > uDrawProgress) discard;
  gl_FragColor = vec4(uColor, (1.0 - vSeg) * 0.85);
}`;

export function WispRibbon({ startWorldPos, targetWorldPos, colour, delayOffset = 0 }: {
  startWorldPos: Vector3; targetWorldPos: Vector3; colour: Vector3; delayOffset?: number;
}) {
  const matRef = useRef<ShaderMaterial>(null);
  const progress = useSceneProgress();
  const geom = useMemo(() => {
    const control1 = startWorldPos.clone().lerp(targetWorldPos, 0.3).add(new Vector3(0, 0.5, 0));
    const control2 = startWorldPos.clone().lerp(targetWorldPos, 0.7).add(new Vector3(0, -0.3, 0));
    return new TubeGeometry(new CubicBezierCurve3(startWorldPos, control1, control2, targetWorldPos), 32, 0.018, 6, false);
  }, [startWorldPos, targetWorldPos]);

  useFrame(() => {
    if (!matRef.current) return;
    const local = Math.max(0, (progress - 0.15 - delayOffset) / 0.55);
    matRef.current.uniforms.uDrawProgress.value = Math.min(1, local);
  });

  return (
    <mesh geometry={geom}>
      <shaderMaterial
        ref={matRef}
        vertexShader={RIBBON_VERT}
        fragmentShader={RIBBON_FRAG}
        transparent depthWrite={false} blending={AdditiveBlending}
        uniforms={{ uDrawProgress: { value: 0 }, uColor: { value: colour } }}
      />
    </mesh>
  );
}
```

### §3.4 — Scene3Canvas composition

```tsx
const SATELLITES = [
  { id: "react",   pos: [ 0,  2,  0] as [number, number, number], label: "React",          tint: "#7DD3FC" },
  { id: "three",   pos: [ 2,  0,  0] as [number, number, number], label: "Three.js",       tint: "#E879F9" },
  { id: "ai",      pos: [ 0, -2,  0] as [number, number, number], label: "AI / RAG",       tint: "#84CC16" },
  { id: "ds",      pos: [-2,  0,  0] as [number, number, number], label: "Design Systems", tint: "#E8B523", isHomeBase: true },
];
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Scene mounts via SceneTunnel id="scene-3-capabilities" | Vitest + Playwright DOM check |
| 2 | `split_to_4` clip activates on scene-enter | Playwright eval `currentAnim === "split_to_4"` |
| 3 | Exactly 4 Satellites at clock positions 12/3/6/9 | Eval Satellite count + world positions |
| 4 | React satellite tint = `#7DD3FC` (cyan) | Pixel sample at 12 o'clock |
| 5 | Three.js satellite tint = `#E879F9` (magenta) | Pixel sample at 3 o'clock |
| 6 | AI satellite tint = `#84CC16` (lime) | Pixel sample at 6 o'clock |
| 7 | Design Systems satellite tint = `#E8B523` (warm gold) | Pixel sample at 9 o'clock |
| 8 | 4 WispRibbons render during split_to_4 | Canvas-pixel check at ribbon midpoints |
| 9 | Ribbons stagger emerge (each 0.05s offset) | Shader-uniform inspection |
| 10 | Ribbons do not cross visually | Path-intersection check |
| 11 | No cool-tone accents on Lumi or background | Pixel sample; expect gold-family only |
| 12 | Background eyedrops to `--brand-brown-500` | Pixel sample |
| 13 | Caption beats sequence correct (2-beat split) | DOM polling |
| 14 | Logos-strip overlay visible bottom-third | Playwright + a11y tree (alt + aria-label) |
| 15 | Reduced-motion: no Satellites/Ribbons; static webp; logos visible | Playwright reducedMotion ctx |
| 16 | Disposes 4 Satellite + 4 Ribbon resources on unmount | Vitest |
| 17 | data-scene attribute = "scene-3" on section | DOM inspection |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("split_to_4 fires + 4 satellites render", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3));
  await page.waitForTimeout(500);
  const anim = await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim);
  expect(anim).toBe("split_to_4");
  const satelliteCount = await page.evaluate(() =>
    (window as any).__sceneDebug?.satellites?.length ?? 0
  );
  expect(satelliteCount).toBe(4);
});

test("DS satellite warm gold; others cool", async ({ page }) => {
  // Sample canvas pixels at the 4 clock positions; LAB-convert; verify b* signs
});

test("Lumi remains warm; cool tones constrained", async ({ page }) => {
  // Sample Lumi-body coords; assert b* > 0 across all
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-004 (Scene 3 comp), FR-CHAR-011 (split_to_4 clip), FR-CMS-002 (caption), FR-DS-005 (cool-accent scope), FR-CMS-004 (Sanity logos).

**Operational:** FR-WEB-003, FR-WEB-004, FR-DS-006, FR-A11Y-001.

**Downstream:** FR-SCENE-016 (Scene 4), FR-SCENE-020 (orchestrator).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| 5th satellite slipped in (stakeholder request) | AC#3 count + master-plan §16.2 gate | Reject PR; require amendment |
| Wrong clock position (drift from spec) | AC#3 world-pos check | Restore React top, Three.js right, AI bottom, DS left |
| Cool tone bleeds onto Lumi | AC#11 | Verify FR-DS-005 data-scene scope; gold tokens only |
| Cool tone bleeds onto Scene 4+ | Eyedropper sweep on Scene 4 | Verify `data-scene="scene-3"` scopes properly |
| 4 ribbons cross visually | AC#10 + visual smoke | Stagger Bezier control points; verify non-intersection |
| `split_to_4` doesn't return to idle | AC#2 + mixer.finished | FR-SCENE-010 default-to-idle handles |
| Logos-strip too prominent | AC#14 + founder review | Grayscale + opacity 0.5; bottom-third |
| Logo without alt text | a11y test fail | All `<img>` must have alt; NDA → industry placeholder |
| Reduced-motion still shows Satellites | AC#15 | Early-return Scene3Canvas under reducedMotion |
| Memory leak across satellites on remount | Vitest | disposeSubtree on each |
| Caption single-beat (16 words) | FR-CMS-002 cap | Split into 2 beats per multi-beat rule |
| Logos SSR slow LCP | Lighthouse | Use ISR (FR-CMS-005) for logos; 1-hour cache |

## §8 — Deliverable preview

After shipping, scrolling from Scene 2 into Scene 3:
1. Camera pulls back to fit all 4 satellites (500ms).
2. Background fades to brown-500.
3. Lumi crossfades paint → split_to_4. Body fades semi-transparent.
4. 4 Wisp Ribbons emerge from wisp_08, stagger-emerging over 0.4s.
5. Each ribbon traces a Bezier curve to its target Satellite.
6. By 2.0s, all 4 ribbons reach satellites; Satellites pulse on contact.
7. Logos-strip fades in bottom-third (grayscale 6 logos).
8. Caption types 2-beat: "React, Three.js, AI, design systems —" / "four hands of the same craft."
9. At 2.5s, clip ends; auto-transitions to idle.
10. User scrolls; Scene 4 takes over.

Reduced-motion: static layout, caption + logos-strip visible, no animation.

## §9 — Notes

**On satellite count brand-anchor:** "Ten of us" + "Four hands" are the two brand-proof numbers. Both MUST-cap-respected. Future capability changes require master-plan amendment + caption update.

**On ribbon-shader reuse:** Structurally similar to FR-SCENE-014 paint-trail and FR-SCENE-017 arc-shader. Consolidating into `lib/r3f-shaders/bezier-progress-tube.ts` factory is slice-2 amendment territory.

**On dev-mode satellite click:** Slice 2 could enable click-on-satellite → deeper capability copy panel. Out of scope; deeper detail lives in `/work/[slug]` per FR-CMS-006.

*End of FR-SCENE-015.*
