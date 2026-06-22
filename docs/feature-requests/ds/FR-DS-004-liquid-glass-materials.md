---
id: FR-DS-004
title: "Full Liquid Glass material set with safe fallbacks"
module: DS
priority: SHOULD
status: planned
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-DS-001]
source_pages:
  - "research doc §A (Liquid Glass doctrine), §C (design tokens)"
new_files:
  - app/globals.css
---

## §1 Requirement (BCP-14 normative)

The Liquid Glass language MUST be a complete, tokenized material set so every
surface picks a named weight rather than inventing its own blur.

1. The system MUST define the five materials (whisper, light, standard, heavy,
   solid) as `--cs-glass-*` custom properties with matching `.cs-surface-*`
   classes.
2. Each material MUST collapse to a solid, legible surface under
   `prefers-reduced-transparency`, `forced-colors`, `@supports not
   (backdrop-filter)`, and `@media print`.
3. The materials MUST stay within the doctrine palette and MUST NOT hardcode
   brand hex outside the token block.

## §2 Acceptance

- All five `.cs-surface-*` classes resolve and apply their `--cs-glass-*` values.
- Disabling transparency or backdrop-filter, forced-colors, and print each yield
  a solid surface with readable content.

## §3 Evidence

Not yet implemented; acceptance pending build.
