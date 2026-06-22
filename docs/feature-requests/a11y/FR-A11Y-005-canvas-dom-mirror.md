---
id: FR-A11Y-005
title: "DOM-text mirror and noscript for canvas content"
module: A11Y
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
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

Not yet implemented; acceptance pending build.
