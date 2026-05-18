# Per-Scene Greybox Notes

Blender 4.4 is not installed in this workspace. The `.blend` files in this folder are explicit handoff placeholders that link to `../lumi-greybox.v01.blend` by manifest reference. The `.raw.glb` files are deterministic proxy GLBs for early sizing.

| Scene | Tri (props) | Estimated draw calls | Frustum clear at progress=0.5? | Camera | Props |
|---|---:|---:|:-:|---|---|
| 0 | 800 | 3 | yes | (0, 0, 5), fov 50, lookAt origin | 200 instanced particle quads |
| 1 | 250 | 4 | yes | (1.8, 0.2, 4.5), lookAt (0.4, 0, 0) | idea-spark sphere + script-line planes |
| 2 | 2004 | 6 | yes | (0, 0.5, 4), lookAt origin | sketchpad plane + app-shell morph target |
| 3 | 2000 | 8 | yes | (0, 0, 6), fov 60, lookAt origin | 4 capability satellite spheres |
| 4 | 1000 | 12 | yes | (0, 0.5, 5), lookAt (0, -0.2, 0) | 10 team-avatar spheres |
| 5 | 4150 | 9 | yes | (0, 1, 4), lookAt globe origin | stylized globe + HCMC/NA/EU pins |
| 6 | 12 | 5 | yes | (0, 0, 5), lookAt origin | 3 CTA portal cards |
| footer | Lumi linked only | 2 | yes | corner-pinned DOM/R3F avatar | corner Lumi avatar linked from FR-CHAR-004 |

## Link Rule

Every scene placeholder references `../lumi-greybox.v01.blend#collection=lumi_main`. The intent is Blender `Link -> Collection`, not `Append`.

## Budget

- Each scene prop tri count is <= 6000.
- Each optimized fallback GLB is <= 1.5 MB.
- No rigged or animated content is included.
- No image textures are included.

## R3F Architect Review

The camera values are copied from FR-CHAR-005. Final signoff still needs Blender viewport review once Blender 4.4 is available.
