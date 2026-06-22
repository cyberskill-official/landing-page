# DEC: Accessibility + SEO + privacy FR sprint

- Date: 2026-06-22
- Status: accepted
- Modules: A11Y, SEO, CMS, WEB
- Deciders: Stephen Cheng (operator), agent (judgment call)

## Context

With the site live and the full 93-FR catalog written, the operator asked to
keep implementing buildable FRs. The cluster with the highest value-to-risk and
no external-asset dependency was accessibility, structured data, and the privacy
notice: all server-rendered, no new runtime deps, and each closes a MUST/SHOULD
the live site was missing.

## Decision

Shipped six FRs in one verified increment:

- FR-CMS-008: bilingual privacy/legal page (`/[lang]/privacy`) covering lead-form
  and chat data handling, PDPL/GDPR-aware. The consent checkbox (LeadForm), the
  chat disclosure (GenieChatPanel), the careers consent note, and the footer all
  link to it, so the stated terms match the collected terms.
- FR-A11Y-002: bilingual `/[lang]/accessibility` statement (WCAG 2.2 AA target,
  motion stance, links the `/lite` reduced-motion path, footer-reachable).
- FR-A11Y-006: chat transcript as `role="log"` + `aria-live="polite"` +
  `aria-relevant="additions text"` + `aria-busy`, plus return-focus to the
  launcher on close.
- FR-SEO-003: a `BreadcrumbJsonLd` server component on work, work/[slug],
  careers, privacy, and accessibility, with absolute URLs and locale-aware names.
- FR-SEO-004: `CreativeWork` JSON-LD on case studies; author and publisher both
  reference the `#organization` node by `@id` rather than duplicating a logo.
- FR-WEB-007: `app/[lang]/loading.tsx` skeleton (reduced-motion aware); the
  existing root `app/error.tsx` already covers render failures in the subtree.

## Consequences

- BACKLOG totals move to 30 shipped / 1 hold / 62 planned. Per-module shipped:
  WEB 4, CMS 3, SEO 4, A11Y 3.
- Verified locally in a clean Linux build: tsc clean, vitest 18/18, next lint
  clean, next build rc=0 with 26/26 static pages (including `/accessibility` and
  `/privacy` for en and vi). Pushed to GitHub; Vercel redeploys from main.
- Two honest scope notes recorded in the FR evidence: FR-SEO-004 ships the
  case-study CreativeWork only (insight Article waits on an insights route that
  does not exist yet), and FR-A11Y-006 still wants a manual screen-reader pass.
- FR-A11Y-004 (full keyboard pass) stays planned: it needs real assistive-tech
  testing to close honestly.

## Related

[[FR-CMS-008-privacy-legal]] [[FR-A11Y-002-accessibility-statement]] [[FR-A11Y-006-chat-live-regions]] [[FR-SEO-003-breadcrumb-schema]] [[FR-SEO-004-article-schema]] [[FR-WEB-007-route-states]]
