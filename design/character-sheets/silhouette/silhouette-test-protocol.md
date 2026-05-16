# Silhouette Test Protocol — FR-CHAR-002

**Status:** v1.0.0, 2026-05-16. Source: FR-CHAR-002 §3.1.

---

## Setup

- Open `silhouette-32x32.png` (the only window on screen, centred, on a 1080p monitor at 1× zoom).
- Background of the surrounding area: matte black or `#2C1304` (`--brand-brown-700`).
- No verbal hint. The viewer sees only the image.

## Procedure

1. **Show image for exactly 5 seconds.** Timer running. No earlier glimpse, no later second-look.
2. **Close / minimize** the window.
3. **Ask:** *"What did you just see? Describe it in one sentence."*
4. **Record the verbatim response.** Don't paraphrase. Don't probe.
5. **Repeat with N=3 non-team viewers.** Strangers from outside CyberSkill (coffee-shop recruits acceptable).

## Pass criteria

≥ **2 of 3** viewers identify as one of:
- CyberSkill logo
- A genie
- A flame-spirit / candle-spirit
- A hooded figure / character

(Verbatim language varies; the panel ratifier groups responses into the acceptable bucket at log-time.)

## Fail criteria

- ≤ **1 of 3** viewers lands in the acceptable set, OR
- 2+ viewers report "I can't tell" / "a blob" / wildly unrelated readings ("a teardrop", "a phone icon", "a heart", "a candle without a flame").

## On fail

**DO NOT alter the silhouette image to "make it pop".**

Return to **FR-CHAR-001** (the 2D character sheet) and tighten the front-pose proportions. The rule of thumb: at 32×32, hood + face should dominate the silhouette; body and wisp tail drop out gracefully. If hood + face don't read, the proportions in the 2D sheet are wrong — fix there, not here.

Re-export the 32×32 PNG from the corrected sheet and re-run with a fresh 3-viewer panel (different individuals, no repeats from round 1).

## Test record format

Log to `silhouette-test-results.md` in this same folder. Required columns: viewer pseudonym (A/B/C), verbatim response, verdict (PASS/FAIL), date/time of the 5-second window, SHA-256 of the tested PNG.

## Why N=3 (not more)

Single-viewer testing is biased — the viewer wants to please. 3 non-team viewers reduce confirmation bias to ~13%. 5+ is statistically tighter but P0 wk 1 schedule favours speed over rigour. FR-CHAR-002 §2 has the detailed rationale.
