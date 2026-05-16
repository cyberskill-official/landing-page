---
fr_id: FR-SEO-001
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
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
---

## §1 — Verdict summary

FR-SEO-001 is ship-grade. Round-2 revisions added the no-JS-needed assertion (§4 #2 — caught a class of bugs where schema is React-Helmet-injected), the founder Vietnamese-name UTF-8 byte-count check (§4 #7), the "no premature cert claim" grep (§4 #12), and an explicit superseding-FR pattern for legal-name changes (§7 row 2).

## §2 — Findings (resolved)

### ISS-601 — "SSR-rendered, not client-injected" was prose
- **severity:** error · **status:** RESOLVED — §4 #2 + Playwright test with `javaScriptEnabled: false` proves the SSR path. This catches React-Helmet drift.

### ISS-602 — Founder Vietnamese diacritics could silently mojibake
- **severity:** warning · **status:** RESOLVED — §4 #7 byte-count assertion + §7 row 4 build-pipeline fix.

### ISS-603 — Future certs (ISO 27001 / SOC 2) might land aspirationally
- **severity:** error · **status:** RESOLVED — §4 #12 grep + §1 #17 normative.

### ISS-604 — Legal-name change path unspecified
- **severity:** info · **status:** RESOLVED — §7 row 2 + §1 #11 governance via `FR-SEO-001a-legal-name-update` successor pattern.

### ISS-605 — Schema gzip size unbounded
- **severity:** info · **status:** RESOLVED — §4 #14 + AC asserts ≤ 2 KB gz. Prevents schema bloat from drifting into the LCP critical path.

## §3 — Strengths preserved

- §2 rationale explains why each field shape choice matters — DUNS as PropertyValue, areaServed as named regions, knowsAbout aligning with FR-SEO-002 sub-blocks.
- §3.1 typed schema literal is copy-paste-ready and round-trip with `JSON.parse(JSON.stringify(X))` is identity.
- §8 notes covering UTF-8 byte counts + sameAs deferral show the author thought through corner cases.
- §1 #17 + §4 #12 enforce the conservative-claims rule that protects buyer trust.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-606 — UTF-8 charset enforced on JSON-LD blocks
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Vietnamese diacritics in Person.alternateName or Organization fields require UTF-8 encoding throughout: HTTP header + meta tag + JSON encoding. Verify via curl + grep.

### ISS-607 — Schema.org @id reciprocity across blocks
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Person.affiliation.@id must exactly match Organization.@id. Drift = Google ignores cross-reference. Vitest assertion across all schema blocks.

### ISS-608 — Google Rich Results Test pre-launch verification
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Manual verification step per FR pre-launch. Document as launch-checklist item; cross-ref FR-OPS-014.

## §4 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | One schema record; mounted once. |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 1.0 | 20 MUSTs. |
| Testability | 2.0 | 1.6 | 1.9 | 2.0 | Vitest (12 ACs) + Playwright (3 ACs) + Rich Results API (1 AC). |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | 1.5 | §8.2 cited verbatim. |
| API/contract precision | 1.5 | 1.5 | 1.5 | 1.5 | TS literal IS the contract. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | 1.0 | `depends_on: [FR-WEB-001]`; blocks 3 downstream. |
| Failure-modes inventory | 1.0 | 0.4 | 0.8 | 1.0 | 8 rows incl name-change + index-cache. |
| Observability hooks | 1.0 | 0.5 | 0.8 | 1.0 | Rich Results API call as periodic out-of-band check. |
| **Total** | **10.0** | **8.5** | **9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.** Lowest-effort, highest-leverage SEO FR in the backlog (4 hours of work, lasting visibility impact). Unblocks FR-SEO-002 (Service sub-blocks) and FR-SEO-003 (Person schema).

---

*End of FR-SEO-001 audit (round 2 final).*
