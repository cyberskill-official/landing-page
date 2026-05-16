---
id: FR-SCENE-003
title: "Scene 2 Transformation — Figma comp + paint-trail spec + sketch→system morph"
module: SCENE
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: null
related_frs: [FR-SCENE-001, FR-SCENE-002, FR-CHAR-001, FR-CHAR-011, FR-CMS-002, FR-SCENE-014]
depends_on: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002]
blocks: [FR-SCENE-014]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 2 (Client Transformation — Wonder)
  - docs/01-master-plan-v2.md §3.4 Scene 2 (high-contrast paper-white-on-brown sketchpad)
  - docs/01-master-plan-v2.md §3.3a `paint` clip (4.0s; arm-uncross + light-trail)

language: figma + storyboard
service: design/scenes/scene-2-transformation/
new_files:
  - design/scenes/scene-2-transformation/scene-2-v1.fig
  - design/scenes/scene-2-transformation/scene-2-{desktop-1920,tablet-1024,mobile-390}.png
  - design/scenes/scene-2-transformation/paint-trail-spec.md
  - design/scenes/scene-2-transformation/sketch-to-app-morph-frames.png
  - design/scenes/scene-2-transformation/storyboard.md

effort_hours: 6
risk_if_skipped: "FR-SCENE-014 (P4 implementation) improvises the paint-trail shader and the morph timing; the 'sketch dies in the gap' beat blunts."
---

## §1 — Description (BCP-14 normative)

Per the FR-SCENE-001 contract pattern (3 breakpoints + canvas/DOM boundary + caption verbatim from FR-CMS-002 + LCP marker omitted since Scene 2 is not the LCP scene). Scene-2-specific clauses:

1. **MUST** use the **paper-white-on-brown sketchpad metaphor** per master plan §3.4. Background: `--brand-brown-500`. Sketchpad surface: `--brand-gold-50` plane.
2. **MUST** depict Lumi mid-`paint` clip (master plan §3.3a) — right arm extended laterally, light-trail in `--brand-gold-400` extending from the hand, drawing a wireframe.
3. **MUST** show the wireframe MORPHING into a working app shell — the comp annotates this as a "sketch → system" transition. Wireframe + app shell use ONLY gold + brown (no cyan / magenta).
4. **MUST** include the Scene 2 caption from FR-CMS-002 (`scene-2-transformation-primary`) split into 2 beats per the `notes` multi-beat rule: "Most software dies in the gap between sketch and ship." (10 words, beat 1) + "We close it." (3 words, beat 2). Each beat as a separate caption typed in JetBrains Mono.
5. **MUST** ship `paint-trail-spec.md` documenting the additive-blended trail shader hints: 6-segment curve, alpha-fade tail, `genie_rim` glow recipe.
6. **MUST** ship `sketch-to-app-morph-frames.png` — 6 keyframes showing the wireframe → working app shell transition over 4.0s (matches `paint` clip length).
7. **MUST** ship `storyboard.md` ≤ 250 words narrating the 4-second arc.
8. **MUST NOT** include cool-tone accents (Scene 3 is where the quadrant satellites diverge palette).
9. **MUST** include the pull-quote testimonial slot per master plan §9.3 ("woven into Scene 2 — 1 per scene moment"). One DOM `<blockquote>` overlay, attributed.

---

## §2 — Why this design

**Why two-beat caption?** The Scene 2 line breaks 12-word cap as a single beat (13 words). Splitting "We close it." into its own beat creates emphasis — the company's promise lands AFTER the problem statement. Master plan §2.2 narrative beat rule + FR-CMS-002 §3.2 multi-beat handling.

**Why paint-trail-spec as a separate document?** The R3F implementer (FR-SCENE-014) reads it to author the additive-blended trail shader. Figma can't render the shader; a markdown spec with curve segment count + alpha fade + glow recipe binding is the cleanest handoff.

---

## §3 — Acceptance criteria

1. **Files exist** — all per `new_files:`.
2. **Background = brown-500** — eyedropper.
3. **Sketchpad surface = gold-50** — eyedropper on the sketch plane.
4. **Light-trail in gold-400** — eyedropper on the trail.
5. **Caption split into 2 DOM beats** — storyboard.md documents the split; Figma layers show two separate caption frames.
6. **Wireframe + app shell use only gold + brown** — palette grep on the comp.
7. **No cool tones present** — eyedropper sweep.
8. **paint-trail-spec.md + morph-frames.png present**.
9. **storyboard.md ≤ 250 words**.
10. **Pull-quote `<blockquote>` slot present**.
11. **Founder signoff** archived.

## §4 — Verification

Inspection — Designer + R3F dev (paint-trail feasibility) + founder.

## §5 — Dependencies

FR-SCENE-001 (template), FR-CHAR-001 (Lumi pose), FR-CMS-002 (caption).

## §6 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Cool accent slips in | Eyedropper | Replace; Scene 3 is the only cool-accent scene |
| Caption single-beat (no split) | AC#5 visual | Split into 2 beats; storyboard documents the timing |
| Sketchpad reads as too literal (drafting board) | Founder review | Abstract: keep the paper-white plane minimal, no clipboard lines |
| Morph frames don't read as continuous | R3F dev review | Re-time keyframes; ensure ease-genie sampling |

*End of FR-SCENE-003.*
