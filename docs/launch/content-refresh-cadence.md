# Quarterly Content Refresh Cadence

Owner: Founder plus content or marketing owner.
Cadence: quarterly, with the refresh completed by the last business day of March, June, September, and December.
Related FR: FR-CMS-011.
Status: tracker-ready, blocked on creating the actual Linear or Asana recurring task.

## Purpose

The site should not age quietly. Every quarter, refresh the proof points that visitors use to decide whether CyberSkill is active, current, and serious:

- Case studies.
- Testimonials.
- Headcount and company metrics.
- Capabilities.
- Team roster.
- Open jobs.
- Vietnamese parity.

The floor is one structured review per quarter. Content can and should be updated sooner when there is meaningful news.

## Quarterly Dates

| Quarter | Due date | Planning starts | Notes |
|---|---:|---:|---|
| Q1 | March 31 | March 17 | Use Q1 outcomes and reset annual metrics. |
| Q2 | June 30 | June 16 | Refresh mid-year proof, work samples, and hiring state. |
| Q3 | September 30 | September 16 | Prepare autumn launch and award materials. |
| Q4 | December 31 | December 17 | Year-end proof refresh and next-year planning. |

If the due date lands on a weekend or holiday, complete the refresh on the previous business day.

## Project Tracker Task

Create one recurring task in Linear or Asana with this payload.

Title:

```text
Quarterly website content refresh
```

Cadence:

```text
Every quarter on March 31, June 30, September 30, and December 31.
If the date is a non-working day, move to the previous working day.
```

Owner:

```text
Founder
```

Collaborators:

```text
Content/Marketing, Frontend, Vietnamese reviewer, A11Y reviewer
```

Description:

```text
Refresh CyberSkill website content for the quarter.

Required scope:
- Add or refresh at least one case study.
- Refresh one or more testimonials.
- Verify headcount and public metrics.
- Review capabilities for new or retired services.
- Review team page for joiners, leavers, and role changes.
- Sync job listings with ATS.
- Maintain EN and VI parity for every public-facing content change.
- Run voice-rules checks before publish.
- Run Vietnamese native review for VI copy changes.
- Verify Sanity publish triggers ISR revalidation.
- Smoke test changed EN and VI routes.
- Archive the refresh log at docs/launch/refresh-{yyyy-q}.md.

Acceptance:
- Quarterly checklist complete.
- Refresh log committed.
- Known issues or deferred items linked to follow-up tickets.
```

Labels:

```text
content, cms, launch-quality, quarterly
```

## Workflow

1. Open the recurring task two weeks before the due date.
2. Copy `docs/launch/quarterly-refresh-checklist.md` into the task or attach it.
3. Create a refresh branch.
4. Audit current content against this checklist.
5. Draft EN changes first.
6. Schedule VI translation and native review before publishing.
7. Publish through Sanity.
8. Verify ISR revalidation.
9. Run smoke tests and accessibility checks.
10. Commit `docs/launch/refresh-{yyyy-q}.md`.
11. Close the tracker task only after the log is committed.

## Content Surfaces

| Surface | Required review |
|---|---|
| Home | Current positioning, headline, proof points, featured CTA state. |
| Work | Add or refresh at least one case study; retire stale featured work. |
| Capabilities | New services, retired services, changed delivery model. |
| Team | Joiners, leavers, roles, public profile details. |
| Careers | ATS open roles and hiring badge state. |
| Testimonials | At least one refreshed quote or client proof point. |
| Accessibility | Known issues and last-reviewed date if a11y audit happened. |
| Vietnamese routes | VI parity for every changed EN page. |

## Quality Gates

Before publish:

- Voice-rules check has 0 banned-word violations.
- Vietnamese copy has native review when changed.
- No NDA-sensitive client details are published without approval.
- Case-study metrics are attributable or approved for public use.
- Public DUNS and company metrics are current.

After publish:

- ISR webhook or revalidate endpoint confirms changed paths refreshed.
- Sitemap includes any new case-study route.
- Smoke tests pass on EN and VI changed routes.
- Lighthouse or axe checks run on changed routes when UI changed.

## Refresh Log Naming

Use this path:

```text
docs/launch/refresh-YYYY-qN.md
```

Examples:

- `docs/launch/refresh-2026-q2.md`
- `docs/launch/refresh-2026-q3.md`
- `docs/launch/refresh-2026-q4.md`

Do not close the recurring task without a log.

## Current Blocker

This workspace cannot create the actual recurring tracker task because no Linear or Asana connector is active. The task payload above is ready for manual creation.
