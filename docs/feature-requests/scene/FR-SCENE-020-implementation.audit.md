---
fr_id: FR-SCENE-020
audited: 2026-05-16
auditor: manual (engineering-spec@1 + feature-request-audit skill §3.12 compliance pass round 3)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; feature-request-audit skill compliance re-audit against expanded 21KB spec)
authoring_md_compliance: §3.12 #36 — 7 ISS findings (≥ 6 required) ✓
---

## §1 — Verdict summary

FR-SCENE-020 is the scroll orchestrator — the GSAP master timeline that binds all 8 scenes (Scene 0-6 + footer) to scroll progress via the scrollerProxy bridge to Lenis (FR-WEB-002). At 21.1 KB with normative scrollTrigger setup, bi-directional scroll support, transitioning flag in scene store, and integration with FR-CHAR-011 NLA clips.

Round-3 re-audit adds 3 NEW ISS findings (#60205, #60206, #60207) against the expanded content, bringing total to 7 ISS — above the feature-request-audit skill §3.12 #36 ≥ 6 threshold.

## §2 — Round-1/2 findings (resolved; preserved)

### ISS-60201 — Implementation contract underspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 wires the Batch 4 comp + FR-CHAR-011 clip names by exact string.

### ISS-60202 — Reduced-motion fallback path
- **severity:** error
- **rule_id:** a11y
- **status:** RESOLVED — Scene falls back to /lite-style storyboard panel under prefers-reduced-motion per FR-A11Y-001.

### ISS-60203 — Disposal contract on unmount
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — Uses FR-WEB-003 disposeSubtree() in useEffect cleanup.

### ISS-60204 — Scene-progress signal flow
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — Reads useSceneProgress() from FR-WEB-003.

## §3 — Round-3 findings (NEW — against expanded content)

### ISS-60205 — ScrollTrigger refresh after viewport resize not specified
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #N (clarified): `ScrollTrigger.refresh()` MUST fire on window `resize` event debounced 200ms. Without explicit refresh, scene boundaries become stale on viewport change → scrolling past a scene without anim firing.
- **resolution location:** §1 normative + §7 failure mode row "stale ScrollTrigger boundaries after resize"
- **why it matters:** Mobile users rotate device → viewport changes → orchestrator's scene boundaries (set at first mount) point at wrong scroll positions. Visible bug.

### ISS-60206 — Bi-directional scroll edge case (back-scroll past scene 0)
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 specifies orchestrator MUST clamp `activeScene` ∈ [0, 7]. Back-scroll past Scene 0 must not yield activeScene = -1 or undefined. Test: scroll to top, then scroll up further → activeScene stays at 0; transitioning=false.
- **resolution location:** §1 boundary clause + §4 AC + §7 failure mode "back-scroll yields activeScene out of range"
- **why it matters:** Without clamping, downstream subscribers (FR-A11Y-002 shadow mirror, FR-A11Y-006 captions) may crash on undefined sceneId.

### ISS-60207 — GSAP timeline disposal on Fast Refresh (HMR) in dev
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 + §7 failure modes: orchestrator MUST call `ScrollTrigger.killAll()` + `gsap.globalTimeline.clear()` in useEffect cleanup. Without this, HMR re-mounts double-register scenes; visible jank + duplicate animation triggers.
- **resolution location:** §1 cleanup clause + §5 unit test for HMR scenario
- **why it matters:** Dev experience degradation; could mask real bugs in dev that surface in prod.

## §4 — Strengths preserved across all rounds

- Batch 4 comp dependency edge correctly named.
- FR-CHAR-011 animation clip-name discipline correctly cited.
- FR-WEB-003 SceneTunnel pattern referenced.
- ScrollerProxy bridge to Lenis explicitly wired.
- Transitioning flag in sceneStore prevents mid-anim scene-change races.

## §5 — Rubric scoring (per feature-request-audit skill §7)

| Dimension | Weight | Pre | Post-R1 | Post-R2 | **Post-R3** |
|---|---:|:-:|:-:|:-:|:-:|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | **1.0** |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 1.0 | **1.0** |
| Testability | 2.0 | 1.4 | 1.9 | 2.0 | **2.0** |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | **1.5** |
| API/contract precision | 1.5 | 1.2 | 1.4 | 1.5 | **1.5** |
| Dependencies declared | 1.0 | 0.9 | 1.0 | 1.0 | **1.0** |
| Failure-modes inventory | 1.0 | 0.5 | 0.9 | 1.0 | **1.0** (R3: 3 new rows) |
| Observability hooks | 1.0 | 0.5 | 0.8 | 1.0 | **1.0** |
| **TOTAL** | **10.0** | **6.5** | **9.0** | **10.0** | **10/10** ✓ |

## §6 — Resolution

**Score = 10/10. Status: accepted.** R3 adds 3 NEW ISS findings (resize refresh, back-scroll clamping, HMR disposal) bringing total to 7 — compliant with feature-request-audit skill §3.12 #36.

## §7 — Cross-references

- Canonical R3 pattern: `FR-SCENE-017-implementation.audit.md` round 3.
- Audit-debt report: `_AUDIT_DEBT_REPORT_2026-05-16.md` HIGH priority #1.
- Downstream: FR-SCENE-009..024 all consume scroll-orchestrator signals.

*End of FR-SCENE-020 audit (round 3 final).*
