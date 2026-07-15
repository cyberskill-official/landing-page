---
id: TASK-SEO-017
title: "Publish llms.txt / llms-full.txt and take an explicit AI-crawler position"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [TASK-SEO-018]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-6, audit-C/geo, audit-B/finding-13-low, growth/GEO-02]
---

# TASK-SEO-017: Publish llms.txt / llms-full.txt and take an explicit AI-crawler position

## 0. Why (evidence)

All three audits confirm the /llms.txt probe returns 404. Audit C is honest that llms.txt is an emerging convention with
roughly ten percent adoption that Google has said it will not support - it is low-cost insurance, not a ranking lever.
The audits agree on the real value: a clean, curated entity map that also disambiguates CyberSkill from the unrelated
Australian "Cyberskill" cybersecurity-training company (audit A §2), plus a deliberate, stated position on GPTBot,
ClaudeBot, PerplexityBot and Google-Extended instead of the current silent allow-all.

## 1. Description (normative)

- 1.1 The site SHALL serve `/llms.txt` (entity sentence, services, proof, contact, key URLs) and `/llms-full.txt` (adds process, FAQ digest, case-study summaries) as plain text, generated from the same content module as the site copy so they cannot drift.
- 1.2 robots.txt SHALL state an explicit, deliberate rule for GPTBot, ClaudeBot, PerplexityBot and Google-Extended, and SHALL reference the llms files.
- 1.3 The non-standard `Host` directive in app/robots.ts SHALL be removed.
- 1.4 The llms files SHALL name the legal entity, the founding year, the city and the DUNS so an engine can distinguish CyberSkill (VN, software consultancy, 2020) from the similarly named Australian company.

## 2. Acceptance criteria

- [ ] AC for 1.1 - both files return 200 text/plain and their facts match the site config - test: `seo/llms-txt-parity`
- [ ] AC for 1.2 - robots.txt contains the four named agents with an explicit rule - test: `seo/robots-ai-stance`
- [ ] AC for 1.3 - the Host directive is gone - test: `seo/robots-ai-stance`
- [ ] AC for 1.4 - the entity block contains legal name, 2020, HCMC and the DUNS - test: `seo/llms-txt-parity`

## 3. Edge cases

- A change to the canonical entity sentence must propagate to both files automatically.
- Blocking an AI crawler would remove the site from that engine's corpus - the default position is allow, stated deliberately.

## 4. Out of scope / non-goals

- Content marketing for GEO (TASK-CMS-007).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- The site's public facts (name, founding date, address, DUNS) have exactly one source in the repo.
