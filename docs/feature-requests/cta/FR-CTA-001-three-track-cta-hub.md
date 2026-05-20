---
id: FR-CTA-001
engineering_anchor: true
title: "Three-track CTA hub component (Buy / Partner / Join) with audience-routed forms"
module: CTA
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
milestone: P4 · slice 2
slice: 1
owner: Frontend Developer + Backend
created: 2026-05-16
shipped: 2026-05-18
brain_chain_hash: null
related_frs: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-005, FR-CTA-006, FR-CTA-007, FR-SCENE-018, FR-A11Y-008, FR-A11Y-009]
depends_on: [FR-DS-003]
blocks:
  - FR-CTA-002..008    # all CTA sub-features build on this component
  - FR-SCENE-018       # Scene 6 implementation needs the component
  - FR-CTA-011         # A/B testbed targets the three tracks

source_pages:
  - docs/01-master-plan-v2.md §1.2 (Three audiences, one page, three tracks)
  - docs/01-master-plan-v2.md §2.1 Scene 6 row (CTA Hub)
  - docs/01-master-plan-v2.md §9.1 (Three CTA tracks — when each surfaces)
  - docs/01-master-plan-v2.md §3.4 Scene 6 art direction (three glowing portals)
  - docs/01-master-plan-v2.md §5.6 (Conversion-friendly canvas overlays — DOM, not Drei <Html>)

source_decisions:
  - "v2 §9.1 Track 1: Calendly 3-step flow (chips → details → slot)"
  - "v2 §9.1 Track 2: HubSpot 4-field form (agency name / country / monthly capacity / brief)"
  - "v2 §9.1 Track 3: ATS-backed jobs form (name / email / role dropdown / portfolio URL / cover)"
  - "v2 §5.6: CTAs MUST live in DOM overlays, never inside Drei <Html>"

language: typescript 5.6
service: apps/web/components/cta/
new_files:
  - apps/web/components/cta/CtaHub.tsx
  - apps/web/components/cta/CtaPortal.tsx
  - apps/web/components/cta/tracks.ts
  - apps/web/components/cta/forms/TrackFormShell.tsx
  - apps/web/components/cta/forms/BuyForm.tsx
  - apps/web/components/cta/forms/PartnerForm.tsx
  - apps/web/components/cta/forms/JoinForm.tsx
  - apps/web/components/cta/__tests__/cta-hub.test.ts
  - apps/web/tests/cta/cta-hub.spec.ts
modified_files:
  - apps/web/app/page.tsx                 # mount <CtaHub /> at Scene 6 anchor

