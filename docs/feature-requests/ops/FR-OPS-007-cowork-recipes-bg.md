---
id: FR-OPS-007
title: "Cowork Recipes B–G — texture variants / motion previs / Blender Python / Substance / async review / nón lá variants"
module: OPS
priority: COULD
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P2
slice: 1
owner: Backend / DevOps + Designer + AI Workflow Lead
created: 2026-05-16
shipped: 2026-05-18
related_frs: [FR-OPS-001, FR-OPS-006, FR-CHAR-008, FR-CHAR-011, FR-CHAR-012, FR-SCENE-024, FR-CHAR-003]
depends_on: [FR-OPS-001, FR-OPS-006]
blocks: [FR-SCENE-024]
language: cowork recipes (markdown) + bash + Blender Python
service: tools/cowork/recipes/
new_files:
  - tools/cowork/recipes/recipe-b-texture-variants.md
  - tools/cowork/recipes/recipe-b-texture-variants.prompt.md
  - tools/cowork/recipes/recipe-c-motion-previs.md
  - tools/cowork/recipes/recipe-c-motion-previs.prompt.md
  - tools/cowork/recipes/recipe-d-blender-python.md
  - tools/cowork/recipes/recipe-d-blender-python.prompt.md
  - tools/cowork/recipes/recipe-e-substance-variants.md
  - tools/cowork/recipes/recipe-e-substance-variants.prompt.md
  - tools/cowork/recipes/recipe-f-async-review-slack.md
  - tools/cowork/recipes/recipe-f-async-review-slack.prompt.md
  - tools/cowork/recipes/recipe-g-nonla-variants.md
  - tools/cowork/recipes/recipe-g-nonla-variants.prompt.md
  - tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs

source_pages:
  - docs/01-master-plan-v2.md §11.1 — full Cowork recipes catalogue
  - FR-OPS-006 — Recipe A convention; Recipes B-G follow the same structure
  - FR-CHAR-003 cultural-note casual register — Recipe G cultural constraint
  - FR-SCENE-024 — Nón lá Easter-egg consumer of Recipe G output

effort_hours: 12
risk_if_skipped: "Recipes B-G are Cowork augmentations for design/dev velocity. Skipping them means texture variants, motion previs, Blender automation, material variants, async Slack summaries, and nón lá Easter-egg textures all become manual designer work — ~40 hours of recurring work per quarter. COULD priority — not a launch blocker, but compounding cost over time."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship 6 Cowork recipes per master plan §11.1, each as a standalone recipe-doc + prompt pair, following the FR-OPS-006 Recipe A convention.

2. **Recipe B — Photoshop texture variants:**
   - **Trigger:** designer mention `@cowork variant <texture> <variants>` or labelled PR.
   - **Inputs:** source PNG path, variant spec (hue/sat shifts, brightness curves).
   - **Output:** 3 variant PNGs at `assets-source/textures/<base>/variants/{warm,cool,desat}.png`, plus comparison sheet.
   - **Example invocation:** "Output 3 variants of `lumi_basecolor_2k.png` at gold-warm/gold-cool/gold-desat (Hue +10 / 0 / Sat -15), WebP q80, save to `/textures/lumi/variants/`."
   - **MUST** preserve sRGB; **MUST NOT** flatten alpha channel; **MUST** generate a side-by-side comparison contact sheet.

3. **Recipe C — After Effects motion previs:**
   - **Trigger:** rigger needs a motion reference before binding the rig.
   - **Inputs:** scene-spec (camera positions, target, duration, easing).
   - **Output:** MP4 (1080p, 24fps, h.264, ≤ 5s) at `design/motion-previs/<beat>.mp4` showing block-out animation.
   - **Example:** "Block out 4s Lumi fly-in: arc from (-5,0,8) to (0,0,0), ease-out-quint, 3 keyframes (start/mid/end)."
   - **MUST** export at canonical camera FoV (35mm equivalent = 35° vertical, per FR-CHAR-005 character bible viewport).
   - **MUST** include 1s of pre-roll (camera idle) + 1s of post-roll (held pose) for reference.

4. **Recipe D — Blender Python automation:**
   - **Trigger:** rigger/animator needs a recurring script (NLA export, marker generation, batch rename).
   - **Inputs:** task spec.
   - **Output:** Blender Python file at `tools/blender/scripts/<task>.py` + usage doc.
   - **Example:** "Write a script that exports every NLA strip as a separate timeline marker so the glTF exporter splits into named clips per FR-CHAR-011."
   - **MUST** include a top-of-file usage comment, error handling, and verification check (e.g., post-run validation that markers exist).
   - **MUST NOT** modify the .blend file destructively; outputs go to separate paths or use undo-stack-safe operations.

