---
id: FR-OPS-001
engineering_anchor: true
title: "scripts/gltf-pipeline.mjs — two-stage Blender → glTF-Transform pipeline (Meshopt for Lumi, Draco for static, KTX2/Basis textures)"
module: OPS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P2
milestone: P2 · slice 2
slice: 1
owner: Backend / DevOps + 3D Modeler/Texture Artist
created: 2026-05-16
shipped: null
brain_chain_hash: null
related_frs: [FR-OPS-002, FR-OPS-003, FR-OPS-004, FR-OPS-005, FR-OPS-013, FR-CHAR-006, FR-CHAR-008, FR-CHAR-011]
depends_on: []
blocks:
  - FR-OPS-002..009    # all OPS pipeline FRs build on this
  - FR-CHAR-008        # texture authoring requires the export target
  - FR-CHAR-011        # animation export depends on this pipeline shape
  - FR-PERF-001        # asset-size CI gate consumes pipeline output

source_pages:
  - docs/01-master-plan-v2.md §4.3 (Export & optimization pipeline)
  - docs/01-master-plan-v2.md §4.4 (File-size budgets — hard CI gates)
  - docs/01-master-plan-v2.md §11.2 (Asset versioning & file structure)

source_decisions:
  - "v2 §4.3 CRITICAL: for rigged + morphed Lumi use Meshopt, not Draco — Draco mangles morph targets"
  - "v2 §4.3: textures via KTX2 + Basis Universal (UASTC for normals, ETC1S for color/MR/emissive)"
  - "v2 §4.3 Stage 1 (artist): Blender exporter produces raw .glb with compression OFF, sparse accessor OFF"
  - "v2 §4.3 Stage 2 (CI): glTF-Transform applies dedup, prune, weld, resample, meshopt/draco, textureCompress"
  - "v2 §4.4: Lumi GLB target < 3.0 MB / fail 3.5 MB; nón lá < 200 KB / 250 KB"

language: node.js esm (Node 20)
service: scripts/ + tools/perf-budgets/
new_files:
  - scripts/gltf-pipeline.mjs
  - scripts/gltf-pipeline.config.json
  - scripts/__tests__/gltf-pipeline.test.mjs
  - scripts/__tests__/fixtures/lumi.raw.glb           # 1-2 MB test fixture (small Lumi proxy)
  - scripts/__tests__/fixtures/static-prop.raw.glb    # tiny static fixture
modified_files:
  - package.json                                       # add scripts.gltf-pipeline + devDependencies
  - .github/workflows/perf-budgets.yml                 # call gltf-pipeline before check-asset-sizes

