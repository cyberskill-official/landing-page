# Bundle audit (FR-PERF-004)

How chunk composition is inspected, and the current per-chunk sizes, so future
regressions are comparable. The point of the audit is to keep the heavy 3D scene
and its libraries off the first-load critical path.

## Run the analyzer

```
npm run analyze        # = ANALYZE=true next build
```

This emits a per-chunk treemap under `.next/analyze/`:
`client.html` (browser bundle - the one that matters here), `nodejs.html`, and
`edge.html`. It is off by default, so normal `npm run build` is unchanged. Open
`client.html` to drill into any chunk's modules.

## First load is clean

First Load JS shared by every route is 176 KB; each route adds a few hundred
bytes on top (176-177 KB total). The two shared chunks that make up almost all
of it carry no 3D code:

| Shared first-load chunk | parsed | gzip | 3D libs |
|---|---:|---:|---|
| `chunks/352-*.js` | 389.9 KB | 116.1 KB | none |
| `chunks/4bd1b696-*.js` | 169.0 KB | 53.0 KB | none |
| `chunks/main-*.js`, `framework-*.js` | 271 / 185 KB | 84 / 58 KB | none |

The analyzer confirms `three`, `@react-three/*`, and `gsap`/`lenis` are absent
from these first-load chunks.

## The 3D scene is its own deferred payload

`components/canvas/CanvasMount.tsx` imports `GenieScene` via
`next/dynamic(..., { ssr: false })` and only mounts it on capable desktops, so
the whole 3D stack is split into async chunks fetched after the page is usable
(or never, on mobile / reduced-motion, which keep the static poster). Those
chunks:

| Async chunk | parsed | gzip | contains |
|---|---:|---:|---|
| `chunks/bd904a5c.*.js` | 373.0 KB | 98.1 KB | three |
| `chunks/b536a0f1.*.js` | 350.6 KB | 84.9 KB | three |
| `chunks/b79b7286.*.js` | 143.0 KB | 44.9 KB | @react-three (fiber) |
| `chunks/189.*.js` | 86.5 KB | 26.7 KB | @react-three (drei) |
| `chunks/c15bf2b0.*.js` | 50.6 KB | 19.4 KB | gsap / lenis |
| `chunks/580.*.js` | 42.3 KB | 17.0 KB | gsap / scrolltrigger |
| `chunks/605.*.js` | 19.0 KB | 8.0 KB | gsap / lenis |
| `chunks/691.*.js` | 17.3 KB | 4.9 KB | scene helpers |

Deferred 3D payload: about 304 KB gzip, none of it on first load. The optional
Lumi GLB (FR-CHAR-022/SCENE-010) is fetched only when `NEXT_PUBLIC_LUMI_GLB` is
set, behind the same gate and a Suspense boundary, so it never touches first
load either.

## Totals and how to compare later

Whole client bundle: about 2249 KB parsed / 666 KB gzip across 43 chunks. The
hard guard lives in `scripts/check-asset-size.mjs` (`npm run check:assets`, in
CI): total client JS must stay under `maxClientJsTotalKB` in
`scripts/asset-budget.json`. This audit is the qualitative companion - when the
guard trips, re-run `npm run analyze`, compare the table above, and confirm any
growth landed in the deferred 3D chunks, not the 176 KB first load.

Measured 2026-06-24 from `npm run analyze` on branch `auto/glb-perf-a11y`
(procedural Lumi, no GLB env set).
