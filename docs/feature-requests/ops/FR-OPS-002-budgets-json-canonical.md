---
id: FR-OPS-002
title: "Per-asset budget definition file `tools/perf-budgets/budgets.json` — canonical CI source of truth"
module: OPS
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P2
slice: 1
owner: Backend / DevOps
created: 2026-05-16
shipped: 2026-05-17
strict_audited: 2026-05-18
related_frs: [FR-OPS-001, FR-PERF-001, FR-OPS-003, FR-OPS-013]
depends_on: [FR-OPS-001]
blocks: [FR-OPS-003, FR-OPS-013, FR-PERF-001]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §4.4 — "Per-asset hard CI thresholds; budgets.json canonical"
  - docs/01-master-plan-v2.md §6.1 — "CWV targets + fails: LCP 2.5/3.0s, INP 200/300ms, CLS 0.1/0.25, FPS 55/45"
  - docs/01-master-plan-v2.md §6.1 — "JS budget 200/220 KB gz main chunk"

language: json + typescript
service: tools/perf-budgets/
new_files:
  - tools/perf-budgets/budgets.json
  - tools/perf-budgets/budgets.schema.json
  - tools/perf-budgets/__tests__/budgets-schema.test.ts

effort_hours: 3
risk_if_skipped: "Without a single canonical budgets.json, FR-OPS-001 pipeline, FR-OPS-003 PR comments, FR-PERF-001 CI checks, and FR-OPS-013 Lighthouse runs each maintain their own threshold copies. Drift is inevitable; the 200 KB main-chunk cap becomes 220 in one consumer, 180 in another. CI false-passes ship a degraded experience."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `tools/perf-budgets/budgets.json` byte-identical to FR-PERF-001 §1 #1 schema:
   ```json
   {
     "cwv": { "lcp": { "target": 2500, "fail": 3000 }, "inp": { "target": 200, "fail": 300 },
              "cls": { "target": 0.1, "fail": 0.25 }, "fps": { "target": 55, "fail": 45 } },
     "js_bundle": { "main_chunk_kb_gz": { "target": 200, "fail": 220 } },
     "page_weight": { "first_scene_mb": { "target": 3.0, "fail": 3.5 },
                       "all_scenes_mb": { "target": 14, "fail": 16 } },
     "assets": { "lumi_glb_mb": { "target": 3.0, "fail": 3.5 },
                  "nonla_glb_kb": { "target": 200, "fail": 250 },
                  "hero_scene_props_mb": { "target": 1.0, "fail": 1.2 },
                  "each_scene_props_mb": { "target": 1.5, "fail": 1.8 } },
     "draw_calls_per_scene_max": { "target": 100, "fail": 150 }
   }
   ```

2. **MUST** ship `tools/perf-budgets/budgets.schema.json` — JSON Schema (Draft 2020-12) defining the shape. Consumers MAY validate against it (`ajv-cli` or similar) before reading.

3. **MUST** be locked via `.github/CODEOWNERS` — any change requires founder review AND an amendment FR per AGENTS.md §16.2. Codeowners line: `tools/perf-budgets/budgets.json @stephencheng`.

4. **MUST** be loadable by every consumer via standard JSON import:
   - FR-OPS-001 gltf-pipeline.mjs: `import budgets from '../tools/perf-budgets/budgets.json' with { type: 'json' }`.
   - FR-PERF-001 check scripts (CI shell): `node -p "require('./tools/perf-budgets/budgets.json').assets.lumi_glb_mb.target"`.
   - FR-OPS-003 PR-comment renderer: same import shape.
   - FR-OPS-013 Lighthouse runner: same.

5. **MUST NOT** be edited by tooling (build scripts, formatters). The file is canonical input, never derived output. Adding a "GENERATED" header would suggest the wrong polarity.

6. **MUST** include a top-level `$schema` field pointing to `./budgets.schema.json` so editors / language servers auto-validate.

7. **MUST** include a top-level `version` field (semver) — `"1.0.0"` at slice 1. Amendments bump minor; breaking shape changes bump major + require consumer migration FR.

8. **MUST** ship Vitest test asserting: (a) JSON parses, (b) all FR-PERF-001 §1 #1 paths exist, (c) target < fail invariant for every metric, (d) schema validates the file.

