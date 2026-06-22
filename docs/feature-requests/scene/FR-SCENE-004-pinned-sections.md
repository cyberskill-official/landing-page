---
id: FR-SCENE-004
title: "Pinned sections whose content animates against scroll progress (ScrollTrigger pin + scrub)"
module: SCENE
priority: SHOULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-SCENE-002]
related_frs: [FR-SCENE-003, FR-SCENE-007]
source_pages:
  - "research doc §J (3D scene scaffold), §K (scrollytelling beats)"
---

## §1 Requirement (BCP-14 normative)

Pinned sections SHOULD hold in place while their content scrubs against scroll.

1. Selected sections MUST pin to the viewport via GSAP ScrollTrigger so the
   section stays fixed while the page scroll advances its internal timeline.
2. Pinned timelines MUST use `scrub` so progress maps to scroll position and
   reverses cleanly when the user scrolls back up.
3. Pinning MUST be disabled when motion is not allowed (see FR-A11Y-001); the
   section MUST then render as ordinary static content.
4. Pin spacing MUST NOT leave layout gaps or overlap adjacent sections, and
   MUST recompute on resize.

## §2 Acceptance

- A pinned section holds while its content animates, then releases on schedule.
- Scrolling up reverses the scrubbed timeline without jumps.
- With reduced motion, the section is static and no pin is created.

## §3 Evidence

Not yet implemented; acceptance pending build.
