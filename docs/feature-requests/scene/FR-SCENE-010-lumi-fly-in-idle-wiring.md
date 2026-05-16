---
id: FR-SCENE-010
title: "Lumi animation wiring — Zustand-driven anim picker with 200ms crossfade + default-to-idle"
module: SCENE
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 2
owner: R3F Architect
created: 2026-05-16
related_frs: [FR-SCENE-009, FR-WEB-004, FR-CHAR-011, FR-DS-006, FR-A11Y-001]
depends_on: [FR-SCENE-009, FR-WEB-004, FR-CHAR-011]
blocks: [FR-SCENE-013, FR-SCENE-014, FR-SCENE-015, FR-SCENE-016, FR-SCENE-017, FR-SCENE-018]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.3a animation library — "11 clips wired via NLA strips → glTF animations"
  - docs/01-master-plan-v2.md §5.1 web stack — "@react-three/drei useAnimations for clip picker"
  - docs/01-master-plan-v2.md §6.2 render loop — "No setState in useFrame; ref.current mutation only"
  - docs/01-master-plan-v2.md §3.2 motion tokens — "200ms ease-genie default crossfade"

language: typescript + react 19 + r3f 9 + @react-three/drei
service: apps/web/components/lumi/
new_files:
  - apps/web/components/lumi/Lumi.tsx
  - apps/web/components/lumi/useLumiAnimations.ts
  - apps/web/components/lumi/__tests__/lumi-animations.unit.test.ts

effort_hours: 6
risk_if_skipped: "Without disciplined anim-picker wiring, scene-implementation FRs (013-018) each invent their own clip-selection logic. Crossfades become inconsistent (some 100ms, some 500ms), useFrame setState anti-pattern leaks, and the cinematic feel degrades unevenly across scenes."
---

## §1 — Description (BCP-14 normative)

