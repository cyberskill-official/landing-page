---
id: FR-A11Y-010
title: "Honour prefers-reduced-motion in JavaScript: gate the WebGL scene and particle system"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/ui-ux-gaps, audit-C/phase-1, audit-A/section-5, audit-B/phase-4]
---

# FR-A11Y-010: Honour prefers-reduced-motion in JavaScript: gate the WebGL scene and particle system

## 0. Why (evidence)

Audit C: despite 34 prefers-reduced-motion rules in the stylesheet, the JavaScript and WebGL genie and particle
animations kept running while the test environment requested reduced motion. Audit A quotes the site's own accessibility
statement admitting "some motion currently plays regardless of the operating-system reduced-motion setting" - a defect
CyberSkill has self-identified and published but not fixed. This supersedes the closed FR-A11Y-009.

## 1. Description (normative)

- 1.1 Every JavaScript-driven motion source (CosmosCanvas, the R3F scene, LumiMagic, DepthField, BlackHole, IntroVeil, MotionExtras, the GSAP/Lenis scroll choreography) SHALL query `matchMedia('(prefers-reduced-motion: reduce)')` and SHALL NOT start when it matches.
- 1.2 The same sources SHALL respond to a live change of the preference (matchMedia change event) without a reload.
- 1.3 The user-facing motion toggle (FR-A11Y-001) SHALL be authoritative over the same sources: when motion is off, no rAF loop, no canvas tick, no particle emission.
- 1.4 With reduced motion active, every meaningful state SHALL still be visible: no element remains hidden waiting for an animation that never runs.
- 1.5 The accessibility statement SHALL be updated to remove the self-declared defect, in EN and VN, in the same change.

## 2. Acceptance criteria

- [ ] AC for 1.1 - with the media query forced, zero rAF ticks and no canvas mount are observed - test: `a11y/reduced-motion-no-rAF`
- [ ] AC for 1.2 - toggling the OS preference at runtime stops motion within one frame - test: `a11y/reduced-motion-live`
- [ ] AC for 1.3 - the manual toggle produces the same result as the OS preference - test: `a11y/motion-toggle-parity`
- [ ] AC for 1.4 - all masked/kinetic content is visible under reduced motion - test: `a11y/reveal-visible-static`
- [ ] AC for 1.5 - the accessibility page no longer claims the defect, EN and VN - test: `content/accessibility-statement`

## 3. Edge cases

- No-JS: the CSS guards already force content visible - must stay true.
- A user who enables reduced motion after the scene has mounted.
- forced-colors mode combined with reduced motion (FR-A11Y-007 contract).

## 4. Out of scope / non-goals

- Removing motion for users who did not ask for it.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
- The published accessibility statement must never claim conformance the code does not deliver.
