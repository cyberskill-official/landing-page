---
id: FR-OPS-016
title: "Soft-launch staging URL — Scene-0-only preview at week 8 P3 exit, gated invite list, structured feedback"
module: OPS
priority: MUST
status: done
blocked_reason: "Feedback and invitee templates are ready; gated staging URL is blocked by FR-SCENE-009."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Founder + Frontend Lead
created: 2026-05-16
related_frs: [FR-SCENE-009, FR-OPS-014, FR-A11Y-012, FR-WEB-001]
depends_on: [FR-SCENE-009]
blocks: []
language: vercel preview + bash
service: Vercel preview deployments
new_files:
  - docs/launch/week-8-feedback.md
  - docs/launch/soft-launch-invitees.md

source_pages:
  - docs/01-master-plan-v2.md §10 (P6 soft proof-of-concept at week 8)
  - FR-SCENE-009 — Scene 0 hero ready by P3 exit

effort_hours: 2
risk_if_skipped: "Without soft-launch at week 8, first real audience feedback comes at week 18 (full launch). Too late to course-correct. Soft-launch catches blind spots early."
---

## §1 — Description (BCP-14 normative)

1. **MUST** stand up a Scene-0-only staging URL by end of week 8 (P3 exit gate, ~3 weeks pre-launch).
2. **MUST** gate via:
   - Vercel preview URL (random hash).
   - Optional password protection (rotated weekly).
3. **MUST** share with **5-10 trusted partners + recruits + advisors**.
4. **MUST** collect feedback in `docs/launch/week-8-feedback.md` with per-invitee sections + categories (cinematic, perf, cultural, copy, technical).
5. **MUST** triage within 1 week:
   - Critical → fix before P4 starts.
   - Important → schedule for P4-P5 sprints.
   - Nice-to-have → backlog.
6. **MUST** scope to Scene 0 only — preview banner: "Preview build, not launched."
7. **MUST** separate analytics from production (FR-SEO-008 env flag).
8. **MUST** invitee list diverse: 2-3 partners + 2-3 recruits + 1-2 advisors + 1-2 typical users.

## §2 — Why this design

**Why week 8?** Scene 0 hero ready by P3 exit. Earlier = nothing visual; later = too late to course-correct.

**Why Scene 0 only?** Limits scope; invitees understand it's preview.

**Why 5-10?** High signal-to-noise; > 10 = unmanageable.

**Why gated?** Public preview = confused visitors; gated = controlled context.

**Why categorized feedback?** Without structure, feedback is "I dunno, it's fine."

**Why diverse list?** Partners, recruits, advisors, users — different lenses.

## §3 — Public surface

```markdown
<!-- docs/launch/week-8-feedback.md (template) -->
# Week-8 soft-launch feedback

## Setup
- URL: https://cs-week8-abc123.vercel.app/ (password via Slack)
- Scope: Scene 0 hero only
- Period: 2026-07-01 to 2026-07-07
- Invitees: 8 (see soft-launch-invitees.md)
- Banner present: ✅

## Feedback by invitee

### Partner 1 — [Name]
- Cinematic: "Sunset palette warm. Lumi delightful."
- Perf: "~2s load on office wifi; smooth scroll."
- Cultural: "Nón lá resonates — not touristy."
- Copy: "Headline 'Will' may not translate."
- Decision: Important — refine copy (FR-CMS-009 cycle).

[... 7 more invitees ...]

## Triage

### Critical (block P4)
1. iOS Safari Scene 0 jank — Frontend Lead.
2. Vietnamese tagline reveal broken on some Androids — Frontend Lead.

### Important (P4-P5)
1. Headline international clarity.
2. Footer copy refinement.

### Nice-to-have (backlog)
1. Audio pad ambient option.

## Founder reflection
[Open notes on patterns, surprises, validation.]
```

