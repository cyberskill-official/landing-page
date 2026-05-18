# Zero-Touch Edge-Case Matrix — 2026-05-18

This matrix records the pre-flight edge cases for unattended FR execution. Items marked `mocked-dependency` represent physical external blockers that are isolated behind deterministic contract artifacts.

## FR-CHAR-001 — Lumi 2D Character Sheet

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Character sheet source/export/signoff files missing | `python3 tools/check-p0-frs.py` fails on required P0 artifacts. |
| Malformed payload | Figma/PDF/PNG artifacts exist but are empty or wrong dimensions | P0 checker and file-size inspection block strict audit. |
| Extreme bounds | Silhouette does not read at 32x32 or palette drifts outside approved colours | Silhouette result log and founder signoff must be present before strict audit. |
| Invalid content | Forbidden iconography or missing expression/action mapping | Manual audit companion must remain 10/10 with no open issues. |
| Concurrent race | Asset regeneration changes PNG/PDF after signoff | Silhouette SHA and signoff archive remain the contract anchors. |

## FR-CHAR-002 — 32x32 Silhouette Test

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing 32x32 PNG, 2x PNG, protocol, results, or founder signoff | `python3 tools/check-p0-frs.py` fails required P0 artifacts. |
| Malformed payload | PNG dimensions, background colour, or SHA log drift | Hash and protocol evidence block strict audit. |
| Extreme bounds | Fewer than two of three panel verdicts pass | Results document keeps the FR non-shippable. |
| Invalid content | Silhouette was massaged instead of using the FR-CHAR-001 front pose | Protocol violation requires upstream FR-CHAR-001 revision. |
| Concurrent race | Silhouette regenerated after panel signoff | SHA-256 contract identifies the mismatch. |

## FR-CHAR-003 — Nón Lá Accessory Design

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing front/side/three-quarter/interior/composite renders, cultural note, feasibility note, or signoff | `python3 tools/check-p0-frs.py` fails required P0 artifacts. |
| Malformed payload | Colour/register evidence exists but contradicts the cultural note | Cultural note and founder signoff block strict audit. |
| Extreme bounds | Design cannot fit <= 600 tri or loses readable star placement | Modeler feasibility check is required before strict audit. |
| Invalid content | Ceremonial motifs, multiple stars, or off-flag colours appear | FR stays pending until design artifacts are corrected. |
| Concurrent race | Accessory art changes after cultural signoff | Signoff date and generated assets must be re-audited together. |

## FR-CMS-001 — Master Narrative Arc

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing master arc, voice rules, scene defs, test, or founder signoff | `python3 tools/check-p0-frs.py` and the scene-defs Vitest fail. |
| Malformed payload | Scene JSON has missing fields, duplicate ordinals, or wrong scene count | `content/narrative/__tests__/scene-defs-shape.test.ts` fails. |
| Extreme bounds | More or fewer than 7 scenes plus footer | Scene-defs shape test blocks strict audit. |
| Invalid content | Voice rules allow banned words, emoji, exclamation marks, or narrator confusion | Manual audit companion and signoff remain required. |
| Concurrent race | Scene definitions drift after copy signoff | Strict audit reruns the shape test before state update. |

## FR-CMS-002 — Per-Scene Narration Lines

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing EN JSON, schema, authoring notes, banned phrases, tests, or signoff | P0 checker and line tests fail. |
| Malformed payload | Duplicate IDs, invalid scene IDs, bad roles, or schema drift | `lines-en.test.ts` fails. |
| Extreme bounds | Lumi on-screen line exceeds 12 words without documented split | Line tests block strict audit. |
| Invalid content | Exclamation marks, emoji, banned phrases, or speaker-pronoun conflation | Line tests block strict audit. |
| Concurrent race | Copy changes after signoff | Strict audit reruns tests before state update. |

## FR-CMS-003 — Vietnamese Localised Variants

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing VI JSON, register notes/rubric, native-review artifact, tests, or signoff | P0 checker and VI tests fail. |
| Malformed payload | VI IDs do not mirror EN IDs or metadata drifts | `lines-vi.test.ts` fails. |
| Extreme bounds | Syllable counts exceed allowed beat length without notes | VI tests block strict audit. |
| Invalid content | Dialect-heavy phrasing, banned VI phrases, or broken diacritics | VI/native-review tests block strict audit. |
| Concurrent race | VI copy changes after cultural signoff | Strict audit reruns VI tests before state update. |

## FR-DS-001 — Saigon Dusk Mood Board

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing Figma/PDF/PNG, reference directory, rationale, or signoff | `python3 tools/check-p0-frs.py` fails required P0 artifacts. |
| Malformed payload | Reference catalog lacks cluster/caption structure | Rationale/catalog inspection blocks strict audit. |
| Extreme bounds | Fewer than 12 or more than 18 positive references | Mood-board contract remains pending until corrected. |
| Invalid content | Cool-tone primary, tourist framing, dragons, or cost-led positioning | Founder signoff and rationale block strict audit. |
| Concurrent race | Reference set changes after signoff | Strict audit reruns artifact and catalog checks. |

## FR-DS-002 — Palette Swatch And WCAG Matrix

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing canonical palette, swatch artifacts, contrast matrix, script, tests, or signoffs | P0 checker and palette test fail. |
| Malformed payload | Hex values differ from master plan or JSON shape drifts | `palette-vs-plan.test.ts` fails. |
| Extreme bounds | Required contrast pair falls below WCAG thresholds without restriction | Contrast matrix blocks strict audit. |
| Invalid content | New colour introduced outside the approved palette | Palette test and strict review block audit. |
| Concurrent race | Palette changes after a11y signoff | Strict audit reruns palette tests before state update. |

