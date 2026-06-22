---
id: FR-A11Y-002
title: "Accessibility statement page documenting conformance and motion stance"
module: A11Y
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §H (accessibility, WCAG 2.2 AA), §J (motion stance)"
planned_files:
  - app/[lang]/accessibility/page.tsx
---

## §1 Requirement (BCP-14 normative)

The site SHOULD publish a statement that documents its accessibility conformance
and explains the motion decision.

1. An `/[lang]/accessibility` page SHOULD state the target conformance level,
   known limitations, and a contact route for accessibility feedback.
2. The page MUST describe the always-on motion stance and point to the
   reduced-motion path and any user-facing motion control.
3. The statement MUST exist for both locales and MUST read in each locale's
   language.
4. The page MAY be marked `noindex` while it remains a placeholder, but its
   content MUST stay reachable through site navigation.

## §2 Acceptance

- `/en/accessibility` and `/vi/accessibility` resolve and state a conformance
  target plus a feedback contact.
- The page explains the motion stance and links the reduced-motion path.
- Each locale's statement reads in its own language.

## §3 Evidence

Not yet implemented; acceptance pending build.
