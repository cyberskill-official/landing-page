# DEC: Premium motion-polish layer rides the existing gates, CSS-first

- Date: 2026-07-02
- Status: accepted
- Modules: DS, WEB, A11Y, PERF
- Deciders: Stephen Cheng (scope choice), CyberOS agent (implementation)

## Context

Stephen asked for an Awwwards/motionsites-tier polish pass on the live site:
keep the structure and content, elevate the feel. Hard constraints: CI stays
green including the REQUIRED served-route axe gate and the Lighthouse gate
(CLS < 0.1), reduced-motion gets static fallbacks for all new JS
interactions, keyless + bilingual, and the asset/bundle budgets hold. The
site already had motion infra (Reveal, ScrollStoryProvider/Lenis/GSAP, the
R3F canvas, film grain, count-up), so the pass had to build on it, not
duplicate it.

## Decision

Ship the layer CSS-first with a single JS manager (FR-DS-011):

- CSS owns everything that can be declarative: aurora blobs (pre-blurred
  radial gradients on transform drift - no runtime filter), the kinetic
  masked headline + gold shimmer (background-clip: text, position clamped to
  0-100% so the no-repeat gradient always covers the glyphs), the intro veil
  timeline (forwards fill ends at visibility:hidden - dismissal cannot
  fail), the marquee loop, underlines, and the button shine.
- One client component (MotionExtras) owns all pointer/scroll JS: progress
  bar, custom cursor + spotlight, magnetic CTAs, card tilt, masked heading
  reveals. Delegated listeners, per-frame rect reads, media-query live
  attach/detach; no new dependencies.
- The intro veil is armed by an inline pre-paint script (sessionStorage,
  skipped under prefers-reduced-motion), so crawlers/no-JS/reduced-motion
  users never see it - the LCP heading beneath is untouched SSR text.
- The always-on scene stays always-on (prior product decision, DEC
  2026-06-22); the NEW interactions all honour prefers-reduced-motion, the
  same split FR-DS-009 codified for durations.

## Consequences

- All movement is transform/opacity/clip-path only, so CLS is structurally
  unaffected (space is always reserved); the Lighthouse CLS hard gate keeps
  proving it per push.
- The H1 is now word-span markup with the full slogan on aria-label; the
  vitest suite pins that contract so a copy change cannot silently drop the
  accessible name.
- The shimmer's coverage constraint (background-position within 0-100% at
  background-size 250%) is documented in globals.css after the first build
  visually clipped the slogan - the screenshot round exists precisely to
  catch that class of bug before push.
- The cursor layer never runs on touch/reduced-motion, so mobile ships zero
  extra work; desktop cost is one rAF loop and two composited transforms.

## Related

[[FR-DS-011-motion-polish]] [[FR-DS-009-motion-tokens]]
[[2026-06-22-always-motion-override]]
