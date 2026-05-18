---
id: FR-CMS-011
title: "Quarterly content refresh cadence — new case study + refreshed metrics + voice-rules guard"
module: CMS
priority: SHOULD
status: blocked
blocked_reason: "Cadence docs and tracker-ready task payload are delivered, but actual Linear/Asana recurring task creation needs a connected tracker or manual owner action."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Founder + Content/Marketing
created: 2026-05-16
related_frs: [FR-CMS-002, FR-CMS-005, FR-CMS-006, FR-CMS-009, FR-A11Y-013]
depends_on: [FR-CMS-006]
blocks: []
language: documentation + process
service: project tracker + docs/launch/
new_files:
  - docs/launch/content-refresh-cadence.md
  - docs/launch/quarterly-refresh-checklist.md

source_pages:
  - docs/01-master-plan-v2.md §12.2 — quarterly content refresh
  - FR-CMS-002 narration line lifecycle
  - FR-CMS-005 ISR revalidation pattern

effort_hours: 3
risk_if_skipped: "Content rots. Headcount, recent case studies, current capabilities — all change quarterly. Stale content signals 'this team is asleep' to visitors. Quarterly refresh is the floor; can update more often."
---

## §1 — Description (BCP-14 normative)

1. **MUST** schedule quarterly content refresh as recurring task in Linear / Asana:
   - Q1: March 31.
   - Q2: June 30.
   - Q3: September 30.
   - Q4: December 31.
2. **MUST** review + update each quarter:
   - DUNS-linked metrics (headcount, revenue range if public).
   - Case studies (add 1+ new; retire outdated).
   - Testimonials (refresh 1+ per quarter).
   - Capabilities page (any new services? Retired any?).
   - Team page (joiners + leavers).
   - Job listings (sync with ATS).
3. **MUST** verify ISR cache invalidates on Sanity publish per FR-CMS-005.
4. **MUST NOT** introduce new banned-word violations — run FR-CMS-002 voice-rules check + FR-CMS-009 native review on Vietnamese updates.
5. **MUST** ship a quarterly checklist at `docs/launch/quarterly-refresh-checklist.md`.
6. **MUST** archive each quarter's refresh log at `docs/launch/refresh-{yyyy-q}.md`.
7. **MUST** include Vietnamese updates parity — if EN case study added, VI translation scheduled.

## §2 — Why this design

**Why quarterly cadence?** Balance between stale + churn. Monthly = expensive editorial overhead; yearly = visibly stale.

**Why checklist?** Without structure, refresh = "ah, I'll do it later." Checklist forces specifics.

**Why ISR invalidation?** Edits without invalidation = visitors see old content for 1h (FR-CMS-005 TTL). Webhook fires faster.

**Why voice-rules check?** Drift in voice over time. Quarterly check resets to brand baseline.

**Why VI parity?** 90% Vietnamese audience. EN-only updates exclude majority.

**Why archive log?** Audit trail. "What changed in Q2 2026?" — answer in log.

## §3 — Public surface

```markdown
<!-- docs/launch/quarterly-refresh-checklist.md -->
# Quarterly content refresh checklist

## Pre-refresh (week before quarter-end)
- [ ] Calendar: founder + content owner block 4 hours.
- [ ] Pull current metrics:
  - Headcount (current vs last quarter).
  - DUNS-linked revenue range (if public).
  - Active case studies count.
- [ ] Identify 1+ new case study to add (or refreshed metrics on existing).
- [ ] Identify outdated case study (> 18 months) for archive or refresh.

## Refresh tasks
- [ ] Add new case study in Sanity (en + vi).
- [ ] Refresh testimonials (newest first).
- [ ] Update headcount + metrics on home + about.
- [ ] Update team page (new joiners, role changes).
- [ ] Update capabilities (any new services? Retired?).
- [ ] Sync job listings with ATS.
- [ ] Run voice-rules CI lint (FR-CMS-002).
- [ ] Run FR-CMS-009 Vietnamese review on VI updates.
- [ ] Trigger ISR webhook → verify FR-CMS-005 revalidates.
- [ ] Smoke test /, /work, /capabilities, /team, /vi/* variants.

## Post-refresh (within 1 week)
- [ ] Lighthouse a11y check on changed routes (FR-A11Y-013).
- [ ] Sitemap regenerates with new case study URLs.
- [ ] Google Search Console submission (optional ping).
- [ ] Archive log at docs/launch/refresh-{yyyy-q}.md.

## Cadence
- Q1: March 31
- Q2: June 30
- Q3: September 30
- Q4: December 31
```

