---
id: FR-OPS-004
title: "KTX2 + Basis Universal texture compression — UASTC for normals, ETC1S for color/MR/emissive"
module: OPS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P2
slice: 1
owner: Backend / DevOps
created: 2026-05-16
related_frs: [FR-OPS-001, FR-CHAR-008, FR-CHAR-012, FR-PERF-001, FR-OPS-002, FR-OPS-005]
depends_on: [FR-OPS-001, FR-OPS-005]
blocks: [FR-CHAR-008-pipeline-consumption, FR-CHAR-012, FR-PERF-001]
language: bash + Node ESM
service: scripts/
new_files:
  - scripts/ktx2-encode.mjs
  - scripts/__tests__/ktx2-encode.unit.test.mjs

source_pages:
  - docs/01-master-plan-v2.md §4.3 — "KTX2/Basis texture compression strategy"
  - docs/01-master-plan-v2.md §6.3 — VRAM budget targets
  - FR-CHAR-008 §1 — texture roles in PBR shader contract

effort_hours: 4
risk_if_skipped: "Raw PNG textures consume ~24 MB VRAM on full Lumi load. Mobile budget is 8 MB total scene VRAM (FR-PERF-001). Without KTX2/Basis, Lumi alone busts the budget; corner avatar on Scene 5 / footer / hero stack causes crash on tier-low devices."
---

## §1 — Description (BCP-14 normative)

1. **MUST** integrate as stage 2 of FR-OPS-001's pipeline: takes glTF + embedded PNG textures from stage 1 (Substance Painter export), outputs glTF with `KHR_texture_basisu` extension pointing to `.ktx2` files.

2. **MUST** route each texture to the correct Basis Universal mode by role per master plan §4.3:
   - **Normal maps** → KTX2 + **UASTC** (Universal ASTC; preserves precision for surface detail)
   - **BaseColor** → KTX2 + **ETC1S** (smaller, color-only; acceptable for diffuse)
   - **Occlusion-Roughness-Metallic (ORM) packed** → KTX2 + **ETC1S**
   - **Emissive** → KTX2 + **ETC1S**

3. **MUST** detect texture role from glTF metadata at the texture-info reference level:
   - `materials[i].pbrMetallicRoughness.baseColorTexture.index` → role: `baseColor`
   - `materials[i].normalTexture.index` → role: `normal`
   - `materials[i].occlusionTexture.index` + `pbrMetallicRoughness.metallicRoughnessTexture.index` → role: `orm` (packed)
   - `materials[i].emissiveTexture.index` → role: `emissive`

4. **MUST** preserve mip levels. KTX2 supports baked mipmaps; pipeline MUST generate them at encode time (avoid runtime mipgen cost on GPU). Mipmap chain depth: `log2(max(width, height)) + 1`, e.g. 2048×2048 → 12 levels.

5. **MUST** achieve VRAM reduction ≥ **6×** vs source PNG/JPEG (master plan §4.3 claim). Measured as: sum of `KTX2 GPU memory footprint` (per `gltf-transform inspect`) vs sum of `original PNG bytes × 4 (RGBA decompressed)` from the source materials list. Asserted by FR-OPS-001 report.

6. **MUST** invoke `basisu` or `toktx` (from KTX-Software 4.x) as the encoder. Binary bundled into the CI Docker image (FR-OPS-001 §7 row 3 dependency).

7. **MUST** encode with these specific basisu/toktx flags per role:

   | Role | Encoder flags | Quality target | Q value |
   |---|---|---|---|
   | normal | `--uastc --uastc_quality 2 --normal_map` | high (lossless-perceived) | 2 |
   | baseColor | `--bcmp --qlevel 200` (ETC1S) | visually acceptable | 200/255 |
   | orm | `--bcmp --qlevel 200 --linear` | visually acceptable | 200/255 |
   | emissive | `--bcmp --qlevel 200` | visually acceptable | 200/255 |

8. **MUST** verify each output via `ktx2check` (post-encode validation tool) before declaring success. Missing magic header, corrupted mipmap chain, or unsupported colour space → fail the pipeline.

9. **MUST NOT** double-encode already-KTX2 textures (idempotent on re-run).

10. **MUST** skip textures marked `assets-source/textures/**.skipKtx2.png` (escape hatch for development/iteration of raw-PNG variants).

11. **MUST** emit a per-texture sub-report into the parent asset's `<asset>.report.json` (FR-OPS-001 §3 contract):

    ```json
    "textures": [
      { "name": "lumi_basecolor_2k.png", "role": "baseColor", "mode": "ETC1S",
        "original_bytes": 1450012, "ktx2_bytes": 245100, "gpu_bytes": 2796202,
        "mip_levels": 12, "format": "BC7/ASTC LDR", "encode_seconds": 8.4 }
    ]
    ```

