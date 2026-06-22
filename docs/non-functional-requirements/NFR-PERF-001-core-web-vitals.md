---
id: NFR-PERF-001
category: Performance
priority: MUST
status: enforced
owner: Stephen Cheng
created: 2026-06-22
---

## Requirement

Core Web Vitals must clear healthy thresholds: LCP under 2.5 s at the p75 mobile
percentile, INP in the healthy range, and CLS under 0.1. A performance-budget
JSON is enforced in CI and caps the script bundle, total bytes, and the intended
draw-call ceiling for the scene. The 3D payload is kept off the critical path and
off mobile, so it can never push LCP past the budget.

## Verification

The `lighthouse/budget.json` gate runs in CI (FR-OPS-001) and fails the build on
a regression past the LCP ceiling. Field and lab confirmation comes from
Lighthouse and WebPageTest under mobile emulation.

## Current status

The budget is authored and wired into CI as the machine-checked contract. Live
measurement against the 2.5 s target is deferred to the operator, who runs the
build and Lighthouse on real hardware.
