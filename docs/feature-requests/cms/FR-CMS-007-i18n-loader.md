---
id: FR-CMS-007
title: "i18n/{en,vi}.json content store + language switcher — Next 15 locale-aware routing with localStorage persistence"
module: CMS
priority: MUST
status: shipped
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: Frontend Lead + Content/Marketing
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-CMS-003, FR-CMS-004, FR-CMS-006, FR-CMS-008, FR-A11Y-001, FR-A11Y-005]
depends_on: [FR-CMS-003]
blocks: [FR-CMS-008]
language: typescript 5.6 + next 15 + next-intl
service: apps/web/lib/i18n/ + apps/web/components/header/ + content/narrative/
new_files:
  - apps/web/lib/i18n.ts
  - apps/web/lib/i18n/messages-loader.ts
  - apps/web/middleware.ts  (locale detection)
  - apps/web/components/header/LanguageSwitcher.tsx
  - apps/web/components/header/__tests__/LanguageSwitcher.unit.test.tsx
  - content/narrative/lines/en.json
  - content/narrative/lines/vi.json

source_pages:
  - docs/01-master-plan-v2.md §2.2 — "Localization hooks: en/vi switcher with localStorage"
  - docs/01-master-plan-v2.md §5.3 — "Narrative line lifecycle: active/retired"
  - FR-CMS-003 Vietnamese variant rules
  - next-intl + next 15 App Router routing docs

effort_hours: 6
risk_if_skipped: "Without locale switching, Vietnamese visitors see English-only site. 90% of CyberSkill's audience is Vietnamese; this is a launch blocker. Also blocks FR-CMS-008 hreflang (which only matters when multiple locales exist)."
---

## §1 — Description (BCP-14 normative)

1. **MUST** load `content/narrative/lines/{en,vi}.json` based on the active Next.js locale.

2. **MUST** support two locales:
   - `en` (English) — default, accessible at `/...`
   - `vi` (Vietnamese) — accessible at `/vi/...`

3. **MUST** ship a header `<LanguageSwitcher>` component that:
   - Displays current language ("EN" or "VI") + dropdown to switch.
   - On switch: navigates to corresponding locale-prefixed URL (e.g., `/work/x` → `/vi/work/x`).
   - Persists choice in `localStorage.cyberskill_locale`.

4. **MUST** detect initial locale via Next.js middleware in priority order:
   - URL prefix (`/vi/...` → vi; else `en`).
   - `localStorage.cyberskill_locale` (if previously set; consulted only on root URL).
   - `Accept-Language` HTTP header — first matching locale.
   - Default to `en`.

5. **MUST** persist locale in `localStorage.cyberskill_locale`:
   - `'en'` or `'vi'`.
   - Read on first visit; if mismatch with URL, do NOT auto-redirect (URL wins). Persisted value just informs the LanguageSwitcher's "current" state.

6. **MUST** filter retired narrative lines (`role: retired`) at load time per FR-CMS-003 lifecycle:
   ```ts
   const lines = (await loadLines(locale)).filter(l => l.role !== "retired");
   ```

7. **MUST** localize all UI strings via next-intl `useTranslations()` hook:
   - `apps/web/messages/en.json` for UI strings.
   - `apps/web/messages/vi.json` for Vietnamese.
   - Narration content stays separate (`content/narrative/lines/{en,vi}.json`) due to lifecycle differences.

8. **MUST** support the Vietnamese tagline-on-hover feature (FR-CMS-010 scope, surfaces here): the Vietnamese tagline appears as tooltip on the EN tagline hover, even on English locale, as a culturally-anchored brand beat.

9. **MUST** include locale field on every CMS document (FR-CMS-004 `i18n_locale`); queries filter by it.

10. **MUST** be SSR-safe — server-renders the correct locale based on URL prefix. localStorage read happens client-side post-hydration; no hydration mismatch.

11. **MUST** include `<html lang="en">` or `<html lang="vi">` per active locale (FR-A11Y-001 a11y dependency).

12. **MUST** be ≥ 44×44 px touch target (LanguageSwitcher button) per WCAG SC 2.5.8.

13. **MUST** support keyboard activation (Tab + Enter / Space).

14. **MUST** ship axe-clean (FR-OPS-012).

15. **MUST NOT** trigger full page reload on locale switch — Next.js App Router router.push() handles transition.

16. **MUST** fire analytics event `locale_switched` with `{from, to, source: 'switcher'|'middleware'}`.

