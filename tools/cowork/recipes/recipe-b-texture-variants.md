---
recipe_id: B
name: Photoshop Texture Variants
trigger:
  manual: '@cowork variant <texture> <variants>'
  labels: [assets, textures]
inputs:
  - source PNG path
  - variant color spec
outputs:
  - assets-source/textures/<base>/variants/{warm,cool,desat}.png
  - design/texture-variants/<base>-contact-sheet.png
agent_prompt: recipe-b-texture-variants.prompt.md
success_criteria:
  - sRGB preserved
  - alpha channel preserved
  - contact sheet generated
priority: COULD
hard_gate: false
---

# Recipe B - Photoshop Texture Variants

## Trigger

Designer mention or asset-labelled PR requesting controlled texture color variants.

## Inputs

Source texture path and requested hue, saturation, brightness, or curve deltas.

## Outputs

Three PNG variants and a side-by-side contact sheet for human review.

## Agent Prompt

Use `recipe-b-texture-variants.prompt.md`.

## Success Criteria

The output remains sRGB, alpha is unchanged, and no generated variant ships without designer review.
