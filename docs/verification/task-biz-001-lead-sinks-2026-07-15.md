# TASK-BIZ-001 evidence — lead sinks (2026-07-15)

## Operator decisions

- **Resend email** is the configured human notification path.
- **Slack is not used** by choice: CyberOS provides the internal chat/notification module (see TASK-BIZ-002 / BIZ-016 for CRM SoR). `LEAD_SLACK_WEBHOOK_URL` remains unset deliberately (spec §1.3 is optional).

## Vercel production env (operator screenshot, prior turn)

| Variable | Present |
|---|---|
| `RESEND_API_KEY` | yes (Sensitive, Production and Preview) |
| `LEAD_EMAIL_FROM` | yes (`info@cyberskill.world`, Production and Preview) |
| `LEAD_SLACK_WEBHOOK_URL` | no (intentional) |
| `LEAD_CRM_WEBHOOK_URL` / `LEAD_CRM_TOKEN` | no (deferred to TASK-BIZ-002) |

## DNS for cyberskill.world (operator Cloudflare/DNS UI + dig 2026-07-15)

| Check | Result |
|---|---|
| SPF root TXT | `v=spf1 mx a ip4:139.180.158.237 include:amazonses.com ~all` |
| DMARC | `v=DMARC1; p=none;` at `_dmarc.cyberskill.world` |
| Resend DKIM | `resend._domainkey.cyberskill.world` TXT public key present |
| Resend links | `links.cyberskill.world` CNAME → `links1.resend-dns.com` |
| Send subdomain SPF | `send.cyberskill.world` TXT `v=spf1 include:amazonses.com ~all` |
| Send MX | `send.cyberskill.world` MX → Amazon SES feedback SMTP |

DNS UI: “Recommendations — All set / No recommendations.”

## AC mapping

| AC | Status |
|---|---|
| 1.1 Resend domain DNS (SPF/DKIM/DMARC) | **met** — dig + operator DNS screenshot |
| 1.2 Env in Vercel production, not client bundle | **met** — `RESEND_API_KEY` Sensitive server-side; `ci/no-public-secrets` |
| 1.3 Slack | **N/A** — not wanted; CyberOS chat |
| 1.3 / evidence path for email | Test send still recommended (ties to TASK-BIZ-003) |
| 1.4 Redeploy after env | Operator responsibility when changing keys |

## Status

TASK-BIZ-001 advanced to **done** under operator attestation of env + DNS evidence; Slack explicitly declined.
