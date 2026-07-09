# Epic 7 - measurement

Goal: every improvement in this backlog becomes checkable. The stack stays light: Vercel Analytics custom events (the existing track() helper and /api/analytics route), Sentry for failures, Clarity for behavior, Search Console for queries.

---

### MEAS-01 Event taxonomy + instrument both lead paths
Wave 1 | owner: agent | effort: M | depends: none

Why: the chat panel already tracks wish_flow_started and lead_submitted (source "lumi-chat"); the classic form emits nothing, so the main funnel is invisible.

Do:
1. Define the taxonomy in docs/improvement/assets/events.md: lead_submitted {source: form|lumi-chat|teardown|synthetic, locale}, cta_clicked {location: hero|contact|nav|thankyou, label}, booking_clicked, newsletter_subscribed {placement}, faq_opened {id}, chapter_reached {chapter} (fires once per chapter per session, throttled).
2. Implement: form-path lead_submitted in components/cta/LeadForm.tsx; cta_clicked on the hero, contact band, and nav CTAs; chapter_reached from the existing chapter rail logic; faq_opened on the accordion.
3. Keep events cookieless and payloads free of personal data (no emails in event properties).
4. Unit-test the form event fire; verify the rest via dev-mode logging noted in the ledger.

Done when: taxonomy doc exists, all listed events fire in dev, no PII in properties, gates green.

---

### MEAS-02 Microsoft Clarity integration
Wave 2 | owner: mixed | effort: S | depends: input (Clarity project id)

Why: ten session replays teach more about where the cinematic loses people than a month of aggregates.

Agent does: add the Clarity snippet loaded only in production, gated on NEXT_PUBLIC_CLARITY_ID, configured for cookieless mode; confirm it stays within the third-party count budget (max 10) and does not regress LCP/TBT budgets.
Stephen does: create the Clarity project, provide the id, review replays fortnightly at first.

Done when: Clarity records sessions on production, budgets hold, gates green.

---

### MEAS-03 UTM standards + source capture into the lead payload
Wave 2 | owner: agent | effort: S | depends: none

Do:
1. Write the UTM standard (docs/improvement/assets/events.md): utm_source per profile (clutch, linkedin, zalo, gbp, newsletter, github), utm_medium (profile|social|email), utm_campaign free.
2. On landing, persist utm_* (sessionStorage) and, when a lead or subscription is submitted, attach the stored source into the payload's source/context fields (schema update in lib/lead/schema.ts, forwarded unchanged to CyberOS).
3. Generate the ready-to-paste tagged URLs for every external profile.

Done when: a visit with UTMs produces a lead record carrying them (unit test), tagged URL list delivered, gates green.

---

### MEAS-04 Weekly funnel one-pager
Wave 2 | owner: mixed | effort: S | depends: MEAS-01

Agent does: create the template (docs/improvement/assets/funnel-weekly.md): visitors (Vercel Analytics), leads by source, booked calls, newsletter net adds, median first-reply time, one note on what changed; document where each number comes from.
Stephen does: fill it weekly (15 minutes), ideally right after the NURT-04 lead review.

Done when: template exists and two consecutive weeks are filled in.

---

### MEAS-05 Monthly Search Console review
Wave 3 | owner: human | effort: S | depends: SEO-07

Do: monthly, 15 minutes: top queries and pages for /en and /vi, coverage errors, and whether the SEO-01 title changes moved impressions; log one line per month in docs/improvement/assets/seo-log.md (agent seeds the template with the checklist).

Done when: template exists and the first monthly entry is logged.
