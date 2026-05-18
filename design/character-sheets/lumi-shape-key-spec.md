# Lumi Shape Key Spec - FR-CHAR-010

Mocked-dependency review completed 2026-05-18 because Blender 4.4 is unavailable in this workspace.

The contract defines exactly ten shape keys on `lumi_main`: eye close/squint, mouth smile/speak/o, brow raise/concern, cheek puff, glow pulse, and hood tip. `mouth_neutral` remains the Basis mesh and must not ship as a morph target.

Each key ranges 0..1, defaults to 0, has non-zero vertex delta, preserves the FR-CHAR-002 silhouette tolerance, and is driven by `c_head` custom properties. FR-CHAR-010 extends `c_head` with `mouth_o`, `cheek_puff`, `glow_pulse`, and `hood_tip` for downstream animation.

Rigger: approved the mock driver contract.

Animator: approved expression usability for the 11 animation clips.

Founder: approved the Lumi-readability contract pending real Blender-authored shapes.
