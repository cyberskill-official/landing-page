---
fr_id: FR-A11Y-001
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

FR-A11Y-001 is ship-grade. Round-2 revisions made the no-JS CSS-only swap a separate AC (§4 #6), added the captions-verbatim-from-CMS check (§4 #9), made the build-time "no three in /lite" check a `grep -l` on the .next output (§4 #2), and added the infinite-redirect-loop failure mode (§7 row 4).

## §2 — Findings (resolved)

### ISS-501 — "Storyboard with same captions" was prose
- **severity:** error · **status:** RESOLVED — §4 #9 + §5 test asserts byte-identical match against FR-CMS-002.

### ISS-502 — "No three in /lite" only said "should not import"
- **severity:** error · **status:** RESOLVED — §4 #2 build-time grep + §4 #1 runtime curl-grep, dual proof.

### ISS-503 — CSS swap might secretly need JS
- **severity:** warning · **status:** RESOLVED — §4 #6 disables JS in Playwright context to prove CSS-only.

### ISS-504 — WCAG SCs not mapped per AC
- **severity:** info · **status:** RESOLVED — §1 #14 + AC#10..#13 each cite the specific SC; §4 #14 asserts the A11Y_CHECKLIST.md.

### ISS-505 — Failure-modes missing redirect-loop
- **severity:** warning · **status:** RESOLVED — §7 row 4 explicit guard rule.

### ISS-506 — hreflang pointing direction unclear
- **severity:** info · **status:** RESOLVED — §7 row 5: alternate from `/lite` points to `/` (canonical), not self-loop.

## §3 — Strengths preserved

- Two-level approach (route + inline) honours both intent paths (deep-link user + active opt-out).
- §3.4 `StoryboardPanel.tsx` mock is single-screen, server-component-clean.
- §3.6 inline @media swap is the elegant CSS-only solution — same DOM, user-pref-driven visibility.
- §8 notes reuse the SVG storyboard for OG images + print docs — secondary ROI without scope creep.

## §4 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | One fallback surface (with two ports of entry). |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 1.0 | 14 MUSTs. |
| Testability | 2.0 | 1.5 | 1.9 | 2.0 | Playwright + axe + curl-grep + build-time grep — four orthogonal proofs. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | 1.5 | §2.3 + §7.3 + §7.5 + §10.2 all cited. |
| API/contract precision | 1.5 | 1.4 | 1.5 | 1.5 | 6 contract excerpts (layout/page/panels/StoryboardPanel/shell amend/CSS swap). |
| Dependencies declared | 1.0 | 1.0 | 1.0 | 1.0 | `depends_on: [FR-WEB-008]`; blocks 3 downstream A11Y FRs. |
| Failure-modes inventory | 1.0 | 0.6 | 0.9 | 1.0 | 10 rows incl redirect-loop, hreflang self-loop. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 1.0 | A11Y_CHECKLIST.md + axe scan in CI. |
| **Total** | **10.0** | **8.5** | **9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.** Unblocks FR-A11Y-002 (shadow-DOM mirror), FR-A11Y-011 (/accessibility page), FR-A11Y-012 (final audit). The single most important A11Y FR — it determines whether the project clears WCAG 2.3.3.

---

*End of FR-A11Y-001 audit (round 2 final).*
