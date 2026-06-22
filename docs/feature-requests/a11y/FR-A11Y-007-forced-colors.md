---
id: FR-A11Y-007
title: "forced-colors and Windows high-contrast support"
module: A11Y
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §H (forced colors, high contrast), §D (glass surfaces)"
---

## §1 Requirement (BCP-14 normative)

Surfaces SHOULD stay legible and operable when the user forces a high-contrast
colour scheme.

1. Under `forced-colors: active`, all text, controls, and focus indicators MUST
   remain visible and use the system colour keywords rather than fixed brand
   colours.
2. Glass and translucent surfaces MUST fall back to opaque, bordered backgrounds
   so content does not wash out against the forced palette.
3. Meaning carried by colour alone MUST keep a non-colour cue, such as a border,
   icon, or text label, in forced-colors mode.
4. Decorative gradients and shadows MAY be dropped, but no interactive element
   MUST disappear or lose its boundary.

## §2 Acceptance

- In a forced-colors mode, text, controls, and focus rings stay visible.
- Glass surfaces render as opaque, bordered panels.
- No interactive element loses its visible boundary.

## §3 Evidence

Not yet implemented; acceptance pending build.
