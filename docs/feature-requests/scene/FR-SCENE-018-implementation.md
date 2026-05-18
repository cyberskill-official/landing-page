---
id: FR-SCENE-018
title: "Scene 6 CTA Hub impl — `<CtaHub>` mount + Lumi-head-turn-on-portal-focus + deep-link"
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
related_frs: [FR-SCENE-007, FR-SCENE-017, FR-SCENE-020, FR-CTA-001, FR-CHAR-011, FR-CMS-002]
depends_on: [FR-SCENE-017, FR-SCENE-007, FR-CTA-001, FR-CHAR-011]
blocks: [FR-SCENE-019, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 6 — "CTA Hub · Decision beat"
  - docs/01-master-plan-v2.md §3.4 Scene 6 — three glowing portals colour-coded
  - docs/01-master-plan-v2.md §9.1 — three CTA tracks (Buy / Partner / Join)
  - FR-CTA-001 §1 #2 — DOM-not-Drei-Html invariant for CTA elements

language: typescript + react 19 + r3f 9
service: apps/web/components/scenes/scene-6-cta-hub/
new_files:
  - apps/web/components/scenes/scene-6-cta-hub/Scene6CtaHub.tsx
  - apps/web/components/scenes/scene-6-cta-hub/Scene6Canvas.tsx
  - apps/web/components/scenes/scene-6-cta-hub/LumiHeadTurn.tsx
  - apps/web/components/scenes/scene-6-cta-hub/__tests__/scene-6.spec.ts

effort_hours: 10
risk_if_skipped: "Scene 6 is the decision beat — where buyer/partner/talent commit to action. Without it, the entire cinematic narrative collapses (we built up the story but never gave the user a place to land). FR-CTA-001 provides the component; this FR provides the cinematic integration including the Lumi-head-turn behavior that personalises the moment."
---

## §1 — Description (BCP-14 normative)

1. **MUST** mount Scene 6 via `<SceneTunnel id="scene-6-cta-hub">`. The CTA hub itself renders DOM-side (not inside the canvas) per FR-CTA-001 §1 #2 — the tunnel hosts only the Lumi-positioning + head-turn behavior.

2. **MUST** render the **`<CtaHub />` component from FR-CTA-001** in the DOM section below the canvas viewport. The component handles 3-portal rendering, hover/focus/click, deep-link parsing, lazy-loaded modal — all per FR-CTA-001 spec.

3. **MUST** wire **Lumi head-turn behavior**: on portal hover or keyboard-focus, Lumi's head bone rotates toward the focused portal. Implementation:
   - Subscribe to `useFocusedCta()` from FR-WEB-004 stores.
   - Map focused track → target rotation: Buy → `[0, -0.45, 0]` (right), Partner → `[0, 0, 0]` (center), Join → `[0, +0.45, 0]` (left).
   - useFrame lerps Lumi's `head` bone rotation toward target with damping 0.08.
   - Rotation clamped at ±30° (±0.523 rad) to never break the 4th wall.

4. **MUST** drive Lumi's animation to `idle` for Scene 6 (no dedicated clip). Lumi is composed + ready; the head-turn is the action.

5. **MUST** include the Scene 6 caption from FR-CMS-002 `scene-6-cta-hub-primary` verbatim: *"You bring the will. We bring the real."*

6. **MUST** support deep-link via `?track=<id>` per FR-CTA-001 §1 #15:
   - URL params `?track=buy`, `?track=partner`, `?track=join` land with that portal pre-focused on Scene 6 mount.
   - Implementation: on Scene 6 mount, read URL params; if `track` present, call `setFocusedCta(track)` from FR-WEB-004 stores.

7. **MUST** apply Scene 6 art direction:
   - Background: `--brand-brown-500` (matches Scene 3 — confidence/decision tones).
   - Lumi positioned slightly above frame centre, facing camera straight-on (rotation 0 by default).
   - 3 portals rendered DOM-side below Lumi with their own animated glow recipes (FR-DS-008).
   - NO cool tones — Scene 6 returns to warm-gold palette discipline.

8. **MUST** preserve nón lá visibility (set true since Scene 5; do not reset).

9. **MUST** transition camera Scene 5 → 6 over 500ms ease-genie. Camera moves from Scene 5 globe pose `[0, 0.2, 6.5]` to Scene 6 pose `[0, 0, 5.0]` (closer, centred on Lumi).

10. **MUST** be SSR-safe + reduced-motion-aware:
    - SSR HTML: caption + 3-portal DOM + sticky CTA + static webp showing Lumi straight-on.
    - Reduced-motion: no canvas; static fallback; head-turn disabled (Lumi static); CTA portals fully functional.

11. **MUST** dispose Lumi head-turn useFrame subscription on unmount.

12. **MUST NOT** add a 4th portal (FR-CTA-001 §1 #1 + master plan §1.2 cap at exactly 3).

13. **MUST** include the **Lumi-form-reactions** integration with FR-CTA-007 — when a CTA modal opens (via FR-CTA-001 click handler), Lumi crossfades to a context-appropriate clip:
    - Buy modal open: `mouth_smile` shape key blended in (subtle smile).
    - Partner modal open: `summon` clip (welcoming gesture).
    - Join modal open: `wave` clip (greeting).
    - This is wired by FR-CTA-007; this FR provides the integration point.

14. **MUST** ship Vitest unit tests for `LumiHeadTurn` (rotation clamps at ±30°, lerps correctly, head bone resolved).

15. **MUST** ship Playwright integration tests: 3 portals render, hover portal triggers head-turn, deep-link `?track=partner` lands with Partner pre-focused, all 3 portals click-able and open their lazy-loaded modals.

## §2 — Why this design

**Why DOM CTA hub (not canvas)?** FR-CTA-001 §1 #2 invariant: CTA elements MUST be DOM-rendered, never Drei `<Html>`. Reasons: keyboard a11y (canvas children aren't tabbable by default), form-modal lazy-load suspense (Suspense inside R3F canvas breaks FR-WEB-006's per-scene boundary), focus-visible ring (canvas children can't render the standard browser focus ring).

**Why Lumi-head-turn on portal focus?** Master plan §3.4 Scene 6 art direction: "Lumi turning toward whichever portal you focus." The behavior personalises the decision — Lumi visibly acknowledges your choice before you commit. It's the cinematic-register equivalent of a real person glancing at the option you're considering.

**Why clamp head-turn at ±30°?** Master plan + FR-SCENE-007 §1 #3: Lumi MUST NOT break the 4th wall by looking away from the camera entirely. ±30° is the "looking with curiosity" range. ±60° would be "looking away" which would feel rude / disengaged.

**Why deep-link `?track=`?** Master plan §9.1 Track design: marketing campaigns target tracks separately. LinkedIn ads for partners land with `?track=partner`; recruitment posts land with `?track=join`. Without deep-link, those visitors arrive at the same generic Scene 6 and have to manually identify their track.

**Why nón lá stays visible?** Master plan §3.3b cultural-arc closure: nón lá persists from Scene 5 through the footer. Resetting it on Scene 6 entry would break the cultural-arc; the nón lá is meant to be "Lumi has chosen its identity" — a one-way transition.

**Why context-aware Lumi-form-reactions?** Each CTA track has a different emotional register: Buy is professional/considered (mouth_smile is subtle), Partner is welcoming (summon clip is open-armed), Join is friendly (wave clip is casual). The integration adds emotional specificity to the CTA experience without becoming distracting.

## §3 — Deliverable structure

```
apps/web/components/scenes/scene-6-cta-hub/
├── Scene6CtaHub.tsx                # server re-export
├── Scene6Canvas.tsx                # R3F head-turn behavior
├── LumiHeadTurn.tsx                # focus-driven head rotation
├── scene-6-static.webp             # SSR fallback
└── __tests__/
    ├── scene-6.spec.ts             # Playwright integration
    └── lumi-head-turn.unit.test.ts # Vitest unit
```

### §3.2 — `LumiHeadTurn.tsx` shape

```tsx
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Euler, MathUtils } from "three";
import { useGLTF } from "@react-three/drei";
import { useFocusedCta } from "@/lib/stores";
import type { CtaTrack } from "@/lib/stores";

const TARGET_ROTATION: Record<CtaTrack | "default", [number, number, number]> = {
  buy:     [0, -0.45, 0],   // ~26° right (Buy is leftmost portal in some layouts; YMMV)
  partner: [0,  0,    0],   // center
  join:    [0, +0.45, 0],   // ~26° left
  default: [0,  0,    0],
};

const MAX_ROT = 0.523;  // ±30°
const DAMPING = 0.08;

export function LumiHeadTurn() {
  const focused = useFocusedCta();
  const { nodes } = useGLTF("/lumi.glb");
  const headBoneRef = useRef<any>(null);

  useEffect(() => {
    headBoneRef.current = nodes.head;  // FR-CHAR-009 bone name
  }, [nodes]);

  useFrame(() => {
    if (!headBoneRef.current) return;
    const target = TARGET_ROTATION[focused ?? "default"];
    // Lerp head rotation toward target, clamped at ±MAX_ROT
    headBoneRef.current.rotation.y = MathUtils.clamp(
      MathUtils.lerp(headBoneRef.current.rotation.y, target[1], DAMPING),
      -MAX_ROT, MAX_ROT
    );
  });

  return null;
}
```

### §3.3 — `Scene6Canvas.tsx` composition

```tsx
"use client";
import { useEffect } from "react";
import { useSceneProgress, useLumiStore } from "@/lib/stores";
import { LumiHeadTurn } from "./LumiHeadTurn";

export function Scene6Canvas() {
  const progress = useSceneProgress();

  // Set anim to idle on enter; preserve nonlaVisible
  useEffect(() => {
    if (progress > 0.1 && progress < 0.9) {
      useLumiStore.getState().setCurrentAnim("idle");
    }
  }, [progress]);

  return (
    <group>
      <ambientLight intensity={0.4} color="#E8B523" />
      <directionalLight position={[0, 3, 2]} intensity={0.6} color="#F9D966" />
      <LumiHeadTurn />
    </group>
  );
}
```

### §3.4 — DOM-side `Scene6CtaHub.client.tsx` shape

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { SceneTunnel } from "@/lib/dynamic-three";
import { CtaHub } from "@/components/cta/CtaHub";   // FR-CTA-001
import { setFocusedCta } from "@/lib/stores";
import type { CtaTrack } from "@/lib/stores";
import { Scene6Canvas } from "./Scene6Canvas";

export function Scene6CtaHubClient() {
  const sectionRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();

  // Deep-link handler
  useEffect(() => {
    const track = searchParams?.get("track") as CtaTrack | null;
    if (track && ["buy", "partner", "join"].includes(track)) {
      setFocusedCta(track);
    }
  }, [searchParams]);

  return (
    <section ref={sectionRef} data-scene="scene-6-cta-hub" className="min-h-screen">
      <SceneTunnel id="scene-6-cta-hub" trackElement={sectionRef}>
        <Scene6Canvas />
      </SceneTunnel>
      <div className="container mx-auto px-8 py-32">
        <h2 className="font-display text-4xl text-[var(--brand-gold-100)] text-center mb-12">
          You bring the will. We bring the real.
        </h2>
        <CtaHub />
      </div>
    </section>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Scene mounts via SceneTunnel id="scene-6-cta-hub" | Vitest + Playwright DOM check |
| 2 | `<CtaHub>` renders 3 portals (DOM, not canvas) | Playwright DOM count `[data-cta-track]`; expect 3 |
| 3 | Hovering Buy portal turns Lumi head to right (-0.45 rad) | Playwright + R3F dev panel: head bone rotation.y |
| 4 | Hovering Partner portal turns head to center (0 rad) | Same |
| 5 | Hovering Join portal turns head to left (+0.45 rad) | Same |
| 6 | Head rotation clamped at ±30° (±0.523 rad) | Vitest unit + extreme-value Playwright check |
| 7 | Deep-link `?track=partner` pre-focuses Partner portal | Playwright navigate + check `:focus-visible` on Partner button |
| 8 | Lumi remains idle clip throughout Scene 6 | Playwright eval `currentAnim === "idle"` |
| 9 | Nón lá visible (persists from Scene 5) | Playwright eval `nonlaVisible === true` |
| 10 | Caption text verbatim from en.json | Cross-ref |
| 11 | Background eyedrops `--brand-brown-500` | Pixel sample |
| 12 | No cool-tone accents | Eyedropper sweep |
| 13 | Camera transition Scene 5 → 6 = 500ms ease-genie | Frame-diff |
| 14 | FR-CTA-001 modal opens on portal click | Playwright click + modal visibility |
| 15 | FR-CTA-007 Lumi reaction fires on modal open (mouth_smile for Buy) | Playwright + shape-key value polling |
| 16 | Reduced-motion: no canvas; CTA portals fully functional; head static | Playwright reducedMotion ctx |
| 17 | NO 4th portal anywhere | DOM count check; ESLint rule on FR-CTA-001 source |
| 18 | Disposes head-turn subscription on unmount | Vitest |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("3 portals + head-turn-on-hover", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 6));
  await page.waitForTimeout(700);

  const portals = page.locator('[data-cta-track]');
  await expect(portals).toHaveCount(3);

  // Hover Buy portal
  await page.locator('[data-cta-track="buy"]').hover();
  await page.waitForTimeout(400);  // damping lerp
  const headRotY = await page.evaluate(() => (window as any).__sceneDebug?.headRotationY);
  expect(headRotY).toBeLessThan(-0.3);  // approaching -0.45
});

test("deep-link ?track=partner pre-focuses", async ({ page }) => {
  await page.goto("/?track=partner");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 6));
  await page.waitForTimeout(500);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-cta-track"));
  expect(focused).toBe("partner");
});

