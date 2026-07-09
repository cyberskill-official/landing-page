# Epic 3 - proof and trust

Goal: replace archetypes and adjectives with named, verifiable proof. This is the highest-return content work on the site: today there are no client names, no metrics, no testimonials, no team faces, and no social links.

---

### PROOF-01 Client permission outreach
Wave 2 | owner: mixed | effort: S | depends: none

Agent does: draft the permission-request email (EN and VI) asking a past client for: use of name and logo, 2-3 outcome numbers, a short quote with name/title/photo, and screenshot approval; include a light consent line and an easy opt-down ("industry only" option). Save drafts under docs/improvement/assets/outreach/.
Stephen does: pick the two or three friendliest past clients and send.

Done when: drafts exist in both languages; Stephen has sent at least two.

---

### PROOF-02 One real case study with metrics
Wave 2 | owner: mixed | effort: L | depends: PROOF-01

Why: one real story outperforms three archetypes.

Agent does: extend the work detail template with a metrics band (2-3 numbers with labels), a client quote block, and a screenshot slot; migrate one archetype page to the real content once provided; keep the two remaining archetypes but label them as anonymized patterns; EN/VI.
Stephen does: supply the client facts, numbers, quote, screenshots.

Done when: one /work/[slug] page shows a named (or industry-labeled per permission) client with real numbers and a quote, in both locales, gates green.

---

### PROOF-03 Testimonial block beside every major CTA
Wave 2 | owner: mixed | effort: M | depends: PROOF-01

Why: a trust signal within view of the ask is the highest-lift placement pattern in the research.

Agent does: build a small Testimonial component (quote, name, title, optional photo) sourced from a testimonials array in lib/content/site.ts; place one next to the hero CTA, the contact band, and the services section; rotate if more than three exist; EN/VI (quotes stay in original language with a translation line).
Stephen does: supply 3-5 quotes with attribution.

Done when: component renders real quotes at all three placements, empty-state hides cleanly, gates green.

---

### PROOF-04 Client logo strip
Wave 2 | owner: mixed | effort: S | depends: PROOF-01

Agent does: interim version now: replace nothing, add an honest line near the hero stats ("Teams in logistics, education, and retail run on software we built") sourced from config. Final version when logos arrive: a grayscale logo row (static, not animated) near the hero and contact band, config-driven, with alt text.
Stephen does: collect logo files + written permission.

Done when: interim line live now; logo row ships when at least three logos exist; gates green.

---

### PROOF-05 Team section with real names and faces
Wave 2 | owner: mixed | effort: M | depends: input (photos, names, one-liners)

Why: the copy promises "you always know who is building what"; the nav promises "Team"; the page shows neither.

Agent does: build a team section on the home page at the #team anchor: founder card (Stephen, photo, one line, LinkedIn link) plus senior engineer cards; graceful with 2-6 people; EN/VI; lazy-loaded images sized within the image budget.
Stephen does: provide photos, names or initials-plus-role where privacy matters, and one line each.

Done when: section renders real people at #team in both locales, budgets hold, gates green. (Anchor unification is COPY-02.)

---

### PROOF-06 Founder LinkedIn program
Wave 3 | owner: mixed | effort: M | depends: none

Why: buyers check the founder before agreeing to a call; consistent posting is the cheapest awareness channel available.

Agent does: draft the first four posts (EN, one optionally VI) from existing material: the wish-arc story, a build-notes lesson, the how-we-build gates, a teardown insight; plus a profile checklist (headline, about, featured links to the site and case study).
Stephen does: polish, post 1-2 times per week, and keep it going.

Done when: drafts delivered under docs/improvement/assets/linkedin/; profile checklist done; first post published.

---

### PROOF-07 Directory profiles
Wave 1 | owner: human | effort: M | depends: GEO-03 (entity sentence)

Why: Clutch, GoodFirms, and Google Business are what buyers cross-check and what AI assistants cite for "software companies in Vietnam".

Do (Stephen, with agent-prepared pack): create profiles on Clutch, GoodFirms, DesignRush; create the Google Business Profile for the HCMC address (choose "Software company"); create ITviec/TopDev employer pages. Use the canonical entity sentence, the same logo, the same NAP (name, address, phone) everywhere, and site links with UTM parameters (MEAS-03).
Agent does (support): assemble the profile pack: entity sentence, boilerplate descriptions long and short (EN/VI), logo paths, service list, category suggestions - saved under docs/improvement/assets/profiles.md.

Done when: profiles live and consistent; URLs recorded in BACKLOG.md inputs and wired into PROOF-09/12.

---

### PROOF-08 Review requests to past clients
Wave 2 | owner: mixed | effort: S | depends: PROOF-07

Agent does: draft the review-request email (EN/VI) with direct links to the Clutch review form and the Google review link; short, specific, one ask.
Stephen does: send to 3-5 past clients; follow up once.

Done when: at least two verified reviews live on Clutch or Google.

---

### PROOF-09 Footer social links row
Wave 1 | owner: mixed | effort: S | depends: input (profile URLs)

Why: no social links anywhere reads as a red flag for a software company.

Agent does: add a config-driven social row (LinkedIn, GitHub, Zalo, Facebook) to the footer, icons with accessible names, rel="me noopener", rendered only for configured URLs; EN/VI aria labels.
Stephen does: supply the URLs (LinkedIn company page and GitHub org minimum).

Done when: row renders configured links in both locales, gates green.

---

### PROOF-10 "Verify us" trust block
Wave 2 | owner: mixed | effort: S | depends: input (tax/registration number)

Agent does: a compact block (footer-adjacent or /how-we-build): registered legal name, founding year, DUNS 673219568, tax/registration number, address with a static map image linking to Google Maps (no embedded iframe, no consent burden), GitHub link; EN/VI.
Stephen does: provide the tax/registration number and confirm wording.

Done when: block live in both locales with all fields real, gates green.

---

### PROOF-11 Quality gates as marketing
Wave 2 | owner: agent | effort: S | depends: none

Why: the repo enforces budgets, a11y checks, and CI regression gates; almost no competitor can show that. It is proof, currently invisible.

Do:
1. Promote "How we build" into the main nav in both locales (it is footer-only in EN and absent in VI today; footer parity itself is COPY-01).
2. On /how-we-build, add a "gates we hold ourselves to" list: CI fails on regressions, Lighthouse budgets with the actual numbers, APCA contrast checks, axe route scans, and link the accessibility statement.

Done when: nav updated in both locales, gates list live with real numbers, gates green.

---

### PROOF-12 Organization JSON-LD enrichment
Wave 2 | owner: agent | effort: S | depends: PROOF-07, PROOF-09 (URLs)

Do:
1. Extend components/seo/OrganizationJsonLd.tsx: sameAs (all live profile URLs from config), founder (Person), foundingDate "2020", address (PostalAddress), and a ProfessionalService or LocalBusiness node with geo and openingHours.
2. Only emit URLs that exist in config; validate output with the Rich Results test and record the result in the ledger.

Done when: JSON-LD validates with the enriched fields on home in both locales, gates green.

---

### PROOF-13 Measured numbers band
Wave 3 | owner: mixed | effort: M | depends: MEAS-01 running long enough to trust the numbers

Why: "we answer within one business day" is stronger as "median first reply: 3 h 40 m, last 90 days".

Agent does: a stats config + small band rendering measured values (median reply time, releases shipped last month, years running); values updated manually or by a tiny script fed from the weekly funnel review (MEAS-04).
Stephen does: bless the numbers before each update.

Done when: band renders real measured values with a "last updated" date, both locales, gates green. Status stays deferred until data exists.
