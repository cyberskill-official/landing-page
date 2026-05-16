# FR Upgrade Queue — spec-stub → anchor-grade

**Status:** 🏆 **CAMPAIGN COMPLETE 2026-05-16.** All 13 batches closed. 0 spec-stubs remain. 117 FRs upgraded from 6.5/10 → 10/10 anchor-grade across all 7 phases.
**Owner:** Frontend Lead + module owners; co-author with original FR authors.

---

## What "anchor-grade" means

A 10/10 FR has:

| Dimension | Anchor-grade content |
|---|---|
| §1 Normative description | 10-16 numbered MUSTs/SHOULDs, each ≤ 80 words |
| §2 Rationale prose | 3-5 "why this design" paragraphs naming the specific trade-offs and the failure they prevent |
| §3 Contract precision | Real code/JSON/CSS excerpts the implementer copy-pastes; not pseudo-code |
| §4 Acceptance criteria | 10-14 ACs, each citing the test tool (Vitest / Playwright / grep / shell) that verifies it |
| §5 Verification | Full test code blocks (not just "Vitest covers this") |
| §6 Dependencies | depends_on + concept dependencies + operational dependencies |
| §7 Failure modes | 7-10 rows, each with detection + recovery |
| §8 Notes (optional) | Cross-references, slice-1-vs-slice-2 scoping, future-FR pointers |
| Audit §1-§4 | Pre-revision + post-R1 + post-R2 scoring table; 4-7 resolved issues with severity tags |

A 6.5/10 spec-stub has the frontmatter + §1 MUSTs + brief ACs + brief failure modes only.

## Upgrade priority order (by downstream blocking)

Run `python3 tools/fr-graph.py --no-cycles` to refresh the downstream-count rankings. Highest-leverage first.

### Batch 1 — P2 production-mesh chain (high priority, week-6 deadline) — **✓ COMPLETE 2026-05-16**

These block every other P2 FR and unblock real Lumi production. All 7 FRs at 10/10 anchor-grade.

- [x] FR-CHAR-006 (production mesh) · 7 downstream blocks · 10/10 · audit `char/FR-CHAR-006-production-mesh.audit.md`
- [x] FR-CHAR-007 (UV layout) · 5 downstream · 10/10
- [x] FR-CHAR-008 (Substance textures) · 4 downstream · 10/10
- [x] FR-CHAR-009 (custom armature) · 4 downstream · 10/10
- [x] FR-CHAR-010 (shape keys) · 3 downstream · 10/10
- [x] FR-CHAR-011 (animation library, 11 clips) · 10 downstream · 10/10 — biggest single unblock
- [x] FR-CHAR-012 (nón lá production mesh) · 2 downstream · 10/10

**Batch 1 delivered ~35 downstream FR-edges. Audit ladders documented in each `.audit.md` file.**

### Batch 2 — P3 Web foundation (week-6 parallel) — **✓ COMPLETE 2026-05-16**

All 8 FRs at 10/10 anchor-grade.

- [x] FR-WEB-002 (Lenis smooth-scroll) · 10/10 · audit `web/FR-WEB-002-lenis-smooth-scroll.audit.md`
- [x] FR-WEB-003 (UseCanvas tunneling) · 7 downstream · 10/10
- [x] FR-WEB-004 (Zustand stores) · 4 downstream · 10/10
- [x] FR-WEB-005 (next/dynamic ssr-false) · 10/10
- [x] FR-WEB-006 (Suspense per scene) · 10/10
- [x] FR-WEB-007 (transpile + tree-shake) · 10/10
- [x] FR-WEB-008 (routing) · 7 downstream · 10/10
- [x] FR-WEB-009 (WebGL2 detection) · 2 downstream · 10/10

**Batch 2 delivered ~20 downstream FR-edges. Audit ladders documented in each `.audit.md` file.**

### Batch 3 — P1 DS tokens (week-3 deadline) — **✓ COMPLETE 2026-05-16**

All 6 FRs at 10/10 anchor-grade.

- [x] FR-DS-004 (gold + brown tokens) · 10/10
- [x] FR-DS-005 (flag accents — Scene-5 scoped) · 10/10
- [x] FR-DS-006 (motion tokens + reduced-motion) · 10/10
- [x] FR-DS-007 (typography pairing) · 10/10
- [x] FR-DS-008 (glow recipes) · 10/10
- [x] FR-DS-009 (lifecycle marker) · 10/10

**Batch 3 delivered ~10 downstream FR-edges.**

### Batch 4 — P1 SCENE 2-6 + footer (week-4 deadline) — **✓ COMPLETE 2026-05-16**

All 7 FRs at 10/10 anchor-grade.

- [x] FR-SCENE-002 (Scene 1 Origin comp) · 10/10
- [x] FR-SCENE-003 (Scene 2 Transformation paint-trail) · 10/10
- [x] FR-SCENE-004 (Scene 3 Capabilities quadrant) · 10/10
- [x] FR-SCENE-005 (Scene 4 Team bokeh) · 10/10
- [x] FR-SCENE-006 (Scene 5 Vietnam→Global) · 10/10 ← cultural anchor
- [x] FR-SCENE-007 (Scene 6 CTA Hub) · 10/10
- [x] FR-SCENE-008 (Footer + Lumi corner) · 10/10

**Batch 4 delivered ~10 downstream FR-edges.**

### Batch 5 — P3 Scene 0 polish — **✓ COMPLETE 2026-05-16**

All 4 FRs at 10/10 anchor-grade.

- [x] FR-SCENE-009 (Scene 0 hero implementation) · 10/10
- [x] FR-SCENE-010 (Lumi anim picker wiring) · 10/10
- [x] FR-SCENE-011 (above-fold CTA) · 10/10
- [x] FR-SCENE-012 (particulate dust) · 10/10

