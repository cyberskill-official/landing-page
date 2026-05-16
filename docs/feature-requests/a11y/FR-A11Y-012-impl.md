---
id: FR-A11Y-012
title: "Pre-launch a11y audit — full axe + VoiceOver + NVDA + JAWS + manual flows + archived report"
module: A11Y
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: A11Y Lead + External Consultant
created: 2026-05-16
related_frs: [FR-A11Y-001, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-A11Y-006, FR-A11Y-007, FR-A11Y-008, FR-A11Y-009, FR-A11Y-010, FR-A11Y-011, FR-OPS-012]
depends_on: [FR-A11Y-011]
blocks: []
language: documentation + manual testing
service: docs/audits/
new_files:
  - docs/audits/a11y-pre-launch-2026-MM-DD.md
  - docs/audits/a11y-test-checklist.md
  - docs/audits/screenreader-flows.md

source_pages:
  - docs/01-master-plan-v2.md §7.6 — "Pre-launch full axe + manual a11y audit"
  - WCAG-EM (Evaluation Methodology)
  - Section 508 testing procedures

effort_hours: 12
risk_if_skipped: "FR-OPS-012 automated axe gate catches ~40% of WCAG violations. The remaining 60% require manual screen-reader testing, cognitive review, keyboard-only flows. Without manual audit, launch with hidden violations → user complaints → lawsuit risk."
---

## §1 — Description (BCP-14 normative)

