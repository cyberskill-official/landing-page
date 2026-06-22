---
id: FR-PERF-004
title: "Bundle analysis and code-split audit to keep the 3D chunk off the critical path"
module: PERF
priority: COULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-PERF-003]
blocks: []
source_pages:
  - "research doc §F (code splitting), §J (defer the 3D scene)"
new_files:
  - docs/perf/bundle-audit.md
modified_files:
  - next.config.mjs
---

## §1 Requirement (BCP-14 normative)

The 3D scene MUST load after the page is usable, never before.

1. The build MUST expose a bundle analysis (for example via the Next.js bundle
   analyzer) so chunk composition is inspectable.
2. The 3D scene and its libraries MUST be dynamically imported into a separate
   chunk that is NOT part of the initial critical-path bundle.
3. `docs/perf/bundle-audit.md` MUST record the audit findings and the
   per-chunk sizes so future regressions are comparable.

## §2 Acceptance

- The bundle analyzer produces a per-chunk report on demand.
- The 3D code ships in its own chunk, absent from the first load.
- The audit doc lists current chunk sizes.

## §3 Evidence

Not yet implemented; acceptance pending build.
