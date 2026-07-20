---
id: TASK-DS-002
title: "Light/dark theme toggle with no-flash and persisted preference"
module: DS
priority: SHOULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-DS-001]
blocks: []
source_pages:
  - "research doc §C (design tokens, light/dark), §H (user control)"
new_files:
  - components/header/ThemeToggle.tsx
modified_files:
  - app/layout.tsx
  - components/header/SiteHeader.tsx
  - app/globals.css
  - lib/i18n/dictionaries.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The reader MUST be able to choose light or dark, and that choice MUST survive a reload without a flash of the wrong theme.

1. A header control MUST flip `data-theme` on `<html>` between `light` and `dark`, and the dark palette MUST come from the existing `[data-theme="dark"]` tokens (no new colors invented here).
2. The chosen theme MUST be persisted to `localStorage`.
3. The saved theme MUST be applied before first paint via an inline script in the root layout, so there is no flash of the unsaved theme.

## §2 Acceptance

- Toggling switches `data-theme` and re-renders in the other palette at once.
- The choice persists across reload.
- A dark-saved page paints dark on first frame (no light flash), and the control exposes `a11y.themeToDark` / `a11y.themeToLight` labels in both locales.

## §3 Evidence

Static: `components/header/ThemeToggle.tsx` flips and persists `data-theme`; the no-flash script in `app/layout.tsx` sets it pre-paint; dark tokens already exist in `app/globals.css`; labels added to `lib/i18n/dictionaries.ts`. Deferred: visual flash check and theme persistence on the operator machine.