1. **MUST** run full axe-core scan on all routes (root, lite, work/sample, accessibility, /vi/* variants); remediate all serious/critical violations before launch sign-off.
2. **MUST** manual VoiceOver test on:
   - macOS Safari (current + previous version)
   - iOS Safari (iOS 17 + 16)
3. **MUST** manual NVDA test on Windows 11 + Firefox + Chrome.
4. **MUST** manual JAWS test on Windows 11 (enterprise-common AT).
5. **MUST** test these critical user flows with each AT:
   - Tab from page load → Skip-story → CTA Hub.
   - Scroll through all 7 scenes; verify each narration announces.
   - Open Buy form → fill → submit → success message announced.
   - Switch language → verify announce.
   - Toggle mute → audio state change announced.
   - Switch to /lite → verify experience equivalent.
6. **MUST** archive audit results in `docs/audits/a11y-pre-launch-{YYYY-MM-DD}.md` with:
   - Date + auditor + tools used.
   - Per-route results (axe + manual).
   - Per-flow results (pass/fail with notes).
   - All remediated issues listed.
   - All remaining "Known issues" listed (also surfaced on /accessibility per FR-A11Y-011).
7. **MUST** be performed by **external a11y consultant** (not the build team) for independence — at least the manual VO + NVDA + JAWS portions.
8. **MUST** be re-run quarterly post-launch (or before any major release).
9. **MUST** include cognitive review:
   - Tested by user with dyslexia (volunteer or contractor).
   - Tested with cognitive simulation (e.g., remove punctuation visual signals).
10. **MUST** include motor disability simulation:
    - Switch-control navigation.
    - Voice control via macOS Voice Control / Windows Speech Recognition.
11. **MUST** include color-blindness simulation:
    - Deuteranopia (red-green).
    - Tritanopia (blue-yellow).
    - Achromatopsia (full color-blind).

## §2 — Why this design

**Why pre-launch full audit?** Automated tools catch ~40% of violations. Manual catches the other 60% (cognitive load, screen-reader awkwardness, keyboard trap edge cases).

**Why external consultant?** Independence. Build team has blind spots. External fresh eyes catch issues we've normalized.

**Why VO + NVDA + JAWS?** Three dominant AT platforms:
- VoiceOver = macOS + iOS = ~25% of AT users.
- NVDA = Windows free = ~40% (most popular).
- JAWS = Windows enterprise = ~30% (enterprise procurement requirement).

**Why quarterly re-audit?** A11y regresses with code changes. Quarterly catches drift before launch quality declines.

**Why cognitive + motor + color-blindness tests?** WCAG covers visual / motor / hearing. Cognitive + specific motor edge cases (switch control, voice) extend audit scope.

**Why archive in docs/audits/?** Audit trail for legal + procurement. "We audited on date X with auditor Y; results in commit Z."

## §3 — Public surface

```markdown
<!-- docs/audits/a11y-pre-launch-2026-05-29.md (template) -->
# A11y pre-launch audit — 2026-05-29

**Auditor:** [External Consultant Name + Firm]
**Build version:** v1.0.0-rc.3 (commit abc123)
**Tools:** axe-core 4.10, WAVE, VoiceOver (Sonoma 14.5), NVDA 2024.4, JAWS 2024
**Scope:** /, /lite, /work/sample, /accessibility, /vi/*

## Executive summary

WCAG 2.2 AA conformance: **Full** (0 serious / 0 critical issues remaining).
2 minor cosmetic issues fixed during audit; 1 "Known issue" remains documented.

## Per-route results

### / (root)

- axe-core: 0 violations
- VoiceOver: pass (all 7 scenes announced; Lumi mirror works)
- NVDA: pass (all narrations + form labels read correctly)
- JAWS: pass

### /work/sample

- axe-core: 0 violations
- VoiceOver: pass
- NVDA: pass; minor: "Last updated" date in unusual format. Recommend ISO + spoken.
- JAWS: pass

[... per route ...]

## Per-flow results

### Skip-story → CTA Hub

- Tab from load: ✅ lands on Skip-story
- Enter: ✅ scrolls + focuses CTA Hub
- Form navigation: ✅ all 4 buttons reachable
- Modal trap: ✅ Escape returns focus

[... per flow ...]

## Remediated issues during audit

1. [FIXED] Footer link missing aria-label on social icon. Fixed in commit def456.
2. [FIXED] Color contrast on "Last updated" gray-on-cream = 4.2:1. Adjusted to 4.6:1.

## Known issues (carried forward)

1. [PENDING] In Scene 5 (Vietnam→Global), the globe spin animation has subtle pulse that may bother light-sensitive epileptics. Mitigation: prefers-reduced-motion disables it. Documented in /accessibility.

## Recommendations

- Maintain quarterly re-audit cadence.
- Run axe-core in CI on every PR (FR-OPS-012 codifies).
- Consider engaging users with disabilities as paid testers for future major releases.

## Sign-off

- A11y consultant: [signature, date]
- Founder: [signature, date]
- Frontend Lead: [signature, date]
```

```markdown
<!-- docs/audits/a11y-test-checklist.md (reusable across audits) -->
# A11y test checklist — pre-launch / quarterly

## Automated (must pass)
- [ ] axe-core: 0 serious / 0 critical on all routes
- [ ] Lighthouse a11y score ≥ 95 all routes
- [ ] HTML validates (W3C validator)

## Screen reader (VoiceOver, NVDA, JAWS each)
- [ ] Page heading announced first
- [ ] Skip-story link reaches CTA hub
- [ ] All 7 scene narrations announced
- [ ] Form labels announced
- [ ] Form errors announced
- [ ] Form success announced
- [ ] Modal opens + focus moves to first field
- [ ] Modal escape returns focus to trigger
- [ ] Language switch announced
- [ ] Mute toggle state announced

## Keyboard-only (no mouse)
- [ ] Tab order matches design (FR-A11Y-007)
- [ ] All interactives reachable
- [ ] No keyboard traps
- [ ] Escape closes modals
- [ ] Focus visible at every step

## Reduced-motion (OS setting)
- [ ] Auto-redirects to /lite (or stays cinematic per pref)
- [ ] Animations replaced with instant transitions
- [ ] No vestibular triggers

## Color contrast
- [ ] ≥ 4.5:1 normal text
- [ ] ≥ 3:1 large text (18pt+)
- [ ] ≥ 3:1 non-text (focus rings, icons)

## Motor / alternative input
- [ ] Voice control (Mac Voice Control / Windows Speech)
- [ ] Switch control (single-switch + dual-switch)

## Cognitive
- [ ] Plain language (no jargon-only labels)
- [ ] Error messages are specific
- [ ] No timeouts on critical interactions

## Color-blindness simulation
- [ ] Deuteranopia: status differences not solely color-coded
- [ ] Tritanopia: form states distinguishable
- [ ] Achromatopsia: all info conveyed in monochrome
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | axe clean (0 serious/critical) on all routes | FR-OPS-012 output |
| 2 | VoiceOver test pass on macOS + iOS Safari | Audit doc |
| 3 | NVDA test pass on Windows Firefox + Chrome | Audit doc |
| 4 | JAWS test pass on Windows | Audit doc |
| 5 | Audit doc archived at docs/audits/a11y-pre-launch-{date}.md | File presence |
| 6 | External auditor signed-off | Signature in doc |
| 7 | Known issues documented + surfaced on /accessibility | Cross-reference FR-A11Y-011 |
| 8 | Reduced-motion flows tested | Checklist entries |
| 9 | Color-blindness simulations tested | Checklist entries |
| 10 | Motor disability simulation tested | Checklist entries |
| 11 | Cognitive review included | Checklist entries |
| 12 | Quarterly cadence scheduled | Calendar entry |

## §5 — Verification

```bash
# Run axe-core CLI across all routes for fresh baseline
pnpm dlx @axe-core/cli https://cyberskill.world/ --tags=wcag22aa --save axe-report-2026-05-29.json
pnpm dlx @axe-core/cli https://cyberskill.world/lite --tags=wcag22aa
pnpm dlx @axe-core/cli https://cyberskill.world/work/sample --tags=wcag22aa
pnpm dlx @axe-core/cli https://cyberskill.world/accessibility --tags=wcag22aa
pnpm dlx @axe-core/cli https://cyberskill.world/vi --tags=wcag22aa
# Aggregate; verify 0 serious + critical

# Manual checklist run by external consultant; results captured in audit doc
```

## §6 — Dependencies

**Concept:** All FR-A11Y-* implementations (audit validates), FR-A11Y-011 /accessibility page (consumes audit results), FR-OPS-012 axe gate (automated baseline).

**Operational:** axe-core CLI, WAVE, VoiceOver, NVDA, JAWS. External a11y consulting firm.

**Downstream:** FR-A11Y-011 /accessibility page links to audit doc; FR-OPS-014 launch checklist references.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Audit finds serious violations | Audit fails | Block launch; remediate + re-audit |
| External consultant unavailable | Schedule conflict | Pre-book 2 weeks in advance |
| New violation surfaces post-launch | User complaint / FR-OPS-012 CI | Hotfix; re-run partial audit |
| Audit doc stale (not re-run quarterly) | Q2/Q3 calendar | Auto-schedule per Q1 |
| AT version mismatch (e.g., VO behaves differently in OS update) | Manual | Re-test on major OS upgrades |
| Cognitive review skipped (hard to recruit) | Audit incomplete | Use cognitive simulator tools as fallback |
| Color-blindness simulation skipped | Audit incomplete | Use Chrome DevTools rendering vision simulation |
| Vietnamese audit skipped | /vi violation slips | Audit /vi/* same as /* |
| AT user gives feedback but no formal report | Lost feedback | Recruit paid AT testers; structured interviews |
| Audit results lost (no archive) | AC#5 | Commit to git; never deleted |
| Audit performed by build team alone (no independence) | Bias | External hire required for manual portions |
| Audit duration cuts corners | 12h budget | Allow up to 16h; non-negotiable for launch |

## §8 — Deliverable preview

Pre-launch:
1. External consultant engaged 3 weeks before launch.
2. Audit runs 12-16 hours over 2 days.
3. Issues filed: 8 total (2 serious, 6 minor/moderate).
4. Serious + critical issues remediated within 1 week.
5. Re-audit verifies fixes.
6. Audit doc archived; founder + Frontend Lead + consultant sign.
7. /accessibility page updated with last-reviewed date.
8. Launch proceeds.

Quarterly post-launch:
1. Calendar reminder fires Day 90 post-launch.
2. Mini-audit (axe + 1 SR pass; ~4 hours).
3. New audit doc; surfaces drift.

## §9 — Notes

**On budget for external consultant:** Typical SMB a11y audit $3,000-$8,000 for 2-day engagement. Budget approved.

**On 'why not just trust automated?'** Automated catches the easy stuff. Real-world UX issues (cognitive load, awkward AT phrasing, focus order surprises) need human judgment.

**On Vietnamese a11y testing:** Vietnamese-speaking AT testers may be hard to find externally. Founder can perform a subset; document with screenshot evidence.

**On future user testing program:** Slice 3 — recruit paid panel of users with disabilities for ongoing feedback. Builds long-term trust.

*End of FR-A11Y-012.*
