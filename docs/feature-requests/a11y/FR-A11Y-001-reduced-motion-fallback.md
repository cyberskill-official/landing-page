---
id: FR-A11Y-001
engineering_anchor: true
title: "Reduced-motion fallback — 7-panel SVG storyboard at /lite and @media swap inline"
module: A11Y
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
milestone: P3 · slice 3
slice: 1
owner: QA / Accessibility + Designer
created: 2026-05-16
shipped: 2026-05-17
brain_chain_hash: null
related_frs: [FR-A11Y-002, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-A11Y-006, FR-A11Y-011, FR-A11Y-012, FR-WEB-008, FR-CMS-002]
depends_on: [FR-WEB-008]   # /lite route slot
blocks:
  - FR-A11Y-002       # shadow-DOM mirror in main canvas references the same content
  - FR-A11Y-011       # /accessibility page documents this behaviour
  - FR-A11Y-012       # axe + VO/NVDA pass needs this surface

source_pages:
  - docs/01-master-plan-v2.md §2.3 (Scroll-jacking ethics & accessibility paths)
  - docs/01-master-plan-v2.md §7.3 (Reduced motion — swap to 7-panel storyboard)
  - docs/01-master-plan-v2.md §7.5 (WCAG 2.2 AA criteria — 2.3.3 + 2.5.5)
  - docs/01-master-plan-v2.md §10.2 (Risk — buyer audience finds experience "too much")

source_decisions:
  - "v2 §7.3: prefers-reduced-motion → 7 static SVG panels; this is also the WCAG 2.3.3 alternative"
  - "v2 §2.3: /lite is a separate route + 'Skip 3D entirely' toggle persisted in localStorage"
  - "v2 §10.2: skip-3D is the buyer-soothing path; A/B test hero CTA prominence post-launch"

language: typescript 5.6 + svg
service: apps/web/app/lite/ + apps/web/components/lite/
new_files:
  - apps/web/app/lite/page.tsx
  - apps/web/components/lite/StoryboardPanel.tsx
  - apps/web/components/lite/LiteHero.tsx
  - apps/web/components/lite/storyboard-panels.ts
  - apps/web/public/storyboard/scene-0-hero.svg
  - apps/web/public/storyboard/scene-1-origin.svg
  - apps/web/public/storyboard/scene-2-transformation.svg
  - apps/web/public/storyboard/scene-3-capabilities.svg
  - apps/web/public/storyboard/scene-4-team.svg
  - apps/web/public/storyboard/scene-5-vietnam-global.svg
  - apps/web/public/storyboard/scene-6-cta-hub.svg
  - apps/web/app/globals.css
  - apps/web/tests/a11y/lite.spec.ts
modified_files:
  - apps/web/components/canvas/GlobalCanvasShell.tsx   # short-circuit on prefers-reduced-motion
  - apps/web/app/page.tsx                              # add inline @media swap markup
