---
id: FR-PERF-006
title: "ESLint no-alloc-in-useFrame — forbid new Vector3/Quaternion inside useFrame; require useMemo"
module: PERF
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: R3F Architect + DevOps
created: 2026-05-16
related_frs: [FR-WEB-004, FR-OPS-010, FR-PERF-005, FR-PERF-007]
depends_on: [FR-WEB-004]
blocks: []
language: typescript + eslint custom rule
service: eslint-rules/ + apps/web/.eslintrc.js
new_files:
  - eslint-rules/no-alloc-in-use-frame.ts
  - eslint-rules/__tests__/no-alloc-in-use-frame.test.ts
  - eslint-rules/index.ts
  - apps/web/.eslintrc.js  (extend with custom plugin)

source_pages:
  - docs/01-master-plan-v2.md §6.2 — "No allocations in useFrame loop"
  - Three.js performance documentation
  - ESLint custom rule API

effort_hours: 4
risk_if_skipped: "useFrame runs 60x/second. Each `new Vector3()` allocates ~40 bytes; 60×40 = 2.4 KB/sec just for one Vector3. Multiply by all the useFrame hooks across scenes → 50-100 KB/sec garbage → frequent GC pauses → INP regressions. Manual review misses this; lint enforces."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship an ESLint rule `no-alloc-in-use-frame` that flags constructor calls inside `useFrame` callbacks:
   - `new Vector2()`, `new Vector3()`, `new Vector4()`
   - `new Quaternion()`
   - `new Matrix3()`, `new Matrix4()`
   - `new Color()`
   - `new Euler()`
   - `new Box3()`, `new Sphere()`
2. **MUST** flag missing `useMemo` for Three.js value objects that are created in render but used inside useFrame.
3. **MUST** be a required check in CI (FR-OPS-010 eslint workflow).
4. **MUST** be auto-fixable (suggest `useMemo(() => new Vector3(), [])`).
5. **MUST** include a clear error message explaining why ("Per-frame allocations cause GC pressure; lift to module-level constant or useMemo").
6. **MUST NOT** false-positive on:
   - Test files (`**/__tests__/**`, `*.test.{ts,tsx}`)
   - Storybook files (`*.stories.{ts,tsx}`)
   - One-time setup code (outside `useFrame`)
7. **MUST** be tested via ESLint RuleTester with valid + invalid code samples.
8. **MUST** include rule documentation at `eslint-rules/docs/no-alloc-in-use-frame.md`.

## §2 — Why this design

**Why useFrame specifically?** It's the R3F render-loop callback. Allocations here happen 60x/second. Outside useFrame, allocations are typically one-time (component mount).

**Why custom rule (not generic no-new)?** Generic rules can't tell which `new` is in a hot path. Custom rule analyzes call site (inside useFrame callback or not).

**Why auto-fix?** Manual refactor is error-prone. Auto-fix prevents "I'll fix it later" → never.

**Why exclude tests?** Test code creates throwaway objects intentionally; no perf concern.

**Why CI required check?** Without enforcement, rule is suggestion. Required check + branch protection = "you cannot merge a regression."

## §3 — Public surface

```ts
// eslint-rules/no-alloc-in-use-frame.ts
import type { Rule } from "eslint";

const ALLOC_CLASSES = ["Vector2", "Vector3", "Vector4", "Quaternion", "Matrix3", "Matrix4", "Color", "Euler", "Box3", "Sphere"];

export const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Forbid Three.js allocations inside useFrame callback" },
    fixable: "code",
    messages: {
      alloc: "Avoid 'new {{name}}()' inside useFrame. Lift to module constant or wrap with useMemo. Per-frame allocations cause GC pressure.",
    },
    schema: [],
  },
  create(ctx) {
    let inUseFrame = false;
    return {
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "useFrame") {
          inUseFrame = true;
        }
      },
      "CallExpression:exit"(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "useFrame") {
          inUseFrame = false;
        }
      },
      NewExpression(node) {
        if (!inUseFrame) return;
        if (node.callee.type !== "Identifier") return;
        if (ALLOC_CLASSES.includes(node.callee.name)) {
          ctx.report({
            node,
            messageId: "alloc",
            data: { name: node.callee.name },
            fix(fixer) {
              const text = ctx.sourceCode.getText(node);
              return fixer.replaceText(node, `useMemo(() => ${text}, [])`);
            },
          });
        }
      },
    };
  },
};
```

