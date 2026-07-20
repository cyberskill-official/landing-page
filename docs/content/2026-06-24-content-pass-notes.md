# Content pass - 2026-06-24 (branch auto/content-first-draft, review-only)

What changed and, more importantly, what is deliberately left for you. Nothing here is merged - review on the branch, then decide.

## The honesty line I held

I did not invent client names, metrics, or testimonial quotes. On a live company site those read as real claims, and fabricated endorsements are both misleading and, in many places, against the rules for advertising. So this pass removes the one fabricated element and sharpens the rest into copy that is true as written.

## Changed

Testimonials. The two quotes attributed to "Client reference" were invented, so I removed them. `testimonials` is now an empty array. When it is empty, the proof section no longer says "What clients say" over fake quotes - it renders three first-person commitments under a "How we work" heading (we answer for the work; honest about trade-offs; built to last and measured). Those are honest claims about how the team works, not third-party endorsements, so they are safe to run live. The verifiable trust line (registered company since 2020, DUNS) stays. The moment you add real, cleared, attributed quotes to `testimonials`, the section automatically switches back to "What clients say" and renders them.

Case studies. They were already written honestly (generic sector labels, no invented names or logos), but a couple of lines implied an unverified number ("cut order-processing time by a measured margin"). I reframed those to describe what the software does, which is true of the capability without claiming a specific past result: e.g. the operations platform is now "one shared operations view the whole team works from, instead of reconciling files by hand." Sector labels are now plain ("Logistics operations", "Education", "Retail").

## Still needs you (cannot be done honestly without real data)

Real case studies and testimonials. The format is ready; only you have the content. Send the items in `docs/content/case-study-testimonial-intake.md` - a named or agreed-anonymized client, a cleared result, and for quotes the verbatim approved text with attribution - and I will wire them in. Until then the site stands on honest capability copy and first-person commitments, which is the correct state, not a gap to paper over.

Vietnamese review. All new strings ship with a Vietnamese draft; a native pass is still worth doing before you lean on the VN site for outreach.

## Why this is a branch, not a deploy

It changes live marketing copy and removes a section's content. That is your call to publish, so it waits on review rather than auto-deploying.
