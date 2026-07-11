---
id: FR-DS-001
engineering_anchor: true
title: "Hand-port design-system doctrine tokens (Umber/Ochre, Liquid Glass, scales) to --cs-* custom properties"
module: DS
priority: MUST
status: done
class: product
verify: T
phase: P0
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: []
blocks: [FR-WEB-001, FR-WEB-002, FR-A11Y-001]
source_pages:
  - "research doc §A (design-system analysis), Phase 0 (resolve dependency)"
source_decisions:
  - ".cyberos-memory/decisions/2026-06-22-tokens-handported.md"
new_files:
  - app/globals.css
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The system MUST express the doctrine anchors as CSS custom properties and MUST
NOT hardcode brand hex in components.

1. MUST define `--cs-color-brand-umber` (#45210E) and `--cs-color-brand-ochre`
   (#F4BA17), with a `color(display-p3 ...)` upgrade under `@supports`.
2. MUST ship the Liquid Glass five materials (whisper/light/standard/heavy/solid)
   as `--cs-glass-*` plus `.cs-surface-*` classes, and MUST collapse them to
   solid under `prefers-reduced-transparency`, `forced-colors`,
   `@supports not (backdrop-filter)`, and `@media print`.
3. MUST provide type, space, radius, depth, and motion scales as tokens.
4. MUST support `data-theme="light|dark"` (light default).

## §2 Acceptance

- Components reference only `--cs-*` for brand colour (grep shows no raw
  `#45210E` outside `globals.css` and the favicon).
- Glass surfaces render solid when transparency is unsupported/unwanted.

## §3 Evidence

Static: token block present in `app/globals.css`; fallback media queries present.
Deferred: visual APCA Lc measurement on rendered glass (operator).
