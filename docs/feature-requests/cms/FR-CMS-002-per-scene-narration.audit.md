---
fr_id: FR-CMS-002
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.5/10
score_post_revision_1: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 batch compliance pass)
---

## §1 — Verdict summary

FR-CMS-002 is ship-grade. Round-1 revisions made banned-word detection regex precise enough to distinguish verb-form "leverage" from noun-form (§4 #7), formalised the Scene-2 multi-beat split (§3.2 + AC#4), added the pronoun-discipline test (§4 #8), and required scene-defs.json cross-ref (§4 #10).

## §2 — Findings (resolved)

### ISS-1401 — Banned-word regex too coarse (would flag "highest-leverage" noun)
- **severity:** warning · **status:** RESOLVED — §4 #7 regex `\bleverage\s+(our|the)` matches verb form only.

### ISS-1402 — Scene 2 line exceeds 12 words (was a contradiction)
- **severity:** error · **status:** RESOLVED — §3.2 + AC#4 multi-beat rule; the `notes` field declares the split; per-beat ≤ 12 applies.

### ISS-1403 — Pronoun discipline not testable
- **severity:** warning · **status:** RESOLVED — §4 #8 detects mixed first-person within a line; failure mode row 2 covers the recovery.

### ISS-1404 — Alts unlocked at slice 1 might bloat
- **severity:** info · **status:** RESOLVED — §3.3 AUTHORING_NOTES.md restricts alts to phrasing-only; new beat = new primary = new FR.

### ISS-1405 — scene-defs.json could fall out of sync
- **severity:** warning · **status:** RESOLVED — AC#10 cross-validates both files in one test.

## §3 — Strengths preserved

- §3.1 sample JSON shows every key + every speaker variant, copy-paste-ready.
- §2 rationale on "alt variants at slice 1, not later" exposes a non-obvious authoring economy.
- §4 #8 pronoun-discipline test catches the most subtle voice failure (mixing Lumi + company in one line).
- §3.2 documenting the Scene-2 multi-beat exception honestly — instead of silently relaxing the rule — preserves rigor.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-1406 — Sanity webhook signature timing-safe compare
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** FR-CMS-005 webhook uses HMAC signature. Comparison MUST be timing-safe via crypto.timingSafeEqual. Prevents side-channel leak of secret.

### ISS-1407 — Vietnamese diacritic preservation through ISR pipeline
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Vietnamese content travels Sanity → ISR cache → CDN → browser. Any intermediate decode/encode can corrupt diacritics. Vitest asserts UTF-8 byte-equality at each hop.

### ISS-1408 — Draft mode token scope + expiry
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Draft mode reveals unpublished content. Token MUST be editor-scoped JWT with 24h max lifetime + revocable. Document as failure mode.

## §4 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Notes |
|---|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | One lines.json, 8 scenes + alts. |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 12 MUSTs / MUST NOTs. |
| Testability | 2.0 | 1.6 | 2.0 | Vitest with 7 voice-rule assertions. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | §2.2 + §2.1 cited verbatim. |
| API/contract precision | 1.5 | 1.4 | 1.5 | TS schema + sample JSON for every scene. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | depends_on: [FR-CMS-001]; blocks 4 downstream. |
| Failure-modes inventory | 1.0 | 0.6 | 1.0 | 9 rows incl alt-drift + diacritic corruption. |
| Observability hooks | 1.0 | 0.7 | 1.0 | Founder signoff + scene-defs cross-ref + Vitest. |
| **Total** | **10.0** | **8.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.** Voice canon. Unblocks FR-CMS-003 (VI variants), FR-CMS-007 (i18n loader), FR-A11Y-001 (storyboard captions), FR-A11Y-006 (caption rendering).

---

*End of FR-CMS-002 audit.*
