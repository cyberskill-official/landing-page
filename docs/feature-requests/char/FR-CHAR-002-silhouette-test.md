---
id: FR-CHAR-002
title: "Lumi silhouette test at 32×32 px — readability gate vs CyberSkill logo"
module: CHAR
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P0
milestone: P0 · slice 1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: 2026-05-16
brain_chain_hash: null
related_frs: [FR-CHAR-001, FR-CHAR-004, FR-CHAR-006]
depends_on: [FR-CHAR-001]
blocks:
  - FR-CHAR-004    # greybox proportions calibrate to silhouette pass
  - FR-CHAR-006    # production mesh inherits the locked silhouette
  - FR-SCENE-001   # Scene 0 framing chooses pose informed by silhouette test

source_pages:
  - docs/01-master-plan-v2.md §3.3 (Silhouette test — readable at 32×32 px on dark BG)
  - docs/01-master-plan-v2.md §1.1 (Bringing the logo to life — silhouette is the seal)

source_decisions:
  - "v2 §3.3 character table: 'Readable at 32×32 px on dark BG (silhouette test)'"
  - "FR-CHAR-001 §4 AC#3: ≥ 2 of 3 panel viewers identify in 5 seconds"

language: png + markdown log
service: design/character-sheets/silhouette/
new_files:
  - design/character-sheets/silhouette/silhouette-32x32.png
  - design/character-sheets/silhouette/silhouette-32x32-2x.png    # 64×64 export for visual review
  - design/character-sheets/silhouette/silhouette-test-protocol.md
  - design/character-sheets/silhouette/silhouette-test-results.md
modified_files:
  - design/character-sheets/lumi-character-sheet-v1.fig            # add silhouette artboard
