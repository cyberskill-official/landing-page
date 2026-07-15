# ADR-001: the task contract for this repository

- Status: accepted
- Date: 2026-07-11
- Decides: FORK-001, raised in `docs/tasks/_audits/AUDIT_BATCH_SUMMARY-2026-07-11.md`
- Deciders: Stephen Cheng (operator), agent (proposer)

## Context

Two CyberOS artefacts disagree about what a Task is.

1. **The vendored payload** in this repo (`.cyberos/` v0.1.0, built from cyberos@2cb5732)
   ships `.cyberos/cuo/templates/TASK-TEMPLATE.md`: frontmatter `id / title / status /
   class / priority (MUST|SHOULD|COULD) / depends_on / routed_back_count / awh`, body
   `## 1. Description (normative)` -> `## 2. Acceptance criteria` -> `## 3. Edge cases`
   -> `## 4. Out of scope` -> `## 5. Protected invariants`. This is what
   `.cyberos/cuo/ship-tasks.md` reads: numbered §1 clauses, each traced to an
   AC, each AC naming a test.

2. **The CyberOS Claude plugin's** `task-audit` skill runs `audit_rubric@2.0`,
   which audits a different contract, `task@1`: frontmatter `template / author /
   department / priority (p0..p3) / created_at / ai_authorship / feature_type /
   eu_ai_act_risk_class / client_visible`, body `## Summary` / `## Problem` /
   `## Proposed Solution` / `## Alternatives Considered` / `## Success Metrics` /
   `## Scope` / `## Dependencies` (+ conditional AI-Act and customer-quote sections).

Every task in this repository - 66 shipped and live, 35 retained, 67 authored on
2026-07-11 - uses contract (1). Running rubric (2) verbatim fails ~12 rules on all 168
files, including tasks whose code is in production. That is a template mismatch, not a
quality signal, and "fixing" it by rewriting 168 files would break the workflow that
actually drives the build.

## Decision

**This repository's task contract is the vendored `TASK-TEMPLATE.md` (option 1).** Reasons,
in order of weight:

1. It is what `ship-tasks` parses. Changing the contract without changing the
   workflow would break the build loop, not improve it.
2. 101 tasks already use it, 66 of them shipped. The contract has been exercised.
3. It is the leaner contract, and its traceability spine (clause -> AC -> named test) is
   the part that has actually caught defects here: the 2026-07-11 audit found 16 tasks with
   a normative clause that no acceptance criterion covered.
4. `task@1`'s extra fields (department, EU AI Act risk class, customer quotes,
   sales/CS summary) are product-org apparatus. This repo is one marketing site with one
   operator; those fields would be ceremony, not signal.

## Consequences

- The plugin's `task-audit` skill is **not** the gate for this repo. Do not run
  `audit_rubric@2.0` against these tasks and do not act on its FM-*/SEC-* failures - they are
  the mismatch, not defects.
- The gate is instead `npm run check:frs` (`scripts/check-frs.mjs`), which enforces the
  vendored contract mechanically: frontmatter enums, status/class/owner/priority validity,
  `depends_on` resolution, BACKLOG parity, and - for every `ready_to_implement` task - the
  five required sections plus clause -> AC -> named-test traceability. It runs in CI.
- The rubric rules that ARE contract-agnostic are ported into that script: FM-001, FM-003,
  FM-104, TRACE-001, TRACE-002. TRACE-003 (every named test resolves to a file on disk or a
  `new_files` entry) is deliberately **not** enforced at `ready_to_implement` - for an
  unimplemented task the tests are the deliverable. It should be enforced from `implementing`
  onward; that belongs to the coverage gate, not the spec gate.
- The 19 pre-2026-07 tasks still in the queue were written to an older in-repo shape
  (`## §1 Requirement` / `## §2 Acceptance` / `## §3 Evidence`) with acceptance bullets that
  named no tests. They were rewritten to the contract on 2026-07-11 so the whole queue is
  uniform and gate-green.

## Upstream follow-up (not this repo)

The disagreement is a defect in the CyberOS distribution, not in this project: the pack
ships a template that its own audit skill rejects. Every repo that runs `cyberos:init` and
then `/task-audit` will hit it. The fix belongs upstream - either the plugin's
rubric learns the `TASK-TEMPLATE.md` shape, or the pack stops shipping a template its gate
cannot read. File it against cyberos as an improvement task (`class: improvement`) referencing
this ADR.
