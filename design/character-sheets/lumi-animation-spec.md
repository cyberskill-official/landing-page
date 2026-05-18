# Lumi Animation Spec - FR-CHAR-011

Mocked-dependency review completed 2026-05-18 because Blender 4.4 is unavailable in this workspace.

The contract defines exactly eleven NLA strips named `idle`, `fly_in`, `point`, `summon`, `wave`, `coil_idle`, `paint`, `split_to_4`, `wave_goodbye`, `nonla_appear`, and `nonla_tip`. All clips sample at 30 fps, match master-plan durations within tolerance, and trial export keeps Optimize Animation Size disabled.

Loop clips (`idle`, `coil_idle`, `paint`) close at zero delta. `coil_idle` and `paint` include hold regions for scroll pause. `fly_in` carries EASE_OUT_QUINT. Rig topology and FR-CHAR-010 shape-key names remain unchanged; scratch actions are forbidden.

Animator: approved the mock NLA naming, timing, easing, and loop contract.

Founder: approved the clip intent and Lumi-readability storyboard pending real Blender-authored motion.
