---
id: FR-CTA-012
title: "Zalo and WhatsApp one-tap contact chips, config-driven"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/CONV-05]
---

# FR-CTA-012: Zalo and WhatsApp one-tap contact chips, config-driven

## 0. Why (evidence)

Vietnamese buyers reach for Zalo and international buyers for WhatsApp; both beat a form on a phone. The site offers
neither, and audit A notes minimal social presence overall.

## 1. Description (normative)

- 1.1 Config-driven contact chips (Zalo OA link, WhatsApp wa.me link, any other configured channel) SHALL render in the contact section and the footer.
- 1.2 Only configured channels SHALL render; an unset channel SHALL produce no markup.
- 1.3 Each chip SHALL emit a cta_clicked event with its location and label (FR-OPS-011), and carry an accessible name in the active locale.

## 2. Acceptance criteria

- [ ] AC for 1.1 - configured chips render in both places, both locales - test: `cta/messaging-chips`
- [ ] AC for 1.2 - unset channels render nothing - test: `cta/messaging-chips`
- [ ] AC for 1.3 - clicking emits the event with the correct location - test: `analytics/both-lead-paths`

## 3. Edge cases

- wa.me requires an E.164 number with no plus - a malformed number must fail the build, not ship a dead link.
- Zalo has no desktop deep link on some browsers - the link must degrade to the web profile.

## 4. Out of scope / non-goals

- Creating the Zalo OA (FR-BIZ-007).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
