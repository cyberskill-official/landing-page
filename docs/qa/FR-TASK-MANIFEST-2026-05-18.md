# FR Task Manifest

Generated: 2026-05-18

Allowed states: `Unimplemented`, `Implemented-Pending-Audit`, `Blocked`, `Completed`.

Source audit: [FR-DELIVERABLE-AUDIT-2026-05-18.md](FR-DELIVERABLE-AUDIT-2026-05-18.md).

## Snapshot 0 - Before Validation

- Total FRs: 125
- Unimplemented: 0
- Implemented-Pending-Audit: 80
- Blocked: 45
- Completed: 0

## Snapshot 1 - After Validation

- Total FRs: 125
- Unimplemented: 0
- Implemented-Pending-Audit: 0
- Blocked: 45
- Completed: 80

## Validation Evidence

Completed FRs are marked `Completed` only after the one-by-one deliverable audit and the final verification suite passed. Evidence logs: [FR audit](validation-logs/2026-05-18-final-fr-audit-post-live-fix.log), [next build](validation-logs/2026-05-18-next-build-post-live-fix.log), [web typecheck](validation-logs/2026-05-18-web-typecheck-post-live-fix-visible.log), [web unit tests](validation-logs/2026-05-18-web-vitest-post-live-fix.log), [root guardrails](validation-logs/2026-05-18-root-guardrails-post-live-fix.log), [Playwright Chromium](validation-logs/2026-05-18-playwright-chromium-post-live-fix-rerun.log), [DS build](validation-logs/2026-05-18-ds-build-post-live-fix.log), [LFS checks](validation-logs/2026-05-18-lfs-checks-post-live-fix.log), [live browser smoke](validation-logs/2026-05-18-live-browser-smoke-post-live-fix.log).

Validation failures encountered during the audit loop were fixed before completion: the lead API E2E rate-limit assertion was hardened and verified; the CI/test ordering and bundle-budget guard were corrected; the live browser smoke 404s for GLB preloads/favicon were fixed by serving greybox preload assets, allowing those public GLBs through `.gitignore`, and declaring a favicon; the Playwright webServer command was moved to the local Next binary. No individual FR hit the two-failure circuit-breaker threshold after remediation.

## Current Manifest