allowed_tools:
  - figma: design/scenes/scene-*/**           # for SVG export reference
  - file_read: docs/01-master-plan-v2.md
  - file_write: apps/web/app/lite/**
  - file_write: apps/web/components/lite/**
  - file_write: apps/web/public/storyboard/**
  - bash: pnpm -F web exec playwright test
  - bash: pnpm exec axe apps/web/.next/server/app/(lite)/page.html
disallowed_tools:
  - import three / R3F / GSAP in any /lite route module
  - render the canvas when prefers-reduced-motion is set
  - rely on JavaScript to deliver the storyboard content (must be pure HTML/SVG/CSS)

effort_hours: 8
sub_tasks:
  - "1h: 7 SVG panels at 1200×800 — one per scene, captioned, palette-locked, gzip-checked"
  - "1h: StoryboardPanel.tsx — pure-DOM component, no client JS"
  - "1h: app/(lite)/page.tsx + layout.tsx — server component, NO canvas, NO three import"
  - "1h: app/(lite)/layout.tsx — overrides root layout to NOT mount GlobalCanvasShell"
  - "1h: GlobalCanvasShell.tsx amendment — short-circuit on prefers-reduced-motion mediaQuery"
  - "1h: inline @media (prefers-reduced-motion: reduce) swap on apps/web/app/page.tsx (covers users who don't redirect)"
  - "1h: Playwright a11y tests (axe-core scan + reducedMotion emulation)"
  - "1h: founder review + caption-text approval (founder is the brand-voice authority)"

risk_if_skipped: |
  Without a reduced-motion fallback, WCAG 2.3.3 fails on audit — and prefers-reduced-motion users
  (estimated 5-10% of visitors, including vestibular-disorder users + business travellers on jet
  lag) see a broken, motion-trapped page. The /lite path also doubles as the "buyer audience
  finds experience too much" mitigation (master plan §10.2). Skip → both an accessibility audit
  failure AND a conversion leak in the buyer track.
---

## §1 — Description (BCP-14 normative)

A reduced-motion fallback **MUST** be delivered at two levels: (a) a dedicated `/lite` route with a 7-panel storyboard; (b) an inline `@media (prefers-reduced-motion: reduce)` swap on the main `/` route that short-circuits canvas mount and shows an inline static rendering of the same 7 panels.

1. **MUST** ship `/lite` as a separate route under `app/(lite)/page.tsx` that renders 7 storyboard panels in DOM order: Scene 0 Hero → Scene 6 CTA Hub. Each panel is a `StoryboardPanel` component embedding a static SVG illustration + the Lumi narration caption from FR-CMS-002.
2. **MUST NOT** import `three`, `@react-three/*`, `gsap`, `lenis`, or `@14islands/r3f-scroll-rig` in any `app/(lite)/**` module or any module transitively reachable from `app/(lite)/page.tsx`. Verified by webpack bundle analysis.
3. **MUST** override the root layout for the `(lite)` route group with `app/(lite)/layout.tsx` that does NOT render `<GlobalCanvasShell>` or `<SmoothScrollProvider>`.
4. **MUST** ship 7 SVG panels at `apps/web/public/storyboard/scene-{0..6}-{slug}.svg`. Each:
   - **MUST** be 1200×800 viewBox.
   - **MUST** use ONLY the Saigon Dusk palette (per FR-DS-002).
   - **MUST** include the scene title + Lumi narration line as `<text>` elements (not rasterised) so screen readers can read them.
   - **MUST** include `<title>` and `<desc>` elements with the scene name and a 1-sentence what-this-shows.
   - **MUST** be ≤ 30 KB each (gzipped). Total storyboard weight ≤ 200 KB gzipped.
5. **MUST** amend `components/canvas/GlobalCanvasShell.tsx` so that `window.matchMedia('(prefers-reduced-motion: reduce)').matches` short-circuits canvas mount — the user stays on `/` but sees an inline reduced-motion rendering.
6. **MUST** add inline `@media (prefers-reduced-motion: reduce)` CSS swap on `apps/web/app/page.tsx` that:
   - Hides the canvas container (display: none).
   - Shows a `<section class="lite-inline">` containing the same 7 SVG panels (rendered inline as `<img src="/storyboard/scene-N-...svg" alt="..." />`).
   - This MUST work without JavaScript — the swap is CSS-only.
7. **MUST** add a "Skip 3D entirely" toggle in the page header that, when clicked, sets `localStorage.cyberskill_lite_pref = "1"` and navigates to `/lite`. On subsequent visits, the localStorage flag MUST cause `app/page.tsx` to redirect to `/lite` server-side via Next.js middleware (or a client-side `useEffect` redirect on first paint, whichever ships faster).
8. **MUST** add a "Back to cinematic" link on every `/lite` panel that clears the localStorage flag and navigates to `/`.
9. **MUST** include Lumi narration captions (`aria-live="polite"`) on each panel. Caption text MUST come from FR-CMS-002 verbatim. No paraphrasing.
10. **MUST** include a "Book a Discovery Call" CTA on every panel (sticky bottom on mobile, inline on desktop). This is the conversion path on `/lite` — buyers must reach it without engaging the cinematic.
11. **MUST** include `<a rel="alternate" href="/" hreflang="x-default">` and equivalent linkbacks so search engines understand `/lite` is the same content via a different presentation (avoids duplicate-content penalties).
12. **MUST** pass `axe-core/playwright` with **zero** violations at `serious` or `critical` severity across all 7 panels.
13. **MUST** pass a Playwright e2e test under `emulateMedia: { reducedMotion: 'reduce' }` that verifies: (a) the `<canvas>` element never appears on `/`; (b) the inline `<section class="lite-inline">` is visible; (c) the 7 SVG panels are present in DOM order; (d) the "Book a Discovery Call" CTA is keyboard-reachable.
14. **MUST** be WCAG 2.2 AA compliant in particular for SCs **1.4.3** (contrast ≥ 4.5:1 body text), **2.3.3** (motion alternative), **2.5.5** (target size AAA — 44×44 CTAs), **1.4.10** (reflow @ 320px width). The audit checklist sits on `apps/web/components/lite/A11Y_CHECKLIST.md`.

---

## §2 — Why this design (rationale for humans)

**Why two levels (separate route + inline swap)?** A user who has set `prefers-reduced-motion: reduce` system-wide should never even fetch three.js — but if they land via a deep link that doesn't trigger the redirect, the inline swap rescues them. A user who actively clicks "Skip 3D entirely" (because they're on a coffee-shop wifi or a buyer in a meeting) should go to `/lite` permanently — the redirect handles that. Two paths, two intents.

**Why SVG, not PNG?** Three reasons. (1) Scalability — the same file looks crisp at 1×, 2×, 4× without 3× the bytes. (2) Accessibility — `<text>` elements inside SVG are screen-reader-readable; PNG text is not. (3) Weight — a single SVG illustration of a Lumi-pose-with-caption averages ~20 KB; the rasterised equivalent at 1200×800 @ 2× is 60+ KB.

**Why "no three import anywhere in /lite"?** Master plan §6.1 + §7.3 — `/lite` is the path for users who specifically opted out of the 3D experience (or are on a save-data connection). Even loading three's parser to *evaluate* whether to render it costs ~80 KB of parse time. Hard-forbidding the import gives us a 0-byte guarantee on this path.

**Why localStorage, not a cookie?** Cookies require a banner under GDPR; localStorage as a personalisation preference (not for tracking) does not, when documented in the privacy policy. Master plan §8.4 says "GA4 + Plausible cookieless"; the lite preference should match that posture.

**Why aria-live="polite" on captions?** When a user navigates panel-to-panel, the caption text changes. `polite` causes screen readers to announce the new caption without interrupting current speech. `assertive` would interrupt — wrong tone for narrative content.

**Why hreflang/alternate on /lite ↔ /?** Master plan §8.3 + SEO sub-FRs (FR-SEO-001..006) emphasise canonical URLs. `rel="alternate"` is the canonical hint that "same content, different presentation"; without it Google can flag `/lite` as duplicate content and suppress one of the URLs from results.

---

## §3 — Public surface contract

### §3.1 `app/(lite)/layout.tsx`

```tsx
import '@/styles/lite.css';

export default function LiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" href="/" hrefLang="x-default" />
        <meta name="robots" content="index,follow" />
      </head>
      <body className="lite-body">
        <header className="lite-header">
          <a href="/" data-clear-lite-pref>← Back to cinematic</a>
        </header>
        <main>{children}</main>
        <footer className="lite-footer">{/* trust signals + nav */}</footer>
      </body>
    </html>
  );
}
```

Note: this layout is **independent** of `app/layout.tsx`. No `<GlobalCanvasShell>` / `<SmoothScrollProvider>`. Pure DOM.

### §3.2 `app/(lite)/page.tsx`

```tsx
import { StoryboardPanel } from '@/components/lite/StoryboardPanel';
import { STORYBOARD_PANELS } from '@/components/lite/storyboard-panels';

