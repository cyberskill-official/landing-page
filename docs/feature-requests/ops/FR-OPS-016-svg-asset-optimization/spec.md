---
id: FR-OPS-016
title: "Optimize SVG vector assets in build/CI and enforce file-size budgets"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [FR-OPS-001]
routed_back_count: 0
awh: N/A
---

# FR-OPS-016: Optimize SVG vector assets in build/CI and enforce file-size budgets

## 0. Why (evidence)
To prevent oversized, unoptimized SVG assets (like logos and decorative graphics) from regressing first paint speeds. Automating SVG minification in the build pipeline ensures that any new vector graphics committed stay optimized and compressed.

## 1. Description (normative)
- 1.1 All SVG assets stored in `/public` or `/components` SHALL be audited and minified (using SVGO or similar tools) to strip metadata and editor tags.
- 1.2 The build size check script (`check-asset-size.mjs`) SHALL enforce a strict file-size budget for SVG assets, throwing errors if limits are exceeded.
- 1.3 Pre-commit hooks or CI workflows SHALL validate that committed SVG files are optimized.

## 2. Acceptance criteria
- [ ] AC for 1.1 - all SVGs in the codebase have comments, editor tags, and unused namespaces stripped - test: `perf/svg-minified`
- [ ] AC for 1.2 - check-asset-size script throws an error if any SVG exceeds its budget - test: `perf/svg-budget-gate`
- [ ] AC for 1.3 - files are validated dynamically in pre-commit tasks - test: `perf/svg-precommit`

## 3. Edge cases
- SVGs containing inline scripts or complex styling rules being broken by aggressive minification.
- ViewBox scaling attributes being stripped, breaking responsive resizing.

## 4. Out of scope
- Optimizing non-vector image formats (handled in FR-PERF-010).

## 5. Protected invariants
- Minified SVGs must preserve all original visual designs and accessibility descriptors (like `role` or `aria-label`).
