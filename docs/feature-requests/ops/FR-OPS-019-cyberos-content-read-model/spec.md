---
id: FR-OPS-019
title: "Landing content read model from CyberOS (with git fallback)"
status: draft
class: product
priority: MUST
owner: agent
depends_on: [FR-BIZ-016]
routed_back_count: 0
awh: N/A
traces_to: [docs/architecture/cyberos-central-data-source, FR-CMS-001, FR-CMS-007]
---

# FR-OPS-019: Landing content read model from CyberOS (with git fallback)

## 0. Why (evidence)

Publishable content today is TypeScript modules (`lib/content/notes.ts`, `site.ts`, `services.ts`). That is excellent for review and CI but blocks non-dev publishing. Operator direction: CyberOS manages blogs and related content centrally; the landing site must consume a stable read model without forking facts.

## 1. Description (normative)

- 1.1 The landing app SHALL resolve notes, work/case studies, testimonials, and team data through a single **content read module** that returns typed records (same shapes as today's content modules where practical).
- 1.2 When CyberOS content is configured and reachable, the read module SHALL load **published** entities from CyberOS; when not configured or unreachable, it SHALL fall back to the git content modules so deploys never blank the site.
- 1.3 EN and VN fields SHALL ship together; a locale missing required copy SHALL fail the content gate or omit the entity (never EN-only placeholders).
- 1.4 The read module SHALL NOT embed a CMS editor UI in this repo.

## 2. Acceptance criteria

- [ ] AC for 1.1 - consumers import the read module, not ad-hoc fetch in each page - test: `content/read-model-shape`
- [ ] AC for 1.2 - with CyberOS down, fallback content still renders - test: `content/read-model-fallback`
- [ ] AC for 1.3 - bilingual parity gate covers read-model entities - test: `content/vi-parity`
- [ ] AC for 1.4 - no CMS admin route ships under app/ - test: `routes/no-cms-admin`

## 3. Edge cases

- Stale cache after publish: document revalidation strategy (ISR or on-demand) without blocking this FR's contract.
- Draft entities must never appear on public routes.

## 4. Out of scope / non-goals

- Migrating every historical post (FR-CMS-021).
- Lead dual-write (FR-OPS-020).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first.
- Nothing published may claim a fact the company cannot evidence.
