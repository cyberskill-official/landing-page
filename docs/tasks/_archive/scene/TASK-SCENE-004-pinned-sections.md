---
id: TASK-SCENE-004
title: "Pinned sections whose content animates against scroll progress (ScrollTrigger pin + scrub)"
module: SCENE
priority: SHOULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-SCENE-002]
related_frs: [TASK-SCENE-003, TASK-SCENE-007]
source_pages:
  - "research doc §J (3D scene scaffold), §K (scrollytelling beats)"
modified_files:
  - lib/scroll/lenis-gsap.ts
  - components/scroll/HeroPin.tsx
  - app/[lang]/page.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Pinned sections SHOULD hold in place while their content scrubs against scroll.

1. Selected sections MUST pin to the viewport via GSAP ScrollTrigger so the
   section stays fixed while the page scroll advances its internal timeline.
2. Pinned timelines MUST use `scrub` so progress maps to scroll position and
   reverses cleanly when the user scrolls back up.
3. Pinning MUST be disabled when motion is not allowed (see TASK-A11Y-001); the
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

## §4 Addendum 2026-07-02: hydration-race defect + fix (round 5)

Defect: `pin: true` wraps `.cs-hero` in a GSAP-owned `div.pin-spacer` - real
DOM surgery. The pin was created from the locale-layout provider
(ScrollStoryProvider) behind an async import, so it raced PAGE-segment
hydration; when the round-5 bundle growth slowed hydration enough, GSAP won
and mutated the DOM mid-hydration. React 19 threw error #418 ("server HTML
didn't match the client": expected `section.cs-hero`, found
`div.pin-spacer`), regenerated the entire client tree, and every one-shot
IntersectionObserver in MotionExtras was left watching orphaned nodes -
all [data-mask-reveal]/[data-pop] content (including the new TASK-DS-014
kinetic headings) stayed permanently hidden. Diagnosed with a `next dev`
run whose unminified hydration diff named the pin-spacer directly.

Fix: pin creation moved out of the provider into `createHeroPin()`
(lib/scroll/lenis-gsap.ts) called by `<HeroPin/>` - a null-rendering client
component mounted LAST in the page segment (app/[lang]/page.tsx). A page
component's effect cannot run before its own segment finished hydrating,
so the DOM surgery is provably post-hydration; unmount kills the trigger
(which also restores the original DOM), so locale switches recreate it
cleanly. Defence in depth: the MotionExtras reveal observer is now
self-healing (re-scans still-pending nodes at +1.5s, +4s, and window load),
and the shots harness gained REVEAL_PROBE (kinetic h2 must be "shown" +
unmasked after scroll) and HYDRATION_PROBE (zero #418/hydration
pageerrors), so this class of regression can never pass silently again.
Behaviour, guards (desktop-only, reduced-motion off), and the `end: +=55%`
tuning are unchanged.
