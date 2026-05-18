# Bundle Configuration Notes

This app keeps Three.js behind client-only dynamic boundaries, but the Next.js build still needs explicit settings so future edits do not accidentally move heavy 3D code into the critical path.

## `transpilePackages: ['three']`

Three ships modern ESM. Keeping `three` in `transpilePackages` routes those modules through Next's SWC pipeline without broadening transpilation to React Three Fiber, Drei, or scroll-rig packages that currently build cleanly without it.

## Production Tree-Shaking

`optimization.usedExports = true` and `optimization.sideEffects = true` are applied only for production browser bundles. Development and server builds stay as close to Next defaults as possible, while the production client bundle preserves webpack's dead-code elimination for unused Three exports.

## Named Imports Only

`import * as THREE from 'three'` and CommonJS `require('three')` hide which exports are actually used. The `no-namespace-three` rule and Vitest guard require named ESM imports so webpack can drop unused Three modules.

## Compression

`compress: true` is pinned even though it is a Next.js default. The explicit setting makes the performance contract auditable next to the rest of the bundle policy.

## Package Side Effects

First-party ESM packages that participate in the web bundle must declare `"sideEffects": false` when safe. `packages/ds-cinematic` does this so unused token and lifecycle exports can be removed from browser chunks.
