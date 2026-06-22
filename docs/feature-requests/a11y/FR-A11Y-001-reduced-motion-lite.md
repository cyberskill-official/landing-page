---
id: FR-A11Y-001
title: "Reduced-motion path, /lite storyboard DOM mirror, motion toggle, skip link"
module: A11Y
priority: MUST
status: shipped
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-DS-001]
blocks: [FR-SCENE-001]
source_pages:
  - "research doc §H (accessibility, WCAG 2.2 AA), §B (DOM-first story)"
new_files:
  - app/[lang]/lite/page.tsx
  - components/a11y/SkipLink.tsx
  - components/a11y/MotionToggle.tsx
---

## §1 Requirement (BCP-14 normative)

The site MUST clear a WCAG 2.2 AA floor and MUST give users control over motion.

1. The app MUST honour `prefers-reduced-motion: reduce` and MUST also offer a
   manual motion toggle whose choice is persisted in `localStorage` and applied
   before animations start.
2. A `/lite` route per locale MUST mirror the full story as static DOM text,
   serving as the WCAG 2.3.3 alternative to the animated experience.
3. A skip link MUST be the first focusable element and MUST move focus to the
   main content target.
4. Reduced motion MUST disable scene mounting and reveal transforms, not merely
   shorten them.

## §2 Acceptance

- Toggling motion off persists across reload and stops animation immediately.
- `/en/lite` and `/vi/lite` present the whole narrative as readable text.
- Tab from page load lands on the skip link first.

## §3 Evidence

Static: `/lite` route + `SkipLink` + `MotionToggle` authored; toggle reads/writes
`localStorage`; reduced-motion branch gates motion. Deferred: axe scan and
VoiceOver/NVDA pass on the operator machine.
