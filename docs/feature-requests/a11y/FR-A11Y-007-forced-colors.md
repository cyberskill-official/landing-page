---
id: FR-A11Y-007
title: "forced-colors and Windows high-contrast support"
module: A11Y
priority: SHOULD
status: shipped
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
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

Shipped 2026-06-22. The `@media (forced-colors: active)` block in `globals.css`
now: maps the keyboard focus ring to `Highlight`; keeps every glass/translucent
surface opaque with a `CanvasText` border and no backdrop-filter (clause 2);
gives buttons, the theme toggle, and the chat close a `ButtonText` border (with
`forced-color-adjust: none` on the primary button so it stays a filled control);
borders form fields, the chat input, chat bubbles, the persistent CTA, tags, and
process steps so nothing relies on colour alone (clauses 1, 3, 4). All values use
CSS system-colour keywords, so the OS palette drives the result. Verified by
`next build` (rc=0); the rules are scoped to the forced-colors media query and do
not affect the default themes.
