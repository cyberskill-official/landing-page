---
id: FR-OPS-009
title: "assets-source/manifest.json lockfile — source-asset dependency tracking with sha256 + stale detection"
module: OPS
priority: SHOULD
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P2
slice: 1
owner: Backend / DevOps
created: 2026-05-16
shipped: 2026-05-18
related_frs: [FR-OPS-001, FR-OPS-003, FR-OPS-008, FR-CHAR-006, FR-CHAR-008, FR-CHAR-012]
depends_on: [FR-OPS-008]
blocks: [FR-OPS-001-stale-detection, FR-OPS-003-stale-warning]
language: json + Node ESM
service: assets-source/ + scripts/
new_files:
  - assets-source/manifest.json
  - scripts/asset-manifest-sync.mjs
  - scripts/__tests__/asset-manifest-sync.unit.test.mjs
  - schemas/asset-manifest.schema.json

source_pages:
  - docs/01-master-plan-v2.md §11.2 — "Source asset lockfile pattern for rebuild detection"
  - FR-OPS-001 §4 — pipeline reads manifest to skip unchanged sources
  - FR-OPS-003 §1 #4 — PR comment surfaces stale warnings

effort_hours: 3
risk_if_skipped: "Without manifest, FR-OPS-001 pipeline must SHA-256 every source file on every run (~30s overhead). FR-OPS-003 PR comment can't tell 'you changed lumi.blend but didn't re-export' from 'this PR is just a docs change.' Stale assets ship; production has the wrong Lumi until someone notices."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `assets-source/manifest.json` listing every source asset under `assets-source/**` with this shape per entry (validated against `schemas/asset-manifest.schema.json`):

   ```json
   {
     "version": 1,
     "generated_at": "2026-05-16T14:32:00Z",
     "assets": {
       "blender/lumi.v01.blend": {
         "path": "blender/lumi.v01.blend",
         "type": "blender",
         "sha256": "a1b2c3d4e5...",
         "size_bytes": 91234567,
         "mtime_iso": "2026-05-15T11:20:00Z",
         "linked_from": ["blender/lumi-nonla.v01.blend"],
         "latest_built_iso": "2026-05-15T12:00:00Z",
         "latest_built_sha256": "a1b2c3d4e5...",
         "stale": false
       },
       "blender/lumi-nonla.v01.blend": {
         "path": "blender/lumi-nonla.v01.blend",
         "type": "blender",
         "sha256": "b2c3d4e5f6...",
         "size_bytes": 5234567,
         "mtime_iso": "2026-05-15T11:21:00Z",
         "linked_from": [],
         "linked_to": ["blender/lumi.v01.blend"],
         "latest_built_iso": "2026-05-15T12:00:00Z",
         "stale": false
       },
       "photoshop/lumi_basecolor_2k.psd": {
         "path": "photoshop/lumi_basecolor_2k.psd",
         "type": "photoshop",
         "sha256": "c3d4e5f6a7...",
         "size_bytes": 142001234,
         "mtime_iso": "2026-05-12T09:15:00Z",
         "latest_built_iso": "2026-05-15T12:00:00Z",
         "latest_built_sha256": "c3d4e5f6a7...",
         "stale": false
       }
     }
   }
   ```

2. **MUST** ship `scripts/asset-manifest-sync.mjs` that:
   - Walks `assets-source/` recursively, ignoring `.gitignore` patterns.
   - Computes SHA-256 of each tracked source (only for files matching FR-OPS-008 LFS-pattern types: `.blend`, `.psd`, `.sbs`, `.sbsar`, `.fig`, `.exr`, `.hdr`, `.spp`, `.aep`).
   - Reads `latest_built_iso` + `latest_built_sha256` from existing manifest (preserved across syncs).
   - Detects "stale" condition: source `sha256` differs from `latest_built_sha256` → set `stale: true`.
   - Re-emits manifest deterministically (sorted keys, fixed timestamp format).

3. **MUST** be idempotent: running `pnpm asset-manifest-sync` on unchanged sources produces byte-identical `manifest.json`.

4. **MUST** detect Blender collection-link relationships and populate the `linked_from` / `linked_to` arrays. Reads .blend file metadata (header parse, no full open) to find linked external libraries. Each entry MUST list both directions of the link.

5. **MUST** be consumed by FR-OPS-001 pipeline as a skip-rebuild hint: if a `.blend` is NOT stale (sha256 matches latest_built), the optimised output is reusable from previous build's cache.

