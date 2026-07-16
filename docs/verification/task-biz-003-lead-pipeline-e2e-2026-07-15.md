# TASK-BIZ-003 — Production lead pipeline e2e evidence (2026-07-15)

**Status:** partial — configured sinks proved for Resend-only production; open items below.  
**Configured sinks (production, 2026-07-15):** Resend email to `info@cyberskill.world` + visitor ack.  
**Not configured (intentional):** Slack (`LEAD_SLACK_WEBHOOK_URL` unset), CyberOS CRM webhook (TASK-BIZ-002 deferred).  
**Code:** CRM webhook optional; fail-closed on `RESEND_API_KEY` only (`app/api/lead/route.ts`).

## Configured-sink interpretation

task §1.2 says “every configured sink.” Unconfigured optional sinks (Slack, CyberOS) are **out of scope for this proof** until BIZ-002. BIZ-001 evidence: `docs/verification/task-biz-001-lead-sinks-2026-07-15.md`.

## Submissions observed (operator screenshots / session)

| # | Path | Locale | Source tag | Internal email (`info@`) | Visitor ack | Timestamp (UTC) | Operator confirm |
|---|---|---|---|---|---|---|---|
| A | Teardown classic form | en | teardown | yes — “New lead: Stephen Cheng (project)” | yes — Resend ack | 2026-07-15T10:54:11.870Z | **yes** (operator 2026-07-15) |
| B | Lumi wish flow | en | lumi-chat | yes — “New lead: Test user (project)” + transcript | yes — From CyberSkill / reply-to info@ | 2026-07-15T12:06:01.511Z | **yes** (operator 2026-07-15) |
| C | Lumi or form on /vi | vi | (operator) | yes — operator confirmed “worked” | yes (implied) | 2026-07-15 (operator) | **yes** |

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
| 1.1 Three paths (form, Lumi, /vi) | **met for operator-confirmed paths** — en form, en Lumi, vi confirmed |
| 1.2 Every *configured* sink | **met for Resend** (internal + ack); Slack/CRM N/A unset |
| 1.3 Reply-To round trip | **met** — operator residual checklist 1–5 done (2026-07-15) |
| 1.4 Evidence file committed | **this file** |

## Operator residual checklist (finish BIZ-003)

1. [x] /vi lead — operator confirmed 2026-07-15.  
2. [x] Reply-To / residual 1–5 — operator confirmed done 2026-07-15.  
3. [ ] Optional: delete/test-label test leads so inbox stays clean.  
4. [ ] HITL: operator may set TASK-BIZ-003 → `done` when satisfied (agent must not).

## Notes for later CyberOS (excluded this goal)

When BIZ-002 is live, re-run one submission and attach CyberOS row id to a new dated evidence file.
