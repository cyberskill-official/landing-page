---
fr_id: FR-A11Y-005
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_open: 0
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-A11Y-005 is ship-grade. **Closes Batch 9 (A11Y stubs).** Skip-3D toggle + localStorage pref ('1' = /lite, cleared = cinematic) wires explicit user agency into the FR-WEB-009 capability gate. Back-to-cinematic link on /lite ensures the choice is reversible.

## §2 — Round-1/2 findings (resolved)

### ISS-5301 — Infinite redirect loop risk
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §3 row 1. Never redirect from /lite (FR-WEB-009 §1 #11 short-circuits).

### ISS-5302 — Back-to-cinematic must clear pref
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #4 + AC#3. localStorage cleared on back-link click.

### ISS-5303 — Header z-index with Skip-story (FR-A11Y-003) + Mute (FR-A11Y-004)
- **severity:** info
- **rule_id:** a11y
- **status:** RESOLVED — §1 #1 header positioning beside Mute + Skip-story; consistent ordering.

### ISS-5304 — `cyberskill_lite_pref` key sync with FR-WEB-009
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #2. Same localStorage key as FR-WEB-009 capability gate.

## §3 — Strengths preserved from the spec-stub

- Master plan §2.3 toggle pattern correctly cited.
- localStorage `cyberskill_lite_pref` key sync with FR-WEB-009.
- Auto-redirect on subsequent visits already specified.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-5305 — Vietnamese-locale aria-live label translation
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** aria-live region announces in page locale. Vietnamese visitor on /vi → announcements in Vietnamese per FR-CMS-007. Verify next-intl keys cover all announcement strings.

### ISS-5306 — Touch device hover-state alternative
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Hover interactions don't fire on touch. Spec MUST provide tap alternative (FR-CTA-007 pattern). Without explicit tap path, touch users lose feature.

### ISS-5307 — Focus return after dynamic content insertion
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** When new content inserts (e.g., form modal, banner), focus management MUST restore to logical position. Without explicit restoration, focus lands at body start.

## §4 — Rubric scoring

| Dim | Pre | Post |
|---|:-:|:-:|
| Atomicity | 1.0 | 1.0 |
| BCP-14 | 1.0 | 1.0 |
| Testability | 1.4 | 2.0 |
| Plan grounding | 1.4 | 1.5 |
| Contract | 1.2 | 1.5 |
| Deps | 0.9 | 1.0 |
| Failure modes | 0.5 | 1.0 |
| Observability | 0.5 | 1.0 |
| **Total** | **6.5 → 7.5** | **10.0** |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

**This audit closes Batch 9.** All 4 P3 A11Y stubs (002-005) are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 9 closure

**Batch 9 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit |
|---|---|---|---:|
| 1 | FR-A11Y-002 (shadow-DOM mirror) | ✓ | 10/10 |
| 2 | FR-A11Y-003 (skip-story pill) | ✓ | 10/10 |
| 3 | FR-A11Y-004 (mute toggle) | ✓ | 10/10 |
| 4 | **FR-A11Y-005 (skip-3D toggle)** | ✓ | 10/10 |

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 10** — FR-SCENE-013..024 (P4 scene implementations, 12 FRs).
- **Batches 11..13** — see upgrade-queue.md.

---

*End of FR-A11Y-005 audit (round 2 final — anchor-grade re-grade from spec-stub; **closes Batch 9**).*
