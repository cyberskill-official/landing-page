---
id: FR-SCENE-008
title: "Footer + persistent Lumi corner — comp + state diagram + trust signals layout"
module: SCENE
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-SCENE-001, FR-CHAR-001, FR-CHAR-003, FR-CMS-002, FR-SEO-001, FR-SCENE-019, FR-CMS-008]
depends_on: [FR-SCENE-001, FR-CHAR-001, FR-CHAR-003, FR-CMS-002]
blocks: [FR-SCENE-019, FR-CHAR-005]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Footer (Closure — Lumi waves goodbye, curls to corner)
  - docs/01-master-plan-v2.md §3.4 Footer (warm brown-400 fade; nón lá stays on)
  - docs/01-master-plan-v2.md §3.3a wave_goodbye clip

language: figma + storyboard
service: design/scenes/footer/
new_files:
  - design/scenes/footer/footer-v1.fig
  - design/scenes/footer/footer-{desktop-1920,tablet-1024,mobile-390}.png
  - design/scenes/footer/lumi-corner-state-diagram.md
  - design/scenes/footer/storyboard.md

effort_hours: 4
risk_if_skipped: "FR-SCENE-019 implementation guesses the corner-avatar persistence behaviour and trust-signal layout. The narrative-closure beat (Lumi's wave + soft VI tagline reveal) muddies."
---

## §1 — Description (BCP-14 normative)

Per FR-SCENE-001 contract. Footer-specific clauses:

1. **MUST** depict the **`wave_goodbye` clip transition** (master plan §3.3a) — Lumi waves both arms twice (2.0s), then curls down + tail spirals into a small persistent corner avatar.
2. **MUST** persist the corner-avatar across the full footer scroll. Position: top-right corner, ~ 48×48 px viewport size. Z-index above DOM trust-signal content.
3. **MUST** keep the **nón lá ON** in the corner avatar (master plan §3.3b: "stays on through the footer").
4. **MUST** include trust-signal block per master plan §9.2 + FR-SEO-001:
   - Legal name (CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY)
   - DUNS 673219568 (linked, external)
   - Founded 2020
   - Address (HCMC office)
   - Phone, info@cyberskill.world
   - Founder credit (Stephen Cheng · Trịnh Thái Anh)
5. **MUST** include the footer caption from FR-CMS-002: *"Until your next wish."* — Lumi-speaker, soft close.
6. **MUST** include secondary navigation: links to /work (case studies), /lite, /accessibility, /privacy, /terms.
7. **MUST** include the **language switcher** (en / vi) — FR-CMS-008 hreflang context.
8. **MUST NOT** include cool-tone accents. Footer warms back from cinematic brown-700 to brown-400.
9. **MUST** ship `lumi-corner-state-diagram.md` documenting the 3 corner-avatar states: idle (default loop), hover (subtle pulse + tooltip with bilingual tagline from FR-CMS-002 `lumi-tagline-hover`), scroll-back-up (rewind to wave_goodbye in reverse if user scrolls back into Scene 6).
10. **MUST** ship `storyboard.md` ≤ 250 words documenting the wave→curl transition + corner-avatar persistence.

## §2 — Why this design

**Why persistent corner avatar?** Master plan §2.1 Footer row: "curls into persistent corner avatar." It's the narrative bookend — Lumi was there at the start, Lumi is there at the end. Removing it loses the cinematic conceit's closure.

**Why nón lá stays on?** Master plan §3.3b: "Lumi has chosen its identity." Removing the nón lá in the footer would undo the Scene 5 cultural beat.

## §3 — Acceptance criteria

1. **3 breakpoint comps + auxiliary files** — all present.
2. **Lumi corner avatar at 48×48** at top-right, nón lá on.
3. **wave_goodbye transition annotated** — start pose / mid pose / corner-curled end pose visible.
4. **Trust-signal block present** with all 6 elements from §1 #4.
5. **DUNS 673219568 linked externally** (to D&B verification).
6. **Caption verbatim** from FR-CMS-002 `footer-goodbye-primary`.
7. **Language switcher present** (en / vi toggle).
8. **No cool accents** — eyedropper.
9. **lumi-corner-state-diagram.md present** with 3 states.
10. **storyboard.md ≤ 250 words**.
11. **Cross-FR check: SEO trust signals match FR-SEO-001's Schema.org claims** — no aspirational text (no "ISO 27001", no "SOC 2").
12. **Founder signoff**.

## §4 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Nón lá disappears in footer | Visual review | Restore; persistence is the cultural-arc closure |
| Trust signals include premature certifications | AC#11 cross-ref | Strip; FR-SEO-001 governs claim discipline |
| Corner avatar covers DOM nav links | Layout review | Reduce avatar opacity on hover OR offset z-index |
| Founder credit Vietnamese name diacritics corrupted | Manual check | Force UTF-8 in build pipeline (cite FR-SEO-001 §7 row 4) |
| Language switcher uses flag icons | Visual review | Use text labels ("EN" / "VI") — flags carry political baggage |
| wave_goodbye-on-scroll-back creates jank | R3F dev review | Reverse the NLA clip; verify timeline scrubbing is smooth |

*End of FR-SCENE-008.*
