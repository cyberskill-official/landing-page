---
id: TASK-PERF-010
title: "Serve brand image assets with long immutable caching"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-11-low, audit-B/phase-1]
---

# TASK-PERF-010: Serve brand image assets with long immutable caching

## 0. Why (evidence)

Audit B: static build assets carry immutable one-year caching, but logo.svg, lumi-poster.webp and favicon.svg are
served with max-age 0, so they revalidate on every visit - repeat-visit round trips for assets that never change.

## 1. Description (normative)

- 1.1 Files under public/ that are content-stable (logo.svg, favicon.svg, lumi-poster.webp, brand/, models/) SHALL be served with `Cache-Control: public, max-age=31536000, immutable`, added in next.config.ts headers().
- 1.2 Any such asset that can change without a filename change SHALL be fingerprinted (or moved into the build pipeline) before the immutable header is applied.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a HEAD request to each listed asset returns the immutable cache header - test: `headers/static-asset-cache`
- [ ] AC for 1.2 - no non-fingerprinted, editable asset carries `immutable` - test: `headers/static-asset-cache`

## 3. Edge cases

- The GLB model files under public/models are large - immutable caching must not defeat a future model swap; fingerprint them.
- Vercel may already set headers for some paths; the config must not conflict.

## 4. Out of scope / non-goals

- Image optimisation itself (next/image already handles it).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
