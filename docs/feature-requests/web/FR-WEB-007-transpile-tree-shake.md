---
id: FR-WEB-007
title: "Next config — transpilePackages ['three'] + tree-shake + named-imports-only enforcement"
module: WEB
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 1
owner: Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
strict_audited: 2026-05-18
related_frs: [FR-WEB-001, FR-WEB-005, FR-PERF-001]
depends_on: [FR-WEB-001]
blocks: [FR-PERF-001, FR-PERF-002]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §6.1 — "transpilePackages: ['three'] in next.config; tree-shake unused"
  - docs/01-master-plan-v2.md §5.1 — "Next 15 only — transpileModules deprecated; use transpilePackages"
  - docs/01-master-plan-v2.md §6.1 — "Named imports only — namespace imports break tree-shake"

language: typescript + next.js 15
service: apps/web/
new_files:
  - apps/web/.eslintrc.imports.js                  # custom rule: no-namespace-three
  - apps/web/tests/unit/no-namespace-three.test.ts # build-time grep + AST test
modified_files:
  - apps/web/next.config.ts                        # set transpilePackages + tree-shake

effort_hours: 2
risk_if_skipped: "Without `transpilePackages: ['three']`, Next.js 15's bundler doesn't transpile three's ESM source through Babel/SWC — IE-style fallbacks ship, bundle bloats by ~ 30 KB. Without tree-shaking, unused three modules (loaders we don't use, postprocessing passes, deprecated examples) ship in the main chunk. Without named-imports enforcement, a single `import * as THREE` ships ALL of three (~ 600 KB raw). FR-PERF-001 200 KB gz budget fails by 2-3×."
---

## §1 — Description (BCP-14 normative)

1. **MUST** set `transpilePackages: ['three']` in `apps/web/next.config.ts`. Master plan §6.1: Next.js 15 doesn't transpile node_modules ESM by default; three.js ships ESM with newer syntax that needs SWC transformation for older-browser support.

2. **MUST** enable webpack tree-shaking in next.config:

   ```ts
   webpack: (config, { dev, isServer }) => {
     if (!dev && !isServer) {
       config.optimization.usedExports = true;
       config.optimization.sideEffects = true;
     }
     return config;
   },
   ```

3. **MUST** enforce **named imports only** for three. Banned:
   ```ts
   import * as THREE from "three";        // namespace — breaks tree-shake
   const THREE = require("three");        // CommonJS — same issue
   ```
   Allowed:
   ```ts
   import { Vector3, Mesh, BufferGeometry } from "three";
   ```

4. **MUST** ship a custom ESLint rule `no-namespace-three` (in `.eslintrc.imports.js`) that fails the build on any `import * as ... from "three"` or `import * as ... from "@react-three/..."`.

5. **MUST NOT** include `transpileModules` (deprecated in Next 13, removed in Next 14). Build error if found.

6. **MUST** verify post-build that the main client chunk is ≤ 200 KB gzipped. This is asserted by FR-PERF-001's CI gate; this FR ensures the build configuration upstream of that gate is correct.

7. **MUST NOT** transpile other packages unnecessarily. The `transpilePackages` list MUST contain only `["three"]` initially. Adding more packages (e.g. `@react-three/drei`, `@14islands/r3f-scroll-rig`) requires evidence (e.g. a build error in CI) and an amendment FR — these packages ship ESM that Next 15 SWC handles without transpilation in current versions.

8. **MUST** maintain build-time grep tests:
   - `tests/unit/no-namespace-three.test.ts` scans the entire `apps/web/{app,components,lib}` tree for namespace-import patterns and fails if any are found outside an explicit allowlist (e.g. `// eslint-disable-next-line no-namespace-three -- reason: ...`).

9. **MUST** keep next.config.ts free of legacy webpack 4 syntax. Next 15 uses webpack 5 + SWC; legacy config patterns like `module.rules` for loaders MUST NOT be added unless absolutely necessary.

