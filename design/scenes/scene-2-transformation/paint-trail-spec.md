# Scene 2 Paint Trail Spec

## Intent

Lumi paints a warm `--brand-gold-400` trail from the extended right hand toward the sketchpad. The trail is additive-blended and must stay inside the gold/brown palette.

## Curve

Use a 6-segment Catmull-Rom or cubic Bezier path sampled from these normalized scene anchors:

1. hand: `(0.28, 0.55)`
2. elbow follow: `(0.35, 0.47)`
3. bright arc: `(0.44, 0.40)`
4. sketch entry: `(0.54, 0.36)`
5. wireframe trace: `(0.62, 0.41)`
6. app-shell settle: `(0.68, 0.48)`

## Shader Hints

- Blend: additive over the brown-500 background and gold-50 sketchpad.
- Color: head `--brand-gold-400`; tail may fade through `--brand-gold-200`.
- Tail: 6 visible segments with alpha fade `1.0, 0.72, 0.48, 0.30, 0.16, 0.06`.
- Width: taper from `14px` at the head to `3px` at the tail at 1920px width.
- Glow: apply `genie_rim` as an outer halo using gold-400 at 0.38 alpha and a second gold-200 bloom at 0.18 alpha.
- Motion: trail head reaches the app shell by `t=2.0s`; morph completes by `t=4.0s`.

## Accessibility

Respect reduced motion by replacing the sweep with a static 6-segment trail and cross-fading the wireframe to the app shell.
