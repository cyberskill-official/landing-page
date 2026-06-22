---
id: FR-DS-010
title: "Consistent in-repo SVG icon set with sizing tokens"
module: DS
priority: COULD
status: shipped
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-DS-001]
source_pages:
  - "research doc §A (visual system), §C (design tokens)"
new_files:
  - components/ui/Icon.tsx
  - lib/icons/index.ts
modified_files:
  - components/header/ThemeToggle.tsx
  - components/genie/GenieChatPanel.tsx
  - components/sections/Hero.tsx
  - app/globals.css
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

Shipped 2026-06-22. `lib/icons/index.ts` holds the icon set as data (viewBox +
primitive elements) with no external icon-library dependency; `components/ui/
Icon.tsx` is the single renderer (clause 1). Size comes from `--cs-icon-sm/md/lg`
tokens via inline `width`/`height`, and `stroke="currentColor"` makes icons
follow the surrounding text token (clause 2). Icons are decorative by default
(`aria-hidden`, `focusable=false`); passing `label` switches to
`role="img"` + `aria-label` (clause 3). The ad hoc inline SVGs in `ThemeToggle`
(sun/moon) and `GenieChatPanel` (close) now render through `Icon`. As the
accent sidecar Stephen asked for, `globals.css` adds an animated gradient
`.cs-accent-divider` and a `.cs-sparkle` pulse (both honour reduced motion), and
the hero eyebrow now carries a subtle decorative sparkle. `tests/icons.test.ts`
asserts every icon has a valid viewBox and elements. Verified by tsc + lint + 37
vitest tests + `next build` (rc=0).