## FR-DS-003 — Cinematic Pack Skeleton

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing package metadata, tsconfig, barrels, lifecycle, README, or export tests | Export tests and TypeScript build fail. |
| Malformed payload | Exports map omits a documented path or package stops being private/tree-shakeable | `packages/ds-cinematic/tests/exports.test.ts` fails. |
| Extreme bounds | Runtime dependencies are introduced into the token-only package | Export/package tests block strict audit. |
| Invalid content | Lifecycle stage is not `Experimental` or peer dependency moves into dependencies | Export/lifecycle tests fail. |
| Concurrent race | Barrel exports drift after build | Strict audit reruns Vitest and `tsc -b`. |

## FR-DS-004 — Gold And Brown Token Export

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing generated TS/CSS token files, generator, or tests | Color tests and TypeScript build fail. |
| Malformed payload | TS and CSS values drift from canonical palette JSON | `colors.test.ts` and generator diff check fail. |
| Extreme bounds | Extra off-palette hex introduced | Color tests block strict audit. |
| Invalid content | Generated header removed or hand-edited output committed | Generator idempotence check catches drift. |
| Concurrent race | Palette changes without token regeneration | Strict audit reruns generator and checks clean diff. |

## FR-DS-005 — Scene 5 Flag Accent Tokens

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing TS/CSS accent tokens or tests | Accent tests and TypeScript build fail. |
| Malformed payload | Accent hex values drift from canonical palette or selectors leak to `:root` | `accents.test.ts` blocks strict audit. |
| Extreme bounds | Accent guard allows pre-Scene-5 surfaces | Runtime guard tests fail. |
| Invalid content | Scene scope omits post-reveal footer/scene-6 surfaces | Scope tests block strict audit. |
| Concurrent race | CSS/TS scopes drift independently | Strict audit reruns Vitest and `tsc -b`. |

## FR-DS-006 — Motion Tokens

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing TS/CSS motion tokens or focused tests | Motion tests and TypeScript build fail. |
| Malformed payload | Duration/easing values drift from master-plan constants | `motion.test.ts` blocks strict audit. |
| Extreme bounds | Reduced-motion path leaves long durations active | Media-query and helper tests fail. |
| Invalid content | Extra duration/ease tokens are introduced without an FR amendment | Closed-token assertions fail. |
| Concurrent race | CSS token names drift from TS helper names | Strict audit reruns Vitest and `tsc -b`. |

## FR-DS-007 — Cinematic Typography

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing TS/CSS typography files, font binaries, or subsetting notes | Typography tests and TypeScript build fail. |
| Malformed payload | Font families, clamps, weights, or letter spacing drift from the FR contract | `typography.test.ts` blocks strict audit. |
| Extreme bounds | Self-hosted font payload exceeds 200 KB | Font budget assertion fails. |
| Invalid content | Vietnamese unicode range or preload hints omitted | CSS/notes assertions fail. |
| Concurrent race | Font files change independently of token metadata | Strict audit reruns Vitest, `find`, and `tsc -b`. |

## FR-DS-008 — Glow Recipes

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing glow TS/CSS files or helper tests | Glow tests and TypeScript build fail. |
| Malformed payload | RGBA strings, CSS variable names, or helper formats drift | `glow.test.ts` blocks strict audit. |
| Extreme bounds | Additional glow recipes appear without amendment | Closed-set assertion fails. |
| Invalid content | Three.js adapter emits wrong hex or opacity intensity | Adapter tests fail. |
| Concurrent race | CSS variables drift from TS recipe names | Strict audit reruns Vitest and `tsc -b`. |

## FR-DS-009 — Component Lifecycle Marker

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing lifecycle module, migration table, README note, or tests | Lifecycle/export tests and TypeScript build fail. |
| Malformed payload | Stage rules or transition parser drift from governance contract | `lifecycle.test.ts` blocks strict audit. |
| Extreme bounds | Skip-step or insufficient-day transitions are accepted | Predicate tests fail. |
| Invalid content | Migration table loses parseable rows or consumer counts | Stage-history assertions fail. |
| Concurrent race | Export map omits lifecycle while table changes | Strict audit reruns lifecycle, exports, and `tsc -b`. |

## FR-SCENE-001 — Scene 0 Hero Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing Figma manifest, breakpoint PNGs, PDF, storyboard, motion frames, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-001` fails. |
| Malformed payload | Manifest frame names/paths/sizes drift from the handoff contract | P1 scene checker blocks strict audit. |
| Extreme bounds | Storyboard exceeds 250 words or PDF exceeds 5 MB | P1 scene checker fails. |
| Invalid content | Scene 0 layer manifest includes nón lá/nonla/hat or loses LCP/post-FCP annotations | P1 scene checker fails. |
| Concurrent race | Generator or manual export changes PNG dimensions after signoff | Strict audit reruns the checker before state update. |

## FR-SCENE-002 — Scene 1 Origin Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing three breakpoints, camera path, idea-spark frames, storyboard, PDF, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-002` fails. |
| Malformed payload | Frame manifest, DOM-caption annotations, or camera-path sections drift | P1 scene checker blocks strict audit. |
| Extreme bounds | Storyboard exceeds 250 words or image dimensions change | P1 scene checker fails. |
| Invalid content | Caption/camera/wisp snippets diverge from FR-CMS-002 and FR-DS-006 handoff | Markdown snippet checks fail. |
| Concurrent race | Scene 1 assets change after founder signoff | Strict audit reruns the checker before state update. |

## FR-SCENE-003 — Scene 2 Transformation Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing three breakpoints, paint-trail spec, morph frames, storyboard, PDF, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-003` fails. |
| Malformed payload | Manifest dimensions or paint-trail shader hints drift | P1 scene checker blocks strict audit. |
| Extreme bounds | Storyboard exceeds 250 words or auxiliary PNG becomes unreadable | P1 scene checker fails. |
| Invalid content | Two-beat caption, additive trail, or `<blockquote>` proof slot disappears | Snippet checks fail. |
| Concurrent race | Scene 2 exports change after founder signoff | Strict audit reruns the checker before state update. |