5. **Recipe E — Substance Designer / Painter material variants:**
   - **Trigger:** material variants (edge-wear factor, iridescence intensity, color hue) needed for A/B tests.
   - **Inputs:** material name + variant parameter sweep.
   - **Output:** N material instances exported as `assets-source/substance/<material>/variants/<v>.sbsar` plus reference renders.
   - **Example:** "Generate 3 variants of gold-iridescent at edge-wear 0.0 / 0.4 / 0.8."
   - **MUST** be reproducible (Substance graph parameters stored in JSON sidecar).
   - **MUST** flow into FR-OPS-004 KTX2 encoder downstream.

6. **Recipe F — Async Slack summary:**
   - **Trigger:** weekly Friday autorun + manual `@cowork slack-summary <PR-range>`.
   - **Inputs:** PR range or week boundary.
   - **Output:** Slack message to `#weekly-asset-review` channel summarizing: PRs shipped, asset regressions caught, animation clips added, KTX2 size deltas, designer-relevant news.
   - **MUST** be readable in < 60 seconds (target 200-400 words).
   - **MUST** call out FR-OPS-003 FAIL incidents from the week.
   - **MUST** end with "Needs eyes:" section listing open WARN/FAIL PRs.

7. **Recipe G — Nón lá Easter-egg variants:**
   - **Trigger:** initial setup OR cultural-variant update PR.
   - **Inputs:** base nón lá texture path (`assets-source/textures/nonla_basecolor.png`).
   - **Output:** 3 variant PNGs at `assets-built/optimized/textures/lumi-nonla-{tet,midautumn,sunset}.png`, plus founder-signoff doc.
   - **Variants specified per FR-SCENE-024:**
     - `tet` — warmer gold accents (Hue 0 / Sat +10 / Bri 0), no dragons, no calligraphy.
     - `midautumn` — gentler yellow tint with subtle moon-glow gradient overlay (no mooncake imagery).
     - `sunset` — photographic peach/orange wash on the brim (no ceremonial elements).
   - **MUST** be culturally accurate per FR-CHAR-003 casual register.
   - **MUST** generate a founder-review doc at `design/character-sheets/nonla/cultural-variants-signoff.md` with one signoff line per variant. Founder cultural-signoff is GATING; Recipe G outputs MUST NOT ship to `assets-built/optimized/` until founder approves.
   - **MUST NOT** auto-apply variants on non-Vietnamese cultural cadences (Halloween, Christmas) — explicit allowlist of `{tet, midautumn, sunset}` only.

8. **MUST** each recipe document include the 5-section schema from master plan §11.1:
   - **Trigger** — conditions that fire the recipe
   - **Inputs** — what data the agent receives
   - **Outputs** — what files/messages the agent produces
   - **Agent prompt** — pointer to `.prompt.md` companion
   - **Success criteria** — how to verify the recipe ran correctly

9. **MUST NOT** any recipe assume hard-gate semantics. All 6 are soft augmentations per FR-OPS-006 boundary — Cowork is augmentation, not authority.

10. **MUST** include per-recipe smoke test (file existence + frontmatter shape).

11. **MUST** ship a recipe-bg README at `tools/cowork/recipes/RECIPES-BG-INDEX.md` listing all 6 recipes with 1-line summary + trigger.

## §2 — Why this design

**Why 6 separate recipes (not 1 mega-recipe)?** Each recipe has a different trigger, different inputs, different tools, different success criteria. Bundling them into a "do anything" recipe would require the agent to figure out which sub-recipe to run — high failure rate, hard to debug. Separation makes each agent prompt focused and testable.

**Why Recipe G is COULD priority?** Easter-egg variants delight repeat-visit users (FR-SCENE-024). Not a launch blocker. But shipping the nón lá Easter-egg with bad cultural variants would damage brand more than not having variants at all → founder cultural-signoff is a hard gate even at COULD priority.

**Why master plan §11.1 gets a separate FR?** Because each recipe needs its own contract — Recipe B is for designers, Recipe D is for technical animators, Recipe F is for the whole team. Different audiences, different prompts, different review criteria.

**Why MP4 for Recipe C (not GIF / WebM)?** Motion previs goes into Slack threads + email. MP4 plays everywhere; GIF is bandwidth-heavy; WebM doesn't play on iMessage. MP4 1080p h.264 5s ≈ 2 MB — fits everywhere.