export const metadata = {
  title: 'CyberSkill — Senior Software from Vietnam (read-only mode)',
  description: 'A static, motion-free overview of CyberSkill. Same content, no cinematic.',
};

export default function LitePage() {
  return (
    <>
      {STORYBOARD_PANELS.map((p) => (
        <StoryboardPanel key={p.id} {...p} />
      ))}
    </>
  );
}
```

### §3.3 `components/lite/storyboard-panels.ts`

```ts
import type { ReactNode } from 'react';

export interface StoryboardPanelData {
  id: 'scene-0' | 'scene-1' | 'scene-2' | 'scene-3' | 'scene-4' | 'scene-5' | 'scene-6';
  svgPath: `/storyboard/${string}.svg`;
  title: string;
  narration: string;
  ctaPrimary: { label: string; href: string };
}

export const STORYBOARD_PANELS: readonly StoryboardPanelData[] = [
  {
    id: 'scene-0',
    svgPath: '/storyboard/scene-0-hero.svg',
    title: 'What if your will became real?',
    narration: "Whisper an idea. I'll show you the rest.",
    ctaPrimary: { label: 'Book a Discovery Call', href: '#cta-hub' },
  },
  // …six more, hand-transcribed from FR-CMS-002 …
];
```

### §3.4 `components/lite/StoryboardPanel.tsx`

```tsx
import { StoryboardPanelData } from './storyboard-panels';

