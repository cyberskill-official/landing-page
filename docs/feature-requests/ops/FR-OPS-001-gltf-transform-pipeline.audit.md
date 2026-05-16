---
fr_id: FR-OPS-001
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 6
issues_critical: 0
template: engineering-spec@1
final_revision: 2026-05-16 (round 2)
---

## §1 — Verdict summary

FR-OPS-001 is ship-grade. Round-2 revisions formalised the "Draco MUST NOT touch Lumi" auto-detect rule as both config AND runtime guard (§1 #2 + §4 #4), made determinism a Vitest SHA-256 assertion (§4 #8), added the raw-immutability check (§4 #10), added the early-warn behavior at 110% target (§1 #10 + §4 #9), and added the ORM packing preservation check (§4 #12).

## §2 — Findings (resolved)

### ISS-901 — Draco-on-Lumi was protected only by config, not runtime
- **severity:** error · **status:** RESOLVED — §1 #2 + auto-detect by morph/skin presence; AC#4 explicitly tests override.

### ISS-902 — Determinism not asserted
- **severity:** error · **status:** RESOLVED — §1 #14 + AC#8 SHA-256 match across two runs.

### ISS-903 — Raw input could be mutated by mistake
- **severity:** warning · **status:** RESOLVED — §1 #13 + AC#10 mtime check.

### ISS-904 — Early-warn-vs-fail-gate confusion
- **severity:** info · **status:** RESOLVED — §1 #10 + §2 rationale: 110% is the script-level early-warn; 117% (3.5/3.0 = fail/target) is the CI gate. Two-tier signal.

### ISS-905 — ORM packing could be silently split
- **severity:** warning · **status:** RESOLVED — §1 #8 + AC#12 verifies single-texture preservation.

### ISS-906 — Determinism gotcha across dep versions not flagged
- **severity:** info · **status:** RESOLVED — §7 row 4: pin exact versions (no `^`).

## §3 — Strengths preserved

- §2 rationale explains why each compression choice is the right one — citing master plan §4.3 each time. A future maintainer who wants to "improve" by swapping algorithms will read this and reconsider.
- §3.2 driver code mock is detailed enough to implement directly; §3.3 report JSON shape is the wire format for FR-OPS-003.
- §7 failure modes cover both technical (KTX2 encoder missing, dep version drift) and process (orphan reports) issues.
- §8 the "single technical mitigation for the §10.2 risk #1" note frames this FR's importance for the team.

## §4 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | One pipeline script. |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 1.0 | 15 MUSTs / MUST NOTs. |
| Testability | 2.0 | 1.6 | 1.9 | 2.0 | Vitest suite with execFileSync + inspect parse + SHA-256 + mtime. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | 1.5 | §4.3 + §4.4 + §11.2 cited verbatim. |
| API/contract precision | 1.5 | 1.4 | 1.5 | 1.5 | Config JSON + driver code + report JSON all defined. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | 1.0 | No depends_on; blocks 8 downstream FRs. |
| Failure-modes inventory | 1.0 | 0.6 | 0.9 | 1.0 | 10 rows incl orphan reports, cache miss, dep version drift. |
| Observability hooks | 1.0 | 0.5 | 0.8 | 1.0 | Report JSON is the wire format for FR-OPS-003 PR comments. |
| **Total** | **10.0** | **8.5** | **9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.** Production-critical FR — the only path to meeting the master plan §4.4 asset budget. Unblocks FR-OPS-002..009 + FR-CHAR-008 (texture authoring needs the export target) + FR-CHAR-011 (animation export).

---

*End of FR-OPS-001 audit (round 2 final).*
