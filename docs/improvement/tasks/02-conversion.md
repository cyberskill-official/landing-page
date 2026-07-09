# Epic 2 - conversion mechanics

Goal: more of the visitors who already like the page turn into enquiries, with less friction and a clearer promise. Copy changes ship EN and VI together (lib/content/ dictionaries; never hardcode strings in components).

---

### CONV-01 Outcome-led CTA copy variant
Wave 2 | owner: mixed | effort: S | depends: input (approved promise wording)

Why: "Start my project" names an action; a result ("Get a scoped build plan within 3 business days") converts better and is testable.

Agent does: add the approved variant to the dictionaries for the hero and contact-band CTAs (EN/VI); emit the CTA location in the click event (see MEAS-01) so variants can be compared later; keep the old strings commented in the dictionary for easy rollback.
Stephen does: approve the promise (it becomes a real commitment).

Done when: both locales render the new CTA, click events carry location, gates green.

---

### CONV-02 Call-booking path on contact + thank-you
Wave 1 | owner: mixed | effort: S | depends: input (booking URL)

Why: many buyers pick a time slot but never write a message.

Agent does: add a "Book a 30-minute call" secondary button in the contact section and on the thank-you state (CONV-03), opening the booking URL in a new tab; track booking_clicked; EN/VI labels.
Stephen does: create the Cal.com (or similar) event type, 30 minutes, with buffer rules, and provide the URL (store as NEXT_PUBLIC_BOOKING_URL; the button renders only when set).

Done when: button renders when env set, hidden when not; event fires; gates green.

---

### CONV-03 Thank-you state with next steps + form trust line
Wave 1 | owner: agent | effort: M | depends: none

Why: the moment after submit is the highest-attention moment; today it is wasted, and the one-business-day promise only appears before the form.

Do:
1. In components/cta/LeadForm.tsx, replace the bare success message with a panel: confirmation, what happens next (read today; a person replies within one business day from info@cyberskill.world), the booking button (CONV-02, when configured), and later the newsletter checkbox (NURT-01).
2. Add one line under the Send button before submit: who reads the message and which address the reply comes from.
3. Same states for the Lumi chat lead flow where it confirms capture.
4. EN/VI dictionary entries; unit test the state transition.

Done when: submit shows the panel in both locales, pre-submit trust line renders, tests cover success and error paths, gates green.

---

### CONV-04 Auto-acknowledgement email to the lead
Wave 1 | owner: agent | effort: M | depends: LEAD-01 (env)

Why: instant confirmation sets the reply expectation, proves deliverability, and opens nurture.

Do:
1. In app/api/lead/route.ts, add a fifth best-effort sink: acknowledgeLead(record) sending via Resend to the lead's address, from a named human sender (config in lib/content/site.ts), localized by record.locale.
2. Content: thanks, what happens next, the one-business-day promise, contact details, booking link when configured. Plain text first; no tracking pixels.
3. Skip for source "synthetic". Unit test: called with lead locale VI gets the VI template; failure of this sink never fails the request.

Done when: tests green, template strings live in the dictionaries, gates green. (Live proof folds into LEAD-05.)

---

### CONV-05 Zalo + WhatsApp one-tap contacts
Wave 2 | owner: mixed | effort: S | depends: input (Zalo OA link, WhatsApp number)

Why: VN buyers reach for Zalo, international ones for WhatsApp; both beat forms on mobile.

Agent does: add config-driven contact chips (Zalo, WhatsApp wa.me link) to the contact section and footer; show only configured ones; track clicks; EN/VI labels.
Stephen does: provide the Zalo OA (or personal Zalo) link and the WhatsApp business number.

Done when: chips render from config, hidden when unset, events fire, gates green.

---

### CONV-06 Engagement models + price signals section
Wave 2 | owner: mixed | effort: M | depends: input (price ranges)

Why: price is the question every visitor has and never asks; ranges filter out bad-fit leads.

Agent does: build a three-card section (fixed-scope project, monthly product team, support retainer): what it is, what it fits, typical starting range, typical timeline, CTA. Draft placeholder copy EN/VI clearly marked FOR REVIEW; add matching FAQ entries (GEO-01) once ranges are real.
Stephen does: decide the ranges and approve wording.

Done when: section ships behind accurate content (not placeholders) in both locales, linked from services and FAQ, gates green.

---

### CONV-07 Company profile one-pager PDF (EN/VI)
Wave 2 | owner: mixed | effort: M | depends: input (final approval)

Why: procurement and directors get forwarded a PDF, not a scroll story.

Agent does: produce a one-page profile per locale from existing site content (entity sentence, services, process, proof, contact, DUNS), styled on the design system; store under public/downloads/; link from the footer and the thank-you panel; track downloads.
Stephen does: approve content before it goes live.

Done when: both PDFs downloadable, under 1 MB each, linked and tracked, gates green.

---

### CONV-08 Persistent mobile CTA audit across all chapters
Wave 2 | owner: agent | effort: S | depends: none

Why: the cinematic page is long; the enquiry action must be reachable at every scroll position on a phone.

Do:
1. Audit the bottom CTA bar on mobile viewports across every chapter and route (including /vi and long pages like work detail): visibility, overlap with the chapter rail, safe-area insets, focus order.
2. Fix what fails; add a viewport test or an axe-route check where feasible; note findings per chapter in the ledger entry.

Done when: CTA reachable at every chapter on 360px and 390px widths, no overlap, gates green.

---

### CONV-09 True capacity line
Wave 3 | owner: mixed | effort: S | depends: input (capacity truth)

Why: honest scarcity ("we start at most N new projects per quarter; next open slot: month") nudges decisions without pressure tactics.

Agent does: add a small config (lib/content/site.ts) for capacity and next-slot month, rendered near the contact heading in both locales; hidden when unset.
Stephen does: keep the value true; update quarterly.

Done when: renders from config, hidden when unset, gates green.
