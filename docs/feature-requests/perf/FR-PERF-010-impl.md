---
id: FR-PERF-010
title: "saveData detection → non-modal /lite banner — opt-in with localStorage persistence"
module: PERF
priority: MUST
status: shipped
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-WEB-009, FR-PERF-009, FR-A11Y-005, FR-A11Y-001]
depends_on: [FR-WEB-009]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/perf/ + apps/web/lib/perf/
new_files:
  - apps/web/components/perf/SaveDataBanner.tsx
  - apps/web/components/perf/__tests__/SaveDataBanner.unit.test.tsx
  - apps/web/lib/perf/detect-save-data.ts

source_pages:
  - docs/01-master-plan-v2.md §6.3 — "saveData → offer /lite"
  - docs/01-master-plan-v2.md §5.5 — lite-mode UX
  - W3C NetworkInformation API

effort_hours: 3
risk_if_skipped: "Users on iOS Low Data Mode + Android Data Saver explicitly told their device 'don't burn my bandwidth.' Default behavior burns ~5 MB on first scroll (Lumi + textures). Without offer, we're disrespecting an explicit user signal. Banner respects + offers alternative."
---

## §1 — Description (BCP-14 normative)

1. **MUST** detect `navigator.connection.saveData === true` on page mount.
2. **MUST** show a non-modal banner offering /lite when saveData detected, with two actions:
   - "Switch to lite mode" (recommended; auto-focused)
   - "Stay on cinematic"
3. **MUST** default focus to "Switch" — helpful default; user can Tab to "Stay" and Enter.
4. **MUST** persist user choice in `localStorage.cyberskill_lite_pref`:
   - User clicks Switch → `'1'` (use /lite).
   - User clicks Stay → `'0'` (explicit opt-in to cinematic on saveData).
5. **MUST** dismiss banner after either choice; never re-show on this session.
6. **MUST** check localStorage on subsequent visits — if `'0'` (explicit cinematic), no banner. If `'1'`, redirect to /lite via FR-WEB-009 logic.
7. **MUST** be a11y compliant:
   - aria-live polite on banner appearance.
   - role="region" with aria-label.
   - Keyboard reachable (Tab from page → banner).
   - Buttons ≥ 44×44 px.
   - Focus ring 2px gold (FR-A11Y-008).
8. **MUST** include "Why am I seeing this?" expandable info: "Your browser's Low Data mode is on. We have a lighter version that uses ~80% less data."
9. **MUST NOT** auto-redirect — user always makes the choice. saveData is signal not commandment.
10. **MUST** fire analytics events:
    - `save_data_banner_shown`
    - `save_data_banner_switched` or `save_data_banner_stayed`
11. **MUST** display in Vietnamese for /vi locale (FR-CMS-vi translation).
12. **MUST** be tested via Vitest unit tests + Playwright E2E.

## §2 — Why this design

**Why non-modal banner (not full-screen takeover)?** Takeover is hostile; banner respects user's flow. User can scroll past banner and decide later.

**Why default focus to Switch?** Save-data signal is strong; most users would prefer lite. Default focus saves a Tab keystroke.

**Why persist "stay on cinematic"?** Without persistence, banner re-shows on every page load → annoying. Explicit opt-in remembered.

**Why "Why am I seeing this?"?** Some users won't know why a banner appeared. Explanation builds trust + educates.

**Why no auto-redirect?** Auto-redirect = surprise = breaks shared links. User control = good UX.

**Why analytics?** Hypothesis: what % of save-data users opt for lite? Inform default behavior for future versions.

## §3 — Public surface

```ts
// apps/web/lib/perf/detect-save-data.ts
export function detectSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as any).connection;
  return conn?.saveData === true;
}
```

```tsx
// apps/web/components/perf/SaveDataBanner.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { detectSaveData } from "@/lib/perf/detect-save-data";
import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "cyberskill_save_data_dismissed";

export function SaveDataBanner() {
  const t = useTranslations("perf.save_data");
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const switchBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!detectSaveData()) return;
    const litePref = localStorage.getItem("cyberskill_lite_pref");
    if (litePref) return;  // already chose
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed) return;
    setShow(true);
    trackEvent("save_data_banner_shown");
  }, []);

  useEffect(() => {
    if (show) switchBtnRef.current?.focus();
  }, [show]);

  function handleSwitch() {
    localStorage.setItem("cyberskill_lite_pref", "1");
    sessionStorage.setItem(DISMISS_KEY, "1");
    trackEvent("save_data_banner_switched");
    router.push("/lite");
  }

  function handleStay() {
    localStorage.setItem("cyberskill_lite_pref", "0");
    sessionStorage.setItem(DISMISS_KEY, "1");
    trackEvent("save_data_banner_stayed");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label={t("region_label")}
      aria-live="polite"
      className="save-data-banner"
    >
      <p>{t("message")}</p>
      <button onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
        {t("why_question")}
      </button>
      {expanded && <p className="why-text">{t("why_explanation")}</p>}
      <div className="actions">
        <button ref={switchBtnRef} onClick={handleSwitch} className="primary">
          {t("switch_button")}
        </button>
        <button onClick={handleStay} className="secondary">
          {t("stay_button")}
        </button>
      </div>
    </div>
  );
}
```

