---
id: NFR-A11Y-001
category: Accessibility
priority: MUST
status: enforced
owner: Stephen Cheng
created: 2026-06-22
---

## Requirement

The site holds a WCAG 2.2 AA floor. It honours `prefers-reduced-motion` and adds
a manual motion toggle. Every interaction is keyboard operable with a visible
focus indicator. The canvas content has a DOM-text mirror (the `/lite` route) so
nothing meaningful lives only in pixels. Contrast targets APCA Lc of at least 75
for body text and at least 90 for interactive elements.

## Verification

An axe scan plus a manual VoiceOver and NVDA pass confirm the AA floor (deferred
to the operator). The reduced-motion CSS path and the `/lite` mirror are present
and statically verified (TASK-A11Y-001).

## Current status

The structural pieces ship: reduced-motion handling, the motion toggle, the skip
link, and the `/lite` DOM mirror. Assistive-technology and contrast measurement
on rendered output are deferred to the operator.
