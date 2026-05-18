# Scene 3 Satellite Orbits

## Clock Layout

| Clock | Capability | Satellite tint | End position | Ribbon curve | Emissive |
|---|---|---|---|---|---:|
| 12 | React | `#7DD3FC` cyan mesh | top satellite | center to upper-left control to top | 0.85 |
| 3 | Three.js | `#F0ABFC` magenta mesh | right satellite | center to upper-right control to right | 0.80 |
| 6 | AI/RAG | `#BEF264` lime mesh | bottom satellite | center to lower-right control to bottom | 0.78 |
| 9 | Design Systems | `--brand-gold-400` mesh | left satellite | center to lower-left control to left | 0.90 |

## Start Position

All ribbons start at Lumi's wisp core in the center of the scene. Lumi remains warm-gold and partially faded during `split_to_4`.

## Constraints

- The four ribbons use gold-400 only; cool accents are constrained to the three cool satellite meshes.
- Curves MUST NOT cross. Each path bows toward its own quadrant before reaching the satellite.
- Timing follows the 2.5s `split_to_4` clip: launch by `t=0.25s`, satellite lock by `t=1.75s`, orbit idle by `t=2.5s`.
- Reduced motion collapses each curve into a static radial line with a 120ms opacity fade.
