# Production Cutover Runbook

Status: ready for launch operator. Live cutover is pending.

## T-24 Hours

- Set DNS TTL to 300 seconds.
- Confirm Vercel production deployment builds from the intended branch.
- Confirm production environment variables are present.
- Run typecheck, unit tests, Lighthouse CI, axe gate, sitemap, and robots checks.
- Snapshot the previous successful deployment URL for rollback.

## T-0 Cutover

1. Point `cyberskill.world` to Vercel.
2. Point `www.cyberskill.world` to the Vercel CNAME target.
3. Confirm apex HTTPS:

   ```bash
   curl -I https://cyberskill.world
   ```

4. Confirm `www` redirect:

   ```bash
   curl -I https://www.cyberskill.world
   ```

5. Confirm security headers:

   ```bash
   curl -I https://cyberskill.world | grep -iE "strict-transport-security|x-content-type-options|x-frame-options|referrer-policy|permissions-policy"
   ```

6. Smoke test `/`, `/vi`, `/lite`, `/accessibility`, `/work`, `/capabilities`, `/team`, `/careers`, `/sitemap.xml`, and `/robots.txt`.

## T+30 Minutes

- Run production Lighthouse.
- Run production axe smoke.
- Confirm `/api/analytics` returns `202` for a valid event.
- Confirm no Vercel runtime errors.

## Rollback

- Re-alias the previous Vercel deployment.
- If Vercel itself is degraded, revert DNS while TTL is still 300 seconds.
- Keep the incident note in `docs/launch/`.

## T+24 Hours

- Raise DNS TTL to 3600 seconds if stable.
- Submit sitemap to Google Search Console and Bing Webmaster Tools.
- Schedule HSTS preload submission only after two stable HTTPS weeks.
