---
id: FR-SCENE-006
title: "Scene 5 Vietnam → Global — globe + nón lá moment + HCMC→NA/EU arc"
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
related_frs: [FR-SCENE-001, FR-CHAR-001, FR-CHAR-003, FR-CHAR-011, FR-CMS-002, FR-CTA-008, FR-SCENE-017]
depends_on: [FR-SCENE-001, FR-CHAR-001, FR-CHAR-003, FR-CMS-002]
blocks: [FR-SCENE-017]

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 5 (Vietnam → Global — Pride / scale-readiness)
  - docs/01-master-plan-v2.md §3.4 Scene 5 (stylized globe; nón lá tilt; arc)
  - docs/01-master-plan-v2.md §3.3a nonla_appear + nonla_tip clips

language: figma + storyboard
service: design/scenes/scene-5-vietnam-global/
new_files:
  - design/scenes/scene-5-vietnam-global/scene-5-v1.fig
  - design/scenes/scene-5-vietnam-global/scene-5-{desktop-1920,tablet-1024,mobile-390}.png
  - design/scenes/scene-5-vietnam-global/globe-spec.md
  - design/scenes/scene-5-vietnam-global/arc-spec.md
  - design/scenes/scene-5-vietnam-global/storyboard.md

effort_hours: 8
risk_if_skipped: "The single most important cultural beat in the narrative. Without a locked comp, the nón lá moment improvises; the 'but you're in Vietnam' objection-handling muddies. Skip → cultural-fit gap that buyer track underperforms on."
---

## §1 — Description (BCP-14 normative)

Per FR-SCENE-001 contract. Scene-5-specific clauses:

1. **MUST** include a **stylized globe** — ~ 6k tri sphere (geometric icosahedral subdivision per master plan §3.4), warm-tinted (no realistic photo texture). Globe spins slowly via `useFrame` (FR-SCENE-017 implements).
2. **MUST** include a **Vietnam pin pulsing in `--accent-flag-red`** at HCMC coordinates (10.776°N, 106.701°E mapped to globe surface).
3. **MUST** depict the **`nonla_appear` moment** (master plan §3.3a) — red nón lá with single yellow star fades onto Lumi's `hat_socket` bone, 1.0s ease-genie curve. Lumi tilts hood in friendly salute. THIS IS WHERE THE NÓN LÁ APPEARS FOR THE FIRST TIME.
4. **MUST** include the **luminous arc connecting HCMC to NA/EU pins** — arc starts at the pulsing Vietnam pin, sweeps to 3 destination pins (NYC, London, Berlin or equivalent), drawn in `--brand-gold-400` shading to `--accent-star-yellow` at endpoints. The arc-draw animation MUST sync with the Scene 5 caption.
5. **MUST** include the Scene 5 caption verbatim: *"From Sài Gòn to your time zone."* (or the VI variant on /vi route).
6. **MUST** include the **time-zone-honesty live-clock widget** per master plan §9.2 + FR-CTA-008. The widget shows HCMC time + visitor's local time + overlap hours highlighted. DOM overlay, bottom-third of the frame.
7. **MUST** ship `globe-spec.md` documenting: sphere subdivision count, surface material (no realistic texture; flat gold + brown shading), spin rate, camera distance.
8. **MUST** ship `arc-spec.md` documenting: arc curve type (Bezier or great-circle), draw-on animation timing (synced to caption typing), per-endpoint pin behaviour.
9. **MUST** ship `storyboard.md` ≤ 250 words.
10. **MUST** include the **"Why us, why Vietnam" trust signals strip** per master plan §9.2: DUNS 673219568 (linked), founded 2020, 10 senior engineers, 2 active engagements, time-zone honesty (already implemented as the live clock), GDPR-ready, NDAs standard. DOM-overlay below the globe.
11. **MUST NOT** include cost-led messaging in the trust strip. Master plan §1.4 strategy synthesis is explicit: "do NOT lead with cost."
12. **MUST** be reviewed by Stephen Cheng (cultural authority — the nón lá moment IS this scene).

---

## §2 — Why this design

**Why this is the most important comp.** Scene 5 is where the site addresses the "but you're in Vietnam" objection head-on. The nón lá moment IS the cultural beat that distinguishes CyberSkill from FPT pricing tier. Get this wrong and the buyer audience exits. Get this right and the partner + recruit audiences trust the brand.

**Why a stylized globe, not realistic?** Realistic globes (NASA Earth textures) read as stock / templated. Master plan §3.4: "stylized globe (~ 6k tri) lit warmly." The geometric subdivision says "we crafted this", not "we downloaded it".

**Why arc gold-shading-to-yellow at endpoints?** Master plan §3.4: "Arc is `--brand-gold-400` shading to `--accent-star-yellow` at endpoints." The endpoints visually echo the nón lá star — narrative consistency.

## §3 — Acceptance criteria

1. **Globe present, ~ 6k tri, stylized (no photo texture)**.
2. **Vietnam pin at HCMC coords, pulses red** (`--accent-flag-red`).
3. **3 destination pins** for NA/EU markets (master plan §1.2 areaServed: US, Canada, EU, UK, AU — pick 3 visually balanced).
4. **Nón lá appears in this scene for the first time** — comp shows Lumi WITH nón lá; FR-SCENE-001..004 comps all confirm "no nón lá" (cross-FR audit).
5. **Arc drawn gold-400 → star-yellow gradient at endpoints**.
6. **Caption verbatim from FR-CMS-002** scene-5-vietnam-global-primary.
7. **Time-zone live-clock widget slot present** — DOM region for FR-CTA-008.
8. **Trust signals strip present** — DUNS + founded + headcount + GDPR + NDA. NO cost-led claims.
9. **`grep -i 'cheap\|affordable\|low.cost\|rate' design/scenes/scene-5*` returns 0**.
10. **globe-spec.md + arc-spec.md present**.
11. **Founder + cultural signoff archived**.

## §4 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Realistic Earth texture used | Visual review | Replace with flat-shaded icosahedral; stylization is brand-coherent |
| Cost-led copy in trust strip | AC#9 grep | Remove; master plan §1.4 forbids cost-leading |
| Vietnam pin not at HCMC | Coordinate spot-check | Recompute lat/lon mapping; HCMC = 10.776°N, 106.701°E |
| Arc misses destination pin | Visual review | Re-curve; great-circle arc is the cleanest math |
| Nón lá renders before Scene 5 | Cross-FR audit on Scenes 0-4 | Strip nón lá from earlier scene meshes; conditional rendering on `data-scene` attribute |
| Trust strip too prominent (steals from nón lá moment) | Founder review | Demote to footer-style layout below globe; nón lá is the hero, signals are supporting |
| Live clock widget shows wrong overlap (timezone math bug) | Manual QA | FR-CTA-008 owns; verify against UTC offset rules |

*End of FR-SCENE-006.*
