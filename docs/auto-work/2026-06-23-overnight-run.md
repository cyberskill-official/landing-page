# Autonomous run - 2026-06-23

Branch: `auto/overnight-tasks` (off `main` at 8467f0f). Not deployed to production; left for review and selective merge.

Scope: only tasks buildable with no input from Stephen (no content, assets, secrets, datastores, or product decisions). Each increment is verified (tsc + vitest + lint + next build, in the sandbox build copy) before commit.

## Ledger

### 1. OPS-007 + PERF-006 - Speed Insights / field CWV (shipped)

`@vercel/analytics` and `@vercel/speed-insights` are installed and both components are mounted in `app/layout.tsx` (arrived via the merged Vercel PRs). The previously-noted `@vercel/*` vs Vitest/Vite peer conflict no longer reproduces - a clean `npm install` succeeds with no `.npmrc`, and Vitest still runs (37 tests). So Speed Insights collects field CWV (LCP/CLS/INP) from real visitors in production; the data accrues in the Vercel dashboard with traffic. Flipped both tasks to shipped. No `.npmrc` needed; recorded that the conflict is gone.

### 2. CHAR-029 - genie proxy abuse hardening (substantial; stays planned)

`lib/genie/validate.ts` (new, unit-tested) holds the request validation: shape/role checks, per-message (4000) + total (12000) size caps, control-char stripping. `app/api/genie/route.ts` now uses it, adds a `Retry-After` header on 429, and prunes expired rate buckets. `lib/genie/persona.ts` gained an explicit prompt-injection-resistance rule; the system prompt stays a separate block from user turns. `tests/genie-validate.test.ts` (7 cases) is in the existing vitest job (44 tests total). Remaining for full acceptance: a durable cross-instance rate-limit store (Vercel KV / Upstash) - needs a datastore + secret, so the task stays planned. tsc/vitest/lint/build all green.

### 3. PERF-003 - asset + bundle size guard (shipped)

`scripts/check-asset-size.mjs` + `scripts/asset-budget.json` measure public assets (per-image / per-GLB caps + total) and the built client JS total against declared ceilings, exiting non-zero on a breach. Wired as `npm run check:assets` and added to the CI build job after `next build`. Deterministic (file sizes), so no flake. Current: public 95KB, client JS 2286KB across 43 chunks - within budget. Flipped TASK-PERF-003 to shipped; BACKLOG 50/1/42.

### 4. A11Y-005 (shipped) + A11Y-004 down-payment (stays planned)

A11Y-005: `components/genie/GenieStatusAnnouncer.tsx` adds a `.cs-visually-hidden` `role="status" aria-live="polite"` region mirroring Lumi's state ("Lumi is thinking / responding"), localised; a localised `<noscript>` note describes the decorative scene; the canvas stays aria-hidden. Shipped. A11Y-004: launcher buttons now carry `aria-haspopup="dialog"` + `aria-expanded` (bound to open state); the dialog already does focus-in / focus-return / Escape and is a correct non-modal (no trap). Stays planned - full acceptance needs a manual Tab/Shift+Tab + focus-contrast pass (A11Y-008). BACKLOG 51/1/41.

### 5. DS-004 + DS-006 - Liquid Glass set + APCA tooling (both shipped)

DS-004: the five materials already existed with `@supports`/reduced-transparency/ forced-colors fallbacks; added the missing `@media print` collapse-to-solid, so all four fallback paths are covered. Shipped. DS-006: `scripts/apca.mjs` (APCA-W3 0.1.9 core + glass compositing) + `tests/apca.test.ts` (validated vs reference values) + `scripts/check-apca.mjs` (`npm run check:apca`) measuring text-on-surface pairs incl. composited glass. It caught two real misses: dark-theme muted text (Lc 63 -> fixed by lightening `--cs-color-fg-muted` to `#dcd2c3`, now 79.3) and the ochre primary button (Lc 66 vs strict 90 - meets WCAG AA + APCA large-bold, flagged for a brand-colour decision, so the guard runs locally, not as a blocking CI gate). Shipped. BACKLOG 53/1/39. tsc/vitest 47/lint/build all green.

Operator note: the ochre primary button is APCA Lc 66 against the strict interactive-90 target. It is WCAG 2.2 AA compliant; raising it to Lc 90 would need a darker label or a different button colour - a brand decision.

### 6. DS-003 - in-repo component primitives (shipped)

`components/ui/` gains Button, Card, Field, Select, Dialog - all emitting the existing token markup (`.cs-btn*`, glass/surface, `.cs-field`), no external dep. Dialog is a true modal with focus trap + Escape + focus restore. `tests/ui-primitives.test.ts` renders each + runs axe. Adoption at existing call sites is left incremental (drop-in, identical markup) so the run touches no conversion-critical code unattended. BACKLOG 54/1/38.

## Run summary

Shipped this run (all on `auto/overnight-tasks`, verified tsc + vitest + lint + next build each increment; not deployed to production):
- OPS-007, PERF-006 - Speed Insights / field CWV (already wired; flipped).
- PERF-003 - asset + bundle size CI guard.
- A11Y-005 - canvas DOM-text mirror + noscript.
- DS-004 - Liquid Glass print fallback (set now complete).
- DS-006 - APCA contrast tooling (fixed dark muted text Lc 63->79).
- DS-003 - the five UI primitives.

Partial / down-payment (task stays planned):
- CHAR-029 - validation + injection defence + fail-safe shipped; durable cross-instance rate store still needs a KV + secret (operator).
- A11Y-004 - launcher dialog semantics added; needs a manual keyboard pass (A11Y-008).

Deliberately NOT done unattended (need your input or visual review):
- WEB-008 services detail pages - need real services content (CMS-005).
- SCENE-009/010 - GPU disposal / preloader: touch the 3D scene, which I cannot visually verify headlessly without risk; left for a reviewed pass.
- PERF-004 bundle analysis - marginal; can add a report on request.
- The ochre button APCA-90 question - brand-colour decision.

Final tally: BACKLOG 54 shipped / 1 hold / 38 planned. Review the branch and merge what you want; nothing here has touched cyberskill.world.
