# Vietnamese Register Notes — FR-CMS-003

**Status:** v1.0.0, 2026-05-16. Source: master plan §2.2 + FR-CMS-001 voice-rules.md.
**Author:** Stephen Cheng (cultural authority) — initial pass; FR-CMS-009 will run formal native-speaker review in P5.

---

## §1 — Register

Slightly more poetic than EN. Allow:
- Compound nouns with cultural resonance (`ánh sáng` = light, `nguyện ước` = wish-vow, `ý chí` = will).
- Rhythmic pairings (`bạn mang · chúng tôi mang`).

Avoid:
- Archaic Hán-Việt (`viễn vọng tương lai` → use plain `tương lai`).
- Dialect markers (`nha`, `dô`, `mầy`, `nhé` as colloquial particle, `cơ`).
- Anglicism filler (`đẳng cấp thế giới`, `tổng hợp lực`, `tận dụng tối đa`).

---

## §2 — Diacritic policy

- **Pre-composed Unicode** normal form (NFC). No combining diacritics.
- `"Sài Gòn"`, `"Việt Nam"`, `"ý chí"`, `"nguyện ước"`, `"hoàng hôn"`, `"bình minh"` — byte-identical across renders.
- Build pipeline forces `LANG=en_US.UTF-8`; output files MUST satisfy `python3 -c "import unicodedata,sys; s=open(sys.argv[1]).read(); assert s == unicodedata.normalize('NFC', s)"`.

---

## §3 — Syllable-count rule

- On-screen line: **≤ 14 âm tiết (syllables) per beat**.
- Calibrated to EN ≤ 12 words at average scroll-cadence reading time.
- Multi-beat splits documented in the `notes` field of each `vi.json` entry, same convention as EN.

Vietnamese tokenisation rule: syllables are separated by whitespace. `Sài Gòn` = 2 syllables. `múi giờ` = 2 syllables. `phần còn lại` = 3 syllables.

---

## §4 — Banned VI phrases

| VI phrase | Equivalent banned EN |
|---|---|
| `đẳng cấp thế giới` | "world-class" |
| `tiên tiến hàng đầu` | "cutting-edge" |
| `tổng hợp lực` | "synergize" (as filler) |
| `tận dụng [our \| công ty \| đội ngũ]` | "leverage" (verb form) |
| `tốt nhất trong ngành` | "best-in-class" |
| `giải pháp toàn diện` | "comprehensive solution" — empty filler |
| `đột phá` (as filler) | "breakthrough" overused |

---

## §5 — Preferred VI imagery (parallel to EN's "concrete-mythic")

| EN | VI counterpart |
|---|---|
| light | `ánh sáng` |
| path | `con đường`, `lối đi` |
| sketch | `bản phác` |
| ship (verb) | `ship` (English loan acceptable in tech context) |
| wish | `nguyện ước`, `ước nguyện` |
| craft | `nghề`, `tay nghề` |
| hand | `bàn tay` |
| will | `ý chí` |
| spark | `tia sáng`, `tia lửa` |
| sign (verb) | `ký tên` |

---

## §6 — Dialect-neutral discipline

Use neutral standard Vietnamese readable in HCMC, Hà Nội, and diaspora.

| Avoid (southern) | Avoid (northern) | Use (neutral) |
|---|---|---|
| `dô` (= vào) | `vào` is fine | `vào` |
| `mầy` (= mày, you-informal) | `mày` is fine but informal | use 2nd-person sparingly; `bạn` for "you" |
| `nha` (= nhé, soft particle) | `nhé`, `cơ`, `đấy` | (drop colloquial particles entirely) |

Exception: technical English loans (`ship`, `senior`, `remote`, `React`, `AI`) stay in English — they're the same across all VI speakers.

---

## §7 — Cross-references

- Voice rules: [`../voice-rules.md`](../voice-rules.md)
- EN canonical: [`en.json`](./en.json)
- FR-CMS-003 spec: [`../../docs/feature-requests/cms/FR-CMS-003-vietnamese-localised-variants.md`](../../../docs/feature-requests/cms/FR-CMS-003-vietnamese-localised-variants.md)
- FR-CMS-009 (P5 native-speaker pass): queued in BACKLOG §7
