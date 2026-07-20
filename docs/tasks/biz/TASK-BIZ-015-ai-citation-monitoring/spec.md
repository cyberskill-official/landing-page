---
id: TASK-BIZ-015
title: "Monthly AI answer-engine citation check"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: human
depends_on: [TASK-BIZ-005]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-5-item-21, growth/GEO-05]
---

# TASK-BIZ-015: Monthly AI answer-engine citation check

## 0. Why (evidence)

The GEO half of this backlog is a hypothesis until it is measured: does ChatGPT, Perplexity or Gemini name CyberSkill when a buyer asks for software companies in Ho Chi Minh City, and which sources does it cite when it does? Audit A prescribes exactly this as a monthly ritual, and the cited sources are the map of where to invest next (usually Clutch and listicles).

## 1. Description (normative)

- 1.1 Monthly, the same prompts SHALL be asked of ChatGPT, Perplexity, Gemini and Claude: "best software development companies in Ho Chi Minh City", one service-specific variant, and one brand-name variant ("what is CyberSkill") to detect confusion with the Australian company of the same name.
- 1.2 The date, whether CyberSkill appears, its position, and which sources each engine cites SHALL be logged in the repo.
- 1.3 The cited sources SHALL be chased: whichever directory or listicle the engines quote becomes the next outreach target (TASK-BIZ-005, TASK-BIZ-011).
- 1.4 The brand-confusion result SHALL be tracked as its own line; if engines conflate the two companies, the entity work (TASK-SEO-017, TASK-SEO-018) is not done.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the log template exists and the first monthly entry is recorded - test: `docs/geo-log`
- [ ] AC for 1.2 - each entry names the cited sources per engine - test: `docs/geo-log`
- [ ] AC for 1.3 - the brand-confusion check is recorded separately - test: `docs/geo-log`
- [ ] AC for 1.4 - the brand-confusion result is a separate logged line per month, and a conflation result re-opens TASK-SEO-017 / TASK-SEO-018 - test: `docs/geo-log`

## 3. Edge cases

- Answers vary by session and region - the same prompts, the same account state, logged as directional not definitive.
- An engine that names a competitor is data, not noise - record who it names.

## 4. Out of scope / non-goals

- Paying for an AI-visibility tool.

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
