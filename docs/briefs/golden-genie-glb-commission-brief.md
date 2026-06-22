# Commission brief - Lumi, the golden genie (GLB hero asset)

For: a 3D character artist (Blender + Substance 3D Painter, or equivalent).
Tracks: FR-CHAR-021. Replaces the procedural placeholder shipped in FR-CHAR-020.
Reference: research doc §C. CyberSkill owns all IP on delivery.

## 1. Who Lumi is

Lumi is CyberSkill's mascot: a golden genie who turns a clear intention into
working software ("Turn Your Will Into Real"). The voice is warm, direct,
honest, and respectful, all at once - playful but professional. The model must
read as friendly and competent, not gimmicky. It greets visitors, watches the
cursor, gestures toward calls to action, and "speaks" while the chat streams.

## 2. Art direction

- Stylized, not photoreal. A clean, appealing silhouette that reads at small
  size and from behind translucent glass UI.
- Palette anchored to the brand: Ochre gold `#F4BA17` as the body/glow, Umber
  `#45210E` for depth and contrast. Warm rim light. Avoid garish saturation.
- Form language: a genie emerging from a wisp/base rather than full legs is
  fine (and cheaper to animate). Expressive face and hands matter most.
- A subtle internal glow / emissive is welcome (it pairs with the scene's
  point light), but keep it tasteful.

## 3. Technical specification (hard requirements)

- Format: glTF 2.0 binary (`.glb`), single file, Y-up, real-world-ish scale
  (~1.8 units tall), origin at the feet/base, facing +Z.
- Geometry budget: target <= 40k triangles. Geometry compressed with Draco
  (`KHR_draco_mesh_compression`) OR Meshopt (`EXT_meshopt_compression`) - one,
  not both.
- Textures: KTX2 / Basis Universal (`KHR_texture_basisu`). UASTC for the hero /
  normal maps, ETC1S for diffuse and secondary. Author at 1024 for desktop;
  provide a 512 variant for the mobile/poster path. PBR metal-rough.
- Final optimised file size: <= 3 MB (hard ceiling), ideally <= 2 MB.
- Draw calls: the assembled scene must stay under 100 draw calls per frame;
  merge materials where possible.
- Rig: Mixamo-compatible humanoid skeleton (so body clips can come from Mixamo)
  PLUS facial blendshapes. Provide the ARKit 52 blendshape set (or at minimum
  the visemes: jawOpen, mouthClose, mouthFunnel, mouthPucker, and the A/E/I/O/U
  mouth shapes) for lip-sync.
- No external/unsupported extensions beyond Draco-or-Meshopt and KTX2.

## 4. Named animation clips (baked into the GLB)

Body clips, looping unless noted, named exactly:

- `idle` - ambient sway/breathing (default).
- `greeting` - a one-shot welcome wave/bow on first appearance.
- `thinking` - a pondering loop (used while a chat request is in flight).
- `speaking` - a gentle talking loop (used while tokens stream; mouth driven
  separately by visemes).
- `point` - a one-shot gesture toward a call to action.

The face must support cursor-follow gaze via a head/eye bone (or expose the eyes
as a lookAt target). Keep the eyes on a bone the runtime can rotate.

## 5. Deliverables

1. `lumi.glb` - final optimised (Draco/Meshopt + KTX2), <= 3 MB.
2. `lumi-1024.glb` and `lumi-512.glb` texture variants (or a documented script
   to produce them with glTF-Transform).
3. Editable source: the `.blend` (or Maya/3ds), plus the texture set
   (PNG/PSD) and any Substance project.
4. A short turntable render (mp4 or gif) and a still PNG poster of the
   "greeting" pose for the mobile/reduced-motion static fallback.
5. A one-page sheet listing clip names, durations, and the blendshape list.

## 6. Acceptance criteria

- Passes `gltf-transform optimize lumi.glb out.glb --compress draco
  --texture-compress ktx2` (or the Meshopt path) with no validator errors.
- Loads in three.js r0.184 / React Three Fiber v9 via `useGLTF`; all five clips
  resolve through drei's `useAnimations`; blendshapes are addressable as
  morph-target influences.
- `npx gltfjsx lumi.glb -o Lumi.tsx --types --transform` generates a clean,
  typed component with no manual fixups.
- Holds <= 3 MB and < 100 draw calls in the assembled scene; first interaction
  on desktop stays within the project performance budget (LCP unaffected -
  the model is code-split and lazy, never on the first-paint path).
- Visual review sign-off by the founder against this art direction.

## 7. Integration (how it drops into this repo)

- Place the optimised GLB in `public/models/lumi.glb` (served statically).
- Generate the component with gltfjsx; put it in `components/canvas/Lumi.tsx`.
- In `components/canvas/GenieScene.tsx`, replace `<LumiPlaceholder />` with the
  new `<Lumi />`. Keep the existing `CanvasMount` capability gate, the static
  poster fallback, and the `ScrollStoryProvider` untouched.
- Drive animation from the existing `useGenieStore` status
  (`idle -> listening -> thinking -> speaking`): cross-fade clips with the
  AnimationMixer (`action.fadeIn/fadeOut`), and apply viseme/jaw morphs in the
  `useFrame` loop AFTER the mixer updates so the mouth overrides the idle body.
- Keep gaze: lerp the head/eye target toward `state.pointer` each frame, exactly
  as the placeholder already does.
- Preload with drei `useGLTF.preload("/models/lumi.glb")` behind the gate.

## 8. Sourcing options (pick one)

- Commission bespoke (recommended for the hero mascot): full control and IP,
  highest cost/time. ArtStation / a studio / Fiverr Pro.
- Buy + heavily customise a Sketchfab "Mixamo-rigged, face-jointed" base, then
  restyle to the brand in Blender. Faster, cheaper, check licensing.

Lip-sync fidelity is a cost lever (research doc caveat): amplitude-driven jaw
is cheap; full viseme / NeuroSync-grade is richer but more work. Decide based on
how "alive" Lumi must feel; the blendshape set above keeps both options open.
