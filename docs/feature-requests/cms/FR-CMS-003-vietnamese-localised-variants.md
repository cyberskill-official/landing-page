---
id: FR-CMS-003
title: "Vietnamese localised variants for all narration — slightly poetic register, native review"
module: CMS
priority: SHOULD
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P0
milestone: P0 · slice 2
slice: 1
owner: Content / Copywriter (VI native) + Stephen Cheng (final cultural authority)
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-CMS-001, FR-CMS-002, FR-CMS-007, FR-CMS-009, FR-SEO-005]
depends_on: [FR-CMS-002]
blocks:
  - FR-CMS-007    # i18n loader needs VI alongside EN
  - FR-CMS-009    # native-speaker review pass references this canonical set
  - FR-SEO-005    # VI <title> + meta-description derive from these lines

source_pages:
  - docs/01-master-plan-v2.md §2.2 (Localization hooks)
  - docs/01-master-plan-v2.md §1.1 (Cultural framing — bilingual hover-reveal example "Lumi — vì ánh sáng…")
  - docs/01-master-plan-v2.md §2.2 (Voice register — VI slightly more poetic)

source_decisions:
  - "v2 §2.2: 'Vietnamese variants are slightly more poetic (cultural register), English is operational'"
  - "FR-CMS-002 voice rules: VI inherits ≤12 word limit; banned-word rule applies to VI equivalents"
  - "FR-CMS-001 voice-rules.md: 'VI: slightly more poetic (cultural register)' codified"

language: json + markdown
service: content/narrative/lines/
new_files:
  - content/narrative/lines/vi.json
  - content/narrative/lines/VI_REGISTER_NOTES.md
  - content/narrative/lines/__tests__/lines-vi.test.ts
