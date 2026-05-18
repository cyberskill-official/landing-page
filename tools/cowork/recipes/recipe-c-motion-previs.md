---
recipe_id: C
name: After Effects Motion Previs
trigger:
  manual: '@cowork previs <beat>'
  labels: [motion, animation]
inputs:
  - scene beat
  - camera positions
  - duration and easing
outputs:
  - design/motion-previs/<beat>.mp4
agent_prompt: recipe-c-motion-previs.prompt.md
success_criteria:
  - 1080p MP4
  - 24 fps
  - duration at or below 5 seconds
priority: COULD
hard_gate: false
---

# Recipe C - Motion Previs

## Trigger

Rigger or animator asks for a quick motion reference before rig binding.

## Inputs

Camera path, target positions, duration, easing, and hold timing.

## Outputs

One h.264 MP4 at `design/motion-previs/<beat>.mp4`.

## Agent Prompt

Use `recipe-c-motion-previs.prompt.md`.

## Success Criteria

Canonical camera framing, 1s pre-roll, 1s post-roll, and a short file suitable for Slack review.