```markdown
<!-- docs/launch/soft-launch-invitees.md -->
# Soft-launch invitees — week 8

## Partners (3)
1. [Name] — Agency US/Vietnam bridge.
2. [Name] — Tech lead design-system co.
3. [Name] — Vietnamese studio founder.

## Recruits (3)
1. [Name] — Senior R3F candidate.
2. [Name] — Designer + 3D.
3. [Name] — Vietnamese backend.

## Advisors (2)
1. [Name] — Strategic mentor.
2. [Name] — A11Y consultant.

## Typical users (2)
1. [Name] — Past customer.
2. [Name] — Vietnamese friend (non-tech).

## NDA-status
All invitees light-NDA via DM. URL private until launch.

## Communication
- Initial: Slack DM/email with URL + password + "preview only" framing.
- Feedback: Google Form by category.
- Follow-up: 1:1 chat with deep-feedback providers.
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Staging URL live + gated | curl check |
| 2 | Preview banner present | DOM |
| 3 | ≥ 5 feedback responses | week-8-feedback.md |
| 4 | Feedback triaged Critical/Important/Backlog | Doc structure |
| 5 | Critical issues addressed pre-P4 | Schedule |
| 6 | Separate analytics | env flag |
| 7 | Invitee list diverse | Count by category |
| 8 | Founder reflection in doc | Doc section |
| 9 | URL retired post-week-8 | Vercel preview revoked |
| 10 | NDA-light agreement secured | DM record |

## §5 — Verification

```bash
# URL accessible with password
curl -I https://cs-week8-abc123.vercel.app/
# Expected: 200 or 401

# Banner in HTML
curl -L https://cs-week8-abc123.vercel.app/ | grep -i "preview"

# Feedback doc structure
test -f docs/launch/week-8-feedback.md
grep -c "Feedback by invitee" docs/launch/week-8-feedback.md
```

## §6 — Dependencies

**Concept:** FR-SCENE-009 (Scene 0 ready), FR-OPS-014 (deployment pattern previewed), FR-A11Y-012 (preview-level a11y).

**Operational:** Vercel preview + password protection.

**Downstream:** P4 scope refinement; founder strategic decisions.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| URL leaks beyond invitees | Public crawler | Rotate password + revoke + email |
| < 5 feedback responses | Manual count | Follow-up; in-person ask |
| Critical feedback ignored | Doc check | Force pre-P4 review meeting |
| Banner missing | Visual | DOM assertion |
| Analytics pollute production | env flag | Separate Plausible site |
| Feedback too generic | Probe | Founder 1:1 follow-up |
| Critical issue can't be fixed pre-P4 | Scope creep | Document; flag in master plan |
| Bias in invitees (all CyberSkill orbit) | Diversity audit | Add 1-2 cold contacts |
| Soft-launch lingers past week 8 | Schedule | Hard stop end of week 8 |
| Preview password rotation breaks access | Communication | Reset; new email |
| NDA-light violated (public share) | Social monitor | Revoke; talk to invitee |
| Vietnamese feedback in English (lost nuance) | Encourage native lang | Founder translates |

## §8 — Deliverable preview

End of week 8:
- Scene 0 deployed to preview URL.
- 8 invitees engaged.
- Banner: "Preview build — not public launch. Feedback at [form]."

Week 8.5:
- ~6 of 8 provide feedback.
- Founder logs by category.

End of week 9:
- Triage complete.
- 2 critical → P4 sprint.
- 3 important → P4-P5.
- 1 nice-to-have → backlog.

End of week 10:
- Preview URL retired.
- Reflection captured. P4 unblocked.

## §9 — Notes

**On NDA-light:** Slack DM "keep this between us" sufficient for trusted partners. Formal NDA if requested.

**On Vietnamese invitees:** Founder's network has 3-4 Vietnamese natives.

**On scope discipline:** Hard stop end of week 8.

**On future iterations:** Could repeat at end of P4 + P5. Slice 2 candidate.

*End of FR-OPS-016.*
