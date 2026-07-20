---
id: TASK-CHAR-030
title: "Lumi as a living mascot: full-page flight, magic bursts, clickable chat entry"
module: CHAR
priority: COULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-07-02
shipped: 2026-07-02
depends_on: [TASK-SCENE-007, TASK-CHAR-023, TASK-DS-012]
source_pages:
  - "operator direction 2026-07-02: Lumi must not be a static chat popup button - a living mascot that moves, flies, interacts, and makes magic within the website; more motion/3D overall"
new_files:
  - lib/scene/journey.ts
  - lib/scene/mascot.ts
  - components/canvas/LumiHotspot.tsx
  - tests/journey.test.ts
modified_files:
  - components/canvas/GenieScene.tsx
  - components/canvas/LumiPlaceholder.tsx
  - components/canvas/CanvasMount.tsx
  - components/scroll/ScrollState.tsx
  - lib/scroll/progress.ts
  - components/cta/LeadForm.tsx
  - components/motion/MotionExtras.tsx
  - components/sections/StoryArc.tsx
  - app/[lang]/layout.tsx
  - app/globals.css
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

1.1 Lumi MUST behave as a living mascot across the whole page on capable desktops: it flies a scroll-driven route from the hero down every home section (weaving page sides, banking into turns, trailing light), reacts to the visitor (hover excitement, pointer gaze), attends the chat panel while it is open, and performs "magic" (particle bursts) at section arrivals, on hover, on chat open, and when a lead submission succeeds.

1.2 Lumi itself MUST be a first-class chat entry: a real, focusable button with dialog semantics rides the mascot's projected screen position, so clicking or keyboard-activating the flying genie opens the chat. The button MUST be core-sized and capped so it never blankets nearby text, MUST hide while the chat is open, on touch devices, and whenever the scene is not mounted - the existing GenieOpenButton CTAs remain everywhere else.

1.3 The live scene MAY render above the content (it is aria-hidden and pointer-events:none, so it can never trap focus or block interaction), but the flight route MUST respect the type: anchors keep Lumi out of text columns, the pixie dust travels with the mascot instead of dusting the page, and the hero wire-grid floor MUST fade out before the content sections begin. The static-poster path (mobile/incapable devices) MUST keep the original behind-the-hero layering and all CI gates MUST stay green.

## §2 Design

lib/scene/journey.ts holds the pure flight plan: a ROUTE of viewport anchors per section, buildStops (section rects -> sorted scroll keyframes), sampleJourney (smoothstepped interpolation), and viewportToWorld (anchor -> z=0 world for the fixed camera) - all unit-tested. The camera is now a fixed rig with pointer parallax so that mapping stays honest; the old scroll-driven camera stops in progressMap are no longer consumed (model spin/glow and light stops still are). lib/scene/mascot.ts is the DOM/scene bridge (module stores, no three.js imports): Lumi's projected screen rect, world position, excite flag, a burst queue, and the wish-granted event name. GenieScene gains LumiRig (journey easing, banking, chat-attend, projection), BurstField (three pooled additive point bursts), WishGrid (a CPU-waved gold wireframe floor, hero-scoped by scroll fade), a drei Trail tracking a rig anchor, and mascot-scoped Sparkles. LumiHotspot (DOM) rides the projected rect at 60fps outside React state. CanvasMount adds cs-canvas-live (z-30) only when the live scene mounts.

## §3 Evidence (2026-07-02, Mac gate + WebGL visual QA)

- Gate all EXIT=0: tsc; vitest 17 files / 70 tests (10 new journey tests: interpolation, clamping, monotonicity, empty-route fallback, stop building/sorting, frustum mapping); lint; build 26/26 pages (First Load JS shared unchanged at 175 kB - the mascot code lives in the async 3D chunk); check:assets; served-route jsdom axe 0 violations /en + /vi (the hotspot renders nothing until the scene mounts, so SSR is untouched).
- WebGL visual QA (puppeteer NEW headless + ANGLE SwiftShader; the old headless shell never created a GL context, which had been hiding the 3D layer in every earlier screenshot round): hero composition with Lumi clear of the headline + wire floor; mascot at the left gutter beside the services cards; hover excitement; CLICKING THE MASCOT OPENED THE CHAT (probe chatOpen:true) with Lumi attending the panel; Lumi at the contact-form seam. Hotspot probe rect 258px at hero scale (core-sized, capped 190px radius).
- Known limits, stated: bursts and flight need the live scene (capable desktops); reduced-motion keeps the always-on-scene product decision unchanged; the trail leaves a brief streak after fast legs (comet look, decays in ~1/3s).

## §4 Input-blocking defect + fix (2026-07-02, operator-reported)

Operator: "Lumi blocks all other background interactives." Two causes, both fixed and probe-proven:

1. The r3f <canvas> element takes pointer events of its own (its event system overrides the wrapper's pointer-events:none), and once the layer rode above the content at z-30 it swallowed every click on the page. Fix: `.cs-canvas-layer, .cs-canvas-layer *` are forced inert (!important); the scene's pointer needs (gaze, camera parallax) are fed by a window listener into lib/scene/mascot.ts pointerNorm instead of r3f's state.pointer (GenieScene, LumiPlaceholder, GltfLumi all switched).
2. The hotspot button itself blanketed whatever Lumi hovered. Fix: pointer-transparent by default; it arms (data-active) only while the pointer is inside Lumi's radius AND nothing interactive lies beneath - sampled per frame with elementsFromPoint, skipping the hotspot itself in the stack (a single elementFromPoint saw the armed button as "interactive underneath" and oscillated). Keyboard focus/Enter are unaffected by pointer-events and keep working.

Probes (same automated run, all passing together): ARM active:true over empty space; mascot click -> chatOpen:true; pointer over the careers CTA -> hotspot active:false, elementFromPoint resolves the real link (A.cs-btn.cs-btn-brand); clicking that point NAVIGATES to /en/careers through the mascot layer. Full gate re-run green (tsc, 70 vitest, lint, build, assets, axe 0 en+vi).