## FR-SCENE-004 — Scene 3 Capabilities Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing three breakpoints, satellite-orbits notes, storyboard, PDF, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-004` fails. |
| Malformed payload | Manifest satellite count or clock-position notes drift | P1 scene checker blocks strict audit. |
| Extreme bounds | Storyboard exceeds 250 words or image dimensions change | P1 scene checker fails. |
| Invalid content | Cool-accent constraints, four-hand caption, or grayscale-logo slot disappears | Snippet checks fail. |
| Concurrent race | Scene 3 assets change after founder signoff | Strict audit reruns the checker before state update. |

## FR-SCENE-005 — Scene 4 Team Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing three breakpoints, avatar-placement notes, storyboard, PDF, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-005` fails. |
| Malformed payload | Manifest avatar count, parallax notes, or bokeh annotations drift | P1 scene checker blocks strict audit. |
| Extreme bounds | Avatar count differs from 10 or storyboard exceeds 250 words | P1 scene checker fails. |
| Invalid content | Hover anonymisation, no-photo/no-LinkedIn rule, or subtle hiring link disappears | Snippet checks fail. |
| Concurrent race | Scene 4 exports change after founder signoff | Strict audit reruns the checker before state update. |

## FR-SCENE-006 — Scene 5 Vietnam Global Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing three breakpoints, globe spec, arc spec, storyboard, PDF, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-006` fails. |
| Malformed payload | Destination count, HCMC coordinates, or arc-colour contract drifts | P1 scene checker blocks strict audit. |
| Extreme bounds | Storyboard exceeds 250 words or globe/trust notes disappear | P1 scene checker fails. |
| Invalid content | Nón lá first-use, live-clock slot, DUNS trust strip, or no-photo-texture rule disappears | Snippet checks fail. |
| Concurrent race | Scene 5 exports change after founder/cultural signoff | Strict audit reruns the checker before state update. |

## FR-SCENE-007 — Scene 6 CTA Hub Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing breakpoint/variant frames, portal states, storyboard, PDF, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-007` fails. |
| Malformed payload | Portal count, focus-state list, or partner deep-link state drifts | P1 scene checker blocks strict audit. |
| Extreme bounds | Portal target annotations or storyboard length contract disappears | P1 scene checker fails. |
| Invalid content | Fourth portal, missing 44x44 note, missing `aria-live`, or rotation limit drift | Snippet checks fail. |
| Concurrent race | Scene 6 exports change after founder signoff | Strict audit reruns the checker before state update. |

## FR-SCENE-008 — Footer Persistent Lumi Comp

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing footer frames, corner-state diagram, storyboard, PDF, or signoff | `python3 tools/check-p1-scene-assets.py --fr FR-SCENE-008` fails. |
| Malformed payload | Corner-avatar manifest, trust-signal annotations, or footer nav notes drift | P1 scene checker blocks strict audit. |
| Extreme bounds | Storyboard exceeds 250 words or image dimensions change | P1 scene checker fails. |
| Invalid content | Nón lá persistence, 48x48 avatar rule, EN/VI switcher, or DUNS trust signal disappears | Snippet checks fail. |
| Concurrent race | Footer exports change after founder signoff | Strict audit reruns the checker before state update. |

## FR-CHAR-004 — Lumi Greybox Mesh

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing placeholder `.blend`, raw/optimized GLB, comparison PNG, notes, or dual signoff | `python3 tools/check-p1-greybox-assets.py` fails. |
| Malformed payload | GLB header, node names, tri counts, or placeholder marker drift | Greybox checker blocks strict audit. |
| Extreme bounds | Raw GLB exceeds 1 MB, optimized GLB exceeds 400 KB, or tri cap exceeds 10k | Greybox checker fails. |
| Invalid content | Rig/textures appear or the five Lumi mesh blocks are not named exactly | Greybox checker fails. |
| External dependency | Blender 4.4 unavailable for physical viewport validation | Ship remains `mocked-dependency`, backed by deterministic placeholder/GLB contract tests. |
| Concurrent race | Generated greybox assets change after founder/rigger signoff | Strict audit reruns the checker before state update. |

## FR-CHAR-005 — Per-Scene Greybox Sets

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing any of eight scene `.blend` placeholders, raw/optimized GLBs, notes, or R3F signoff | `python3 tools/check-p1-greybox-assets.py` fails. |
| Malformed payload | Scene GLB extras, linked Lumi collection, or placeholder schema drifts | Greybox checker blocks strict audit. |
| Extreme bounds | Any scene prop tri count exceeds 6000 or optimized GLB exceeds 1.5 MB | Greybox checker fails. |
| Invalid content | Scene greyboxes duplicate Lumi instead of linking the Lumi collection | Greybox checker fails. |
| External dependency | Blender 4.4 unavailable for physical frustum validation | Ship remains `mocked-dependency`, backed by deterministic placeholder/GLB contract tests. |
| Concurrent race | Scene greybox assets change after R3F architect signoff | Strict audit reruns the checker before state update. |

## FR-CHAR-006 — Lumi Production Mesh

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing `lumi.v01.blend`, missing `lumi.raw.glb`, or missing stats JSON | Contract checker fails with the missing relative path. |
| Malformed payload | Placeholder `.blend` is not JSON or does not declare `BLENDER_4_4_PLACEHOLDER` | Contract checker fails before state can ship. |
| Extreme bounds | Triangle count outside 23,700-40,000, height outside 1.55-1.65m, raw GLB > 6 MB | Contract checker fails with the metric name. |
| Invalid shape | Missing `lumi_main`, `lumi_wisp`, geometric C emboss marker, watertight flag, or zero doubled-vertex flag | Contract checker fails the mesh-stats contract. |
| Scope creep | Rig, shape keys, image textures, or animations appear in the mesh stage | Contract checker fails because FR-CHAR-006 must ship pure geometry only. |
| Concurrent race | Re-running the generator overwrites the same deterministic assets | Idempotent content and stable JSON schema keep the output reproducible. |
| External dependency | Blender 4.4 unavailable | Ship as `mocked-dependency` only, backed by placeholder manifests and file-shape contract tests. |

