# Team Role Assignments — 10-person Build

**Source:** master plan §10.1 role table.
**Cross-ref:** every FR's `owner:` frontmatter field maps to a role here.

---

## Role → primary FR ownership

| Role | Headcount | Owns these FR modules (primary) | Co-owns (consults) |
|---|---:|---|---|
| **Founder / Creative Director** (Stephen Cheng) | 1 | All `signoff:` FRs · Cultural authority on CHAR-003 · Brand voice on CMS-001/002 | All others |
| **Frontend Lead / R3F Architect** | 1 | All WEB-* + SCENE-020 (orchestrator) + PERF-002..010 | DS-003..009 |
| **R3F Developer** | 1 | SCENE-009..024 (per-scene implementations) + shader work | PERF, WEB |
| **Frontend Developer** | 1 | CTA-002..011 + CMS-006..008 (i18n + Sanity routes) + A11Y-006..010 | SEO |
| **Designer (Art Director)** | 1 | CHAR-001..003 (2D) + DS-001..009 + SCENE-001..008 (Figma comps) | CMS (tone) |
| **3D Modeler / Texture Artist** | 1 | CHAR-004..008 + CHAR-012 (production geometry + Substance) | OPS-001 |
| **3D Rigger / Animator** | 1 | CHAR-009..011 (rig + shape keys + 11 animation clips) | CHAR-006 |
| **QA / Accessibility** | 1 | A11Y-001..013 + cross-browser + axe + manual VO/NVDA | PERF-001 |
| **Backend / DevOps** | 1 | OPS-001..016 (pipeline + CI + LFS + analytics proxy) | WEB |
| **Content / Copywriter** | 1 | CMS-001..003 + CMS-009..011 (narrative + VI + content refresh) | SEO-005 |

---

## Phase-anchored handoff matrix

| Phase | Primary owner per FR | Phase gate |
|---|---|---|
| P0 (wks 1-2) | Founder + Designer + Copywriter + 3D Modeler (proxy/greybox planning) | Founder signoff on FR-CHAR-001 + FR-CMS-001 + FR-DS-001 |
| P1 (wks 3-5) | Designer (Figma comps) + Frontend Lead (`@cyberskill/ds-cinematic`) + 3D Modeler (greybox) | Design + tech-feasibility signoff |
| P2 (wks 6-9) | 3D Modeler + 3D Rigger/Animator + Backend (pipeline) — parallel with P3 | GLB ≤ 3 MB passes CI gate |
| P3 (wks 6-8) | Frontend Lead + R3F Developer + Backend (CI workflows) + QA (a11y stubs) — parallel with P2 | Scene 0 staging URL, Lighthouse ≥ 95, axe-clean |
| P4 (wks 9-12) | R3F Developer (scenes) + Frontend Developer (CTA + CMS) + Designer (refinements) | Internal end-to-end demo bug-free |
| P5 (wks 13-14) | QA + Backend (PERF gates) + Copywriter (VI native review) + Frontend Developer (SEO) | CWV at target on p75 mobile; axe + manual clean; DPO signoff |
| P6 (wks 15+) | Backend (deploy) + Frontend Developer (CTA hardening) + Copywriter (content refresh) | Soft launch live; awards submitted |

---

## Daily standup (15 min, HCMC 9am)

Each role reports in 60 seconds:
1. Yesterday's FR-IDs touched + state change.
2. Today's FR-IDs in progress.
3. Blockers (specific FR-ID + what's blocking).

Recorded; absent team members watch back.

## Weekly review (30 min, Friday 4pm HCMC — "Lumi Lab")

- Founder + all 10 roles.
- Walk through every FR-ID that changed state this week.
- Review next week's plan from `week-N-execution-plan.md` (the Frontend Lead drafts the next-week plan by Wednesday afternoon).
- Cross-team feedback on cultural register / craft decisions.

## Cross-training rule (master plan §10.2 risk register)

- Every R3F FR has **2 reviewers from week 1** so attrition doesn't bottleneck.
- Designer + Copywriter cross-review each other's voice/visual outputs once per FR.
- QA reviews every PR; can request a11y revisions.

## When two roles disagree

1. Discuss in standup (30 sec each side).
2. If unresolved: 30-min sync after standup.
3. If still unresolved: founder breaks the tie.

Don't burn weeks litigating taste. The voice-rules.md + cultural-note.md + master plan are the tie-breakers.
