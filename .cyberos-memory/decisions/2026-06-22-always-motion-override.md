# DEC: Motion is always on (override the reduced-motion gate for the scene)

- Date: 2026-06-22
- Status: accepted
- Modules: SCENE, A11Y
- Deciders: Stephen Cheng (operator, explicit), CyberOS agent

## Context

The initial build honoured `prefers-reduced-motion`: a manual toggle plus a hard
gate that kept the 3D scene and Lenis smooth scroll off when the OS preference
was set. On the operator's own machine (macOS Reduce Motion on) this meant the
hero showed only the static poster, never the live Lumi orb.

## Decision

Remove the motion toggle and make motion always on. `CanvasMount` and
`ScrollStoryProvider` no longer gate on `prefers-reduced-motion`; the 3D scene
and smooth scroll run on any capable desktop. The device-capability gate
(desktop, fine pointer, cores) is kept - mobile and low-end still get the static
poster, which is a Core Web Vitals choice, not a motion preference.

## Consequences

- The golden Lumi orb (and the scroll-tied choreography) now render for everyone
  on capable desktops, including users with OS reduced-motion set.
- This is a deliberate departure from the WCAG 2.3.3 / reduced-motion posture in
  FR-A11Y-001. The mitigations that remain: motion is decorative (the hero text,
  CTAs, and all content are fully usable without it), the `/lite` storyboard
  route still exists, and the scene is desktop-only. Documented here so the
  tradeoff is explicit and reversible if priorities change.

## Related

[[FR-SCENE-003-always-motion-scrollytelling]] [[FR-A11Y-001-reduced-motion-lite]]
