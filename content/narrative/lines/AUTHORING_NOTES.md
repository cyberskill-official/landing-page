# Authoring Notes — FR-CMS-002 / FR-CMS-003

**Status:** v1.0.0, 2026-05-16.

---

## §1 — How to add a new line

1. Open a successor FR: `FR-CMS-NNN-line-addition-<scene>-<purpose>.md`, per AGENTS.md §16.2.
2. Append to `en.json` AND `vi.json` with a unique id following pattern `scene-N-<slug>-<role>`. Bump `version` minor in both files.
3. Run `pnpm exec vitest run content/narrative/lines/__tests__/` — must pass.
4. Add an optional context note in the FR (`content_context_<id>.md`) describing where the line plays + the beat.

---

## §2 — How to retire a line

1. Open a successor FR.
2. Set `role: "retired"` and `retired_at: <ISO-date>` on the line entry.
3. **Never delete** — keeps i18n + a11y back-references stable.
4. The retired line will not be selected by the runtime renderer (FR-CMS-007's loader filters `role !== 'retired'`).

---

## §3 — Alt-variant convention

- `role: "primary"` ships as default.
- `role: "alt-a" | "alt-b"` are available for A/B testing via flag (FR-CTA-011 in P6).
- Alts MUST follow the same voice rules — different phrasing only.
- Alts MUST NOT change the underlying beat. Scene 2's "sketch → ship close" beat is the constant; phrasing varies.
- A scene MAY have at most 2 alts; more = the beat is unclear; rewrite the primary.

---

## §4 — ID parity rule

Every line id present in `en.json` MUST also exist in `vi.json` with matching `scene_id`, `speaker`, `role`. Assertions in `__tests__/lines-vi.test.ts` (FR-CMS-003 AC#2).

When adding an EN line, immediately add the VI counterpart in the same PR. Single-locale additions break the parity test.

---

## §5 — Word/syllable cap

- **EN:** ≤ 12 words per on-screen beat (Lumi speaker). For multi-beat lines, the rule applies per beat after splitting on `. ` (sentence boundary). Document the split in the `notes` field.
- **VI:** ≤ 14 syllables per beat (same scrolling-readability calibration).

---

## §6 — Voice-rules quick check (before commit)

- [ ] No exclamation marks anywhere in either file.
- [ ] No emoji in any line text.
- [ ] No banned words (synergize, leverage-verb, world-class, cutting-edge, best-in-class) in EN.
- [ ] No banned VI phrases (đẳng cấp thế giới, etc.) in VI.
- [ ] Lumi speaker uses first-person singular only (`I`, `me`, `my`). Company speaker uses first-person plural only (`we`, `us`, `our`).
- [ ] No mixed first-person within a single line.
- [ ] VI is in NFC normalisation.
- [ ] Vietnamese diacritics preserved (`Sài Gòn`, `Việt Nam`, `ý chí`, `nguyện ước`).

---

## §7 — Cross-references

- Voice rules: [`../voice-rules.md`](../voice-rules.md)
- VI register notes: [`./VI_REGISTER_NOTES.md`](./VI_REGISTER_NOTES.md)
- Schema: [`./lines-schema.json`](./lines-schema.json)
- Test: `__tests__/lines-en.test.ts` (FR-CMS-002 §5), `__tests__/lines-vi.test.ts` (FR-CMS-003 §5)
