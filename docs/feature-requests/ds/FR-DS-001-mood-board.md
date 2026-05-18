---
id: FR-DS-001
title: "Mood board — Lumi-Inception-Saigon-Dusk reference assembly"
module: DS
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P0
milestone: P0 · slice 1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-DS-002, FR-DS-003, FR-CHAR-001, FR-SCENE-001..008]
depends_on: [FR-CHAR-001]
blocks:
  - FR-DS-002       # palette swatch is derived from this mood board
  - FR-SCENE-001..008  # every scene comp inherits the tonal range

source_pages:
  - docs/01-master-plan-v2.md §3.2 (Saigon Dusk palette — quintessentially Vietnamese)
  - docs/01-master-plan-v2.md §3.4 (Scene art direction — per-scene tonal injections)
  - docs/01-master-plan-v2.md §1.4 (Competitive landscape — sites to emulate)

source_decisions:
  - "v2 §3.2: 'yellow-gold on deep warm brown is the entire visual language'"
  - "v2 §1.1: warm brown evokes Bát Tràng pottery, lacquerware, Vietnamese coffee, cánh gián"
  - "v2 §1.4 emulate: Igloo Inc., Lusion v3, Immersive Garden, 14islands"

language: figma + miro
service: design/mood-boards/
new_files:
  - design/mood-boards/saigon-dusk-mood-board-v1.fig
  - design/mood-boards/saigon-dusk-mood-board-v1.pdf
  - design/mood-boards/references/                     # directory of curated references
  - design/mood-boards/rationale.md
