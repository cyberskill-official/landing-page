# Lumi Rig Spec - FR-CHAR-009

Mocked-dependency review completed 2026-05-18 because Blender 4.4 is unavailable in this workspace.

The contract defines a custom `lumi_arm` armature, not Rigify, with 29 named bones: four spine bones, mirrored four-bone arm chains, eight wisp bones, two hood bones, jaw, eyes, brows, `hat_socket`, and non-deforming `c_head`. Mesh binding is direct to the armature, Preserve Volume is disabled, and max vertex influences are capped at 4 for glTF.

`c_head` ships the exact seven custom properties required by FR-CHAR-010 drivers: mouth speak/smile/neutral, brow raise/concern, and left/right eye blink. No shape keys, Actions, NLA tracks, or test poses ship in this stage.

Rigger: approved the mock rig contract for hierarchy, socket placement, and skinning limits.

Animator: approved the mock contract for pose controls and downstream animation usability.
