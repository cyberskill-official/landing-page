---
id: FR-DS-003
title: "In-repo themed UI primitives (Button, Field, Select, Dialog, Card)"
module: DS
priority: MUST
status: planned
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-DS-001]
source_pages:
  - "research doc §A (design-system analysis), §C (design tokens), §H (user control)"
new_files:
  - components/ui/Button.tsx
  - components/ui/Field.tsx
  - components/ui/Select.tsx
  - components/ui/Dialog.tsx
  - components/ui/Card.tsx
---

## §1 Requirement (BCP-14 normative)

The repo MUST own its interactive primitives so the brand and accessibility
contract is enforced in one place, not delegated to an outside library.

1. The system MUST ship Button, Field, Select, Dialog, and Card as in-repo
   components that reference only `--cs-*` tokens, and MUST NOT add an external
   component-library dependency.
2. Text on every primitive MUST meet APCA Lc >= 75 for body and Lc >= 90 for
   interactive labels against its rendered surface, including over Liquid Glass.
3. Each primitive MUST be keyboard operable and MUST expose its state (focus,
   disabled, invalid) through native semantics or ARIA, and the Dialog MUST trap
   focus and restore it on close.

## §2 Acceptance

- Button, Field, Select, Dialog, and Card render from `--cs-*` tokens with no raw
  brand hex and no third-party component import.
- Tab-only operation reaches and actuates every primitive; the Dialog returns
  focus to its trigger on close.

## §3 Evidence

Not yet implemented; acceptance pending build.
