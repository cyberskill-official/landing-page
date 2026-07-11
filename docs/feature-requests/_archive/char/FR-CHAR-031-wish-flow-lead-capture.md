---
id: FR-CHAR-031
title: "Wish flow: deterministic in-chat lead capture, Lumi-first contact"
module: CHAR
priority: SHOULD
status: done
class: product
verify: T
phase: P2
created: 2026-07-02
shipped: 2026-07-02
owner: Stephen Cheng
depends_on: [FR-CHAR-030, FR-CTA-001]
related_frs: [FR-CHAR-026, FR-CHAR-027]
source_pages:
  - "operator direction 2026-07-02: the contact form is the old way - integrate it into the Lumi interaction; Talk-to-Lumi CTAs are redundant next to the clickable mascot"
new_files:
  - lib/genie/wishFlow.ts
  - tests/wish-flow.test.ts
modified_files:
  - components/genie/GenieChatPanel.tsx
  - components/sections/ContactCta.tsx
  - components/sections/Hero.tsx
  - components/cta/PersistentCta.tsx
  - components/canvas/CanvasMount.tsx
  - components/canvas/LumiHotspot.tsx
  - lib/i18n/dictionaries.ts
  - lib/analytics.ts
  - app/api/analytics/route.ts
  - app/globals.css
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

1.1 Lumi's chat MUST offer a guided "leave your wish" flow that collects
name, work email, optional company, the wish itself, and explicit consent,
then submits to the existing /api/lead endpoint. The flow MUST be
deterministic and keyless (no LLM round-trip), so it works even while the
AI proxy is unavailable, and MUST validate with the same schema as the
classic form. Optional steps MUST be skippable; consent MUST be an explicit
choice, never inferred; cancelling MUST be possible at any step.

1.2 On success the flow MUST fire the wish-granted celebration
(FR-CHAR-030 burst), track `lead_submitted` (source lumi-chat), and confirm
in the conversation. On failure it MUST say so and allow retry.

1.3 Contact becomes Lumi-first: the contact section leads with a
"Grant it with Lumi" launcher and folds the classic form behind a native
details/summary fallback (which MUST remain usable without JS). While the
living mascot is on stage (html[data-lumi-live]) the duplicate
"Talk to Lumi" CTAs in the hero and the persistent bar MUST hide (Lumi
itself is the launcher); they MUST remain on devices without the mascot,
and the header launcher stays everywhere as the constant accessible entry.
A one-time hint chip MUST teach that Lumi is clickable.

## §2 Design

lib/genie/wishFlow.ts is a pure state machine (name -> email -> company? ->
message? -> consent -> done) reusing leadSchema for email validation and
payload construction - unit-tested in tests/wish-flow.test.ts. The panel
adds quick-reply chips (start / skip / consent / cancel) and routes input
into the flow while active; everything else in the chat is unchanged, and
the AI path still handles free conversation. CanvasMount publishes
data-lumi-live; CSS hides .cs-lumi-alt under it.

## §3 Evidence (2026-07-02, Mac gate + automated run)

- Gate all EXIT=0: tsc; vitest 18 files / 74 tests (4 new wish-flow tests:
  happy path -> exact /api/lead payload, rejection without advancing,
  optional skips, explicit consent semantics); lint; build 26/26; assets;
  served-route jsdom axe 0 violations /en + /vi (details/summary is the
  same accessible pattern the FAQ already uses).
- End-to-end probe on the served build: opened the chat by clicking the
  mascot, drove the flow (start chip, name, email, skip, skip, consent) -
  final bubble "The wish is on its way to the team..." (WISH_PROBE
  done:true), meaning a real POST /api/lead round-trip succeeded.
- CONTACT_PROBE: the Lumi CTA renders, the classic form is folded by
  default, and the hero's duplicate Talk-to-Lumi is display:none while the
  mascot is live.
- FR-CHAR-026 (value-first, ICP-adaptive qualification) intentionally stays
  planned: this flow is its deterministic foundation; the adaptive layer
  needs the AI path and Stephen's qualification criteria.

## §4 Amendment 2026-07-02 (round 5, FR-DS-014)

Operator direction: migrate EVERY remaining chat CTA to Lumi. Clause 1.3's
carve-out for the header launcher is withdrawn - under html[data-lumi-live]
the header CTA now hides too (.cs-lumi-alt). While the mascot is live,
chat entry points are: Lumi itself (click), the one-time hint chip (now
centred on the mascot via translate(-50%,-50%)), and the contact section's
"Grant it with Lumi" launcher. Devices without the mascot keep every CTA,
including the header's. Evidence: CONTACT_PROBE heroAltHidden:true plus
served axe /en+/vi 0 serious/critical with the header button
display:none'd (it remains in the accessibility tree only when visible,
so no name/role regressions).