## FR-CHAR-007 — Lumi UV Layout

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing 2k/1k/512 overlay PNGs, UV stats, validator, seam map, signoff, or pre-UV archive | `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-007` fails. |
| Malformed payload | Stats JSON lacks `verdict: PASS`, atlas dimensions, padding, island caps, density, or unit-square flags | Contract checker and `uv-validator.py` fail. |
| Extreme bounds | Main atlas exceeds 24 islands, wisp exceeds 6, nón lá exceeds 4, or padding drops below floor | Contract checker fails. |
| Invalid content | UV overlap, visible seams, out-of-unit-square UVs, or face density below 384 px/m | Contract checker fails. |
| Scope creep | Texture painting or Substance payloads appear in UV stage | Mock contract keeps UV only; texture work stays in FR-CHAR-008. |
| External dependency | Blender 4.4 unavailable for physical UV unwrap validation | Ship remains `mocked-dependency`, backed by deterministic atlas/stat/validator artifacts. |

## FR-CHAR-008 — Substance PBR Textures

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing Substance source, export preset, four 2k maps, texture stats, validator, or texture brief | `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-008` fails. |
| Malformed payload | Texture stats omit colour space, PBR values, ORM packing, OpenGL normal convention, or KTX2 preview | Contract checker and `tools/texture-validator.py` fail. |
| Extreme bounds | Any texture is not 2048x2048 RGB or KTX2 preview exceeds 4 MB | Texture validator fails. |
| Invalid content | BaseColor includes cool tones/off-palette pixels, ORM channels swap, or emissive mask exceeds 25% | Texture validator fails. |
| Scope creep | UV layout is altered during texture authoring | Mock contract preserves FR-CHAR-007 UV state; UV fixes return to FR-CHAR-007. |
| External dependency | Substance Painter unavailable for physical texture authoring | Ship remains `mocked-dependency`, backed by deterministic texture/stat artifacts. |

## FR-CHAR-009 — Custom Armature Rig

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing rig `.blend`, skinning stats, validator, bone map, rig spec, or pre-rig archive | `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-009` fails. |
| Malformed payload | Stats omit Rigify detection, bone groups, `c_head` props, parent type, or Preserve Volume state | Contract checker and `assets-source/blender/rig-validator.py` fail. |
| Extreme bounds | Bone count falls outside 25-29, max vertex influences exceed 4, or wisp chain is incomplete | Rig contract checker fails. |
| Invalid content | Rigify appears, `hat_socket` is missing/mis-parented, shape keys/actions/NLA ship early, or test poses remain | Rig contract checker fails before backlog promotion. |
| Scope creep | Facial shape keys or animation clips are added during rigging | Mock contract keeps rig-only scope; those payloads stay in FR-CHAR-010/011. |
| External dependency | Blender 4.4 unavailable for physical rig authoring and weight-paint validation | Ship remains `mocked-dependency`, backed by deterministic rig/stat/validator artifacts. |

## FR-CHAR-010 — Shape Keys And Drivers

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing shape-key `.blend`, stats, validator, contact sheet, signoff spec, or pre-shape-key archive | `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-010` fails. |
| Malformed payload | Shape-key stats omit names, 0..1 ranges, driver targets, vertex deltas, morph-target count, or sparse-warning list | Contract checker and `assets-source/blender/shape-key-validator.py` fail. |
| Extreme bounds | Shape-key count is not exactly 10, any vertex delta is zero, or trial export reports fewer than 10 morph targets | Shape-key contract checker fails. |
| Invalid content | `mouth_neutral` ships as a shape key, driver target does not reference `c_head`, or silhouette tolerance fails | Shape-key contract checker fails before backlog promotion. |
| Scope creep | Animation clips or NLA strips are added while authoring morph targets | Mock contract keeps shape-key-only scope; clips stay in FR-CHAR-011. |
| External dependency | Blender 4.4 unavailable for physical morph authoring and glTF trial export | Ship remains `mocked-dependency`, backed by deterministic shape-key/stat/contact-sheet artifacts. |

## FR-CHAR-011 — Animation Library

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing animation `.blend`, stats, validator, storyboard, spec, thumbnails, or pre-animation archive | `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-011` fails. |
| Malformed payload | Stats omit sample rate, NLA strip names, loop-close deltas, hold regions, easing, or trial export names | Contract checker and `assets-source/blender/animation-validator.py` fail. |
| Extreme bounds | Clip count is not 11, frame counts drift beyond ±3, loop-close delta exceeds 0.001, or thumbnails are not 512x512 | Animation contract checker fails. |
| Invalid content | `fly_in` lacks EASE_OUT_QUINT, Optimize Animation Size is true, scratch actions remain, or rig/shape-key baselines drift | Animation contract checker fails before backlog promotion. |
| Scope creep | New bones or shape keys are added while animating clips | Mock contract keeps animation-only scope and rejects topology/key drift. |
| External dependency | Blender 4.4 unavailable for physical NLA authoring and trial glTF inspection | Ship remains `mocked-dependency`, backed by deterministic animation/stat/storyboard artifacts. |

## FR-CHAR-012 — Nón Lá Accessory Mesh

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing nón lá `.blend`, raw GLB, 512 textures, stats, validator, render, spec, or iteration archive | `python3 tools/check-p2-character-mocks.py --fr FR-CHAR-012` fails. |
| Malformed payload | Stats omit triangle count, dimensions, parent bone, visibility default, texture colours, GLB bytes, or transform state | Contract checker and `assets-source/blender/nonla-validator.py` fail. |
| Extreme bounds | Triangle count exceeds 600, raw GLB exceeds 400 KB, brim/cone dimensions drift, or textures are not 512x512 | Nón lá contract checker fails. |
| Invalid content | Parent is not `hat_socket`, `nonla_visible` default is true, star is missing/multiple, colours drift, or decorative patterns appear | Nón lá contract checker fails before backlog promotion. |
| Scope creep | Extra cultural variants or ceremonial motifs are added during production mesh authoring | Mock contract keeps the single casual-register accessory only; variants stay future amendments. |
| External dependency | Blender/Substance unavailable for physical mesh, UV, and material authoring | Ship remains `mocked-dependency`, backed by deterministic accessory/stat/render artifacts. |

