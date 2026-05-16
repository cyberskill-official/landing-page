# Week 1 — Day-by-Day Execution Plan

**Phase:** P0 (Discovery, Narrative, Character)
**Week:** 1 of 18
**Phase exit gate:** Founder signoff on FR-CHAR-001 + FR-CMS-001 + FR-DS-001

---

## Monday

| Role | Task | FR | Output |
|---|---|---|---|
| Founder (Stephen) | Read this plan; assemble the team kickoff | — | Calendar block for 10am Monday kickoff (30 min) |
| All team | **Kickoff meeting** (30 min): roles, FR-IDs, master plan, AGENTS.md walkthrough | — | Team aligned |
| Designer | Start FR-CHAR-001 — import logo SVG, rough 4 poses | FR-CHAR-001 | Sketch v0 (sharable end of day) |
| Copywriter | Start FR-CMS-001 — master arc + voice rules draft | FR-CMS-001 | First-pass `voice-rules.md` (already drafted; review + tweak) |
| 3D Modeler | Read FR-CHAR-004 + FR-CHAR-005 specs; set up Blender 4.4 baseline | — | Tooling installed |
| Frontend Lead | Read FR-WEB-001..009 specs; confirm Next 15 + R3F 9 versions current | — | Lock package.json deps |
| Backend / DevOps | Set up Git LFS (FR-OPS-008); verify CI workflows lint | FR-OPS-008, FR-OPS-010 | LFS active |
| QA | Read FR-A11Y-001..013 specs; install axe-core + Playwright | — | Toolchain ready |

## Tuesday

| Role | Task | FR | Output |
|---|---|---|---|
| Founder | First voice-rules workshop with Copywriter (1h) | FR-CMS-001 | Refined `voice-rules.md` |
| Designer | FR-CHAR-001 day 2 — refine 4 poses + start 6 expressions | FR-CHAR-001 | Front pose final + 2 expressions |
| Copywriter | FR-CMS-002 narration lines — draft based on tone reference | FR-CMS-002 | First-pass EN narration |
| 3D Modeler | Read FR-CHAR-006 production-mesh spec; review Blender + Quad Remesher | — | Plan tri budget per block |
| Frontend Lead | FR-WEB-001 — workspace + Next 15 monorepo init | FR-WEB-001 | `pnpm install` works |
| Designer | Start FR-DS-001 mood board — pull Cluster A references | FR-DS-001 | 4-6 Saigon Dusk references |

## Wednesday

| Role | Task | FR | Output |
|---|---|---|---|
| Designer | FR-CHAR-001 — 6 expressions + action posebook | FR-CHAR-001 | Expressions block done |
| Copywriter | FR-CMS-002 alt variants (alt-a per scene) | FR-CMS-002 | 8 alts authored |
| Designer | FR-DS-001 — Cluster B + C + D references | FR-DS-001 | Mood board assembled |
| Frontend Lead | FR-WEB-001 — layout.tsx + GlobalCanvas + /api/health | FR-WEB-001 | First Vitest passes |
| 3D Modeler | FR-CHAR-004 — start greybox in Blender | FR-CHAR-004 | Block-out v0 |

## Thursday

| Role | Task | FR | Output |
|---|---|---|---|
| Designer | FR-CHAR-001 — silhouette test prep + WCAG contrast block | FR-CHAR-001 | Sheet PDF ready |
| Founder | **Review session** — FR-CMS-001 + FR-CMS-002 (1h) | — | Signoffs OR revisions |
| Designer | FR-CHAR-002 — run 32×32 silhouette test (3 panellists) | FR-CHAR-002 | Results logged |
| Copywriter | FR-CMS-003 — start Vietnamese variants | FR-CMS-003 | First-pass VI |
| 3D Modeler | FR-CHAR-004 — greybox front-pose silhouette parity | FR-CHAR-004 | Greybox passes silhouette test |
| Designer | FR-DS-002 — palette swatch + run `contrast-check-script.py` | FR-DS-002 | Matrix generated |

## Friday

| Role | Task | FR | Output |
|---|---|---|---|
| Designer | FR-CHAR-001 — final revisions + export + email founder for signoff | FR-CHAR-001 | **Signoff request sent** |
| Founder | Review FR-CHAR-001 PDF (~15 min, use signoff template) | — | **APPROVED or revision-requested** |
| Designer | FR-DS-001 mood board — final rationale.md, founder review | FR-DS-001 | Signoff or revision |
| All | **Weekly Lumi Lab review** (30 min, Friday 4pm HCMC) | — | Cross-team alignment |

---

## End-of-week status

| FR | Expected state |
|---|---|
| FR-CHAR-001 | `building` → `shipped` (founder signoff archived) |
| FR-CHAR-002 | `building` (silhouette test results logged) |
| FR-CHAR-003 | `building` (cultural-note.md reviewed) |
| FR-DS-001 | `building` → `shipped` |
| FR-DS-002 | `building` → `shipped` |
| FR-CMS-001 | `building` (workshop done, scene-defs.json + voice-rules.md complete — see content/narrative/) |
| FR-CMS-002 | `building` (en.json complete) |
| FR-CMS-003 | `building` (vi.json first-pass) |

If any FR is blocked Friday evening: stand-up Monday with the blocker as the only agenda item.

## Risks this week

| Risk | Likelihood | Mitigation |
|---|---|---|
| Founder is travelling / hard to reach for signoffs | Medium | Pre-book 3 × 30-min slots Monday/Thursday/Friday |
| Silhouette test fails (FR-CHAR-002) on first attempt | Low (FR-CHAR-001 is rigorous) | Recovery path is in FR-CHAR-002 §1 #9: revise FR-CHAR-001, do not massage the test |
| Designer pulled to client work mid-week | Medium | Founder protects this week as 80% landing-page allocation |

---

*Use this as the team standup agenda each morning (5 min review of yesterday + today's row).*
