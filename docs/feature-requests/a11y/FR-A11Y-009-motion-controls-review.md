---
id: FR-A11Y-009
title: "Reconcile always-on motion with a user-facing motion control"
module: A11Y
priority: SHOULD
status: closed
class: product
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
related_frs: [FR-SCENE-003, FR-A11Y-001]
source_pages:
  - "research doc §H (WCAG 2.3.3 animation from interactions), §J (motion stance)"
routed_back_count: 0
awh: N/A
closed_reason: superseded by FR-A11Y-010 (reduced-motion JS gate, which also binds the manual toggle)
---

## §1 Requirement (BCP-14 normative)

The always-on motion decision in FR-SCENE-003 SHOULD be reconciled with a
user-facing way to stop motion and with the reduced-motion path from FR-A11Y-001.

1. A user-facing motion control SHOULD let visitors stop the scene and scroll
   animation, and its choice SHOULD persist across reloads.
2. When the operating system signals `prefers-reduced-motion: reduce`, the site
   MUST default to the reduced-motion path rather than the always-on scene.
3. The reduced-motion path MUST present the same story content, since motion
   removal MUST NOT remove information.
4. The decision record and FR-SCENE-003 MUST be updated to reflect whichever
   control ships, so the documented stance and the build agree.

## §2 Acceptance

- A motion control stops the scene and scroll animation and persists the choice.
- A reduced-motion profile loads the static path by default.
- The decision record and FR-SCENE-003 match the shipped behaviour.

## §3 Evidence

Not yet implemented; acceptance pending build.
