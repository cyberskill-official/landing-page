---
fr_id: FR-WEB-003
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-WEB-003 is ship-grade. Round-2 re-author from spec-stub (6.5/10 on 2026-05-16). Round-2 additions: `<SceneTunnel>` component shape with full TypeScript signature (§3.2), full `disposeSubtree` contract handling materials' map slots + animation mixers (§3.3), the `cullMargin` offscreen-rendering pause (§1 #8 + AC#6), the single-Lumi-load invariant (§1 #10 + AC#8 + AC#9), the ESLint `no-second-canvas` enforcement (§1 #5 + AC#4), the dev-mode debug overlay (§1 #15 + AC#13), the Suspense-banned-in-tunnel rule (§1 #16 + AC#14), Vitest unit tests for disposal + Playwright integration tests for single-canvas + Lumi-loaded-once + no-context-lost (§5), six-paragraph rationale (§2), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3501 — `<SceneTunnel>` component shape was prose; no API contract
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 + §1 #11 specify the full TypeScript signature including `id`, `trackElement`, `cullMargin`, `children` props.

### ISS-3502 — Disposal pattern named but not specified
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §3.3 specifies `disposeSubtree(rootObject3D)` with material-map-slot iteration + animation-mixer-aware cleanup; §5.1 + AC#2 + AC#10 + AC#11 enforce.

### ISS-3503 — Single-canvas invariant was grep-asserted only; no lint
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #5 + AC#4 add an ESLint `no-second-canvas` rule that fails the build, in addition to the Playwright assertion.

### ISS-3504 — Lumi-shared-across-scenes constraint missing
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #10 specifies single `useGLTF.preload('/lumi.glb')` call; AC#8 verifies via network panel that the GLB is fetched once; §2 paragraph 2 explains why one canvas one Lumi is the cinematic conceit.

### ISS-3505 — Per-scene camera offset behavior unclear
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #4 specifies camera-offset-via-useScrollScene + global-camera-is-parent pattern; AC#15 verifies.

### ISS-3506 — Offscreen-culling and frame-pause behavior missing
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #8 specifies `cullMargin = 1.0` default + `dispose={null}` pattern; AC#6 verifies offscreen `useFrame` pause; §2 paragraph 5 explains the perf payoff.

### ISS-3507 — Mount-order independence (jumping into Scene 4 first) not enforced
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #10 specifies single preload at canvas mount; AC#7 verifies direct-navigation-to-scene-4 mounts without prior scenes.

### ISS-3508 — Failure-mode inventory thin (4 rows); missed real R3F gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "animation mixer leak", "tunnel children render outside canvas", "WebGL context lost mid-session", "Suspense inside SceneTunnel corrupts React tree".

## §3 — Strengths preserved from the spec-stub

- Single-canvas invariant correctly cited from FR-WEB-001 §1 #3.
- DOM-element tracking via `useTracker` pattern correctly described.
- scroll-rig progress signal typed `0..1` was correct.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One tunneling component + one disposal lib — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Vitest + Playwright + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §5.2 + §4.4 cited verbatim. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | SceneTunnelProps types + disposeSubtree contract + test code shapes. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + 7 downstream scene-FR unblocks + operational. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers R3F + WebGL + ESLint gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Dev-mode debug overlay + Playwright integration tests + Vitest unit tests. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-WEB-001 (canvas bootstrap) and FR-WEB-002 (Lenis singleton) are both shipped. Both are now `accepted` at anchor-grade.

---

## §6 — Upgrade-queue note

Batch 2 item 2 of the spec-stub → anchor-grade upgrade campaign.

1. FR-WEB-002 ✓ (10/10)
2. **FR-WEB-003 ✓ (this audit, 10/10)** — 7 downstream unblocked
3. Next: FR-WEB-004 (Zustand stores) · 4 downstream

---

*End of FR-WEB-003 audit (round 2 final — anchor-grade re-author from spec-stub).*
