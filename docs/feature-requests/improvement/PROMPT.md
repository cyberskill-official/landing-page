# Trigger prompts

Two prompts, one loop: prompt 1 makes an agent implement a wave on a dedicated branch with evidence; prompt 2 is the human review that decides what merges. Replace <N> with the wave number (1, 2, 3). Re-running a wave is safe: agents only pick up tasks still in todo.

Before triggering wave 1, check off whatever you can under "Inputs Stephen owes" in BACKLOG.md - every checked input unlocks tasks in that wave.

---

## Prompt 1 - agent implementation run

Paste this to the implementing agent (Claude Code or equivalent) at the repo root of landing-page:

```text
You are a senior engineer on the cyberskill.world landing page (Next.js 15, App Router, EN/VI). Work autonomously; do not pause to ask questions mid-run.

Read first, in this order:
1. AGENTS.md (repo conventions)
2. docs/improvement/README.md (rules, task states, gates)
3. docs/improvement/BACKLOG.md (current state of every task; "Inputs Stephen owes" checklist)
4. The epic files under docs/improvement/tasks/ for the tasks you select
5. docs/growth/landing-audit-2026-07-06.md for background only; task files win on any conflict

Mission: execute improvement wave <N>.

Setup:
- Create branch auto/growth-w<N> from the latest main.
- Select tasks where: wave <= <N>, status is todo, owner is agent, and dependencies are met. Also select mixed tasks whose required input is checked off in BACKLOG.md. Never start a needs-input task whose input is missing; list those at the end instead.

Per task, in dependency order:
1. Set the task to in-progress in BACKLOG.md.
2. Implement the smallest complete change that satisfies the task's "Done when". All user-facing copy ships EN and VI in the same commit; strings live in lib/content/ and the dictionaries, never hardcoded in components.
3. Run the gates: npm run typecheck && npm run lint && npm run test && npm run build. When UI changed, also: npm run check:assets && npm run check:apca && npm run check:a11y:routes. Everything must pass; the budgets in lighthouserc.json are law.
4. Make exactly one commit: <type>(<scope>): <summary> [<TASK-ID>].
5. Append an entry to docs/improvement/LEDGER.md (format at the top of that file) and set the task's status in BACKLOG.md to built, or verified when you proved the behavior with a test or a live check.

Hard rules:
- Never merge or push to main. Push only the wave branch (a Vercel preview will build from it).
- No secrets in code. New env vars go into the ledger entry and .env.example.
- No new runtime dependencies without a ledger justification (name, reason, size).
- If a genuine fork appears (two defensible designs, a business decision, a budget that cannot hold), record it in the ledger under "Forks or follow-ups", set the task back to todo with a one-line note, and continue with the next task.
- If a gate fails and two honest fix attempts do not clear it, ledger the failure, revert that task's changes, and continue.

When the wave is exhausted, report back with:
1. A table: task ID, status reached, commit sha.
2. Tasks skipped and the reason (missing input, unmet dependency, fork).
3. Decisions Stephen must make, phrased as yes/no questions where possible.
4. The pushed branch name, plus confirmation that BACKLOG.md and LEDGER.md are committed and consistent with each other.
```

---

## Prompt 2 - human review (Stephen)

Run this yourself after an agent wave reports done. Steps 1-2 can be delegated: paste the "review packet" block below to a fresh agent first and it will prepare the evidence for you.

Checklist:

1. Consistency: open the PR from auto/growth-w<N>. Every task marked built or verified in BACKLOG.md has a LEDGER.md entry with gates recorded; commit messages carry task IDs.
2. Preview: open the Vercel preview for the branch. Walk /en and /vi home top to bottom, plus every changed route, once at desktop width and once at 390 px. Confirm nothing broke the cinematic flow and the CTA stays reachable on mobile.
3. Copy truth: read every new EN and VI string aloud. Anything that commits the company (reply time, prices, capacity, offers) must be true and must be something you will honor.
4. Forks and inputs: answer the decision questions from the agent's report; check off any newly available items under "Inputs Stephen owes" so the next wave picks them up.
5. Merge: when satisfied, merge the PR (main auto-deploys). If nothing else, merge the safe subset and set the rest back to todo with a note.
6. After deploy: if lead-path code changed, run the LEAD-05 production test (form + Lumi chat) and record the evidence in LEDGER.md; flip merged tasks to done in BACKLOG.md.
7. Trigger the next wave with prompt 1 when it makes sense.

Review packet (optional, paste to a fresh agent on the wave branch):

```text
Prepare a review packet for branch auto/growth-w<N> of the landing-page repo. Read docs/improvement/BACKLOG.md and docs/improvement/LEDGER.md, then produce: (1) a per-task summary of what changed (files + one line), linked to its ledger entry; (2) a diff stat for the branch vs main; (3) the list of new env vars and dependencies introduced, if any; (4) the open forks and decision questions; (5) a copy table of every new EN string beside its VI counterpart so mismatches are visible at a glance. Do not modify any file.
```

---

## Notes

- Wave 1 contains human-owned tasks too (LEAD-01, LEAD-02, LEAD-05, SEO-07, PROOF-07). Agents cannot do these; do them in parallel with the agent run, or the wave's outcome ("leads provably arrive") stays incomplete.
- Agents update statuses to built/verified only; done is reserved for the human after merge. That keeps BACKLOG.md trustworthy.
- If you want a scheduled cadence, trigger prompt 1 weekly and prompt 2 the day after; the backlog is sized so waves shrink naturally.