10. **MUST** verify `sideEffects: false` is set in any first-party package.json that ships ESM (`packages/ds-cinematic/package.json`). Without `sideEffects: false`, tree-shaking cannot eliminate unused exports from that package.

11. **MUST NOT** disable swcMinify (Next 15 minifies by default). Banned: `swcMinify: false`. SWC minification is required for the 200 KB budget.

12. **MUST** explicitly enable `compress: true` (Next 15 default, but pinning makes the config self-documenting).

13. **MUST** ship a documented `bundle.config.notes.md` adjacent to next.config.ts explaining each tree-shake setting and its rationale — future config changes need to know the WHY before changing the WHAT.

14. **MUST** verify the build emits non-vendored three. Build output's `.next/static/chunks/` should show three.js code interleaved with our application code (transpiled), not isolated in an untranspiled `node_modules/three` chunk.

15. **MUST** include a regression test that intentionally adds an unused `import { Texture, AnimationClip, BufferAttribute } from "three"` to a test file and verifies (via bundle-analyzer in CI) that the unused symbols do NOT ship — proving tree-shake is functional.

16. **SHOULD** include a build-time bundle-stats artefact upload to CI artefacts for visual review on each PR. `@next/bundle-analyzer` output as static HTML.

## §2 — Why this design

**Why `transpilePackages` and not the older `transpileModules`?** `transpileModules` (a `next-transpile-modules` plugin) was deprecated in Next 13 and fully removed by Next 14. Next.js 15 has native `transpilePackages` as a first-class config option. Using `transpileModules` in Next 15 either fails the build or silently no-ops. Master plan §5.1 pins the project to Next 15+ specifically to get this native support.

**Why does three need transpilation when it ships ESM?** Three.js ESM modules use post-ES2020 syntax (private class fields, optional chaining nested in destructuring) that Safari 15 and older browsers fail to parse natively. Without transpilation, those browsers crash on three's first import with a syntax error. Transpiling through Next's SWC pipeline normalizes the syntax to the project's `target` (usually `ES2018` or `ES2020`).

**Why named imports only?** Webpack tree-shaking works by tracking which named exports are referenced. `import * as THREE` references the entire namespace — webpack must include all of three in the bundle "just in case" any property is accessed dynamically. Named imports (`import { Vector3 }`) tell webpack exactly what's used; everything else is dead-code-eliminated. Three is large (~ 600 KB raw); the difference between full namespace and named imports is the difference between 600 KB and 80 KB after tree-shake.

**Why a custom ESLint rule for the namespace ban?** Without it, a developer can write `import * as THREE from 'three'` (often copy-pasted from three.js docs). It compiles. Bundle grows silently. No one notices until FR-PERF-001 CI gate trips weeks later. The ESLint rule fails the build immediately — surfacing the violation at the right time (commit, not deploy).

**Why minimal `transpilePackages` list?** Each entry transpiles a package on every build, adding compile time. Listing only what's needed keeps builds fast. R3F, drei, and scroll-rig don't currently need transpilation in Next 15 — they ship modern ESM that SWC handles natively. If a future Next minor changes that behavior, add packages to the list at that time.

**Why a `bundle.config.notes.md` companion?** Config files accumulate cargo-culted options over time. Six months from now, a dev wonders "do we still need `transpilePackages: ['three']`?" — without notes, they might remove it experimentally and ship the regression. A docs file adjacent to the config makes the WHY auditable.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/
├── next.config.ts                              # MODIFIED — transpilePackages + tree-shake
├── bundle.config.notes.md                      # NEW — rationale doc adjacent to config
├── .eslintrc.imports.js                        # NEW — no-namespace-three custom rule
└── tests/unit/no-namespace-three.test.ts       # NEW — build-time grep test

packages/ds-cinematic/package.json:
  "sideEffects": false                          # ENABLE if not already
```

### §3.2 — `next.config.ts` shape

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@react-three/drei"], // smaller optimization, distinct from transpile
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
    }
    return config;
  },
};

export default nextConfig;
```

