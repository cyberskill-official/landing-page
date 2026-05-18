---
recipe_id: D
name: Blender Python Automation
trigger:
  manual: '@cowork blender-script <task>'
  labels: [blender, rigging]
inputs:
  - task spec
  - target Blender version
outputs:
  - tools/blender/scripts/<task>.py
  - tools/blender/scripts/<task>.md
agent_prompt: recipe-d-blender-python.prompt.md
success_criteria:
  - usage comment present
  - non-destructive by default
  - validation step included
priority: COULD
hard_gate: false
---

# Recipe D - Blender Python Automation

## Trigger

Animator or rigger requests repeatable Blender automation such as NLA marker generation or batch renaming.

## Inputs

Task spec, target Blender version, and expected output paths.

## Outputs

A Blender Python script and a small usage note.

## Agent Prompt

Use `recipe-d-blender-python.prompt.md`.

## Success Criteria

Script includes error handling, avoids destructive writes, and validates its own output.
