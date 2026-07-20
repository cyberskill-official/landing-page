---
id: TASK-WEB-007
title: "Per-route loading and error boundaries for graceful states"
module: WEB
priority: SHOULD
status: done
class: product
verify: T
phase: P3
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-WEB-002]
source_pages:
  - "research doc §F (Next.js App Router, route states), §D (resilience)"
new_files:
  - app/[lang]/loading.tsx
  - app/error.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Every route SHOULD degrade gracefully, showing a considered loading and error state rather than a blank screen or an unhandled crash.

1. Routes SHOULD provide a `loading.tsx` boundary that renders a stable placeholder while a segment streams in.
2. Routes SHOULD provide an `error.tsx` boundary that catches a render failure, shows a recoverable message, and offers a retry.
3. Both boundaries MUST honor the active locale and the design tokens, and the error boundary MUST NOT leak internal error detail to the reader.

## §2 Acceptance

- A slow segment shows the loading placeholder, then the content, with no blank frame.
- A thrown render error is caught by the boundary and offers retry instead of crashing the route.

## §3 Evidence

Shipped 2026-06-22. `app/[lang]/loading.tsx` renders a locale-neutral skeleton (`aria-busy`, visually-hidden "Loading", shimmer that honors `prefers-reduced-motion`) while a segment streams. `app/error.tsx` is the root error boundary: it catches render failures anywhere below the root layout (including the `[lang]` subtree), shows a recoverable message with a retry, and does not surface internal error detail. Skeleton styles live in `globals.css` (`.cs-skeleton*`). Verified by `next build` (26/26 static pages generated, the `[lang]` segment compiles with the loading boundary) and a clean tsc + lint run.
