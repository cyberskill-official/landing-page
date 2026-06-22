# DEC: Production launch on Vercel at cyberskill.world

- Date: 2026-06-22
- Status: accepted
- Modules: OPS
- Deciders: Stephen Cheng (operator)

## Context

After the build-verified + live-audited + enhanced state, the site was ready to
ship. The operator chose Vercel (per the deploy runbook) and the existing custom
domain.

## Decision

Deployed via the Vercel CLI (`vercel` then `vercel --prod`) into the project
`cyberskill-official/landing-page`, and pointed the custom domain. The official
site is now https://cyberskill.world. `NEXT_PUBLIC_SITE_URL` is left unset, which
is correct because it defaults to `company.url = https://cyberskill.world`, so
canonical, hreflang, sitemap, and OG all resolve to the live domain.

## Consequences

- The site is live and SEO-correct (verified: robots.txt `Host` and sitemap both
  point to https://cyberskill.world).
- `ANTHROPIC_API_KEY` is not yet set in production, so Lumi serves the
  contact-form fallback by design. Add it in Vercel env + redeploy to enable chat.
- GitHub must become the source of truth: push the branch and fast-forward `main`
  so the Vercel Git integration matches the live deployment.
- Still open: the commissioned Lumi GLB (FR-CHAR-021).

## Related

[[FR-OPS-001-ci-perf-gate]] [[FR-SEO-001-discoverability]]
