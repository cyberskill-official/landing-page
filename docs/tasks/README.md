# Implementing agent: read this first

You are about to run `ship-tasks` against this backlog. This file is the
five-minute brief. It exists because the queue, the contract and the gates in this
repo have a few sharp edges that will otherwise cost you a wasted task.

## 1. Pick

```
npm run check:frs      # prints the queue and gates the contract - run it first
```

It picks nothing for you; it tells you what is pickable. The workflow rule:

> the first `ready_to_implement` task with `owner: agent` whose every `depends_on` is `done`.

Three things follow, and all three are deliberate:

- **`owner: human` and `owner: mixed` tasks are not yours.** They hold accounts,
  credentials, client permissions and commercial decisions (the `BIZ` module, plus a
  few content tasks). If you find yourself needing a price range, a testimonial, a client
  name, a metric or an API key - stop. That input is an task, it is owned by Stephen, and
  the correct behaviour is to build the mechanism so it degrades gracefully without the
  input, never to invent the input. Every task in this state already has a clause saying
  what the absent-input state must do, and an AC that tests it.
- **No agent-owned task depends on a human-owned task.** That was checked (2026-07-11:
  0 stalls, 0 cycles). If you ever add such a dependency you have created a permanent
  stall - re-scope instead.
- **`on_hold` and `closed` tasks are skipped.** Do not resurrect one without an operator
  flip.

## 2. The contract

`.cyberos/cuo/templates/TASK-TEMPLATE.md`, and `docs/adrs/ADR-001-fr-contract.md` explains
why it is that one and not the plugin rubric's `task@1`. Five sections:

1. **Description (normative)** - numbered `1.N` clauses, each with a BCP-14 keyword.
   These are the promises. Implement all of them, not the ones that are convenient.
2. **Acceptance criteria** - each cites its clause (`AC for 1.N`) and names its
   verification (`test: \`name\`` or `evidence:`). This is the spine the gate enforces.
3. **Edge cases** - the ones the spec author could see. Find more.
4. **Out of scope** - do not drift into these. They are usually another task.
5. **Protected invariants** - the things a green gate must never be bought with. If a
   test only passes by weakening one of these, you have a fork: park the task, record it,
   move on. Do not weaken the invariant.

**Do NOT run the CyberOS plugin's `/task-audit` against these tasks.** It
audits a different contract and fails ~12 rules on every task here, including shipped
ones. `npm run check:frs` is the gate.

## 3. Build

Repo conventions that are enforced, not suggested (`AGENTS.md` §4 is normative):

- **HTML-first.** Every meaningful state is server-rendered DOM before WebGL boots. The
  canvas never owns LCP.
- **The keys stay server-side.** No `NEXT_PUBLIC_` secret, ever. The browser calls
  `/api/genie`; it never sees the Anthropic key.
- **EN and VN ship in the same commit.** Strings live in `lib/content/` and the
  dictionaries - never hardcoded in a component. A key present in EN and missing in VN
  is a build failure, not a fallback.
- **Tokens, not hex.** Colours derive from the `--cs-*` custom properties.
- **The performance budget is law.** `lighthouse/budget.json` and
  `scripts/check-asset-size.mjs`. If an task cannot fit the budget, that is a fork -
  record it, do not raise the budget.
- **The site is currently losing on mobile** (audit B, 10 Jul 2026: mobile perf 47 vs
  desktop 97, CLS 0.431, TBT 1,370 ms, ~900 KB JS). Every change you make is measured
  against that. Adding a client component to the home page is a decision, not a detail.

## 4. Verify

```
bash .cyberos/cuo/gates/run-gates.sh     # build + verify + check:assets, lint + typecheck + check:frs, tests
```

Tests are vitest, `tests/*.test.ts`, node environment. **An AC's `test:` name is a
contract, not a hint**: name the test so the AC's string appears in it, so the coverage
gate can trace clause -> AC -> passing test later. `evidence:` ACs (mostly `BIZ`) are
proved by a dated file under `docs/verification/`, not by a test.

Three gates need a running server and are not in the default chain - run them when the
task touches UI, and several tasks cite them explicitly:

```
npm run check:apca          # contrast on rendered translucent surfaces
npm run check:a11y:routes   # axe-core across every route, EN and VN
npx lhci autorun            # asserts CLS <= 0.1 (this is the metric currently failing)
```

## 5. Ship

- One task per branch: `auto/<fr-id-slug>`. Conventional commit with the task id in
  brackets: `feat(seo): restore word spacing in kinetic headings [TASK-SEO-010]`.
- **Never merge to main.** Push the branch, open the PR, let the preview build.
- **HITL is required and you do not cross it.** Two transitions need a recorded human
  verdict: `reviewing -> ready_to_test` and `testing -> done`. Bring the task up to each
  gate with the evidence and halt. You never set an task to `done` yourself
  (`.cyberos/cuo/STATUS-REFERENCE.md` §1.4).
- Update the task's `status:` and the BACKLOG row at every phase transition. `BACKLOG.md`
  is regenerated from the task frontmatter - the frontmatter is the source of truth.

## 6. Where the work came from

`docs/audits/2026-07-11/` holds the three audits every `improvement` task traces to
(`traces_to:` in the frontmatter): the deep audit + dual benchmark (A), the live mobile
Lighthouse benchmark against three competitors (B), and the crawl + remediation plan (C).
`MIGRATION-MAP.md` maps every finding to its task, and lists the findings that were
deliberately NOT turned into tasks and why. If a clause looks arbitrary, its evidence is
in there - read it before you argue with the spec.

## 7. The critical path

The three audits agree, and it is not the order of the module list:

1. **Prove the lead pipeline exists** - TASK-OPS-010, then TASK-BIZ-001/003 (Stephen). Every
   conversion task below is worthless while a submitted lead lands in a Vercel log line.
2. **Fix mobile** - TASK-PERF-007 (CLS 0.431; audit B says this one metric is worth 20-25
   performance points), TASK-PERF-008 (JS weight), TASK-WEB-011 (the 0.84 s root redirect).
3. **Get proof on the page** - TASK-CMS-011/012/013 and TASK-WEB-012 build the mechanisms;
   TASK-BIZ-006 (Stephen) supplies the permissions that fill them.
4. **Close the cheap search and answer-engine gaps** - TASK-SEO-010/011/012/017/019.
