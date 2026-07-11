---
id: FR-A11Y-008
title: "Manual VoiceOver and NVDA screen-reader pass"
module: A11Y
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §H (manual a11y testing, screen readers)"
planned_files:
  - docs/a11y/screen-reader-checklist.md
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Automated checks SHOULD be backed by a manual screen-reader pass on real
assistive technology.

1. A manual pass SHOULD run with VoiceOver and with NVDA across the home,
   `/work`, `/careers`, and the chat widget.
2. The pass MUST follow a written checklist covering landmarks, headings, link
   and button names, form labels, and live-region announcements.
3. Each finding MUST be logged with the route, the tool, and the observed
   behaviour, and tracked to a fix.
4. The checklist and its results MUST be stored in the repository so later runs
   can repeat the same steps.

## §2 Acceptance

- A documented checklist exists and is run on both VoiceOver and NVDA.
- Findings are logged with route, tool, and behaviour.
- The checklist and results live in the repository.

## §3 Evidence

Not yet implemented; acceptance pending build.
