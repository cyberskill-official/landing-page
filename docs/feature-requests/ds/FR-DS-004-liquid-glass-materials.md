---
id: FR-DS-004
title: "Full Liquid Glass material set with safe fallbacks"
module: DS
priority: SHOULD
status: shipped
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-23
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

Shipped. `app/globals.css` defines all five materials as `--cs-glass-*` tokens
(blur whisper/light/standard/heavy + tints, themed for light and dark) with
matching `.cs-surface-whisper/-light/-standard/-heavy` glass classes and a
`.cs-surface-solid` opaque class (§1.1). Every glass surface collapses to a
solid `var(--cs-color-surface)` under all four conditions (§1.2): `@supports
not (backdrop-filter)`, `@media (prefers-reduced-transparency: reduce)`,
`@media (forced-colors: active)` (system palette + borders), and `@media print`
(solid, no blur/shadow, plain border). All values are tokens - no brand hex is
hardcoded outside the `:root`/`[data-theme]` token blocks (§1.3). Verified: next
build rc=0.
