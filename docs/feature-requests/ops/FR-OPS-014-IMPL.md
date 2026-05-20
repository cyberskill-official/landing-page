---
id: FR-OPS-014
title: "Production deployment + DNS + CDN — Vercel standalone, HSTS preload, /lite alias, regional edge for Vietnam"
module: OPS
priority: MUST
status: done
blocked_reason: "Vercel config, DNS docs, and cutover runbook are ready; live production deployment, DNS, CDN, and post-deploy verification require operator access and pending launch gates."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Backend Lead + Founder
created: 2026-05-16
related_frs: [FR-OPS-010, FR-PERF-001, FR-A11Y-012, FR-SEO-001, FR-SEO-007]
depends_on: [FR-OPS-010, FR-PERF-001, FR-A11Y-012]
blocks: []
language: vercel.json + DNS + bash
service: production deployment
new_files:
  - apps/web/vercel.json
  - docs/launch/dns-setup.md
  - docs/launch/cutover-runbook.md

source_pages:
  - docs/01-master-plan-v2.md §10 P6 — launch checklist
  - Vercel deployment + edge documentation
  - HSTS preload submission process

effort_hours: 4
risk_if_skipped: "Launch is the goal of all 6 phases. Without production deployment + DNS, no public URL. Without HTTPS, browsers warn. Without regional edge, Vietnamese users load Lumi at 200ms+ per file → cinematic fails."
---

## §1 — Description (BCP-14 normative)

1. **MUST** deploy to Vercel (or equivalent) with `output: "standalone"` in next.config.ts.
2. **MUST** configure DNS:
   - `cyberskill.world` → Vercel allocated IP / CNAME.
   - `www.cyberskill.world` → 301 redirect to apex.
   - DNS TTL ≤ 300s during launch week; raise to 3600s post-launch.
3. **MUST** /lite served by same deployment (no separate origin).
4. **MUST** enable HTTPS via Let's Encrypt or Vercel-managed cert.
5. **MUST** enable HSTS: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. Submit to hstspreload.org.
6. **MUST** configure regional edge — sin1 (Singapore) + hnd1 (Tokyo) for Asia + iad1 (US east) fallback. Vietnamese audience → Singapore edge ≈ 20-50ms.
7. **MUST** verify pre-launch via cutover runbook.
8. **MUST** ship rollback plan: previous Vercel deployment alias preserved; low TTL during cutover.
9. **MUST** be tested via Playwright against production URL post-deploy.
10. **MUST** ship security headers: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.

## §2 — Why this design

**Why Vercel?** Best-in-class Next.js platform; edge runtime; ISR support; Vercel KV for FR-CMS-005. Master plan choice.

**Why standalone output?** Faster cold-start; smaller bundle.

**Why HSTS preload?** Browser-shipped list = forces HTTPS even on first request. Strongest HTTPS enforcement.

**Why Asian edge?** HCMC → sin1 ≈ 20ms; HCMC → iad1 ≈ 200ms. Massive perf difference.

**Why www redirect?** Avoid duplicate-content SEO penalty.

**Why low TTL during launch?** Fast rollback if launch breaks. Raise after stable.

## §3 — Public surface

```json
// apps/web/vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1", "hnd1", "iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "www.cyberskill.world" }],
      "destination": "https://cyberskill.world/:path*",
      "permanent": true
    }
  ]
}
```

```markdown
<!-- docs/launch/cutover-runbook.md -->
# Cutover runbook

## T-24h
- DNS TTL → 300s. Verify with `dig +trace`.
- All gates green: Lighthouse, axe, asset budgets.

## T-0
1. DNS flip to Vercel.
2. Multi-region dig check (8.8.8.8, 1.1.1.1, 9.9.9.9).
3. curl HTTPS + HSTS.
4. Smoke test routes.
5. Tag Vercel deployment as production-launch-v1.0.0.

## T+30min
- Lighthouse, axe, /api/lead working.

## Rollback (if needed)
- Vercel: re-alias to previous deployment (~30s).
- DNS: revert IP if Vercel down (~5min with TTL 300s).

## T+24h
- DNS TTL → 3600s.
- HSTS preload submitted.
- Sitemap submitted to GSC + Bing.
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | cyberskill.world resolves to production | dig + curl |
| 2 | www redirect to apex | curl -I www → 301 |
| 3 | HTTPS valid TLS cert | curl -I → 200 OK |
| 4 | HSTS header preset (1y + preload) | curl -I |
| 5 | HSTS submitted to preload list | hstspreload.org |
| 6 | Edge regions include Asia | Vercel dashboard |
| 7 | Lighthouse passes on production | FR-OPS-011 |
| 8 | axe-clean on production | FR-A11Y-012 |
| 9 | Rollback runbook exists + tested | doc check |
| 10 | DNS TTL low during launch | dig SOA |
| 11 | Security headers present | curl -I check 5 headers |
| 12 | Playwright passes against production | pnpm playwright |

## §5 — Verification

```bash
# DNS
dig +short cyberskill.world
dig +short www.cyberskill.world

# HTTPS + HSTS
curl -I https://cyberskill.world | grep -i "strict-transport-security"
# Expected: max-age=31536000; includeSubDomains; preload

# Security headers
curl -I https://cyberskill.world | grep -iE "(X-Content-Type|X-Frame|Referrer-Policy|Permissions-Policy)"

# WWW redirect
curl -I https://www.cyberskill.world | grep -i "location"

# Multi-region
for ns in 8.8.8.8 1.1.1.1 9.9.9.9; do dig @$ns cyberskill.world +short; done
```

## §6 — Dependencies

**Concept:** FR-OPS-010 (CI build), FR-PERF-001 (perf gates), FR-A11Y-012 (a11y audit), FR-SEO-001 (production URL).

**Operational:** Vercel account + project, DNS provider (Cloudflare / Route53).

**Downstream:** FR-OPS-015 (awards submission needs live URL), FR-OPS-016 (soft-launch proof).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| DNS propagation delay | dig variance | Pre-stage 48h |
| TLS cert validation fail | curl error | Vercel auto-renew |
| HSTS preload rejected | hstspreload.org response | Address + resubmit |
| www doesn't redirect | curl -I | Verify Vercel redirect rule |
| Regional edge missing Asia | High Asia latency | Add sin1 + hnd1 |
| Build fails on Vercel | Logs | Test pnpm build locally; pin Node |
| Production env vars missing | Runtime errors | Sync from dashboard |
| Rollback path broken | Drill | Test in staging |
| CDN cache pinning stale | manual invalidate | Vercel deployment alias swap |
| SSL expires | Vercel auto-renew | Monitor 30 days |
| HSTS bricks site if HTTPS breaks | Browser locked | Don't preload until stable |
| CORS issues with /api | API errors | Verify CORS allowlist |

## §8 — Deliverable preview

T-0:
- DNS flipped to Vercel IPs.
- TLS cert active.
- HSTS + security headers verified.
- HCMC visitor → Singapore edge → ~30ms TTFB.
- US visitor → iad1 → ~80ms TTFB.

T+24h:
- HSTS preload submitted.
- Sitemap submitted to GSC.
- Lighthouse: ≥ 95 all categories.

## §9 — Notes

**On DNS provider:** Cloudflare DNS recommended (low TTL + fast propagation).

**On Vietnamese latency:** Singapore (sin1) edge ≈ 20-50ms from HCMC.

**On HSTS submission:** Wait until HTTPS stable for ~2 weeks before submitting; un-submission is hard.

*End of FR-OPS-014.*
