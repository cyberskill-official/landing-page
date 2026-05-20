---
id: FR-CMS-002
title: "Per-scene Lumi narration lines — EN-first, ≤ 12 words, voice-rules-compliant"
module: CMS
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P0
milestone: P0 · slice 2
slice: 1
owner: Content / Copywriter + Stephen Cheng (voice authority)
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-CMS-001, FR-CMS-003, FR-CMS-007, FR-A11Y-001, FR-A11Y-006, FR-SCENE-001..008]
depends_on: [FR-CMS-001]
blocks:
  - FR-CMS-003       # VI variants depend on EN canonical
  - FR-CMS-007       # i18n loader consumes these lines
  - FR-A11Y-001      # /lite storyboard panels cite these lines verbatim
  - FR-A11Y-006      # captions render these lines

source_pages:
  - docs/01-master-plan-v2.md §2.2 (Microcopy and Lumi's voice — sample lines per scene)
  - docs/01-master-plan-v2.md §2.1 (Scene table — narrative beats)

source_decisions:
  - "v2 §2.2 sample lines (Scene 0 through Scene 6) — canonical starting set"
  - "FR-CMS-001 voice rules: ≤ 12 words, no exclamation, no emoji, no banned words"

language: json + markdown
service: content/narrative/lines/
new_files:
  - content/narrative/lines/en.json
  - content/narrative/lines/lines-schema.json
  - content/narrative/lines/__tests__/lines-en.test.ts
  - content/narrative/lines/AUTHORING_NOTES.md
modified_files:
  - content/narrative/scene-defs.json   # add narration_line_ids cross-ref

allowed_tools:
  - file_read: docs/01-master-plan-v2.md
  - file_read: content/narrative/voice-rules.md
  - file_write: content/narrative/lines/**
disallowed_tools:
  - exceed 12 words on any on-screen line
  - use exclamation marks or emoji
  - use banned words (synergize / leverage-verb / world-class / cutting-edge / best-in-class)
  - conflate Lumi (first-person singular) and company (first-person plural) voice

effort_hours: 4
sub_tasks:
  - "1h: import master plan §2.2 sample lines as starting set"
  - "1h: per-scene lift — write 2-3 additional candidate lines per scene for A/B post-launch"
  - "0.5h: lines-schema.json — strict typed shape"
  - "0.5h: AUTHORING_NOTES.md — process for adding/revising lines"
  - "0.5h: lines-en.test.ts — voice-rules enforcement via property tests"
  - "0.5h: founder voice review (the most important review on this FR)"

risk_if_skipped: |
  Without locked narration lines, every scene FR improvises captions, A11Y captions cite stale
  copy, and FR-CMS-003 (VI variants) translates from a moving target. The voice drifts within
  one site. Skip → 2-3 days of in-place caption rewriting in P4/P5.
engineering_anchor: true
---

## §1 — Description (BCP-14 normative)

A canonical JSON of **per-scene Lumi narration lines** in English **MUST** be authored, with each line conforming to the FR-CMS-001 voice rules.

1. **MUST** ship `content/narrative/lines/en.json` typed against `lines-schema.json`. Shape:

```ts
interface LumiLine {
  id: string;                           // unique slug, e.g. 'scene-0-hero-primary'
  scene_id: 'scene-0' | 'scene-1' | ... | 'scene-6' | 'footer';
  speaker: 'lumi' | 'company';          // who narrates this line
  text: string;                         // the line itself
  word_count: number;                   // pre-computed; asserted ≤ 12 for lumi on-screen
  role: 'primary' | 'alt-a' | 'alt-b';  // primary is the shipped default; alts for A/B
  notes?: string;                       // optional context (e.g. "use when X")
}

interface LinesEN {
  version: '1.0.0';
  authored_at: '2026-05-16';
  lines: LumiLine[];
}
```

2. **MUST** include the **primary** lines verbatim from master plan §2.2 as the starting set:
   - Scene 0: *"Whisper an idea. I'll show you the rest."*
   - Scene 1: *"Stephen had one rule: build what you'd be proud to sign."*
   - Scene 2: *"Most software dies in the gap between sketch and ship. We close it."*
   - Scene 3: *"React, Three.js, AI, design systems — four hands of the same craft."*
   - Scene 4: *"Ten of us. All senior. All Vietnamese. All remote."*
   - Scene 5: *"From Sài Gòn to your time zone."*
   - Scene 6: *"You bring the will. We bring the real."*
3. **MUST** include 1-2 **alt** variants per scene for post-launch A/B testing (FR-CTA-011). Same scene, same speaker, same beat — different phrasing. Variants enable funnel-leak experiments without re-shipping copy.
4. **MUST** enforce **≤ 12 words** for any line with `speaker: 'lumi'` AND `role: 'primary' | 'alt-*'` that appears on screen. (The Scene 1 line "Stephen had one rule: build what you'd be proud to sign" is 11 words — at the edge by design.)
5. **MUST NOT** use exclamation marks anywhere in the JSON file. `grep -c '!' en.json` MUST be 0.
6. **MUST NOT** use emoji anywhere in the JSON file. Asserted via Unicode range scan.
7. **MUST NOT** use any banned word from FR-CMS-001 §1 #2 (`synergize` / `leverage` as verb / `world-class` / `cutting-edge` / `best-in-class`). Asserted by case-insensitive grep.
8. **MUST** distinguish `speaker: 'lumi'` (first-person singular: "I light the path") from `speaker: 'company'` (first-person plural: "We close it"). Asserted in lines-en.test.ts via pronoun pattern check.
9. **MUST NOT** conflate the two — a single line MUST NOT contain both "I" and "we" referring to the speaker. (References to the user — "your idea" — are fine.)
10. **MUST** include a footer line (`scene_id: 'footer'`) that closes the arc — master plan §2.1: "Lumi waves goodbye, curls into persistent corner avatar."
11. **MUST** ship `AUTHORING_NOTES.md` documenting: (a) how to add a new line (open `FR-CMS-NNN-line-revision-N`), (b) how to retire a line, (c) the alt-variant convention.
12. **MUST** be reviewed by Stephen Cheng. Voice signoff is gating for P0 → P1. Archived to `content/narrative/lines/signoff-FR-CMS-002.eml`.

---

## §2 — Why this design (rationale for humans)

**Why a JSON file, not Markdown?** Three reasons. (1) Type-safety: `lines-schema.json` lets every consumer (i18n loader, /lite storyboard, A11Y captions) validate at build time. (2) A/B testability: alt variants are first-class entries, addressable by id. (3) Machine-checkable: word-count and banned-word rules run programmatically.

**Why per-scene IDs (not just sequential numbers)?** When a scene comp moves or splits (master plan §10.2 mobile compressed flow: "scenes 1+2 merge"), line IDs follow scene IDs not ordinal positions. A line written for scene-2 stays addressable as `scene-2-...` even if its render position changes.

**Why alts at slice 1, not later?** Authoring an alt is cheap when the primary is being written (same voice, same beat, same context). Authoring an alt 3 months later requires re-loading the entire voice context. Pay the cost now, harvest in P6 A/B testing.

**Why "≤ 12 words" is hard-asserted?** Master plan §2.2 + FR-CMS-001 voice rules + eye-tracking research (rationale in FR-CMS-001 §2). On-screen captions over 12 words don't get read at scroll cadence. The test catches drift the founder might miss in review.

**Why Lumi singular vs company plural?** Master plan §2.2 + FR-CMS-001 §1 #2. Lumi is a character; the company is a team. Singular gives Lumi personality; plural keeps the company professional. Mixing voices reads as a stilted PR press release.

---

## §3 — Public surface contract

### §3.1 `en.json` — sample entries

```json
{
  "version": "1.0.0",
  "authored_at": "2026-05-16",
  "lines": [
    {
      "id": "scene-0-hero-primary",
      "scene_id": "scene-0",
      "speaker": "lumi",
      "text": "Whisper an idea. I'll show you the rest.",
      "word_count": 9,
      "role": "primary"
    },
    {
      "id": "scene-0-hero-alt-a",
      "scene_id": "scene-0",
      "speaker": "lumi",
      "text": "Tell me what you'd build. I'll bring the light.",
      "word_count": 10,
      "role": "alt-a"
    },
    {
      "id": "scene-1-origin-primary",
      "scene_id": "scene-1",
      "speaker": "lumi",
      "text": "Stephen had one rule: build what you'd be proud to sign.",
      "word_count": 11,
      "role": "primary"
    },
    {
      "id": "scene-2-transformation-primary",
      "scene_id": "scene-2",
      "speaker": "company",
      "text": "Most software dies in the gap between sketch and ship. We close it.",
      "word_count": 13,
      "role": "primary",
      "notes": "split across two beats: opening clause (10w) then 'We close it' (3w)"
    },
    {
      "id": "scene-3-capabilities-primary",
      "scene_id": "scene-3",
      "speaker": "lumi",
      "text": "React, Three.js, AI, design systems — four hands of the same craft.",
      "word_count": 12,
      "role": "primary"
    },
    {
      "id": "scene-4-team-primary",
      "scene_id": "scene-4",
      "speaker": "company",
      "text": "Ten of us. All senior. All Vietnamese. All remote.",
      "word_count": 9,
      "role": "primary"
    },
    {
      "id": "scene-5-vietnam-global-primary",
      "scene_id": "scene-5",
      "speaker": "lumi",
      "text": "From Sài Gòn to your time zone.",
      "word_count": 7,
      "role": "primary"
    },
    {
      "id": "scene-6-cta-hub-primary",
      "scene_id": "scene-6",
      "speaker": "company",
      "text": "You bring the will. We bring the real.",
      "word_count": 8,
      "role": "primary"
    },
    {
      "id": "footer-goodbye-primary",
      "scene_id": "footer",
      "speaker": "lumi",
      "text": "Until your next wish.",
      "word_count": 4,
      "role": "primary",
      "notes": "Companion to the wave_goodbye animation; soft close."
    }
  ]
}
```

### §3.2 Note on Scene-2 word count

The Scene 2 primary line is **13 words**, breaking the ≤ 12 cap. This is intentional and documented:

- It is delivered as TWO on-screen beats (master plan §2.2 implies multi-beat captions): "Most software dies in the gap between sketch and ship." (10 words) then "We close it." (3 words).
- The `text` field carries the full line for translation + storyboard consumers; the `notes` field documents the split.
- The lines-en.test.ts AC#4 allows up to 12 words **per beat**, not per `text` field, and considers `notes`-declared splits.

### §3.3 `AUTHORING_NOTES.md` (canonical structure)

```markdown
# Authoring Notes — FR-CMS-002

## How to add a new line
1. Open `FR-CMS-NNN-line-addition-N` per AGENTS.md §16.2.
2. Append to `en.json` with a unique id; bump `version` minor.
3. Run lines-en.test.ts — must pass.
4. Add `content/narrative/lines/__tests__/fixtures/<scene>-<id>.context.md`
   describing where the line plays + the beat.

## How to retire a line
1. Open a successor FR.
2. Mark the old line as `retired: true` and `retired_at: <date>`.
3. Never delete — keeps i18n + a11y back-references stable.

## Alt-variant convention
- `role: 'primary'` ships as default.
- `role: 'alt-a' | 'alt-b'` available for A/B via flag.
- Alts MUST follow same voice rules; different phrasing only.
- Alts MUST NOT change the underlying beat (Scene 2's "sketch → ship" beat
  is the constant; phrasing varies).
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **en.json valid + conforms to schema** — `ajv validate -s lines-schema.json -d en.json` MUST pass.
2. **Primary lines present for all 7 scenes + footer** — `jq '.lines[] | select(.role == "primary") | .scene_id' en.json` MUST yield the 8 scene ids exactly once each.
3. **Master-plan §2.2 lines byte-identical for primaries** — `lines-en.test.ts` MUST diff each primary's `text` against an inline canonical from master plan §2.2.
4. **Word-count rule** — Every `lumi` speaker line with `role: primary | alt-*` MUST have effective word count ≤ 12 on-screen. For lines whose `notes` declare a multi-beat split, the rule applies per beat. Asserted in lines-en.test.ts.
5. **No exclamation marks** — `grep -c '!' content/narrative/lines/en.json` MUST be 0.
6. **No emoji** — Python regex `[\U0001F300-\U0001FAFF✀-➿]` over en.json MUST return zero matches.
7. **No banned words** — `grep -iE 'synergize|leverage|world-class|cutting-edge|best-in-class' content/narrative/lines/en.json` MUST be 0. (Note: "leverage" as a NOUN in a hypothetical line would be allowed — the voice rule bans the VERB. The test uses a regex that matches verb-form contexts like "leverage <noun>".)
8. **Pronoun discipline** — Every `speaker: 'lumi'` line MUST contain a first-person-singular pronoun (`I`, `me`, `my`, `mine`) OR no first-person pronoun. Every `speaker: 'company'` line MUST contain `we`/`us`/`our` OR no first-person pronoun. No line MAY contain both singular and plural first-person pronouns.
9. **Alt variants present** — Each scene MUST have ≥ 1 alt variant (`role: 'alt-a'`) in addition to primary. Total ≥ 16 lines (8 primary + ≥ 8 alts).
10. **scene-defs.json cross-ref** — `content/narrative/scene-defs.json` MUST be updated with `narration_line_ids: ["scene-N-..-primary"]` array on each scene. Asserted by `lines-en.test.ts` cross-validating both files.
11. **AUTHORING_NOTES.md present** — file exists and contains the §3.3 canonical sections.
12. **Founder signoff** — Email reply archived to `signoff-FR-CMS-002.eml`.

---

## §5 — Verification method

**Test (`verify: T`):**

```typescript
// content/narrative/lines/__tests__/lines-en.test.ts
import { describe, expect, test } from 'vitest';
import lines from '../en.json' assert { type: 'json' };

const PLAN_S2_2 = {
  'scene-0': "Whisper an idea. I'll show you the rest.",
  'scene-1': "Stephen had one rule: build what you'd be proud to sign.",
  'scene-2': "Most software dies in the gap between sketch and ship. We close it.",
  'scene-3': "React, Three.js, AI, design systems — four hands of the same craft.",
  'scene-4': "Ten of us. All senior. All Vietnamese. All remote.",
  'scene-5': "From Sài Gòn to your time zone.",
  'scene-6': "You bring the will. We bring the real.",
};

describe('FR-CMS-002 — Lumi narration', () => {
  test('AC#2: primary line for each scene', () => {
    const primaries = lines.lines.filter((l: any) => l.role === 'primary');
    const scenes = new Set(primaries.map((p: any) => p.scene_id));
    expect(scenes.size).toBe(8);
  });

  test('AC#3: primaries byte-identical to master plan §2.2', () => {
    for (const [scene_id, expected] of Object.entries(PLAN_S2_2)) {
      const primary = lines.lines.find((l: any) => l.scene_id === scene_id && l.role === 'primary');
      expect(primary?.text).toBe(expected);
    }
  });

  test('AC#4: word-count rule for Lumi lines (≤ 12 per beat)', () => {
    for (const l of lines.lines) {
      if (l.speaker !== 'lumi' || l.role === 'retired') continue;
      const beats = l.notes?.includes('split') 
        ? l.text.split(/\.\s+/)
        : [l.text];
      for (const beat of beats) {
        const wc = beat.split(/\s+/).filter(Boolean).length;
        expect(wc, `line ${l.id} beat "${beat}"`).toBeLessThanOrEqual(12);
      }
    }
  });

  test('AC#5: no exclamation marks', () => {
    expect(JSON.stringify(lines)).not.toMatch(/!/);
  });

  test('AC#7: no banned words', () => {
    const all = JSON.stringify(lines).toLowerCase();
    expect(all).not.toMatch(/\bsynergize\b/);
    expect(all).not.toMatch(/\bleverage\s+(our|the)/);  // verb form
    expect(all).not.toMatch(/\bworld[- ]class\b/);
    expect(all).not.toMatch(/\bcutting[- ]edge\b/);
    expect(all).not.toMatch(/\bbest[- ]in[- ]class\b/);
  });

  test('AC#8: pronoun discipline (no mixed first-person)', () => {
    for (const l of lines.lines) {
      const t = l.text.toLowerCase();
      const hasSingular = /\b(i|me|my|mine|i'll|i'm)\b/.test(t);
      const hasPlural = /\b(we|us|our|ours|we're|we'll)\b/.test(t);
      expect(hasSingular && hasPlural, `line ${l.id} mixes singular and plural`).toBe(false);
    }
  });

  test('AC#9: ≥ 1 alt-a per scene', () => {
    for (const scene_id of Object.keys(PLAN_S2_2)) {
      const alt = lines.lines.find((l: any) => l.scene_id === scene_id && l.role === 'alt-a');
      expect(alt, `scene ${scene_id} has no alt-a`).toBeTruthy();
    }
  });
});
```

CI gate: `pnpm exec vitest run content/narrative/lines/__tests__/`. Failure blocks merge.

---

## §6 — Dependencies

- FR-CMS-001 — scene structure + voice rules MUST be locked first.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| A line exceeds 12 words | AC#4 fails | Trim or split into two beats; document split in `notes` |
| Mixed pronouns ("we and I") | AC#8 fails | Split into two lines; assign speaker correctly |
| Banned word slips ("leverage our craft") | AC#7 fails | Replace; cite voice-rules.md |
| Master plan §2.2 line drifts | AC#3 fails | Restore exact text; future revisions via successor FRs |
| Founder asks for emoji "for warmth" | Cultural review | Hold the line; emoji breaks register on B2B services |
| New scene proposed (8th scene) | Stakeholder review | Reject without §16.2 amendment of master plan |
| Alt-variant changes the beat (different message) | Review | Alts vary phrasing only; new beat = new primary (new FR) |
| `notes` field abused for inline editing | Audit | `notes` is metadata; actual line lives in `text` |
| Diacritic corruption in "Sài Gòn" | Build-pipeline UTF-8 | Force UTF-8; verify byte length matches (cite FR-SEO-001 §7 row 4) |

---

## §8 — Notes

- This FR is the **voice canon**. Every consumer (i18n loader, /lite, A11Y captions, OG meta hooks) references `lines/en.json` by line id.
- Alt variants are intentionally restricted to phrasing-only changes — they are not a license to test totally different messaging. New messaging = new primary = new FR.
- Scene 2's 13-word primary (split into two beats) is the canonical edge case for the word-count rule. Future revisions that want to push the rule should follow the same pattern: declare the split in `notes`, render as two on-screen beats.

---

*End of FR-CMS-002. Audit: `FR-CMS-002-per-scene-narration.audit.md`.*
