# FR-BIZ-003 — Production lead pipeline e2e evidence (2026-07-15)

**Status:** partial — configured sinks proved for Resend-only production; open items below.  
**Configured sinks (production, 2026-07-15):** Resend email to `info@cyberskill.world` + visitor ack.  
**Not configured (intentional):** Slack (`LEAD_SLACK_WEBHOOK_URL` unset), CyberOS CRM webhook (FR-BIZ-002 deferred).  
**Code:** CRM webhook optional; fail-closed on `RESEND_API_KEY` only (`app/api/lead/route.ts`).

## Configured-sink interpretation

FR §1.2 says “every configured sink.” Unconfigured optional sinks (Slack, CyberOS) are **out of scope for this proof** until BIZ-002. BIZ-001 evidence: `docs/verification/fr-biz-001-lead-sinks-2026-07-15.md`.

## Submissions observed (operator screenshots / session)

| # | Path | Locale | Source tag | Internal email (`info@`) | Visitor ack | Timestamp (UTC) | Operator confirm |
|---|---|---|---|---|---|---|---|
| A | Teardown classic form | en | teardown | yes — “New lead: Stephen Cheng (project)” | yes — Resend ack | 2026-07-15T10:54:11.870Z | **yes** (operator 2026-07-15) |
| B | Lumi wish flow | en | lumi-chat | yes — “New lead: Test user (project)” + transcript | yes — From CyberSkill / reply-to info@ | 2026-07-15T12:06:01.511Z | **yes** (operator 2026-07-15) |
| C | Contact form or teardown | vi | ? | ☐ pending | ☐ pending | | ☐ do now |

### A — Teardown (en)

- UI: success “Teardown requested” (pre–success-panel polish; pipeline still 200).
- Body included URL `https://cyberskill.world`, message “I want to improve UI”, email `zintaen@gmail.com`.

### B — Lumi chat (en)

- Flow: name → email → company → wish → consent chips.
- Internal mail: transcript present; source `en/lumi-chat`.
- Ack to visitor mailbox; **Reply-To** should be `info@cyberskill.world` (code path). Operator: ☐ reply to ack reached inbox.

## AC mapping

| AC | Status |
|---|---|
| 1.1 Three paths (form, Lumi, /vi) | **partial** — form teardown + Lumi done; **/vi still open** |
| 1.2 Every *configured* sink | **met for Resend** (internal + ack); Slack/CRM N/A unset |
| 1.3 Reply-To round trip | **needs operator tick** (reply to ack #B) |
| 1.4 Evidence file committed | **this file** |

## Operator residual checklist (finish BIZ-003)

1. [ ] Submit one lead on **https://cyberskill.world/vi** (contact or teardown); paste timestamp + “mail arrived” here.  
2. [ ] Reply to visitor ack from submission B; confirm thread lands on `info@` or your monitored mailbox.  
3. [ ] Optional: delete/test-label test leads so inbox stays clean.  
4. [ ] HITL: when residual rows are done, operator may set FR-BIZ-003 → `done` (agent must not).

## Notes for later CyberOS (excluded this goal)

When BIZ-002 is live, re-run one submission and attach CyberOS row id to a new dated evidence file.
