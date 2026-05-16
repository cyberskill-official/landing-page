---
id: FR-SCENE-019
title: "Footer + persistent Lumi corner — `wave_goodbye` clip + corner avatar + trust signals + language switcher"
module: SCENE
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: R3F Architect + Frontend Lead
created: 2026-05-16
related_frs: [FR-SCENE-008, FR-SCENE-018, FR-SCENE-020, FR-CHAR-011, FR-CMS-002, FR-SEO-001, FR-CMS-008]
depends_on: [FR-SCENE-018, FR-SCENE-008, FR-CHAR-011, FR-SEO-001]
blocks: [FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Footer — "Closure — Lumi waves goodbye, curls to corner"
  - docs/01-master-plan-v2.md §3.3a `wave_goodbye` — 2.0s no-loop
  - docs/01-master-plan-v2.md §3.3b — "Nón lá stays on through the footer"
  - docs/01-master-plan-v2.md §3.4 Footer — warm brown-400 fade
  - docs/01-master-plan-v2.md §9.2 — trust signals layout

language: typescript + react 19 + r3f 9
service: apps/web/components/scenes/footer/
new_files:
  - apps/web/components/scenes/footer/Footer.tsx
  - apps/web/components/scenes/footer/Footer.client.tsx
  - apps/web/components/scenes/footer/LumiCornerAvatar.tsx
  - apps/web/components/scenes/footer/TrustSignalsFooter.tsx
  - apps/web/components/scenes/footer/LanguageSwitcher.tsx
  - apps/web/components/scenes/footer/__tests__/footer.spec.ts

effort_hours: 6
risk_if_skipped: "The footer is the cinematic conceit's narrative bookend (Lumi was there at start, Lumi waves goodbye at end). Without persistence + nón lá retention, the cultural-arc closure breaks. Trust signals strip in footer (DUNS, founder credit, contact) is also where the buyer audience verifies legitimacy before submitting a CTA."
---

## §1 — Description (BCP-14 normative)

1. **MUST** mount Footer via `<SceneTunnel id="footer">`. Footer is the final scene in the orchestrator sequence.

2. **MUST** trigger `wave_goodbye` clip on footer-enter:
   - `setCurrentAnim("wave_goodbye")` at progress > 0.05.
   - Clip duration 2.0s no-loop; both arms wave twice then Lumi curls down + wisp spirals into the corner.
   - At clip end: transition to persistent corner-avatar mode (next §1 #3).

3. **MUST** render **persistent Lumi corner avatar** at top-right viewport corner after `wave_goodbye`:
   - Position: fixed top-right, ~48×48 px in viewport space.
   - Z-index: above scene content, BELOW skip-story pill (FR-A11Y-003) and sticky CTA (FR-SCENE-011).
   - The avatar IS the Lumi GLB rendered at a small scale, positioned via canvas-relative-to-viewport math.
   - Avatar persists for the entire footer scroll — never disappears.

4. **MUST** keep **nón lá ON** in the corner avatar (master plan §3.3b). The `nonlaVisible` flag from FR-CHAR-012 stays `true`; the hat mesh remains parented to `hat_socket`.

5. **MUST** support corner-avatar interaction:
   - Hover: subtle pulse + DOM tooltip with bilingual tagline from FR-CMS-002 `lumi-tagline-hover`.
   - Scroll-back-up into Scene 6: reverse `wave_goodbye` clip (NLA timeline scrub backward) — Lumi un-curls from corner and rejoins Scene 6 cinematic.
   - The 3 states (idle / hover-pulse / scroll-back-up-reverse) are documented in `design/scenes/footer/lumi-corner-state-diagram.md` per FR-SCENE-008 §1 #9.

6. **MUST** apply footer art direction:
   - Background fade from Scene 6's `--brand-brown-500` → footer `--brand-brown-400` (warms back to closing register).
   - No cool tones.

7. **MUST** include the footer caption from FR-CMS-002 `footer-goodbye-primary`: *"Until your next wish."*

8. **MUST** include the **trust signals block** per master plan §9.2 + FR-SCENE-008 §1 #4:
   - Legal name: CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY
   - D-U-N-S 673219568 (linked external to dnb.com)
   - Founded 2020
   - Address: 1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward, Ho Chi Minh City, Vietnam
   - Phone: (+84) 906 878 091
   - Email: info@cyberskill.world
   - Founder credit: Stephen Cheng · Trịnh Thái Anh (UTF-8 NFC-normalized; build pipeline must preserve diacritics)

9. **MUST** include secondary navigation links: `/work`, `/lite`, `/accessibility`, `/privacy`, `/terms`. All as DOM `<a>` elements with `rel="external"` where appropriate.

10. **MUST** include the **language switcher** (EN / VI) per FR-CMS-008 hreflang context:
    - Text labels only (EN, VI). NO flag icons (master plan §9.2 + FR-SCENE-008 §1 #7 forbids — flag icons carry political baggage).
    - Active language has aria-current="true".
    - Switching language sets `?lang=` query param and triggers Next.js page transition via FR-WEB-008 routing.

11. **MUST NOT** include cool-tone accents anywhere in footer.

12. **MUST NOT** include aspirational certifications. The trust signals MUST match FR-SEO-001 Schema.org claims byte-for-byte. NO "ISO 27001", NO "SOC 2", NO claims the company doesn't actually hold.

13. **MUST** be SSR-safe + reduced-motion-aware:
    - SSR HTML: all footer DOM content (trust signals + nav + language switcher) renders server-side.
    - Reduced-motion: no canvas; static webp showing Lumi-in-corner; no wave_goodbye animation.

14. **MUST** ship Vitest unit tests: corner-avatar position (top-right), nón lá visible, language switcher updates URL, no flag icons.

15. **MUST** ship Playwright integration tests: footer mounts, wave_goodbye plays, corner avatar persists, scroll-back-up triggers reverse, all trust signals present + linked, language switcher works, no aspirational certifications.

## §2 — Why this design

**Why persistent corner avatar?** Master plan §2.1 Footer: "Lumi curls into persistent corner avatar." The cinematic conceit's bookend. Without persistence, the footer feels like an abrupt cinematic end; with it, the user senses Lumi accompanying them through any subsequent footer-area interactions.

**Why nón lá stays on in corner?** Master plan §3.3b: "Lumi has chosen its identity." Removing the nón lá in the corner would undo the Scene 5 cultural beat — visually saying "the cultural moment was performative." Keeping it on says "this is who Lumi is now."

**Why text-only language switcher (no flag icons)?** Master plan + FR-SCENE-008 §1 #7: flag icons carry political baggage. Vietnam's flag is fine (we own it culturally), but English doesn't have a single flag (UK? US? Both?). Text labels avoid the question entirely.

**Why scroll-back-up reverse animation?** Cinematic continuity. If user scrolls back from footer to Scene 6, the corner avatar visibly un-curls and rejoins the scene — the camera/Lumi state stays coherent with scroll direction. Master plan §3.3a notes the `wave_goodbye` clip is reversible.

**Why aspirational-certification ban?** FR-SEO-001 Schema.org claims define what the company actually has. Footer trust signals are checked by the buyer audience BEFORE form submission — claims must be defensible. "ISO 27001" without certification = a brand-trust break. Conservative truth wins.

## §3 — Deliverable structure

```
apps/web/components/scenes/footer/
├── Footer.tsx                      # server re-export
├── Footer.client.tsx               # "use client" wrapper
├── LumiCornerAvatar.tsx            # canvas-rendered top-right Lumi
├── TrustSignalsFooter.tsx          # DOM trust signals + nav
├── LanguageSwitcher.tsx            # EN / VI text-only switcher
├── footer-static.webp              # SSR fallback
└── __tests__/
    └── footer.spec.ts

design/scenes/footer/
└── lumi-corner-state-diagram.md    # 3-state diagram (FR-SCENE-008 §1 #9)
```

### §3.2 — `LumiCornerAvatar.tsx` shape

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useScrollDirection, useLumiAnim } from "@/lib/stores";

const CORNER_VIEWPORT_OFFSET = { x: 0.85, y: 0.85 };  // normalized viewport coords (top-right corner)

export function LumiCornerAvatar() {
  const { camera, viewport } = useThree();
  const groupRef = useRef<any>(null);
  const { scene } = useGLTF("/lumi.glb");
  const currentAnim = useLumiAnim();
  const scrollDirection = useScrollDirection();

  useFrame(() => {
    if (!groupRef.current || currentAnim !== "wave_goodbye") {
      // Pin to top-right corner once wave_goodbye completes
      if (currentAnim === "idle" || currentAnim === "wave_goodbye") {
        const x = (CORNER_VIEWPORT_OFFSET.x - 0.5) * viewport.width;
        const y = (CORNER_VIEWPORT_OFFSET.y - 0.5) * viewport.height;
        groupRef.current.position.set(x, y, 1);
        groupRef.current.scale.setScalar(0.15);
      }
    }
  });

  // Scroll-back-up reverse handler
  useEffect(() => {
    if (scrollDirection === "up") {
      // Re-trigger wave_goodbye reversed via mixer.timeScale = -1 (handled in FR-SCENE-010 picker amendment)
    }
  }, [scrollDirection]);

  return <primitive ref={groupRef} object={scene} />;
}
```

### §3.3 — `TrustSignalsFooter.tsx` shape

```tsx
"use client";
import lines from "@/content/narrative/lines/en.json";

export function TrustSignalsFooter({ lang = "en" }: { lang?: "en" | "vi" }) {
  return (
    <footer className="bg-[var(--brand-brown-400)] py-16 px-8 text-[var(--brand-gold-100)]">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-lg mb-3">CyberSkill</h3>
          <p className="font-mono text-xs">
            CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY
          </p>
          <p className="font-mono text-xs mt-2">
            <a href="https://www.dnb.com/business-directory/company-profiles/cyberskill.673219568"
               rel="external" className="underline">
              D-U-N-S 673219568
            </a>
          </p>
          <p className="font-mono text-xs mt-2">Founded 2020 · Founders: Stephen Cheng · Trịnh Thái Anh</p>
        </div>
        <div>
          <h3 className="font-display text-lg mb-3">Contact</h3>
          <address className="font-mono text-xs not-italic">
            1st Floor, 207A Nguyen Van Thu Street,<br />
            Tan Dinh Ward, Ho Chi Minh City, Vietnam<br />
            <a href="tel:+84906878091">(+84) 906 878 091</a><br />
            <a href="mailto:info@cyberskill.world">info@cyberskill.world</a>
          </address>
        </div>
        <div>
          <h3 className="font-display text-lg mb-3">Navigation</h3>
          <ul className="font-mono text-xs space-y-1">
            <li><a href="/work">Work</a></li>
            <li><a href="/lite">Lite version</a></li>
            <li><a href="/accessibility">Accessibility</a></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
          </ul>
        </div>
      </div>
      <p className="text-center font-mono text-xs mt-12 opacity-70">
        {lang === "vi" ? "Tới điều ước tiếp theo của bạn." : "Until your next wish."}
      </p>
    </footer>
  );
}
```

### §3.4 — `LanguageSwitcher.tsx` shape

```tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function LanguageSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentLang = searchParams?.get("lang") ?? "en";

  const switchTo = (lang: "en" | "vi") => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("lang", lang);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav aria-label="Language switcher" className="font-mono text-xs">
      <button
        onClick={() => switchTo("en")}
        aria-current={currentLang === "en" ? "true" : undefined}
        className={currentLang === "en" ? "underline font-bold" : ""}
      >EN</button>
      <span className="mx-2">·</span>
      <button
        onClick={() => switchTo("vi")}
        aria-current={currentLang === "vi" ? "true" : undefined}
        className={currentLang === "vi" ? "underline font-bold" : ""}
      >VI</button>
    </nav>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Footer mounts via SceneTunnel id="footer" | DOM check |
| 2 | wave_goodbye triggers on footer-enter | Playwright eval currentAnim === "wave_goodbye" |
| 3 | Corner avatar persists post-clip at top-right (≈ 48×48 px) | Playwright + canvas-coordinate check |
| 4 | Nón lá visible in corner avatar | nonlaVisible === true |
| 5 | All 7 trust signal elements present + linked | DOM enumeration |
| 6 | DUNS 673219568 linked to dnb.com externally | DOM `<a>` href check |
| 7 | Vietnamese diacritics preserved (Trịnh Thái Anh) | UTF-8 byte check |
| 8 | Language switcher EN / VI text-only (no flag icons) | DOM grep: no `<img>` or `<svg>` next to switch |
| 9 | Language switcher updates URL `?lang=` | Playwright click + URL check |
| 10 | Background eyedrops `--brand-brown-400` | Pixel sample |
| 11 | No cool-tone accents | Eyedropper sweep |
| 12 | No "ISO 27001" / "SOC 2" / aspirational certifications | Grep on rendered HTML |
| 13 | Z-index order: skip-pill > sticky-CTA > corner-avatar > scenes | Computed-style check |
| 14 | Reduced-motion: no canvas; static webp; trust signals + nav fully functional | Playwright reducedMotion ctx |
| 15 | Scroll-back-up into Scene 6 reverses wave_goodbye | Playwright scroll-up; verify clip timeline reverses |
| 16 | Hover on corner avatar shows tagline tooltip | Playwright hover + tooltip text check |
| 17 | Disposes corner-avatar useFrame subscription on unmount | Vitest |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("wave_goodbye + persistent corner", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim)).toBe("wave_goodbye");
  await page.waitForTimeout(2200);  // clip completes; corner avatar mode
  // Corner avatar should be at top-right; assert via canvas debug
  const cornerPos = await page.evaluate(() => (window as any).__sceneDebug?.cornerAvatarPos);
  expect(cornerPos.x).toBeGreaterThan(0.7);  // normalized
});

