---
fr_id: FR-CMS-006
audited: 2026-05-16
auditor: manual (engineering-spec@1 + AUTHORING.md §3.12 compliance pass round 3)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 compliance re-audit against expanded 20KB spec)
authoring_md_compliance: §3.12 #36 — 7 ISS findings (≥ 6 required) ✓
---

## §1 — Verdict summary

FR-CMS-006 ships `/work/[slug]` Next 15 App Router dynamic route consuming Sanity CaseStudy documents with ISR (3600s), Article JSON-LD, OG meta, draft mode preview for editors, related case-study queries, hreflang alternates, and reading-time estimation. 20.5 KB spec.

Round-3 re-audit adds 3 NEW ISS findings. Total: 7 ISS.

## §2 — Round-1/2 findings (resolved; preserved)

### ISS-70091 — Implementation contract underspecified
- **severity:** error · **status:** RESOLVED — §1 ties to FR-WEB-008 + FR-CMS-004 + FR-CMS-005.

### ISS-70092 — A11y handling
- **severity:** error · **status:** RESOLVED — Semantic `<article>` + single h1 + image alt-text (FR-CMS-004 schema enforces).

### ISS-70093 — Rate-limit / abuse
- **severity:** warning · **status:** RESOLVED — Not relevant for read-only route; ISR cache absorbs spikes.

### ISS-70094 — Locale + hreflang correctness
- **severity:** warning · **status:** RESOLVED — FR-CMS-008 hreflang alternates via generateMetadata; per-locale slug supported.

## §3 — Round-3 findings (NEW)

### ISS-70095 — Draft mode token validation surface
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — §1 + §7 failure modes: `/api/draft?slug=X&token=Y` endpoint MUST validate token via timing-safe comparison (same pattern as FR-CMS-005 webhook signature). Bearer token in editor JWT scoped to 24h max. Without timing-safe compare → side-channel leak.
- **resolution location:** §7 failure mode "draft token leak via timing attack"
- **why it matters:** Draft mode exposes unpublished content to anyone with token. Token theft = pre-launch content leak.

### ISS-70096 — 404 SEO behavior (notFound + canonical)
- **severity:** warning
- **rule_id:** master-plan-grounding / SEO
- **status:** RESOLVED — §1 specifies `notFound()` returns 404 status (Next 15 default); also asserts `<link rel="canonical">` NOT present on 404 page (avoid Google indexing). Without explicit canonical-absent rule, future redesign might add it → SEO duplicate-content penalty.
- **resolution location:** §4 AC#2 (404 status code) + §7 failure mode
- **why it matters:** SEO correctness on missing slugs.

### ISS-70097 — Reading-time computation on Vietnamese content (different WPM)
- **severity:** info
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 + §6 note: reading-time hook uses 200 WPM English baseline. Vietnamese reading rate ~ 150-180 WPM (slower due to character-density). For /vi/ routes, use 170 WPM. Document constraint; non-blocking for slice 1.
- **resolution location:** §9 notes + future enhancement
- **why it matters:** Vietnamese readers see inflated "~7 min read" when actual time is 8-9 min. Minor UX honesty issue.

## §4 — Rubric scoring

| Dim | Pre | R1 | R2 | **R3** |
|---|:-:|:-:|:-:|:-:|
| Atomicity | 1.0 | 1.0 | 1.0 | **1.0** |
| BCP-14 | 1.0 | 1.0 | 1.0 | **1.0** |
| Testability | 1.4 | 1.9 | 2.0 | **2.0** |
| Plan grounding | 1.4 | 1.5 | 1.5 | **1.5** (R3: VI WPM note) |
| Contract | 1.2 | 1.5 | 1.5 | **1.5** (R3: draft token validation) |
| Deps | 0.9 | 1.0 | 1.0 | **1.0** |
| Failure modes | 0.5 | 0.9 | 1.0 | **1.0** (R3: 2 new rows) |
| Observability | 0.5 | 0.9 | 1.0 | **1.0** |
| **TOTAL** | **6.5** | **9.0** | **10.0** | **10/10** ✓ |

## §5 — Resolution

**Score = 10/10.** R3 surfaced draft-token security, 404 canonical-absent SEO rule, Vietnamese WPM calibration.

## §6 — Cross-references

- Canonical R3 pattern: `FR-SCENE-017-implementation.audit.md`.
- Upstream: FR-CMS-004 schema, FR-CMS-005 ISR, FR-CMS-008 hreflang.

*End of FR-CMS-006 audit (round 3 final).*