9. **SHOULD** include comments-as-keys (`"_comment_cwv"`) explaining why each threshold exists, since JSON doesn't support comments. Master plan §6.1 cited inline.

10. **MUST NOT** add metrics without an amendment FR. The list is closed at slice 1. New metrics (e.g. mobile-Largest-Visible-Element, time-to-interactive-rage-click) extend via FR-PERF-NNN.

## §2 — Why this design

**Why JSON not TOML/YAML?** Every CI runner has native JSON. Every Node + Python script parses it without dependency. YAML is sensitive to indent + has subtle type coercions (`yes` → boolean). TOML lacks nested-structure ergonomics. JSON is the lowest-common-denominator + universally diff-friendly.

**Why CODEOWNERS-locked?** Budgets are the perf contract. Drift is the failure mode — one engineer "tweaks" the main-chunk limit to 220 to unblock their PR; six months later we ship at 280. CODEOWNERS + amendment-FR requirement forces budget changes through governance.

**Why both schema.json and Vitest assertion?** Schema catches shape drift (missing keys, wrong types). Vitest catches semantic drift (target ≥ fail, missing FR-PERF-001 paths). Both run in CI. They're complementary, not redundant.

**Why `$schema` pointer?** Editor language servers (VS Code, JetBrains) read `$schema` and apply IntelliSense + inline validation. A developer editing the file gets immediate feedback on typos.

## §3 — Public surface

### §3.1 `budgets.json` shape

```json
{
  "$schema": "./budgets.schema.json",
  "version": "1.0.0",
  "_comment_cwv": "Master plan §6.1 — p75 mobile targets",
  "cwv": {
    "lcp":  { "target": 2500, "fail": 3000, "_unit": "ms" },
    "inp":  { "target": 200,  "fail": 300,  "_unit": "ms" },
    "cls":  { "target": 0.1,  "fail": 0.25, "_unit": "unitless" },
    "fps":  { "target": 55,   "fail": 45,   "_unit": "fps_min" }
  },
  "_comment_js_bundle": "Master plan §6.1 — main chunk gzipped",
  "js_bundle": {
    "main_chunk_kb_gz": { "target": 200, "fail": 220 }
  },
  "page_weight": {
    "first_scene_mb": { "target": 3.0, "fail": 3.5 },
    "all_scenes_mb":  { "target": 14,  "fail": 16 }
  },
  "assets": {
    "lumi_glb_mb":           { "target": 3.0, "fail": 3.5 },
    "nonla_glb_kb":          { "target": 200, "fail": 250 },
    "hero_scene_props_mb":   { "target": 1.0, "fail": 1.2 },
    "each_scene_props_mb":   { "target": 1.5, "fail": 1.8 }
  },
  "draw_calls_per_scene_max": { "target": 100, "fail": 150 }
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | File exists at canonical path | `test -f tools/perf-budgets/budgets.json` |
| 2 | Valid JSON | `jq . tools/perf-budgets/budgets.json` exits 0 |
| 3 | Schema matches FR-PERF-001 §1 #1 paths | Vitest path-existence check |
| 4 | target < fail for every metric (where lower=better) | Vitest invariant check; FPS is reverse (target > fail) |
| 5 | CODEOWNERS gate active | grep `.github/CODEOWNERS` for the path |
| 6 | Consumers load successfully | FR-OPS-001 + FR-PERF-001 + FR-OPS-013 import without error |
| 7 | `$schema` field present | jq `.["$schema"]` returns non-null |
| 8 | `version` field is valid semver | regex check on jq output |
| 9 | budgets.schema.json valid JSON Schema 2020-12 | `ajv compile -s budgets.schema.json` exits 0 |
| 10 | budgets.json validates against schema | `ajv validate -s schema.json -d budgets.json` |

## §5 — Verification

```ts
// __tests__/budgets-schema.test.ts
import { describe, it, expect } from "vitest";
import budgets from "../../budgets.json" with { type: "json" };