## FR-OPS-001 — glTF Pipeline

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing input/output args, input GLB, config, budgets, or writable output directory | `node scripts/gltf-pipeline.mjs` exits non-zero with usage or file diagnostics. |
| Malformed payload | Input GLB cannot be parsed or report JSON lacks required shape | `scripts/__tests__/gltf-pipeline.test.mjs` fails the runnable/report-shape cases. |
| Extreme bounds | Optimized output exceeds 110% of the configured asset target | Pipeline exits with `EARLY WARN`; budget CI remains the hard authority. |
| Invalid content | Draco is selected for Lumi, morph targets, or skinned assets; static props miss Draco branch | Strategy tests inspect extensions and fail on branch drift. |
| Concurrent race | Pipeline mutates raw inputs or produces nondeterministic bytes | Raw immutability and repeat SHA-256 tests fail. |
| External dependency | KTX2/Basis physical encoder unavailable | FR-OPS-001 preserves KTX2 role metadata in reports; physical KTX2 integration remains FR-OPS-004. |

## FR-OPS-002 — Canonical Budgets

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing `budgets.json`, schema file, CODEOWNERS rule, or consumer import path | Budget schema and consumer tests fail. |
| Malformed payload | JSON syntax invalid, `$schema`/version missing, or schema rejects the file | `tools/perf-budgets/__tests__/budgets-schema.test.ts` fails. |
| Extreme bounds | `target >= fail` for lower-is-better metrics or FPS target/fail direction flips | Budget invariant tests fail. |
| Invalid content | Required FR-PERF-001 paths drift, asset budget keys rename, or comments-as-keys disappear | Schema/path tests fail before strict audit. |
| Concurrent race | Consumers hardcode budget values instead of importing canonical JSON | PR-comment and asset-size unit tests fail consumer mapping. |
| Governance drift | Founder CODEOWNERS gate is removed or owner handle diverges from repo convention | CODEOWNERS grep fails; strict audit blocks promotion. |

## FR-OPS-003 — PR Asset Comment

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing workflow, report directory, PR number, budgets file, or existing main baseline | CLI renders a NEW/no-baseline report instead of crashing; workflow shape tests fail if missing. |
| Malformed payload | Pipeline report JSON lacks bytes, output, budget, or stats fields | `readAssetReports` unit path filters invalid rows; renderer tests fail if shape drifts. |
| Extreme bounds | Asset crosses target/fail thresholds or has no main baseline | `computeDelta` sorts FAIL/WARN/NEW rows and workflow `core.setFailed` blocks FAIL. |
| Invalid content | Sentinel missing, fix-link removed, private asset names leak, or no-asset summary disappears | PR-comment unit tests fail. |
| Concurrent race | Second workflow run appends duplicate comments instead of upserting | Workflow uses `<!-- pr-asset-delta -->` lookup and update path; shape inspection enforces sentinel. |
| External dependency | GitHub API unavailable in local audit | Unit/CLI contract validates renderer and summary; live posting remains GitHub Actions runtime responsibility. |

## FR-OPS-004 — KTX2 Basis Texture Compression

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing `--input`, `--output`, `--role`, missing input texture, or unreadable dimensions | CLI exits with usage/file diagnostics; unit tests assert the missing-args path. |
| Malformed payload | glTF texture role metadata is absent, or one texture index is bound to multiple roles | Role detection returns `null` for unused textures and throws on forbidden multi-role atlases. |
| Extreme bounds | Non-positive dimensions, missing mip chain, or full Lumi texture set exceeds 4 MB GPU estimate | Mip/depth tests reject invalid dimensions; report aggregation verifies Lumi at 3.493 MB. |
| Invalid content | Normal maps use ETC1S, ORM uses sRGB, base/emissive use linear, or encoder flags drift | `FLAGS_BY_ROLE`, mode, and color-space tests pin UASTC/ETC1S and sRGB/linear routing. |
| Concurrent race | Re-running the encoder rewrites unchanged `.ktx2` files or produces nondeterministic bytes | Idempotency and repeat SHA-256 tests fail on re-encode or nondeterministic output. |
| External dependency | `toktx`, `ktx2check`, and `basisu` are absent locally | Ship remains `mocked-dependency`; deterministic KTX2-header mock files and contract reports replace physical encode output. |

## FR-OPS-005 — Local Decoder Bundle

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing decoder manifest, missing decoder file, or malformed CLI args | `sync-decoders.mjs --check` and CLI usage tests fail with file/usage diagnostics. |
| Malformed payload | Manifest hash, byte count, content type, or version metadata drifts | Manifest/hash tests and `checkDecoders` fail before backlog promotion. |
| Extreme bounds | Installed real decoder payload exceeds 240 KB raw budget | `--mode installed` fails at 958,628 bytes; shipped artifact stays mocked-dependency at 1,016 bytes. |
| Invalid content | Runtime decoder paths point to CDN or omit `/decoders/` prefixes | No-CDN gate and runtime-path tests fail. |
| Concurrent race | Running sync twice changes bytes or manifest order | Idempotency test compares every generated file byte-for-byte. |
| Runtime header drift | Decoder assets lose immutable cache or WASM MIME headers | Next config shape tests enforce `/decoders/:path*`, exact `.wasm` routes, and `application/wasm`. |
| Lazy-loading drift | Decoders load outside the dynamic canvas boundary | `DecoderBootstrap` and preload helper tests keep setup behind client/canvas paths. |
| External dependency | Physical installed Three.js Draco/Basis decoders exceed FR budget | Ship remains `mocked-dependency`; real bytes are isolated behind `--mode installed` and fail loudly until the budget is amended. |

