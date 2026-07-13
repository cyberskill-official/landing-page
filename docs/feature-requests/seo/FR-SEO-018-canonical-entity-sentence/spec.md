---
id: FR-SEO-018
title: "One canonical entity sentence, single-sourced and reused everywhere"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/section-2, growth/GEO-03]
---

# FR-SEO-018: One canonical entity sentence, single-sourced and reused everywhere

## 0. Why (evidence)

Audit A: answer engines resolve entities by repetition of one consistent description, and CyberSkill's is contaminated by
an unrelated Australian company of the same name and by its own sub-projects (ccaf., cyberos-wiki.). The sub-sites already
carry a crisp sentence LLMs can lift verbatim; the main site has no single source for it.

## 1. Description (normative)

- 1.1 lib/content/site.ts SHALL hold exactly one canonical entity sentence per locale (legal entity, what it does, where, founded).
- 1.2 That sentence SHALL be the source for: the Organization JSON-LD description, the footer, the llms files, the OG/meta description where sensible, and the external-profile pack (FR-BIZ-005).
- 1.3 A test SHALL assert the sentence appears, byte-identical, in at least four surfaces per locale.
- 1.4 The sentence SHALL be documented as the required boilerplate for every external profile and directory listing.

## 2. Acceptance criteria

- [ ] AC for 1.1 - one exported constant per locale; no second copy exists in the repo - test: `content/entity-sentence-single-source`
- [ ] AC for 1.2 - it appears in >= 4 rendered surfaces per locale - test: `content/entity-sentence-single-source`
- [ ] AC for 1.3 - editing it updates every surface with no further change - test: `content/entity-sentence-single-source`
- [ ] AC for 1.4 - the sentence is documented as required external-profile boilerplate and the profile pack quotes it verbatim - test: `docs/profile-pack`

## 3. Edge cases

- Vietnamese phrasing must be natural, not a transliteration.
- Length: some surfaces (meta description) cap at 160 characters - a short and a long variant may exist, both single-sourced.

## 4. Out of scope / non-goals

- Creating the external profiles (FR-BIZ-005).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