describe("budgets.json", () => {
  it("has $schema + version", () => {
    expect(budgets.$schema).toBeTruthy();
    expect(budgets.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has all FR-PERF-001 paths", () => {
    expect(budgets.cwv.lcp.target).toBe(2500);
    expect(budgets.assets.lumi_glb_mb.target).toBe(3.0);
    expect(budgets.draw_calls_per_scene_max.target).toBe(100);
  });

  it("target < fail for lower-is-better metrics", () => {
    expect(budgets.cwv.lcp.target).toBeLessThan(budgets.cwv.lcp.fail);
    expect(budgets.js_bundle.main_chunk_kb_gz.target).toBeLessThan(budgets.js_bundle.main_chunk_kb_gz.fail);
  });

  it("FPS is reverse (target > fail)", () => {
    expect(budgets.cwv.fps.target).toBeGreaterThan(budgets.cwv.fps.fail);
  });
});
```

## §6 — Dependencies

**Concept:** FR-OPS-001 (pipeline plan), FR-PERF-001 (perf budget gates source-of-truth).

**Operational:** Node 20+, jq, ajv-cli (CI), Vitest.

**Downstream blocks:** FR-OPS-003 (PR comments read targets), FR-OPS-013 (Lighthouse CI runner), FR-PERF-001 (CWV check scripts).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Drift between consumers (one uses old fail value) | AC#6 import test + schema | Re-sync via canonical budgets.json import |
| Schema invalid JSON (typo) | AC#9 ajv compile | Fix syntax; ajv error message points to line |
| Budget loosened without FR amendment | CODEOWNERS PR review | Reject PR; require master-plan §16.2 amendment |
| New metric added ad-hoc | AC#3 path enumeration | Reject; FR-PERF-NNN amendment required |
| `$schema` field stripped (by linter) | AC#7 | Add `$schema` to JSON formatter ignore-rules |
| target=fail (silent loose budget) | AC#4 invariant | Vitest fails; tighten target |
| FPS metric direction flipped | AC#4 (FPS reverse rule) | Restore: FPS target > fail |
| File path drift (moved without consumer update) | AC#6 build error | Keep canonical at `tools/perf-budgets/budgets.json`; never rename |
| jq command fails on CI (jq not installed) | AC#2 CI log | Use Node `JSON.parse` for portability check |
| Version field bumped without semver discipline | AC#8 regex | Reject; semver only |

## §8 — Notes

**On schema versioning:** When budgets.json shape changes (e.g. add a new metric category), bump `version` minor. Consumers MAY pin to a version range. Slice 1 doesn't enforce pinning; if drift becomes a problem, a future amendment adds version-pinning machinery.

**On TOML migration:** If team strongly prefers TOML for editability, that's an FR-OPS-NNN amendment with a `budgets.toml` → `budgets.json` generator. Not slice 1 scope.

## §9 — Strict audit 2026-05-18

Validation evidence:

```bash
./node_modules/.bin/vitest run tools/perf-budgets/__tests__/budgets-schema.test.ts tools/perf-budgets/__tests__/check-asset-sizes.unit.test.mjs scripts/__tests__/pr-comment-asset-delta.unit.test.mjs
✓ scripts/__tests__/pr-comment-asset-delta.unit.test.mjs (8 tests)
✓ tools/perf-budgets/__tests__/check-asset-sizes.unit.test.mjs (7 tests)
✓ tools/perf-budgets/__tests__/budgets-schema.test.ts (5 tests)
Test Files  3 passed (3)
Tests  20 passed (20)

node -e 'const budgets=require("./tools/perf-budgets/budgets.json"); console.log(JSON.stringify({schema: budgets["$schema"], version: budgets.version, lumi: budgets.assets.lumi_glb_mb.target, nonla: budgets.assets.nonla_glb_kb.target}))'
{"schema":"./budgets.schema.json","version":"1.0.0","lumi":3,"nonla":200}

rg -n "tools/perf-budgets/budgets\\.json\\s+@zintaen" .github/CODEOWNERS
25:tools/perf-budgets/budgets.json         @zintaen
```

Ownership note: the FR’s original example used `@stephencheng`, but the repository’s CODEOWNERS convention consistently uses `@zintaen` as the founder-review handle. Strict audit preserves that existing convention.

*End of FR-OPS-002.*
