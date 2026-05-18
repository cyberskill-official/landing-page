# FR-CHAR-008 Mocked Dependency Contract

Adobe Substance 3D Painter is not available in this execution environment. These artifacts preserve the PBR texture contract for downstream runtime binding:

- `assets-source/substance/lumi.spp`
- `assets-source/substance/lumi-substance-export-preset.spexp`
- `assets-built/raw/textures/lumi-BaseColor.png`
- `assets-built/raw/textures/lumi-ORM.png`
- `assets-built/raw/textures/lumi-Normal.png`
- `assets-built/raw/textures/lumi-Emissive.png`
- `assets-built/raw/textures/lumi-texture-stats.json`
- `tools/texture-validator.py`
- `design/character-sheets/lumi-texture-spec.md`

The mock contract asserts four 2048x2048 maps, warm palette-only BaseColor, ORM channel packing, OpenGL normals, masked emissive, metallic 0.4, roughness 0.35, and a KTX2 preview under 4 MB. A real Substance-authored replacement must keep the same public artifact paths and pass `python3 tools/texture-validator.py`.