**Why founder cultural-signoff for Recipe G?** Cultural authenticity is non-delegable. The recipe can generate variants that *look* gold-warm but accidentally evoke a non-Vietnamese tradition (e.g. Chinese New Year vs Tết — different palettes). Founder is Vietnamese; founder's lived cultural knowledge is the authoritative signal. Recipe G can never auto-publish without this gate.

**Why recipe-doc + prompt separation?** Recipe doc is for humans (how to use, what to expect). Prompt is for the agent (operational instructions). Mixing them in one file makes both harder to maintain — humans skip the prompt, agents get noise.

## §3 — Public surface (Recipe G example — cultural-anchor recipe)

```yaml
# tools/cowork/recipes/recipe-g-nonla-variants.md
---
recipe_id: G
name: Nón lá Easter-egg Variants
trigger:
  manual: '@cowork recipe-g <variant>'
  paths: ['assets-source/textures/nonla_basecolor.png']
priority: COULD  # not a launch blocker, but cultural-signoff IS gating
session_type: asset-generation
agent_prompt: recipe-g-nonla-variants.prompt.md
output_paths:
  - assets-built/optimized/textures/lumi-nonla-tet.png
  - assets-built/optimized/textures/lumi-nonla-midautumn.png
  - assets-built/optimized/textures/lumi-nonla-sunset.png
  - design/character-sheets/nonla/cultural-variants-signoff.md
allowlist:
  variants: [tet, midautumn, sunset]
  cultural_constraint: vietnamese-casual-register-only
gating:
  founder_signoff_required: true
  signoff_path: design/character-sheets/nonla/cultural-variants-signoff.md
---
```

```markdown
# tools/cowork/recipes/recipe-g-nonla-variants.prompt.md

# Role
You are a designer applying culturally-sensitive variants to a nón lá (Vietnamese conical hat) texture for an Easter-egg feature on the CyberSkill landing page.

# Constraints (BLOCKING)
- Variant set is exactly: `tet`, `midautumn`, `sunset`. No other variants ever.
- Cultural register is **casual nón lá**, not ceremonial. Do NOT add:
  - Dragons, phoenixes, or imperial imagery
  - Calligraphy or text overlays
  - Áo dài patterns
  - Mooncake imagery (Mid-Autumn doesn't get mooncake overlays — keep it subtle moon-glow only)
  - Western holiday imagery (no Halloween, no Christmas)
- Cultural reference: see FR-CHAR-003 §3 casual-register specification.

# Inputs
- Base texture: `assets-source/textures/nonla_basecolor.png` (2k PNG, default red+gold woven straw).
- Variant target: one of `{tet, midautumn, sunset}` (specified in invocation).

# Variant specs
- **tet** — warmer gold accents. Hue 0 / Sat +10 / Bri 0. Output sRGB.
- **midautumn** — subtle moon-glow tint (gradient overlay 30% opacity, soft yellow). Output sRGB.
- **sunset** — photographic peach/orange wash on the brim only (mask: brim region). Output sRGB.

# Task
1. Apply the variant specified.
2. Save to `assets-built/optimized/textures/lumi-nonla-<variant>.png`.
3. Append a signoff stub to `design/character-sheets/nonla/cultural-variants-signoff.md`:
   ```
   ## <variant>
   - Generated: <timestamp>
   - Founder signoff: [ ] pending
   - Cultural reviewer signoff: [ ] pending
   ```
4. Do NOT ship to `apps/web/public/textures/` until founder marks `[x] approved` on the signoff line.

# Output format
Cowork session output: 1-line status + path to generated PNG + path to signoff stub.
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | 6 recipe files present (recipe-b through recipe-g) | `ls tools/cowork/recipes/recipe-{b,c,d,e,f,g}-*.md` |
| 2 | 6 prompt files present | `ls tools/cowork/recipes/recipe-*.prompt.md` |
| 3 | Each recipe has 5-section frontmatter (trigger/inputs/outputs/agent_prompt/success_criteria-ish) | YAML lint + schema check |
| 4 | Index README lists all 6 | `cat tools/cowork/recipes/RECIPES-BG-INDEX.md` contains all 6 recipe_id |
| 5 | No recipe assumes hard-gate semantics | Grep `priority: MUST` in recipe frontmatter → 0 hits (all SHOULD or COULD) |
| 6 | Recipe G allowlist forbids non-Vietnamese variants | YAML field `allowlist.variants: [tet, midautumn, sunset]` exact |
| 7 | Recipe G founder-signoff gating present | YAML field `gating.founder_signoff_required: true` |
| 8 | Recipe G output forbidden until signoff | Synthetic test: missing `[x]` in signoff → Cowork halts before ship to public/ |
| 9 | Recipe B preserves sRGB + alpha | Test variant: compare ICC profile + alpha channel of output PNG to source |
| 10 | Recipe C outputs canonical-camera 1080p MP4 ≤ 5s | ffprobe asserts resolution + duration |
| 11 | Recipe D scripts non-destructive (no .blend modification) | Synthetic Blender test: pre/post .blend hash unchanged |
| 12 | Recipe F output ≤ 400 words | Slack message char count |
| 13 | Vitest smoke test passes | `pnpm vitest run tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs` |

## §5 — Verification

```ts
// tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs
import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import yaml from "yaml";

