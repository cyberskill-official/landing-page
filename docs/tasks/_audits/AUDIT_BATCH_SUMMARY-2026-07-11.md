---
audit_template_version: "fr_rubric@1.0"
rubric_version: "audit_rubric@2.0 (partial - see FORK-001)"
skill_id: "task-audit"
skill_version: "1.0.0"
last_audit_at: "2026-07-11"
scope: "the 67 tasks authored on 2026-07-11 from docs/audits/2026-07-11/"
overall_status: "needs_human"
next_action: "resume_after_hitl"
---

# task audit batch summary - 2026-07-11

The 67 new tasks were authored straight to `ready_to_implement`. Per `.cyberos/cuo/STATUS-REFERENCE.md` §1.1 that transition belongs to `task-audit` at 10/10. This file records what the gate could and could not check, and why it halted.

## FORK-001 - two task contracts disagree (blocks the full rubric)

The CyberOS **plugin** skill `task-audit` runs `audit_rubric@2.0`, which audits the **`task@1`** contract:

- frontmatter: `template: task@1`, `author: @handle`, `department`, `priority: p0|p1|p2|p3`, `created_at`, `ai_authorship`, `feature_type`, `eu_ai_act_risk_class`, `client_visible`
- sections: `## Summary` `## Problem` `## Proposed Solution` `## Alternatives Considered` `## Success Metrics` `## Scope` `## Dependencies` (rules SEC-001..009), plus conditional `## Customer Quotes`, `## Sales/CS Summary`, `## AI Risk Assessment`, `## AI Authorship Disclosure`

The CyberOS payload **vendored into this repo** (`.cyberos/` v0.1.0, built from cyberos@2cb5732) ships a different template at `.cyberos/cuo/templates/TASK-TEMPLATE.md`:

- frontmatter: `id`, `title`, `status`, `class`, `priority: MUST|SHOULD|COULD`, `depends_on`, `routed_back_count`, `awh`
- sections: `## 1. Description (normative)` `## 2. Acceptance criteria` `## 3. Edge cases` `## 4. Out of scope` `## 5. Protected invariants`

Every task in this repo - the 66 already shipped, the 35 retained, and the 67 new - is authored against the **vendored** template, and the `ship-tasks` workflow reads that shape (§1 clauses -> §2 ACs -> named tests). Running `audit_rubric@2.0` verbatim would fail FM-004, FM-102, FM-103, FM-105, FM-107, FM-108, FM-109, FM-111 and SEC-001..008 on **all 168 tasks**, including tasks that are shipped and live. That is a template mismatch, not a quality signal.

**Decision needed from the operator (one of):**

1. **Keep the vendored template** (recommended). It is what the workflow reads, what 101 tasks already use, and it is the leaner contract. Then the plugin's `task-audit` skill is the wrong gate for this repo, and the repo needs the rubric that matches `.cyberos/cuo/templates/TASK-TEMPLATE.md` (rules: frontmatter enum validity, clause/AC traceability, edge-case coverage, invariant presence).
2. **Adopt `task@1`** across the repo. That is a 168-file migration and a change to what `ship-tasks` parses. Only worth it if CyberOS is standardising every repo on that contract.
3. **Bridge**: keep the vendored body, add the `task@1` frontmatter fields the rubric needs. Cheapest path to a green plugin audit, but it leaves two section vocabularies in one file.

Until that is settled, the tasks stay `ready_to_implement` on the strength of the template-agnostic checks below, and the gate is recorded as **not fully run**.

## What was checked and passed (template-agnostic rules)

Run across all 168 task files (67 new, 35 retained, 66 archived):

| Rule | Check | Result |
|---|---|---|
| FM-001 | frontmatter fences exist and the YAML parses | pass (168/168) |
| FM-003 | no duplicate keys | pass |
| FM-104 | `status` is one of the 10 values in STATUS-REFERENCE §1 | pass (168/168) |
| - | `class` is `product` or `improvement` | pass |
| - | `priority` is a BCP-14 keyword | pass |
| - | `depends_on` resolves to a real task; no task depends on a `closed` one | pass (0 dangling) |
| - | no duplicate task ids; filename matches id | pass |
| - | BACKLOG.md row set == task file set | pass |
| SAFE-001/002 | no `untrusted_content` blocks (none used) | n/a |

