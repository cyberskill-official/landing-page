# FR-CHAR-007 Mocked Dependency Contract

Blender 4.4 is not available in this execution environment. These artifacts preserve the UV handoff contract for downstream texture and compression work:

- `assets-source/blender/lumi-uv-layout-main.png`
- `assets-source/blender/lumi-uv-layout-wisp.png`
- `assets-source/blender/lumi-uv-layout-nonla.png`
- `assets-source/blender/lumi-uv-stats.json`
- `assets-source/blender/uv-validator.py`
- `design/character-sheets/uv-seam-map.png`
- `design/character-sheets/uv-seam-map.md`

The mock contract asserts separate 2k/1k/512 atlases, no UV overlap, padding floors, island caps, unit-square UVs, and hidden seams. A real Blender-authored replacement must keep the same public artifact paths and pass `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-007`.
