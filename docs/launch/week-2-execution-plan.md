# Week 2 — Day-by-Day Execution Plan

**Phase:** P1 (DS Extension + Storyboards + Greybox, weeks 3-5 of master plan; this is week 2 internally given week-1 over-delivery)
**Status:** Entering P1 with P0 fully closed (8/8 shipped on 2026-05-16).
**Phase exit gate:** Design + tech-feasibility signoff (Figma comps + greybox dry-run)

---

## What changed since week 1

| Outcome | Detail |
|---|---|
| ✅ P0 fully closed | All 8 FRs shipped in week 1 (vs 2-week budget). +1 week of buffer. |
| ✅ Repo scaffold ready | `apps/web/` + `packages/ds-cinematic/` + 3 GitHub workflows + `tools/perf-budgets/budgets.json` in place. |
| ✅ Tooling live | `regen-backlog.py`, `fr-graph.py`, `contrast-check-script.py` — all idempotent. |
| ✅ Content artefacts shipped | scene-defs, voice-rules, master-arc, en.json, vi.json, palette, contrast matrix, silhouette PNG, mood-board catalog. |
| ⏳ Buffer week | Use for P1 acceleration OR breathing room. Recommend: light-touch this week, deeper push weeks 3-5. |

## Monday

| Role | Task | FR | Deliverable |
|---|---|---|---|
| Founder | Read week-1 close-out + this plan (15 min) | — | Block calendar for Wed signoff window |
| All | **Phase P0 → P1 transition standup** (30 min): cross-team review of what each FR shipped + what each P1 FR depends on | — | Team aligned on P1 priorities |
| Frontend Lead | FR-DS-003 Cinematic Pack — verify scaffolded package builds; flesh out tests | FR-DS-003 | `pnpm -F @cyberskill/ds-cinematic build && test` passes |
| Designer | Source Cluster A mood-board references (5 actual image files) | FR-DS-001 (post-ship enhancement) | `design/mood-boards/references/A-*.{jpg,png}` populated |
| 3D Modeler | Start FR-CHAR-004 — proxy mesh blockout in Blender | FR-CHAR-004 | ~ 4-6k tri front-view of Lumi |
| QA | Run the silhouette panel test (FR-CHAR-002 AC#3 — 3 strangers) | FR-CHAR-002 (post-ship) | `silhouette-test-results.md` table rows filled in |

## Tuesday

| Role | Task | FR | Deliverable |
|---|---|---|---|
| Frontend Lead | FR-DS-004 — verify generated colors.ts matches palette JSON; add generator script | FR-DS-004 | `gen-color-tokens.mjs` + Vitest |
| Frontend Lead | FR-DS-006 — verify motion.ts + add motion.css | FR-DS-006 | Vitest passes |
| Designer | FR-SCENE-001 — Scene 0 Hero Figma comp at 3 breakpoints | FR-SCENE-001 | First-pass desktop comp |
| 3D Modeler | FR-CHAR-004 — finalize greybox topology + linkage from per-scene .blends | FR-CHAR-004 | `lumi-greybox.v01.blend` |
| Backend / DevOps | Verify .github/workflows/ci.yml fires green on a synthetic PR | FR-OPS-010 | First green CI run |

## Wednesday

| Role | Task | FR | Deliverable |
|---|---|---|---|
| Designer | FR-SCENE-001 — tablet + mobile comps + storyboard.md | FR-SCENE-001 | Submit for founder review |
| Frontend Lead | FR-DS-005 (flag accents) + FR-DS-007 (typography) — fill remaining tokens, run tests | FR-DS-005, FR-DS-007 | Tests pass |
| Founder | **30-min Wed review**: founder reviews mood-board reference assembly + Scene 0 Hero comp | FR-DS-001, FR-SCENE-001 | Signoff OR revision-notes |
| 3D Rigger | Read FR-CHAR-009 (custom armature spec) + start rig planning | FR-CHAR-009 | Bone-count plan |
| Copywriter | FR-CMS-009 prep — line up VI native reviewer for week 14 | FR-CMS-009 (P5) | Reviewer engaged |

## Thursday

| Role | Task | FR | Deliverable |
|---|---|---|---|
| Designer | FR-SCENE-002 — Scene 1 Origin Figma comp (start) | FR-SCENE-002 | Desktop comp draft |
| Frontend Lead | FR-DS-008 (glow recipes) + FR-DS-009 (lifecycle marker) | FR-DS-008, FR-DS-009 | All P1.1 DS FRs tests pass |
| 3D Modeler | FR-CHAR-005 — per-scene greybox sets (Scene 0 + Scene 1 first) | FR-CHAR-005 | Two scene .blends + linked Lumi |
| R3F Developer | Read FR-WEB-001 + bootstrap dev environment | FR-WEB-001 | `pnpm dev` works locally |

## Friday

| Role | Task | FR | Deliverable |
|---|---|---|---|
| Designer | FR-SCENE-002 — finish; submit + start Scene 3 | FR-SCENE-002 | Scene 1 submitted |
| Frontend Lead | Run `pnpm regen-backlog` + `regen-fr-graph` — verify §11 reflects week's progress | — | Updated BACKLOG.md §11 |
| Founder | **Weekly Lumi Lab review** (30 min, 4pm HCMC): scene comp reviews + mood-board signoff | — | Captured action items |
| All | Week-3 plan drafted by Frontend Lead | — | `week-3-execution-plan.md` |

---

## End-of-week status target

| FR | Expected state |
|---|---|
| FR-CHAR-002 | **shipped** (panel test results filled in) |
| FR-CHAR-004 | **shipped** (greybox in `assets-built/raw/`) |
| FR-DS-003..009 | All 7 Cinematic Pack token FRs **shipped** |
| FR-SCENE-001 | **shipped** (founder signoff) |
| FR-SCENE-002 | **shipped** (Scene 1 Origin) |
| FR-CHAR-005 | `building` (Scenes 0+1 done, 2-6 + footer pending) |

By Friday EOW, **~7-9 more FRs shipped** (12-19% of P1).

## Risks

| Risk | Mitigation |
|---|---|
| Designer pulled to client work | Founder protects 80% allocation for the week |
| Silhouette panel test fails | Recovery is FR-CHAR-001 revision (`FR-CHAR-001a-*` successor); ~1-2 day loop |
| Greybox tri-count overshoot | Decimate; greybox is intentionally proxy-grade — no rig, no textures |
| Founder Wed review slips | Pre-book the slot Monday; backup is Thursday 30-min |

---

*Drafted: 2026-05-16. Update: `pnpm regen-backlog` after each week's FR transitions; Frontend Lead drafts next-week plan by Wednesday.*
