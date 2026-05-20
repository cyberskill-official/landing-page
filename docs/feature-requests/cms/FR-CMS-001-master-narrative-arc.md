---
id: FR-CMS-001
engineering_anchor: true
title: "Master narrative arc — 7 scenes, EN-first, Lumi voice rules locked"
module: CMS
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P0
milestone: P0 · slice 2
slice: 1
owner: Content / Copywriter + Stephen Cheng (founder, brand voice authority)
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-CMS-002, FR-CMS-003, FR-CMS-007, FR-CMS-009, FR-A11Y-001, FR-A11Y-006, FR-SCENE-001..008]
depends_on: []
blocks:
  - FR-CMS-002       # narration lines per scene (this FR locks the structure)
  - FR-CMS-003       # VI variants
  - FR-SCENE-001..008  # all scene comps reference these scene definitions

source_pages:
  - docs/01-master-plan-v2.md §2.1 (Master arc — 7 scenes table)
  - docs/01-master-plan-v2.md §2.2 (Microcopy and Lumi's voice)
  - docs/01-master-plan-v2.md §1.3 (Messaging hierarchy)
  - docs/01-master-plan-v2.md §1.1 (Lumi concept — cultural framing)

source_decisions:
  - "v2 §2.1: 7 scenes — Hero · Origin · Transformation · Capabilities · Team · Vietnam→Global · CTA Hub + Footer"
  - "v2 §2.2 voice rules: short (≤ 12 words), concrete-mythic, first-person-singular for Lumi vs first-person-plural for company, no exclamation marks, no emoji in body"

language: markdown + json
service: content/narrative/
new_files:
  - content/narrative/master-arc.md
  - content/narrative/voice-rules.md
  - content/narrative/scene-defs.json
  - content/narrative/__tests__/scene-defs-shape.test.ts
modified_files: []
allowed_tools:
  - file_read: docs/01-master-plan-v2.md
  - file_write: content/narrative/**
disallowed_tools:
  - add an 8th scene without master-plan amendment
  - use first-person-plural for Lumi or first-person-singular for the company
  - introduce exclamation marks or emoji in any narration line
  - use the words "synergize", "leverage", "world-class" anywhere in narration

effort_hours: 8
sub_tasks:
  - "1h: master-arc.md — narrative document with the 3-act compression"
  - "1h: voice-rules.md — codified rules: short, concrete-mythic, person-pronoun split, no-emoji"
  - "2h: scene-defs.json — 7 scenes typed: id, title, viewport-heights, lumi-role, emotion-beat, narrative-function"
  - "1h: founder voice-rules workshop (1-hour real-time session, recorded)"
  - "1h: 1 revision round to nail tone"
  - "1h: scene-defs-shape.test.ts — validates JSON against TS interface"
  - "1h: cross-ref check against master plan §2.1 table — byte-identical scene titles"

risk_if_skipped: |
  Without a locked master arc, every scene FR (FR-SCENE-001..008), every Lumi narration line
  (FR-CMS-002), every VI localisation (FR-CMS-003, FR-CMS-009), every A11Y caption (FR-A11Y-006)
  improvises in isolation. The voice drifts, the per-scene beats lose continuity, the buyer
  loses the through-line by Scene 3 and bounces. Skip → 1 week of cross-team realignment
  during P4.
---

## §1 — Description (BCP-14 normative)

A canonical "master narrative arc" **MUST** be authored that locks: the 7-scene structure, the per-scene emotional beats, Lumi's voice rules, and the messaging hierarchy. This document is the single source of truth that every downstream copy / caption / scene FR cites.

1. **MUST** ship `content/narrative/master-arc.md` describing the 3-act compression into 7 scenes (Pixar-style) — Scene 0 Hero through Scene 6 CTA Hub + Footer. Total dwell time at average scroll cadence: ~ 90 seconds. Total viewport heights: ~ 9.
2. **MUST** ship `content/narrative/voice-rules.md` codifying:
   - **Length:** Lumi's narration on screen ≤ 12 words per line. Hard cap.
   - **Diction:** "concrete-mythic" — concrete imagery (sketch, ship, light) over abstraction (synergy, leverage). Banned words: "synergize", "leverage" (as verb), "world-class", "cutting-edge", "best-in-class". Banned because every consultancy uses them; they read as filler.
   - **Person:** First-person singular ("I") for Lumi. First-person plural ("we") for the company. They are distinct narrators. The company is the team; Lumi is the spirit.
   - **Punctuation:** No exclamation marks. No emoji in body text. Period and em-dash only for emphasis. Power restraint.
   - **Register:** EN is operational (precise, calm); VI is slightly more poetic (cultural register; FR-CMS-003 will author the VI variants).
3. **MUST** ship `content/narrative/scene-defs.json` typed against the `SceneDef` interface (see §3.2) and containing exactly **7 scenes plus the Footer** (8 entries total). Each entry MUST mirror master plan §2.1 row-for-row:

| Scene | Title | Viewport heights | Lumi's role | Emotional beat |
|---|---|---:|---|---|
| 0 Hero | "What if your will became real?" | 1.0 | Fly-in, lands beside headline, points at scroll cue | Curiosity / intrigue |
| 1 Founder Origin | "Saigon, 2020." | 1.5 | Wisp tail coils around floating idea-spark | Empathy |
| 2 Client Transformation | "From sketch to system." | 1.5 | Uncrosses arms, paints with light | Wonder |
| 3 Capability Showcase | "How we turn will into real." | 1.5 | Splits into 4 wisp-ribbons | Confidence |
| 4 The Team Behind the Light | "Ten people. One craft." | 1.0 | Pulls back to reveal 10 avatars | Trust / warmth |
| 5 Vietnam → Global | "From Sài Gòn to your time zone." | 1.5 | Red nón lá with yellow star fades onto hood | Pride / scale-readiness |
| 6 CTA Hub | "What do you want to make real?" | 1.0 | Splits into 3 paths, turns toward focused CTA | Decision |
| Footer | Trust signals + secondary nav | 0.7 | Waves goodbye, curls into corner avatar | Closure |

4. **MUST NOT** add an 8th scene. Adding one requires a master-plan amendment per `AGENTS.md` §16.2.
5. **MUST** specify the **messaging hierarchy** (master plan §1.3) at the top of `master-arc.md`:
   - Master proposition: *"We turn your will into real software — small senior team, global craft, Vietnamese roots."*
   - Buyer proof points: 10 senior-only engineers · founded 2020 · DUNS 673219568 · 2 active long-term enterprise engagements · time-zone-honest · GDPR-ready.
   - Partner proof points: white-label friendly · React/Three.js/AI specialisation · design-system-native.
   - Recruit proof points: remote-first · craft-first · senior peers · founder-accessible.
6. **MUST** specify the **scroll-jacking ethics** (master plan §2.3) as a sub-section of `master-arc.md`: scenes are scroll-LINKED, never scroll-HIJACKED. User controls velocity.
7. **MUST** include a "Skip story" anchor pointing to Scene 6 (CTA Hub) — the always-available accessibility path.
8. **MUST** include a **localisation hooks** section noting that every narration line will be authored in `i18n/{en,vi}.json` (FR-CMS-007); the scene structure is locale-independent.
9. **MUST NOT** include actual per-scene narration lines in this FR. Those are authored in FR-CMS-002 (the next slice). This FR is structure-only.
10. **SHOULD** include a "tone reference" appendix in `master-arc.md` with three examples of acceptable Lumi voice and three counter-examples. Used by the Copywriter as the rubric for FR-CMS-002.
11. **MUST** be reviewed and approved by Stephen Cheng (founder, creative director). The signoff is a phase gate for P0 → P1.

---

## §2 — Why this design (rationale for humans)

**Why structure-only at this slice?** Locking voice rules + scene roles is a separate cognitive task from writing the actual words. If we conflate them, the founder ends up editing line-by-line and the structural conversation never happens. Authoring the rules first, then the lines (FR-CMS-002), makes each review session 4x shorter and 2x more decisive.

**Why "≤ 12 words on screen"?** Eye-tracking + onscreen-reading research: a viewer scrolling at average pace can read ~120 wpm for narrative captions. At ~1.5s dwell per scene-beat, that's ~3 words read before the beat passes. 12 words is the upper bound that the eye can catch before the next visual change. Above that, viewers skim and miss the line entirely.

**Why ban "synergize / leverage / world-class"?** Master plan §2.2: "Avoid 'synergize' / 'leverage' / 'world-class'." These words are present in 90%+ of B2B services copy and contribute nothing distinguishable. Banning them at the spec level prevents the Copywriter from defaulting to filler.

**Why first-person-singular for Lumi vs plural for company?** This is the single most distinctive narrative choice. Lumi is a character ("I light the path"); the company is a team ("We ship senior software"). The split lets Lumi be charming (singular voice carries personality) without making the company sound twee (plural keeps it professional). Conflating the two collapses the cinematic conceit.

**Why no emoji in body text?** Master plan §2.2. Emoji shift register downward; on a buyer-facing services site they signal informality which reads as inexperience. UI emoji (button icons) are fine; emoji in narration body is not.

**Why "Saigon, 2020." as Scene 1's exact title?** Master plan §2.1 — fixed. The two-word + year cadence echoes the founder's terse origin frame ("had one rule: build what you'd be proud to sign"). Don't soften it to "Founded in Saigon in 2020" — the brevity is the point.

---

## §3 — Public surface contract

### §3.1 `master-arc.md` — outline (canonical sections)

```markdown
# Master Narrative Arc — CyberSkill Landing Page

## 1. Messaging hierarchy
   - Master proposition
   - Buyer proof points
   - Partner proof points
   - Recruit proof points

## 2. The 7-scene arc (3-act compression)
   - Act 1 (Setup): Scene 0 + Scene 1
   - Act 2 (Confrontation): Scene 2 + Scene 3 + Scene 4
   - Act 3 (Resolution): Scene 5 + Scene 6 + Footer
   - Scene table (matches scene-defs.json)

## 3. Scroll-jacking ethics
   - Scenes are scroll-LINKED, not -HIJACKED
   - "Skip story" anchor → Scene 6

## 4. Localisation hooks
   - en + vi via i18n/{en,vi}.json (FR-CMS-007)
   - hreflang in <head> (FR-SEO-006)

## Appendix A — Tone reference
   - 3 good examples (Lumi voice)
   - 3 counter-examples (would fail audit)
```

### §3.2 `scene-defs.json` — typed schema

```ts
// content/narrative/scene-defs.types.ts (lives alongside the JSON for IDE introspection)
export interface SceneDef {
  id: 'scene-0' | 'scene-1' | 'scene-2' | 'scene-3' | 'scene-4' | 'scene-5' | 'scene-6' | 'footer';
  ordinal: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  viewportHeights: number;
  lumiRole: string;
  emotionBeat: string;
  narrativeFunction: string;
  /** Backlog FR-ID that ships the Figma comp for this scene. */
  comp_fr_id: string;
}