```markdown
<!-- docs/launch/refresh-2026-q3.md (sample log) -->
# Q3 2026 content refresh — 2026-09-30

## Summary
- 1 new case study added: "AI Onboarding for Beta Health (EN + VI)"
- 2 testimonials refreshed.
- Headcount updated: 5 → 7 (2 joiners).
- 1 outdated case study retired (Q1 2025; > 18 months).

## Changes per surface

### Home (/)
- Headcount updated.
- Featured case study slot: Beta Health AI Onboarding.

### Work (/work)
- Beta Health AI Onboarding added.
- Q1 2025 case study moved to archive (featured_order: null).

### Capabilities
- No changes.

### Team
- 2 new members: [Name 1], [Name 2].
- Updated FR-CMS-004 PII boundary (display name + role only).

### Vietnamese
- All EN updates also translated and reviewed by FR-CMS-009 reviewer.

## Voice-rules check
- Run: pnpm voice-check
- Result: 0 violations.

## ISR verification
- Sanity webhook fired on each publish.
- /, /work, /work/beta-health-ai-onboarding revalidated within 5s.

## Lighthouse
- /work/beta-health-ai-onboarding: 91 Perf / 100 a11y / 100 SEO.

## Next refresh: 2026-12-31 (Q4)
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Quarterly task in project tracker | Tracker check |
| 2 | ISR invalidates on publish | FR-CMS-005 webhook verified |
| 3 | Voice-rules CI lint catches violations | Synthetic violation test |
| 4 | Quarterly checklist present | File exists |
| 5 | Each quarter's log archived | docs/launch/refresh-*.md |
| 6 | Headcount + metrics current | Manual check |
| 7 | 1+ new case study per quarter | log check |
| 8 | Vietnamese parity maintained | log check |
| 9 | FR-CMS-009 review on VI updates | log + signature |
| 10 | Smoke tests on changed routes | log check |

## §5 — Verification

Manual process; verification = checklist completion:

```bash
# Quarterly task exists in tracker (manual)
# Linear / Asana API query

# ISR webhook verified
# Test publish; assert revalidate API called

# Voice-rules check
pnpm voice-check  # FR-CMS-002 lint

# Log archived
test -f docs/launch/refresh-$(date +%Y-Q%q).md
```

## §6 — Dependencies

**Concept:** FR-CMS-005 (ISR revalidate consumer), FR-CMS-006 (case-study route), FR-CMS-009 (Vietnamese review), FR-CMS-002 (narration lifecycle), FR-A11Y-013 (a11y monthly catches drift).

**Operational:** Project tracker (Linear / Asana), Sanity Studio, content team.

**Downstream:** Brand freshness; search ranking (regular updates signal active site).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Stale metrics post-launch | Manual audit | Quarterly is floor; update more often if needed |
| Forgot to invalidate ISR | Visual stale content | Sanity webhook auto-fires (FR-CMS-005) |
| New banned word slips in | Voice-rules lint | Pre-publish check enforced |
| Vietnamese update untranslated | Parity audit | Block publish until translation ready |
| Headcount uncertain (legal nuance) | Conservative | Round to nearest 5 or use range |
| Outdated case study confused for current | Retirement flag | featured_order: null hides from /work |
| Case study legally sensitive (client NDA) | Founder review | Get client signoff before publish |
| Quarterly check skipped | Calendar | Founder calendar reminder + Slack ping |
| Refresh log not committed | Process | CI checks for log file presence |
| ATS sync stale (closed roles still listed) | FR-CTA-004 cache | 5-min ATS cache; webhook on close |
| Vietnamese review bottleneck | Reviewer availability | Schedule reviewer 1 month ahead |
| ISR cache cleared during refresh | Visitor sees blip | Acceptable; brief loading state |
| Lighthouse regression from new content | FR-OPS-011 PR gate | Catches before merge |

## §8 — Deliverable preview

Q3 2026 quarterly refresh (sample):
1. Founder + content owner block 4h on Sept 28.
2. Review last quarter's checklist; identify gaps.
3. Add Beta Health case study (en + vi) in Sanity.
4. Update headcount: 5 → 7.
5. Refresh 2 testimonials.
6. Voice-rules check: clean.
7. FR-CMS-009 reviewer signs off VI.
8. Sanity webhook fires → ISR invalidates.
9. Smoke test all routes.
10. Log archived; next quarter calendar set.

## §9 — Notes

**On quarterly vs continuous:** Continuous is ideal but heavy. Quarterly is the discipline floor.

**On Vietnamese audience:** Vietnamese visitors specifically notice stale content — "this site forgot us" effect. Parity is critical.

**On DUNS metrics:** DUNS 673219568. Public financial data — refresh if changes (rare).

**On future automation:** Could auto-generate "weeks since last update" badge on /work; if > 90 days, ping. Slice 2.

*End of FR-CMS-011.*

## §10 — Implementation status

Status: **blocked on tracker creation**.

Delivered:

- `docs/launch/content-refresh-cadence.md` defines quarterly dates, tracker payload, owner model, workflow, content surfaces, quality gates, log naming, and current blocker.
- `docs/launch/quarterly-refresh-checklist.md` defines the reusable quarter-end checklist, VI parity checks, Sanity/ISR checks, smoke tests, technical checks, and refresh log template.

Verified:

- `node tools/audit-fr-deliverables.mjs` reports declared FR-CMS-011 deliverables present.

Blocked items:

- The recurring Linear or Asana task cannot be created from this workspace without a connected project tracker.
- Each quarter's actual `docs/launch/refresh-YYYY-qN.md` log should only be created when that quarter's real content refresh is performed.
