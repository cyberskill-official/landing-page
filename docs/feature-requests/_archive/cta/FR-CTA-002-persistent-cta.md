---
id: FR-CTA-002
title: "Persistent, scene-independent conversion CTA"
module: CTA
priority: SHOULD
status: done
class: product
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
new_files:
  - components/cta/PersistentCta.tsx
  - components/genie/GenieOpenButton.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

A path to convert MUST be available at all times and MUST NOT depend on the 3D
scene having loaded or finished.

1. A persistent CTA MUST render in the shared chrome on every page and MUST stay
   reachable regardless of scroll position or scene state.
2. The Genie-open control MUST trigger the chat path directly and MUST NOT wait
   on the canvas; if the scene never mounts, the button MUST still work.
3. The persistent CTA MUST be hidden from print output (`@media print`).

## §2 Acceptance

- The CTA and Genie-open button are present on `/en`, `/vi`, `/work`, and
  `/careers` without scrolling into a section.
- Disabling the canvas leaves both controls fully operable.
- Print preview omits the persistent CTA.

## §3 Evidence

Static: `PersistentCta` mounted in the locale layout chrome; `GenieOpenButton`
dispatches to the Genie state, not the scene; print-hidden style present.
Deferred: visual print-preview check on the operator machine.
