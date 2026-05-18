# FR-SCENE-010 Lumi Animation Picker Mock Contract

Status: active mocked dependency
Date: 2026-05-18

## Missing Physical Dependency

The production `/lumi.glb` animation library is not yet available with the complete FR-CHAR-011 clip table. The picker therefore ships against a deterministic Drei/useAnimations mock that defines the runtime contract until the real GLB replaces the greybox asset.

## Expected Request Shape

```json
{
  "component": "useLumiAnimations",
  "props": {
    "rootBone": "THREE.Object3D",
    "animations": "THREE.AnimationClip[]"
  },
  "store_input": {
    "currentAnim": "AnimationClipName"
  },
  "required_clips": [
    "idle",
    "fly_in",
    "mouth_smile",
    "point",
    "summon",
    "wave",
    "coil_idle",
    "paint",
    "split_to_4",
    "wave_goodbye",
    "nonla_appear",
    "nonla_tip"
  ]
}
```

## Expected Response Shape

```json
{
  "actions[currentAnim]": {
    "reset": "function",
    "play": "function",
    "stop": "function",
    "crossFadeFrom": "function(oldAction, 0.2, false)",
    "setLoop": "function(LoopOnce, 1)",
    "getClip": "function() => AnimationClip"
  },
  "mixer": {
    "addEventListener": "function('finished', listener)",
    "removeEventListener": "function('finished', listener)",
    "stopAllAction": "function()",
    "uncacheRoot": "function(rootBone)"
  },
  "observability": {
    "window.__lumiAnimationEvents": [
      "lumi_animation_transition",
      "lumi_animation_missing_clip",
      "lumi_animation_finished"
    ]
  }
}
```

## Mock Implementation

- `apps/web/components/lumi/__tests__/lumi-animations.unit.test.ts` mocks `@react-three/drei` `useAnimations()` and `useGLTF()` with the contract above.
- `apps/web/components/lumi/useLumiAnimations.ts` reads `useLumiAnim()` from the typed Zustand barrel and maps it to `actions[currentAnim]`.
- Non-loop clips return to `idle` when the mixer emits `finished`.
- Reduced-motion users receive instant action switches with no crossfade.

## Contract Tests

```text
apps/web/components/lumi/__tests__/lumi-animations.unit.test.ts
```

The test suite covers clip lookup, 200ms token-derived crossfade, reduced-motion instant switching, default-to-idle on mixer completion, mixer cleanup, dev warnings for missing clips, source guardrails against `useFrame` state writes, and `<Lumi />` GLB wiring.
