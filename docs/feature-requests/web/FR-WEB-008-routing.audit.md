---
fr_id: FR-WEB-008
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-WEB-008 is ship-grade. Round-2 re-author from spec-stub (6.5/10). Round-2 additions: `metadata-helpers.ts` typed builder (§3.2 + §3.3), `/work/[slug]` `not-found.tsx` + `loading.tsx` (§1 #7 + #8 + AC#4 + AC#13), `sitemap.ts` + `robots.ts` generators (§1 #11 + #12 + AC#10 + AC#11), Next 15 `params: Promise<...>` shape (§1 #10 + §3.4), middleware-banned-at-slice-1 (§1 #15 + AC#14), `route-audit.ts` enumeration tool (§1 #16 + AC#15), query-param i18n discipline with future-amendment path (§1 #13 + §9), six-paragraph rationale (§2), 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-4001 — `metadata-helpers.ts` not specified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 + §3.3 specify `generateRouteMetadata(routePath, opts)` API with canonical + hreflang assembly.

### ISS-4002 — `not-found.tsx` + `loading.tsx` for `/work/[slug]` missing
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #7 + #8. AC#4 + AC#13 verify the dynamic route's UX states.

### ISS-4003 — sitemap + robots generators not in scope
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #11 + #12. `app/sitemap.ts` + `app/robots.ts` listed in deliverables; AC#10 + AC#11 verify.

### ISS-4004 — Next 15 `params: Promise<...>` shape not enforced
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #10 + §3.4. Per Next 15 breaking change.

### ISS-4005 — Middleware-at-slice-1 risk not flagged
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #15 + AC#14. Slice 1 is middleware-free; amendments required.

### ISS-4006 — Locale routing strategy undefined (query-param vs path)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #13 + §9 specify `?lang=vi` for slice 1 with future-amendment path documented.

### ISS-4007 — `route-audit.ts` enumeration tool missing
- **severity:** info
- **rule_id:** observability
- **status:** RESOLVED — §1 #16 + AC#15. CSV artefact for ops verification.

### ISS-4008 — Failure-mode inventory thin (5 rows); missed Next 15 + App Router gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "`params` not awaited", "`(lite)` route group conflict with /lite URL", "sitemap.xml stale".

## §3 — Strengths preserved from the spec-stub

- 4-route list (`/`, `/lite`, `/work/[slug]`, `/accessibility`) correctly cited.
- Typed routes via experimental flag correctly named.
- Canonical + hreflang rule correctly cited from master plan §8.1.
- API minimalism (3 endpoints at slice 1) already correctly stated.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One route surface — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Playwright + tsc + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §5.2 + §7.6 + §8.1 + §6.4 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | metadata-helpers + work/[slug] shape + sitemap/robots + Playwright. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + 7 downstream blocks enumerated. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Next 15 + App Router + SEO gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | route-audit.ts CSV + Playwright + sitemap/robots verification. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 2 item 7 of 8.

1-6. ✓
7. **FR-WEB-008 ✓ (this audit, 10/10)** — 7 downstream unblocked
8. Next: FR-WEB-009 (WebGL2 detection) — closes Batch 2

---

*End of FR-WEB-008 audit.*
