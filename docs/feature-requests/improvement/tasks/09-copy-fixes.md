# Epic 9 - copy and small fixes

Goal: small inconsistencies that cost trust or clarity, each cheap to fix.

---

### COPY-01 VI footer parity: How-we-build link
Wave 1 | owner: agent | effort: S | depends: none

Why: the EN footer links How we build; the VI footer omits it, so Vietnamese visitors never find the strongest trust page.

Do: add the localized link to the VI footer (and confirm every other footer item matches across locales). Nav promotion is PROOF-11; this task is footer parity only.

Done when: footers match across locales, gates green.

---

### COPY-02 Unify the Team anchor
Wave 1 | owner: agent | effort: S | depends: none

Why: the home nav points Team to /en#team while subpage navs point to /en#proof; one of them lies.

Do: pick #team as canonical, make every nav emit it, and ensure the anchor lands on the team content (the PROOF-05 section once it exists; until then, the current proof band). Add a redirect-free smooth-scroll check on both locales.

Done when: all navs point to #team and the anchor resolves on every route, gates green.

---

### COPY-03 Hero subline names the audience
Wave 2 | owner: mixed | effort: S | depends: input (audience wording)

Why: "the kind your team actually runs on" says what; it never says for whom.

Agent does: draft three audience options (EN/VI), e.g. "for operations-heavy SMEs, funded startups, and agencies that need a build partner"; wire the chosen one into the hero subline dictionaries.
Stephen does: pick one (it steers lead quality more than any animation).

Done when: chosen subline live in both locales, gates green.

---

### COPY-04 Careers talent-pool email capture
Wave 2 | owner: agent | effort: S | depends: NURT-01 (subscribe API)

Why: when no roles are open the careers page is a dead end; a capture keeps the pipeline warm and feeds hiring later.

Do: on [lang]/careers, when the open-roles list is empty, render an email capture ("leave your email; we hire slowly and honestly") posting to /api/subscribe with audience tag "talent"; EN/VI; honeypot; track signup.

Done when: empty state shows the capture in both locales, tagged correctly, gates green.

---

### COPY-05 Partnership section for agencies abroad
Wave 3 | owner: mixed | effort: M | depends: input (offer approval)

Why: the contact form already offers "a partnership" intent with nothing behind it; white-label build capacity for foreign agencies fits the cost position and the market's growth.

Agent does: draft a short section (or /partners page): who it serves (agencies and consultancies needing a reliable build team in Asia), how it works (their client, our build, joint standards), proof points, and a partner-specific CTA; EN/VI, FOR REVIEW.
Stephen does: approve the offer shape and any exclusivity/white-label terms.

Done when: section live with approved copy in both locales, partnership leads route per NURT-03, gates green.