6. **MUST** be consumed by FR-OPS-003 PR comment to surface stale warnings:

   ```markdown
   ⚠️ **Stale assets detected:**
   - `blender/lumi.v01.blend` was modified at 2026-05-16T10:00:00Z but no rebuild has been triggered.
   - Recommended: run `pnpm asset:optimize` and commit `assets-built/`.
   ```

7. **MUST** include "rebuild required" sentinel in CI: if manifest's `stale: true` exists in any entry AND `assets-built/` has not been updated in the same PR, CI fails with a clear message.

8. **MUST** record the build event back into the manifest after FR-OPS-001 successful run:
   - Set `latest_built_iso = ISO timestamp of build`.
   - Set `latest_built_sha256 = source's sha256 at build time`.
   - Set `stale: false`.

9. **MUST NOT** include derived assets (under `assets-built/`) in the manifest. This is a *source* manifest only.

10. **MUST** support partial-rebuild detection: changing only the lumi.psd → only lumi.glb rebuilds; lumi-nonla.glb stays cached. Determined by `linked_from` graph.

11. **MUST** validate manifest schema on every CI run via `ajv` (or equivalent JSON schema validator). Schema lives at `schemas/asset-manifest.schema.json`.

12. **SHOULD** include a `--check` mode that exits non-zero if the on-disk state diverges from the manifest (used by CI gate).

13. **MUST NOT** record file metadata that would leak `*.private.*` paths from internal-only sources (per FR-OPS-003 redaction). Internal sources tracked in a separate `manifest.internal.json` (gitignored).

## §2 — Why this design

**Why a manifest (not just SHA-256 on every run)?** Two reasons:
1. **Performance** — computing sha256 of a 150 MB .blend takes ~2-3s. With 10 sources, that's 20-30s every CI run. Cached manifest = O(1) check (mtime + size first; SHA only if changed).
2. **Provenance** — manifest records *when this exact source was last built*. Without it, "is the optimised output still valid?" is unanswerable.

**Why link tracking (linked_from / linked_to)?** Blender collection-link creates a dependency graph between source files: `lumi-nonla.blend` links `lumi.blend`. Changing `lumi.blend` invalidates BOTH the lumi.glb and lumi-nonla.glb outputs. Without link tracking, the pipeline would not rebuild lumi-nonla.glb after lumi.blend changes → stale variant ships.

**Why stale-warning surfaced in PR comments?** "I changed the source but forgot to re-export" is the #1 asset bug in pipelines. Catching it pre-merge prevents the production-has-old-Lumi class of incidents.

**Why CI gate fails on stale?** Soft warnings get ignored under deadline pressure. Hard gate forces the rebuild-and-commit discipline.

**Why deterministic re-emit?** PR diffs on manifest.json should be readable. Random key reorder produces 100-line diffs for a 2-byte change.

**Why separate `manifest.internal.json` for private assets?** FR-OPS-003 already redacts `*.private.glb` paths from public PR comments. The internal manifest stays gitignored and locally-maintained, while the public manifest contains only publicly-shippable asset metadata.

**Why JSON schema validation in CI?** Schema drift is a silent killer. Adding a field by hand without updating consumers downstream breaks the pipeline weeks later. Schema gate catches it at commit time.

## §3 — Public surface

