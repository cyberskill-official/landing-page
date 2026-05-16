# CyberSkill Landing Page

> A 3D + animated, storytelling-driven marketing site for CyberSkill, anchored by **Lumi the Golden Genie**. Single-page Next.js 15 + R3F experience across 7 scroll-choreographed scenes.

**Project URL (TBD):** https://cyberskill.world
**Status:** P0 in progress — 125 FRs audited (all 10/10), team can begin week 1 immediately.
**Owner:** Stephen Cheng (founder, creative director)

---

## Quick start

```bash
# 1. Clone + install
git clone <repo-url>
cd landing-page
pnpm install
git lfs install   # required — source assets are LFS-tracked (FR-OPS-008)

# 2. Run the web app (Next 15)
pnpm dev   # → http://localhost:3000

# 3. Run tests
pnpm test

# 4. Regenerate derived files
pnpm regen-backlog     # rewrites BACKLOG.md §11 from FR frontmatter
pnpm regen-fr-graph    # rebuilds FR_GRAPH.md mermaid + cycle check
pnpm regen-contrast    # rebuilds wcag-contrast-matrix.{md,json}
```

---

## Repository layout

```
landing-page/
├── AGENTS.md                       ← normative protocol (self-contained, ~12 KB)
├── CLAUDE.md                       ← @AGENTS.md alias
├── README.md                       ← this file
├── MASTER_INDEX.md                 ← single index of every artefact
├── TASKS.md                        ← per-FR work tracker (one row per accepted FR)
├── apps/web/                       ← Next 15 marketing site (FR-WEB-*)
├── packages/ds-cinematic/          ← @cyberskill/ds-cinematic (FR-DS-*)
├── content/narrative/              ← scene-defs.json, voice-rules.md, master-arc.md, en.json, vi.json (P0 execution artefacts)
├── design/                         ← character sheets, mood boards, palette canonical, contrast matrix
├── assets-source/blender/          ← source .blend files (LFS-tracked)
├── assets-built/optimized/         ← derived GLBs (gitignored; CI regenerates)
├── docs/
│   ├── 01-master-plan-v2.md        ← the 18-week strategic plan (input spec)
│   ├── FR_AUTHORING_WORKFLOW.md    ← per-FR playbook
│   ├── feature-requests/           ← 125 FRs + 125 audits + BACKLOG.md + FR_GRAPH.md
│   └── launch/                     ← founder signoff + week-1 plan + role assignments
├── tools/
│   ├── perf-budgets/               ← budgets.json + check-*.mjs scripts
│   ├── regen-backlog.py
│   └── fr-graph.py
└── .github/workflows/              ← ci.yml + perf-budgets.yml + a11y.yml
```

---

## What's audited and what's pending

**Audited to 10/10 (every FR through Phase P6):** 125 FRs across 10 modules · see [`MASTER_INDEX.md`](./MASTER_INDEX.md) for the click-through.

**Not yet built:** real Lumi 3D mesh, Substance textures, animation clips, Figma comp PNGs, Scene 0..6 React implementations. The team builds these per the FR specs.

**Already shipped (real content):**
- ✅ All 11 P0 execution artefacts (scene-defs, voice rules, EN+VI narration, palette JSON, contrast matrix, mood-board rationale, silhouette protocol, cultural-note).
- ✅ Repo scaffold (Next 15 app + ds-cinematic package + CI workflows).
- ✅ Tooling (regen-backlog, fr-graph, contrast-check).

---

## Who does what

See [`docs/launch/team-role-assignments.md`](./docs/launch/team-role-assignments.md) for the 10-person role-to-FR mapping.

Each FR's frontmatter `owner:` field names the role responsible.

---

## How to start work on an FR

1. Pick an FR from [`docs/feature-requests/BACKLOG.md`](./docs/feature-requests/BACKLOG.md) §11.
2. Verify all its `depends_on:` FRs are `shipped` (use `python3 tools/fr-graph.py` for the visual).
3. Move it to `status: building` in the FR markdown frontmatter.
4. Add a row to [`TASKS.md`](./TASKS.md): `- [ ] <FR-ID> · <Title> · status: building · est: <hours>h`.
5. Open a PR. CI (`.github/workflows/ci.yml`) gates lint + typecheck + test + build.
6. On merge, set `status: shipped` + `shipped: <date>` in frontmatter.
7. `pnpm regen-backlog` to sync BACKLOG.md §11.

---

## Governance

- **Threshold changes (palette, voice rules, scene structure, perf budgets):** require an `FR-XXX-NNN-amendment-*` per `AGENTS.md` §16.2. Don't edit canonical files in place.
- **CODEOWNERS:** `.github/CODEOWNERS` pins governance-critical paths to founder review.
- **BRAIN audit ledger:** `.cyberos-memory/` — every protocol-meaningful change emits an audit row.

---

## Links

- **Strategic plan:** [`docs/01-master-plan-v2.md`](./docs/01-master-plan-v2.md) — 18-week build, Lumi character, scene narrative, performance budgets.
- **FR workflow:** [`docs/FR_AUTHORING_WORKFLOW.md`](./docs/FR_AUTHORING_WORKFLOW.md) — how to author + audit + accept FRs.
- **Backlog:** [`docs/feature-requests/BACKLOG.md`](./docs/feature-requests/BACKLOG.md) — every FR, status, dependency.
- **Upgrade queue:** [`docs/launch/upgrade-queue.md`](./docs/launch/upgrade-queue.md) — 109 spec-stub FRs pending anchor-grade re-author
- **Founder signoff template:** [`docs/launch/founder-signoff-FR-CHAR-001.md`](./docs/launch/founder-signoff-FR-CHAR-001.md)
- **Week 1 plan:** [`docs/launch/week-1-execution-plan.md`](./docs/launch/week-1-execution-plan.md)
