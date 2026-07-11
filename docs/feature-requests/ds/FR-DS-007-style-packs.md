---
id: FR-DS-007
title: "Style-pack switching layered on the theme"
module: DS
priority: COULD
status: on_hold
class: product
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-DS-001, FR-DS-002]
source_pages:
  - "research doc §A (style packs), §C (design tokens), §H (user control)"
new_files:
  - app/globals.css
  - lib/theme/style-packs.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Style packs SHOULD layer on top of the light/dark theme so a reader can pick a
visual flavor without losing their theme choice.

1. The system SHOULD switch the active style pack via a `data-cs-style`
   attribute on `<html>`, with each pack expressed as `--cs-*` overrides.
2. A style pack MUST compose with `data-theme` rather than replace it, so light
   and dark both stay valid under any pack.
3. Packs MUST stay within the doctrine token contract and MUST NOT reintroduce
   raw brand hex in components.

## §2 Acceptance

- Setting `data-cs-style` re-skins the page while `data-theme` continues to
  select light or dark.
- Every shipped pack resolves in both themes with no missing token.

## §3 Evidence

Not yet implemented; acceptance pending build.