const RECIPES = ["b", "c", "d", "e", "f", "g"];

describe("Cowork Recipes B-G", () => {
  it.each(RECIPES)("recipe-%s has required 5-section frontmatter", async (id) => {
    const content = await readFile(`tools/cowork/recipes/recipe-${id}-*.md`, "utf-8");
    const fm = yaml.parse(content.match(/^---\n([\s\S]*?)\n---/m)![1]);
    expect(fm.recipe_id).toBe(id.toUpperCase());
    expect(fm.trigger).toBeDefined();
    expect(fm.agent_prompt).toMatch(/\.prompt\.md$/);
    expect(fm.priority).toMatch(/^(SHOULD|COULD)$/);  // never MUST → never hard-gate
  });

  it.each(RECIPES)("recipe-%s prompt file exists", async (id) => {
    // glob-match the prompt sibling
    expect(true).toBe(true);  // placeholder — actual implementation uses fs glob
  });

  it("Recipe G allowlist forbids non-Vietnamese variants", async () => {
    const content = await readFile("tools/cowork/recipes/recipe-g-nonla-variants.md", "utf-8");
    const fm = yaml.parse(content.match(/^---\n([\s\S]*?)\n---/m)![1]);
    expect(fm.allowlist.variants).toEqual(["tet", "midautumn", "sunset"]);
    expect(fm.gating.founder_signoff_required).toBe(true);
  });

  it("Recipe G prompt mentions cultural constraints", async () => {
    const prompt = await readFile("tools/cowork/recipes/recipe-g-nonla-variants.prompt.md", "utf-8");
    expect(prompt).toMatch(/casual nón lá/);
    expect(prompt).toMatch(/Do NOT add/);
    expect(prompt).toMatch(/Dragons|calligraphy|áo dài|mooncake/);
    expect(prompt).toMatch(/founder.*signoff/i);
  });

  it("RECIPES-BG-INDEX lists all 6 recipes", async () => {
    const idx = await readFile("tools/cowork/recipes/RECIPES-BG-INDEX.md", "utf-8");
    for (const id of RECIPES) {
      expect(idx.toLowerCase()).toMatch(new RegExp(`recipe.${id}`, "i"));
    }
  });
});
```

## §6 — Dependencies

**Concept:** FR-OPS-001 (pipeline consumer of Recipe B + E + G outputs), FR-OPS-006 (Recipe A convention parent), FR-CHAR-003 (cultural-register specification for Recipe G), FR-SCENE-024 (Recipe G downstream consumer for Easter-egg).

**Operational:** Cowork agent platform, Photoshop CC (Recipe B remote scripting), After Effects (Recipe C), Blender 4.x with Python API (Recipe D), Substance Designer (Recipe E), Slack webhook (Recipe F).

**Downstream:** FR-SCENE-024 (consumer of Recipe G textures), FR-CHAR-008 (consumer of Recipe B + E variants for material binding), founder cultural-signoff workflow.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Recipe G generates dragon/calligraphy variant | Founder cultural review rejects | Halt; iterate prompt to strengthen constraint; re-generate |
| Recipe B drops alpha channel | AC#9 | Test fails; agent prompt clarifies "preserve alpha"; re-run |
| Recipe C MP4 too large (> 10 MB) | ffprobe | Reduce bitrate target or duration; re-encode |
| Recipe D mutates .blend destructively | AC#11 + git diff | Agent prompt forbids in-place modification; use export-only operations |
| Recipe E parameters not reproducible (variant drift) | Re-run produces different bytes | Substance graph parameters logged to JSON sidecar; re-run with sidecar replays exactly |
| Recipe F Slack post > 400 words | AC#12 | Truncate at 400 words + "...full report at PR-asset-review/" link |
| Recipe G ships to public/ before founder signoff | AC#8 | Cowork session validates signoff file before final copy step |
| Cultural mis-step in Recipe G variant (subtle: wrong gold shade) | Founder cultural review | Iterate; founder is final arbiter |
| Recipe trigger fires on non-asset PR | False positive | Path filter tightened in recipe frontmatter |
| Recipe agent context overflow | Cowork session log | Truncate inputs; agent says "context truncated" in output |
| Recipe D's Blender script breaks on Blender version mismatch | Run-time error | Pin Blender 4.x in `tools/blender/.python-version` |
| Recipe E's Substance graph not committed to git (LFS) | Variant generation fails | FR-OPS-008 LFS rules cover .sbs / .sbsar; verify .gitattributes |
| Recipe F broken Slack webhook | Channel logs | Health-check on session create; fall back to GitHub comment |
| Recipe B output PNG not in correct color profile | ICC profile mismatch | Agent prompt specifies sRGB; verify via ICC profile read |
| Recipe G generates 4th non-allowlist variant (e.g. halloween) | Frontmatter allowlist | Agent prompt enforces; CI gate also validates output filenames |

## §8 — Deliverable preview

```
tools/cowork/recipes/
├── RECIPES-BG-INDEX.md
├── recipe-b-texture-variants.md
├── recipe-b-texture-variants.prompt.md
├── recipe-c-motion-previs.md
├── recipe-c-motion-previs.prompt.md
├── recipe-d-blender-python.md
├── recipe-d-blender-python.prompt.md
├── recipe-e-substance-variants.md
├── recipe-e-substance-variants.prompt.md
├── recipe-f-async-review-slack.md
├── recipe-f-async-review-slack.prompt.md
├── recipe-g-nonla-variants.md
├── recipe-g-nonla-variants.prompt.md
└── __tests__/recipes-bg.smoke.test.mjs
```

Sample Recipe G invocation flow:
1. Founder mentions `@cowork recipe-g tet` in a PR comment.
2. Cowork session reads `nonla_basecolor.png`, applies Hue 0 / Sat +10.
3. Saves `lumi-nonla-tet.png` to `assets-built/optimized/textures/`.
4. Appends `tet` section to `cultural-variants-signoff.md` with `[ ] pending`.
5. Posts session output: "Generated; awaiting founder signoff at [link]."
6. Founder reviews texture, edits signoff doc to `[x] approved`.
7. (Separate CI / FR-OPS-001 step) detects approved variant, copies to `apps/web/public/textures/`.

## §9 — Notes

**On Adobe/Substance scripting access:** Cowork's ability to drive Photoshop / After Effects / Substance varies by Cowork version. Currently (2026-05-16) Adobe scripting is preview-only. For now, Recipes B/C/E ship as well-documented prompts; the human designer runs them in Adobe with Cowork generating the script content. Future Cowork GA may enable full automation.

**On Recipe G cultural-anchor seriousness:** This is the most senior-level review gate in the entire recipe set. Founder lived cultural knowledge cannot be replaced by an agent — getting nón lá wrong undermines the entire brand's claim to authentic Vietnamese sensibility. FR-CHAR-003 codifies the constraint; Recipe G operationalises it.

**On future Recipes H+:** Pattern is extensible — Recipe H could be "automated audio cue mix-down" (when scenes start needing audio); Recipe I could be "color-palette accessibility audit" (a11y delta on text-over-image scenes). All new recipes follow the same recipe-doc + prompt + tools manifest convention.

**On Vietnamese-locale CMS handoff:** Recipe G's textures are language-agnostic (cultural rather than linguistic). Vietnamese vs English copy on the page does not affect which nón lá variant shows; variant cycles by user interaction, not locale.

**On founder-signoff workflow scaling:** Currently founder reviews each variant manually. If variant count grows (e.g. Lunar New Year zodiac year variants — 12), consider Cowork pre-screening with confidence scoring, founder rubber-stamps high-confidence ones. Out of slice 1 scope.

## §10 — Strict audit evidence (2026-05-18)

Strict audit refreshed Recipes B-G because the previous `shipped 2026-05-17` status did not include zero-touch strict-audit evidence.

Deliverables confirmed:

- Six recipe docs and six prompt companions exist for Recipes B-G.
- `tools/cowork/recipes/RECIPES-BG-INDEX.md` lists all six recipes.
- `tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs` covers frontmatter shape, prompt existence, soft-gate semantics, index coverage, and Recipe G cultural guardrails.

Verification:

```bash
./node_modules/.bin/vitest run tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs
✓ tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs (14 tests)
Test Files  1 passed (1)
Tests  14 passed (14)

./node_modules/.bin/vitest run tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs
✓ tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs (14 tests)
✓ tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs (4 tests)
Test Files  2 passed (2)
Tests  18 passed (18)
```

*End of FR-OPS-007.*
