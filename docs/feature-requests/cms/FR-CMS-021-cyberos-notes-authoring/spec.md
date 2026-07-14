---
id: FR-CMS-021
title: "Notes/blog authoring via CyberOS (deprecates notes.ts write SSOT)"
status: draft
class: product
priority: SHOULD
owner: mixed
depends_on: [FR-OPS-019, FR-CMS-010]
routed_back_count: 0
awh: N/A
traces_to: [docs/architecture/cyberos-central-data-source, FR-CMS-007, FR-SEO-006]
---

# FR-CMS-021: Notes/blog authoring via CyberOS (deprecates notes.ts write SSOT)

## 0. Why (evidence)

FR-CMS-007/010 shipped a strong post template (author, dates, TLDR) backed by `lib/content/notes.ts`. Operator direction moves blogs into CyberOS; continuing to author only in git blocks marketing velocity and splits truth.

## 1. Description (normative)

- 1.1 New insight posts SHALL be authored in CyberOS with author, published/updated dates, TLDR, and EN+VI body satisfying FR-CMS-010.
- 1.2 Public `/[lang]/notes` and `/[lang]/notes/[slug]` SHALL render via the FR-OPS-019 read model.
- 1.3 Existing posts in `lib/content/notes.ts` SHALL be migrated once into CyberOS (or remain as fallback seed data only).
- 1.4 RSS (`FR-SEO-006`) and llms digests SHALL continue to derive from the same read model so feeds cannot drift from the site.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a CyberOS-authored post appears on /notes after publish - test: `content/notes-from-read-model`
- [ ] AC for 1.2 - routes do not import `notes` array directly when CyberOS is configured - test: `content/read-model-shape`
- [ ] AC for 1.3 - migrated slugs resolve for both locales - test: `content/notes-migration-parity`
- [ ] AC for 1.4 - feed entries match public post titles - test: `seo/rss-parity`

## 3. Edge cases

- Unpublishing in CyberOS must remove the route or 404 without rebuild if ISR is used.
- Draft posts never appear in RSS.

## 4. Out of scope / non-goals

- Case studies / testimonials migration (use CMS-009/004 after OPS-019).
- In-repo WYSIWYG editor.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first.
- Nothing published without evidenceable claims.