Run across the 67 new tasks only (they use the numbered-clause shape TRACE-001..005 was written for):

| Rule | Check | Result |
|---|---|---|
| TRACE-001 | every numbered §1 clause is cited by at least one §2 AC | **pass** - 16 gaps found and fixed in this pass (see below) |
| TRACE-002 | every §2 AC names a verification (`test: \`name\`` or `evidence:`) | pass - 244/244 |
| - | every §1 clause carries a BCP-14 keyword | **pass** - 3 bare clauses ("EN and VN ship together.") rewritten normative |
| - | §3 edge cases, §4 non-goals, §5 protected invariants all non-empty | pass (67/67) |
| - | plain-keyboard characters only (no curly quotes, em dashes) | pass |

Totals: 258 normative clauses, 244 acceptance criteria, 3.9 clauses per task.

## Issues found and fixed in this pass

```
ISSUE
id:               ISS-001
rule_id:          TRACE-001
status:           fixed
severity:         error
evidence:         16 tasks had a §1 clause with no §2 AC citing it
description:      TASK-BIZ-001 (1.4), TASK-BIZ-002 (1.4), TASK-BIZ-003 (1.4), TASK-BIZ-006 (1.5),
                  TASK-BIZ-008 (1.4), TASK-BIZ-010 (1.5), TASK-BIZ-013 (1.4), TASK-BIZ-015 (1.4),
                  TASK-CMS-014 (1.4), TASK-CMS-015 (1.4), TASK-CMS-017 (1.4), TASK-CTA-015 (1.4),
                  TASK-CTA-017 (1.4), TASK-CTA-018 (1.3), TASK-SEO-011 (1.5), TASK-SEO-018 (1.4).
                  An uncited clause is exactly the failure TRACE-001 exists to catch: the
                  implementer passes every declared test while quietly missing a normative promise.
suggestion:       add the missing AC, each naming its verification
auto_fix_applied: true
```

```
ISSUE
id:               ISS-002
rule_id:          TRACE-001 (BCP-14 keyword)
status:           fixed
severity:         error
evidence:         TASK-CMS-014 1.4, TASK-CMS-017 1.4, TASK-CTA-017 1.4 read "EN and VN ship together."
description:      a clause with no SHALL/MUST/SHOULD/MAY is not normative and cannot be traced.
suggestion:       rewrite as "... SHALL ship EN and VN in the same commit."
auto_fix_applied: true
```

```
ISSUE
id:               ISS-003
rule_id:          TRACE-003
status:           wontfix
severity:         error
evidence:         §2 ACs name tests (e.g. `lighthouse:mobile-cls`) that do not exist on disk
                  and are not listed in a frontmatter `new_files` field.
description:      TRACE-003 requires every named test to resolve to a file on disk or appear in
                  `frontmatter.new_files`. These tasks are pre-implementation: the tests are the
                  deliverable, not a prerequisite. The vendored TASK-TEMPLATE has no `new_files`
                  field, so TRACE-003 as written cannot be satisfied by any unimplemented task in
                  this repo.
suggestion:       resolve under FORK-001. If the vendored template is kept, TRACE-003 should
                  apply from `implementing` onward, not at `draft -> ready_to_implement`.
auto_fix_applied: false
```

```
ISSUE
id:               ISS-004
rule_id:          FM-004, FM-102, FM-103, FM-105, FM-107..111, SEC-001..008
status:           needs_human
severity:         error
category:         scope_decomposition
evidence:         168/168 tasks use the vendored TASK-TEMPLATE, not task@1
description:      see FORK-001 above. Not a defect in the tasks.
suggestion:       operator picks option 1, 2 or 3 in FORK-001.
auto_fix_applied: false
```

## Verdict

```
SUMMARY
verdict:         needs_human
issues_total:    4
issues_open:     0
issues_human:    1   (FORK-001 / ISS-004)
issues_fixed:    2
issues_wontfix:  1
next_action:     resume_after_hitl
```

The 67 tasks are structurally sound against every rule that applies to the contract they were written for. The gate cannot certify 10/10 under `audit_rubric@2.0` until FORK-001 is decided, and the agent will not mass-rewrite 168 tasks onto a different contract without that decision.