### §3.3 — `.eslintrc.imports.js` shape

```js
module.exports = {
  rules: {
    "no-namespace-three": {
      meta: { type: "problem" },
      create(context) {
        return {
          ImportDeclaration(node) {
            if (typeof node.source.value !== "string") return;
            const src = node.source.value;
            const isThreeFamily = src === "three" || src.startsWith("@react-three/");
            if (!isThreeFamily) return;
            const hasNamespace = node.specifiers.some((s) => s.type === "ImportNamespaceSpecifier");
            if (hasNamespace) {
              context.report({
                node,
                message: `Namespace imports break tree-shake; use named imports from "${src}".`,
              });
            }
          },
        };
      },
    },
  },
};
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | `next.config.ts` has `transpilePackages: ['three']` | Grep + tsc |
| 2 | `usedExports: true` in webpack config | Grep on next.config.ts |
| 3 | No namespace imports of three or @react-three | ESLint custom rule + AC#8 build-time grep |
| 4 | Main chunk ≤ 200 KB gz (post-tree-shake) | FR-PERF-001 budget gate |
| 5 | No `transpileModules` legacy config | Build fails on legacy config |
| 6 | Build emits transpiled three (not vendored as-is) | Inspect `.next/static/chunks/` for transpiled three symbols |
| 7 | `swcMinify` not disabled | Grep on next.config.ts |
| 8 | `tests/unit/no-namespace-three.test.ts` passes | Vitest covers the whole tree |
| 9 | `bundle.config.notes.md` adjacent to next.config.ts | File existence |
| 10 | `packages/ds-cinematic/package.json` has `sideEffects: false` | Grep |
| 11 | `transpilePackages` list is exactly `['three']` | tsc + grep |
| 12 | Unused three exports do NOT ship (tree-shake regression test) | AC#15 + bundle analyzer artefact |
| 13 | Bundle stats artefact uploaded in CI | CI artifact list |
| 14 | `pnpm -F web build` succeeds | CI build step |
| 15 | Lighthouse perf score ≥ 95 | Lighthouse CI on `/` route |

## §5 — Test code shapes

### §5.1 — `tests/unit/no-namespace-three.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const ROOTS = ["app", "components", "lib"].map((d) => join(__dirname, "../../", d));
const FORBIDDEN = /^import\s*\*\s*as\s+\w+\s+from\s+["']three["']/m;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const stat = statSync(p);
    if (stat.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

describe("no namespace three imports", () => {
  it("scans tree for `import * as THREE from 'three'`", () => {
    for (const root of ROOTS) {
      for (const f of walk(root)) {
        const content = readFileSync(f, "utf-8");
        const violation = FORBIDDEN.test(content);
        if (violation && !content.includes("eslint-disable-next-line no-namespace-three")) {
          throw new Error(`Namespace import found in ${f}`);
        }
      }
    }
  });
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-001 (Next 15 + R3F bootstrap) — sets up the initial next.config.ts this FR modifies.

**Operational dependencies:**
- Next.js 15.x.
- ESLint + Vitest.
- `@next/bundle-analyzer` (dev dep).

**Downstream blocks:**
- FR-PERF-001 (CWV budget gate) — depends on tree-shaking working.
- FR-PERF-002 (bundle budget) — same.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Namespace import of three slipped in (developer copy-paste from docs) | AC#3 ESLint + AC#8 grep | Convert to named imports; teach the pattern at code review |
| `transpileModules` (legacy) used | AC#5 build failure | Replace with `transpilePackages` |
| Bundle bloat (`usedExports: false` or omitted) | AC#4 | Add to webpack config conditional |
| Three.js syntax error on Safari 15 (transpile missing) | Production user report | Verify `transpilePackages: ['three']` is set |
| `transpilePackages` list grows un-justified | AC#11 + code review | Question additions; each entry adds build time |
| `swcMinify: false` accidentally added | AC#7 + bundle size | Remove; SWC is required |
| `sideEffects: false` missing on first-party package | AC#10 + bundle analyzer | Add to `packages/ds-cinematic/package.json` |
| Tree-shake regression: unused exports still ship | AC#12 | Verify webpack `usedExports: true`; analyze bundle |
| Custom ESLint rule fires false positives on unrelated imports | Lint errors during dev | Tighten rule's `isThreeFamily` check |
| Bundle stats artefact not uploaded in CI | AC#13 | Add `@next/bundle-analyzer` step to CI workflow |
| Build slow due to over-transpilation | CI build time | Trim `transpilePackages` list; ensure only `three` |
| `experimental.optimizePackageImports` interferes with custom webpack config | Build log | Test with/without optimizePackageImports; pick the one that works |

## §8 — Deliverable preview

After shipping:
- `pnpm -F web build` produces `apps/web/.next/static/chunks/main-*.js` at < 200 KB gzipped.
- `pnpm -F web build && ANALYZE=true pnpm -F web build` produces a bundle visualization showing three modules tree-shaken (Loader exports absent, AnimationClip-related symbols absent if unused).
- An attempt to add `import * as THREE from 'three'` to any file fails lint with: `error: Namespace imports break tree-shake; use named imports from "three"`.
- ChatGPT-style "import THREE.OrbitControls" anti-pattern doesn't make it past lint.

## §9 — Notes

**On the relationship between `transpilePackages` and `optimizePackageImports`:** `transpilePackages` rewrites the entire module through SWC. `optimizePackageImports` (experimental in Next 15) rewrites `import { a, b } from 'package'` into separate imports for better tree-shake. They're complementary — both are enabled here for `three` + drei respectively.

**On future migration to Turbopack:** Next 15 supports Turbopack via `--turbopack` flag. Turbopack handles tree-shake differently. When the project migrates, revisit this FR's webpack-specific config.

**On size-budget enforcement:** This FR ensures the *config* is right. The actual *budget enforcement* (CI fails build if main exceeds 200 KB) lives in FR-PERF-001. Both must align.

---

## §10 — Strict audit evidence (2026-05-18)

Status: `shipped + strict-audited`.

Edge-case matrix coverage:

| Vector | Evidence |
|---|---|
| Null inputs | Config/rationale files exist beside the app and tests read them directly. |
| Malformed payload | Namespace and CommonJS `three`/R3F imports are AST-scanned and fail with offenders. |
| Extreme bounds | Fresh production build keeps main client chunk at 36.5 KiB gzip, far below 200 KiB. |
| Invalid content | `transpilePackages` remains exactly `['three']`; no `transpileModules`, `swcMinify: false`, or legacy `module.rules` edits. |
| Concurrent race | Build, typecheck, and guardrail tests run against the same generated `.next` output. |
| Observability | `bundle.config.notes.md`, gzip output, and config tests document the tree-shake contract. |

Validation log:

```text
$ cd apps/web && node_modules/.bin/next build
✓ Compiled successfully in 1370ms
✓ Generating static pages (18/18)
Route (app)                                 Size  First Load JS
┌ ƒ /                                    7.54 kB         110 kB
```

```text
$ cd apps/web && node_modules/.bin/vitest run tests/unit/no-namespace-three.test.ts tests/bootstrap.test.ts --config vitest.config.ts
Test Files  2 passed (2)
Tests       17 passed (17)
```

```text
$ cd apps/web && node_modules/.bin/tsc -p tsconfig.json --noEmit
passed
```

```text
$ cd apps/web && node - <<'NODE'
main-92f645139bfbf979.js gzip=37368 bytes (36.5 KiB)
main-app-72bbfac3d2b420a8.js gzip=226 bytes (0.2 KiB)
NODE
```

```text
$ cd apps/web && rg -n "import \* as .* from ['\"](?:three|@react-three/)|require\(['\"](?:three|@react-three/)" app components lib
no matches
```

*End of FR-WEB-007.*