## FR-OPS-006 — Cowork PR Asset Triage

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing recipe, prompt, or tools manifest | Smoke test fails required file/frontmatter assertions. |
| Malformed payload | Trigger labels, paths, manual mention, Slack channel, or threaded output drift | Frontmatter test fails on the exact contract. |
| Extreme bounds | Agent context or tool calls exceed cost guardrails | Tools manifest test enforces `context_window_kb <= 32` and `max_tool_calls <= 8`. |
| Invalid content | Prompt decides PASS/FAIL, omits confidence, leaks private paths, or ignores screenshot diff evidence | Prompt tests require soft-gate language, confidence, redaction, and screenshot-diff deltas. |
| Concurrent race | Cowork reply becomes a hard gate or top-level comment | Tests enforce `hard_gate: false`, `github_threaded_reply`, and no forbidden status-check keys. |
| External dependency | Cowork, GitHub threaded replies, or Slack are unavailable | Prompt/recipe decline mode keeps FR-OPS-003 authoritative and posts advisory-only text. |

## FR-OPS-007 — Cowork Recipes B-G

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Any recipe B-G markdown or prompt file is missing | `recipes-bg.smoke.test.mjs` fails the file discovery test. |
| Malformed payload | Recipe frontmatter omits trigger, inputs, outputs, prompt, success criteria, or soft-gate priority | Per-recipe frontmatter tests fail. |
| Extreme bounds | Recipe F Slack summary exceeds word target or Recipe C MP4 exceeds duration contract | Recipe prompts and success criteria pin 200-400 words, <=5s motion content, and human review. |
| Invalid content | Any recipe declares `priority: MUST`, hard-gate semantics, or Recipe G non-allowlist cultural variants | Smoke tests reject hard-gate priority and assert Recipe G allowlist/signoff/cultural constraints. |
| Concurrent race | Recipe index drifts from actual recipe set | Index test checks all six recipe IDs are listed. |
| External dependency | Photoshop, After Effects, Blender, Substance, Slack, or Cowork automation is unavailable | Recipes are soft augmentations and prompts define human-run/manual-review fallback boundaries. |

## FR-OPS-008 — Git LFS Configuration

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | `.gitattributes`, LFS setup doc, Make target, or workflow missing | `make test-lfs-config` and pattern tests fail. |
| Malformed payload | Source binary extensions lose `filter=lfs diff=lfs merge=lfs -text` | `lfs-patterns.test.sh` fails the exact pattern check. |
| Extreme bounds | Derived output files are accidentally LFS-tracked or missing from `.gitignore` | `lfs-output-not-tracked.test.sh` fails. |
| Invalid content | Contributor docs omit `git lfs install`, pull recovery, retention, or 2 GB approval policy | LFS pattern/docs tests and setup-doc grep fail. |
| Concurrent race | `.gitattributes` pattern churn breaks future source commits | Make target keeps pattern checks repeatable in CI. |
| External dependency | `git lfs` is absent in the local workspace | Live `tools/check-lfs.sh` fails; ship remains `mocked-dependency` with config contract tests until Git LFS is installed. |

## FR-OPS-009 — Source Asset Manifest

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing `assets-source/manifest.json`, source dir, schema, or script | CLI and unit tests fail with divergence or missing-file diagnostics. |
| Malformed payload | Manifest schema drifts, hashes are invalid, or required metadata is missing | Ajv Draft 2020-12 validation fails. |
| Extreme bounds | New source files appear after manifest generation or stale assets remain | `asset-manifest-sync --check` exits non-zero; strict audit regenerated the manifest from 9 to 16 source assets. |
| Invalid content | `*.private.*`, `internal/`, non-LFS docs, or derived `assets-built/` files enter the manifest | Unit tests and manifest audit check private leaks/non-source exclusions. |
| Concurrent race | Running sync twice changes manifest bytes or linked graph order | Idempotency test and check mode enforce deterministic output. |
| Dependency graph | Blender linked collection references are missing in either direction | Synthetic `.blend` link test verifies `linked_to` and `linked_from`. |

## FR-WEB-001 — Next/R3F Bootstrap

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing app workspace, health route, layout shell, or canvas components | Bootstrap Vitest suite fails workspace/layout/health assertions. |
| Malformed payload | Pages Router appears, forbidden motion libraries are added, or framework versions drift | Bootstrap tests fail package/config invariants. |
| Extreme bounds | Three/R3F enters SSR chunks or initial JS budget is blown | Post-build no-Three SSR test and Next build first-load output catch regressions. |
| Invalid content | GlobalCanvas mounts inside a page route or more than one canvas shell appears | Single-canvas invariant and layout/page tests fail. |
| Concurrent race | Type artifacts in `.next/types` go stale before typecheck | Strict audit builds first, then reruns `tsc` and SSR bundle checks. |
| UI state | `/` lacks SSR headline, canvas appears too early, or `/lite` renders canvas | Playwright smoke asserts home H1, initial canvas 0, post-idle canvas 1, `/lite` canvas 0. |

## FR-WEB-002 — Lenis Smooth Scroll

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Reduced motion is active, route is `/lite`, or Lenis has not hydrated yet | Singleton returns `null`; Playwright asserts no `window.__lenis` on reduced-motion and `/lite` paths. |
| Malformed payload | Anchor click has `#`, missing target, or a non-scrollable target | Provider falls through without crashing; smooth-scroll test covers valid hash navigation. |
| Extreme bounds | PageDown, high wheel delta, or touch input attempts to override user velocity | Lenis options pin `wheelMultiplier: 1`, `touchMultiplier: 1`, `syncTouch: false`, and vertical orientation. |
| Invalid content | Lenis 1.4+, horizontal/infinite scroll, or overscroll suppression enters config | Package/version check and Playwright options probe fail the strict audit. |
| Concurrent race | Provider remounts or reduced-motion toggles while ScrollTrigger bridge is active | Cleanup destroys Lenis, removes ticker/listener bindings, and proxy registration remains exactly one. |
| Observability | Scroll integration regresses without visible state | Dev-only probes and `?debug=scroll` expose scroll, velocity, progress, and proxy registration count. |