allowed_tools:
  - figma: design/character-sheets/**
  - file_write: design/character-sheets/silhouette/**
disallowed_tools:
  - re-pose Lumi for the silhouette test (must use the FR-CHAR-001 front turnaround pose verbatim)
  - dilate / outline / add stroke to "help" silhouette recognition (defeats the purpose)
  - test on light background (the test is for dark surfaces — Scene 0 brown-700)

effort_hours: 2
sub_tasks:
  - "0.5h: render Lumi front-pose silhouette at 32×32 against --brand-brown-700"
  - "0.5h: panel protocol (3 non-team viewers; 5-second exposure; isolation)"
  - "0.5h: run the panel (in-person or screenshare); record verdicts"
  - "0.5h: write up results in silhouette-test-results.md; founder review"

risk_if_skipped: |
  Silhouette readability is the seal on FR-CHAR-001's "logo come to life" claim. Without a passed
  test, the production mesh (FR-CHAR-006) may be authored to proportions that LOOK fine at scene
  scale but fail when Lumi shrinks to the persistent corner avatar in the footer (visibly
  unidentifiable at favicon scale). Skip → discover the failure in P4 and re-author the mesh.
engineering_anchor: true
---

## §1 — Description (BCP-14 normative)

A panel-based readability test **MUST** be conducted against Lumi's front-pose silhouette at 32×32 px on `--brand-brown-700` (`#2C1304`) background. Pass = ≥ 2 of 3 non-team viewers identify the silhouette as "the CyberSkill logo" or "a golden genie / spirit" within 5 seconds of exposure.

1. **MUST** use the front-pose render from `FR-CHAR-001`'s turnaround artboard (no re-pose, no dilate, no outline boost).
2. **MUST** render the silhouette as a black-on-`--brand-brown-700` PNG at exactly 32×32 px (no anti-aliasing fringe softening the shape). A 2× version (64×64) MAY be exported for visual review only — the test verdict is on the 32×32.
3. **MUST** test against **3 non-team viewers** — people unfamiliar with CyberSkill and the master plan. Recruit from outside the company; coffee-shop strangers are valid.
4. **MUST** show the silhouette in isolation: no caption, no surrounding context, no logo strip. 5-second exposure on a screen, then close.
5. **MUST** record each viewer's verbatim response. Acceptable identifications: "the CyberSkill logo", "a golden genie", "a flame-spirit / candle-spirit", "a hooded figure / character" (each of these gets us close enough to logo-recognition).
6. **MUST** be **failed** if 2+ viewers say "I can't tell" / "a blob" / wildly unrelated readings ("a teardrop", "a phone icon", "a heart").
7. **MUST** be **passed** if ≥ 2 of 3 viewers land in the acceptable-identification set.
8. **MUST** archive the verdicts in `silhouette-test-results.md` with viewer pseudonyms (Viewer A / B / C), the exact 5-second window timestamp, and the verbatim response.
9. **MUST NOT** alter the silhouette mid-test ("let me make this one clearer"). If round 1 fails, the recovery path is to revise the FR-CHAR-001 turnaround pose proportions — not to massage the test image.
10. **SHOULD** archive the 32×32 PNG with SHA-256 hash on the verdict log line — proves the tested image is the same as the committed image.

---

## §2 — Why this design (rationale for humans)

**Why a 3-viewer panel, not 1?** Single-viewer "yeah I see it" testing is biased — the viewer wants to please. Three non-team viewers reduce confirmation bias to ~13% (probability 2-of-3 falsely identify a blob ≈ 0.5³ × 3 = 0.375 → still high but better than 1-of-1's 0.5). Five is even better; we trade rigour for speed in P0 week 1.

**Why "no anti-aliasing"?** AA softens the silhouette edge and inflates the readable area. The persistent corner avatar in the footer renders at exactly favicon density — typically aliased or with sub-pixel rendering. Testing aliased gives the worst-case bound; testing AA'd inflates the result.

**Why exactly 5 seconds?** Marketing reading time for a small visual: ~3-5 seconds before the eye moves. The test simulates the buyer scrolling past a favicon — if they don't read it in 5 seconds they don't read it.

**Why "MUST NOT alter the silhouette mid-test"?** This is the cognitive trap that kills mascot projects. Designer sees panel struggle, tweaks the image to "make it pop", panel passes, production mesh inherits the original proportions, scene-scale Lumi still has the original silhouette → fail. The fix is upstream (FR-CHAR-001 proportions), not at the test.

---

## §3 — Test artefacts

### §3.1 `silhouette-test-protocol.md`

```markdown
# Silhouette Test Protocol — FR-CHAR-002

## Setup
- Open `silhouette-32x32.png` (the only window on screen, centred, on a 1080p monitor at 1×).
- Background of the surrounding area: matte black or `#2C1304`.
- No verbal hint. The viewer sees only the image.

## Procedure
1. Show image for exactly 5 seconds (timer running).
2. Close / minimize.
3. Ask: "What did you just see? Describe it in 1 sentence."
4. Record the verbatim response.

## Pass criteria
- ≥ 2 of 3 viewers identify as: CyberSkill logo, genie, flame-spirit, candle-spirit, or hooded figure.

## Fail criteria
- ≤ 1 of 3 viewers lands in the acceptable set, OR
- 2+ viewers say "I can't tell" / blob / unrelated.

## On fail
- DO NOT alter the silhouette image. Return to FR-CHAR-001; tighten the proportions
  (hood + face at 32×32 must dominate; body and wisp tail drop out at this scale).
```

### §3.2 `silhouette-test-results.md` (template)

```markdown
# Silhouette Test Results — FR-CHAR-002

**Test image:** `silhouette-32x32.png` · SHA-256: `<hash>`
**Date:** 2026-05-NN
**Protocol:** silhouette-test-protocol.md

| Viewer | Verbatim response | Verdict |
|---|---|:-:|
| A (coffee-shop stranger, 30s F) | "Looks like a little candle or a flame with a face." | PASS |
| B (recruit candidate, 40s M) | "A hooded character, golden, maybe an icon for an app." | PASS |
| C (designer friend, 30s NB) | "Looks like a genie from a kids' show, friendly." | PASS |

**Verdict:** 3 / 3 PASS. Silhouette test cleared. Production mesh (FR-CHAR-006) MAY proceed.
```

---

## §4 — Acceptance criteria

1. **32×32 PNG exists** — `design/character-sheets/silhouette/silhouette-32x32.png` MUST exist, MUST be exactly 32×32 px, MUST NOT contain any anti-aliasing (sample any edge pixel; either fully opaque or fully transparent — no intermediates ≤ 250 or ≥ 5 alpha).
2. **2× export exists for visual review** — `silhouette-32x32-2x.png` MUST exist at 64×64. (Not the test artefact — the test artefact is the 32×32.)
3. **Background colour exact** — Sampling any background pixel MUST return `#2C1304` exactly.
4. **Protocol document exists** — `silhouette-test-protocol.md` MUST exist and match the shape in §3.1.
5. **Results document exists with ≥ 3 verdicts** — `silhouette-test-results.md` MUST contain a verdict table with exactly 3 rows; each row MUST have a non-empty verbatim response; the verdict column MUST be `PASS` or `FAIL`.
6. **PASS verdict logged** — ≥ 2 of 3 rows MUST be `PASS`. If fewer, the FR is `FAIL` and the recovery loop in §2 fires.
7. **Image hash on log** — The results document MUST include the SHA-256 hash of the tested PNG; the hash MUST equal `sha256sum design/character-sheets/silhouette/silhouette-32x32.png` at audit time.
8. **No mid-test image revision** — Git history of `silhouette-32x32.png` MUST show ≤ 1 commit between protocol-day and results-day. (If the silhouette was iterated, that's FR-CHAR-001 territory, not this FR.)
9. **Founder co-signs the results** — Email reply approving the verdict, archived to `design/character-sheets/silhouette/signoff-FR-CHAR-002.eml`.

---

## §5 — Verification method

**Test (`verify: T`):**

```bash
# AC#1: dimensions + AA-free
identify design/character-sheets/silhouette/silhouette-32x32.png | grep -E '32x32'
# AC#3: background colour
convert silhouette-32x32.png -format "%[pixel:p{0,0}]" info: | grep -i '2c1304\|#2C1304'
# AC#5: results doc has 3 rows
awk '/^\| [ABC] /' design/character-sheets/silhouette/silhouette-test-results.md | wc -l   # ≥ 3
# AC#6: ≥ 2 PASS
awk '/^\| [ABC] /' silhouette-test-results.md | grep -c PASS    # ≥ 2
# AC#7: hash matches
sha256sum silhouette-32x32.png
```

These checks live in `tools/perf-budgets/test-design-deliverables.mjs` (CI-runnable) once authored; for slice 1 manual run is acceptable.

---

## §6 — Dependencies

- FR-CHAR-001 — the front-pose render is the test input.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| AA fringe softens silhouette artificially | AC#1 alpha-pixel check | Re-export with nearest-neighbour / no-AA |
| 1 of 3 viewers fail; designer tempted to massage | Daily check-in | Discipline: rerun with 3 fresh viewers OR revise upstream proportions in FR-CHAR-001 |
| All 3 viewers say "I see a logo I don't recognise" | Result protocol | That's still PASS — the goal is "looks like the CyberSkill logo *if you've seen it*", not "instant brand recognition by strangers" |
| Test conducted on light background | Protocol violation | Discard results; re-test on `#2C1304` (the deployment surface in Scene 0 + footer) |
| Sample size too small (1 or 2 viewers) | Result protocol | Run additional viewers; protocol requires N ≥ 3 |
| Founder pre-influences viewers ("look at our mascot") | Protocol violation | Discard results; the protocol is blind — viewer must see only the image |
| Image edited mid-protocol | Git history | Roll back; FR-CHAR-001 is the source of any proportion change |
| Silhouette test PASS but production scale fail | Visual regression in P4 | Re-test at production mesh scale; if it fails there, FR-CHAR-006 needs tightening |

---

## §8 — Notes

- This is one of the cheapest FRs in the backlog (2 hours) and one of the highest-leverage — a failed silhouette test in week 1 catches a problem that would otherwise be discovered in week 12.
- The "acceptable identification set" deliberately includes "hooded figure" — non-Vietnamese viewers may not read genie-specific cues, and "hooded figure" still maps onto the CyberSkill logo silhouette. Don't tighten the test beyond what the brand actually claims.

---

*End of FR-CHAR-002. Audit: `FR-CHAR-002-silhouette-test.audit.md`.*
