# Autonomous run - 2026-06-23

Branch: `auto/overnight-frs` (off `main` at 8467f0f). Not deployed to production;
left for review and selective merge.

Scope: only FRs buildable with no input from Stephen (no content, assets,
secrets, datastores, or product decisions). Each increment is verified
(tsc + vitest + lint + next build, in the sandbox build copy) before commit.

## Ledger

### 1. OPS-007 + PERF-006 - Speed Insights / field CWV (shipped)

`@vercel/analytics` and `@vercel/speed-insights` are installed and both
components are mounted in `app/layout.tsx` (arrived via the merged Vercel PRs).
The previously-noted `@vercel/*` vs Vitest/Vite peer conflict no longer
reproduces - a clean `npm install` succeeds with no `.npmrc`, and Vitest still
runs (37 tests). So Speed Insights collects field CWV (LCP/CLS/INP) from real
visitors in production; the data accrues in the Vercel dashboard with traffic.
Flipped both FRs to shipped. No `.npmrc` needed; recorded that the conflict is gone.

### 2. CHAR-029 - genie proxy abuse hardening (substantial; stays planned)

`lib/genie/validate.ts` (new, unit-tested) holds the request validation:
shape/role checks, per-message (4000) + total (12000) size caps, control-char
stripping. `app/api/genie/route.ts` now uses it, adds a `Retry-After` header on
429, and prunes expired rate buckets. `lib/genie/persona.ts` gained an explicit
prompt-injection-resistance rule; the system prompt stays a separate block from
user turns. `tests/genie-validate.test.ts` (7 cases) is in the existing vitest
job (44 tests total). Remaining for full acceptance: a durable cross-instance
rate-limit store (Vercel KV / Upstash) - needs a datastore + secret, so the FR
stays planned. tsc/vitest/lint/build all green.

### 3. PERF-003 - asset + bundle size guard (shipped)

`scripts/check-asset-size.mjs` + `scripts/asset-budget.json` measure public
assets (per-image / per-GLB caps + total) and the built client JS total against
declared ceilings, exiting non-zero on a breach. Wired as `npm run check:assets`
and added to the CI build job after `next build`. Deterministic (file sizes), so
no flake. Current: public 95KB, client JS 2286KB across 43 chunks - within
budget. Flipped FR-PERF-003 to shipped; BACKLOG 50/1/42.

### 4. A11Y-005 (shipped) + A11Y-004 down-payment (stays planned)

A11Y-005: `components/genie/GenieStatusAnnouncer.tsx` adds a `.cs-visually-hidden`
`role="status" aria-live="polite"` region mirroring Lumi's state ("Lumi is
thinking / responding"), localised; a localised `<noscript>` note describes the
decorative scene; the canvas stays aria-hidden. Shipped.
A11Y-004: launcher buttons now carry `aria-haspopup="dialog"` + `aria-expanded`
(bound to open state); the dialog already does focus-in / focus-return / Escape
and is a correct non-modal (no trap). Stays planned - full acceptance needs a
manual Tab/Shift+Tab + focus-contrast pass (A11Y-008). BACKLOG 51/1/41.