## FR-WEB-003 — SceneTunnel UseCanvas Tunneling

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Disposal receives `null`/`undefined`, or scene progress is read outside a tunnel | Unit tests assert no throws and safe default progress state. |
| Malformed payload | Scene child resources include material arrays, texture slots, render targets, or cached Drei resources | `disposeAll` recursively disposes owned resources once and skips cached/shared resources unless overridden. |
| Extreme bounds | User scrolls through the full page or jumps between scenes repeatedly | Playwright asserts one canvas and no `webglcontextlost` during scroll. |
| Invalid content | A second `<Canvas>`/`<GlobalCanvas>` appears outside `CanvasMount.tsx`, or whole-canvas Suspense is introduced | No-second-canvas test and ADR-FR-WEB-003 review fail strict audit. |
| Concurrent race | Scene unmount cleanup runs twice or animation mixer cleanup runs after root disposal | Idempotent WeakSet disposal and `disposeMixer` unit tests catch double-free and mixer leaks. |
| Observability | Tunneling/culling state cannot be inspected during development | `window.__sceneTunnelStates` and `?debug=tunnel` expose scene id, progress, culling, and tracked state. |

## FR-WEB-004 — Zustand Stores

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Stores are read before hydration or after test reset | Initial state tests verify scene 0, idle scroll, and Lumi defaults. |
| Malformed payload | Scene progress or emissive boost receives NaN, negative, or over-1 values | Store actions clamp progress/emissive values into `0..1`. |
| Extreme bounds | High-frequency scroll snapshots or low-memory capability state update during browser flow | Scroll snapshots are throttled by Lenis provider and Playwright verifies store state under real input. |
| Invalid content | Valtio, persist middleware, raw runtime store imports, or store writes inside `useFrame` appear | Guardrail tests fail with exact offenders. |
| Concurrent race | Vector selectors receive equal array contents or subscriptions clean up during unmount | Shallow equality test suppresses equal vector updates; StoreHydrator unsubscribes dev probes. |
| Observability | Store changes cannot be inspected during development | `window.__stores` and `?debug=stores` publish scene, Lumi, audio, and scroll snapshots. |

## FR-WEB-005 — Dynamic Three Boundary

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | R3F chunk has not loaded or browser disables JavaScript | SSR renders DOM scaffolding and `CanvasLoadingFallback`, never server-rendered canvas content. |
| Malformed payload | A developer adds scattered dynamic imports for `three`, R3F, Drei, or scroll-rig | ESLint rule and grep fail outside `lib/dynamic-three.ts`. |
| Extreme bounds | Main chunk or first-load JS approaches the 200 KB gzip budget | Build and gzip scripts report `/` First Load JS 110 kB and main chunk 36.5 KiB gzip. |
| Invalid content | `three`/`@react-three` enters `.next/server` chunks | `no-three-in-ssr.test.ts` scans post-build server output and fails on direct imports. |
| Concurrent race | Hydration mounts canvas before fallback or emits duplicate canvas | Playwright SSR HTML asserts fallback is present and `<canvas>` is absent before client hydration. |
| Observability | Bundle boundary drift is invisible during review | Playwright SSR check, post-build grep, chunk gzip, and `ANALYZE=true` bundle analyzer provide repeatable evidence. |

## FR-WEB-006 — Suspense And Preload Chain

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Scene index has no next/previous GLB or `/lumi.glb` is missing | Bounds tests return `[]`; strict audit verifies public mock Lumi GLB exists at 78,988 bytes. |
| Malformed payload | Preload function rejects or scene GLB fetch fails | `preloadScene` logs a warning, marks failed state, deletes idempotency key, and allows retry. |
| Extreme bounds | Preload chain tries to fetch more than one neighbor scene | `MAX_PRELOAD_AHEAD = 1` and unit tests enforce one target. |
| Invalid content | Spinner UI or whole-canvas suspension enters the route | Playwright SSR rejects spinner text; SceneTunnel keeps the only Suspense boundary inside the tunneled subtree. |
| Concurrent race | Active-scene effect and IntersectionObserver both attempt the same preload | Both paths use idempotent `preloadScene`; duplicate calls no-op after first success. |
| Observability | Preload state cannot be inspected or announced | `data-scene-suspense-aria`, `window.__scenePreloadStates`, and `?debug=suspense` expose state. |
| External dependency | Final Lumi GLB is not available yet | Ship remains `mocked-dependency`; `/lumi.glb` is the optimized Lumi greybox until final asset replacement. |

## FR-WEB-007 — Three Tree-Shake Config

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Missing Next config, bundle notes, or side-effects metadata | Bootstrap/no-namespace tests fail file/config assertions. |
| Malformed payload | Namespace import or CommonJS `require('three')` enters app/components/lib | TypeScript AST guard reports the exact offender. |
| Extreme bounds | Main chunk regresses toward 200 KiB gzip | Fresh build and gzip script report main chunk 36.5 KiB. |
| Invalid content | `transpileModules`, `swcMinify: false`, legacy webpack rules, or extra transpile packages appear | Config tests fail the forbidden-pattern and exact-list checks. |
| Concurrent race | Config passes static checks but production build diverges | Strict audit runs `next build`, typecheck, and post-build gzip in sequence. |
| Observability | Future config maintainers cannot see rationale | `bundle.config.notes.md` documents `transpilePackages`, tree-shake flags, named imports, compression, and side effects. |