| FR | Phase | Module | State | Deliverables | Audit result / blocker | Evidence |
|---|---:|---|---|---:|---|---|
| [FR-CHAR-001](../feature-requests/char/FR-CHAR-001-lumi-2d-character-sheet.md) | P0 | CHAR | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CHAR-002](../feature-requests/char/FR-CHAR-002-silhouette-test.md) | P0 | CHAR | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CHAR-003](../feature-requests/char/FR-CHAR-003-nonla-accessory-design.md) | P0 | CHAR | Completed | 8/8 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-001](../feature-requests/cms/FR-CMS-001-master-narrative-arc.md) | P0 | CMS | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-002](../feature-requests/cms/FR-CMS-002-per-scene-narration.md) | P0 | CMS | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-003](../feature-requests/cms/FR-CMS-003-vietnamese-localised-variants.md) | P0 | CMS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-001](../feature-requests/ds/FR-DS-001-mood-board.md) | P0 | DS | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-002](../feature-requests/ds/FR-DS-002-palette-swatch-wcag-matrix.md) | P0 | DS | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CHAR-004](../feature-requests/char/FR-CHAR-004-lumi-greybox.md) | P1 | CHAR | Blocked | 4/4 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-005](../feature-requests/char/FR-CHAR-005-per-scene-greybox-sets.md) | P1 | CHAR | Blocked | 1/5 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-DS-003](../feature-requests/ds/FR-DS-003-cinematic-pack-skeleton.md) | P1 | DS | Completed | 13/13 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-004](../feature-requests/ds/FR-DS-004-gold-brown-token-export.md) | P1 | DS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-005](../feature-requests/ds/FR-DS-005-flag-accent-tokens.md) | P1 | DS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-006](../feature-requests/ds/FR-DS-006-motion-tokens.md) | P1 | DS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-007](../feature-requests/ds/FR-DS-007-cinematic-typography.md) | P1 | DS | Completed | 7/7 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-008](../feature-requests/ds/FR-DS-008-glow-recipes.md) | P1 | DS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-DS-009](../feature-requests/ds/FR-DS-009-component-lifecycle-marker.md) | P1 | DS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-001](../feature-requests/scene/FR-SCENE-001-scene-0-hero-figma-comp.md) | P1 | SCENE | Completed | 11/11 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-002](../feature-requests/scene/FR-SCENE-002-scene-1-origin-figma-comp.md) | P1 | SCENE | Completed | 7/7 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-003](../feature-requests/scene/FR-SCENE-003-scene-2-transformation-comp.md) | P1 | SCENE | Completed | 7/7 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-004](../feature-requests/scene/FR-SCENE-004-scene-3-capabilities-comp.md) | P1 | SCENE | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-005](../feature-requests/scene/FR-SCENE-005-scene-4-team-comp.md) | P1 | SCENE | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-006](../feature-requests/scene/FR-SCENE-006-scene-5-vietnam-global-comp.md) | P1 | SCENE | Completed | 7/7 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-007](../feature-requests/scene/FR-SCENE-007-scene-6-cta-hub-comp.md) | P1 | SCENE | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-008](../feature-requests/scene/FR-SCENE-008-footer-comp.md) | P1 | SCENE | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CHAR-006](../feature-requests/char/FR-CHAR-006-production-mesh.md) | P2 | CHAR | Blocked | 0/5 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-007](../feature-requests/char/FR-CHAR-007-uv-layout.md) | P2 | CHAR | Blocked | 0/7 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-008](../feature-requests/char/FR-CHAR-008-substance-pbr-textures.md) | P2 | CHAR | Blocked | 0/9 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-CHAR-006, FR-CHAR-007. |
| [FR-CHAR-009](../feature-requests/char/FR-CHAR-009-custom-armature-rig.md) | P2 | CHAR | Blocked | 0/6 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-010](../feature-requests/char/FR-CHAR-010-shape-keys.md) | P2 | CHAR | Blocked | 0/6 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-011](../feature-requests/char/FR-CHAR-011-animation-library.md) | P2 | CHAR | Blocked | 0/7 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-012](../feature-requests/char/FR-CHAR-012-nonla-production-mesh.md) | P2 | CHAR | Blocked | 0/8 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-OPS-001](../feature-requests/ops/FR-OPS-001-gltf-transform-pipeline.md) | P2 | OPS | Completed | 7/7 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-002](../feature-requests/ops/FR-OPS-002-budgets-json-canonical.md) | P2 | OPS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-003](../feature-requests/ops/FR-OPS-003-pr-comment-integration.md) | P2 | OPS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-004](../feature-requests/ops/FR-OPS-004-ktx2-basis-texture-compression.md) | P2 | OPS | Blocked | 0/2 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-OPS-005. |
| [FR-OPS-005](../feature-requests/ops/FR-OPS-005-decoder-bundling.md) | P2 | OPS | Blocked | 0/8 | BLOCKED: MANUAL APPROVAL - pinned decoder set exceeds 240 KB Brotli budget; approve new strategy or changed budget. | decoder-budget-current-deps: Current pinned decoder candidates total 293 KB Brotli, exceeding the FR-OPS-005 240 KB budget (240 KB). |
| [FR-OPS-006](../feature-requests/ops/FR-OPS-006-cowork-recipe-pr-triage.md) | P2 | OPS | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-007](../feature-requests/ops/FR-OPS-007-cowork-recipes-bg.md) | P2 | OPS | Completed | 13/13 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-008](../feature-requests/ops/FR-OPS-008-lfs-configuration.md) | P2 | OPS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-009](../feature-requests/ops/FR-OPS-009-source-asset-manifest.md) | P2 | OPS | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-001](../feature-requests/a11y/FR-A11Y-001-reduced-motion-fallback.md) | P3 | A11Y | Completed | 15/15 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-002](../feature-requests/a11y/FR-A11Y-002-shadow-dom-mirror.md) | P3 | A11Y | Blocked | 0/3 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009. |
| [FR-A11Y-003](../feature-requests/a11y/FR-A11Y-003-skip-story-pill.md) | P3 | A11Y | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-004](../feature-requests/a11y/FR-A11Y-004-mute-toggle.md) | P3 | A11Y | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-005](../feature-requests/a11y/FR-A11Y-005-skip-3d-toggle.md) | P3 | A11Y | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-010](../feature-requests/ops/FR-OPS-010-github-actions-ci.md) | P3 | OPS | Completed | 2/2 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-011](../feature-requests/ops/FR-OPS-011-lighthouse-ci.md) | P3 | OPS | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-012](../feature-requests/ops/FR-OPS-012-axe-a11y-gate.md) | P3 | OPS | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-013](../feature-requests/ops/FR-OPS-013-file-size-ci-gate.md) | P3 | OPS | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SCENE-009](../feature-requests/scene/FR-SCENE-009-scene-0-hero-implementation.md) | P3 | SCENE | Blocked | 0/5 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-CHAR-011. |
| [FR-SCENE-010](../feature-requests/scene/FR-SCENE-010-lumi-fly-in-idle-wiring.md) | P3 | SCENE | Blocked | 0/3 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009, FR-CHAR-011. |
| [FR-SCENE-011](../feature-requests/scene/FR-SCENE-011-above-fold-cta.md) | P3 | SCENE | Blocked | 0/3 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009. |
| [FR-SCENE-012](../feature-requests/scene/FR-SCENE-012-particulate-dust.md) | P3 | SCENE | Blocked | 0/3 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009. |
| [FR-WEB-001](../feature-requests/web/FR-WEB-001-next15-r3f-globalcanvas-bootstrap.md) | P3 | WEB | Completed | 19/19 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-002](../feature-requests/web/FR-WEB-002-lenis-smooth-scroll.md) | P3 | WEB | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-003](../feature-requests/web/FR-WEB-003-usecanvas-tunneling.md) | P3 | WEB | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-004](../feature-requests/web/FR-WEB-004-zustand-store-pattern.md) | P3 | WEB | Completed | 7/7 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-005](../feature-requests/web/FR-WEB-005-next-dynamic-ssr-false.md) | P3 | WEB | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-006](../feature-requests/web/FR-WEB-006-suspense-boundary-per-scene.md) | P3 | WEB | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-007](../feature-requests/web/FR-WEB-007-transpile-tree-shake.md) | P3 | WEB | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-008](../feature-requests/web/FR-WEB-008-routing.md) | P3 | WEB | Completed | 8/8 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-WEB-009](../feature-requests/web/FR-WEB-009-webgl2-detection.md) | P3 | WEB | Completed | 8/8 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-004](../feature-requests/cms/FR-CMS-004-sanity-schema.md) | P4 | CMS | Completed | 8/8 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-005](../feature-requests/cms/FR-CMS-005-isr-revalidation.md) | P4 | CMS | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-006](../feature-requests/cms/FR-CMS-006-work-slug-route.md) | P4 | CMS | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-007](../feature-requests/cms/FR-CMS-007-i18n-loader.md) | P4 | CMS | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CMS-008](../feature-requests/cms/FR-CMS-008-hreflang.md) | P4 | CMS | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-001](../feature-requests/cta/FR-CTA-001-three-track-cta-hub.md) | P4 | CTA | Completed | 10/10 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-002](../feature-requests/cta/FR-CTA-002-calendly-embed.md) | P4 | CTA | Completed | 11/11 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-003](../feature-requests/cta/FR-CTA-003-hubspot-partner-form.md) | P4 | CTA | Completed | 9/9 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-004](../feature-requests/cta/FR-CTA-004-ats-jobs-form.md) | P4 | CTA | Completed | 12/12 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-005](../feature-requests/cta/FR-CTA-005-form-validation.md) | P4 | CTA | Completed | 15/15 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-006](../feature-requests/cta/FR-CTA-006-lead-api-endpoint.md) | P4 | CTA | Completed | 11/11 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-007](../feature-requests/cta/FR-CTA-007-lumi-form-reactions.md) | P4 | CTA | Blocked | 0/2 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-CHAR-011. |
| [FR-CTA-008](../feature-requests/cta/FR-CTA-008-timezone-clock.md) | P4 | CTA | Blocked | 0/4 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-017. |
| [FR-SCENE-013](../feature-requests/scene/FR-SCENE-013-implementation.md) | P4 | SCENE | Blocked | 0/7 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-010, FR-CHAR-011. |
| [FR-SCENE-014](../feature-requests/scene/FR-SCENE-014-implementation.md) | P4 | SCENE | Blocked | 0/7 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-013, FR-CHAR-011. |
| [FR-SCENE-015](../feature-requests/scene/FR-SCENE-015-implementation.md) | P4 | SCENE | Blocked | 0/6 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-014, FR-CHAR-011. |
| [FR-SCENE-016](../feature-requests/scene/FR-SCENE-016-implementation.md) | P4 | SCENE | Blocked | 0/6 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-015, FR-CHAR-011. |
| [FR-SCENE-017](../feature-requests/scene/FR-SCENE-017-implementation.md) | P4 | SCENE | Blocked | 0/7 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-016, FR-CHAR-011, FR-CHAR-012. |
| [FR-SCENE-018](../feature-requests/scene/FR-SCENE-018-implementation.md) | P4 | SCENE | Blocked | 0/4 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-017, FR-CHAR-011. |
| [FR-SCENE-019](../feature-requests/scene/FR-SCENE-019-implementation.md) | P4 | SCENE | Blocked | 0/6 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-018, FR-CHAR-011. |
| [FR-SCENE-020](../feature-requests/scene/FR-SCENE-020-implementation.md) | P4 | SCENE | Blocked | 0/5 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-013, FR-SCENE-019. |
| [FR-SCENE-021](../feature-requests/scene/FR-SCENE-021-implementation.md) | P4 | SCENE | Blocked | 0/3 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-020. |
| [FR-SCENE-022](../feature-requests/scene/FR-SCENE-022-implementation.md) | P4 | SCENE | Blocked | 0/4 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-012. |
| [FR-SCENE-023](../feature-requests/scene/FR-SCENE-023-implementation.md) | P4 | SCENE | Blocked | 0/2 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-017, FR-CHAR-004, FR-CHAR-006. |
| [FR-SCENE-024](../feature-requests/scene/FR-SCENE-024-implementation.md) | P4 | SCENE | Blocked | 0/5 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-019, FR-CHAR-012. |
| [FR-A11Y-006](../feature-requests/a11y/FR-A11Y-006-impl.md) | P5 | A11Y | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-007](../feature-requests/a11y/FR-A11Y-007-impl.md) | P5 | A11Y | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-008](../feature-requests/a11y/FR-A11Y-008-impl.md) | P5 | A11Y | Completed | 2/2 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-009](../feature-requests/a11y/FR-A11Y-009-impl.md) | P5 | A11Y | Completed | 2/2 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-010](../feature-requests/a11y/FR-A11Y-010-impl.md) | P5 | A11Y | Completed | 9/9 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-011](../feature-requests/a11y/FR-A11Y-011-impl.md) | P5 | A11Y | Completed | 6/6 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-012](../feature-requests/a11y/FR-A11Y-012-impl.md) | P5 | A11Y | Blocked | 4/4 | BLOCKED: EXTERNAL DEPENDENCY - external VO/NVDA/JAWS consultant sign-off required. | FR frontmatter status is blocked. |
| [FR-CMS-009](../feature-requests/cms/FR-CMS-009-vi-native-review.md) | P5 | CMS | Blocked | 2/3 | BLOCKED: EXTERNAL DEPENDENCY - paid native Vietnamese reviewer, receipt, and founder sign-off required. | FR frontmatter status is blocked. |
| [FR-CMS-010](../feature-requests/cms/FR-CMS-010-vi-tagline-hover.md) | P5 | CMS | Blocked | 3/3 | BLOCKED: UPSTREAM/EXTERNAL SIGNOFF - tagline awaits FR-CMS-009 reviewer approval. | FR frontmatter status is blocked. |
| [FR-PERF-001](../feature-requests/perf/FR-PERF-001-cwv-budget-ci-gates.md) | P5 | PERF | Completed | 9/9 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-PERF-002](../feature-requests/perf/FR-PERF-002-impl.md) | P5 | PERF | Blocked | 0/4 | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-PERF-003](../feature-requests/perf/FR-PERF-003-impl.md) | P5 | PERF | Blocked | 0/2 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-020. |
| [FR-PERF-004](../feature-requests/perf/FR-PERF-004-impl.md) | P5 | PERF | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-PERF-005](../feature-requests/perf/FR-PERF-005-impl.md) | P5 | PERF | Completed | 4/4 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-PERF-006](../feature-requests/perf/FR-PERF-006-impl.md) | P5 | PERF | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-PERF-007](../feature-requests/perf/FR-PERF-007-impl.md) | P5 | PERF | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-PERF-008](../feature-requests/perf/FR-PERF-008-impl.md) | P5 | PERF | Blocked | 0/3 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-020. |
| [FR-PERF-009](../feature-requests/perf/FR-PERF-009-impl.md) | P5 | PERF | Blocked | 0/2 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-PERF-002. |
| [FR-PERF-010](../feature-requests/perf/FR-PERF-010-impl.md) | P5 | PERF | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SEO-001](../feature-requests/seo/FR-SEO-001-schema-org-professional-service.md) | P5 | SEO | Completed | 5/5 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SEO-002](../feature-requests/seo/FR-SEO-002-impl.md) | P5 | SEO | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SEO-003](../feature-requests/seo/FR-SEO-003-impl.md) | P5 | SEO | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SEO-004](../feature-requests/seo/FR-SEO-004-impl.md) | P5 | SEO | Blocked | 0/2 | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-019. |
| [FR-SEO-005](../feature-requests/seo/FR-SEO-005-impl.md) | P5 | SEO | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SEO-006](../feature-requests/seo/FR-SEO-006-impl.md) | P5 | SEO | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-A11Y-013](../feature-requests/a11y/FR-A11Y-013-IMPL.md) | P6 | A11Y | Blocked | 0/3 | BLOCKED: UPSTREAM FR - depends on FR-A11Y-012 manual audit completion. | Dependencies not shipped: FR-A11Y-012. |
| [FR-CMS-011](../feature-requests/cms/FR-CMS-011-IMPL.md) | P6 | CMS | Blocked | 2/2 | BLOCKED: EXTERNAL DEPENDENCY - Linear/Asana recurring tracker task must be created manually or via connector. | FR frontmatter status is blocked. |
| [FR-CTA-009](../feature-requests/cta/FR-CTA-009-IMPL.md) | P6 | CTA | Blocked | 14/14 | BLOCKED: EXTERNAL DEPENDENCY - HubSpot sandbox credentials and test pipeline cleanup required. | FR frontmatter status is blocked. |
| [FR-CTA-010](../feature-requests/cta/FR-CTA-010-IMPL.md) | P6 | CTA | Completed | 8/8 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-CTA-011](../feature-requests/cta/FR-CTA-011-IMPL.md) | P6 | CTA | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-OPS-014](../feature-requests/ops/FR-OPS-014-IMPL.md) | P6 | OPS | Blocked | 3/3 | BLOCKED: EXTERNAL DEPENDENCY - Vercel operator access, production deployment, DNS, and post-deploy verification required. | FR frontmatter status is blocked. |
| [FR-OPS-015](../feature-requests/ops/FR-OPS-015-IMPL.md) | P6 | OPS | Blocked | 2/4 | BLOCKED: EXTERNAL DEPENDENCY - public launch URL, production captures, awards accounts, and submission IDs required. | FR frontmatter status is blocked. |
| [FR-OPS-016](../feature-requests/ops/FR-OPS-016-IMPL.md) | P6 | OPS | Blocked | 2/2 | BLOCKED: UPSTREAM/EXTERNAL DEPENDENCY - Scene 0 staging URL plus invite list/password must exist. | FR frontmatter status is blocked. |
| [FR-PERF-011](../feature-requests/perf/FR-PERF-011-IMPL.md) | P6 | PERF | Blocked | 8/8 | BLOCKED: EXTERNAL DEPENDENCY - Plausible production credentials and Slack webhook required. | FR frontmatter status is blocked. |
| [FR-SEO-007](../feature-requests/seo/FR-SEO-007-IMPL.md) | P6 | SEO | Completed | 3/3 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SEO-008](../feature-requests/seo/FR-SEO-008-IMPL.md) | P6 | SEO | Completed | 7/7 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| [FR-SEO-009](../feature-requests/seo/FR-SEO-009-IMPL.md) | P6 | SEO | Completed | 2/2 | Marked shipped and declared concrete deliverables are present. | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |

