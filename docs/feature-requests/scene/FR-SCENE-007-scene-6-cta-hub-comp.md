---
id: FR-SCENE-007
title: "Scene 6 CTA Hub — three-portal comp + audience colour-coding + Lumi-focus behaviour"
module: SCENE
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: I
phase: P1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002, FR-CTA-001, FR-SCENE-018]
depends_on: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002]
blocks: [FR-SCENE-018, FR-CTA-001]

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 6 (CTA Hub — Decision)
  - docs/01-master-plan-v2.md §3.4 Scene 6 (three glowing portals, colour-coded)
  - docs/01-master-plan-v2.md §9.1 (Three CTA tracks)

language: figma + storyboard
service: design/scenes/scene-6-cta-hub/
new_files:
  - design/scenes/scene-6-cta-hub/scene-6-v1.fig
  - design/scenes/scene-6-cta-hub/scene-6-{desktop-1920,tablet-1024,mobile-390}.png
  - design/scenes/scene-6-cta-hub/portal-focus-states.md
  - design/scenes/scene-6-cta-hub/storyboard.md

effort_hours: 6
risk_if_skipped: "FR-CTA-001 component is already 10/10 audited, but its visual treatment needs a Figma anchor. Without this comp, the three portals risk visual inconsistency with the rest of the site."
---

## §1 — Description (BCP-14 normative)

Per FR-SCENE-001 contract. Scene-6-specific clauses (this comp is the visual brief for FR-CTA-001's already-audited React component):

1. **MUST** render **exactly 3 portals** at the documented colour-coding per master plan §3.4:
   - **Buy (Book Discovery Call):** solid `--brand-gold-400` fill, dark label.
   - **Partner (Partner With Us):** `--brand-brown-500` fill with `--brand-gold-400` edge.
   - **Join (Join the Team):** `--brand-gold-100` fill with `--brand-brown-500` edge.
2. **MUST NOT** add a 4th portal. Master plan §1.2 + FR-CTA-001 §1 #1 are explicit.
3. **MUST** depict **Lumi turning toward whichever portal you focus** — comp shows 3 variants: Lumi-facing-Buy, Lumi-facing-Partner, Lumi-facing-Join. The turn is a head-rotation, not a full-body — preserves Lumi's facing-camera default.
4. **MUST** include the Scene 6 caption verbatim from FR-CMS-002: *"You bring the will. We bring the real."*
5. **MUST** include per-portal sub-headlines + describedBy copy (the audience-fit text from FR-CTA-001 §3.1 `tracks.ts`).
6. **MUST** demonstrate **44×44 minimum target size** at every breakpoint — annotated bounding boxes on the comp.
7. **MUST** show the **`:focus-visible` ring treatment**: 2-px gold-400 outline + 2-px offset per FR-A11Y-008.
8. **MUST** include a **deep-link state variant** — comp showing `?track=partner` landing state with the Partner portal pre-focused.
9. **MUST** ship `portal-focus-states.md` documenting all interaction states: default / hover / focused-keyboard / focused-deep-link / clicked-opens-modal.
10. **MUST** show the lazy-loaded form modal opening behaviour (per FR-CTA-001 §1 #6): a Suspense fallback ("Loading…") in `aria-live="polite"`, then the form replaces the fallback.

## §2 — Why this design

**Why three Lumi-turn variants in the comp?** The R3F dev needs visual reference for the head-rotation curve magnitude. Showing 3 end-poses prevents over-rotation (Lumi shouldn't break the 4th wall) and under-rotation (the turn must be perceptible).

**Why deep-link state?** Marketing campaigns target tracks separately (FR-CTA-001 §1 #15). The comp shows what happens when a LinkedIn ad links `?track=partner` — the Partner portal is already focused on arrival.

## §3 — Acceptance criteria

1. **Exactly 3 portals** at the documented colours.
2. **Caption verbatim**.
3. **3 Lumi-focus variants** (Buy / Partner / Join).
4. **Target size ≥ 44×44** at mobile (per FR-A11Y-009).
5. **`:focus-visible` ring annotated**.
6. **Deep-link state variant present** for `?track=partner`.
7. **portal-focus-states.md present** with 5 documented states.
8. **Suspense fallback shown** (loading state for modal lazy-load).
9. **storyboard.md ≤ 250 words**.
10. **Founder signoff**.

## §4 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| 4th portal proposed by stakeholder | Master plan §16.2 gate | Reject; require master-plan amendment |
| Lumi over-rotates (breaks 4th wall) | R3F dev review | Limit head-rotation to ±30° |
| Portal colour mismatch with master plan §3.4 | Eyedropper | Restore exact gold/brown variants |
| Focus ring < 2px or wrong colour | AC#5 spec | Use FR-A11Y-008's locked focus-ring spec |
| Mobile portal stacks but loses 44×44 | AC#4 mobile preview | Increase portal height; FR-CTA-001 already specifies stacked-column at < 1024 |

*End of FR-SCENE-007.*