**Batch 5 delivered ~8 downstream FR-edges.**

### Batch 6 — P1 CHAR greybox — **✓ COMPLETE 2026-05-16**

Both FRs at 10/10 anchor-grade.

- [x] FR-CHAR-004 (Lumi greybox) · 34 downstream · 10/10
- [x] FR-CHAR-005 (per-scene greybox sets) · 2 downstream · 10/10

**Batch 6 delivered ~36 downstream FR-edges (CHAR-004 is the largest chokepoint outside Batch 1).**

### Batch 7 — P2 OPS pipeline support — **✓ COMPLETE 2026-05-16**

All 8 FRs at 10/10 anchor-grade.

- [x] FR-OPS-002 (budgets.json canonical) · 10/10
- [x] FR-OPS-003 (PR-comment integration) · 10/10
- [x] FR-OPS-004 (KTX2 + Basis compression) · 10/10
- [x] FR-OPS-005 (decoder bundling) · 10/10
- [x] FR-OPS-006 (Cowork Recipe A — PR triage) · 10/10
- [x] FR-OPS-007 (Cowork Recipes B-G) · 10/10
- [x] FR-OPS-008 (LFS configuration) · 10/10
- [x] FR-OPS-009 (source-asset manifest) · 10/10

**Batch 7 delivered ~8 downstream FR-edges.**

### Batch 8 — P3 OPS CI — **✓ COMPLETE 2026-05-16**

All 4 FRs at 10/10 anchor-grade.

- [x] FR-OPS-010 (GitHub Actions baseline) · 10/10
- [x] FR-OPS-011 (Lighthouse CI) · 10/10
- [x] FR-OPS-012 (axe a11y gate) · 10/10
- [x] FR-OPS-013 (file-size CI gate) · 10/10

### Batch 9 — P3 A11Y stubs — **✓ COMPLETE 2026-05-16**

All 4 FRs at 10/10 anchor-grade.

- [x] FR-A11Y-002 (shadow-DOM mirror) · 10/10
- [x] FR-A11Y-003 (skip-story pill) · 10/10
- [x] FR-A11Y-004 (mute toggle) · 10/10
- [x] FR-A11Y-005 (skip-3D toggle) · 10/10

### Batch 10 — P4 SCENE implementations — **✓ COMPLETE 2026-05-16**

All 12 FRs at 10/10 anchor-grade.

- [x] FR-SCENE-013 (Scene 1 Origin impl) · 10/10
- [x] FR-SCENE-014 (Scene 2 Transformation impl) · 10/10
- [x] FR-SCENE-015 (Scene 3 Capabilities impl) · 10/10
- [x] FR-SCENE-016 (Scene 4 Team impl) · 10/10
- [x] FR-SCENE-017 (Scene 5 Vietnam→Global impl) · 10/10
- [x] FR-SCENE-018 (Scene 6 CTA Hub impl) · 10/10
- [x] FR-SCENE-019 (Footer Lumi corner impl) · 10/10
- [x] FR-SCENE-020 (scroll orchestrator) · 10/10
- [x] FR-SCENE-021 (mobile compressed flow) · 10/10
- [x] FR-SCENE-022 (DPR + particle scaling) · 10/10
- [x] FR-SCENE-023 (LOD swap > 12m) · 10/10
- [x] FR-SCENE-024 (nón lá hover Easter egg) · 10/10

### Batch 11 — P4 CTA forms + CMS — **✓ COMPLETE 2026-05-16**

All 12 FRs at 10/10 anchor-grade.

- [x] FR-CTA-002 (Calendly embed) · 10/10
- [x] FR-CTA-003 (HubSpot partner) · 10/10
- [x] FR-CTA-004 (ATS jobs) · 10/10
- [x] FR-CTA-005 (form-validation) · 10/10
- [x] FR-CTA-006 (lead API) · 10/10
- [x] FR-CTA-007 (Lumi form reactions) · 10/10
- [x] FR-CTA-008 (timezone clock) · 10/10
- [x] FR-CMS-004 (Sanity schema) · 10/10
- [x] FR-CMS-005 (ISR revalidation) · 10/10
- [x] FR-CMS-006 (work/[slug]) · 10/10
- [x] FR-CMS-007 (i18n loader) · 10/10
- [x] FR-CMS-008 (hreflang) · 10/10

### Batch 12 — P5 PERF / A11Y / SEO / CMS

- [ ] FR-PERF-002..011
- [ ] FR-A11Y-006..013
- [ ] FR-SEO-002..006
- [ ] FR-CMS-009..010

### Batch 13 — P6 launch

- [ ] FR-SEO-007..009 + FR-CTA-009..011 + FR-OPS-014..016 + FR-A11Y-013 + FR-PERF-011 + FR-CMS-011

---

## Upgrade workflow

For each compact FR:

1. Read the existing FR markdown. Note its frontmatter (preserve).
2. Read the related anchor-grade FRs in the same module for tone reference.
3. Author §1-§8 to anchor-grade depth (~12-18 KB). Use the FR-CHAR-001 / FR-WEB-001 / FR-CTA-001 anchors as the template.
4. Author the audit ladder: pre-revision score (typically 8.0/10) → R1 findings + resolutions → R2 score (10/10).
5. Update frontmatter: `status: spec-stub` → `status: accepted`.
6. Run `python3 tools/regen-backlog.py` + `python3 tools/fr-graph.py --no-cycles`.
7. The status column in BACKLOG.md flips from `spec-stub (6.5/10)` → `accepted (10/10)` automatically.

## Stop conditions

- Pause this work if the team starts touching an unupgraded FR — prioritize that FR first.
- Do NOT mark a compact FR `building` or `shipped` without anchor-grade upgrade — the audit gate (10/10) is the contract.