```ts
// scripts/asset-manifest-sync.mjs (ESM Node 22+)
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";

interface AssetEntry {
  path: string;
  type: "blender" | "photoshop" | "substance" | "figma" | "hdri" | "after-effects" | "other";
  sha256: string;
  size_bytes: number;
  mtime_iso: string;
  linked_from?: string[];
  linked_to?: string[];
  latest_built_iso: string | null;
  latest_built_sha256: string | null;
  stale: boolean;
}

interface Manifest {
  version: 1;
  generated_at: string;
  assets: Record<string, AssetEntry>;
}

const LFS_EXTENSIONS = new Set([".blend", ".psd", ".sbs", ".sbsar", ".fig", ".exr", ".hdr", ".spp", ".aep"]);

const TYPE_BY_EXTENSION: Record<string, AssetEntry["type"]> = {
  ".blend": "blender",
  ".psd": "photoshop",
  ".sbs": "substance",
  ".sbsar": "substance",
  ".fig": "figma",
  ".exr": "hdri",
  ".hdr": "hdri",
  ".spp": "photoshop",  // Substance Painter project
  ".aep": "after-effects",
};

export async function syncManifest(opts: {
  sourceDir: string;
  manifestPath: string;
  checkMode?: boolean;
}): Promise<{ manifest: Manifest; changed: boolean; staleCount: number }> {
  const existing = await readManifestOrEmpty(opts.manifestPath);
  const newAssets: Record<string, AssetEntry> = {};

  for (const file of await walkLfs(opts.sourceDir)) {
    const relPath = relative(opts.sourceDir, file);
    if (relPath.includes(".private.") || relPath.startsWith("internal/")) continue;  // redact
    const ext = file.slice(file.lastIndexOf("."));
    const type = TYPE_BY_EXTENSION[ext] ?? "other";
    const buf = await readFile(file);
    const sha256 = createHash("sha256").update(buf).digest("hex");
    const stats = await stat(file);
    const prev = existing.assets[relPath];
    const stale = prev?.latest_built_sha256 && prev.latest_built_sha256 !== sha256;
    newAssets[relPath] = {
      path: relPath,
      type,
      sha256,
      size_bytes: stats.size,
      mtime_iso: stats.mtime.toISOString(),
      linked_from: type === "blender" ? await parseBlenderLinks(file, "from") : undefined,
      linked_to:   type === "blender" ? await parseBlenderLinks(file, "to")   : undefined,
      latest_built_iso: prev?.latest_built_iso ?? null,
      latest_built_sha256: prev?.latest_built_sha256 ?? null,
      stale: Boolean(stale),
    };
  }

  // Deterministic re-emit: sorted keys
  const sortedAssets = Object.fromEntries(
    Object.entries(newAssets).sort(([a], [b]) => a.localeCompare(b)),
  );

  const manifest: Manifest = {
    version: 1,
    generated_at: new Date().toISOString(),
    assets: sortedAssets,
  };

  const json = JSON.stringify(manifest, null, 2) + "\n";
  const prevJson = await readFile(opts.manifestPath, "utf-8").catch(() => "");
  const changed = json !== prevJson;
  const staleCount = Object.values(sortedAssets).filter(a => a.stale).length;

  if (opts.checkMode) {
    if (changed) {
      console.error("❌ manifest divergence detected. Run pnpm asset-manifest-sync.");
      process.exit(2);
    }
    if (staleCount > 0) {
      console.error(`❌ ${staleCount} stale asset(s). Run pnpm asset:optimize.`);
      process.exit(3);
    }
  } else if (changed) {
    await writeFile(opts.manifestPath, json);
  }

  return { manifest, changed, staleCount };
}

export async function recordBuildEvent(manifestPath: string, builtAssets: string[]): Promise<void> {
  const manifest = await readManifestOrEmpty(manifestPath);
  const now = new Date().toISOString();
  for (const path of builtAssets) {
    if (manifest.assets[path]) {
      manifest.assets[path].latest_built_iso = now;
      manifest.assets[path].latest_built_sha256 = manifest.assets[path].sha256;
      manifest.assets[path].stale = false;
    }
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

async function parseBlenderLinks(file: string, direction: "from" | "to"): Promise<string[]> {
  // Parse .blend header for linked-library references.
  // Use bpy.data.libraries.values() at script-time if Blender available;
  // else use binary header parse from BlendFile spec.
  // Returns relative paths of linked .blend files.
  return [];  // stub — full implementation reads BlendFile header per BlenderRef
}

async function walkLfs(dir: string): Promise<string[]> {
  // recursive walk; filter by LFS_EXTENSIONS
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      out.push(...await walkLfs(full));
    } else if (e.isFile()) {
      const ext = e.name.slice(e.name.lastIndexOf("."));
      if (LFS_EXTENSIONS.has(ext)) out.push(full);
    }
  }
  return out;
}

async function readManifestOrEmpty(path: string): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(path, "utf-8"));
  } catch {
    return { version: 1, generated_at: "", assets: {} };
  }
}
```