export function StoryboardPanel({ id, svgPath, title, narration, ctaPrimary }: StoryboardPanelData) {
  return (
    <section className={`lite-panel lite-panel-${id}`} aria-labelledby={`${id}-h2`}>
      <h2 id={`${id}-h2`}>{title}</h2>
      <img src={svgPath} alt={`Storyboard illustration for ${title}`} width={1200} height={800} loading="lazy" />
      <p className="lite-narration" aria-live="polite">{narration}</p>
      <a className="lite-cta" href={ctaPrimary.href}>{ctaPrimary.label} →</a>
    </section>
  );
}
```

### §3.5 GlobalCanvasShell amendment (canonical excerpt)

```tsx
// components/canvas/GlobalCanvasShell.tsx (delta)
useEffect(() => {
  if (typeof window === 'undefined') return;
  if (!hasWebGL2()) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // ← FR-A11Y-001
  // …
}, []);
```

### §3.6 Inline @media swap on `app/page.tsx`

```css
/* apps/web/styles/lite.css — included on / via app/layout.tsx */
@media (prefers-reduced-motion: reduce) {
  .canvas-container { display: none; }
  .lite-inline { display: block; }
}
@media (prefers-reduced-motion: no-preference) {
  .lite-inline { display: none; }
}
```

```tsx
// apps/web/app/page.tsx — inline fallback markup (always in DOM, CSS-toggled)
<>
  <div className="canvas-container">{/* canvas mounts via GlobalCanvasShell */}</div>
  <section className="lite-inline" aria-hidden="false">
    {STORYBOARD_PANELS.map(p => <StoryboardPanel key={p.id} {...p} />)}
  </section>
</>
```

The CSS-only swap MUST work without JS. The same DOM nodes serve both paths; user preference selects which is visible.

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **`/lite` route renders without three** — `curl -s http://localhost:3000/lite` returns 200 + HTML containing all 7 panel `<h2>` titles. `grep -ciE 'three|react-three|gsap|lenis' /tmp/lite.html` MUST be 0.
2. **`/lite` route group isolation** — `pnpm -F web build` then `grep -l 'three\\|react-three' apps/web/.next/server/app/(lite)/*` MUST return zero files.
3. **Seven SVG files exist** — All 7 files at `apps/web/public/storyboard/scene-{0..6}-*.svg` MUST exist; each MUST be ≤ 30 KB gzipped (compressed via `gzip -c file.svg | wc -c`); total ≤ 200 KB gzipped.
4. **SVG content is text-accessible** — Each SVG MUST contain a `<title>` and `<desc>` element; the scene title MUST appear as `<text>` (NOT rasterised); axe scan returns 0 SVG-related violations.
5. **prefers-reduced-motion short-circuits canvas** — Playwright with `emulateMedia: { reducedMotion: 'reduce' }`, navigate to `/`: assert `<canvas>` count is 0 after 3-second wait; assert `.lite-inline` is visible; assert 7 `<h2>` headings (one per panel) are visible.
6. **prefers-reduced-motion CSS-only** — Disable JavaScript in the Playwright context, set reduced-motion, navigate to `/`: the inline `.lite-inline` MUST still display (CSS swap, no JS needed).
7. **localStorage flag works** — Playwright: click "Skip 3D entirely" toggle; assert `localStorage.cyberskill_lite_pref === '1'`; refresh; assert URL is `/lite` (redirect happened) and SVG panels visible. Click "Back to cinematic"; assert localStorage flag is cleared; URL is `/`.
8. **`<a rel="alternate" hreflang>` present** — HTML head of `/lite` MUST contain `<link rel="alternate" href="/" hreflang="x-default">` and equivalent reverse link on `/`. Asserted by HTML parser test.
9. **Captions come from FR-CMS-002 verbatim** — Storyboard-panels.ts narration strings MUST be byte-identical to the equivalent rows in FR-CMS-002's narration table. Asserted by `tests/a11y/captions-match-cms.spec.ts` comparing against the canonical JSON.
10. **axe-core scan clean** — `pnpm exec axe http://localhost:3000/lite` MUST return zero violations at `serious` or `critical` severity. Same for `/` with reduced-motion active.
11. **CTA target size ≥ 44×44** — Playwright with viewport 390×844: every `.lite-cta` element MUST have a computed bounding box with width ≥ 44 AND height ≥ 44.
12. **Reflow @ 320px width** — Playwright viewport 320×800: page MUST render without horizontal scroll; assert `document.documentElement.scrollWidth <= 320`.
13. **CTA contrast** — Computed text/background colours of `.lite-cta` MUST achieve ≥ 4.5:1 contrast (WCAG 1.4.3). Asserted programmatically via axe.
14. **A11Y_CHECKLIST.md exists** — `apps/web/components/lite/A11Y_CHECKLIST.md` MUST exist and list each AC #1-#13 mapped to its WCAG SC.