modified_files: []
allowed_tools:
  - figma: design/mood-boards/**
  - file_read: docs/01-master-plan-v2.md
disallowed_tools:
  - include any reference that is cool-toned (cyan / blue / magenta primary)
  - include dragon / phoenix / ceremonial-Vietnamese references
  - include cost-led messaging or "Vietnam = cheap" framing in any reference
  - paste a competitor's exact composition (use as inspiration, not template)

effort_hours: 6
sub_tasks:
  - "1h: curate 12-18 references across 4 thematic clusters (palette · Vietnamese material · cinematic web · character mascots)"
  - "1h: layout in 4-cluster Figma artboard with each reference annotated"
  - "1h: rationale.md explaining each cluster + which master-plan section it serves"
  - "1h: founder review session"
  - "1h: 1 revision round"
  - "1h: PDF export + commit to LFS"

risk_if_skipped: |
  Without a mood board, every scene comp (FR-SCENE-001..008) and every DS token (FR-DS-002..008)
  derives palette / tone in isolation. The result is a site that reads as a moodless palette
  swatch rather than a cohesive cinematic experience. Skip → 1-2 days of "this doesn't feel
  right" in every scene comp review.
engineering_anchor: true
---

## §1 — Description (BCP-14 normative)

A mood board **MUST** be assembled in Figma collecting **12-18 curated visual references** across 4 thematic clusters that ratify the Saigon-Dusk tonal direction for the entire site.

1. **MUST** organise references into **4 named clusters**:
   - **Cluster A — Saigon Dusk palette** (4-6 references): photos of warm-brown + saffron-gold pairings in real Vietnamese context. Examples: Bát Tràng pottery glaze; lacquerware (sơn mài); a single áo dài in saffron; Vietnamese coffee dripping into a cup; a Saigon street at golden hour; Buddhist temple light; cánh gián (cockroach-wing brown) finish.
   - **Cluster B — Vietnamese material register** (3-4 references): textures and surfaces that signal Vietnamese materiality without iconography. Examples: handmade paper (giấy dó), woven bamboo, raw silk, lacquer surface.
   - **Cluster C — Cinematic web SOTY references** (3-4 references): screen captures from sites named in master plan §1.4. Required: Igloo Inc. (abeto), Lusion v3, one of {Immersive Garden V4, 14islands V4, Active Theory The Field}. Used for *composition + craft* reference, NOT palette (those sites are cool-toned; we're warm).
   - **Cluster D — Character mascots that work in B2B** (2-4 references): mascots that maintain professional warmth (e.g. Messenger SOTY 2025's character, Mailchimp's Freddie, Linear's circles). Used as register reference for Lumi.
2. **MUST NOT** include any reference where the primary palette is cool (cyan/blue/magenta primary). The mood board is enforcement-by-curation of the warm-only rule (master plan §3.2).
3. **MUST NOT** include dragon, phoenix, kirin, ceremonial áo dài, lotus, or tourist-Vietnamese imagery. The cultural register is contemporary, casual Vietnamese (per FR-CHAR-003's cultural note).
4. **MUST NOT** include references that lead with cost / outsourcing / "Vietnam = cheap" framing. Master plan §1.4 strategy synthesis: "do NOT lead with cost." The mood board excludes that register entirely.
5. **MUST** annotate each reference with a 1-line caption stating *what to take* from it (e.g. "Take the rim-light angle, not the figure"; "Take the surface texture, not the calligraphy").
6. **MUST** include a **rationale.md** file at the mood-board root explaining each cluster and citing the master-plan section it serves. ≤ 600 words.
7. **MUST** be reviewed by Stephen Cheng. Signoff archived to `design/mood-boards/signoff-FR-DS-001.eml`.
8. **MUST** export to PDF (A2 landscape or similar broad-spread) for offline review.
9. **MUST** be the canonical "tone reference" for FR-DS-002 (palette swatch), every FR-SCENE-NNN comp, and FR-CHAR-001's tonal alignment.
10. **SHOULD** include 1-2 *counter-examples* (annotated as "what we are NOT") to make the boundary visible. E.g. a tourist-Vietnamese composition; a cool-toned tech-shop default; an over-decorated nón lá.

---

## §2 — Why this design (rationale for humans)

**Why 4 clusters?** Three is too few (you miss either material, character, or competitive reference). Five is too many (mood boards lose coherence past ~16 references). Four named clusters with 3-6 references each = ~12-18 references total — the sweet spot for a 30-minute review.

**Why "take this, not that" annotations?** Bare mood boards get misread. The Designer pins a Lusion screencap as composition reference; a reviewer interprets it as palette reference and the next comp comes back cool-toned. Annotations close that ambiguity.

**Why counter-examples?** Master plan §1.4 spends as much text on what to AVOID as on what to emulate. The mood board mirrors that discipline. Showing "we are NOT this" is faster than litigating an aesthetic in three review cycles.

**Why "no cool tones in any reference"?** Mood boards anchor. If 1 of 16 references is cool, the next comp inevitably tries to "introduce a small cool accent for balance." Master plan §3.2 says cool tones appear ONLY in Scene 3 satellites and Scene 5 flag accents. The mood board can't seed cool-tone temptation; the constrained references appear only where master-plan-permitted.

---

## §3 — Concrete content contract

### §3.1 Cluster A — Saigon Dusk palette (4-6 refs)

Minimum:
- 1 × Bát Tràng or similar Vietnamese-pottery glazed surface (warm brown + gold)
- 1 × lacquerware (sơn mài) detail — gold leaf on warm-brown ground
- 1 × Vietnamese coffee photograph (the brown of phin-dripped cà phê đen)
- 1 × Saigon at golden hour — a urban texture, not a tourist landmark
- 1-2 × Buddhist temple interior light OR áo dài silk in saffron tone

### §3.2 Cluster B — Vietnamese material register (3-4 refs)

Minimum:
- 1 × giấy dó (handmade Vietnamese paper) close-up
- 1 × woven bamboo / rattan surface
- 1 × raw silk or natural-dyed fabric
- 1 (optional) × lacquer mid-process — visible craft

### §3.3 Cluster C — Cinematic web (3-4 refs)

Required:
- Igloo Inc. abeto (Awwwards SOTY 2024) — for the hybrid scroll + 3D pattern
- Lusion v3 (Awwwards SOTY 2023) — for baked-asset craft
- ONE of: Immersive Garden V4 / 14islands V4 / Active Theory The Field

Annotation MUST clarify: *composition + craft only; palette is ours.*

### §3.4 Cluster D — Mascots that work in B2B (2-4 refs)

Minimum:
- Messenger SOTY 2025 character (proves "cute character with a job" can win SOTY)
- ONE of: Mailchimp Freddie, Linear circles, Notion icons

### §3.5 `rationale.md` (≤ 600 words)

Structure:
- Cluster A: why each photo · cite §3.2 of master plan
- Cluster B: why register matters · cite §1.1
- Cluster C: why these specific competitors · cite §1.4
- Cluster D: why these specific mascots · cite §1.1 "B2B services audience"
- 1-2 counter-examples and why they fail (cool-toned default · tourist-Vietnamese · cost-led)

---

## §4 — Acceptance criteria

1. **Mood board file exists** — Figma + PDF at the documented paths.
2. **4 named clusters present** — Inspecting the Figma file, exactly 4 clusters with the labels in §3.1–§3.4 MUST exist.
3. **12-18 references total** — Count the reference frames across the 4 clusters: ≥ 12, ≤ 18.
4. **Each reference annotated** — Every reference frame MUST have a "take this / not that" caption ≤ 20 words.
5. **No cool-tone primaries** — Eyedropper / spot-check: no reference frame's primary palette is cool. Failure case: a reference whose dominant 30% pixel population is cyan/blue/magenta/teal.
6. **No forbidden iconography** — Visual scan: zero dragons, phoenixes, kirin, ceremonial áo dài, lotus motifs, or tourist-Vietnamese tropes among references.
7. **No cost-led framing** — Visual + annotation scan: no reference annotation mentions "cheap", "affordable", "outsourcing", "low cost", "rates", "save money".
8. **rationale.md exists + ≤ 600 words** — `wc -w design/mood-boards/rationale.md` ≤ 600.
9. **Counter-examples present** — ≥ 1 explicit "we are NOT this" reference frame, clearly distinguished from positive references (e.g. red border, "AVOID" label).
10. **Cluster C cites the 3 required SOTY refs** — Igloo Inc., Lusion v3, and ≥ 1 of {Immersive Garden V4, 14islands V4, Active Theory The Field} MUST be among the references.
11. **Founder signoff** — Email archived to `signoff-FR-DS-001.eml`.

---

## §5 — Verification method

**Inspection (`verify: I`)** by:

1. The Designer — files-exist + cluster-count + annotation completeness (~30 min).
2. The founder — tonal alignment + cultural reads (~45 min).
3. The Frontend Lead — confirms Cluster C compositions are technically achievable in R3F + scroll-rig (~15 min sanity).

---

## §6 — Dependencies

- FR-CHAR-001 — needed to align mood board's character cluster with Lumi's established register.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Cool-tone reference slips in | AC#5 spot-check | Replace; the warm-only rule is non-negotiable |
| Cluster C palette mis-read as our palette | Comp review later | Strengthen the "composition + craft only" annotation in §3.3 |
| Mood board becomes a Pinterest dump (> 18 refs) | AC#3 count | Prune; quality > quantity |
| Counter-examples interpreted as positive refs | AC#9 visual distinction | Make AVOID labels louder; red border, "✗" marker |
| Tourist-Vietnamese imagery in Cluster A | AC#6 visual scan | Replace; this is the most common misfire — use contemporary, casual sources |
| Founder asks for more colour range | Cultural review | Hold the line; if absolutely required, propose new tokens via FR-DS-NNN amendment |
| Cluster D feels twee | Founder feedback | Substitute toward Notion/Linear-style minimal mascots, not cartoon |
| Annotation drift (bare references creep in) | AC#4 audit | Add caption to every frame; no exceptions |

---

## §8 — Notes

- The mood board is the **tone anchor** for the entire site. Treat it as a permanent reference, not a P0 throwaway.
- Future variation seasons (Tết, Mid-Autumn — master plan §12.2) MAY require supplementary mood boards. Author as `FR-DS-NNN` successors, not as edits to this one.
- The "Igloo Inc. abeto" reference is the most important single inclusion — it proves the technical pattern (hybrid 3D + frictionless scroll) and the buyer-credibility register the master plan is targeting.

---

*End of FR-DS-001. Audit: `FR-DS-001-mood-board.audit.md`.*