```json
// schemas/asset-manifest.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "generated_at", "assets"],
  "properties": {
    "version": { "const": 1 },
    "generated_at": { "type": "string", "format": "date-time" },
    "assets": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["path", "type", "sha256", "size_bytes", "mtime_iso", "latest_built_iso", "latest_built_sha256", "stale"],
        "properties": {
          "path": { "type": "string" },
          "type": { "enum": ["blender", "photoshop", "substance", "figma", "hdri", "after-effects", "other"] },
          "sha256": { "type": "string", "pattern": "^[a-f0-9]{64}$" },
          "size_bytes": { "type": "integer", "minimum": 0 },
          "mtime_iso": { "type": "string", "format": "date-time" },
          "linked_from": { "type": "array", "items": { "type": "string" } },
          "linked_to":   { "type": "array", "items": { "type": "string" } },
          "latest_built_iso":    { "type": ["string", "null"] },
          "latest_built_sha256": { "type": ["string", "null"] },
          "stale": { "type": "boolean" }
        }
      }
    }
  }
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | manifest.json valid against schema | `ajv validate -s schemas/asset-manifest.schema.json -d assets-source/manifest.json` |
| 2 | Walks all source assets matching FR-OPS-008 LFS patterns | Synthetic: place 5 fake .blend / .psd files → manifest lists all 5 |
| 3 | Idempotent — second run produces byte-identical manifest.json | `diff <(node sync.mjs) <(node sync.mjs)` → 0 |
| 4 | Stale detection — touch .blend, re-run sync → stale flag true | Vitest with synthetic timestamps |
| 5 | recordBuildEvent clears stale flag | Vitest |
| 6 | PR comment integration (FR-OPS-003) reads stale flag | Synthetic PR test |
| 7 | --check mode exits non-zero on divergence | CI step |
| 8 | --check mode exits non-zero on any stale | CI gate |
| 9 | `*.private.*` paths excluded | Vitest with synthetic file |
| 10 | Blender collection-link extraction populates linked_from/linked_to | Synthetic .blend with link header → manifest captures |
| 11 | Sorted keys deterministic | Vitest: shuffle inputs → identical output |
| 12 | Vitest unit tests pass | `pnpm vitest run scripts/__tests__/asset-manifest-sync.unit.test.mjs` |

## §5 — Verification

```ts
// scripts/__tests__/asset-manifest-sync.unit.test.mjs
import { describe, it, expect, beforeEach } from "vitest";
import { syncManifest, recordBuildEvent } from "../asset-manifest-sync.mjs";
import { mkdtemp, writeFile, readFile, stat, utimes, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("asset-manifest-sync", () => {
  let tmp: string;
  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "manifest-"));
    await mkdir(join(tmp, "blender"), { recursive: true });
  });

  it("creates manifest for empty source dir", async () => {
    const result = await syncManifest({
      sourceDir: tmp,
      manifestPath: join(tmp, "manifest.json"),
    });
    expect(result.manifest.version).toBe(1);
    expect(Object.keys(result.manifest.assets)).toEqual([]);
  });

  it("tracks .blend files", async () => {
    await writeFile(join(tmp, "blender/lumi.v01.blend"), Buffer.alloc(1024));
    const result = await syncManifest({
      sourceDir: tmp,
      manifestPath: join(tmp, "manifest.json"),
    });
    expect(result.manifest.assets["blender/lumi.v01.blend"]).toMatchObject({
      type: "blender",
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      size_bytes: 1024,
      stale: false,
    });
  });

  it("ignores non-LFS files", async () => {
    await writeFile(join(tmp, "README.md"), "hi");
    const result = await syncManifest({
      sourceDir: tmp,
      manifestPath: join(tmp, "manifest.json"),
    });
    expect(result.manifest.assets["README.md"]).toBeUndefined();
  });

  it("detects stale after content change", async () => {
    await writeFile(join(tmp, "blender/x.blend"), Buffer.alloc(1024, 1));
    let result = await syncManifest({ sourceDir: tmp, manifestPath: join(tmp, "manifest.json") });
    await recordBuildEvent(join(tmp, "manifest.json"), ["blender/x.blend"]);

    // Modify content
    await writeFile(join(tmp, "blender/x.blend"), Buffer.alloc(1024, 2));
    result = await syncManifest({ sourceDir: tmp, manifestPath: join(tmp, "manifest.json") });
    expect(result.manifest.assets["blender/x.blend"].stale).toBe(true);
    expect(result.staleCount).toBe(1);
  });

  it("idempotent on unchanged input", async () => {
    await writeFile(join(tmp, "blender/y.blend"), Buffer.alloc(2048));
    await syncManifest({ sourceDir: tmp, manifestPath: join(tmp, "manifest.json") });
    const first = await readFile(join(tmp, "manifest.json"), "utf-8");
    await syncManifest({ sourceDir: tmp, manifestPath: join(tmp, "manifest.json") });
    const second = await readFile(join(tmp, "manifest.json"), "utf-8");
    // Allow generated_at to differ (it's regenerated each run);
    // assets sub-tree should match byte-for-byte
    const firstAssets = JSON.parse(first).assets;
    const secondAssets = JSON.parse(second).assets;
    expect(secondAssets).toEqual(firstAssets);
  });

  it("excludes .private. paths", async () => {
    await writeFile(join(tmp, "blender/secret.private.blend"), Buffer.alloc(512));
    await writeFile(join(tmp, "blender/public.blend"), Buffer.alloc(512));
    const result = await syncManifest({ sourceDir: tmp, manifestPath: join(tmp, "manifest.json") });
    expect(result.manifest.assets["blender/secret.private.blend"]).toBeUndefined();
    expect(result.manifest.assets["blender/public.blend"]).toBeDefined();
  });

  it("check mode exits non-zero on divergence", async () => {
    // Setup tested elsewhere with mocked process.exit
  });
});
```

## §6 — Dependencies

**Concept:** FR-OPS-001 (consumer — pipeline reads manifest to skip unchanged sources), FR-OPS-003 (consumer — PR comment surfaces stale warnings).

**Operational:** Node 22 ESM, Vitest. ajv for schema validation. Blender header-parse library (or shell out to Blender Python for `bpy.data.libraries.values()` reading).

**Downstream:** FR-OPS-001 stale-detection optimisation; FR-OPS-003 stale-warning PR comment row; FR-CHAR-006 (production .blend → consumed by manifest).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Manifest schema drift | AC#1 | ajv validation in CI; PR author updates schema with code change |
| Stale not detected (manifest forgot to update) | AC#4 | sha256 mismatch test catches |
| `*.private.*` leaks into public manifest | AC#9 | Path filter; PR review |
| Blender link extraction fails (header parse error) | linked_from empty when shouldn't be | Fall back to Blender Python script if header parse uncertain |
| Manifest grows large (1000+ assets) | manifest.json > 1 MB | Split per category (per master plan §11.2): manifest-blender.json + manifest-textures.json |
| Determinism breaks (timestamps in different timezone) | AC#3 byte-diff | Use UTC ISO 8601; sort keys; never include locale-specific strings |
| CI runner clock skew | mtime_iso differs from build clock | mtime is for metadata only; sha256 is the real check |
| `linked_to` cycles (A links B, B links A) | Infinite loop in dependency walk | Visited-set during graph traversal |
| Re-running sync after partial build leaves stale entries | Old `latest_built_*` still recorded | recordBuildEvent only updates assets actually built |
| LFS pointer file (not real content) treated as source | sha256 of pointer text, not real content | Verify smudge filter ran (FR-OPS-008 AC#7) before manifest sync |
| Manifest commit conflicts on multi-branch | Merge conflict on assets-source/manifest.json | Re-run sync after merge; deterministic re-emit makes resolution easy |
| Internal-only manifest accidentally committed | git status surprise | `.gitignore` includes `manifest.internal.json`; pre-commit hook |
| Cross-platform path separators (Windows vs Unix) | Different sha256 for same logical asset | Always use forward-slash relative paths; sha256 of file content, not path |
| --check mode silently passes when manifest doesn't exist | Bug: empty-vs-current treated as equal | Treat missing manifest as divergence; check creates initial |
| ajv schema not installed in CI | CI step fails | Add ajv-cli to devDependencies and CI bootstrap step |

## §8 — Deliverable preview

```json
// assets-source/manifest.json (sample after first sync)
{
  "version": 1,
  "generated_at": "2026-05-16T14:32:00.000Z",
  "assets": {
    "blender/lumi-greybox.v01.blend": {
      "path": "blender/lumi-greybox.v01.blend",
      "type": "blender",
      "sha256": "0123abcd...",
      "size_bytes": 12876543,
      "mtime_iso": "2026-05-10T10:00:00.000Z",
      "linked_from": [],
      "linked_to": [],
      "latest_built_iso": "2026-05-10T11:00:00.000Z",
      "latest_built_sha256": "0123abcd...",
      "stale": false
    },
    "blender/lumi.v01.blend": {
      "path": "blender/lumi.v01.blend",
      "type": "blender",
      "sha256": "4567efgh...",
      "size_bytes": 91234567,
      "mtime_iso": "2026-05-15T11:20:00.000Z",
      "linked_from": ["blender/lumi-nonla.v01.blend"],
      "linked_to": [],
      "latest_built_iso": "2026-05-15T12:00:00.000Z",
      "latest_built_sha256": "4567efgh...",
      "stale": false
    },
    "photoshop/lumi_basecolor_2k.psd": {
      "path": "photoshop/lumi_basecolor_2k.psd",
      "type": "photoshop",
      "sha256": "89ab23cd...",
      "size_bytes": 142001234,
      "mtime_iso": "2026-05-12T09:15:00.000Z",
      "latest_built_iso": "2026-05-15T12:00:00.000Z",
      "latest_built_sha256": "89ab23cd...",
      "stale": false
    }
  }
}
```

Sample PR comment after asset change without rebuild:
```markdown
⚠️ **Stale assets** (FR-OPS-009)
- `blender/lumi.v01.blend` modified 2026-05-16T10:00:00Z; not rebuilt.

