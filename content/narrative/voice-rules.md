# Lumi Voice Rules

**Status:** v1.0.0 — adopted with FR-CMS-001 signoff, 2026-05-16
**Owner:** Stephen Cheng (founder, brand-voice authority)
**Source:** master plan §2.2 (Microcopy and Lumi's voice)
**Consumed by:** FR-CMS-002 (narration lines), FR-CMS-003 (VI variants), FR-CMS-009 (native-speaker review), every scene FR, every A11Y caption.

---

## §1 — Length

| Surface | Cap |
|---|---|
| Lumi narration (on-screen caption) | **≤ 12 words per line** (hard cap; multi-beat split via `notes` field per FR-CMS-002 §3.2) |
| Sub-headline / supporting prose | ≤ 18 words |
| CTA button label | ≤ 6 words |

The 12-word cap is calibrated to ~3-second on-screen dwell at average scroll cadence. Above that, viewers skim and miss the line.

---

## §2 — Diction: "concrete-mythic"

Prefer concrete imagery (sketch, ship, light, hand, path, wisp) over abstraction (synergy, value, transformation).

### Banned words

| Phrase | Why banned |
|---|---|
| `synergize` | Consultancy filler — adds nothing |
| `leverage` (as VERB) | Same. "Leverage our craft" is filler; "high-leverage decision" (as noun) is fine. |
| `world-class` | Empty superlative |
| `cutting-edge` | Reads as marketing-jargon |
| `best-in-class` | Same |

The grep test in FR-CMS-002 AC#7 enforces these mechanically.

### Preferred imagery

`light`, `path`, `sketch`, `ship`, `wish`, `craft`, `hand`, `will`, `spark`, `signature`, `mark`.

---

## §3 — Person

| Speaker | Voice | Example |
|---|---|---|
| **Lumi** | first-person singular | "I'll show you the rest." |
| **Company** | first-person plural | "We close it." |

These are distinct narrators. The company is the team; Lumi is the spirit. A single line MUST NOT contain both `I` and `we` referring to the speaker. FR-CMS-002 AC#8 asserts this with a pronoun-discipline test.

---

## §4 — Punctuation

| Mark | Use |
|---|---|
| Period | Closure |
| Em-dash (—) | Emphasis, mid-thought pivot |
| Colon | Reveal, list ahead |
| Question mark | The hero question (Scene 0). Otherwise rare. |
| Exclamation mark | **NEVER.** Banned everywhere. Power restraint. |
| Emoji | **NEVER in body text.** UI emoji (icon-button glyphs) are fine. |

---

## §5 — Register

| Locale | Register |
|---|---|
| **EN** | Operational. Precise. Calm. Confident. |
| **VI** | Slightly more poetic (cultural register). `ánh sáng`, `nguyện ước`, rhythmic pairings. FR-CMS-003 owns the VI variants and its `VI_REGISTER_NOTES.md` for diacritic + dialect-neutral discipline. |

---

## §6 — Tone reference (the Copywriter's rubric)

### Good (Lumi voice ✓)
- "Whisper an idea. I'll show you the rest." (Scene 0)
- "Most software dies in the gap between sketch and ship. We close it." (Scene 2)
- "From Sài Gòn to your time zone." (Scene 5)

### Bad (would fail audit ✗)
- ~~"Let's synergize your vision into reality!"~~ — three bans + 8 violations
- ~~"World-class Vietnamese developers ready to leverage AI for your roadmap."~~ — three bans
- ~~"We at CyberSkill are passionate about cutting-edge solutions 🚀"~~ — ban + emoji

---

## §7 — Localisation hooks

Every narration line lives in `i18n/{en,vi}.json` (FR-CMS-007 builds the loader). Scene structure (FR-CMS-001 scene-defs.json) is locale-independent — only the line text varies by locale. Vietnamese diacritics use NFC normalisation (FR-CMS-003 AC#11).

---

## §8 — When in doubt

Ask: would Stephen sign this line with his name? If yes, ship it. If no, rewrite.

*(Per FR-CHAR-001 Scene 1: "build what you'd be proud to sign.")*
