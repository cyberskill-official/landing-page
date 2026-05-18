# Scene 1 Camera Path

## Start

- Position: `(0, 0, 5)` — same as Scene 0 settle pose.
- LookAt: `(0, 0, 0)` — Lumi stays readable as the scene warms.

## End

- Position: `(1.8, 0.2, 4.5)` — slight pan-right plus 0.5 unit zoom.
- LookAt: `(0.4, 0, 0)` — eye anchored on the idea-spark.

## Curve

- Easing: `ease-genie` from FR-DS-006.
- Duration: `5.0s`, synced to `coil_idle`.
- Drives: mutate `cameraRef.current.position` inside `useFrame`; do not store camera position in React state.

## Notes

- The pan reveals the idea-spark at `t=1.5s`.
- The wisp begins the constraint-driven coil at `t=2.0s`.
- Scene transition out starts only after the typed caption settles.
