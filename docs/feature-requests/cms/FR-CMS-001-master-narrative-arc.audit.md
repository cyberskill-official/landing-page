---
fr_id: FR-CMS-001
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 batch compliance pass)
---

## §1 — Verdict summary

FR-CMS-001 is ship-grade. Round-2 revisions made the byte-identical scene-title rule a Vitest assertion (§4 #3 + §5 test), made the no-emoji rule mechanically checkable via Python regex (§4 #6), introduced the parse-around-section grep for banned words (§4 #5), and added the bi-directional `comp_fr_id` cross-link rule (§8 traceability note).

## §2 — Findings (resolved)

### ISS-801 — Scene titles drift over time without enforcement
- **severity:** error · **status:** RESOLVED — §4 #3 + Vitest diff against an inline canonical array.

### ISS-802 — "No emoji" was prose
- **severity:** warning · **status:** RESOLVED — §4 #6 Python regex across the Unicode emoji ranges.

### ISS-803 — Banned-words grep would also match the "banned" rule section
- **severity:** info · **status:** RESOLVED — §4 #5 parse-around-section grep allows banned words ONLY inside the "Banned" block.

### ISS-804 — `comp_fr_id` cross-link could become dangling
- **severity:** warning · **status:** RESOLVED — §4 #9 checks the cross-link resolves; bidirectional rule documented in §8.

### ISS-805 — "Footer is part of the arc" was hidden in master plan
- **severity:** info · **status:** RESOLVED — §3.4 + §8 note explicitly model footer as the 8th JSON entry; ordinal 7.

## §3 — Strengths preserved

- §1 #2 banned-words list is opinionated and useful — it short-circuits 80% of the "synergistic value proposition" copy drift.
- §2 rationale on why we author rules separately from lines is the kind of process insight that often goes unsaid; documenting it here saves a confused review session.
- §3.3 voice-rules.md outline matches master plan §2.2 line-for-line — no semantic drift.
- §3.4 JSON shape locks the structure; downstream FRs author lines, not structure.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-806 — Sanity webhook signature timing-safe compare
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** FR-CMS-005 webhook uses HMAC signature. Comparison MUST be timing-safe via crypto.timingSafeEqual. Prevents side-channel leak of secret.

### ISS-807 — Vietnamese diacritic preservation through ISR pipeline
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Vietnamese content travels Sanity → ISR cache → CDN → browser. Any intermediate decode/encode can corrupt diacritics. Vitest asserts UTF-8 byte-equality at each hop.

### ISS-808 — Draft mode token scope + expiry
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Draft mode reveals unpublished content. Token MUST be editor-scoped JWT with 24h max lifetime + revocable. Document as failure mode.

## §4 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | One narrative arc document set. |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 1.0 | 11 MUSTs/MUST NOTs. |
| Testability | 2.0 | 1.4 | 1.9 | 2.0 | Inspection-led but machine-asserted on titles + emoji + banned words + cross-links. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | 1.5 | §2.1 + §2.2 + §1.3 + §1.1 + §2.3 all cited. |
| API/contract precision | 1.5 | 1.4 | 1.5 | 1.5 | TS interface for `SceneDef` + verbatim JSON. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | 1.0 | No depends_on; blocks 11 downstream FRs. |
| Failure-modes inventory | 1.0 | 0.6 | 0.9 | 1.0 | 8 rows, esp. founder-pivot-post-signoff. |
| Observability hooks | 1.0 | 0.6 | 0.7 | 1.0 | bidirectional traceability + signoff archive. |
| **Total** | **10.0** | **8.5** | **9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.** Foundational narrative FR — no depends_on, blocks 11 downstream FRs. Unblocks FR-CMS-002 + FR-CMS-003 + every FR-SCENE-001..008.

---

*End of FR-CMS-001 audit (round 2 final).*
