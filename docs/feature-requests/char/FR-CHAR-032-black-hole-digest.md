---
id: FR-CHAR-032
title: "Black-hole digest: press-and-hold devours the page, release restores it"
module: CHAR
priority: COULD
status: shipped
verify: T
phase: P4
created: 2026-07-02
shipped: 2026-07-02
owner: Stephen Cheng
depends_on: [FR-CHAR-030]
related_frs: [FR-DS-011, FR-DS-013]
source_pages:
  - "operator direction 2026-07-02: when the user keeps holding the mouse, Lumi turns into a black hole and slowly digests all content of the website; on release the digest inverts and everything returns to its position (holding again continues the digest)"
new_files:
  - components/motion/BlackHole.tsx
modified_files:
  - lib/scene/mascot.ts
  - lib/motion/kinetic.ts
  - components/canvas/GenieScene.tsx
  - components/canvas/LumiPlaceholder.tsx
  - app/[lang]/layout.tsx
  - app/globals.css
  - tests/motion-polish.test.ts
---

## §1 Requirement (BCP-14 normative)

1.1 On capable desktops (pointer fine + hover, motion allowed, mascot live),
pressing and HOLDING the primary mouse button on non-interactive page space
MUST transform Lumi into a black hole and progressively devour the page:
every content block translates toward Lumi, shrinks, spins, and fades, with
blocks nearer the hole consumed first. Releasing the button MUST invert the
digest - every block returns exactly to its original position and style -
and holding again MUST resume from the current progress (the digest is a
scrubbed timeline, not a one-shot).

1.2 The interaction MUST be reversible with zero residue: at progress 0 all
inline styles are cleared so the page is byte-identical to its pre-digest
state (CLS-safe; transform/opacity only, layout never changes). Holds that
start on interactive elements (links, buttons, the chat, Lumi's own
hotspot, form fields) MUST NOT arm the effect, and during a digest the page
MUST be pointer-inert so half-devoured controls cannot be clicked.

1.3 The effect MUST NOT run for touch/coarse pointers, under
prefers-reduced-motion, or when the mascot is not on stage
(html[data-lumi-live] absent). The mascot itself MUST visibly become the
black hole while digesting: core darkens to void, the aura collapses to a
gold event-horizon rim, spin accelerates, and crossing half-progress fires
a magic burst (FR-CHAR-030 pool).

## §2 Design

components/motion/BlackHole.tsx (client, mounted once in the locale layout)
owns the interaction: pointerdown (button 0, mouse only, target outside
INTERACTIVE_SELECTOR) arms a 350ms timer; the frame loop integrates
progress p at +dt/2.6s while holding and -dt/1.1s on release, sets
data-digesting on <html>, and per block applies
translate3d(toward Lumi's screen point) scale(1-e*0.94) rotate(spin*e) with
opacity fade, where e = digestEase(p, normDist) (lib/motion/kinetic.ts) -
a smoothstep offset by normalised distance to the hole, so near blocks go
first and everything is consumed by p=1. collectBlocks() gathers
`main .cs-container` children, splitting the known grids
(.cs-services-grid, .cs-work-grid, ...) into their children, plus the
marquee and footer inner, capped at 160 blocks; rects re-measure on each
arm. Progress feeds lib/scene/mascot.ts setDigest(); GenieScene scales the
rig up to +55% and LumiPlaceholder lerps core/emissive to void, keeps the
aura rim gold (the event horizon), and accelerates rotation - so the DOM
devour and the 3D transformation read as one object. digestEase is
unit-tested (bounds, near-before-far ordering, monotonicity).

## §3 Evidence (2026-07-02, Mac gate + automated run)

- Gate all EXIT=0: tsc; vitest 18 files / 76 tests (digestEase: 0/1 bounds,
  near-block-first at p=0.5, monotonic in p); lint; build; assets; served
  jsdom axe 0 serious/critical on /en + /vi.
- DIGEST_PROBE on the served build: press-and-hold at empty hero space for
  2.3s -> sucked:true (hero lead carries a live transform) and
  data-digesting present; release + 2.2s -> restoredCleared:true (inline
  style empty string) and the attribute removed. Screenshot
  1b-blackhole.png shows the void-core Lumi with gold rim and the page
  reduced to shrinking fragments; 1c-restored.png is pixel-identical to the
  pre-digest hero.
- Guards probed implicitly by the rest of the suite: PASSTHROUGH/
  CLICKTHROUGH still navigate (holds on CTAs never arm), WISH_PROBE drives
  the chat during the same session (chat excluded from arming).
