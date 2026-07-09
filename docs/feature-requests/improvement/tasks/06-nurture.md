# Epic 6 - nurture and updates

Goal: the site stops being a one-shot pitch. Every lead gets acknowledged, useful email arrives on a cadence, and returning visitors find something new. Today nothing on the site captures an email for later and there is no newsletter, blog, changelog, or social link.

Reported benchmarks worth designing around: first welcome emails open at 52-68%; welcome series convert to qualified leads at the highest rate of any sequence type; value-first ordering (insight, example, then the ask) is what keeps a list alive. Cadence: monthly newsletter, sequence emails 3-7 days apart.

---

### NURT-01 Newsletter capture + double opt-in
Wave 2 | owner: agent | effort: M | depends: LEAD-01 (Resend key)

Do:
1. Add /api/subscribe: zod-validated email + locale + honeypot; on success, add contact to a Resend Audience (env RESEND_AUDIENCE_ID, no-op without it) and send a confirmation email (double opt-in) with a signed confirm link; only confirmed contacts get flagged subscribed.
2. Placement: footer, after the FAQ, and a checkbox on the thank-you panel (CONV-03). Name the promise: "Build notes - one email a month: what we shipped, one lesson, one teardown." EN/VI.
3. Track newsletter_subscribed (MEAS-01); unit tests for the API (validation, honeypot, no-op without env).

Done when: end-to-end double opt-in works against a test audience, all three placements render in both locales, gates green.

---

### NURT-02 Welcome sequence (three emails)
Wave 2 | owner: mixed | effort: M | depends: NURT-01

Agent does: draft EN (+VI) sequences per intent where it matters, default: (1) day 0, one useful insight (how we scope a build in plain language); (2) day 4-5, one real example (the PROOF-02 case study); (3) day 10-12, the invitation (booking link, what a first call covers). Plain text tone, one idea per email, no pitch before email three. Store under docs/improvement/assets/email/; implement as Resend broadcasts or scheduled sends (manual trigger acceptable at first; document the operating step).
Stephen does: approve copy; send or schedule.

Done when: three approved emails exist per locale and the operating procedure (who sends, when) is written down.

---

### NURT-03 Intent-based routing map + payload tags
Wave 2 | owner: agent | effort: S | depends: LEAD-02

Do: document and encode the mapping: intent "a project" -> sales nurture (NURT-02), "a partnership" -> partner track (COPY-05 material), "a role" -> talent pool (COPY-04 list), "something else" -> manual triage. Ensure the lead payload forwarded to CyberOS carries intent and source unchanged (it does today; add a test asserting it) and add the track name to the record.

Done when: mapping documented in this file, payload test green, gates green.

---

### NURT-04 Lead system of record + SLA ritual
Wave 2 | owner: mixed | effort: M | depends: LEAD-02

Agent does: write the operating doc: every lead lands in CyberOS with status (new, contacted, proposal, won, lost) and a next-action date; propose the status fields to the CyberOS lead record if missing; define the weekly 15-minute review (leads by source, status moves, median first-reply time vs the one-business-day promise).
Stephen does: run the ritual weekly; keep statuses honest. Interim before CyberOS: a shared sheet with the same columns.

Done when: doc exists, first weekly review done, median reply time measured once.

---

### NURT-05 Public changelog ("now" page)
Wave 3 | owner: agent | effort: M | depends: none

Why: returning visitors and nurture emails need fresh, low-cost material; the team ships constantly and none of it is visible.

Do: add [lang]/now: a reverse-chronological list of shipped items (month, one line, optional link) from a typed content module; seed from real recent history (site launches, Lumi, CyberOS milestones that are public-safe); link from the footer; the newsletter reuses these items.

Done when: page live with 6+ real entries in both locales, linked in the footer, gates green.

---

### NURT-06 Share workflow: LinkedIn + Zalo OA + UTM standards
Wave 3 | owner: mixed | effort: S | depends: SEO-03

Agent does: write the per-post checklist (publish note -> share to LinkedIn company page + founder profile with a native summary, Zalo OA broadcast for VI posts, all links carrying the UTM standard from MEAS-03); create ready-to-edit share templates.
Stephen does: follow it per post (or delegate).

Done when: checklist + templates exist; first post shared through the full loop.

---

### NURT-07 Quarterly client letter
Wave 3 | owner: mixed | effort: S | depends: none

Agent does: draft the template (EN/VI): what we shipped, current availability, one useful idea, one referral ask; personalization slots per client.
Stephen does: send quarterly to past and current clients from info@ or his own address.

Done when: template exists; first letter sent; replies handled through the SLA ritual.

---

### NURT-08 Teardown lead magnet funnel
Wave 3 | owner: mixed | effort: L | depends: NURT-01

Why: "a 15-point teardown of your website or internal tool, free, in 3 business days" converts qualified buyers and reuses work the team already does one-off.

Agent does: productize the teardown checklist into a template (from the existing consulting-report method); add a landing section or page (EN/VI) with the offer and a dedicated form (email + URL + context); route submissions through /api/lead with source "teardown"; deliver the finished PDF by email; track the funnel.
Stephen does: cap the volume (e.g. two per week), do or delegate the teardowns, approve the offer copy.

Done when: offer live, first teardown delivered, funnel events visible.

---

### NURT-09 Consent layer decision doc (pre-pixels)
Wave 3 | owner: agent | effort: S | depends: none

Why: Vercel Analytics is cookieless, so the site needs no banner today; LinkedIn/Meta pixels would change that (Vietnam PDPD plus GDPR for EU visitors).

Do: write the decision doc: what triggers the need (any pixel or non-cookieless tool), the shortlist of consent solutions compatible with the stack, the PDPD notes, and the recommendation to defer until retargeting has content to point at. No implementation.

Done when: doc exists under docs/improvement/assets/consent.md and is referenced by any future pixel task.

---

### NURT-10 Market the live client portal
Wave 3 | owner: human | effort: - | depends: CyberOS client portal being real

Do: once clients genuinely follow progress in CyberOS (chat, statuses), add a section selling that experience ("watch your project live, not in a monthly PDF") with a screenshot. Until then this stays deferred; do not market vaporware.

Done when: portal is real for at least one client and the section ships with a real screenshot.
