# FR-CHAR-011 Mocked Dependency Contract

Blender 4.4 is not available in this execution environment. These artifacts preserve the animation-library contract for downstream scene and glTF pipeline work:

- `assets-source/blender/lumi-animations.v01.blend`
- `assets-source/blender/lumi-animation-stats.json`
- `assets-source/blender/animation-validator.py`
- `assets-source/blender/archive/lumi-rig.v01.pre-anim.blend.zst`
- `design/character-sheets/lumi-animation-spec.md`
- `design/character-sheets/lumi-animation-storyboard.md`
- `design/character-sheets/lumi-animation-thumbnails/*-key-pose.png`

The mock contract asserts exactly 11 NLA strips, verbatim clip names, 30 fps sampling, frame counts within tolerance, loop-close deltas under 0.001, EASE_OUT_QUINT on `fly_in`, hold regions on `coil_idle` and `paint`, no rig or shape-key drift, no scratch actions, and a trial glTF export with 11 matching animation names and Optimize Animation Size disabled. A real Blender-authored replacement must keep the same public artifact paths and pass `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-011`.