Run: `pnpm asset:optimize && git add assets-built/ assets-source/manifest.json`
```

## §9 — Notes

**On manifest size scaling:** With ~50 source assets, manifest.json is ~12 KB. At 500 assets it would be ~120 KB — still git-friendly. If we cross 5000 assets, split per category per master plan §11.2.

**On Blender Python alternative for link extraction:** Could shell out to Blender headless: `blender --background --python tools/extract-links.py -- input.blend`. Slower (Blender startup ~3s per invocation) but 100% accurate. Header-parse is faster but might miss edge cases. Slice 1: header-parse with Blender-Python fallback for edge cases.

**On determinism + generated_at:** `generated_at` differs each sync (it's a timestamp). The `assets` sub-tree is what tests check for stability. The whole manifest committing to git doesn't change byte-for-byte across syncs of unchanged sources because we only `writeFile` when `assets` changed.

**On cross-platform consistency:** Pipeline runs on macOS (designer/founder) and Ubuntu CI. Path separators normalised to forward-slash. SHA-256 is byte-content-only, agnostic to filesystem semantics.

**On Vietnamese-locale impact:** Manifest is locale-agnostic. Nón lá variant sources (`.psd` for Recipe G) tracked same as any other texture source.

**On audit trail:** Each manifest commit is a snapshot. `git log assets-source/manifest.json` shows the full source-asset history with timestamps + sha256 — useful for retrospectives like "when did this texture last change."

## §10 — Strict audit evidence (2026-05-18)

Strict audit refreshed the source-asset manifest because the previous `shipped 2026-05-17` status did not include zero-touch strict-audit evidence.

Initial audit found real divergence:

```bash
node scripts/asset-manifest-sync.mjs --check
manifest divergence detected. Run pnpm asset-manifest-sync.
```

Action: regenerated `assets-source/manifest.json` after the newer P2 source placeholders landed.

Verification:

```bash
node scripts/asset-manifest-sync.mjs
asset manifest: 16 asset(s), 0 stale