export const SCENE_DEFS: readonly SceneDef[] = [/* 8 entries — see §1 #3 */];
```

`scene-defs.json` itself is the data — kept as JSON (not TS) so it's loadable from non-TS consumers (Sanity, build scripts, future CLI tools).

### §3.3 `voice-rules.md` — canonical sections

```markdown
# Lumi Voice Rules

## Length
   - On-screen narration ≤ 12 words. Hard cap.
   - Sub-headlines ≤ 18 words.
   - CTA labels ≤ 6 words.

## Diction (concrete-mythic)
   - Banned: synergize, leverage (verb), world-class, cutting-edge, best-in-class
   - Preferred imagery: light, path, sketch, ship, wish, craft, hand, will

## Person
   - Lumi: first-person singular ("I light the path")
   - Company: first-person plural ("We ship senior software")
   - Never conflate

## Punctuation
   - No exclamation marks
   - No emoji in body
   - Em-dash for emphasis, period for closure

## Register
   - EN: operational, calm, precise
   - VI: slightly more poetic (cultural register)
```

### §3.4 The eight scene entries (verbatim cross-ref to master plan §2.1)

```json
[
  {
    "id": "scene-0",
    "ordinal": 0,
    "title": "What if your will became real?",
    "viewportHeights": 1.0,
    "lumiRole": "Fly-in, lands beside headline, points at scroll cue",
    "emotionBeat": "Curiosity / intrigue",
    "narrativeFunction": "Hook + mascot intro + above-fold CTA #1 (Buy)",
    "comp_fr_id": "FR-SCENE-001"
  },
  {
    "id": "scene-1",
    "ordinal": 1,
    "title": "Saigon, 2020.",
    "viewportHeights": 1.5,
    "lumiRole": "Wisp tail coils around floating idea-spark; voiceover-style captions tell Stephen's origin",
    "emotionBeat": "Empathy",
    "narrativeFunction": "Establishes humanity of founder + slogan meaning",
    "comp_fr_id": "FR-SCENE-002"
  },
  {
    "id": "scene-2",
    "ordinal": 2,
    "title": "From sketch to system.",
    "viewportHeights": 1.5,
    "lumiRole": "Uncrosses arms, becomes a paintbrush of light — draws a wireframe that morphs into a working app shell",
    "emotionBeat": "Wonder",
    "narrativeFunction": "Proof of capability via two real long-term engagements",
    "comp_fr_id": "FR-SCENE-003"
  },
  {
    "id": "scene-3",
    "ordinal": 3,
    "title": "How we turn will into real.",
    "viewportHeights": 1.5,
    "lumiRole": "Splits into 4 wisp-ribbons that orbit 4 capability pillars",
    "emotionBeat": "Confidence",
    "narrativeFunction": "Stack credibility — React, Three.js, AI/RAG, design systems",
    "comp_fr_id": "FR-SCENE-004"
  },
  {
    "id": "scene-4",
    "ordinal": 4,
    "title": "Ten people. One craft.",
    "viewportHeights": 1.0,
    "lumiRole": "Dim/quiet — pulls back to reveal 10 small hovering avatars",
    "emotionBeat": "Trust / warmth",
    "narrativeFunction": "Humanize the team; doubles as recruit hook",
    "comp_fr_id": "FR-SCENE-005"
  },
  {
    "id": "scene-5",
    "ordinal": 5,
    "title": "From Sài Gòn to your time zone.",
    "viewportHeights": 1.5,
    "lumiRole": "Red nón lá with yellow star fades onto Lumi's hood; tilts hat in salute; becomes luminous arc connecting HCMC to NA/EU pins",
    "emotionBeat": "Pride / scale-readiness",
    "narrativeFunction": "Address the 'but you're in Vietnam' objection head-on",
    "comp_fr_id": "FR-SCENE-006"
  },
  {
    "id": "scene-6",
    "ordinal": 6,
    "title": "What do you want to make real?",
    "viewportHeights": 1.0,
    "lumiRole": "Splits into 3 paths — Lumi turns toward whichever CTA you focus",
    "emotionBeat": "Decision",
    "narrativeFunction": "The 3-track conversion fork",
    "comp_fr_id": "FR-SCENE-007"
  },
  {
    "id": "footer",
    "ordinal": 7,
    "title": "Trust signals + secondary nav",
    "viewportHeights": 0.7,
    "lumiRole": "Lumi waves goodbye, curls into persistent corner avatar (nón lá stays on)",
    "emotionBeat": "Closure",
    "narrativeFunction": "DUNS, address, contact, hreflang",
    "comp_fr_id": "FR-SCENE-008"
  }
]
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **Files exist** — `content/narrative/master-arc.md`, `voice-rules.md`, `scene-defs.json` MUST all exist.
2. **`scene-defs.json` has 8 entries** — `jq 'length' content/narrative/scene-defs.json` MUST return `8`.
3. **Scene titles match master plan §2.1 byte-identically** — `scene-defs-shape.test.ts` MUST diff each `title` field against an inline copy of the master plan §2.1 row text. Zero diffs.
4. **Scene IDs ordered** — `jq 'map(.ordinal)' scene-defs.json` MUST return `[0,1,2,3,4,5,6,7]` (no gaps, no dupes).
5. **No banned words in voice-rules examples** — `grep -i 'synergize\|leverage\|world-class\|cutting-edge\|best-in-class' content/narrative/voice-rules.md` MAY find them ONLY inside the "Banned" section block. Outside that block, MUST be zero hits. (Test: parse-around-section grep.)
6. **No emoji in any narrative file** — `python3 -c "import re,sys; sys.exit(1 if re.search('[✀-➿-\U0001F300-\U0001FAFF]', open(sys.argv[1]).read()) else 0)" content/narrative/master-arc.md` MUST exit 0 (and same for voice-rules.md, scene-defs.json).
7. **No exclamation marks in narration-relevant sections** — `grep -c '!' content/narrative/scene-defs.json` MUST be 0. (Counter-examples in voice-rules.md may contain them — those are inside a "do not write like this" block.)
8. **First-person-pronoun split present** — `voice-rules.md` MUST contain a "Person" section explicitly stating "Lumi: first-person singular" + "Company: first-person plural". Asserted by `grep`.
9. **Cross-FR comp links resolve** — Every `comp_fr_id` in `scene-defs.json` MUST resolve to an FR file path: `test -f docs/feature-requests/scene/$(echo $id | sed 's/FR-SCENE-/FR-SCENE-/').-*.md`. (Loosely: a corresponding scene FR exists — for slice 1, only FR-SCENE-001 is authored; others are planned.)
10. **Founder signoff** — Email reply approving the narrative arc, archived to `content/narrative/signoff-FR-CMS-001.eml`.
11. **Scroll-jacking ethics section present** — `grep -i 'scroll-linked, not.*hijacked' content/narrative/master-arc.md` MUST return ≥ 1 hit.
12. **Skip-story anchor documented** — `master-arc.md` MUST contain "Skip story" pointing to Scene 6.

