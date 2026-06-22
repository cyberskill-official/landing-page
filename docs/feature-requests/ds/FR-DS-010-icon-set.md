---
id: FR-DS-010
title: "Consistent in-repo SVG icon set with sizing tokens"
module: DS
priority: COULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-DS-001]
source_pages:
  - "research doc §A (visual system), §C (design tokens)"
new_files:
  - components/ui/Icon.tsx
  - lib/icons/index.ts
---

## §1 Requirement (BCP-14 normative)

Icons SHOULD be an in-repo SVG set with shared sizing so the visual weight is
consistent and no outside icon dependency is pulled in.

1. The system SHOULD ship icons as in-repo SVGs rendered through one `Icon`
   component, with no external icon-library dependency.
2. Icon sizes MUST come from `--cs-*` sizing tokens, and color MUST inherit
   `currentColor` so icons follow the surrounding text token.
3. Decorative icons MUST be hidden from assistive tech, and meaningful icons MUST
   carry an accessible label.

## §2 Acceptance

- Every icon renders through `Icon` at a token-driven size and inherits text
  color.
- A decorative icon is `aria-hidden`; a meaningful one exposes a label.

## §3 Evidence

Not yet implemented; acceptance pending build.
