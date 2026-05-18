# FR-CHAR-006 Mocked Dependency Contract

Blender 4.4 is not available in this execution environment. These artifacts are deterministic placeholders that preserve the production mesh contract for downstream code and validation:

- `assets-source/blender/lumi.v01.blend`
- `assets-source/blender/lumi-sculpt.v01.blend`
- `assets-built/raw/lumi.raw.glb`
- `assets-source/blender/lumi-mesh-stats.json`
- `assets-source/blender/lumi-silhouette-32x32.png`

The mock contract is geometry-only: no rig, no UV authoring, no PBR textures, no shape keys, and no animation payloads. A real Blender-authored replacement must keep the same public artifact paths and pass `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-006`.
