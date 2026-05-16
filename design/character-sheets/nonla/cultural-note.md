# Cultural register note — Nón lá on Lumi

**Status:** v1.0.0, 2026-05-16. Source: FR-CHAR-003 §3.4.
**Cultural authority:** Stephen Cheng (founder).

This accessory is a **casual** nón lá, not a ceremonial one. The reading we want from a viewer — especially a Vietnamese viewer — is "a friendly genie has put on a hat they wear every day", not "a formal mythic figure has donned a ceremonial garment".

---

## What this means for the modeller (FR-CHAR-012)

- **Surface:** smooth solid red (`--accent-flag-red` #DA251D). NO weave texture, NO crease lines, NO painted patterns.
- **Edges:** clean, slightly worn — not pristine-new, not aged-distressed. A hat someone wears.
- **Wear angle:** forward and slightly down on the hood, like a baseball cap.
- **Star geometry:** clean 5-point, flag-flat, no inner detail, no shading. ~30% of cone diameter.
- **Interior:** lined `--brand-gold-200` (#F9D966), visible only on `nonla_tip` animation.
- **Mesh budget:** ≤ 600 tri (FR-CHAR-012 hard cap).

## What this means for the animator (FR-CHAR-011)

- `nonla_appear` (Scene 5 entry, 1.0s): fade-in onto the `hat_socket` bone. No fanfare. Like Lumi remembered they had it.
- `nonla_tip` (Scene 5 Vietnam-pin hover, 1.5s): a friendly tip — "hello" — not a deep bow. The brim moves ~15° toward camera, then settles back. Interior gold flash for ~ 0.4 s at peak tip.
- Persists from Scene 5 through the footer (master plan §3.3b: "Lumi has chosen its identity").

## What this means for the writer (FR-CMS-002, FR-CMS-003)

- Scene 5 narration MUST treat the hat as warm, casual, identity-affirming.
- **Do NOT write:** "ancient", "ceremonial", "sacred", "honoured", "traditional dress", "heritage".
- **DO write:** "from Sài Gòn", "our zone", "we wear it like a cap".

## What this means for the founder

- The nón lá is the explicit Vietnamese signal. The choice to keep it **casual** rather than ceremonial is intentional and aligned with the brand voice (modern Vietnamese, not tourist-Vietnamese).
- This signoff is **the cultural authority**, separate from the brand authority on FR-CHAR-001.
- If a future variant (Tết special edition, etc.) requires ceremonial decoration, that's a NEW accessory FR (`FR-CHAR-NNN-nonla-tet-variant`), NOT a revision of FR-CHAR-003.

---

## Cross-references

- FR-CHAR-003 §1 #5 — forbids painted patterns / dragons / phoenixes / lotus
- FR-CHAR-003 §1 #10 — `cultural-note.md` is required (this file)
- FR-CHAR-003 §7 row 4 — founder-pushback-toward-ceremonial recovery path
- master plan §3.3b — accessory spec (cone proportions, mesh budget, animation list)
- master plan §1.1 layer 2 — "explicit cultural signal: gentle, instantly readable, never kitschy"
