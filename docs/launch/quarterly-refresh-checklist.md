# Quarterly Refresh Checklist

Use this checklist for each FR-CMS-011 quarterly content refresh. Copy it into `docs/launch/refresh-YYYY-qN.md`, complete it, and commit the log.

## Metadata

- Quarter:
- Refresh owner:
- Content reviewer:
- Vietnamese reviewer:
- Frontend reviewer:
- Branch:
- Sanity dataset:
- Publish date:
- Refresh log path:

## Pre-Refresh

- [ ] Confirm the recurring Linear or Asana task exists.
- [ ] Confirm the quarter due date.
- [ ] Create or identify the refresh branch.
- [ ] Pull current public metrics.
- [ ] Confirm current headcount and team roster with founder.
- [ ] Confirm active ATS roles.
- [ ] Identify at least one new or refreshed case study.
- [ ] Identify outdated case studies older than 18 months.
- [ ] Confirm client permissions and NDA boundaries.
- [ ] Identify one or more testimonials to refresh.
- [ ] Identify EN pages that need updates.
- [ ] Identify matching VI pages that need translation or review.

## Content Updates

- [ ] Home page proof points current.
- [ ] Featured case study current.
- [ ] Work index includes the new or refreshed case study.
- [ ] Outdated featured case studies are retired from featured placement.
- [ ] Capabilities page reflects current services.
- [ ] Team page reflects joiners, leavers, and role changes.
- [ ] Careers page and hiring badge match ATS.
- [ ] Testimonials are current and approved.
- [ ] Accessibility page known issues and review date are current if audit status changed.
- [ ] Sitemap-impacting routes are listed.

## Vietnamese Parity

- [ ] Every changed EN field has VI copy scheduled.
- [ ] VI copy is reviewed by a native reviewer.
- [ ] Tone matches the approved Vietnamese register.
- [ ] No EN-only case study remains public unless explicitly approved.
- [ ] `/vi` routes smoke-tested after publish.

## Voice And Compliance

- [ ] Voice-rules check runs with 0 banned-word violations.
- [ ] Claims, metrics, and numbers are source-backed.
- [ ] NDA-sensitive details removed or approved.
- [ ] Testimonials have permission to publish.
- [ ] Accessibility-impacting copy changes keep labels clear and specific.

## Sanity And ISR

- [ ] Publish EN documents in Sanity.
- [ ] Publish VI documents in Sanity.
- [ ] Confirm Sanity webhook signature is configured.
- [ ] Confirm `/api/revalidate` receives the publish event.
- [ ] Confirm changed paths are revalidated.
- [ ] Confirm stale content is no longer visible in browser.

## Smoke Tests

- [ ] `/`
- [ ] `/vi`
- [ ] `/work`
- [ ] `/vi/work`
- [ ] New or refreshed `/work/{slug}`
- [ ] New or refreshed `/vi/work/{slug}`
- [ ] `/capabilities`
- [ ] `/vi/capabilities`
- [ ] `/team`
- [ ] `/vi/team`
- [ ] `/careers`
- [ ] `/vi/careers`

## Technical Checks

Run these when the refresh changes rendered pages:

```bash
node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit
cd apps/web && node_modules/.bin/playwright test tests/a11y/all-routes.spec.ts --project=chromium
cd apps/web && node_modules/.bin/next build
```

Run targeted tests for changed features when needed:

- Case study rendering: `apps/web/tests` work-route coverage.
- Accessibility statement changes: `tests/a11y/accessibility-statement.e2e.spec.ts`.
- CTA or careers changes: CTA and jobs-count tests.
- Localization changes: VI route smoke and copy tests.

## Refresh Log Template

```markdown
# Q{N} {YYYY} content refresh - {YYYY-MM-DD}

Owner:
Reviewers:
Branch:
Sanity dataset:

## Summary

- New or refreshed case study:
- Testimonials refreshed:
- Metrics updated:
- Team updates:
- Jobs sync:
- VI parity status:

## Changed Surfaces

| Surface | Change | EN | VI | Reviewer |
|---|---|---|---|---|
| Home | | | | |
| Work | | | | |
| Capabilities | | | | |
| Team | | | | |
| Careers | | | | |

## Verification

- Voice-rules result:
- VI native review:
- ISR revalidation:
- Smoke tests:
- Accessibility checks:
- Build:

## Known Issues Or Follow-Ups

- 

## Next Refresh

- Due:
- Owner:
```

## Closure

- [ ] Refresh log committed.
- [ ] Follow-up tickets created for deferred work.
- [ ] Project tracker task closed.
- [ ] Next quarterly recurrence visible in tracker.