test("no aspirational certifications", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const html = await page.content();
  expect(html).not.toMatch(/ISO 27001|SOC 2|GDPR.compliant/i);
  // (GDPR-ready is fine; "GDPR-compliant" implies certification)
});

test("Vietnamese diacritics preserved", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const html = await page.content();
  expect(html).toContain("Trịnh Thái Anh");  // exact UTF-8 NFC byte sequence
});

test("language switcher no flag icons", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const switcher = page.locator('nav[aria-label="Language switcher"]');
  await expect(switcher.locator("img")).toHaveCount(0);
  await expect(switcher.locator("svg")).toHaveCount(0);
});

test("language switcher updates URL", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.click('button:has-text("VI")');
  expect(page.url()).toContain("?lang=vi");
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-008 (Footer comp + lumi-corner-state-diagram), FR-CHAR-011 (wave_goodbye clip), FR-CMS-002 (caption + tagline), FR-SEO-001 (Schema.org trust signal source-of-truth).

**Operational:** FR-WEB-003, FR-WEB-004 (useLumiAnim, useScrollDirection), FR-WEB-008 (routing for language switcher), FR-CMS-008 (hreflang), FR-A11Y-001.

**Downstream:** FR-SCENE-020 (orchestrator handles transitions).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Corner avatar covers DOM links | AC#13 + visual review | z-index + opacity-on-hover; FR-SCENE-008 §4 row 3 |
| Nón lá disappears in footer | AC#4 | Verify nonlaVisible flag never resets |
| Aspirational certification slips in | AC#12 grep | Strip; only certifications the company actually holds |
| Vietnamese diacritics corrupted | AC#7 | UTF-8 NFC build pipeline; FR-CMS-007 i18n loader normalizes |
| Language switcher uses flag icons | AC#8 | Text labels only ("EN" / "VI") |
| Scroll-back-up doesn't reverse clip | AC#15 | mixer.timeScale = -1 (FR-SCENE-010 picker amendment if needed) |
| Corner avatar wrong size or off-canvas | AC#3 | Recalculate viewport-relative position; FR-SCENE-022 DPR scaling |
| Z-index violation: corner avatar above skip-pill | AC#13 | Adjust z-index tokens per FR-A11Y-002/003 hierarchy |
| Wave_goodbye over-animation (Lumi waves too long) | Visual | Clip is exactly 2.0s; verify mixer.finished fires |
| Reduced-motion still renders canvas | AC#14 | Early-return LumiCornerAvatar under reducedMotion |
| Trust signals strip text drift from FR-SEO-001 | AC#12 + cross-FR check | Source-of-truth: FR-SEO-001 Schema.org JSON-LD; footer mirrors |
| Memory leak (avatar useFrame not unsubscribed) | AC#17 | Cleanup in useEffect |

## §8 — Deliverable preview

After shipping, scrolling from Scene 6 into footer:
1. Camera fades to brown-400.
2. Lumi waves both arms twice (wave_goodbye 2.0s).
3. Lumi curls down; wisp spirals into top-right viewport corner.
4. Corner avatar persists at ~ 48×48 px at top-right (nón lá still on).
5. Footer caption: "Until your next wish."
6. Trust signals strip + nav links + language switcher render.
7. User can scroll within footer; corner avatar follows.
8. User hovers corner avatar → tooltip: "Lumi — vì ánh sáng biến nguyện ước thành sự thật"
9. User scrolls up → corner avatar un-curls, rejoins Scene 6.

Reduced-motion: footer fully functional; static webp shows Lumi-in-corner; no animation.

## §9 — Notes

**On the bilingual tagline:** "Lumi — vì ánh sáng biến nguyện ước thành sự thật" (Vietnamese) translates roughly to "Lumi — for light turns wishes into reality." Master plan §3.3 cultural reference. Stored in `content/narrative/lines/en.json` under `lumi-tagline-hover` with VI variant in `vi.json`.

**On corner-avatar perf:** Rendering a 28k-tri Lumi at 48×48 px is wasteful. FR-PERF-002 LOD swap kicks in for distance > 12m — corner avatar at viewport scale should trigger LOD-1 (the 8k-tri FR-CHAR-004 greybox). Verify the swap fires.

**On founder name preservation:** "Trịnh Thái Anh" must be NFC-normalized (precomposed Unicode). Some build tools NFD-decompose (separating combining marks); the build pipeline MUST preserve NFC. Lint rule + Vitest test catches drift.

*End of FR-SCENE-019.*
