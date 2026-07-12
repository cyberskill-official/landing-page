---
id: FR-OPS-010
title: "Alert when every lead sink fails, and prove the pipeline weekly with a synthetic lead"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: [FR-OPS-006]
routed_back_count: 0
awh: N/A
traces_to: [growth/LEAD-03, growth/LEAD-04, audit-A/section-9]
---

# FR-OPS-010: Alert when every lead sink fails, and prove the pipeline weekly with a synthetic lead

## 0. Why (evidence)

app/api/lead/route.ts fans out best-effort to four sinks (JSONL file, Resend, Slack, CyberOS webhook) and always returns
ok:true to the visitor. The file sink always fails on Vercel's read-only filesystem and the other three no-op until their
env vars exist - so a fully dead lead pipeline is invisible today. Every conversion FR in this backlog is worthless if the
leads it wins land in a black hole.

## 1. Description (normative)

- 1.1 After the fan-out, the route SHALL count rejected sinks against configured sinks (a sink with no env var is skipped, not failed).
- 1.2 When every configured sink fails, or when zero sinks are configured in production, the route SHALL report the failure to the error tracker (FR-OPS-006) with the per-sink reasons, while keeping the ok:true response to the visitor.
- 1.3 A scheduled CI job SHALL POST a synthetic lead to production weekly; a synthetic lead SHALL skip the CRM forward and be tagged so it cannot pollute the real pipeline.
- 1.4 A failing synthetic run SHALL notify the owner.

## 2. Acceptance criteria

- [x] AC for 1.1 - a skipped (unconfigured) sink is not counted as a failure - test: `lead/sink-accounting`
- [x] AC for 1.2 - with all sinks mocked to reject, the tracker is called and the response stays ok:true - test: `lead/total-failure-alert`
- [x] AC for 1.3 - zero configured sinks in production triggers the alert - test: `lead/total-failure-alert`
- [x] AC for 1.4 - a synthetic lead skips the CRM forward and carries the tag - test: `lead/synthetic-path`
- [x] AC for 1.5 - the weekly workflow exists and fails loudly on a non-2xx - test: `ci/synthetic-lead-workflow`

## 3. Edge cases

- A visitor must never see an error because a sink is down.
- The synthetic lead must not trigger the auto-acknowledgement email (FR-CTA-011) to a real address.
- Rate limiting must not block the weekly synthetic POST.

## 4. Out of scope / non-goals

- Deploying the CyberOS intake (FR-BIZ-002).

## 5. Protected invariants this FR must not weaken

- A submitted lead is never silently lost.
- AGENTS.md §4.2: the Anthropic key lives only in server env; no NEXT_PUBLIC_ secret, ever.