modified_files: []
allowed_tools:
  - file_read: docs/01-master-plan-v2.md
  - file_read: content/narrative/voice-rules.md
  - file_read: content/narrative/lines/en.json
  - file_write: content/narrative/lines/**
disallowed_tools:
  - use Google-Translate machine output as final text (must be authored by VI native)
  - import 漢字 / Hán-Việt that's not in modern use (register drift)
  - use southern-only or northern-only colloquialisms that exclude the other dialect

effort_hours: 4
sub_tasks:
  - "1h: author VI primaries for each EN primary; preserve the same meaning + beat"
  - "1h: author VI alts (1 per scene minimum) — same alt-a EN beat, VI variant phrasing"
  - "0.5h: VI_REGISTER_NOTES.md — diacritic discipline + dialect-neutral rule"
  - "0.5h: lines-vi.test.ts — parity with lines-en.test.ts: id-mirror + word-count + diacritic integrity"
  - "0.5h: native-speaker review (FR-CMS-009 is the formal pass; this FR's review is the initial authoring)"
  - "0.5h: founder cultural signoff"

risk_if_skipped: |
  Without VI variants in P0, the i18n loader (FR-CMS-007) ships EN-only — the site has hreflang
  vi but serves EN content under VI. Vietnamese visitors lose the cultural-recognition moment
  described in master plan §1.1 ("a small bilingual hover-reveal in Vietnamese — gives Vietnamese
  visitors a moment of recognition"). Skip → cultural-fit gap; recruit-track + Vietnamese partner
  inquiries underperform.
engineering_anchor: true
---

## §1 — Description (BCP-14 normative)

A Vietnamese localised counterpart of `en.json` **MUST** be authored as `vi.json` with one VI variant per EN entry, preserving meaning + beat while adopting the "slightly more poetic" register documented in FR-CMS-001 voice rules.

1. **MUST** ship `content/narrative/lines/vi.json` typed against the same `lines-schema.json` as `en.json`. Every line id present in `en.json` MUST also be present in `vi.json` with matching `scene_id`, `speaker`, `role`, and (where present) `notes`.
2. **MUST** be authored by a Vietnamese native speaker. Machine translation (Google Translate / DeepL) MAY be used as a starting draft but the final text MUST be human-edited for register, idiom, and naturalness. Treat MT output as a non-final scaffold, not the deliverable.
3. **MUST** preserve the **meaning + beat** of the EN line. The VI counterpart is not a literal translation; it's a sister phrasing that lands the same narrative beat in a Vietnamese cultural register. Master plan §1.1 example: EN "Lumi — light that turns wishes into truth" / VI "Lumi — vì ánh sáng biến nguyện ước thành sự thật".
4. **MUST** adopt the "slightly more poetic" register per FR-CMS-001 voice-rules.md. Concretely:
   - Allow compound nouns with cultural resonance (`ánh sáng`, `nguyện ước`) where EN uses concrete nouns.
   - Allow rhythmic pairings (`đem ý chí · đến hiện thực`) where EN uses simpler conjunction.
   - Do NOT introduce archaic Hán-Việt (e.g. avoid `viễn vọng tương lai` over plain `tương lai`).
5. **MUST NOT** use southern-only colloquialisms (`nha`, `dô`, `mầy`) or northern-only colloquialisms (`nhé`, `cơ`, `đấy`) that mark dialect. Use neutral standard Vietnamese readable everywhere.
6. **MUST** preserve diacritic integrity. Every "Sài Gòn" MUST be byte-identical to "Sài Gòn" (UTF-8 bytes verified). Asserted via a `lines-vi.test.ts` check.
7. **MUST** apply the same banned-word rule as EN, **translated**:
   - VI equivalents of `synergize` (e.g. `tổng hợp lực` used as filler), `world-class` (e.g. `đẳng cấp thế giới`), `cutting-edge` (e.g. `tiên tiến hàng đầu`) — all banned in marketing register.
   - VI_REGISTER_NOTES.md enumerates the banned VI phrase list.
8. **MUST** apply a per-line on-screen word-count rule consistent with FR-CMS-002 AC#4. Vietnamese tends to use compounds; the rule is **≤ 14 "âm tiết" (syllables) per beat**, calibrated to roughly match English's ≤ 12 words. This is documented in VI_REGISTER_NOTES.md.
9. **MUST** include the bilingual hover-reveal tagline verbatim from master plan §1.1: `"Lumi — vì ánh sáng biến nguyện ước thành sự thật"`. ID: `lumi-tagline-hover`.
10. **MUST** ship `VI_REGISTER_NOTES.md` documenting: register guidance, banned VI phrase list, dialect-neutral rule, diacritic policy, syllable-count rule.
11. **MUST** be reviewed by Stephen Cheng. Cultural signoff archived to `content/narrative/lines/signoff-FR-CMS-003.eml`.
12. **SHOULD** be marked `accepted` only after a separate FR-CMS-009 (P5 native-speaker pass) is queued — this FR is the initial authoring; FR-CMS-009 is the formal native-speaker review. The two-pass discipline guards against author drift.

---

## §2 — Why this design (rationale for humans)

**Why SHOULD (not MUST)?** P0 is the discovery phase; the EN canonical set (FR-CMS-002) is the gating MUST. VI variants ship as SHOULD so they don't block P0 → P1 if a native author isn't immediately available. But the BACKLOG marks the VI loader (FR-CMS-007) as MUST in P4 — by then VI must exist.

**Why "preserve meaning + beat, not literal translation"?** Master plan §1.1 + §2.2: VI register is "slightly more poetic" intentionally. A literal translation of "Whisper an idea. I'll show you the rest." would be flat in Vietnamese (`Thì thầm một ý tưởng. Tôi sẽ chỉ cho bạn phần còn lại.`); a sister phrasing carries the same beat with native rhythm (`Thì thầm một ý tưởng. Để tôi soi sáng phần còn lại.`).

**Why ban dialect-marked colloquialisms?** Vietnamese readers' first reaction to dialect-marked copy is "this is for the other half of the country." Standard Vietnamese is neutral; it works for HCMC + Hà Nội + diaspora.

**Why MT-as-scaffold-not-deliverable?** MT misses register, idiom, and naturalness reliably. But it's a useful starting point — saves 30 min of typing. The rule is "human-edited final"; MT alone is forbidden.

**Why ≤ 14 syllables (not ≤ 12 words)?** Vietnamese is a syllable-isolating language; a single English word often maps to 1-3 Vietnamese syllables. Calibrating to syllable count keeps the on-screen reading time roughly equivalent. ~14 syllables = ~12-word English-equivalent. This is the master-plan implied rule made explicit.

**Why "MUST be reviewed by Stephen Cheng + queued FR-CMS-009"?** Two reviews. Stephen is the cultural authority at signoff (does this feel like CyberSkill in Vietnamese?). FR-CMS-009 is the formal native-speaker pass in P5 (does this read naturally to a random Vietnamese reader?). Author + 2 reviewers catches most issues; author + 1 misses subtleties.

---

## §3 — Public surface contract

### §3.1 `vi.json` — sample entries

```json
{
  "version": "1.0.0",
  "authored_at": "2026-05-16",
  "lines": [
    {
      "id": "scene-0-hero-primary",
      "scene_id": "scene-0",
      "speaker": "lumi",
      "text": "Thì thầm một ý tưởng. Để tôi soi sáng phần còn lại.",
      "syllable_count": 13,
      "role": "primary"
    },
    {
      "id": "scene-1-origin-primary",
      "scene_id": "scene-1",
      "speaker": "lumi",
      "text": "Stephen có một nguyên tắc: xây thứ mình đủ tự hào để ký tên.",
      "syllable_count": 14,
      "role": "primary"
    },
    {
      "id": "scene-2-transformation-primary",
      "scene_id": "scene-2",
      "speaker": "company",
      "text": "Đa số phần mềm chết trong khoảng giữa bản phác và bản ship. Chúng tôi nối liền.",
      "syllable_count": 17,
      "role": "primary",
      "notes": "split: 'Đa số phần mềm chết trong khoảng giữa bản phác và bản ship.' (13 syl) + 'Chúng tôi nối liền.' (4 syl)"
    },
    {
      "id": "scene-3-capabilities-primary",
      "scene_id": "scene-3",
      "speaker": "lumi",
      "text": "React, Three.js, AI, design systems — bốn bàn tay của cùng một nghề.",
      "syllable_count": 13,
      "role": "primary"
    },
    {
      "id": "scene-4-team-primary",
      "scene_id": "scene-4",
      "speaker": "company",
      "text": "Mười người. Đều senior. Đều Việt Nam. Đều remote.",
      "syllable_count": 10,
      "role": "primary"
    },
    {
      "id": "scene-5-vietnam-global-primary",
      "scene_id": "scene-5",
      "speaker": "lumi",
      "text": "Từ Sài Gòn đến múi giờ của bạn.",
      "syllable_count": 9,
      "role": "primary"
    },
    {
      "id": "scene-6-cta-hub-primary",
      "scene_id": "scene-6",
      "speaker": "company",
      "text": "Bạn mang ý chí. Chúng tôi mang hiện thực.",
      "syllable_count": 10,
      "role": "primary"
    },
    {
      "id": "footer-goodbye-primary",
      "scene_id": "footer",
      "speaker": "lumi",
      "text": "Hẹn lần ước nguyện sau.",
      "syllable_count": 6,
      "role": "primary"
    },
    {
      "id": "lumi-tagline-hover",
      "scene_id": "scene-0",
      "speaker": "lumi",
      "text": "Lumi — vì ánh sáng biến nguyện ước thành sự thật",
      "syllable_count": 12,
      "role": "primary",
      "notes": "verbatim from master plan §1.1; renders only on hover"
    }
  ]
}
```

### §3.2 `VI_REGISTER_NOTES.md` (canonical sections)

```markdown
# Vietnamese Register Notes — FR-CMS-003

## Register
Slightly more poetic than EN. Allow:
  - Compound nouns with cultural resonance (`ánh sáng`, `nguyện ước`)
  - Rhythmic pairings (`bạn mang · chúng tôi mang`)
Avoid:
  - Archaic Hán-Việt (`viễn vọng tương lai` → use plain `tương lai`)
  - Dialect markers (`nha`, `dô`, `nhé`, `cơ`)
  - Anglicism filler (`đẳng cấp thế giới`, `tổng hợp lực`)

## Diacritic policy
- Pre-composed Unicode normal form (NFC). No combining diacritics.
- "Sài Gòn", "Việt Nam", "ý chí", "nguyện ước" — byte-identical across renders.

## Syllable-count rule
- On-screen line: ≤ 14 syllables (âm tiết) per beat.
- Calibrated to match EN ≤ 12 words at average scroll-cadence reading time.
- Multi-beat splits documented in `notes` as for EN.

## Banned VI phrases
- `đẳng cấp thế giới` (= "world-class")
- `tiên tiến hàng đầu` (= "cutting-edge")
- `tổng hợp lực` (used as marketing-jargon "synergize")
- `tận dụng [our|công ty|đội ngũ]` (verb-form "leverage")
- `tốt nhất trong ngành` (= "best-in-class")
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **vi.json valid** — Schema validation passes against lines-schema.json (same schema as en.json).
2. **ID parity with en.json** — Every line id in `en.json` MUST also exist in `vi.json` with matching `scene_id`, `speaker`, `role`. Asserted by `lines-vi.test.ts` set-diff.
3. **Syllable count present + ≤ 14 per beat** — Every VI line MUST have a `syllable_count` field; for Lumi-speaker primary/alt lines, count ≤ 14 per beat. Multi-beat splits via `notes`.
4. **No banned VI phrases** — `grep -iE 'đẳng cấp thế giới|tiên tiến hàng đầu|tổng hợp lực|tận dụng (our|công ty|đội ngũ)|tốt nhất trong ngành' vi.json` MUST be 0.
5. **No exclamation marks** — `grep -c '!' vi.json` MUST be 0.
6. **No emoji** — Unicode emoji-range regex over vi.json MUST be 0.
7. **Diacritic integrity** — Specific spot checks: "Sài Gòn" present byte-identically in scene-5 primary; "Việt Nam" present in scene-4 primary; "nguyện ước" present in lumi-tagline-hover.
8. **Bilingual tagline present** — `lumi-tagline-hover` line MUST exist with the master plan §1.1 verbatim text: `"Lumi — vì ánh sáng biến nguyện ước thành sự thật"`.
9. **VI_REGISTER_NOTES.md present** — File exists with the canonical sections in §3.2.
10. **No dialect colloquialisms** — `grep -iE '\b(nha|dô|mầy|nhé|cơ|đấy)\b' vi.json` MUST be 0. (Note: `nhé` and `đấy` can legitimately appear in formal contexts; the rule is "as colloquial particles". Spot-check at review.)
11. **NFC Unicode** — `python3 -c "import unicodedata; s = open(sys.argv[1]).read(); assert s == unicodedata.normalize('NFC', s)" vi.json` MUST succeed.
12. **Founder cultural signoff** — Email archived to `signoff-FR-CMS-003.eml`.
13. **FR-CMS-009 queued** — The BACKLOG MUST list `FR-CMS-009 — Vietnamese script + UI string review pass by native speaker` as a P5 FR; this FR-CMS-003 is the *initial* authoring, FR-CMS-009 is the *formal* native review.

---

## §5 — Verification method

**Inspection (`verify: I`)** by:

1. The VI-native Copywriter — line authoring + register + dialect-neutral check (~90 min).
2. The founder — cultural signoff: does each line feel like Stephen would say it in VI? (~45 min).
3. Programmatic checks via `lines-vi.test.ts`:

```typescript
// content/narrative/lines/__tests__/lines-vi.test.ts
import { describe, expect, test } from 'vitest';
import vi from '../vi.json' assert { type: 'json' };
import en from '../en.json' assert { type: 'json' };
import { normalize } from 'node:string_decoder';   // or 'unicode-properties'

describe('FR-CMS-003 — Vietnamese variants', () => {
  test('AC#2: ID parity with en.json', () => {
    const enIds = new Set(en.lines.map((l: any) => l.id));
    const viIds = new Set(vi.lines.map((l: any) => l.id));
    expect(viIds).toEqual(enIds);
  });

  test('AC#3: syllable count ≤ 14 per beat for Lumi lines', () => {
    for (const l of vi.lines as any[]) {
      if (l.speaker !== 'lumi') continue;
      const beats = l.notes?.includes('split') ? l.text.split(/[.!?]\s+/) : [l.text];
      for (const beat of beats) {
        const syl = beat.split(/\s+/).filter(Boolean).length;   // Vietnamese: word ≈ syllable
        expect(syl, `${l.id} beat "${beat}"`).toBeLessThanOrEqual(14);
      }
    }
  });

  test('AC#7: Sài Gòn / Việt Nam / nguyện ước byte-identical', () => {
    const sg = vi.lines.find((l: any) => l.id === 'scene-5-vietnam-global-primary')?.text;
    expect(sg).toMatch(/Sài Gòn/);
    const team = vi.lines.find((l: any) => l.id === 'scene-4-team-primary')?.text;
    expect(team).toMatch(/Việt Nam/);
    const tag = vi.lines.find((l: any) => l.id === 'lumi-tagline-hover')?.text;
    expect(tag).toMatch(/nguyện ước/);
  });

  test('AC#8: bilingual tagline verbatim', () => {
    const tag = vi.lines.find((l: any) => l.id === 'lumi-tagline-hover');
    expect(tag?.text).toBe('Lumi — vì ánh sáng biến nguyện ước thành sự thật');
  });

  test('AC#11: NFC Unicode normalisation', () => {
    const json = JSON.stringify(vi);
    expect(json).toBe(json.normalize('NFC'));
  });
});
```

---

## §6 — Dependencies

- FR-CMS-002 — EN canonical set is the source for parity check.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| MT output shipped without human edit | Cultural review catches register flatness | Re-author the affected lines; MT is scaffold only |
| Dialect colloquialism slips ("nha") | AC#10 grep | Replace with neutral form |
| Diacritic decomposition (NFD) | AC#11 NFC check | Run `normalize('NFC')` on the file; verify byte-identical "Sài Gòn" etc. |
| Banned VI phrase ("đẳng cấp thế giới") | AC#4 grep | Replace with concrete Vietnamese phrasing |
| Syllable count miscounted (Vietnamese tokenisation edge cases) | AC#3 fails | Re-count manually; VI tokenisation = syllables separated by spaces |
| VI tagline drift from master plan §1.1 | AC#8 fails | Restore exact text; master plan is the spec |
| Native-speaker review queue not filled | AC#13 BACKLOG check | Confirm FR-CMS-009 is in the P5 entries |
| ID parity drift after EN line addition | AC#2 fails | Always add VI when adding EN; consider a `make sync-vi` script |
| Word vs syllable rule confusion | Reviewer mistakes | Document explicitly in VI_REGISTER_NOTES.md |

---

## §8 — Notes

- VI authoring is intentionally separated from formal native-speaker review (FR-CMS-009 in P5). This FR delivers the canonical VI set; FR-CMS-009 stress-tests it with a fresh native eye.
- "Để tôi soi sáng phần còn lại" (Scene 0 VI) is the literal poetic counterpart to "I'll show you the rest" — "soi sáng" carries the "light" imagery that aligns Lumi's identity (light-spirit / golden genie) with the verb. This is the kind of register choice that distinguishes hand-authored from MT.
- The bilingual hover-reveal (lumi-tagline-hover) is the single most cited cultural moment in master plan §1.1. Render path: hover Lumi → fade-in VI tagline overlay. Implementation belongs to a future SCENE FR; the text is locked here.

---

*End of FR-CMS-003. Audit: `FR-CMS-003-vietnamese-localised-variants.audit.md`.*
