---
id: FR-SCENE-005
title: "Scene 4 Team — bokeh ten-avatar comp + parallax notes + recruit hook"
module: SCENE
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: I
phase: P1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002, FR-SCENE-016, FR-CTA-004]
depends_on: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002]
blocks: [FR-SCENE-016]

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 4 (Team — Trust / warmth)
  - docs/01-master-plan-v2.md §3.4 Scene 4 (warm golden-hour; bokeh transmission orbs; dimmer Lumi)
  - docs/01-master-plan-v2.md §9.1 Track 3 (Join the Team — discreet "We're hiring" link)

language: figma + storyboard
service: design/scenes/scene-4-team/
new_files:
  - design/scenes/scene-4-team/scene-4-v1.fig
  - design/scenes/scene-4-team/scene-4-{desktop-1920,tablet-1024,mobile-390}.png
  - design/scenes/scene-4-team/avatar-placement.md
  - design/scenes/scene-4-team/storyboard.md

effort_hours: 6
risk_if_skipped: "FR-SCENE-016 improvises avatar parallax + Lumi dim curves; the recruit-hook subtlety blunts; the 'humanise the team' beat doesn't land."
---

## §1 — Description (BCP-14 normative)

Per FR-SCENE-001 contract pattern. Scene-4-specific clauses:

1. **MUST** use a **warm golden-hour palette** — background `--brand-brown-400` warmer than typical scenes. No cool tones.
2. **MUST** include a **`<MeshTransmissionMaterial>` bokeh layer** — soft transmission orbs at 8-12 depth positions providing background depth-blur. Documented as a hint annotation; FR-SCENE-016 implements.
3. **MUST** place **exactly 10 avatar proxies** at varying depths (z = -2 to z = +1 in scene-space). Each avatar is a small sphere with `--brand-gold-200` rim-light, scaled 0.15-0.3 unit diameter (depending on depth — closer avatars larger).
4. **MUST** depict Lumi **pulled back / dimmed** — lower emissive (0.1 vs default 0.2), positioned slightly above frame centre, smaller than typical scenes. The team is the subject; Lumi steps back.
5. **MUST** include the Scene 4 caption verbatim: *"Ten of us. All senior. All Vietnamese. All remote."*
6. **MUST** include the **"We're hiring N" discreet link** per master plan §9.1 Track 3. The link MUST be visually subordinate — small caption, secondary placement, gold-on-brown but de-emphasised. NO loud CTA buttons in this scene; the recruit hook is a whisper.
7. **MUST** ship `avatar-placement.md` documenting the 10 avatar positions (x, y, z), scale, parallax intensity per avatar (close avatars parallax more on scroll). Used by FR-SCENE-016.
8. **MUST** include a **per-avatar hover anonymisation** spec: hovering an avatar reveals their first name + role (e.g. "Minh · Senior Engineer"). NO photos, NO LinkedIn links — privacy + recruit-hook discretion. Documented in storyboard.md.

---

## §3 — Acceptance criteria

1. **10 avatars present** — exactly 10 sphere proxies in the comp at distinct depths.
2. **Lumi dimmer** — visual review: emissive markedly lower than Scene 0; Lumi positioned above frame centre.
3. **Bokeh transmission slot** — annotated layer + handoff hint for FR-SCENE-016.
4. **Caption verbatim** — byte-identical cross-ref to en.json.
5. **"We're hiring" link present + visually subordinate** — link is text, not a button; uses caption-size typography per FR-DS-007.
6. **avatar-placement.md present** with 10 rows + parallax intensities.
7. **Hover anonymisation spec in storyboard.md** — first name + role only; no photos / no LinkedIn.
8. **storyboard.md ≤ 250 words**.
9. **No cool tones**.
10. **Founder signoff**.

## §4 — Why this design

**Why exactly 10 avatars?** Master plan §1.3 + Scene 4 caption: "Ten people. One craft." The number is part of the brand proof point. Showing 9 or 11 weakens the line.

**Why hover anonymisation (name + role, no photo)?** Privacy by default. The team is small enough that photos make them identifiable; the proof point is the COUNT, not the individuals. FR-CTA-004's hiring form is where interested talent connects with named team members.

**Why Lumi dimmed?** Master plan §2.1 Scene 4 row: *"Dim/quiet — pulls back to reveal 10 small hovering avatars."* The narrative beat is "step back; the team is the hero." Lumi remains visible but de-emphasised.

## §5 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| 11+ or 9- avatars in comp | AC#1 count | Restore to exactly 10; "Ten people" is brand-proof copy |
| Hiring CTA too loud | Visual review | Demote to text-link; FR-CTA-001 is the prominent CTA, not this |
| Photo of a team member shown | AC#7 review | Replace with abstract sphere; hover reveals name + role only |
| Lumi too bright (steals the scene) | Founder review | Lower emissive to 0.1; Lumi above frame centre, smaller scale |
| Avatars cluster (no depth variety) | avatar-placement.md review | Spread z-positions; ensure parallax visible at typical scroll velocities |

*End of FR-SCENE-005.*
