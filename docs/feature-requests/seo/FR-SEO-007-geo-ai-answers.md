---
id: FR-SEO-007
title: "GEO: structure content so AI answer engines can cite it"
module: SEO
priority: COULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §E (GEO, answer engines), §B (DOM-first content)"
---

## §1 Requirement (BCP-14 normative)

Content COULD be structured so generative answer engines can extract and cite
CyberSkill directly.

1. Key pages COULD carry a short, self-contained summary near the top that
   states the answer in plain text before any elaboration.
2. Service and process pages SHOULD include question-and-answer blocks and
   one-sentence definitions that an engine can lift verbatim.
3. Cite-worthy facts MUST live in the DOM as readable text, never only inside
   the canvas or images.
4. Answer-oriented blocks SHOULD align with the FAQ JSON-LD from FR-SEO-001 so
   structured and prose forms agree.

## §2 Acceptance

- A service page exposes a leading plain-text summary in the DOM.
- Question-and-answer blocks and definitions are present and readable without
  the canvas.
- FAQ prose matches the FAQ JSON-LD answers.

## §3 Evidence

Not yet implemented; acceptance pending build.