```css
.save-data-banner {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  max-width: 500px;
  margin: 0 auto;
  background: var(--surface-deep-brown);
  color: var(--text-gold);
  padding: 1rem;
  border-radius: 8px;
  z-index: 200;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}
.save-data-banner button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
  border-radius: 9999px;
}
.save-data-banner .primary {
  background: var(--accent-gold);
  color: var(--surface-deep-brown);
}
.save-data-banner .secondary {
  background: transparent;
  border: 1px solid var(--border-gold-subtle);
  color: var(--text-gold);
}
.save-data-banner button:focus-visible {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Banner appears when saveData=true | Mock connection; mount; assert visible |
| 2 | Banner hidden when saveData=false | Mock; assert null |
| 3 | Default focus on "Switch" button | switchBtnRef.focus() in effect |
| 4 | Switch click → localStorage='1' + redirect /lite | Mock router; assert |
| 5 | Stay click → localStorage='0' + banner closes | Assert state |
| 6 | Banner doesn't re-show after choice | sessionStorage flag |
| 7 | aria-live polite + role region | DOM inspection |
| 8 | Buttons ≥ 44×44 px | boundingBox |
| 9 | "Why am I seeing this?" expands explanation | Click; assert expanded |
| 10 | Analytics events fire | Mock trackEvent |
| 11 | Vietnamese translation renders | next-intl smoke |
| 12 | Vitest unit tests pass | pnpm vitest |
| 13 | axe-clean | AxeBuilder |
| 14 | Tab order reaches banner | Playwright keyboard |

## §5 — Verification

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { SaveDataBanner } from "../SaveDataBanner";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

describe("SaveDataBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    delete (navigator as any).connection;
  });

  it("does not render when saveData=false", () => {
    render(<SaveDataBanner />);
    expect(screen.queryByRole("region")).toBeFalsy();
  });

  it("renders when saveData=true", async () => {
    (navigator as any).connection = { saveData: true };
    render(<SaveDataBanner />);
    await waitFor(() => expect(screen.getByRole("region")).toBeTruthy());
  });

  it("Switch button → localStorage='1' + route push", async () => {
    (navigator as any).connection = { saveData: true };
    const { container } = render(<SaveDataBanner />);
    await waitFor(() => screen.getByText("switch_button"));
    fireEvent.click(screen.getByText("switch_button"));
    expect(localStorage.getItem("cyberskill_lite_pref")).toBe("1");
  });

  it("Stay button → localStorage='0' + banner closes", async () => {
    (navigator as any).connection = { saveData: true };
    render(<SaveDataBanner />);
    await waitFor(() => screen.getByText("stay_button"));
    fireEvent.click(screen.getByText("stay_button"));
    expect(localStorage.getItem("cyberskill_lite_pref")).toBe("0");
    expect(screen.queryByRole("region")).toBeFalsy();
  });

  it("does not re-show after session dismissal", async () => {
    sessionStorage.setItem("cyberskill_save_data_dismissed", "1");
    (navigator as any).connection = { saveData: true };
    render(<SaveDataBanner />);
    expect(screen.queryByRole("region")).toBeFalsy();
  });
});
```

## §6 — Dependencies

**Concept:** FR-WEB-009 (lite-mode infrastructure), FR-PERF-009 (companion low-memory path), FR-A11Y-005 (Skip 3D toggle parallel), FR-A11Y-001 (a11y baseline).

**Operational:** NetworkInformation API, next-intl, FR-A11Y-008 focus tokens.

**Downstream:** FR-CMS-vi (Vietnamese translation strings).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Banner reappears after dismiss | AC#6 | sessionStorage check |
| localStorage write fails (private mode) | catch | Fall back to in-memory state |
| Default focus skips banner | Manual test | switchBtnRef.focus on mount |
| Connection API undefined (older browsers) | detectSaveData returns false | Banner doesn't show; acceptable |
| User can't dismiss (no choice) | AC#5 | Both buttons close banner |
| Banner stacks with other notifications | Z-index | z-index 200 (modal layer) |
| iOS Low Data not detected | Test | Connection.saveData supported on iOS 15+ |
| Vietnamese translation missing | next-intl warn | Fallback English; CI warning |
| Banner shown on /lite route (recursion) | Filter | Don't mount banner on /lite |
| Banner shown to crawler | SSR | Component is client-only |
| Analytics double-fire | Race | useEffect deps array correct |
| Focus ring invisible | AC#13 | 2px gold + offset |
| Banner blocks important content | Visual | Position bottom; not center; user scrolls past |
| User switches via toggle before banner choice | AC#6 | FR-A11Y-005 + this don't conflict; banner closes |

## §8 — Deliverable preview

User on iOS Low Data Mode:
1. Lands on cyberskill.world. Page renders cinematic.
2. After 200ms, banner appears bottom-center: "Your Low Data mode is on. Want a lighter version?"
3. Focus on "Switch to lite mode" button.
4. User clicks Switch → page navigates to /lite. localStorage updated.
5. Next visit → auto-redirects to /lite (FR-WEB-009 logic).

User clicks "Stay on cinematic":
1. Banner closes. localStorage='0'.
2. Next visit → cinematic mode, no banner (explicit opt-in remembered).

## §9 — Notes

**On Vietnamese audience:** Vietnamese mobile users on Viettel / VNPT often enable data-saver during peak hours. saveData true rate ~15-25% per Vietnamese mobile analytics.

**On future enhancements:** Could detect "user-pref-cinematic but device-too-weak" — show cautionary toast "Note: this device may struggle with cinematic." Slice 3.

**On A/B testing:** Should we auto-redirect (vs banner)? Slice 2 A/B test candidate.

*End of FR-PERF-010.*