17. **SHOULD** preserve URL path on switch (`/work/museum-exhibit` → `/vi/work/museum-exhibit`). If destination doesn't exist for target locale, fall back to `/` of that locale.

## §2 — Why this design

**Why URL-prefixed routing (not subdomain or query param)?** Three reasons:
1. **SEO** — Google ranks `/vi/...` as distinct content from `/...`. Subdomain works too but adds DNS complexity; query param is worst (Google treats as duplicates).
2. **Sharing** — sharing `/vi/work/x` clearly signals Vietnamese version.
3. **Hreflang** — Standard `<link rel="alternate" hreflang="vi" href="/vi/...">` works cleanly with path-based routing.

**Why localStorage persistence (despite URL being source of truth)?** Returning visitor experience: first visit, Vietnamese; second visit, expects Vietnamese without re-clicking. localStorage informs the switcher's "current state" assumption.

**Why NOT auto-redirect on URL mismatch?** URL is intentional — user shared the link, search engine indexed it. Auto-redirect would break sharing. We respect URL.

**Why Accept-Language fallback?** New visitor from Vietnamese browser with no localStorage and on root URL: best guess = Vietnamese. Accept-Language is the cheapest signal.

**Why retired lines filtered at load (vs render)?** Single filter point; consumers don't need to know about lifecycle. Editor retires a line in Sanity / JSON; one place to enforce.

**Why narration content separate from UI strings?** Different lifecycles. UI strings rarely change (compile-time). Narration content changes weekly (master plan §5.3 line lifecycle). Separation avoids invalidating UI string caches on narration edits.

**Why Vietnamese tagline tooltip on EN?** Cultural anchor — even English-locale visitors see the Vietnamese phrase ("Biến ý chí thành hiện thực" — "Turn your will into real"). Subtle Vietnamese identity surfaced. Not surface-level translation; cultural branding.

**Why SSR-safe?** Hydration mismatch warning is bad UX + console noise. Server renders correct locale from URL; client just hydrates without re-rendering.

**Why analytics on switch?** Hypothesis testing — what % of visitors switch from auto-detected to manual? If high, Accept-Language detection is wrong. If low, current detection is fine.

## §3 — Public surface

```ts
// apps/web/middleware.ts (next-intl middleware)
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localePrefix: "as-needed",  // /work/x for en, /vi/work/x for vi
  localeDetection: true,  // honors Accept-Language for fresh visitors
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

```ts
// apps/web/lib/i18n.ts (next-intl config)
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? "en";
  const messages = (await import(`./messages/${locale}.json`)).default;
  return { locale, messages };
});
```

```ts
// apps/web/lib/i18n/messages-loader.ts
import enLines from "@/content/narrative/lines/en.json";
import viLines from "@/content/narrative/lines/vi.json";

interface NarrativeLine {
  id: string;
  role: "active" | "retired" | "draft";
  scene: string;
  text: string;
}