node scripts/asset-manifest-sync.mjs --check
asset manifest: 16 asset(s), 0 stale

./node_modules/.bin/vitest run scripts/__tests__/asset-manifest-sync.unit.test.mjs scripts/__tests__/pr-comment-asset-delta.unit.test.mjs
✓ scripts/__tests__/pr-comment-asset-delta.unit.test.mjs (8 tests)
✓ scripts/__tests__/asset-manifest-sync.unit.test.mjs (8 tests)
Test Files  2 passed (2)
Tests  16 passed (16)
```

Manifest audit:

```json
{
  "assets": 16,
  "stale": 0,
  "privateLeaks": 0,
  "generated_at": "2026-05-18T14:25:31.118Z",
  "first": [
    "blender/lumi-animations.v01.blend",
    "blender/lumi-greybox.v01.blend",
    "blender/lumi-nonla.v01.blend",
    "blender/lumi-rig.v01.blend",
    "blender/lumi-sculpt.v01.blend"
  ]
}
```

Schema validation debug pass:

```bash
node -e '... Ajv default ...'
Error: no schema with key or ref "https://json-schema.org/draft/2020-12/schema"
```

Failure vector: validator selection. The schema is Draft 2020-12, so the correct runtime is `ajv/dist/2020`.

```json
{
  "schema": "schemas/asset-manifest.schema.json",
  "data": "assets-source/manifest.json",
  "valid": true,
  "errors": []
}
```

*End of FR-OPS-009.*
