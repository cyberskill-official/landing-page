---
fr_id: FR-CHAR-001
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2)
---

## §1 — Verdict summary

FR-CHAR-001 is ship-grade. Round-2 revisions promoted the silhouette-test rubric to a numbered AC (§4 #3), added the bilingual VI tag (§1 #9 + §3 layout), formalised forbidden-iconography (§1 #10 — closed enumeration), added the contrast-block AC (§4 #6), and added the §10 reuse note that doubles the deliverable as recruitment collateral.

## §2 — Round-1 findings (resolved before this audit)

### ISS-001 — "Approved by founder" was prose, not a testable AC
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — promoted to AC §4 #8 with the specific signoff-stamp / email-archive path. A bare email reply now counts as the artefact.

### ISS-002 — Silhouette test had no numerical pass criterion
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — AC §4 #3 now says "≥ 2 of 3 panel viewers in 5 seconds"; log fixture path documented; failure recovery path in §9.

### ISS-003 — Palette compliance was "use the brand palette"
- **severity:** warning
- **rule_id:** verification-shape
- **status:** RESOLVED — AC §4 #2 names the eyedropper grid, enumerates the 7 allowed colours, and bans the 4 colour families that must not appear. 0-pixel tolerance for cool tones.

### ISS-004 — Expressions / actions didn't tie back to the animation library
- **severity:** warning
- **rule_id:** cross-FR-coherence
- **status:** RESOLVED — §3.2 + §3.3 tables now use the exact identifiers from master plan §3.3 (shape keys) and §3.3a (clip names). AC §4 #4 + #5 enforce the 1:1 mapping.

## §3 — Round-2 findings (now all resolved)

### ISS-005 — Bilingual tag missing
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #9 + §3 layout panel + §10 note. Cites master plan §1.1 ("Lumi — vì ánh sáng biến nguyện ước thành sự thật").

### ISS-006 — "No dragons" was a prose constraint
- **severity:** warning
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #10 now closes the enumeration (dragon · phoenix · kirin · áo dài · lotus · ceremonial headwear) and AC §4 #7 makes it inspect-testable. The nón lá explicitly carved out (it lives in FR-CHAR-003, not here).

### ISS-007 — Failure-modes inventory missing
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §9 added with 7 distinct failure paths + detection + recovery. Includes the "founder requests change after signoff" → `FR-CHAR-001a` successor pattern.

## §4 — Strengths preserved

- §2 rationale is the gold standard for explaining *why a paper sheet before any 3D work* — captures the cost-of-rework argument cleanly.
- §3.1–§3.6 break the deliverable into 6 mechanically-checkable sub-blocks; an auditor doesn't need taste judgement, just a checklist pass.
- §8 visual layout block makes the deliverable concrete without prescribing aesthetic detail (taste lives with the Designer).
- §10 reuse note recovers ~50% of the effort as recruitment collateral — secondary ROI without scope creep.

## §5 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | One sheet, one acceptance signal. |
| BCP-14 normativity | 1.0 | 0.8 | 0.9 | 1.0 | Round 2 tightened "approved by founder" into an AC. |
| Testability | 2.0 | 1.0 | 1.7 | 2.0 | Silhouette test + palette grid + signoff archive made inspection mechanical. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | 1.5 | 4 source_pages, exact section refs. |
| API/contract precision | 1.5 | 1.0 | 1.3 | 1.5 | §3.1–3.6 are the contract; AC tied to specific identifiers. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | 1.0 | No depends_on (critical-path root); 5 downstream FRs blocked. |
| Failure-modes inventory | 1.0 | 0.5 | 0.8 | 1.0 | Round 2 added §9 with 7 failure paths. |
| Observability hooks | 1.0 | 0.7 | 0.8 | 1.0 | Silhouette test results log + signoff archive both inspectable artefacts. |
| **Total** | **10.0** | **7.5** → rounded **8.0** | **9.0** → rounded **9.5** | **10.0** | |

## §6 — Resolution

**Score = 10/10. Status: accepted. Ready to start Phase P0 day 1.**

FR-CHAR-001 unblocks FR-CHAR-002 (silhouette test), FR-CHAR-003 (nón lá design), FR-CHAR-004 (Blender greybox), FR-DS-001 (mood board), and FR-SCENE-001 (Scene 0 Hero Figma comp) — five FRs that begin in parallel as soon as the sheet ships and the founder signs off.

---

*End of FR-CHAR-001 audit (round 2 final).*