---

## §5 — Verification method

**Inspection (`verify: I`)** by:

1. The Copywriter — voice-rules + tone-reference + scene-defs JSON syntactic checks (~30 min).
2. The Designer — confirms scene-defs cross-reference matches the comp deliverables (~15 min).
3. The founder — voice rules workshop, narrative arc approval (~60 min real-time session).

Plus the automated tests in §4 #2, #4, #5, #6, #7 — these are machine-checkable even though the FR is `verify: I` overall (the human-judgment parts dominate).

```typescript
// content/narrative/__tests__/scene-defs-shape.test.ts
import { describe, expect, test } from 'vitest';
import scenes from '../scene-defs.json';

describe('FR-CMS-001 — scene-defs.json shape', () => {
  test('AC#2: exactly 8 scenes (7 + footer)', () => {
    expect(scenes).toHaveLength(8);
  });
  test('AC#4: ordinals 0..7, no gaps', () => {
    expect(scenes.map((s: any) => s.ordinal)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  test('AC#3: titles byte-identical to master plan §2.1', () => {
    const expected = [
      'What if your will became real?',
      'Saigon, 2020.',
      'From sketch to system.',
      'How we turn will into real.',
      'Ten people. One craft.',
      'From Sài Gòn to your time zone.',
      'What do you want to make real?',
      'Trust signals + secondary nav',
    ];
    expect(scenes.map((s: any) => s.title)).toEqual(expected);
  });
  test('AC#7: no exclamation marks anywhere in narration data', () => {
    const json = JSON.stringify(scenes);
    expect(json).not.toMatch(/!/);
  });
});
```

