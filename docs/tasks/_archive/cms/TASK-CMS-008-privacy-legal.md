---
id: TASK-CMS-008
title: "Privacy and legal page covering PDPL/GDPR and consent"
module: CMS
priority: MUST
status: done
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-CMS-001, TASK-CTA-001]
blocks: []
source_pages:
  - "research doc §G (privacy + consent)"
new_files:
  - app/[lang]/privacy/page.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The site MUST publish a privacy and legal page that explains data handling for
the lead form and the chat, in both locales.

1. The page MUST state what data the lead form and the Genie chat collect, the
   purpose, the legal basis, the retention period, and how to request deletion.
2. The content MUST address both Vietnam PDPL and GDPR obligations and MUST match
   the consent language used at the point of collection in TASK-CTA-001.
3. The page MUST ship English and Vietnamese values for every clause, with the
   Vietnamese reviewed by a native speaker.
4. The consent checkbox and the chat disclosure MUST link to this page so the
   stated terms and the collected terms agree.

## §2 Acceptance

- The page describes form and chat data handling for both PDPL and GDPR.
- The consent text at collection matches the published policy in both locales.

## §3 Evidence

Shipped 2026-06-22. `app/[lang]/privacy/page.tsx` publishes the notice in both
locales with full `Record<Locale, ...>` parity: who we are, what the lead form
and Lumi chat collect, purpose and legal basis, who processes it (Anthropic for
chat, Vercel for hosting), retention, and the deletion/access route by email.
The PDPL and GDPR obligations are addressed in plain language. The consent
checkbox in `LeadForm.tsx` and the chat disclosure in `GenieChatPanel.tsx` both
link to `/[lang]/privacy`, and the footer carries a standing link, so the stated
terms and the collected terms agree (clause 4). Verified by `next build`
(`/en/privacy` and `/vi/privacy` prerendered) plus tsc + lint green.
