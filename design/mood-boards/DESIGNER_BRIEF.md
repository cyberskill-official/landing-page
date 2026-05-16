# Designer Brief — FR-DS-001 Mood Board

**Status:** Catalog + contact sheet shipped. **Reference image curation pending.**

You have three artefacts to work with:

1. [`rationale.md`](./rationale.md) — the WHY for each cluster. 541 words. Read first.
2. [`references-catalog.json`](./references-catalog.json) — the WHAT. 4 clusters with `take-this-not-that` annotations + 3 counter-examples.
3. [`contact-sheet.html`](./contact-sheet.html) — open in a browser. Renders the catalog in Saigon Dusk theme so it doubles as a design-review surface.

## What you do next

**For each reference in `references-catalog.json`:**

1. Source an actual image matching the `search_term` (Cluster A + B) or visit the `url` and screenshot (Cluster C + D).
2. Save the image to `design/mood-boards/references/<cluster-id>-<ref-id>-<slug>.{jpg,png}` (e.g. `A-A1-bat-trang-glaze.jpg`).
3. Update the `references-catalog.json` entry's `image_url` field to point to the local path.
4. Re-open `contact-sheet.html` — the image will render in the grid.

**Cluster C (cinematic web) screenshots:** capture above-the-fold + one scroll-deep shot per reference. Keep the screenshot at 1920×1080 max.

## Once all references are sourced

1. Assemble the final Figma file at `design/mood-boards/saigon-dusk-mood-board-v1.fig` (annotate each reference with the take-this-not-that caption).
2. Export PDF: `saigon-dusk-mood-board-v1.pdf`.
3. Submit to founder for tonal-alignment signoff (FR-DS-001 AC#11).

## Acceptance criteria (FR-DS-001 §4)

You'll find the full AC list in `docs/feature-requests/ds/FR-DS-001-mood-board.md`. Highlights:

- 12-18 total references (4 clusters)
- Each reference annotated
- No cool-tone primaries
- No forbidden iconography (dragons, áo dài, tourist tropes)
- ≥ 1 counter-example explicitly labelled AVOID
- Cluster C MUST cite Igloo Inc. + Lusion v3 + 1 of {Immersive Garden V4 / 14islands V4 / Active Theory The Field}
- Founder signoff archived to `signoff-FR-DS-001.eml`
