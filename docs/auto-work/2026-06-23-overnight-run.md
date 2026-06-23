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
