# DNS Setup — CyberSkill.world

Status: ready for launch operator. Live DNS cutover is pending.

## Records

During launch week set TTL to 300 seconds.

| Host | Type | Target | Notes |
|---|---|---|---|
| `cyberskill.world` | A / ALIAS | Vercel apex target | Use the target shown in the Vercel project dashboard. |
| `www.cyberskill.world` | CNAME | Vercel `cname.vercel-dns.com` target | Redirects to apex by `apps/web/vercel.json`. |

After 24 hours of stable production traffic, raise TTL to 3600 seconds.

## Verification

```bash
dig +short cyberskill.world
dig +short www.cyberskill.world
curl -I https://cyberskill.world
curl -I https://www.cyberskill.world
```

Expected:

- Apex resolves to Vercel.
- `www` redirects to `https://cyberskill.world/...`.
- TLS certificate is valid.
- `Strict-Transport-Security` includes `max-age=31536000; includeSubDomains; preload`.

## HSTS Preload

Do not submit HSTS preload until HTTPS has been stable for at least two weeks. Removing a domain from browser preload lists is slow.

## Rollback

- Preferred: re-alias the previous Vercel deployment.
- DNS fallback: revert apex target while TTL remains 300 seconds.