1. **MUST** read `useLumiAnim()` (selector from FR-WEB-004's typed barrel) and select the named clip from `useAnimations(animations, group)`. Clip lookup MUST use exact `AnimationClipName` type (from FR-CHAR-011) — typos fail at `tsc --noEmit`.

2. **MUST NOT** call `setState` inside `useFrame`. The anim picker reacts to `currentAnim` changes via `useEffect`, NOT per-frame polling. FR-WEB-004 §1 #3 banned pattern.

3. **MUST** crossfade between clips with **200ms ease-genie blend** (FR-DS-006 token). Implementation: `actions[newClip]?.crossFadeFrom(actions[oldClip], 0.2)`. The 200ms value MUST be sourced from the motion-tokens module, not hardcoded.

4. **MUST** default to `idle` clip after any non-loop clip completes. Implementation: listen to `mixer.addEventListener('finished', ...)`; if the just-finished clip is in the non-loop set (`fly_in`, `point`, `summon`, `wave`, `split_to_4`, `wave_goodbye`, `nonla_appear`, `nonla_tip`), call `setCurrentAnim('idle')`.

5. **MUST** respect reduced-motion: if `prefers-reduced-motion: reduce`, skip crossfades — clip switches are instant (`actions[newClip]?.play(); actions[oldClip]?.stop()`).

6. **MUST** keep mixer/action lifecycle clean on unmount: call `mixer.stopAllAction()` + `mixer.uncacheRoot(rootBone)` per FR-WEB-003 disposal contract.

7. **MUST NOT** trigger clip switches from `useFrame` callbacks. Triggers come from: scene-progress thresholds (intersection-observer callbacks), user interaction (CTA hover from FR-CTA-001), animation completion events.

8. **MUST** type-export `LumiAnimationsProps` for downstream consumers:
   ```ts
   type LumiAnimationsProps = { rootBone: Object3D; animations: AnimationClip[] };
   ```

9. **MUST** include Vitest unit tests covering: clip-name lookup, crossfade duration, default-to-idle on non-loop completion, no-setState-in-useFrame guard.

10. **MUST NOT** include scene-specific clip-selection logic in this FR. The picker just maps `currentAnim` → `actions[currentAnim]`; deciding WHEN to set `currentAnim` is each scene's responsibility (FR-SCENE-013..018).

11. **SHOULD** log a `console.warn` in dev mode if `currentAnim` is set to a clip not in the loaded animations (catches typos early).

## §2 — Why this design

**Why driver-pattern (store → picker) instead of imperative API?** Imperative APIs (`lumiRef.current.playClip('fly_in')`) create a coupling between scene component and Lumi instance — every scene that switches clips needs a direct ref. The store-driven pattern decouples: scenes set `currentAnim` in Zustand, Lumi observes the store via selector hook, picker fires. The corner avatar (FR-SCENE-008) and main canvas Lumi both observe the same store, so they stay in sync without coordination.

**Why 200ms crossfade?** Master plan §3.2 motion tokens specify `--ease-genie-fast = 200ms` as the default "transition between cinematic states". 100ms feels abrupt (clip pop); 500ms feels sluggish. 200ms is the calibrated middle.

**Why default-to-idle?** Master plan §3.3a `idle` is the only loop clip suitable for indeterminate hold. After `fly_in` ends, Lumi must do *something* (animation 1.0 frozen pose is uncanny). Defaulting to idle is the simplest correct behavior. Scenes that want a different default (e.g. Scene 4 wants `coil_idle`) override by setting `currentAnim` themselves in their useEffect.

## §3 — Public surface

```ts
// useLumiAnimations.ts
import { useAnimations } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { Object3D, AnimationClip, AnimationMixer } from "three";
import { useLumiAnim, useLumiStore } from "@/lib/stores";

const NON_LOOP_CLIPS = new Set([
  "fly_in", "point", "summon", "wave",
  "split_to_4", "wave_goodbye", "nonla_appear", "nonla_tip",
]);
const CROSSFADE_DURATION = 0.2;  // 200ms, FR-DS-006 motion token

export function useLumiAnimations({ rootBone, animations }: {
  rootBone: Object3D;
  animations: AnimationClip[];
}) {
  const { actions, mixer } = useAnimations(animations, rootBone);
  const currentAnim = useLumiAnim();
  const prevAnim = useRef(currentAnim);

  useEffect(() => {
    const newAction = actions[currentAnim];
    const oldAction = actions[prevAnim.current];
    if (!newAction) {
      if (process.env.NODE_ENV !== "production")
        console.warn(`[FR-SCENE-010] no action for clip ${currentAnim}`);
      return;
    }
    if (oldAction && oldAction !== newAction) {
      newAction.reset().play().crossFadeFrom(oldAction, CROSSFADE_DURATION, false);
    } else {
      newAction.reset().play();
    }
    prevAnim.current = currentAnim;
  }, [currentAnim, actions]);

  useEffect(() => {
    if (!mixer) return;
    const onFinished = (e: { action: { getClip: () => AnimationClip } }) => {
      const name = e.action.getClip().name;
      if (NON_LOOP_CLIPS.has(name as any)) {
        useLumiStore.getState().setCurrentAnim("idle");
      }
    };
    mixer.addEventListener("finished", onFinished as any);
    return () => mixer.removeEventListener("finished", onFinished as any);
  }, [mixer]);

  return { actions, mixer };
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Setting `useLumiStore.setCurrentAnim('fly_in')` triggers the named action.play() | Vitest with mocked actions |
| 2 | Crossfade duration is exactly 0.2 (200ms) | Vitest spy on `crossFadeFrom` call args |
| 3 | No setState inside useFrame | Grep + FR-WEB-004 ESLint rule |
| 4 | Default-to-idle after non-loop clip completion | Vitest fires `mixer.finished` event; assert subsequent setCurrentAnim('idle') call |
| 5 | Reduced-motion: instant clip switch (no crossFade call) | Vitest with prefersReducedMotion mock |
| 6 | Mixer cleanup on unmount (no leaked actions) | Vitest spy on stopAllAction |
| 7 | Dev warn on unknown clip name | Vitest console.warn spy |
| 8 | LumiAnimationsProps type compiles | tsc --noEmit |
| 9 | CROSSFADE_DURATION sourced from FR-DS-006 motion module | Grep for hardcoded `0.2`; should be imported |

## §5 — Verification

```ts
// lumi-animations.unit.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLumiAnimations } from "../useLumiAnimations";
import { useLumiStore } from "@/lib/stores";

describe("useLumiAnimations", () => {
  it("calls crossFadeFrom with 0.2 duration on clip change", () => {
    const mockCrossFade = vi.fn();
    const mockPlay = vi.fn().mockReturnValue({ crossFadeFrom: mockCrossFade });
    const actions = {
      fly_in: { reset: () => ({ play: mockPlay }) },
      idle: { reset: () => ({ play: mockPlay }) },
    };
    // ... mount hook, transition fly_in → idle
    expect(mockCrossFade).toHaveBeenCalledWith(expect.anything(), 0.2, false);
  });

  it("defaults to idle after fly_in finishes", () => {
    const setSpy = vi.spyOn(useLumiStore.getState(), "setCurrentAnim");
    // ... fire mixer.finished with fly_in clip
    expect(setSpy).toHaveBeenCalledWith("idle");
  });
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-009 (Scene 0 mounts this Lumi component), FR-WEB-004 (Zustand stores), FR-CHAR-011 (animation library — provides clip names + count).

**Operational:** `@react-three/drei` useAnimations; Vitest + RTL.

**Downstream blocks:** FR-SCENE-013..018 (each scene sets currentAnim for its beat).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Clip name mismatch (typo in code vs animation library) | AC#1 + AC#7 dev warn | Use AnimationClipName type; rename in FR-CHAR-011 if real bug |
| Crossfade jitter (Drei useAnimations fadeTime conflict) | Visual smoke | Use crossFadeFrom directly, don't rely on Drei's default fadeTime |
| Default-to-idle missed (mixer.finished listener not attached) | AC#4 + visual | Verify useEffect dep on mixer; cleanup removes listener |
| setState in useFrame leaked (regression) | AC#3 ESLint | Audit useEffect vs useFrame separation |
| Memory leak: actions not disposed (HMR remount) | Perf profile | mixer.stopAllAction + uncacheRoot in cleanup |
| Reduced-motion still crossfades (a11y miss) | AC#5 | Check prefersReducedMotion before crossFadeFrom |
| Crossfade duration hardcoded (drift from FR-DS-006) | AC#9 grep | Import CROSSFADE from motion-tokens module |
| Race: store update fires before mixer ready | Smoke | Guard with `if (!mixer) return` |
| Both fly_in + idle play simultaneously | Visual + Drei panel | Ensure newAction.reset().play() called BEFORE crossFadeFrom |
| Console.warn ships to production (log spam) | Production build inspection | Wrap warn in `process.env.NODE_ENV !== 'production'` |
| Type widening on AnimationClipName | tsc | Explicit type annotation on currentAnim parameter |
| Scene-specific clip-selection logic creep | Code review | This FR's picker is generic; scene-specific WHEN logic lives in FR-SCENE-NNN |

## §8 — Deliverable preview

After shipping, scene components use the picker by mounting `<Lumi />`:

```tsx
import { useGLTF } from "@react-three/drei";
import { useLumiAnimations } from "./useLumiAnimations";

export function Lumi() {
  const { scene, animations } = useGLTF("/lumi.glb");
  useLumiAnimations({ rootBone: scene, animations });
  return <primitive object={scene} />;
}
```

Then any scene can drive Lumi's animation by setting the store:

```tsx
useLumiStore.getState().setCurrentAnim("wave");
// 200ms crossfade fires; wave plays; on finish, returns to idle
```

## §9 — Notes

**On Drei version:** `useAnimations` API was stable from drei 9.50+. Pin via FR-WEB-001 dependency list.

**On idle clip availability:** This FR assumes `idle` clip exists in the loaded animations. FR-CHAR-011 §1 #1 enumerates idle as the first clip, guaranteed by the animation library.

**On animation-track compression:** Meshopt compresses animation tracks but doesn't affect runtime mixer behavior. FR-OPS-002 enables Meshopt; this FR doesn't need to know about it.

*End of FR-SCENE-010.*
