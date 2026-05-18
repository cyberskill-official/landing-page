# Performance Budget Gates

`tools/perf-budgets/budgets.json` is the canonical threshold file for `FR-PERF-001`.

The gate has two levels:

- `target`: warning. The PR should explain why it is close to the edge.
- `fail`: hard stop. CI fails and the PR should not merge.

## Running Locally

```bash
node tools/perf-budgets/check-js-bundle.mjs
node tools/perf-budgets/check-asset-sizes.mjs
node tools/perf-budgets/check-cwv.mjs .lighthouseci/lhr-*.json
```

The local pre-push hook in `.hooks/pre-push` runs the fast bundle and asset checks. CI remains the gate of record.

## How To Change A Threshold

Do not weaken a threshold just to get a PR green.

To change a threshold, open a new feature request named like:

```text
FR-PERF-NNN-budget-amendment-rationale
```

That FR must include the measured regression, optimization attempts, the new proposed threshold, and founder approval under AGENTS.md §16.2 before `budgets.json` changes.

## Reading Failures

- `check-cwv.mjs`: reports Lighthouse metric breaches for LCP, INP, and CLS.
- `check-js-bundle.mjs`: reports gzipped critical main chunk size from `.next/build-manifest.json`.
- `check-asset-sizes.mjs`: reports GLB and decoder bundle breaches.
