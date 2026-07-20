---
id: TASK-OPS-008
title: "Uptime and deploy-health monitoring with alerts"
module: OPS
priority: COULD
status: on_hold
class: product
verify: T
phase: P6
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [TASK-WEB-010]
blocks: []
source_pages:
  - "research doc §L (uptime and alerting), §F (health endpoint)"
new_files:
  - docs/deploy/monitoring.md
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

An outage MUST page a human rather than wait for a visitor to report it.

1. An external uptime monitor MUST probe the production site on a schedule and MUST treat a failed probe or a non-healthy response as down.
2. A failed probe MUST raise an alert through a channel the operator actually watches, with no manual polling required.
3. `docs/deploy/monitoring.md` MUST document the probe target, the cadence, and who the alert reaches.

## §2 Acceptance

- The monitor probes production on a fixed interval.
- A simulated failure raises an alert to the operator.
- The monitoring doc names the target, cadence, and recipient.

## §3 Evidence

Not yet implemented; acceptance pending build.
