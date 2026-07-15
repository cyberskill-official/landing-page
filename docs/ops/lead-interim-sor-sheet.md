# Interim lead system of record (sheet)

**TASK-BIZ-009 §1.1** — use this until CyberOS e2e (TASK-BIZ-002 / TASK-BIZ-003) is green, then retire the sheet after dual-write migration (TASK-OPS-020).

## Columns (one row per lead)

| Column | Example | Notes |
|---|---|---|
| received_at | 2026-07-14T10:00:00Z | From lead payload / email |
| name | Anh Nguyen | |
| email | anh@example.com | |
| company | Acme | optional |
| intent | project \| partnership \| careers \| other | From form |
| source | contact \| teardown \| lumi-chat \| partnership | |
| locale | en \| vi | |
| status | new \| contacted \| proposal \| won \| lost | Operator-owned |
| next_action_at | 2026-07-15 | Date of next human action |
| track | sales \| partner \| talent \| triage | See routing map below |
| first_reply_at | 2026-07-14T14:00:00Z | For median SLA |
| notes | … | Free text |
| utm_source / medium / campaign | | From payload when present |

## Intent → track map (TASK-BIZ-009 §1.2)

| intent | track |
|---|---|
| project | sales |
| partnership | partner |
| careers | talent |
| other | triage |

## Weekly 15-minute review (TASK-BIZ-009 §1.3)

Log under `docs/ops/funnel-reviews/` (create as needed):

1. Leads by source (count)  
2. Status moves this week  
3. Median first-reply time vs one-business-day promise  
4. One note: what changed  

## Done when (retire sheet)

- [ ] Production lead appears in CyberOS (TASK-BIZ-003)  
- [ ] Dual-write + migration dry-run complete (TASK-OPS-020)  
- [ ] Sheet marked archived; CyberOS is sole SoR for status/next_action  
