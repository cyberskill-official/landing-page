---
id: FR-SCENE-002
title: "Canonical Lenis + GSAP ScrollTrigger RAF loop, reduced-motion safe"
module: SCENE
priority: SHOULD
status: done
class: product
verify: T
phase: P3
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-SCENE-001]
blocks: []
source_pages:
  - "research doc §J (scroll storytelling), §H (reduced motion)"
new_files:
  - lib/scroll/lenis-gsap.ts
  - components/scroll/ScrollStoryProvider.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

There MUST be one canonical scroll loop, and it MUST yield to reduced motion.

1. Lenis MUST own smooth scrolling. GSAP's ticker MUST drive `lenis.raf` with
   Lenis `autoRaf: false` and GSAP `lagSmoothing(0)`, so there is a single RAF
   source.
2. ScrollTrigger MUST update on the Lenis scroll event, keeping scene and
   triggers in sync with the smoothed position.
3. The scroll modules MUST be dynamically imported and MUST fail closed: a load
   failure MUST leave native scrolling intact.
4. Under reduced motion the provider MUST no-op, retaining the native scrollbar
   and skipping Lenis and the GSAP loop entirely.

## §2 Acceptance

- One RAF loop drives scroll (no double-RAF); ScrollTrigger tracks Lenis.
- With motion reduced, native scrolling is used and Lenis never initialises.
- A forced import failure falls back to native scroll without errors.

## §3 Evidence

Static: `lib/scroll/lenis-gsap.ts` wires the ticker with `autoRaf:false` and
`lagSmoothing(0)`; `ScrollStoryProvider` no-ops under reduced motion and imports
dynamically. Deferred: scroll feel and sync on the operator machine.
