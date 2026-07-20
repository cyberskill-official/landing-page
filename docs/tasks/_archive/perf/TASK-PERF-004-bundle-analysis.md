---
id: TASK-PERF-004
title: "Bundle analysis and code-split audit to keep the 3D chunk off the critical path"
module: PERF
priority: COULD
status: done
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-24
depends_on: [TASK-PERF-003]
blocks: []
source_pages:
  - "research doc §F (code splitting), §J (defer the 3D scene)"
new_files:
  - docs/perf/bundle-audit.md
modified_files:
  - next.config.mjs
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The 3D scene MUST load after the page is usable, never before.

1. The build MUST expose a bundle analysis (for example via the Next.js bundle analyzer) so chunk composition is inspectable.
2. The 3D scene and its libraries MUST be dynamically imported into a separate chunk that is NOT part of the initial critical-path bundle.
3. `docs/perf/bundle-audit.md` MUST record the audit findings and the per-chunk sizes so future regressions are comparable.

## §2 Acceptance

- The bundle analyzer produces a per-chunk report on demand.
- The 3D code ships in its own chunk, absent from the first load.
- The audit doc lists current chunk sizes.

## §3 Evidence

Shipped 2026-06-24 on branch `auto/glb-perf-a11y`.

- On-demand analyzer (criterion 1): `next.config.ts` wraps the config in `@next/bundle-analyzer`, gated by `ANALYZE=true`; `npm run analyze` emits `.next/analyze/{client,nodejs,edge}.html` per-chunk treemaps. Off by default, so normal builds are unchanged. Verified: the three reports were generated.
- 3D in its own chunk, absent from first load (criterion 2): the analyzer's chunk data shows the two first-load shared chunks (`352-*` 116 KB gzip, `4bd1b696-*` 53 KB gzip) contain no `three`, `@react-three/*`, or `gsap`/`lenis`. The 3D stack is split into async chunks (about 304 KB gzip total) fetched only when `CanvasMount` dynamically imports `GenieScene` (`ssr:false`) on capable desktops. First Load JS shared by all routes stays 176 KB.
- Audit doc with current chunk sizes (criterion 3): `docs/perf/bundle-audit.md` records how to run the analyzer, the first-load and 3D async chunk tables with parsed + gzip sizes, totals (about 2249 KB parsed / 666 KB gzip / 43 chunks), and how to compare future regressions against the `check:assets` guard.
