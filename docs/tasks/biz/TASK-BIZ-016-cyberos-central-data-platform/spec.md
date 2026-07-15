---
id: TASK-BIZ-016
title: "CyberOS central data platform for landing leads and content"
status: draft
class: improvement
priority: MUST
owner: human
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/LEAD-02, audit-A/section-9, docs/architecture/cyberos-central-data-source]
---

# TASK-BIZ-016: CyberOS central data platform for landing leads and content

## 0. Why (evidence)

The operator has decided CyberOS is the centralized system of record for landing-page data (leads, blogs/notes, and related publishable content). TASK-BIZ-002 only wires lead intake and explicitly leaves “Building the CyberOS side” out of scope. Without a platform task, content remains stuck in `lib/content/*` and leads remain split between email/Slack, local Prisma, and an optional webhook.

## 1. Description (normative)

- 1.1 CyberOS SHALL expose an authenticated **lead-intake** API suitable for production use by this landing site (shared-secret or equivalent), accepting intent, source, locale, UTM, and optional transcript.
- 1.2 CyberOS SHALL expose an authenticated **content** API (or export) for publishable site entities: notes/posts, work/case studies, testimonials, and team records, each with EN+VI fields where user-facing.
- 1.3 Ownership SHALL be documented: CyberOS is system of record; the landing page may keep an edge cache or git fallback but MUST NOT invent a second CRM or second CMS of truth.
- 1.4 PDPL retention, erasure, and processor roles for leads and transcripts held in CyberOS SHALL be documented before production traffic is pointed at it (pairs with TASK-BIZ-012).

## 2. Acceptance criteria

- [ ] AC for 1.1 - lead-intake rejects unauthenticated POSTs and accepts a valid payload - evidence: request log / TASK-BIZ-003
- [ ] AC for 1.2 - content API returns at least one published note and empty list safely - evidence: OpenAPI or sample response checked into docs
- [ ] AC for 1.3 - ownership doc exists under docs/ - evidence: `docs/architecture/cyberos-central-data-source.md` + CyberOS runbook link
- [ ] AC for 1.4 - PDPL note lists CyberOS as processor for leads - evidence: TASK-BIZ-012 update or dedicated doc

## 3. Edge cases

- CyberOS partial outage: landing must still accept leads (TASK-OPS-010 / dual-write).
- Content API schema change must be versioned so the landing build does not silently empty pages.

## 4. Out of scope / non-goals

- Implementing the Next.js read adapter (TASK-OPS-019).
- Migrating historical leads (TASK-OPS-020).
- Authoring UX polish inside the landing repo.

## 5. Protected invariants this task must not weaken

- Secrets live only in server env; no NEXT_PUBLIC_ secret, ever.
- A submitted lead is never silently lost.
