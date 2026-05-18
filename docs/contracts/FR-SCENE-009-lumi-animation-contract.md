# FR-SCENE-009 Lumi Animation Mock Contract

Status: active mocked dependency
Date: 2026-05-18

## Missing Physical Dependency

The final `/lumi.glb` with playable `fly_in` and `idle` animation clips is not yet available as a production asset. FR-CHAR-011 is shipped as a mocked dependency, so Scene 0 must provide a deterministic contract until the real animation library replaces it.

## Expected Asset Contract

```json
{
  "asset": "/lumi.glb",
  "required_clips": [
    { "name": "fly_in", "duration_ms": 2000, "loop": false, "easing": "ease-out-quint" },
    { "name": "idle", "duration_ms": 4000, "loop": true }
  ],
  "scene_id": "scene-0-hero",
  "store_sequence": ["fly_in", "idle"]
}
```

## Mock Implementation

- `apps/web/components/scenes/scene-0-hero/Scene0HeroCanvas.tsx` renders `scene-0-hero-lumi-mock-contract` as a deterministic R3F mesh.
- The same component preloads `/lumi.glb` through `preloadGltfWithLocalDecoders('/lumi.glb')`.
- `apps/web/components/scenes/scene-0-hero/Scene0Hero.client.tsx` publishes `window.__scene0HeroState.sequence` and sets the Zustand animation state from `fly_in` to `idle`.

## Contract Tests

- `apps/web/components/scenes/scene-0-hero/__tests__/scene-0.unit.test.ts`
- `apps/web/components/scenes/scene-0-hero/__tests__/scene-0.client.test.tsx`
- `apps/web/components/scenes/scene-0-hero/__tests__/scene-0.canvas.test.tsx`
- `apps/web/tests/web/scene-0-hero.spec.ts`
