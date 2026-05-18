# FR-CHAR-009 Mocked Dependency Contract

Blender 4.4 is not available in this execution environment. These artifacts preserve the custom-rig contract for downstream shape-key, animation, and nón-lá accessory work:

- `assets-source/blender/lumi-rig.v01.blend`
- `assets-source/blender/lumi-rig-skinning-stats.json`
- `assets-source/blender/rig-validator.py`
- `assets-source/blender/archive/lumi.v01.pre-rig.blend.zst`
- `design/character-sheets/lumi-bone-map.png`
- `design/character-sheets/lumi-rig-spec.md`

The mock contract asserts a non-Rigify 29-bone armature, direct mesh-to-armature parenting, no Preserve Volume, max 4 vertex influences, `hat_socket` under `hood_tip`, `c_head` with seven driver properties, all 8 wisp bones auto-IK enabled, and no shape keys or animation payloads. A real Blender-authored replacement must keep the same public artifact paths and pass `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-009`.
