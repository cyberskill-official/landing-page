# FR-CHAR-010 Mocked Dependency Contract

Blender 4.4 is not available in this execution environment. These artifacts preserve the shape-key and driver contract for downstream animation work:

- `assets-source/blender/lumi-shape-keys.v01.blend`
- `assets-source/blender/lumi-shape-keys-stats.json`
- `assets-source/blender/shape-key-validator.py`
- `assets-source/blender/archive/lumi-rig.v01.pre-shape-keys.blend.zst`
- `design/character-sheets/lumi-shape-key-spec.md`
- `design/character-sheets/lumi-shape-key-contact-sheet.html`

The mock contract asserts exactly ten shape keys, no `mouth_neutral` shape key, 0..1 ranges, default value 0, `c_head` driver targets, non-zero vertex deltas, ten trial glTF morph targets, no sparse-accessor warnings, and silhouette tolerance. A real Blender-authored replacement must keep the same public artifact paths and pass `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-010`.
