# FR-A11Y-001 Checklist

| AC | WCAG / Contract | Verification |
|---:|---|---|
| 1 | Motion alternative, no heavy runtime on `/lite` | `/lite` SSR contains seven storyboard headings and no canvas/runtime bundle markers. |
| 2 | Route isolation | Build output guardrails keep forbidden visual-runtime imports out of lite source. |
| 3 | Performance and reflow support | Seven SVG files exist; each is gzip-budgeted at 30 KB, total under 200 KB. |
| 4 | WCAG 1.1.1 Non-text Content | Every SVG includes `<title>`, `<desc>`, and text-rendered title/narration. |
| 5 | WCAG 2.3.3 Animation from Interactions | Reduced-motion users see `.lite-inline` and no `<canvas>` on `/`. |
| 6 | WCAG 2.3.3 without scripting dependency | JavaScript-disabled reduced-motion context still displays `.lite-inline`. |
| 7 | User preference control | `cyberskill_lite_pref` skip/back flow is keyboard and pointer reachable. |
| 8 | SEO alternate presentation | `/lite` publishes canonical and alternate links back to `/`; `/` links to `/lite`. |
| 9 | Content integrity | Captions match `content/narrative/lines/en.json` verbatim. |
| 10 | WCAG 2.2 AA automated gate | axe serious/critical violations are blocked in Playwright. |
| 11 | WCAG 2.5.5 Target Size | `.lite-cta` and back links meet or exceed 44 by 44 CSS pixels. |
| 12 | WCAG 1.4.10 Reflow | 320 px viewport has no horizontal document overflow. |
| 13 | WCAG 1.4.3 Contrast Minimum | CTA foreground/background colours meet 4.5:1 or better. |
