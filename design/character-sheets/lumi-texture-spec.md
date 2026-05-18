# Lumi Texture Spec - FR-CHAR-008

Mocked-dependency review completed 2026-05-18 because Adobe Substance 3D Painter and Blender bake validation are unavailable in this workspace.

The contract preserves the locked PBR intent: hood uses brand gold-200, body uses brand gold-400, and tail tip uses brand gold-500. Master material values stay metallic 0.4 and roughness 0.35. The ORM map remains packed as R=AO, G=Roughness, B=Metallic, and the normal map uses OpenGL Y+ convention for Three.js.

Emissive is limited to the geometric C emboss plus a low body halo; it is not a full-body glow and does not bake cool iridescence into BaseColor. Runtime shaders may add iridescence later.

Texture Artist: approved the mock texture contract for four 2k maps and Substance export settings.

Founder: approved contract-only brand anchors pending real Substance-authored textures.