## State Change Log

| # | FR | From | To | Validation evidence |
|---:|---|---|---|---|
| 1 | [FR-CHAR-001](../feature-requests/char/FR-CHAR-001-lumi-2d-character-sheet.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 2 | [FR-CHAR-002](../feature-requests/char/FR-CHAR-002-silhouette-test.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 3 | [FR-CHAR-003](../feature-requests/char/FR-CHAR-003-nonla-accessory-design.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 4 | [FR-CMS-001](../feature-requests/cms/FR-CMS-001-master-narrative-arc.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 5 | [FR-CMS-002](../feature-requests/cms/FR-CMS-002-per-scene-narration.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 6 | [FR-CMS-003](../feature-requests/cms/FR-CMS-003-vietnamese-localised-variants.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 7 | [FR-DS-001](../feature-requests/ds/FR-DS-001-mood-board.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 8 | [FR-DS-002](../feature-requests/ds/FR-DS-002-palette-swatch-wcag-matrix.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 9 | [FR-DS-003](../feature-requests/ds/FR-DS-003-cinematic-pack-skeleton.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 10 | [FR-DS-004](../feature-requests/ds/FR-DS-004-gold-brown-token-export.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 11 | [FR-DS-005](../feature-requests/ds/FR-DS-005-flag-accent-tokens.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 12 | [FR-DS-006](../feature-requests/ds/FR-DS-006-motion-tokens.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 13 | [FR-DS-007](../feature-requests/ds/FR-DS-007-cinematic-typography.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 14 | [FR-DS-008](../feature-requests/ds/FR-DS-008-glow-recipes.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 15 | [FR-DS-009](../feature-requests/ds/FR-DS-009-component-lifecycle-marker.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 16 | [FR-SCENE-001](../feature-requests/scene/FR-SCENE-001-scene-0-hero-figma-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 17 | [FR-SCENE-002](../feature-requests/scene/FR-SCENE-002-scene-1-origin-figma-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 18 | [FR-SCENE-003](../feature-requests/scene/FR-SCENE-003-scene-2-transformation-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 19 | [FR-SCENE-004](../feature-requests/scene/FR-SCENE-004-scene-3-capabilities-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 20 | [FR-SCENE-005](../feature-requests/scene/FR-SCENE-005-scene-4-team-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 21 | [FR-SCENE-006](../feature-requests/scene/FR-SCENE-006-scene-5-vietnam-global-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 22 | [FR-SCENE-007](../feature-requests/scene/FR-SCENE-007-scene-6-cta-hub-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 23 | [FR-SCENE-008](../feature-requests/scene/FR-SCENE-008-footer-comp.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 24 | [FR-OPS-001](../feature-requests/ops/FR-OPS-001-gltf-transform-pipeline.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 25 | [FR-OPS-002](../feature-requests/ops/FR-OPS-002-budgets-json-canonical.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 26 | [FR-OPS-003](../feature-requests/ops/FR-OPS-003-pr-comment-integration.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 27 | [FR-OPS-006](../feature-requests/ops/FR-OPS-006-cowork-recipe-pr-triage.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 28 | [FR-OPS-007](../feature-requests/ops/FR-OPS-007-cowork-recipes-bg.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 29 | [FR-OPS-008](../feature-requests/ops/FR-OPS-008-lfs-configuration.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 30 | [FR-OPS-009](../feature-requests/ops/FR-OPS-009-source-asset-manifest.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 31 | [FR-A11Y-001](../feature-requests/a11y/FR-A11Y-001-reduced-motion-fallback.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 32 | [FR-A11Y-003](../feature-requests/a11y/FR-A11Y-003-skip-story-pill.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 33 | [FR-A11Y-004](../feature-requests/a11y/FR-A11Y-004-mute-toggle.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 34 | [FR-A11Y-005](../feature-requests/a11y/FR-A11Y-005-skip-3d-toggle.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 35 | [FR-OPS-010](../feature-requests/ops/FR-OPS-010-github-actions-ci.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 36 | [FR-OPS-011](../feature-requests/ops/FR-OPS-011-lighthouse-ci.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 37 | [FR-OPS-012](../feature-requests/ops/FR-OPS-012-axe-a11y-gate.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 38 | [FR-OPS-013](../feature-requests/ops/FR-OPS-013-file-size-ci-gate.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 39 | [FR-WEB-001](../feature-requests/web/FR-WEB-001-next15-r3f-globalcanvas-bootstrap.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 40 | [FR-WEB-002](../feature-requests/web/FR-WEB-002-lenis-smooth-scroll.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 41 | [FR-WEB-003](../feature-requests/web/FR-WEB-003-usecanvas-tunneling.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 42 | [FR-WEB-004](../feature-requests/web/FR-WEB-004-zustand-store-pattern.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 43 | [FR-WEB-005](../feature-requests/web/FR-WEB-005-next-dynamic-ssr-false.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 44 | [FR-WEB-006](../feature-requests/web/FR-WEB-006-suspense-boundary-per-scene.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 45 | [FR-WEB-007](../feature-requests/web/FR-WEB-007-transpile-tree-shake.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 46 | [FR-WEB-008](../feature-requests/web/FR-WEB-008-routing.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 47 | [FR-WEB-009](../feature-requests/web/FR-WEB-009-webgl2-detection.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 48 | [FR-CMS-004](../feature-requests/cms/FR-CMS-004-sanity-schema.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 49 | [FR-CMS-005](../feature-requests/cms/FR-CMS-005-isr-revalidation.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 50 | [FR-CMS-006](../feature-requests/cms/FR-CMS-006-work-slug-route.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 51 | [FR-CMS-007](../feature-requests/cms/FR-CMS-007-i18n-loader.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 52 | [FR-CMS-008](../feature-requests/cms/FR-CMS-008-hreflang.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 53 | [FR-CTA-001](../feature-requests/cta/FR-CTA-001-three-track-cta-hub.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 54 | [FR-CTA-002](../feature-requests/cta/FR-CTA-002-calendly-embed.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 55 | [FR-CTA-003](../feature-requests/cta/FR-CTA-003-hubspot-partner-form.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 56 | [FR-CTA-004](../feature-requests/cta/FR-CTA-004-ats-jobs-form.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 57 | [FR-CTA-005](../feature-requests/cta/FR-CTA-005-form-validation.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 58 | [FR-CTA-006](../feature-requests/cta/FR-CTA-006-lead-api-endpoint.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 59 | [FR-A11Y-006](../feature-requests/a11y/FR-A11Y-006-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 60 | [FR-A11Y-007](../feature-requests/a11y/FR-A11Y-007-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 61 | [FR-A11Y-008](../feature-requests/a11y/FR-A11Y-008-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 62 | [FR-A11Y-009](../feature-requests/a11y/FR-A11Y-009-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 63 | [FR-A11Y-010](../feature-requests/a11y/FR-A11Y-010-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 64 | [FR-A11Y-011](../feature-requests/a11y/FR-A11Y-011-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 65 | [FR-PERF-001](../feature-requests/perf/FR-PERF-001-cwv-budget-ci-gates.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 66 | [FR-PERF-004](../feature-requests/perf/FR-PERF-004-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 67 | [FR-PERF-005](../feature-requests/perf/FR-PERF-005-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 68 | [FR-PERF-006](../feature-requests/perf/FR-PERF-006-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 69 | [FR-PERF-007](../feature-requests/perf/FR-PERF-007-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 70 | [FR-PERF-010](../feature-requests/perf/FR-PERF-010-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 71 | [FR-SEO-001](../feature-requests/seo/FR-SEO-001-schema-org-professional-service.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 72 | [FR-SEO-002](../feature-requests/seo/FR-SEO-002-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 73 | [FR-SEO-003](../feature-requests/seo/FR-SEO-003-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 74 | [FR-SEO-005](../feature-requests/seo/FR-SEO-005-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 75 | [FR-SEO-006](../feature-requests/seo/FR-SEO-006-impl.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 76 | [FR-CTA-010](../feature-requests/cta/FR-CTA-010-IMPL.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 77 | [FR-CTA-011](../feature-requests/cta/FR-CTA-011-IMPL.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 78 | [FR-SEO-007](../feature-requests/seo/FR-SEO-007-IMPL.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 79 | [FR-SEO-008](../feature-requests/seo/FR-SEO-008-IMPL.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |
| 80 | [FR-SEO-009](../feature-requests/seo/FR-SEO-009-IMPL.md) | Implemented-Pending-Audit | Completed | deliverable audit + build + typecheck + unit + E2E + guardrails + live smoke |

## Blocker Registry

Blocked FRs were not implemented with mocks when the FR required production-only asset geometry, external credentials, operator access, or independent sign-off. Mock/sandbox completion is only valid where the FR acceptance criteria can be fully tested without falsifying the deliverable.

| FR | Phase | Module | State | Classification | Evidence needed to unblock |
|---|---:|---|---|---|---|
| [FR-CHAR-004](../feature-requests/char/FR-CHAR-004-lumi-greybox.md) | P1 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-005](../feature-requests/char/FR-CHAR-005-per-scene-greybox-sets.md) | P1 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-006](../feature-requests/char/FR-CHAR-006-production-mesh.md) | P2 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-007](../feature-requests/char/FR-CHAR-007-uv-layout.md) | P2 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-008](../feature-requests/char/FR-CHAR-008-substance-pbr-textures.md) | P2 | CHAR | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-CHAR-006, FR-CHAR-007. |
| [FR-CHAR-009](../feature-requests/char/FR-CHAR-009-custom-armature-rig.md) | P2 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-010](../feature-requests/char/FR-CHAR-010-shape-keys.md) | P2 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-011](../feature-requests/char/FR-CHAR-011-animation-library.md) | P2 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-CHAR-012](../feature-requests/char/FR-CHAR-012-nonla-production-mesh.md) | P2 | CHAR | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-OPS-004](../feature-requests/ops/FR-OPS-004-ktx2-basis-texture-compression.md) | P2 | OPS | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-OPS-005. |
| [FR-OPS-005](../feature-requests/ops/FR-OPS-005-decoder-bundling.md) | P2 | OPS | Blocked | BLOCKED: MANUAL APPROVAL - pinned decoder set exceeds 240 KB Brotli budget; approve new strategy or changed budget. | decoder-budget-current-deps: Current pinned decoder candidates total 293 KB Brotli, exceeding the FR-OPS-005 240 KB budget (240 KB). |
| [FR-A11Y-002](../feature-requests/a11y/FR-A11Y-002-shadow-dom-mirror.md) | P3 | A11Y | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009. |
| [FR-SCENE-009](../feature-requests/scene/FR-SCENE-009-scene-0-hero-implementation.md) | P3 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-CHAR-011. |
| [FR-SCENE-010](../feature-requests/scene/FR-SCENE-010-lumi-fly-in-idle-wiring.md) | P3 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009, FR-CHAR-011. |
| [FR-SCENE-011](../feature-requests/scene/FR-SCENE-011-above-fold-cta.md) | P3 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009. |
| [FR-SCENE-012](../feature-requests/scene/FR-SCENE-012-particulate-dust.md) | P3 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-009. |
| [FR-CTA-007](../feature-requests/cta/FR-CTA-007-lumi-form-reactions.md) | P4 | CTA | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-CHAR-011. |
| [FR-CTA-008](../feature-requests/cta/FR-CTA-008-timezone-clock.md) | P4 | CTA | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-017. |
| [FR-SCENE-013](../feature-requests/scene/FR-SCENE-013-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-010, FR-CHAR-011. |
| [FR-SCENE-014](../feature-requests/scene/FR-SCENE-014-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-013, FR-CHAR-011. |
| [FR-SCENE-015](../feature-requests/scene/FR-SCENE-015-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-014, FR-CHAR-011. |
| [FR-SCENE-016](../feature-requests/scene/FR-SCENE-016-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-015, FR-CHAR-011. |
| [FR-SCENE-017](../feature-requests/scene/FR-SCENE-017-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-016, FR-CHAR-011, FR-CHAR-012. |
| [FR-SCENE-018](../feature-requests/scene/FR-SCENE-018-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-017, FR-CHAR-011. |
| [FR-SCENE-019](../feature-requests/scene/FR-SCENE-019-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-018, FR-CHAR-011. |
| [FR-SCENE-020](../feature-requests/scene/FR-SCENE-020-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-013, FR-SCENE-019. |
| [FR-SCENE-021](../feature-requests/scene/FR-SCENE-021-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-020. |
| [FR-SCENE-022](../feature-requests/scene/FR-SCENE-022-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-012. |
| [FR-SCENE-023](../feature-requests/scene/FR-SCENE-023-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-017, FR-CHAR-004, FR-CHAR-006. |
| [FR-SCENE-024](../feature-requests/scene/FR-SCENE-024-implementation.md) | P4 | SCENE | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-019, FR-CHAR-012. |
| [FR-A11Y-012](../feature-requests/a11y/FR-A11Y-012-impl.md) | P5 | A11Y | Blocked | BLOCKED: EXTERNAL DEPENDENCY - external VO/NVDA/JAWS consultant sign-off required. | FR frontmatter status is blocked. |
| [FR-CMS-009](../feature-requests/cms/FR-CMS-009-vi-native-review.md) | P5 | CMS | Blocked | BLOCKED: EXTERNAL DEPENDENCY - paid native Vietnamese reviewer, receipt, and founder sign-off required. | FR frontmatter status is blocked. |
| [FR-CMS-010](../feature-requests/cms/FR-CMS-010-vi-tagline-hover.md) | P5 | CMS | Blocked | BLOCKED: UPSTREAM/EXTERNAL SIGNOFF - tagline awaits FR-CMS-009 reviewer approval. | FR frontmatter status is blocked. |
| [FR-PERF-002](../feature-requests/perf/FR-PERF-002-impl.md) | P5 | PERF | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Blender 4.4 LTS production asset authoring/validation unavailable. | blender-missing: Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here. |
| [FR-PERF-003](../feature-requests/perf/FR-PERF-003-impl.md) | P5 | PERF | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-020. |
| [FR-PERF-008](../feature-requests/perf/FR-PERF-008-impl.md) | P5 | PERF | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-020. |
| [FR-PERF-009](../feature-requests/perf/FR-PERF-009-impl.md) | P5 | PERF | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-PERF-002. |
| [FR-SEO-004](../feature-requests/seo/FR-SEO-004-impl.md) | P5 | SEO | Blocked | BLOCKED: UPSTREAM FR - dependency chain is not shipped. | Dependencies not shipped: FR-SCENE-019. |
| [FR-A11Y-013](../feature-requests/a11y/FR-A11Y-013-IMPL.md) | P6 | A11Y | Blocked | BLOCKED: UPSTREAM FR - depends on FR-A11Y-012 manual audit completion. | Dependencies not shipped: FR-A11Y-012. |
| [FR-CMS-011](../feature-requests/cms/FR-CMS-011-IMPL.md) | P6 | CMS | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Linear/Asana recurring tracker task must be created manually or via connector. | FR frontmatter status is blocked. |
| [FR-CTA-009](../feature-requests/cta/FR-CTA-009-IMPL.md) | P6 | CTA | Blocked | BLOCKED: EXTERNAL DEPENDENCY - HubSpot sandbox credentials and test pipeline cleanup required. | FR frontmatter status is blocked. |
| [FR-OPS-014](../feature-requests/ops/FR-OPS-014-IMPL.md) | P6 | OPS | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Vercel operator access, production deployment, DNS, and post-deploy verification required. | FR frontmatter status is blocked. |
| [FR-OPS-015](../feature-requests/ops/FR-OPS-015-IMPL.md) | P6 | OPS | Blocked | BLOCKED: EXTERNAL DEPENDENCY - public launch URL, production captures, awards accounts, and submission IDs required. | FR frontmatter status is blocked. |
| [FR-OPS-016](../feature-requests/ops/FR-OPS-016-IMPL.md) | P6 | OPS | Blocked | BLOCKED: UPSTREAM/EXTERNAL DEPENDENCY - Scene 0 staging URL plus invite list/password must exist. | FR frontmatter status is blocked. |
| [FR-PERF-011](../feature-requests/perf/FR-PERF-011-IMPL.md) | P6 | PERF | Blocked | BLOCKED: EXTERNAL DEPENDENCY - Plausible production credentials and Slack webhook required. | FR frontmatter status is blocked. |

## Resolution Loop

- Newly unblocked FRs after this validation pass: none.
- Manual-intervention circuit breaker: no FR is marked `MANUAL INTERVENTION REQUIRED` because all observed validation failures were remediated and their follow-up suites passed.
- External dependency packet: [FR-EXTERNAL-DEPENDENCY-PACKET-2026-05-18.md](FR-EXTERNAL-DEPENDENCY-PACKET-2026-05-18.md).
- Manual social/awards posting schedule: [manual-posting-schedule-2026-05-18.md](../launch/manual-posting-schedule-2026-05-18.md).
