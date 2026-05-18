---
recipe_id: E
name: Substance Material Variants
trigger:
  manual: '@cowork substance-variants <material>'
  labels: [materials, substance]
inputs:
  - material name
  - parameter sweep
outputs:
  - assets-source/substance/<material>/variants/<variant>.sbsar
  - assets-source/substance/<material>/variants/<variant>.json
agent_prompt: recipe-e-substance-variants.prompt.md
success_criteria:
  - parameters saved to JSON
  - variants reproducible
  - outputs flow to FR-OPS-004
priority: COULD
hard_gate: false
---

# Recipe E - Substance Material Variants

## Trigger

Material A/B pass needs controlled variants for edge wear, iridescence, or hue.

## Inputs

Source material and a finite parameter sweep.

## Outputs

Substance archives plus JSON parameter sidecars.

## Agent Prompt

Use `recipe-e-substance-variants.prompt.md`.

## Success Criteria

Every output is reproducible from its sidecar and ready for the KTX2 pipeline.