---

## §6 — Dependencies

None — this is the foundational narrative FR.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Scene title drifts from master plan §2.1 | AC#3 fails | Restore exact title; future plan amendments via §16.2 only |
| 8th scene proposed by stakeholder | Stakeholder review surfaces it | Reject with §16.2 + master-plan amendment requirement; do not silently add |
| Emoji slipped via copy-paste | AC#6 grep | Remove; the punctuation rule is hard |
| Banned word ("leverage") in tone examples | AC#5 fails | Replace with concrete-mythic alternative; revise the rules |
| Voice rules drift from master plan §2.2 | Manual cross-ref | Update voice-rules.md to match; never the other way (master plan is the spec) |
| Founder asks for narrative pivot post-signoff | Email | Open `FR-CMS-001a-narrative-arc-revision-1` superseding; do not edit in place |
| Lumi line creeps to 13 words in a downstream FR | FR-CMS-002 audit | The rule is enforced at FR-CMS-002 (line authoring); this FR sets the limit |
| VI register doesn't match EN register | FR-CMS-003 review | Per voice-rules.md "VI is slightly more poetic" — this is by design, but the COPY meaning must match |

---

## §8 — Notes

- The "scroll-linked, not -hijacked" rule is the design ethic of the whole site (master plan §2.3). Reinforcing it here makes it a copywriter-visible rule, not just an engineering decision.
- Banning specific filler words ("synergize", "leverage", "world-class") in the voice-rules document is unusual but pays off — it gives the Copywriter explicit permission to push back when stakeholders ask for "synergistic value proposition" language.
- The 8th entry being "footer" rather than "scene-7" is deliberate — the footer is structurally different (it isn't scroll-jacked, doesn't have a scene-camera animation) but participates in Lumi's narrative arc (the wave goodbye). Modelling it as part of the same JSON keeps the data uniform.
- `comp_fr_id` is the cross-link from this content FR back into the scene FR layer. When FR-SCENE-002..008 are authored, they MUST reference back to their scene entry in this JSON. Bidirectional traceability.

---

*End of FR-CMS-001. Audit: `FR-CMS-001-master-narrative-arc.audit.md`.*