export function loadNarrativeLines(locale: "en" | "vi"): NarrativeLine[] {
  const all = locale === "vi" ? viLines : enLines;
  return all.filter(l => l.role !== "retired");
}
```

```tsx
// apps/web/components/header/LanguageSwitcher.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function LanguageSwitcher() {
  const t = useTranslations("a11y");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as "en" | "vi";
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("cyberskill_locale", locale);
    }
  }, [locale]);

  function handleSwitch(target: "en" | "vi") {
    if (target === locale) {
      setOpen(false);
      return;
    }

    // Compute target path
    let nextPath: string;
    if (locale === "en") {
      nextPath = target === "vi" ? `/vi${pathname}` : pathname;
    } else {
      // locale === "vi"; strip /vi prefix
      nextPath = pathname.replace(/^\/vi/, "") || "/";
      if (target === "vi") nextPath = pathname;  // no-op safety
    }

    trackEvent("locale_switched", { from: locale, to: target, source: "switcher" });
    router.push(nextPath);
    setOpen(false);
  }

  return (
    <div className="lang-switcher">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("language_switcher_aria_label")}
        className="lang-switcher-trigger"
      >
        {locale.toUpperCase()}
      </button>
      {open && (
        <ul role="listbox" aria-label="Language">
          <li role="option" aria-selected={locale === "en"}>
            <button onClick={() => handleSwitch("en")}>EN — English</button>
          </li>
          <li role="option" aria-selected={locale === "vi"}>
            <button onClick={() => handleSwitch("vi")}>VI — Tiếng Việt</button>
          </li>
        </ul>
      )}
    </div>
  );
}
```

```ts
// apps/web/messages/en.json (UI strings sample)
{
  "a11y": {
    "skip_label": "Skip story",
    "skip_aria_label": "Skip to call to action",
    "mute_aria_label": "Mute audio",
    "unmute_aria_label": "Unmute audio",
    "language_switcher_aria_label": "Change language",
    "skip_3d_label": "Skip 3D",
    "skip_3d_aria_label": "Switch to lite mode without 3D"
  },
  "cta": {
    "timezone": {
      "you": "You",
      "at_desks": "We're at desks 🟢",
      "off_hours": "We're off-hours 🌙",
      "great_overlap": "Great overlap — {hours}h afternoon for you ✅",
      "small_overlap": "Small overlap — {hours}h late afternoon ⚠️",
      "no_overlap": "No direct working overlap. We do early mornings + late evenings for international calls.",
      "full_overlap": "Full overlap — same timezone ✅",
      "schedule_with_us": "Schedule with me →"
    }
  }
}
```

```ts
// apps/web/messages/vi.json (Vietnamese)
{
  "a11y": {
    "skip_label": "Bỏ qua câu chuyện",
    "skip_aria_label": "Đi tới phần liên hệ",
    "mute_aria_label": "Tắt âm thanh",
    "unmute_aria_label": "Bật âm thanh",
    "language_switcher_aria_label": "Đổi ngôn ngữ",
    "skip_3d_label": "Bỏ qua 3D",
    "skip_3d_aria_label": "Chuyển sang chế độ nhẹ (không 3D)"
  },
  "cta": {
    "timezone": {
      "you": "Bạn",
      "at_desks": "Chúng tôi đang ở bàn 🟢",
      "off_hours": "Ngoài giờ làm việc 🌙",
      "great_overlap": "Trùng giờ tốt — {hours} giờ chiều của bạn ✅",
      ...
    }
  }
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Middleware detects locale via URL prefix | Visit /vi/work/x → locale=vi |
| 2 | Middleware fallback to Accept-Language | Visit / with Accept-Language: vi → redirect to /vi |
| 3 | Locale switch updates rendered narration text | Vitest: setLocale, assert text changes |
| 4 | localStorage persists `cyberskill_locale` | Switch, reload, assert localStorage value |
| 5 | Retired lines never render | Add `role: 'retired'` line; assert filtered out |
| 6 | `<html lang="en"\|"vi">` matches locale | curl /; curl /vi |
| 7 | Min 44×44 LanguageSwitcher button | boundingBox check |
| 8 | Keyboard Enter/Space switch | Playwright keyboard |
| 9 | Analytics event fires on switch | Mock trackEvent; assert |
| 10 | URL path preserved on switch | /work/x → /vi/work/x (not /vi) |
| 11 | SSR-safe (no hydration mismatch warnings) | DevTools console clean |
| 12 | axe-clean | AxeBuilder |
| 13 | Vitest unit tests pass | `pnpm vitest run apps/web/components/header/__tests__/LanguageSwitcher.unit.test.tsx` |
| 14 | Locale switch is shallow (no full reload) | Performance API; no full reload triggers |
| 15 | Vietnamese tagline tooltip surfaces on EN | FR-CMS-010 integration check |

## §5 — Verification

```tsx
// apps/web/components/header/__tests__/LanguageSwitcher.unit.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { LanguageSwitcher } from "../LanguageSwitcher";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/work/x",
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => { localStorage.clear(); mockPush.mockClear(); });

  it("shows current language (EN)", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("EN")).toBeTruthy();
  });

  it("opens dropdown on click", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("switches to /vi/work/x when VI selected from /work/x", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText(/Tiếng Việt/));
    expect(mockPush).toHaveBeenCalledWith("/vi/work/x");
  });

  it("persists locale to localStorage", () => {
    render(<LanguageSwitcher />);
    expect(localStorage.getItem("cyberskill_locale")).toBe("en");
  });

  it("fires analytics event on switch", () => {
    const trackMock = vi.fn();
    vi.doMock("@/lib/analytics", () => ({ trackEvent: trackMock }));
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText(/Tiếng Việt/));
    expect(trackMock).toHaveBeenCalledWith("locale_switched", expect.objectContaining({ from: "en", to: "vi" }));
  });

  it("aria-expanded reflects open state", () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("loadNarrativeLines", () => {
  it("filters retired lines", () => {
    const { loadNarrativeLines } = require("@/lib/i18n/messages-loader");
    // mock JSON
    const result = loadNarrativeLines("en");
    expect(result.every((l: any) => l.role !== "retired")).toBe(true);
  });
});
```

## §6 — Dependencies

**Concept:** FR-CMS-003 (Vietnamese variant content + lifecycle rules), FR-CMS-004 (i18n_locale schema field), FR-CMS-006 (locale-aware case-study routing), FR-A11Y-005 (Skip 3D toggle parallel header control), FR-CMS-008 (hreflang).

**Operational:** next-intl ^3, Next.js 15 middleware, FR-A11Y-001 design system tokens.

**Downstream:** FR-CMS-008 (hreflang tags consume locale info), FR-CMS-010 (Vietnamese tagline hover).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Hydration mismatch (SSR locale != client locale) | Console warn | URL is source of truth; client doesn't override during hydration |
| localStorage write fails | Set throws | Catch + in-memory fallback |
| Locale switch breaks scroll state | UX | Preserve scroll on shallow push |
| /vi/foo doesn't exist for target locale | 404 | Fall back to /vi root; preserve search params |
| Accept-Language detection wrong (user expects EN, browser=VI) | UX confusion | URL wins; switcher always present |
| Vietnamese characters break URLs | Slug encoding | ASCII slugs only (see FR-CMS-006 §9) |
| RTL languages (future) break layout | N/A slice 1 | Document constraint; revisit if Arabic etc. added |
| next-intl version bump breaks middleware | Build fail | Pin version; CI test |
| Translation key missing | Console warn | next-intl shows key fallback; CI grep for missing |
| Vietnamese tagline missing fallback | UX | Default to English tagline if vi.json missing key |
| `<html lang>` not updated on client switch | Visual | Updated via Next.js layout server-render |
| Middleware excessive cookies | Performance | localePrefix: "as-needed" minimizes overhead |
| Locale persistence across user-sessions (privacy concern) | localStorage scope | Per-origin; not cross-site |
| URL rewriting breaks API routes | matcher pattern | Exclude /api in middleware matcher |
| Browser back button + locale interaction | History stack | router.push pushes to history; back navigates correctly |

## §8 — Deliverable preview

User flow (Vietnamese visitor):
1. New Vietnamese visitor hits `cyberskill.world/`. Accept-Language: vi.
2. Middleware detects vi; redirects to `/vi/`.
3. Page renders in Vietnamese (UI strings + narration).
4. Header shows "VI" on switcher.
5. User clicks switcher → dropdown shows EN + Tiếng Việt.
6. localStorage `cyberskill_locale: 'vi'` set.

User flow (English visitor sharing Vietnamese link):
1. Visitor receives link `cyberskill.world/vi/work/x`.
2. Clicks. Page renders in Vietnamese.
3. localStorage `cyberskill_locale: 'vi'` set (despite English browser).
4. User clicks switcher → "EN". Navigates to `/work/x`. localStorage updated to 'en'.

User flow (returning Vietnamese visitor on root):
1. Visit `cyberskill.world/`.
2. Middleware reads URL (no /vi prefix). Page renders in English (URL wins over localStorage).
3. Switcher shows "EN" current (matches URL).
4. User clicks "VI" → navigates to `/vi/`.

## §9 — Notes

**On URL prefix vs Subdomain (`vi.cyberskill.world`):** Subdomain requires DNS setup + CORS adjustments + cookie scope handling. Path prefix is simpler. Trade-off: subdomain feels more "official"; path prefix is industry-standard (Stripe, Vercel, etc. use it).

**On future locales:** Currently EN + VI. Adding JA / KO is straightforward: new messages JSON + add to `locales` array. RTL languages (Arabic) require CSS effort.

**On URL canonicalization:** `/work/x` vs `/en/work/x` both should resolve to English. We use `as-needed` prefix mode — `/en/...` paths redirect to `/...` (canonical). Avoids duplicate-content SEO penalty.

**On Vietnamese typography:** Vietnamese uses Latin characters + diacritics. Font must support: Inter, Source Sans, system-ui all OK. Verify visual smoke with `Tiếng Việt rất đẹp`.

**On audio narration localization:** Future: per-locale audio files (FR-AUDIO-001). VN audio recorded by founder. Slice 3.

**On future content translation workflow:** Currently manual (founder reviews Vietnamese). Could integrate translation services (DeepL, Phrase) for less-critical strings. Slice 3.

**On accessibility for bilingual users:** Some users have screen readers in different language than UI. Page lang attribute is authoritative for AT; individual elements can override via lang attribute (FR-A11Y-002 SceneShadowMirror supports).

*End of FR-CMS-007.*
