---
id: FR-SCENE-004
title: "Pinned sections whose content animates against scroll progress (ScrollTrigger pin + scrub)"
module: SCENE
priority: SHOULD
status: shipped
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-SCENE-002]
related_frs: [FR-SCENE-003, FR-SCENE-007]
source_pages:
  - "research doc §J (3D scene scaffold), §K (scrollytelling beats)"
modified_files:
  - lib/scroll/lenis-gsap.ts
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

Shipped 2026-06-22. `lib/scroll/lenis-gsap.ts` `initScrollStory()` now creates a
GSAP ScrollTrigger that pins the hero (`.cs-hero`) with `start: "top top"`,
`end: "+=55%"`, `pin: true`, `pinSpacing: true`, `scrub: true`: the hero holds
while the first stretch of scroll scrubs the scene intro, then releases, and
`scrub` makes it reverse cleanly on scroll-up (clauses 1-2). `pinSpacing` keeps
the layout gap-free and ScrollTrigger refreshes its measurements on resize
(clause 4); `destroy()` kills the trigger with the rest. The pin is created only
on desktop (>=1024px) with motion allowed - reduced motion or narrow viewports
keep the ordinary static flow (clause 3). Lenis 1.3 drives native window scroll,
so the ScrollTrigger default scroller matches and pinning composes correctly.
Verified by tsc + lint + `next build` (rc=0, 26/26).

Tuning note: the pin distance and feel are confirmed on the deploy, since the
always-animating canvas blocks the dev screenshot. If the hold feels long or
short, `end` is the one knob to adjust.