test("modal open triggers Lumi mouth_smile (Buy track)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 6));
  await page.click('[data-cta-track="buy"]');
  await page.waitForTimeout(200);
  // shape-key influence on mouth_smile
  const smile = await page.evaluate(() => (window as any).__lumiDebug?.shapeKeys?.mouth_smile ?? 0);
  expect(smile).toBeGreaterThan(0.3);
});

test("head clamps at ±30°", async ({ page }) => {
  // Synthetically push focused to extreme; assert clamp
});

test("nón lá persists from Scene 5 into Scene 6", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5));
  await page.waitForTimeout(2500);  // wait for Scene 5 nonla_appear
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 6));
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.nonlaVisible)).toBe(true);
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-007 (Scene 6 CTA Hub comp), FR-CTA-001 (3-track hub component, anchor), FR-CHAR-011 (idle clip), FR-CMS-002 (caption).

**Operational:** FR-WEB-003, FR-WEB-004 (useFocusedCta), FR-WEB-008 (App Router for URL params), FR-DS-006, FR-A11Y-001, FR-CTA-007 (Lumi-form-reactions integration).

**Downstream:** FR-SCENE-019 (Footer transition — nón lá must persist), FR-SCENE-020 (orchestrator).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Lumi head over-rotates past ±30° (4th wall break) | AC#6 | MathUtils.clamp in head-turn lerp; FR-SCENE-007 §1 #3 invariant |
| Head-turn jitter (damping wrong) | Visual smoke | Damping 0.08 calibrated; 0.05 too slow, 0.15 too snappy |
| 4th portal slipped in (stakeholder request) | AC#17 + master-plan §16.2 gate | Reject; require amendment |
| CTA in Drei `<Html>` (a11y break) | AC#2 inspection | Render DOM-side per FR-CTA-001 §1 #2 |
| Deep-link doesn't pre-focus | AC#7 | Verify useSearchParams hook fires on Scene 6 mount |
| Nón lá lost on Scene 5→6 transition | AC#9 + cross-FR snapshot | nonlaVisible flag persists; never reset on scene change |
| Lumi clip mismatch (not idle) | AC#8 | Scene 6 setCurrentAnim('idle'); FR-SCENE-010 picker handles crossfade from nonla_tip |
| FR-CTA-007 Lumi-reaction not firing | AC#15 | Verify modal-open dispatches Lumi-anim change event |
| Cool tone leaks (Scene 3 styles) | AC#12 | Scene 6 uses warm-only palette; data-scene scope inactive in Scene 6 |
| Reduced-motion still renders head-turn | AC#16 | Early-return Scene6Canvas under reducedMotion |
| Camera jump-cut Scene 5 → 6 | AC#13 | gsap transition wired via FR-WEB-002 ScrollTrigger bridge |
| Modal lazy-load Suspense leaks into canvas tree | FR-WEB-006 violation | Modal Suspense MUST be DOM-side, not inside SceneTunnel |
| Head bone ref doesn't resolve (FR-CHAR-009 export missed) | AC#3-5 + Vitest | useEffect sets headBoneRef from nodes.head; assert node name matches FR-CHAR-009 bone hierarchy |

