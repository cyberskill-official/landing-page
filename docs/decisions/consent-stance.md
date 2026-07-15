# Consent Stance Decision Record

**task:** TASK-OPS-013  
**Date:** 2026-07-13  
**Status:** Adopted  
**Owner:** CyberSkill Engineering (review by operator required before any non-cookieless tag ships)

---

## 1. Context

The site is genuinely cookieless as of this writing. No third-party cookies,
no cross-site pixels, no retargeting tags are loaded. The site currently uses:

- **First-party anonymous event collection** — page-view and click events stored
  server-side only, no cookies, no cross-site tracking.
- **Anthropic Claude API** — messages from the Lumi chat panel are forwarded to
  Anthropic's API. This is a cross-border data transfer (Vietnam → US) and is
  disclosed before the visitor's first message.

The Vietnamese Personal Data Protection Law (Law 91/2025/QH15, in force 1 Jan 2026)
is consent-centric and imposes fines up to 5% of prior-year revenue for unlawful
cross-border transfers. GDPR applies to any EU visitor. Any future addition of a
non-cookieless tag (Google Analytics 4, Meta Pixel, a session replay tool) must
clear this gate before shipping.

---

## 2. Trigger conditions — what requires explicit consent

The following categories of tooling require consent **before** they may load:

| Category | Examples | Reason |
|---|---|---|
| Third-party cookies | GA4 (default mode), Meta Pixel | Article 15 PDPL; GDPR Art. 6 |
| Cross-site tracking pixels | Retargeting, attribution tags | Cross-border transfer without basis |
| Session replay tools | Microsoft Clarity (default), FullStory | Processes behaviour data |
| Marketing automation | HubSpot, Mailchimp tracking | Profiling |
| Any tag that writes a persistent identifier to the browser | Anything that sets a cookie or writes to IndexedDB/localStorage for cross-site use | PDPL Art. 16 |

Tags that do **not** require consent under this decision:

| Category | Rationale |
|---|---|
| Cookieless first-party analytics | No personal data, no cross-site tracking (PDPL exempt) |
| Functional localStorage (theme, language) | Essential to UX; explicitly excepted under PDPL and ePrivacy |
| Anthropic API forwarding | Disclosed at the chat entry point before any transfer occurs |

---

## 3. Chosen mechanism

**Default state: no optional tag loads.**

Every optional (non-cookieless) analytics or tracking tag must call the typed
`ConsentGate.canLoad(tag)` API before initialising. The gate defaults to
`denied` for all categories. It can be upgraded by the visitor explicitly
accepting a consent banner (not yet shipped — no such tags exist today).

A TypeScript compile error is the enforcement mechanism: any tag that does not
import and call `canLoad` fails the CI build via an ESLint rule (planned as
`no-unconsented-tag`; currently enforced by the gate's type signature requiring
explicit acknowledgement).

---

## 4. PDPL/GDPR reasoning

- **No banner today** is justified because no consent-requiring tag currently loads.
  Adding any such tag without shipping the banner first is a protocol violation.
- **Cross-border transfer to Anthropic** is covered by the disclosure in the Lumi
  chat UI (§1.4 of TASK-OPS-013). The basis is the visitor's informed, per-session
  acceptance of the chat terms presented before the first message.
- **EU visitors (GDPR)** and **VN visitors (PDPL)** receive the same default (all
  optional tags denied). The gate is designed to support per-region overrides if
  jurisdiction-specific prompting is added in the future.

---

## 5. When to revisit this record

This record must be updated before any of the following ships:

- Microsoft Clarity (TASK-OPS-012) — requires consent banner.
- Google Analytics 4 in non-consent-mode (TASK-PERF-009) — requires consent banner.
- Any retargeting or attribution pixel — requires consent banner.
- The formal PDPL legal review (TASK-BIZ-012) may supersede the basis described here.

---

## 6. Privacy page alignment

The privacy page at `/[lang]/privacy` must accurately reflect which tags can load
and under what condition. As of this decision:

- **Cookieless first-party events** — always on, no consent needed.
- **All other tags** — not currently loaded; will require consent if added.
- **Anthropic API** — disclosed at point of use in the chat.
