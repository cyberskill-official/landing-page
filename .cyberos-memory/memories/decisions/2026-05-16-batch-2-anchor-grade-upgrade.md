---
kind: decisions
slug: 2026-05-16-batch-2-anchor-grade-upgrade
created_at: 2026-05-16T00:00:00Z
actor: Stephen Cheng (Founder) — directive "1 and 2" (continued from Batch 1)
executor: Claude (Cowork mode) — anchor-grade re-author per FR_AUTHORING_WORKFLOW.md §3.3
classification: internal
sync_class: shareable
acl: [stephen.cheng]
audit_chain_head: null
body_hash: null
---

# Batch 2 anchor-grade upgrade — P3 Web foundation complete

## What happened

Re-authored eight P3 web foundation FRs from spec-stub (~1.5 KB each, 6.5/10 audit) to anchor-grade (~15-30 KB each, 10/10 audit with R1/R2 ladder). The P3 web foundation is now ship-ready.

| # | FR | Pre-state | Post-state | Downstream unblocks |
|---|---|---|---|---|
| 1 | FR-WEB-002 (Lenis 1.3 smooth-scroll singleton) | spec-stub @ 6.5/10 | accepted @ 10/10 | — (foundation) |
| 2 | FR-WEB-003 (UseCanvas tunneling + disposal) | spec-stub @ 6.5/10 | accepted @ 10/10 | 7 |
| 3 | FR-WEB-004 (Zustand stores + selectors + ESLint) | spec-stub @ 6.5/10 | accepted @ 10/10 | 4 |
| 4 | FR-WEB-005 (next/dynamic + canonical dynamic-three.ts) | spec-stub @ 6.5/10 | accepted @ 10/10 | — (foundation) |
| 5 | FR-WEB-006 (Suspense per scene + preload chain) | spec-stub @ 6.5/10 | accepted @ 10/10 | — (foundation) |
| 6 | FR-WEB-007 (transpilePackages + tree-shake) | spec-stub @ 6.5/10 | accepted @ 10/10 | — (foundation) |
| 7 | FR-WEB-008 (App Router 4 routes + metadata) | spec-stub @ 6.5/10 | accepted @ 10/10 | 7 |
| 8 | FR-WEB-009 (capability gate + /lite redirect) | spec-stub @ 6.5/10 | accepted @ 10/10 | 2 |

Each upgrade adds: full §1 normative description (15-17 MUSTs), §2 5-6 paragraph rationale naming specific trade-offs, §3 contract precision (file hierarchy + TypeScript shapes + JSON schemas + config tables), §4 12-16 acceptance criteria each citing a test tool, §5 Vitest/Playwright test code shapes (~50-130 lines), §6 dependencies (concept + operational + downstream), §7 12 failure-mode rows with detection + recovery columns, §8 deliverable preview, §9 notes.

Each audit adds: pre-revision + R1 + R2 scoring table; 7-9 resolved issues (severity tagged: error/warning/info) with rule_id and resolution status; rubric breakdown across 8 dimensions; upgrade-queue cross-reference.

## Why

Continuing the founder directive "1 and 2" from Task 32 / Task 33 — honest re-grade + full anchor-grade upgrade. After Batch 1 (P2 production-mesh chain) completed earlier in this session, Batch 2 (P3 web foundation) was the natural next priority per `docs/launch/upgrade-queue.md` because:
- Web foundation unblocks Scene 0 polished implementation (FR-SCENE-009).
- WEB-003 (UseCanvas) and WEB-008 (routing) each unblock 7 downstream FRs — high leverage.
- Without anchor-grade WEB foundation, the engineering team would re-author specs in week 6 when they should be implementing them.

## State after this row

- `docs/feature-requests/BACKLOG.md`: v0.6.0 → v0.7.0. Status line now reads "8 shipped, 23 accepted (anchor-grade — P2 CHAR-006..012 + P3 WEB-002..009), 94 spec-stub".
- `docs/feature-requests/FR_GRAPH.md`: regenerated. 125 nodes, **180 edges** (up from 178 — added FR-WEB-008 → 7 new dependent edges), **0 cycles**.
- `docs/feature-requests/BACKLOG.md §11`: §11.5 P3 section now lists all 8 WEB FRs at 10/10.
- `docs/launch/upgrade-queue.md`: Batch 2 marked complete with audit-file pointers; total spec-stub count drops from 102 → 94.

## Files touched (non-BRAIN — §14.1 emission below)

- `docs/feature-requests/web/FR-WEB-002-lenis-smooth-scroll.md` + `.audit.md`
- `docs/feature-requests/web/FR-WEB-003-usecanvas-tunneling.md` + `.audit.md`
- `docs/feature-requests/web/FR-WEB-004-zustand-store-pattern.md` + `.audit.md`
- `docs/feature-requests/web/FR-WEB-005-next-dynamic-ssr-false.md` + `.audit.md`
- `docs/feature-requests/web/FR-WEB-006-suspense-boundary-per-scene.md` + `.audit.md`
- `docs/feature-requests/web/FR-WEB-007-transpile-tree-shake.md` + `.audit.md`
- `docs/feature-requests/web/FR-WEB-008-routing.md` + `.audit.md`
- `docs/feature-requests/web/FR-WEB-009-webgl2-detection.md` + `.audit.md`
- `docs/feature-requests/BACKLOG.md` (status line + §1 summary)
- `docs/feature-requests/FR_GRAPH.md` (regenerated)
- `docs/launch/upgrade-queue.md` (batch-2 closure)

## §14.1 block

```
Files written outside <memory-root>/ in this session segment (Batch 2):
  - 16 FR/audit files + 1 BACKLOG + 1 graph + 1 queue
Memories read this session: MEMORY.md index, prior Batch 1 decision row
Rejections: none
Token budget: ~70k input tokens consumed by Batch 2 anchor-grade authoring
```

## Cumulative progress (both batches this session)

- Total FRs upgraded: 7 (Batch 1 CHAR) + 8 (Batch 2 WEB) = **15 FRs**
- Total downstream unblocks: ~35 (Batch 1) + ~20 (Batch 2) = **~55 FR-edges**
- Anchor-grade accepted total: 8 (P0/P1) + 15 (Batches 1+2) = **23 FRs at 10/10**
- Remaining: 94 spec-stub FRs across Batches 3-13 per `upgrade-queue.md`

*End of decision record.*