allowed_tools:
  - file_read: assets-source/blender/**
  - file_read: assets-built/raw/**
  - file_write: assets-built/optimized/**
  - file_write: scripts/**
  - bash: node scripts/gltf-pipeline.mjs <input.glb> <output.glb>
  - bash: pnpm exec gltf-transform inspect <file.glb>
disallowed_tools:
  - apply Draco to lumi.raw.glb (morph targets mangled — §1 #2 forbids)
  - apply meshopt to static props with no animation (Draco is smaller — §1 #5 prefers it)
  - skip the dedup + prune + weld pre-pass (always run before compression — § 1 #6)
  - write to assets-built/raw/ (raw inputs are immutable; optimized goes to assets-built/optimized/)

effort_hours: 10
sub_tasks:
  - "1h: scripts/gltf-pipeline.mjs — Node ESM driver using @gltf-transform/core + functions"
  - "1h: config.json — per-input-pattern strategy (lumi.glb → meshopt, *-prop.glb → draco)"
  - "1h: dedup + prune + weld + resample pre-pass"
  - "2h: compression branch — meshopt for animated/morphed, draco edgebreaker for static"
  - "2h: textureCompress — KTX2 + Basis (UASTC for normals, ETC1S for color/MR/emissive)"
  - "1h: __tests__/gltf-pipeline.test.mjs — pipeline runs end-to-end on fixtures, output size < threshold"
  - "1h: package.json scripts + CI wiring in perf-budgets.yml"
  - "1h: README.md inline (top of script) — usage, pitfalls, version requirements"

risk_if_skipped: |
  Master plan §4.3: "the Blender exporter alone produces oversized GLBs and doesn't support
  EXT_meshopt_compression." Without a Stage-2 pipeline, Lumi exports at ~12-18 MB raw. The 3-MB
  budget (master plan §4.4) is unreachable without compression + KTX2. Skip → asset weight 4-6×
  over budget → LCP blown, mobile UX broken, no shipping the site.
---

## §1 — Description (BCP-14 normative)

A Node ESM driver script `scripts/gltf-pipeline.mjs` **MUST** be authored that consumes a `.glb` from `assets-built/raw/` and emits an optimized `.glb` to `assets-built/optimized/`, applying the two-stage pipeline from master plan §4.3.

1. **MUST** be a single Node ESM file (`.mjs`) using `@gltf-transform/core`, `@gltf-transform/extensions`, `@gltf-transform/functions`. Node 20+.
2. **MUST NOT** apply **Draco** to any input that contains morph targets or skinned animation. Master plan §4.3 is explicit: Draco degrades morph target precision. Detect via `doc.getRoot().listMeshes().some(m => m.listPrimitives().some(p => p.listTargets().length > 0))` or by file naming convention (any file matching `lumi*.glb` or `*-rigged.glb`).
3. **MUST** apply **Meshopt** (`@gltf-transform/functions` `meshopt()` with `level: 'medium'`) to morph-bearing / skinned inputs. Meshopt was designed for geometry + morph targets + animation; this is the only correct choice for Lumi.
4. **MUST** apply **Draco edgebreaker** (`draco({ method: 'edgebreaker' })`) to static-only inputs (no morph, no skin). Smaller file than Meshopt for static geometry.
5. **MUST** select the compression branch via a `gltf-pipeline.config.json` mapping filename glob → strategy (`'meshopt' | 'draco'`). Default: `'meshopt'` (safer). The script MAY override via auto-detection (rule #2) when no config glob matches.
6. **MUST** run a **pre-pass** before compression: `dedup()` → `prune()` → `weld({ tolerance: 0.0001 })` → `resample()`. These functions deduplicate textures/buffers, drop unused data, weld vertices below the tolerance, and resample animation curves at consistent rates. Skipping the pre-pass leaves 10-30% of bytes on the table.
7. **MUST** compress textures via `textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80 })` for non-VRAM-critical textures, AND via KTX2 + Basis Universal for VRAM-critical textures. KTX2 encoding: **UASTC** for normal maps, **ETC1S** for color/MR-packed/emissive. (Master plan §4.3 — UASTC preserves normal precision; ETC1S is smaller for everything else.)
8. **MUST** preserve PBR metal-roughness packing — `OcclusionRoughnessMetallic` MUST remain in a single texture channel after the pipeline. Don't accidentally split the channels.
9. **MUST** emit a JSON report alongside the optimized .glb: `<output>.report.json` containing before/after byte sizes, vertex counts, triangle counts, animation count, morph target count, texture count + per-texture compression mode. The report is consumed by FR-OPS-003 (PR comment integration).
10. **MUST** exit 1 on any of: input file missing, output directory not writable, glTF parse error, post-pipeline size still > 110% of `target` from `tools/perf-budgets/budgets.json` (early warn — the CI asset-size gate at FR-PERF-001 still applies as the authority).
11. **MUST** support a `--dry-run` flag that runs the pipeline but writes no files; reports what would have been written. Useful for local debugging.
12. **MUST** support a `--verbose` flag printing per-step byte deltas (e.g. "dedup: 8.4 MB → 8.4 MB (no change)" / "weld: 8.4 MB → 7.8 MB (-7%)" / "meshopt: 7.8 MB → 2.9 MB (-63%)").
13. **MUST NOT** mutate any file under `assets-built/raw/` (raw inputs are immutable).
14. **MUST** be CI-friendly: deterministic output bytes given identical input + config + library versions. Asserted via SHA-256 hash test.
15. **SHOULD** log a warning when `level: 'medium'` Meshopt could be tightened to `'high'` (saves an extra 10-15% on highly-rigged meshes). Don't auto-bump — let the artist opt in.

---

## §2 — Why this design (rationale for humans)

**Why two stages?** Master plan §4.3 is explicit: the Blender exporter alone produces oversized GLBs and doesn't support `EXT_meshopt_compression`. A two-stage pipeline lets the artist iterate fast in Blender (export with compression OFF, no roundtrip overhead) while the CI script handles the production-grade compression deterministically.

**Why "Meshopt for Lumi, Draco for static"?** Draco's edgebreaker algorithm reorders vertices for better delta-coding. That reorder mangles morph targets (the deltas don't apply correctly after reorder). Meshopt was designed for animated geometry; it preserves morph-target precision while still giving 50-70% size reduction. The trade-off: Meshopt files are slightly larger than Draco for purely static geometry. So we route by content type. Master plan §4.3 explicitly cites this — it's not an opinion.

**Why UASTC vs ETC1S?** Normal maps encode surface direction; small precision loss shows up as visible shading artefacts. UASTC preserves precision at a higher byte cost (~3-4× ETC1S). Color/MR/emissive can absorb precision loss — ETC1S is fine. Master plan §4.3 says: "UASTC for normals, ETC1S for color/MR/emissive". We follow this without exception.

**Why deterministic output?** CI caching. If the same input + config produces the same output bytes, the CI cache hits on every unchanged asset. Without determinism, every CI run re-compresses every asset (~30s × 8 scenes = 4 min lost per run). Determinism requires pinning library versions and seeding any randomness (e.g. Meshopt's vertex-cluster optimisation has a randomised tie-breaker).

**Why exit 1 on >110% target?** Early warning. The `tools/perf-budgets/check-asset-sizes.mjs` (FR-PERF-001) is the authoritative gate at the `fail` threshold (3.5 MB for Lumi). But the pipeline knows the per-asset size right after compression; failing at the soft 110% target (3.3 MB) gives the artist a tight feedback loop without waiting for the full CI gate.

**Why JSON report?** FR-OPS-003 reads it to post a PR comment with the size delta. Without a structured report, FR-OPS-003 would have to parse stdout (brittle). JSON is the API contract between this script and the PR-comment tool.

---

## §3 — Public surface contract

### §3.1 `gltf-pipeline.config.json`

```jsonc
{
  "$schema": "./gltf-pipeline.config.schema.json",
  "strategies": [
    { "match": "lumi*.glb",            "strategy": "meshopt", "meshoptLevel": "medium" },
    { "match": "lumi-nonla.glb",       "strategy": "meshopt", "meshoptLevel": "medium" },
    { "match": "scene-*-rigged.glb",   "strategy": "meshopt", "meshoptLevel": "medium" },
    { "match": "scene-*-prop.glb",     "strategy": "draco",   "dracoMethod": "edgebreaker" },
    { "match": "*",                    "strategy": "meshopt", "meshoptLevel": "medium" }   // fallback (safer)
  ],
  "textureCompression": {
    "default":   { "format": "webp", "quality": 80 },
    "normalMap": { "format": "ktx2", "mode": "UASTC" },
    "colorMR":   { "format": "ktx2", "mode": "ETC1S" },
    "emissive":  { "format": "ktx2", "mode": "ETC1S" }
  },
  "prePass": ["dedup", "prune", "weld", "resample"],
  "weldTolerance": 0.0001,
  "earlyWarnPercent": 110,
  "logLevel": "info"
}
```

### §3.2 `scripts/gltf-pipeline.mjs` (excerpt — driver shape)

```js
#!/usr/bin/env node
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, weld, resample, draco, meshopt, textureCompress } from '@gltf-transform/functions';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { argv, exit } from 'node:process';
import { Encoder as DracoEncoder } from 'draco3dgltf';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { minimatch } from 'minimatch';
import budgets from '../tools/perf-budgets/budgets.json' assert { type: 'json' };

const args = argv.slice(2);
const verbose = args.includes('--verbose');
const dryRun = args.includes('--dry-run');
const [input, output] = args.filter(a => !a.startsWith('--'));

if (!input || !output) {
  console.error('usage: gltf-pipeline.mjs <input.glb> <output.glb> [--dry-run] [--verbose]');
  exit(2);
}

const config = JSON.parse(readFileSync(new URL('./gltf-pipeline.config.json', import.meta.url), 'utf8'));

// 1. Select strategy
const filename = basename(input);
const strategy = config.strategies.find(s => minimatch(filename, s.match))?.strategy ?? 'meshopt';

// 2. Read input
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.encoder': await DracoEncoder(),
  'meshopt.encoder': MeshoptEncoder,
});
const doc = await io.read(input);

// 3. Auto-detect rule #2: any morph/skin → force meshopt
const hasMorph = doc.getRoot().listMeshes().some(m => m.listPrimitives().some(p => p.listTargets().length > 0));
const hasSkin = doc.getRoot().listSkins().length > 0;
const finalStrategy = (hasMorph || hasSkin) ? 'meshopt' : strategy;

const beforeBytes = statSync(input).size;
const report = { input, output, strategy: finalStrategy, steps: [], hasMorph, hasSkin };

function logStep(name, fn) {
  const start = doc.toJSON(); // not really tracking bytes here; use a hash or estimator
  return doc.transform(fn).then(() => {
    report.steps.push({ name, ts: Date.now() });
    if (verbose) console.error(`step ${name} done`);
  });
}

// 4. Pre-pass
await doc.transform(dedup(), prune(), weld({ tolerance: config.weldTolerance }), resample());

// 5. Compression branch
if (finalStrategy === 'meshopt') {
  await doc.transform(meshopt({ level: 'medium' }));
} else {
  await doc.transform(draco({ method: 'edgebreaker' }));
}

// 6. Texture compression — split by role (normalMap vs color/MR/emissive)
//    Implementation detail: walk doc.getRoot().listTextures(), pick mode per texture metadata.
//    Pseudo here:
await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80 }));
// (KTX2 + UASTC/ETC1S branch — using a Basis tool subprocess if encoder not bundled)

// 7. Write or report
if (dryRun) {
  console.log(JSON.stringify(report, null, 2));
  exit(0);
}
mkdirSync(dirname(output), { recursive: true });
await io.write(output, doc);

// 8. Verify size
const afterBytes = statSync(output).size;
report.beforeBytes = beforeBytes;
report.afterBytes = afterBytes;
report.shrinkPercent = ((beforeBytes - afterBytes) / beforeBytes * 100).toFixed(1);

writeFileSync(output.replace(/\.glb$/, '.report.json'), JSON.stringify(report, null, 2));

// 9. Early-warn check
const target = budgets.assets.lumi_glb_mb.target * 1024 * 1024; // for lumi*.glb
if (filename.startsWith('lumi') && afterBytes > target * 1.10) {
  console.error(`EARLY WARN: ${filename} ${(afterBytes / 1024 / 1024).toFixed(2)} MB > 110% of target ${budgets.assets.lumi_glb_mb.target} MB`);
  exit(1);
}

console.log(`OK ${filename}: ${(beforeBytes / 1024 / 1024).toFixed(2)} MB → ${(afterBytes / 1024 / 1024).toFixed(2)} MB (${report.shrinkPercent}% smaller, strategy=${finalStrategy})`);
exit(0);
```

### §3.3 Report JSON shape

```jsonc
{
  "input": "assets-built/raw/lumi.raw.glb",
  "output": "assets-built/optimized/lumi.glb",
  "strategy": "meshopt",
  "hasMorph": true,
  "hasSkin": true,
  "beforeBytes": 16_580_000,
  "afterBytes": 2_840_000,
  "shrinkPercent": "82.9",
  "steps": [
    { "name": "dedup", "ts": 1747400000000 },
    { "name": "prune", "ts": 1747400000123 },
    { "name": "weld", "ts": 1747400000456 },
    { "name": "resample", "ts": 1747400000789 },
    { "name": "meshopt", "ts": 1747400002000 },
    { "name": "textureCompress", "ts": 1747400005000 }
  ]
}
```

### §3.4 CI invocation

```yaml
# .github/workflows/perf-budgets.yml (excerpt)
- name: Run gltf-pipeline on every raw asset
  run: |
    set -e
    for raw in assets-built/raw/*.glb; do
      out="assets-built/optimized/$(basename "$raw" .raw.glb).glb"
      node scripts/gltf-pipeline.mjs "$raw" "$out"
    done
- name: Check asset sizes (FR-PERF-001)
  run: pnpm exec node tools/perf-budgets/check-asset-sizes.mjs
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **Pipeline script exists + runnable** — `node scripts/gltf-pipeline.mjs --help` (or no-arg) MUST exit 2 with the usage string. `node scripts/gltf-pipeline.mjs scripts/__tests__/fixtures/lumi.raw.glb /tmp/out.glb` MUST exit 0.
2. **Meshopt branch for morphs** — Run pipeline on `lumi.raw.glb` (a fixture with morph targets); inspect output via `gltf-transform inspect /tmp/out.glb`; output MUST include `EXT_meshopt_compression` extension. MUST NOT include `KHR_draco_mesh_compression`.
3. **Draco branch for static** — Run pipeline on `static-prop.raw.glb`; output MUST include `KHR_draco_mesh_compression`. MUST NOT include `EXT_meshopt_compression`.
4. **Auto-detect overrides config glob** — Create a `lumi-test-static.raw.glb` (no morph, no skin, but matches `lumi*` glob → config says meshopt); run pipeline; verify it uses meshopt (config is the default, no morph detected, strategy remains meshopt). Then create a hypothetical `lumi-morphed.raw.glb` with morphs but somehow misconfigured to draco — auto-detect MUST force meshopt and log a warning.
5. **Pre-pass runs in order** — Report JSON MUST list steps in order: `dedup → prune → weld → resample → (meshopt|draco) → textureCompress`. Asserted via `__tests__/gltf-pipeline.test.mjs`.
6. **Texture compression splits by role** — On a fixture with a tagged normal map, output normal texture MUST be KTX2/UASTC; output color texture MUST be KTX2/ETC1S OR WebP (per config). Asserted via reading texture mimeType from output glTF.
7. **Report JSON shape** — `<output>.report.json` MUST be valid JSON conforming to §3.3 shape. Required keys: `input`, `output`, `strategy`, `hasMorph`, `hasSkin`, `beforeBytes`, `afterBytes`, `shrinkPercent`, `steps`.
8. **Determinism** — Run pipeline twice on the same input + same config; SHA-256 of both outputs MUST match.
9. **Early-warn fails** — Stub a `lumi.raw.glb` that compresses to 3.3 MB (above 110% of 3.0 MB target); pipeline MUST exit 1; stderr MUST contain `EARLY WARN`.
10. **Raw immutability** — Run pipeline; `assets-built/raw/lumi.raw.glb` mtime MUST be unchanged.
11. **dry-run writes no files** — Run with `--dry-run`; verify `/tmp/out.glb` does NOT exist after; report is printed to stdout.
12. **`textureCompress` preserves PBR packing** — On a fixture with `OcclusionRoughnessMetallic`-packed texture, output MUST still have the three channels packed in one texture (not three separate textures).
13. **Lumi fixture compresses to < 3.5 MB** — Real Lumi fixture (or close proxy at production-mesh density) MUST output ≤ 3.5 MB after pipeline (the hard-fail threshold).
14. **CI invocation passes** — Synthetic CI run with fixture batch MUST succeed end-to-end.

---

## §5 — Verification method

**Tests (`verify: T`):**

```javascript
// scripts/__tests__/gltf-pipeline.test.mjs
import { describe, expect, test } from 'vitest';
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';

const PIPE = './scripts/gltf-pipeline.mjs';

describe('FR-OPS-001 — gltf-pipeline', () => {
  test('AC#1: prints usage on no args', () => {
    let code = 0;
    try { execFileSync('node', [PIPE]); } catch (e) { code = e.status; }
    expect(code).toBe(2);
  });

  test('AC#2: meshopt for morph-bearing input', () => {
    execFileSync('node', [PIPE, 'scripts/__tests__/fixtures/lumi.raw.glb', '/tmp/lumi.test.glb']);
    const inspect = execSync('npx gltf-transform inspect /tmp/lumi.test.glb').toString();
    expect(inspect).toMatch(/EXT_meshopt_compression/);
    expect(inspect).not.toMatch(/KHR_draco_mesh_compression/);
  });

  test('AC#3: draco for static input', () => {
    execFileSync('node', [PIPE, 'scripts/__tests__/fixtures/static-prop.raw.glb', '/tmp/prop.test.glb']);
    const inspect = execSync('npx gltf-transform inspect /tmp/prop.test.glb').toString();
    expect(inspect).toMatch(/KHR_draco_mesh_compression/);
  });

  test('AC#8: deterministic output', () => {
    execFileSync('node', [PIPE, 'scripts/__tests__/fixtures/lumi.raw.glb', '/tmp/a.glb']);
    execFileSync('node', [PIPE, 'scripts/__tests__/fixtures/lumi.raw.glb', '/tmp/b.glb']);
    const h1 = createHash('sha256').update(readFileSync('/tmp/a.glb')).digest('hex');
    const h2 = createHash('sha256').update(readFileSync('/tmp/b.glb')).digest('hex');
    expect(h1).toBe(h2);
  });

  test('AC#10: raw input immutable', () => {
    const before = statSync('scripts/__tests__/fixtures/lumi.raw.glb').mtimeMs;
    execFileSync('node', [PIPE, 'scripts/__tests__/fixtures/lumi.raw.glb', '/tmp/lumi.r.glb']);
    const after = statSync('scripts/__tests__/fixtures/lumi.raw.glb').mtimeMs;
    expect(after).toBe(before);
  });

  test('AC#11: --dry-run writes no files', () => {
    if (existsSync('/tmp/dry.glb')) unlinkSync('/tmp/dry.glb');
    execFileSync('node', [PIPE, 'scripts/__tests__/fixtures/lumi.raw.glb', '/tmp/dry.glb', '--dry-run']);
    expect(existsSync('/tmp/dry.glb')).toBe(false);
  });
});
```

CI gate: `pnpm exec node --test scripts/__tests__/gltf-pipeline.test.mjs` runs in the `perf-budgets` workflow. Failure blocks merge.

---

## §6 — Dependencies

- Node 20+, npm packages: `@gltf-transform/core`, `@gltf-transform/extensions`, `@gltf-transform/functions`, `draco3dgltf`, `meshoptimizer`, `sharp`, `minimatch`.
- KTX2/Basis encoder available on `$PATH` (typically `basisu` or `toktx` CLI) — bundled into the CI image.
- Test fixtures: small `lumi.raw.glb` (morphs + skin) and `static-prop.raw.glb` (geometry only) — committed to the repo via Git LFS.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Draco accidentally applied to morphed Lumi (mangled output) | AC#2 — inspect shows `KHR_draco_mesh_compression` on Lumi | Force meshopt via auto-detect in §1 #2; reject config that maps lumi*→draco |
| Morph target precision lost despite meshopt | Visual regression in P4 | Bump `meshoptLevel: 'high'` (§1 #15 warning); re-test |
| KTX2 encoder missing on CI host | Pipeline exits with `basisu: command not found` | Bundle `basisu` into the docker image; document in CI README |
| Determinism breaks across @gltf-transform versions | AC#8 fails after dep bump | Pin exact dep versions in `package.json` (no `^`); document the pin |
| Output > 110% target (early warn) | AC#9 + pipeline stderr | Artist tightens source mesh (lower tri count, simpler materials); re-export from Blender |
| Texture compression loses normal precision | Visual regression in Lumi shading | Verify normalMap → UASTC mapping; ETC1S would degrade normals |
| Raw input mutated by mistake | AC#10 fails | Pipeline must use NodeIO read, not modify-in-place; fix with explicit immutability |
| ORM packing split into 3 textures | AC#12 fails | textureCompress config keeps single-texture packing; verify schema metadata is preserved |
| CI re-compresses every asset on every run (cache miss) | CI duration > 5 min for asset stage | Add a content-hash-based cache key; deterministic output (AC#8) enables it |
| `.report.json` orphans (raw deleted, optimized + report kept) | Periodic audit | `assets-built/optimized/` is regenerated by CI; treat as derived, gitignore it |

---

## §8 — Notes

- The pipeline is the **single** technical mitigation for master plan §10.2 risk #1 ("Lumi GLB exceeds 3 MB"). Without it, no other mitigation works. Treat as production-critical.
- The `assets-built/optimized/` directory is **derived**, not source. Gitignored, regenerated by CI. The source of truth is `assets-built/raw/` (which is itself derived from `assets-source/blender/`).
- Future enhancement (FR-OPS-NNN): cache the pipeline output via a content-addressed store (e.g. `dist/<sha256>.glb`) so re-deploys skip unchanged assets. Out of scope for slice 1 — focus is making the pipeline correct + deterministic first.
- The KTX2 + Basis encoder branch is the most subtle: getting UASTC vs ETC1S right per texture requires metadata on the source (e.g. a `usage: "normalMap"` glTF extension or a filename convention `*_normal.png`). Document the convention in the script's README.

---

*End of FR-OPS-001. Audit: `FR-OPS-001-gltf-transform-pipeline.audit.md`.*