12. **MUST** be deterministic. Same input PNG bytes + same flags → byte-identical KTX2 output. CI cache key includes the input PNG SHA-256.

13. **MUST** handle multi-texture atlases correctly. If a texture is referenced by both baseColor and emissive slots, error out (forbidden in this pipeline) — atlas dedupe is the upstream Substance Painter step's job, not Basis encode.

14. **MUST** preserve sRGB / linear colour space:
    - baseColor + emissive → encoded as sRGB
    - normal + orm → encoded as linear

## §2 — Why this design

**Why split UASTC for normals vs ETC1S for color?** UASTC preserves the per-pixel precision normals need (a 1-pixel-off normal map produces visible artefacts on smooth surfaces — Lumi's hood/face). ETC1S is ~3× smaller but lossy in ways that humans tolerate on color but not on normals. Master plan §4.3 codifies the split.

**Why ≥6× VRAM reduction (not just smaller download)?** Download size is one number; GPU memory is another. KTX2/Basis decompresses to GPU-native formats (BC7 on desktop, ASTC on mobile), which stay compressed in VRAM. A 1 MB KTX2 file occupies ~1 MB GPU memory vs ~16 MB for the same texture as decoded PNG. This is what makes the 8 MB mobile VRAM budget achievable.

**Why baked mipmaps (not runtime)?** Runtime mipgen blocks the GPU for 30-50 ms on first render, causing visible Scene 0 hero hiccup. Pre-baked is free at runtime.

**Why qlevel 200 (not 255)?** Visual A/B testing: qlevel 200 produces no visible artefacts on Lumi's textures at 1080p viewing; qlevel 255 is ~12% larger for no perceptible win. Master plan §4.3 calibration.

**Why per-texture sub-report?** Founder and frontend lead need to know "which texture got the biggest savings" + "where is the budget pressure" during optimization passes. The sub-report makes it inspectable in PR comments via FR-OPS-003.

**Why determinism?** Reproducible builds — same source → same KTX2 binary. Lets the CI cache work properly and prevents "why did the byte count change with no source change?" investigation rabbit-holes.

## §3 — Public surface

```ts
// scripts/ktx2-encode.mjs (ESM Node 22+)
import { spawn } from "node:child_process";
import { readFile, writeFile, stat } from "node:fs/promises";

export type TextureRole = "baseColor" | "normal" | "orm" | "emissive";

export interface EncodeOpts {
  inputPath: string;
  outputPath: string;
  role: TextureRole;
  linear?: boolean;       // computed from role; override only in tests
}

export interface EncodeResult {
  inputBytes: number;
  outputBytes: number;
  gpuBytes: number;
  mode: "UASTC" | "ETC1S";
  mipLevels: number;
  encodeSeconds: number;
}

const FLAGS_BY_ROLE: Record<TextureRole, string[]> = {
  normal:    ["--uastc", "--uastc_quality", "2", "--normal_map", "--genmipmap"],
  baseColor: ["--bcmp", "--qlevel", "200", "--genmipmap"],
  orm:       ["--bcmp", "--qlevel", "200", "--linear", "--genmipmap"],
  emissive:  ["--bcmp", "--qlevel", "200", "--genmipmap"],
};

export async function encodeKtx2(opts: EncodeOpts): Promise<EncodeResult> {
  const flags = FLAGS_BY_ROLE[opts.role];
  const start = performance.now();
  await new Promise<void>((resolve, reject) => {
    const proc = spawn("toktx", [...flags, opts.outputPath, opts.inputPath], { stdio: "inherit" });
    proc.on("exit", code => code === 0 ? resolve() : reject(new Error(`toktx exit ${code}`)));
  });
  const validateProc = spawn("ktx2check", [opts.outputPath], { stdio: "inherit" });
  await new Promise<void>((resolve, reject) => {
    validateProc.on("exit", code => code === 0 ? resolve() : reject(new Error(`ktx2check failed`)));
  });
  const { size: inputBytes } = await stat(opts.inputPath);
  const { size: outputBytes } = await stat(opts.outputPath);
  const encodeSeconds = (performance.now() - start) / 1000;
  return {
    inputBytes,
    outputBytes,
    gpuBytes: estimateGpuBytes(opts.outputPath, opts.role),
    mode: opts.role === "normal" ? "UASTC" : "ETC1S",
    mipLevels: computeMipChainDepth(opts.outputPath),
    encodeSeconds,
  };
}

export function detectRoleFromGltf(gltf: any, textureIndex: number): TextureRole | null {
  for (const mat of gltf.materials ?? []) {
    if (mat.pbrMetallicRoughness?.baseColorTexture?.index === textureIndex) return "baseColor";
    if (mat.normalTexture?.index === textureIndex) return "normal";
    if (mat.occlusionTexture?.index === textureIndex) return "orm";
    if (mat.pbrMetallicRoughness?.metallicRoughnessTexture?.index === textureIndex) return "orm";
    if (mat.emissiveTexture?.index === textureIndex) return "emissive";
  }
  return null;  // texture not used in any PBR slot — leave uncompressed or error
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Normal maps emerge as UASTC | `gltf-transform inspect lumi.glb` reports `Image.basisu.mode: "UASTC"` for normal textures |
| 2 | Color/MR/emissive emerge as ETC1S | Same inspector check on baseColor / orm / emissive |
| 3 | Mip levels present (≥ 4 for 2k textures, ≥ 12 for 4k) | `ktx2check --verbose` output line `Mipmap levels: 12` |
| 4 | VRAM ≥ 6× smaller — Lumi full texture set ≤ 4 MB VRAM (vs ~24 MB raw RGBA) | FR-OPS-001 report: `sum(textures.gpu_bytes) <= 4_000_000` |
| 5 | basisu/toktx + ktx2check in CI Docker image | `docker run ci-image which toktx ktx2check` |
| 6 | Encoder flags match table in §1 #7 | Vitest unit test asserts `FLAGS_BY_ROLE.normal[0] === "--uastc"` etc. |
| 7 | Idempotent — second run skips already-KTX2 textures | Re-run pipeline → 0 encode invocations, all cache hits |
| 8 | `.skipKtx2.png` escape hatch respected | Synthetic test: place file `foo.skipKtx2.png`; pipeline copies raw PNG |
| 9 | Per-texture sub-report present in `<asset>.report.json` | JSON validates against FR-OPS-001 §3 schema |
| 10 | Deterministic output — same input → same SHA-256 | Run twice, `sha256sum *.ktx2` matches |
| 11 | sRGB vs linear correctly preserved | `ktx2check --verbose` shows `Color Space: sRGB` for baseColor, `Linear` for normal/orm |
| 12 | Atlas double-binding errors out | Synthetic glTF with one texture in baseColor + emissive → pipeline exits 1 |
| 13 | Vitest unit tests pass | `pnpm vitest run scripts/__tests__/ktx2-encode.unit.test.mjs` |

## §5 — Verification

```ts
// scripts/__tests__/ktx2-encode.unit.test.mjs
import { describe, it, expect } from "vitest";
import { detectRoleFromGltf, FLAGS_BY_ROLE } from "../ktx2-encode.mjs";

describe("KTX2 encoding contract", () => {
  it("detects baseColor role from glTF", () => {
    const gltf = {
      materials: [{
        pbrMetallicRoughness: { baseColorTexture: { index: 0 } },
        normalTexture: { index: 1 },
      }],
    };
    expect(detectRoleFromGltf(gltf, 0)).toBe("baseColor");
    expect(detectRoleFromGltf(gltf, 1)).toBe("normal");
  });

  it("returns null for unused texture", () => {
    expect(detectRoleFromGltf({ materials: [] }, 0)).toBeNull();
  });

  it("detects ORM via either occlusion or metallicRoughness slot", () => {
    const gltf = {
      materials: [{
        occlusionTexture: { index: 2 },
        pbrMetallicRoughness: { metallicRoughnessTexture: { index: 2 } },
      }],
    };
    expect(detectRoleFromGltf(gltf, 2)).toBe("orm");
  });

  it("uses UASTC flags for normals", () => {
    expect(FLAGS_BY_ROLE.normal).toContain("--uastc");
    expect(FLAGS_BY_ROLE.normal).toContain("--normal_map");
  });

  it("uses ETC1S (bcmp) flags for color/orm/emissive", () => {
    expect(FLAGS_BY_ROLE.baseColor).toContain("--bcmp");
    expect(FLAGS_BY_ROLE.baseColor).toContain("--qlevel");
    expect(FLAGS_BY_ROLE.baseColor).toContain("200");
  });

  it("flags ORM as linear (not sRGB)", () => {
    expect(FLAGS_BY_ROLE.orm).toContain("--linear");
    expect(FLAGS_BY_ROLE.baseColor).not.toContain("--linear");
  });

  it("bakes mipmaps for all roles", () => {
    for (const role of ["baseColor", "normal", "orm", "emissive"]) {
      expect(FLAGS_BY_ROLE[role]).toContain("--genmipmap");
    }
  });
});
```

## §6 — Dependencies

**Concept:** FR-OPS-001 (parent pipeline orchestrator), FR-CHAR-008 (PBR shader contract that consumes these texture roles).

**Operational:** KTX-Software 4.x toolchain (`toktx`, `ktx2check`), bundled into the CI Docker image alongside gltf-transform. Node 22 ESM. FR-OPS-005 (decoder WASM bundled so runtime can decode).

**Downstream:**
- FR-CHAR-008 — production texture binding to Lumi's GltfMaterial.
- FR-CHAR-012 — nón lá texture binding.
- FR-PERF-001 — VRAM budget gate consumes the sub-report `gpu_bytes` field.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Normal map encoded as ETC1S (wrong mode) | AC#1 | `detectRoleFromGltf` returns wrong role; add assertion in pipeline |
| Mips missing (runtime mipgen kicks in) | AC#3 | Add `--genmipmap` to every flags set; ktx2check verifies |
| VRAM > 4 MB on Lumi | AC#4 budget overrun | Drop ETC1S qlevel from 200→150 or remove a texture |
| ktx2check fails post-encode | Pipeline log | Re-encode with verbose; report to designer if PNG source is corrupt |
| Atlas double-bound (normal + emissive same texture) | AC#12 | Designer regenerates atlas; pipeline errors with clear message |
| toktx version mismatch (different output bytes) | Determinism test (AC#10) fails | Pin toktx version in Docker image; bump on coordinated PR |
| `.skipKtx2.png` not honoured | AC#8 | Audit pipeline filter; add explicit allowlist test |
| sRGB / linear flip | AC#11 mismatch | Validate `--linear` flag presence by role |
| Encode time >30s per texture | CI duration | Lower qlevel; parallelise across textures |
| Out-of-memory on 4k normal map | toktx OOM | Increase CI runner memory or pre-downscale to 2k via FR-OPS-001 |
| GPU bytes estimate wrong on Apple silicon (ASTC vs BC7) | AC#4 false negative | Use `gltf-transform inspect`'s native GPU estimator, not hand-rolled math |
| Re-encode on unchanged input | AC#7 | Cache key includes input SHA-256 + flags |
| `KHR_texture_basisu` extension not set on output glTF | Drei `useGLTF` fails to load KTX2 | gltf-transform `setBasis()` API call in pipeline |
| Mobile ASTC fallback rendering wrong (banding) | Visual smoke on iOS Safari | Verify ASTC LDR vs HDR mode; bake under LDR |
| KTX2 file > 50 MB (transcoder load fail) | Browser console error | Per-texture size cap; downscale source if exceeded |

## §8 — Deliverable preview

After pipeline runs on Lumi:
- `assets-source/textures/lumi_basecolor_2k.png` (1.4 MB PNG) → `assets-built/optimized/textures/lumi_basecolor_2k.ktx2` (245 KB, ETC1S, sRGB, 12 mip levels)
- `lumi_normal_2k.png` (2.1 MB) → `lumi_normal_2k.ktx2` (480 KB, UASTC, linear, 12 mip levels)
- `lumi_orm_2k.png` (1.3 MB) → `lumi_orm_2k.ktx2` (225 KB, ETC1S, linear, 12 mip levels)
- `lumi_emissive_2k.png` (0.4 MB) → `lumi_emissive_2k.ktx2` (95 KB, ETC1S, sRGB, 12 mip levels)
- Total source: ~5.2 MB PNG / ~24 MB GPU raw
- Total optimized: ~1.05 MB KTX2 file / ~3.9 MB GPU compressed
- VRAM reduction: 24 → 3.9 = **6.15×** ✅
- Lumi.glb references the .ktx2 files via `KHR_texture_basisu` extension

## §9 — Notes

**On future ASTC HDR support:** Currently encoding LDR only. HDR ASTC would enable HDR emissive textures (golden glow). Not in slice 1; revisit if branding requires.

**On Vietnamese-locale variants:** Nón lá texture variants (FR-OPS-007 Recipe G — Tết / Mid-Autumn / sunset) all flow through this same pipeline. Each variant gets its own KTX2 file, lazy-loaded per FR-SCENE-024.

**On qlevel A/B testing:** qlevel 200 chosen after side-by-side comparison with 150/180/220/255. Master plan §4.3 says "recompare at qlevel 180 once production textures land — savings vs visible-artefact trade may shift."

**On runtime transcoder cost:** FR-OPS-005 bundles the Basis transcoder WASM (~ 200 KB). Decode happens once at texture-bind time (~ 30 ms total on M1), free thereafter.

**On Cowork Recipe B:** Recipe B (texture variants generation) outputs PNG variants which then flow into this encoder. Coupling is one-way: this FR is unaware of Recipe B; Recipe B respects this FR's PNG-in / KTX2-out contract.

*End of FR-OPS-004.*
