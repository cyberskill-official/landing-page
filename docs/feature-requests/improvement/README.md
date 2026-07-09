# Improvement program for cyberskill.world

This folder turns the growth audit (docs/growth/landing-audit-2026-07-06.md) into an executable backlog. It is designed for a loop where an AI agent implements, a human (Stephen) reviews and merges, and both keep the same two files honest: BACKLOG.md for state, LEDGER.md for evidence.

## Files

- BACKLOG.md - master index of all tasks: ID, wave, owner, effort, dependencies, status. The single source of truth for state.
- LEDGER.md - append-only evidence log. One entry per finished task: commit, gates run, how it was verified.
- PROMPT.md - copy-paste prompts: one to trigger an agent implementation wave, one to run the human review.
- tasks/01-lead-pipeline.md through tasks/09-copy-fixes.md - detailed specs per epic. Each task carries acceptance criteria an agent can execute against.

## Task states

- todo - specified, not started.
- needs-input - blocked on something only Stephen can provide (listed in BACKLOG.md under "Inputs Stephen owes").
- in-progress - an agent is on it in the current wave.
- built - implemented and gate-green on the wave branch, awaiting human review.
- verified - proven working (test, preview, or production evidence recorded in LEDGER.md).
- done - merged to main and live.
- deferred - consciously parked; reason noted on the task.

## Owners

- agent - an AI agent can finish this alone in the repo.
- human - only Stephen can do it (accounts, env vars, permissions, sending email).
- mixed - agent builds everything buildable; Stephen supplies an input or performs the external step. Mixed tasks state exactly which part is whose.

## Waves

Wave 1 is the week-one batch (the lead pipeline and cheap high-return fixes), wave 2 the month-one batch (proof, nurture foundations), wave 3 the quarter batch (content engine, programs, rituals). An agent wave run picks every task with `wave <= current`, `owner` agent or mixed with inputs present, dependencies met, and status todo.

## Rules that apply to every task

1. EN/VI parity: any user-facing copy ships in both locales in the same commit. Copy lives in lib/content/ and the dictionaries; do not hardcode strings in components.
2. Budgets are law: the Lighthouse CI budgets (script 320 KB, total 1.2 MB, CLS 0.1) must stay green. If a task cannot fit the budget, stop and record the fork in LEDGER.md.
3. Secrets are env-gated: no key or webhook URL in code. New env vars get documented in the task's ledger entry and in .env.example if present.
4. No new runtime dependencies without a ledger note explaining why and the size cost.
5. One commit per task, conventional message, task ID in brackets: `feat(contact): thank-you state with next steps [CONV-03]`.
6. Never merge to main; wave branches (auto/growth-w1, auto/growth-w2, ...) are pushed for Vercel preview and reviewed by Stephen.
7. Gates before any status becomes built: `npm run typecheck && npm run lint && npm run test && npm run build`, plus `npm run check:assets`, `npm run check:apca`, and `npm run check:a11y:routes` when UI changed.

## Where this came from

Every task traces to a numbered recommendation in docs/growth/landing-audit-2026-07-06.md. When a task and the audit disagree, the task file wins (it is newer and more specific).
