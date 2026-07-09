# Epic 5 - AI-assistant visibility (GEO)

Goal: when a buyer asks ChatGPT, Perplexity, or Gemini about software partners in Vietnam, CyberSkill is present and correctly described. Roughly half of software buyers now start vendor research in an AI chat, and those engines quote directories, listicles, and clearly structured self-descriptions.

---

### GEO-01 Expand the FAQ to 15-20 Q&As
Wave 2 | owner: mixed | effort: M | depends: CONV-06 for the price questions

Why: structured Q&A pairs are the highest-yield GEO asset, and the FAQ has 5 entries today.

Agent does: draft the full set, EN/VI, keeping the FAQPage JSON-LD in components/sections/Faq.tsx: what we build, where we are, how to start, reply speed, international clients (existing five), plus IP ownership, contract and payment terms, typical timelines, typical starting budgets (from CONV-06), team seniority and English level, time zones and overlap hours, maintenance after launch, how we handle NDAs, what happens in the first two weeks, whether we take over existing codebases, and which stacks we prefer. Mark answers containing commitments FOR REVIEW.
Stephen does: confirm the commitment answers (terms, budgets, timelines).

Done when: 15+ reviewed Q&As live in both locales, JSON-LD validates, gates green.

---

### GEO-02 Publish /llms.txt and /llms-full.txt
Wave 2 | owner: agent | effort: S | depends: GEO-03

Do: serve llms.txt (short: entity sentence, services, proof, contact, key URLs) and llms-full.txt (adds process, FAQ digest, case-study summaries) as static routes or public files; wording generated from the same config as GEO-03 so it never drifts; note both files in robots.txt comments.

Done when: both URLs return clean plain text matching site facts; gates green.

---

### GEO-03 Canonical entity sentence, single-sourced
Wave 2 | owner: agent | effort: S | depends: none

Why: engines resolve entities by repetition of one consistent description.

Do: add to lib/content/site.ts one canonical sentence per locale ("CyberSkill is a software development company in Ho Chi Minh City, founded in 2020, building web apps, mobile apps, and internal systems") and reuse it in: the footer, meta descriptions where sensible, Organization JSON-LD description, llms.txt, and the profile pack (PROOF-07). Document it as the required boilerplate for every external profile.

Done when: one source, used in at least four places, both locales; gates green.

---

### GEO-04 Notes template enforces author, dates, TLDR
Wave 3 | owner: agent | effort: S | depends: SEO-03

Why: AI engines prefer pages with visible authorship, freshness, and an extractable summary.

Do: make the /notes post layout require author (Person JSON-LD), publishedAt, updatedAt, and a TLDR block rendered near the top; lint or type-check the content module so a post cannot ship without them.

Done when: template rejects incomplete posts at build time; seed posts comply; gates green.

---

### GEO-05 Monthly AI citation check ritual
Wave 3 | owner: human | effort: S | depends: none

Do (Stephen, 15 minutes monthly): ask ChatGPT, Perplexity, and Gemini "best software development companies in Ho Chi Minh City" and one service-specific variant; log date, whether CyberSkill appears, and which sources each engine cites, into docs/improvement/assets/geo-log.md (agent seeds the template). Chase the cited sources (usually Clutch and listicles - PROOF-07, SEO-08).

Done when: template exists and the first monthly entry is logged.