---

## §5 — Verification method

**Tests (`verify: T`):**

```typescript
// apps/web/tests/a11y/lite.spec.ts (Playwright)
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('AC#1: /lite renders without three', async ({ page }) => {
  const resp = await page.goto('/lite');
  expect(resp!.status()).toBe(200);
  const html = await resp!.text();
  expect(html).toMatch(/What if your will became real/);
  expect(html).not.toMatch(/three|react-three|gsap|lenis/i);
});

test('AC#5: prefers-reduced-motion short-circuits canvas', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(3000);
  expect(await page.locator('canvas').count()).toBe(0);
  await expect(page.locator('.lite-inline')).toBeVisible();
  expect(await page.locator('.lite-inline h2').count()).toBe(7);
});

test('AC#6: CSS-only swap (no JS)', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.lite-inline')).toBeVisible();
});

test('AC#7: localStorage skip-3D flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-skip-3d]');
  expect(await page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBe('1');
  await page.reload();
  expect(page.url()).toMatch(/\/lite$/);
});

test('AC#10: axe-core clean on /lite', async ({ page }) => {
  await page.goto('/lite');
  const r = await new AxeBuilder({ page }).analyze();
  const serious = r.violations.filter(v => ['serious', 'critical'].includes(v.impact!));
  expect(serious).toHaveLength(0);
});

test('AC#11: CTA target size at mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lite');
  const ctas = page.locator('.lite-cta');
  const count = await ctas.count();
  for (let i = 0; i < count; i++) {
    const box = await ctas.nth(i).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
```

CI gate: `pnpm -F web exec playwright test tests/a11y/lite.spec.ts`. Failure blocks merge.

---

## §6 — Dependencies

- FR-WEB-008 (routing slot for `/lite`).
- FR-CMS-002 (narration lines verbatim).
- FR-DS-002 (palette swatch for SVG authoring).

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Three.js sneaks into `/lite` via shared util | AC#2 build-time grep | Move the offending util into a server-only or `/lite`-disjoint module |
| SVG text rasterised by mistake | AC#4 fails (no `<text>` element) | Re-export from Figma with "Outline text" OFF; verify in raw SVG markup |
| CSS swap doesn't work without JS | AC#6 fails | Verify `@media` rules are in CSS, not JS-injected styles |
| localStorage redirect creates infinite loop | Manual smoke | Add a one-shot guard: redirect ONLY when on `/` AND lite_pref is set; never from `/lite` |
| hreflang on `/lite` points to itself | AC#8 fails | The `alternate` MUST point to `/` (the canonical), not `/lite` |
| Captions drift from FR-CMS-002 | AC#9 captions-match-cms test fails | Re-import from CMS JSON; storyboard-panels.ts is the consumer, not the source |
| SVG file exceeds 30 KB gz | AC#3 fails | Simplify; reduce vector path count; remove gradients |
| CTA contrast fails on dark gold-on-brown CTA | AC#13 axe report | Use higher gold variant + outline; re-test |
| Skip-3D toggle is < 44×44 | AC#11 fails | Increase target; consider invisible padding |
| Reflow horizontal scroll at 320px | AC#12 fails | Audit overflow-x; use `clamp()` for SVG widths instead of fixed |

---

## §8 — Notes

- The 7 SVG panels are the canonical static representation of the entire site narrative. They are reused as: (a) `/lite` content, (b) inline reduced-motion swap on `/`, (c) shareable OG images for social cards (FR-SEO-004), (d) print-version reference for the Cinematic Pack docs site.
- The `app/(lite)/layout.tsx` overrides the root layout via App Router's route group convention. This is the cleanest way to get a three-free render in Next 15.
- The "captions verbatim from FR-CMS-002" rule is enforced socially + by AC#9. If you want to tweak narration on `/lite`, you tweak the CMS source. Two sources of truth would silently diverge.

---

*End of FR-A11Y-001. Audit: `FR-A11Y-001-reduced-motion-fallback.audit.md`.*