## FR-WEB-008 — App Router Routes

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Route module, sitemap, robots, loading state, not-found state, or typed-routes flag is missing | Routing guardrail tests fail file/config assertions. |
| Malformed payload | Canonical or hreflang is relative, stale, or missing locale alternates | Metadata helper and Playwright SEO tests assert absolute canonical/hreflang output. |
| Extreme bounds | Route surface expands beyond the original four routes | ADR-FR-WEB-008 and route-audit CSV track current public routes and sitemap inclusion. |
| Invalid content | Pages Router appears, middleware leaves app scope, or unapproved API routes appear | Guardrails assert no pages/, app-local middleware, and sanctioned API inventory. |
| Concurrent race | /vi/* rewrite collides with /api or static assets | Middleware matcher excludes api, _next, _vercel, and dotted static assets. |
| Observability | Ops cannot inspect route/canonical/sitemap drift | `node --experimental-strip-types tools/route-audit.ts` emits CSV evidence. |

## FR-WEB-009 — Capability Gate

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | `document`, `navigator.connection`, `navigator.deviceMemory`, or storage is unavailable | Unit tests assert SSR defaults, unsupported API fallbacks, and storage-failure tolerance. |
| Malformed payload | `cyberskill_lite_pref` is invalid or stale | `getLitePref()` returns `null`; Playwright reset link clears the key on `/accessibility`. |
| Extreme bounds | WebGL2 context exists without float-color extension, or canvas probe throws | Detection helper returns false; early gate and Playwright redirect to `/lite`. |
| Invalid content | Save-data banner interrupts screen readers or traps the page | Unit and browser tests assert polite live region, default focus, Escape close, and scroll-through behavior. |
| Concurrent race | Inline gate redirects while React gate is hydrating | ADR-FR-WEB-009 constrains the inline gate; React gate is path-aware and idempotent on `/lite`. |
| Observability | Operators cannot inspect capability decisions | `?debug=capability`, `cyberskill_lite_redirect_ms`, and analytics events expose the gate state. |

## FR-SCENE-009 — Scene 0 Hero

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | Locale, narrative line, browser storage, or canvas runtime is unavailable | Server copy helper falls back to canonical EN text; SSR h1 remains in raw HTML. |
| Malformed payload | Lumi GLB exists but final animation clips are missing from the mocked asset | Store-level `fly_in -> idle` contract test defines the expected sequence until final clip callbacks exist. |
| Extreme bounds | WebGL2 is absent, reduced motion is enabled, or canvas mount is delayed | Capability gate and reduced-motion CSS avoid canvas; Playwright asserts no SSR canvas and client canvas within 3s on capable paths. |
| Invalid content | Tunnel id drifts from `scene-defs.json`, caption drifts from FR-CMS-002, or Scene 0 shows nón lá | Unit/source tests assert `scene-0-hero`, canonical narration text, and no nonla/hat content in Scene 0 component sources. |
| Concurrent race | Early capability gate, React gate, SceneTunnel, and StoreHydrator all initialize in the first paint window | Animation setup is idempotent, timeout cleanup is registered, and no-second-canvas tests cover the persistent canvas pattern. |
| Observability | Scene 0 mount and animation state cannot be inspected | `window.__scene0HeroState`, `scene_enter` analytics, and `window.__stores.lumi.currentAnim` expose runtime state. |

## FR-SCENE-010 — Lumi Animation Picker

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | `rootBone`, `animations`, mixer actions, or the loaded `idle` action are not ready when the store updates | Hook guards missing actions, keeps the previous action pointer stable, and logs a dev-only warning instead of throwing. |
| Malformed payload | Store asks for a typed clip that is absent from the loaded GLB animation table | Dev warning identifies the missing clip; contract tests assert the exact warning shape. |
| Extreme bounds | Rapid store transitions fire before the previous clip has visually settled | `useEffect` reacts once per state change and uses a token-derived 200ms crossfade; no polling or `useFrame` state writes are allowed. |
| Invalid content | Scene-specific trigger logic leaks into the generic Lumi picker | Source guard tests assert the hook only maps `currentAnim` to Drei actions and never imports scene modules. |
| Concurrent race | A non-loop clip finishes while a scene simultaneously requests another clip | Mixer `finished` listener only returns typed non-loop clips to `idle`; scenes can immediately override via the same Zustand store. |
| Reduced motion | User requests reduced motion during a transition | Hook skips crossfades, plays the new action, stops the old action, and still keeps default-to-idle behavior. |
| Lifecycle leak | R3F unmount, HMR remount, or route changes leave mixer actions cached | Cleanup delegates to `disposeMixer`, which calls `stopAllAction()` and `uncacheRoot(rootBone)`. |
| Observability | Animation mismatch is invisible in development | Dev-only `[FR-SCENE-010] no action for clip ...` warning and unit spies expose lookup failures. |

## FR-SCENE-011 — Scene 0 Above-Fold CTA

| Vector | Edge case | Contract response |
|---|---|---|
| Null inputs | `CtaHub` has not hydrated when Scene 0 CTA is clicked or `?action=book` fires | `requestCtaOpen()` stores `window.__pendingCtaOpen`; `CtaHub` consumes pending requests on mount. |
| Malformed payload | Unknown CTA track is dispatched through the browser event bridge | `CtaHub` validates with `isTrackId()` and ignores invalid requests. |
| Extreme bounds | User scrolls quickly past Scene 0 before GSAP refresh finishes | Sticky progress is clamped `0..1`; ScrollTrigger refresh/update both write the same CSS variable. |
| Invalid content | CTA is accidentally moved into Three/Drei `<Html>` | Source tests assert DOM component ownership; Playwright asserts SSR HTML contains `data-scene-0-cta`. |
| Concurrent race | Pointer-out mirror clears `focusedCta` while modal open | `StoreHydrator` skips pointer-out clearing when `[data-cta-modal]` exists. |
| Reduced motion | User prefers reduced motion | Scene 0 CTA skips ScrollTrigger setup; sticky variant is hidden in reduced-motion CSS. |
| Mobile bounds | 390px viewport compresses CTA below WCAG target size | Playwright asserts the hero CTA bounding box remains at least 44x44. |
| Observability | CTA open path is hard to inspect | `window.__ctaOpenEvents` records track/source/timestamp and Playwright asserts Scene 0/deep-link sources. |
