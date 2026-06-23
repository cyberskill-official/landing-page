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
