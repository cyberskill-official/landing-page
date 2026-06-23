---
id: FR-A11Y-005
title: "DOM-text mirror and noscript for canvas content"
module: A11Y
priority: SHOULD
status: shipped
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-23
depends_on: [FR-SCENE-001]
blocks: []
source_pages:
  - "research doc §B (DOM-first story), §H (text alternatives)"
---

## §1 Requirement (BCP-14 normative)

Anything the canvas communicates SHOULD also exist as readable DOM text so it is
available without WebGL.

1. Every meaningful message conveyed by the canvas SHOULD have an equivalent in
   the DOM, reachable by assistive technology.
2. A `<noscript>` fallback MUST present that text when scripts or WebGL do not
   run, so no information depends solely on the scene.
3. The canvas element MUST carry an appropriate accessible name or be marked
   decorative when its content is mirrored elsewhere.
4. The mirrored text MUST stay consistent with the story the canvas tells and
   MUST be localised per route.

## §2 Acceptance

- With scripts disabled, the `<noscript>` text conveys the canvas message.
- A screen reader can reach the mirrored text in the DOM.
- The canvas has an accessible name or is correctly marked decorative.

## §3 Evidence

Shipped. The canvas layer (`.cs-canvas-layer`) is `aria-hidden` and
pointer-events:none, so it is correctly marked decorative (§1.3). All meaningful
content (hero, sections, contact) is server-rendered HTML, so nothing is
canvas-only (§1.1). Lumi's communicative states are now mirrored as DOM text by
`components/genie/GenieStatusAnnouncer.tsx`: a `.cs-visually-hidden`
`role="status" aria-live="polite"` region that announces "Lumi is thinking" /
"Lumi is responding" from the genie store, localised per route (§1.1, §1.4). A
`<noscript>` note in the locale layout describes the decorative scene and points
to the on-page text/controls when scripts or WebGL do not run (§1.2), localised
en/vi. Verified: tsc clean, vitest 44/44, next build rc=0.