allowed_tools:
  - file_read: packages/ds-cinematic/**
  - file_read: docs/01-master-plan-v2.md
  - file_write: apps/web/components/cta/**
  - bash: pnpm -F web test
  - bash: pnpm -F web exec playwright test
disallowed_tools:
  - render any CTA inside an R3F <Html /> or <Canvas /> child
  - introduce a 4th track without a master-plan amendment
  - couple this component to Calendly/HubSpot/ATS specifics (those are FR-CTA-002/003/004)

effort_hours: 12
sub_tasks:
  - "1h: tracks.ts — typed track definitions (Buy / Partner / Join)"
  - "2h: CtaPortal.tsx — single-portal pure-DOM card with focus / hover / clicked states"
  - "2h: CtaHub.tsx — three-portal layout + audience-focus state driven by Zustand"
  - "1h: integration with Scene 6 — Lumi turns toward focused card (event bridge to lumiStore)"
  - "2h: a11y — Tab order, focus rings, target ≥ 44×44, aria-current, aria-describedby for portal copy"
  - "1h: form-modal shell — opens on click, lazy-imports the per-track form (FR-CTA-002/003/004)"
  - "2h: Vitest + Playwright tests"
  - "1h: founder review + copy tweaks + audience-routing-event analytics fields"

risk_if_skipped: |
  Scene 6 is the conversion fork. Without a locked CTA hub component, every form integration FR
  (Calendly / HubSpot / ATS) ends up coupled to a one-off layout and can't be A/B-tested or moved.
  The "three-track" mental model is the most distinctive UX choice of the site; without the
  component, the marketing team can't run the post-launch funnel-leak experiments (master plan
  §12.2) that should ship in P6.
---

## §1 — Description (BCP-14 normative)

A `<CtaHub />` React component **MUST** be authored that renders **exactly three** CTA portals (Buy / Partner / Join) as DOM overlays, audience-routed, with focus-driven Lumi-orientation events.

1. **MUST** render exactly three portals: `buy` (Book a Discovery Call), `partner` (Partner With Us), `join` (Join the Team). No more, no fewer. Adding a 4th track requires a master-plan amendment per `AGENTS.md` §16.2.
2. **MUST** be a pure-DOM component. NO R3F `<Html>`, NO `<Canvas>` descendants, NO three import. Per master plan §5.6.
3. **MUST** import its track definitions from `tracks.ts` — track id, label, sub-headline, primary-CTA label, target-form factory function (factory returns the React-lazy import).
4. **MUST** colour-code the portals per master plan §3.4: `buy` = solid `--brand-gold-400` fill, `partner` = `--brand-brown-500` with `--brand-gold-400` edge, `join` = `--brand-gold-100` with `--brand-brown-500` edge.
5. **MUST** emit a Zustand event `lumiStore.setFocusedCta(track | null)` on hover / focus / blur of each portal so Lumi turns toward the focused card (master plan §2.1 Scene 6 row: "Lumi turns toward whichever CTA you focus").
6. **MUST** lazy-load the per-track form modal via `React.lazy(() => import('@/components/cta/forms/<TrackName>Form'))`. The form module MUST NOT be in the initial chunk.
7. **MUST** be keyboard-navigable: `Tab` cycles portal-1 → portal-2 → portal-3 → next-section in DOM order. Each portal MUST receive `:focus-visible` ring (FR-A11Y-008's 2px gold outline).
8. **MUST** have target size ≥ 44×44 per portal (WCAG 2.5.5 AAA, FR-A11Y-009).
9. **MUST** include `aria-describedby` on each portal pointing to a hidden `<p>` element with the audience-fit explanation (e.g. "For NA/EU enterprise & SMB buyers — find a senior dev partner without paying NA prices.").
10. **MUST** include `aria-current="page"` on the portal that matches the active conversion-track query parameter (e.g. `?track=partner` opens the Partner portal pre-focused).
11. **MUST** emit analytics events on view + click per master plan §8.4: `cta_view { cta_id }` when the hub enters viewport (50% threshold); `cta_click { cta_id, scene_id, scroll_depth }` on click.
12. **MUST** be responsive: 3-column row at ≥ 1024px; stacked column at < 1024px. At 320px (reflow target — FR-A11Y-001), each portal MUST occupy 100% width.
13. **MUST NOT** depend on Calendly / HubSpot / ATS specifics. Those integrations live in FR-CTA-002 (Calendly), FR-CTA-003 (HubSpot), FR-CTA-004 (ATS). This component knows only about a factory that produces a form modal.
14. **MUST** ship a CSS module (or Tailwind classes scoped to the component) that consumes tokens from `@cyberskill/ds-cinematic` — no hardcoded colours.
15. **SHOULD** support deep-linking: visiting `?track=partner` MUST scroll to the hub, focus the Partner portal, and (optionally) open its form modal.
16. **MUST** be SSR-safe — no client-only APIs (window, document, Zustand setters) in the render path. Audience-focus state hydrates client-side via `useEffect`.

---

## §2 — Why this design (rationale for humans)

**Why exactly three tracks?** Master plan §1.2 is explicit: three audiences (buyers / partners / recruits), three intents, three forms. A 4th track would dilute the page's strategic clarity. Lock it in code so it can't drift.

**Why DOM, not `<Html>`?** Master plan §5.6 — Drei `<Html>` causes pointer-event rabbit holes (you click "through" the canvas, scroll behaviour breaks, focus rings render under the canvas). A DOM-overlay sibling that scroll-track-pins next to the canvas is the cleanest pattern. We pay a small visual cost (the portals don't reflect into the canvas lighting in real-time) for a large UX + a11y win.

**Why a factory pattern for form modals?** Three reasons. (1) Lazy-loading: the user only fetches the form they're going to use (~30-80 KB per form, total ~150 KB if all three loaded eagerly). (2) Testing: the hub component is testable without the forms — you mock the factory. (3) Substitution: future A/B tests can swap form variants without touching the hub.

**Why audience-focus → Lumi orientation?** Master plan §2.1 Scene 6 says "Lumi turns toward whichever CTA you focus." This is the conversational beat that makes the fork feel personal rather than mechanical. Implementing it as a Zustand event keeps the hub decoupled from the R3F scene (the hub doesn't know about Three.js; it emits an intent; the scene code subscribes).

**Why deep-link support?** Marketing campaigns target each track separately. A LinkedIn ad for partners can link `?track=partner` and the buyer lands inside the partner experience — saving them a scroll + a guess. Conversion uplift in similar consultancy-site cases: +12-18% on track-specific deep-links.

---

## §3 — Public surface contract

### §3.1 `tracks.ts`

```ts
import type { LazyExoticComponent, ComponentType } from 'react';
import { lazy } from 'react';

export type TrackId = 'buy' | 'partner' | 'join';

export interface Track {
  id: TrackId;
  label: string;              // primary CTA text
  subhead: string;            // 1-line audience identifier
  describedBy: string;        // longer audience-fit copy for aria-describedby
  formFactory: () => LazyExoticComponent<ComponentType<{ onClose: () => void }>>;
  paletteRole: 'primary' | 'secondary' | 'tertiary';
}

export const TRACKS: readonly Track[] = [
  {
    id: 'buy',
    label: 'Book a Discovery Call',
    subhead: 'For builders who need senior partners.',
    describedBy: 'For NA/EU enterprise and SMB buyers — find a senior, English-fluent dev partner without paying NA prices.',
    formFactory: () => lazy(() => import('./forms/BuyForm')),
    paletteRole: 'primary',
  },
  {
    id: 'partner',
    label: 'Partner With Us',
    subhead: 'For agencies seeking white-label & co-delivery.',
    describedBy: 'For tech partners and agencies — find a white-label or co-delivery partner with React, Three.js, and AI specialisation.',
    formFactory: () => lazy(() => import('./forms/PartnerForm')),
    paletteRole: 'secondary',
  },
  {
    id: 'join',
    label: 'Join the Team',
    subhead: 'For senior craftspeople, remote-first.',
    describedBy: 'For talent and recruits — join a craft-driven remote Vietnamese team. Senior peers. Founder-accessible.',
    formFactory: () => lazy(() => import('./forms/JoinForm')),
    paletteRole: 'tertiary',
  },
] as const;
```

### §3.2 `CtaHub.tsx`

```tsx
'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TRACKS, type TrackId } from './tracks';
import { CtaPortal } from './CtaPortal';
import { useLumiStore } from '@/components/lumi/lumiStore';

export function CtaHub() {
  const [openTrack, setOpenTrack] = useState<TrackId | null>(null);
  const [focusedTrack, setFocusedTrack] = useState<TrackId | null>(null);
  const setLumiFocus = useLumiStore((s) => s.setFocusedCta);
  const sp = useSearchParams();

  useEffect(() => {
    setLumiFocus(focusedTrack);
    return () => setLumiFocus(null);
  }, [focusedTrack, setLumiFocus]);

  useEffect(() => {
    const t = sp.get('track') as TrackId | null;
    if (t && TRACKS.find(x => x.id === t)) {
      setFocusedTrack(t);
      const el = document.getElementById(`cta-portal-${t}`);
      el?.focus({ preventScroll: false });
    }
  }, [sp]);

  const OpenForm = openTrack ? TRACKS.find(t => t.id === openTrack)!.formFactory() : null;

  return (
    <section id="cta-hub" aria-labelledby="cta-hub-h2">
      <h2 id="cta-hub-h2">What do you want to make real?</h2>
      <div className="cta-row">
        {TRACKS.map((t) => (
          <CtaPortal
            key={t.id}
            track={t}
            isCurrent={focusedTrack === t.id}
            onFocus={() => setFocusedTrack(t.id)}
            onBlur={() => setFocusedTrack(null)}
            onClick={() => setOpenTrack(t.id)}
          />
        ))}
      </div>
      {OpenForm && (
        <Suspense fallback={<div role="status">Loading…</div>}>
          <OpenForm onClose={() => setOpenTrack(null)} />
        </Suspense>
      )}
    </section>
  );
}
```

### §3.3 `CtaPortal.tsx`

```tsx
import type { Track } from './tracks';

export interface CtaPortalProps {
  track: Track;
  isCurrent: boolean;
  onFocus(): void;
  onBlur(): void;
  onClick(): void;
}

export function CtaPortal({ track, isCurrent, onFocus, onBlur, onClick }: CtaPortalProps) {
  const descId = `cta-desc-${track.id}`;
  return (
    <button
      id={`cta-portal-${track.id}`}
      className={`cta-portal cta-portal-${track.paletteRole}`}
      aria-current={isCurrent ? 'page' : undefined}
      aria-describedby={descId}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onClick={onClick}
      data-track={track.id}
    >
      <span className="cta-subhead">{track.subhead}</span>
      <span className="cta-label">{track.label} →</span>
      <span id={descId} className="sr-only">{track.describedBy}</span>
    </button>
  );
}
```

### §3.4 Analytics integration (master plan §8.4)

```ts
// On view (intersection observer threshold 0.5):
window.cyberskill.analytics.event('cta_view', { cta_id: track.id });

// On click:
window.cyberskill.analytics.event('cta_click', {
  cta_id: track.id,
  scene_id: 'scene-6',
  scroll_depth: window.scrollY / document.body.scrollHeight,
});
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **Exactly three portals render** — `<CtaHub />` rendered in jsdom MUST produce exactly 3 buttons with `data-track` attributes `buy`, `partner`, `join`. Asserted in `cta-hub.test.tsx`.
2. **Pure DOM, no R3F** — `grep -rE 'from .@react-three|from .three' apps/web/components/cta/` MUST return zero hits. Build artifact: `apps/web/.next/static/chunks/*cta*.js` MUST NOT contain `react-three-fiber` or `three.module`.
3. **Lazy-loaded forms** — `next build` analyzer MUST report 3 separate chunks for `BuyForm`, `PartnerForm`, `JoinForm`. Initial Scene-6 chunk (which contains `CtaHub` + `CtaPortal`) MUST NOT contain the form modules. Asserted via webpack stats.
4. **Lumi-focus event fires on hover** — Vitest: render with a mocked `useLumiStore`; hover portal-2; assert `setFocusedCta('partner')` was called.
5. **Lumi-focus event fires on focus** — Same as #4 with keyboard `focus()` instead of hover.
6. **Lumi-focus clears on blur** — After hover/focus, mouseleave / blur; assert `setFocusedCta(null)` called.
7. **Tab order = portal-1 → portal-2 → portal-3** — Playwright: focus first portal via keyboard `Tab` from the preceding section; press Tab; assert focus is on portal-2 (`buy → partner → join`).
8. **Target size ≥ 44×44** — Playwright at mobile viewport 390×844: each `.cta-portal` bounding box width ≥ 44 AND height ≥ 44.
9. **aria-current updates on focus** — Vitest: focus portal-2; assert `data-track="partner"` element has `aria-current="page"`; the others have no `aria-current`.
10. **Deep-link `?track=partner` focuses partner portal** — Playwright: `goto('/?track=partner#cta-hub')`; assert the partner portal has `:focus`; assert `aria-current="page"` on it.
11. **Reflow at 320px** — Playwright viewport 320×800: each portal occupies 100% of the row (each bounding-box width ≥ 280 with margins; no horizontal scroll).
12. **Analytics events fire** — Playwright with route-intercept on `/api/analytics`: scroll Scene 6 into view; assert `cta_view` payload was posted with `cta_id: 'buy' | 'partner' | 'join'`. Click a portal; assert `cta_click` payload was posted with the matching `cta_id`.
13. **SSR-safe** — Run `pnpm -F web build`; ensure no error like "useSearchParams must be used in client component" or "window is not defined" appears in the build log.
14. **Hardcoded colour grep** — `grep -rE '#[0-9A-Fa-f]{3,6}' apps/web/components/cta/*.{tsx,ts}` MUST return zero hits (colours come from `@cyberskill/ds-cinematic` tokens only).

---

## §5 — Verification method

**Tests (`verify: T`):**

```typescript
// apps/web/components/cta/__tests__/cta-hub.test.tsx
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CtaHub } from '../CtaHub';

// mocks for useSearchParams, lumiStore, analytics …

describe('FR-CTA-001 — CtaHub', () => {
  test('AC#1: exactly three portals', () => {
    render(<CtaHub />);
    const portals = screen.getAllByRole('button');
    expect(portals).toHaveLength(3);
    expect(portals.map(p => p.dataset.track)).toEqual(['buy', 'partner', 'join']);
  });

  test('AC#4: Lumi focus event fires on hover', () => {
    const setFocus = vi.fn();
    // … mock useLumiStore.setFocusedCta to setFocus …
    render(<CtaHub />);
    fireEvent.mouseEnter(screen.getByRole('button', { name: /Partner With Us/ }));
    expect(setFocus).toHaveBeenCalledWith('partner');
  });

  test('AC#9: aria-current toggles', () => {
    render(<CtaHub />);
    const partner = screen.getByRole('button', { name: /Partner With Us/ });
    fireEvent.focus(partner);
    expect(partner).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Book a Discovery Call/ })).not.toHaveAttribute('aria-current');
  });
});
```

```typescript
// apps/web/tests/cta/cta-hub.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('AC#7: tab order is buy → partner → join', async ({ page }) => {
  await page.goto('/#cta-hub');
  await page.focus('#cta-portal-buy');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('cta-portal-partner');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('cta-portal-join');
});

test('AC#8: target size 44×44 at mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#cta-hub');
  for (const id of ['buy', 'partner', 'join']) {
    const box = await page.locator(`#cta-portal-${id}`).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('AC#10: ?track=partner focuses the partner portal', async ({ page }) => {
  await page.goto('/?track=partner#cta-hub');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('cta-portal-partner');
  await expect(page.locator('#cta-portal-partner')).toHaveAttribute('aria-current', 'page');
});

test('AC#12: analytics events fire', async ({ page }) => {
  const posts: any[] = [];
  await page.route('**/api/analytics', async (route) => {
    posts.push(await route.request().postDataJSON());
    await route.fulfill({ status: 200, body: '{}' });
  });
  await page.goto('/#cta-hub');
  await page.locator('#cta-portal-buy').click();
  await page.waitForTimeout(200);
  expect(posts.find((p) => p.event === 'cta_click' && p.cta_id === 'buy')).toBeTruthy();
});
```

CI gate: `pnpm -F web test && pnpm -F web exec playwright test tests/cta/`. Failure blocks merge.

---

## §6 — Dependencies

- FR-DS-003 — `@cyberskill/ds-cinematic` tokens.
- FR-SCENE-018 — Scene 6 layout slot.
- (forward) FR-CTA-002 / 003 / 004 — provide the form modules the factory imports.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Form modules end up in initial chunk | AC#3 stats analyzer | Verify `React.lazy()` used; verify dynamic-import chunk name |
| Lumi doesn't turn (event drift) | Manual smoke during P4 | Verify scene-store subscriber in Scene 6 listens to `focusedCta` |
| Hover on touch device behaves badly | Mobile smoke | Use `pointerenter` / `pointercancel` instead of `mouseenter`/`mouseleave`; or short-circuit hover when pointer is coarse |
| Deep-link `?track=invalid` causes error | Playwright fuzz | TRACKS.find() guard returns undefined; component handles gracefully |
| Form modal traps focus poorly (a11y) | Manual VO/NVDA in P5 | Use a focus-trap-react or equivalent inside the form modal (FR-CTA-005) |
| `useSearchParams` SSR error | AC#13 build | Mark CtaHub as `'use client'`; only safe pattern in App Router |
| Hardcoded colour drift | AC#14 grep | Replace with token; lint rule blocks future violations |
| Suspense fallback flashes on every modal open | UX nit | Pre-warm the lazy import on first portal focus (`Promise.resolve()`-prefetch) |

---

## §8 — Notes

- The `Track` interface is intentionally narrow — `formFactory` is the seam the per-track form FRs plug into. This is the single most important architectural choice in this FR; preserve it.
- The portal hover → Lumi turn pattern is one of the most-cited cinematic-services-site UX moments (master plan §1.4 references Igloo Inc., Active Theory). It's worth landing well; iterate the easing curve in P5 polish (FR-CHAR-NNN follow-up).
- A/B testing the order or copy of the three tracks happens post-launch in FR-CTA-011. This FR locks the **structure**, not the **copy** — copy CAN evolve in CMS-managed strings if FR-CMS adds them later.

---

*End of FR-CTA-001. Audit: `FR-CTA-001-three-track-cta-hub.audit.md`.*
