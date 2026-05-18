# FR-CHAR-012 Mocked Dependency Contract

Blender 4.4 and physical DCC validation are unavailable in this execution environment. These artifacts preserve the nón lá accessory contract for downstream Scene 5 work:

- `assets-source/blender/lumi-nonla.v01.blend`
- `assets-built/raw/lumi-nonla.raw.glb`
- `assets-built/raw/textures/lumi-nonla-BaseColor.png`
- `assets-built/raw/textures/lumi-nonla-Normal.png`
- `assets-source/blender/lumi-nonla-stats.json`
- `assets-source/blender/nonla-validator.py`
- `design/character-sheets/nonla/lumi-nonla-render.png`
- `design/character-sheets/nonla/lumi-nonla-spec.md`

The mock contract asserts <=600 triangles, 0.078 brim diameter, 0.05 cone height, `hat_socket` bone parenting, `nonla_visible=false`, 512 atlas textures, exact flag-red/gold/star colours, a single star, no decorative patterns, casual cultural register, applied transforms, and raw GLB <=400 KB. A real Blender-authored replacement must keep the same public artifact paths and pass `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-012`.