```js
// apps/web/.eslintrc.js
module.exports = {
  plugins: ["cyberskill-rules"],
  rules: {
    "cyberskill-rules/no-alloc-in-use-frame": "error",
  },
  overrides: [
    {
      files: ["**/__tests__/**", "*.test.{ts,tsx}", "*.stories.{ts,tsx}"],
      rules: { "cyberskill-rules/no-alloc-in-use-frame": "off" },
    },
  ],
};
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | ESLint rule present in eslint-rules/ | ls |
| 2 | Rule active in apps/web/.eslintrc | grep |
| 3 | PR with `new Vector3()` inside useFrame fails CI | Synthetic PR |
| 4 | PR with same code outside useFrame passes | Synthetic PR |
| 5 | Auto-fix suggestion produces valid useMemo wrapping | RuleTester valid output |
| 6 | Test files excluded | Synthetic test file; rule doesn't fire |
| 7 | Rule docs present | File exists |
| 8 | ESLint RuleTester tests pass | `pnpm test eslint-rules/__tests__/no-alloc-in-use-frame.test.ts` |
| 9 | Error message includes "GC pressure" educational note | Verify message text |
| 10 | All ALLOC_CLASSES detected | RuleTester per class |

## §5 — Verification

```ts
// eslint-rules/__tests__/no-alloc-in-use-frame.test.ts
import { RuleTester } from "eslint";
import { rule } from "../no-alloc-in-use-frame";

const tester = new RuleTester({ parser: require.resolve("@typescript-eslint/parser") });

tester.run("no-alloc-in-use-frame", rule, {
  valid: [
    {
      code: `
        const v = new Vector3();  // module-level: OK
        function Mesh() {
          useFrame(() => { v.set(1, 2, 3); });
        }
      `,
    },
    {
      code: `
        function Mesh() {
          const v = useMemo(() => new Vector3(), []);
          useFrame(() => { v.set(1, 2, 3); });
        }
      `,
    },
    {
      filename: "x.test.ts",
      code: `useFrame(() => { const v = new Vector3(); });`,  // test file: excluded
    },
  ],
  invalid: [
    {
      code: `useFrame(() => { const v = new Vector3(); });`,
      errors: [{ messageId: "alloc", data: { name: "Vector3" } }],
      output: `useFrame(() => { const v = useMemo(() => new Vector3(), []); });`,
    },
    {
      code: `useFrame(() => { camera.position.copy(new Vector3(0, 0, 5)); });`,
      errors: [{ messageId: "alloc", data: { name: "Vector3" } }],
    },
    {
      code: `useFrame(() => { const q = new Quaternion(); });`,
      errors: [{ messageId: "alloc", data: { name: "Quaternion" } }],
    },
  ],
});
```

## §6 — Dependencies

**Concept:** FR-WEB-004 (Zustand stores often used in useFrame), FR-OPS-010 (eslint CI workflow consumer), FR-PERF-005 (dispose audit complements alloc audit).

**Operational:** ESLint 9+ flat config; custom plugin loading.

**Downstream:** FR-PERF-007 (INP budget benefits from alloc audit), all useFrame usage site-wide.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| False positive on test files | AC#6 | Override rules in eslint config |
| False positive on storybook | AC#6 | Override |
| Missed alloc via destructured useFrame | RuleTester edge case | Match aliased imports too |
| Auto-fix produces invalid JSX | RuleTester output check | Verify useMemo syntax |
| Rule plugin fails to load (config issue) | CI step fails | Document plugin loading clearly |
| ALLOC_CLASSES list incomplete | New Three.js classes | Document maintenance + bump |
| useFrame from non-R3F (custom hook) | Edge case | Match only @react-three/fiber import |
| Anonymous IIFE alloc inside useFrame | Edge case | Detect any NewExpression inside |
| Performance: rule slow on large files | CI duration | Use single-pass AST walk |
| Auto-fix conflict with prettier | Format diff | Run prettier after eslint --fix |
| Rule disabled per-line via eslint-disable | Workaround | Audit periodically |
| Rule documentation outdated | Manual review | Link from error message |

## §8 — Deliverable preview

Author writes:
```tsx
function Mesh() {
  useFrame(() => {
    const dir = new Vector3(1, 0, 0);  // ❌
    camera.position.lerp(dir, 0.1);
  });
}
```

ESLint output:
```
.../Mesh.tsx:3:18 error  Avoid 'new Vector3()' inside useFrame. Lift to module constant or wrap with useMemo. Per-frame allocations cause GC pressure.  cyberskill-rules/no-alloc-in-use-frame
```

`eslint --fix` produces:
```tsx
function Mesh() {
  useFrame(() => {
    const dir = useMemo(() => new Vector3(1, 0, 0), []);
    camera.position.lerp(dir, 0.1);
  });
}
```

Author hand-refactors to module constant:
```tsx
const DIR = new Vector3(1, 0, 0);
function Mesh() {
  useFrame(() => { camera.position.lerp(DIR, 0.1); });
}
```

## §9 — Notes

**On 'why not eslint-plugin-react-three/fiber?'** No existing plugin covers this rule. Custom is fastest path.

**On scoping to project:** Plugin lives in repo; not published to npm. Local only.

**On future expansion:** Could add rules: no-anonymous-functions-in-useFrame, no-state-set-in-useFrame, etc.

**On Vietnamese visitors:** Identical — rule is locale-agnostic.

*End of FR-PERF-006.*
