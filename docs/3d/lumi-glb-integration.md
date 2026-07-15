# Dropping in the Lumi 3D model (GLB)

The scene is wired so a commissioned/generated GLB replaces the procedural Lumi
the moment you provide one. Until then the procedural placeholder renders, so
nothing breaks while you work on the model.

## Enable it (two steps + redeploy)

1. Put the model at `public/models/lumi.glb`.
2. Set `NEXT_PUBLIC_LUMI_GLB=/models/lumi.glb` in Vercel (Production + Preview),
   then redeploy. This var is inlined at build time, so a deploy is required for
   it to take effect.

Unset the var (or remove the file) to fall back to the procedural Lumi. The
asset-size guard (`npm run check:assets`) allows a GLB up to 4096 KB; bump
`maxGlbKB` in `scripts/asset-budget.json` only after you have optimized the
model.

## Exporting from Meshy (or Blender) so it lands well

- Format: glTF Binary (`.glb`), a single self-contained file.
- Compression: enable Draco or meshopt if offered - it cuts the file several-fold.
- Geometry: aim for roughly 50k-150k triangles. The flowing runic tail is thin,
  trailing geometry that image-to-3D tools tend to mangle; expect to simplify it
  or accept a stylized tail, and keep the armored figure as the solid hero.
- Textures: 2K (2048 px) or smaller, packed (metalness/roughness combined).
- Orientation + origin: center the model at the origin, about 2 units tall,
  facing +Z. That matches the camera framing with the least tuning.
- Strip what you do not need: cameras, lights, and extra scenes from the export.

## Tuning after you can see it

The export rarely lands at the exact size/position for the hero framing. Adjust
`BASE_SCALE` and `BASE_POSITION` in `components/canvas/GltfLumi.tsx`, or
re-export centered and ~2 units tall. The model inherits the scene's scroll
choreography (turn + drift) and a light pointer-gaze automatically.

## Behaviour already handled

- Preloaded (`useGLTF.preload`) and wrapped in Suspense, so it never blocks
  first paint (TASK-SCENE-010).
- GPU resources are disposed on unmount (TASK-SCENE-009); the model is cloned so
  it does not mutate the shared cache.
- It only mounts on capable desktops (the existing CanvasMount gate); mobile and
  low-GPU clients keep the static poster.

## Later: named animation clips (TASK-CHAR-023)

If the model ships with named clips (for example idle / greeting / thinking /
speaking / point), they can be cross-faded from the genie store `status` the
same way the procedural Lumi reacts. That is a follow-up once the model exists
and its clip names are known.
