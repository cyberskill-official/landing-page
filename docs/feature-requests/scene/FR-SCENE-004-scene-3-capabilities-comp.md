---
id: FR-SCENE-004
title: "Scene 3 Capabilities — quadrant comp + 4-satellite art direction + split-to-4 anim cue"
module: SCENE
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: I
phase: P1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: null
related_frs: [FR-SCENE-001, FR-CHAR-001, FR-CHAR-011, FR-CMS-002, FR-SCENE-015]
depends_on: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002]
blocks: [FR-SCENE-015]

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 3 (Capability Showcase — Confidence)
  - docs/01-master-plan-v2.md §3.4 Scene 3 (4 cool-tinted satellites; gold satellite is home base)
  - docs/01-master-plan-v2.md §3.3a `split_to_4` clip (2.5s; wisp splits into 4 ribbons)

language: figma + storyboard
service: design/scenes/scene-3-capabilities/
new_files:
  - design/scenes/scene-3-capabilities/scene-3-v1.fig
  - design/scenes/scene-3-capabilities/scene-3-{desktop-1920,tablet-1024,mobile-390}.png
  - design/scenes/scene-3-capabilities/satellite-orbits.md
  - design/scenes/scene-3-capabilities/storyboard.md

effort_hours: 6
risk_if_skipped: "FR-SCENE-015 implementation guesses satellite colour assignments and orbit paths; the 'four hands of the same craft' messaging muddies."
---

## §1 — Description (BCP-14 normative)

Per FR-SCENE-001 contract pattern. Scene-3-specific clauses:

1. **MUST** use **quadrant composition** — 4 satellites positioned at 12/3/6/9 o'clock around Lumi at frame centre. Master plan §3.4: this is the only scene that uses cool-tinted accents.
2. **MUST** assign each satellite a capability + colour (one of the 4 master-plan-§3.4-permitted cool tones):
   - **12 o'clock (top) — React:** cyan tint (`#7DD3FC` or similar; one cool family)
   - **3 o'clock (right) — Three.js:** magenta tint
   - **6 o'clock (bottom) — AI/RAG:** lime tint
   - **9 o'clock (left) — Design Systems:** gold (home base — `--brand-gold-400`)
3. **MUST NOT** use cool accents anywhere outside the 3 cool-tinted satellites. Background remains `--brand-brown-500` per master plan §3.4. Lumi remains warm-gold.
4. **MUST** depict Lumi mid-`split_to_4` clip (master plan §3.3a) — body fades; wisp splits into 4 ribbons orbiting the 4 satellites. The comp annotates each ribbon's destination satellite.
5. **MUST** include the Scene 3 caption from FR-CMS-002 verbatim: *"React, Three.js, AI, design systems — four hands of the same craft."* DOM caption, JetBrains Mono.
6. **MUST** ship `satellite-orbits.md` documenting the 4 orbit paths: starting wisp position, end satellite position, ribbon curve (ease-genie), per-ribbon emissive intensity.
7. **MUST** ship `storyboard.md` ≤ 250 words.
8. **MUST** include the logos-strip slot per master plan §9.3 (Scene 3 is the social-proof scene). Grayscale-on-dark, ≤ 6 logos, anonymised as "industry: fintech/healthtech" if NDA.

---

## §3 — Acceptance criteria

1. **Quadrant composition** — 4 satellites at the documented clock positions in §1 #2.
2. **Cool accents present only on 3 satellites** — the gold (Design Systems) satellite stays warm. Other satellites use cyan/magenta/lime.
3. **Background = brown-500** — eyedropper.
4. **Lumi remains warm-gold** — Lumi's body / wisp / hood use only gold-200/400/500 colours.
5. **Caption verbatim from FR-CMS-002** — cross-ref byte-identical.
6. **4 ribbons annotated with destinations** — satellite-orbits.md table.
7. **Logos strip slot present** — DOM-overlay region for 6 logos, grayscale.
8. **storyboard.md ≤ 250 words**.
9. **Founder signoff**.

## §4 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Cool tone bleeds onto Lumi or background | Eyedropper sweep | Constrain cool tones to the 3 satellite meshes only |
| Wrong clock positions (drift from §1 #2) | Visual review | Restore: React top, Three.js right, AI bottom, DS left (gold) |
| Logos strip uses too-prominent colour | Founder review | Grayscale-on-dark per master plan §9.3 |
| 4-ribbon paths cross / tangle | Animator + R3F dev review | Ease-genie curves should be smooth arcs; document non-crossing constraint |

*End of FR-SCENE-004.*
