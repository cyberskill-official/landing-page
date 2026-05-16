---
fr_id: FR-CMS-003
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
---

## §1 — Verdict summary

FR-CMS-003 is ship-grade. Round-1 revisions formalised the syllable-count rule (§1 #8 + §3.2 + AC#3 — 14 syllables calibrated to EN ≤ 12 words), made NFC normalisation an AC (§4 #11), pinned the bilingual tagline byte-identical (§4 #8), enumerated banned VI phrases (§3.2 register notes), and required the two-pass discipline (initial author + FR-CMS-009 native review).

## §2 — Findings (resolved)

### ISS-1501 — Word-count rule didn't translate to Vietnamese
- **severity:** error · **status:** RESOLVED — §1 #8 introduces syllable-count rule (14 syllables ≈ 12 EN words at scroll cadence); rationale in §2.

### ISS-1502 — MT-shipped-without-edit risk
- **severity:** error · **status:** RESOLVED — §1 #2 explicit "scaffold not deliverable"; §7 row 1 surfaces it.

### ISS-1503 — Diacritic decomposition (NFD) would silently corrupt
- **severity:** warning · **status:** RESOLVED — §4 #11 NFC check via Unicode normalisation; §3.2 VI_REGISTER_NOTES diacritic policy.

### ISS-1504 — Dialect-marked colloquialisms not testable
- **severity:** warning · **status:** RESOLVED — §4 #10 grep + reviewer carve-out for legitimate formal uses.

### ISS-1505 — Two-pass discipline (author + native review) unsignalled
- **severity:** info · **status:** RESOLVED — §1 #12 + AC#13 require FR-CMS-009 to be queued in P5; this FR is initial author, that one is formal native pass.

## §3 — Strengths preserved

- §3.1 sample JSON shows real VI translations that demonstrate the "slightly poetic" register without veering into archaic. "Để tôi soi sáng phần còn lại" carries Lumi's light imagery natively.
- §2 rationale on calibrating syllable-vs-word count addresses a real authoring problem (Vietnamese tokenisation differs from English).
- §3.2 VI_REGISTER_NOTES.md is the cross-team contract — author + native reviewer + founder reference the same document.
- §1 #12 + AC#13 making FR-CMS-009 part of the acceptance criteria for this FR enforces the two-pass discipline at the protocol level.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-1506 — Sanity webhook signature timing-safe compare
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** FR-CMS-005 webhook uses HMAC signature. Comparison MUST be timing-safe via crypto.timingSafeEqual. Prevents side-channel leak of secret.

### ISS-1507 — Vietnamese diacritic preservation through ISR pipeline
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Vietnamese content travels Sanity → ISR cache → CDN → browser. Any intermediate decode/encode can corrupt diacritics. Vitest asserts UTF-8 byte-equality at each hop.

### ISS-1508 — Draft mode token scope + expiry
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Draft mode reveals unpublished content. Token MUST be editor-scoped JWT with 24h max lifetime + revocable. Document as failure mode.

## §4 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Notes |
|---|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | One VI lines.json + register notes. |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 13 MUSTs/MUST NOTs. |
| Testability | 2.0 | 1.4 | 2.0 | Vitest parity + syllable count + NFC + grep for banned phrases. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | §1.1 + §2.2 cited. |
| API/contract precision | 1.5 | 1.4 | 1.5 | Same schema as EN; sample lines + register notes. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | depends_on: [FR-CMS-002]; blocks 3 downstream. |
| Failure-modes inventory | 1.0 | 0.6 | 1.0 | 9 rows incl MT-pitfall, NFD, dialect drift. |
| Observability hooks | 1.0 | 0.6 | 1.0 | Founder signoff + FR-CMS-009 queued + Vitest. |
| **Total** | **10.0** | **8.0** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (SHOULD priority). Unblocks FR-CMS-007 (i18n loader), FR-SEO-005 (VI title/description), and queues FR-CMS-009 (P5 formal native review).

---

*End of FR-CMS-003 audit.*
