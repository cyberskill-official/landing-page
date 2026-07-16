# Review packet — TASK-BIZ-013

**Status:** `ready_to_review` (HITL: human review acceptance required before `ready_to_test`)  
**Class:** improvement  
**Owner override:** operator supplied owner-approved commercial decisions; agent recorded them as SSOT.

## Scope delivered

| Artefact | Path |
|---|---|
| Commercial policy SSOT | `lib/content/policy.ts` |
| AC-named unit tests | `tests/commercial-policy.test.ts` |
| Decision-history evidence (AC 1.4) | `docs/verification/task-biz-013-decision-history.md` |
| Spec / BACKLOG status | `ready_to_review` |

**Explicit non-goals (unchanged):** no UI for TASK-CTA-015/017/018 or TASK-CMS-014/019/020.

## §1 → AC → test mapping

| §1 clause | AC | Proof |
|---|---|---|
| 1.1 Record outcome promise, engagement models (name/range/timeline), capacity, registration, partnership offer, hero audience | AC 1.1 | `content/commercial-policy-record` — asserts every field on shipped `commercialPolicy` matches owner payload (EN+VI), `decidedOn: 2026-07-14`, `reviewCadence: quarterly`, registration `0316489568`, capacity `3` / Q4 2026 |
| 1.2 Each decision has decided-on date + review cadence; dependents must read the record | AC 1.2 | `content/no-placeholders` — no TBD/TODO/placeholder/empty strings in the shipped record |
| 1.3 No dependent may ship placeholder / agent-invented values; stale decisions block render | AC 1.3 | `content/capacity-line` — `isPolicyPublishable` / `isPolicyStale` on real helpers: within cadence → usable; past cadence → blocked |
| 1.4 Cannot-keep decisions changed/withdrawn, never softened | AC 1.4 | `commercialPolicyHistory` + `isDecisionPublishable`; evidence `docs/verification/task-biz-013-decision-history.md`; test proves withdrawn field is not publishable |

## Machine gates

- AC-named tests: pass (run twice for consistency)
- Full suite: 220 tests pass
- `bash .cyberos/cuo/gates/run-gates.sh`: **GREEN** (build, lint, test)

## Reviewer checklist

1. Confirm owner-approved payload in `lib/content/policy.ts` matches the commercial decisions the owner intended.
2. Confirm freshness helpers are pure and suitable for dependents to gate rendering.
3. Confirm history model supports withdraw/change without soft copy.
4. Record human review verdict to advance `reviewing → ready_to_test` (agent will not self-cross).

## HITL halt

Agent stops here. Next human actions:

1. Review acceptance → `ready_to_test`
2. (Later) Final acceptance after testing → `done` — agent never sets `done`