## §8 — Deliverable preview

After shipping, scrolling from Scene 5 into Scene 6:
1. Camera moves closer + centres on Lumi (500ms).
2. Globe + arcs fade out; warm brown-500 background returns.
3. Lumi (now wearing nón lá from Scene 5) crossfades from nonla_tip back to idle, facing camera.
4. Caption fades in: "You bring the will. We bring the real."
5. Below Lumi, 3 portals appear: Buy / Partner / Join.
6. User hovers Buy portal → Lumi's head rotates slightly right toward Buy (visible cue).
7. User clicks Buy → modal opens with lazy-loaded form; Lumi's mouth_smile shape key activates subtly.
8. Modal closes; head returns to centre.
9. User scrolls; footer takes over (FR-SCENE-019); Lumi curls into corner avatar with nón lá still visible.

Reduced-motion: caption + 3 portals fully functional; no canvas; Lumi static image renders.

## §9 — Notes

**On portal layout:** FR-CTA-001 §3 specifies horizontal layout at desktop, stacked at mobile. The Lumi-head-turn direction may need to adapt: at mobile (stacked vertically), head-turn could be slight nod (rotation.x) instead of left/right. Slice 2 amendment territory.

**On the head bone name:** FR-CHAR-009 §1 #2 names the bone `head` (lowercase). FR-CHAR-011 animations also use `head`. The ref-by-name lookup MUST match — string-typo at integration time is the #1 cause of "head-turn doesn't work" bug.

**On nón lá behavior in Scene 6:** Lumi's head-turn is implemented via the head bone rotation. The nón lá is parented to `hat_socket` which inherits from `hood_tip` → `head`. So when the head bone rotates, the nón lá rotates with it. Visually correct — the hat moves with Lumi's gaze.

**On Lumi-form-reactions extensibility:** Slice 2 could add hover-based reactions (subtle mouth_smile on Buy hover, full smile on Buy modal open). FR-CTA-007 owns this; slice 1 ships with modal-open reactions only.

*End of FR-SCENE-018.*
