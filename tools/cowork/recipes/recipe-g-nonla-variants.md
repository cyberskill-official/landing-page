---
recipe_id: G
name: Nón Lá Easter-Egg Variants
trigger:
  manual: '@cowork recipe-g <variant>'
  paths:
    - assets-source/textures/nonla_basecolor.png
inputs:
  - assets-source/textures/nonla_basecolor.png
  - variant name
outputs:
  - assets-built/optimized/textures/lumi-nonla-tet.png
  - assets-built/optimized/textures/lumi-nonla-midautumn.png
  - assets-built/optimized/textures/lumi-nonla-sunset.png
  - design/character-sheets/nonla/cultural-variants-signoff.md
agent_prompt: recipe-g-nonla-variants.prompt.md
success_criteria:
  - exact allowlist respected
  - founder signoff stub generated
  - no public shipping before approval
allowlist:
  variants: [tet, midautumn, sunset]
  cultural_constraint: vietnamese-casual-register-only
gating:
  founder_signoff_required: true
  signoff_path: design/character-sheets/nonla/cultural-variants-signoff.md
priority: COULD
hard_gate: false
---

# Recipe G - Nón Lá Easter-Egg Variants

## Trigger

Founder or designer requests one of the approved nón lá variants.

## Inputs

Base nón lá texture and one variant from the exact allowlist.

## Outputs

Variant PNGs plus a founder signoff stub.

## Agent Prompt

Use `recipe-g-nonla-variants.prompt.md`.

## Success Criteria

No variant ships to public assets until founder approval is checked in the signoff doc.
