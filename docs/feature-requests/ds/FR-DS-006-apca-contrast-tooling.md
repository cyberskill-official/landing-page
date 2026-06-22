---
id: FR-DS-006
title: "APCA contrast tooling for rendered translucent surfaces"
module: DS
priority: SHOULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-DS-001, FR-DS-004]
source_pages:
  - "research doc §A (APCA contrast), §D (accessibility)"
new_files:
  - scripts/check-apca.mjs
---

## §1 Requirement (BCP-14 normative)

Contrast MUST be measured at the surface a reader actually sees, including the
translucent glass state, not against an idealized solid background.

1. The tooling MUST compute APCA lightness contrast (Lc) for text against its
   effective rendered background, accounting for the composited Liquid Glass
   material rather than the token color alone.
2. The tooling MUST flag any body text below Lc 75 and any interactive label
   below Lc 90, and SHOULD run as a script the operator can invoke locally.
3. Results MUST identify the failing token or component so a fix is actionable.

## §2 Acceptance

- The script reports Lc per checked text-on-surface pair and exits non-zero when
  a threshold is missed.
- A deliberately low-contrast sample is caught at the glass state.

## §3 Evidence

Not yet implemented; acceptance pending build.
