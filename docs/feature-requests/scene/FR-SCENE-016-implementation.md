---
id: FR-SCENE-016
title: "Scene 4 Team impl — 10 bokeh avatars + Lumi dim + privacy-by-default hover anonymisation"
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
related_frs: [FR-SCENE-005, FR-SCENE-015, FR-SCENE-020, FR-CHAR-011, FR-CMS-002, FR-CMS-004, FR-CTA-004]
depends_on: [FR-SCENE-015, FR-SCENE-005, FR-CHAR-011, FR-CMS-004]
blocks: [FR-SCENE-017, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 4 — "Team · Trust / Warmth"
  - docs/01-master-plan-v2.md §3.4 Scene 4 — warm golden-hour; bokeh transmission orbs; Lumi dim
  - docs/01-master-plan-v2.md §9.1 Track 3 — "We're hiring N" discreet recruit hook
  - docs/01-master-plan-v2.md §1.3 brand-proof — "Ten people. One craft."

language: typescript + react 19 + r3f 9 + drei
service: apps/web/components/scenes/scene-4-team/
new_files:
  - apps/web/components/scenes/scene-4-team/Scene4Team.tsx
  - apps/web/components/scenes/scene-4-team/Scene4Canvas.tsx
  - apps/web/components/scenes/scene-4-team/AvatarSphere.tsx
  - apps/web/components/scenes/scene-4-team/BokehLayer.tsx
  - apps/web/components/scenes/scene-4-team/HiringHook.tsx
  - apps/web/components/scenes/scene-4-team/__tests__/scene-4.spec.ts

effort_hours: 10
risk_if_skipped: "Scene 4 humanises the team without commodifying them. The 10-avatar count is brand-proof ('Ten of us, all senior, all Vietnamese, all remote'); the privacy-by-default hover reveal is what distinguishes us from agencies that exploit their staff photos. Skipping/weakening means the trust beat collapses; partner-track conversion suffers."
---

## §1 — Description (BCP-14 normative)

1. **MUST** mount Scene 4 via `<SceneTunnel id="scene-4-team">`. Inherits the SceneTunnel pattern from FR-WEB-003.

2. **MUST** drive Lumi's animation by setting `useLumiStore.setCurrentAnim("idle")` on scene-enter. Scene 4 does NOT use a dedicated clip — Lumi is dimmed and stepped-back; the team is the subject.

3. **MUST** set `useLumiStore.setEmissiveBoost(0.10)` for the duration of Scene 4. This dims Lumi's emissive multiplier (baseline 0.20, dimmed to 0.10) per master plan §2.1 "Lumi pulls back / quiet." Restored to 0.20 on scene-exit.

4. **MUST** render **exactly 10 AvatarSphere meshes** at varying world depths z ∈ [-2.0, +1.0] per FR-SCENE-005 avatar-placement.md:
   - Scale per avatar: `0.15 + (z + 2.0) * 0.05` — closer avatars are larger (foreshortening).
   - Each avatar: a small sphere mesh with `--brand-gold-200` rim-light material (custom shader with edge-light Fresnel term).
   - Positions sourced from `avatar-placement.md` table (10 unique x/y/z triples avoiding overlap).

5. **MUST** render **MeshTransmissionMaterial bokeh layer** — 8-12 large translucent spheres at random world positions in the background (z < -2.5), providing soft depth-blur. Use Drei's `<MeshTransmissionMaterial>` with `transmissionSampler` for the cinematic soft-bokeh look per master plan §3.4 Scene 4.

6. **MUST** apply Scene 4 art direction:
   - Background: `--brand-brown-400` warm golden-hour tone (slightly warmer than Scene 3's brown-500).
   - Ambient light: warm-gold, intensity 0.45 (higher than other scenes to evoke "lit room").
   - Key light: soft warm from upper-left, intensity 0.5.
   - NO cool tones — eyedropper enforces. Specifically: NO cyan/magenta/lime leakage from Scene 3.

7. **MUST** include the Scene 4 caption from FR-CMS-002 `scene-4-team-primary` verbatim: *"Ten of us. All senior. All Vietnamese. All remote."*

8. **MUST** include the **"We're hiring N" DISCREET recruit hook** per master plan §9.1 Track 3 + FR-SCENE-005 §1 #6:
   - Rendered as a small text link (not a button) below the caption.
   - Format: `<a href="/work#join" class="recruit-hook">We're hiring {N}</a>` where N is dynamically loaded from `FR-CMS-004 Sanity.Job.count` (default fallback: "5").
   - Visually subordinate — caption-size, gold-200 on brown-400, no button styling, no emphasis weight.
   - The link routes to FR-CTA-004 Join form via deep-link `?action=join`.

9. **MUST** implement **per-avatar hover anonymisation** per FR-SCENE-005 §1 #8:
   - On hover: tooltip reveals `firstName + " · " + role` (e.g. "Minh · Senior Engineer").
   - NO photos. NO LinkedIn URLs. NO last names.
   - Tooltip rendered as a DOM overlay (NOT Drei `<Html>`), positioned by screen-projecting the hovered avatar's world position.
   - Tooltip dismissed on hover-out or after 3 seconds.
   - Source data: `content/team.json` array of `{ firstName, role }` — 10 entries; ships pre-redacted (no PII beyond first name).

10. **MUST** transition camera Scene 3 → 4 over 500ms ease-genie. Camera moves from Scene 3 pose `[0, 0, 6.0]` to Scene 4 pose `[0.1, 0.3, 5.0]` (slightly closer, slightly higher — observer perspective).

11. **MUST** be SSR-safe + reduced-motion-aware:
    - SSR HTML: caption + hiring-hook DOM link + static webp showing all 10 avatars in golden-hour render.
    - Reduced-motion: no canvas; static fallback. Hover reveal becomes click-toggle on the static image (each avatar coord has a hot-zone that reveals the name+role on click; accessible via keyboard tab).

12. **MUST** dispose all 10 avatar geometries + materials + bokeh layer on unmount.

13. **MUST NOT** vary the avatar count from 10. "Ten of us" is brand-proof copy. Adding the 11th hire or losing someone requires master-plan + FR-CMS-002 + FR-CMS-004 amendment.

14. **MUST NOT** include any photo or LinkedIn URL in any avatar reveal. This is a privacy invariant. Future Sanity content updates by team members cannot bypass this constraint — FR-CMS-004 schema explicitly omits `photo` and `linkedIn` fields on TeamMember type.

15. **MUST** ship Vitest unit tests for `AvatarSphere` (renders with rim-light, hover-toggle works), `BokehLayer` (transmission material applied), `HiringHook` (link href + N value).

16. **MUST** ship Playwright integration tests: 10 avatars present, Lumi emissive ≤ 0.15 in Scene 4 (verifying dim), hover reveals first-name-only (no last name, no photo), hiring hook reads "We're hiring N" with current N.

17. **SHOULD** include `?debug=scene-4` overlay showing avatar count + hover state + Lumi emissive value.

## §2 — Why this design

**Why exactly 10 avatars?** Master plan §1.3 brand-proof: "Ten people. One craft." The number is part of the brand statement. Showing 11 weakens "Ten of us"; showing 9 weakens it differently. The number is canonical until a hiring milestone changes it — then master plan amendment + caption update.

**Why privacy-by-default (no photos, no LinkedIn)?** The team is small (10 people, all Vietnamese, all senior). Showing photos makes them individually identifiable + recruitable by competitors. Showing LinkedIn URLs encourages cold-DM harassment. The proof-point is the COUNT and the COMPOSITION ("All senior. All Vietnamese. All remote.") — not the individuals. FR-CTA-004 Join form is where interested talent connects with the team properly.

**Why DOM-side tooltip (not Drei `<Html>`)?** Hover tooltips need screen-space positioning with viewport-relative styling (z-index, max-width, padding). Drei `<Html>` renders in 3D-space and inherits canvas-tree behaviors. DOM is the right primitive. Same rule as FR-SCENE-014 pull-quote.

**Why Lumi emissive 0.10 (dimmed)?** Master plan §2.1 Scene 4 row: "Lumi pulls back / quiet — reveal 10 small hovering avatars." Lumi at default emissive 0.20 dominates the scene; dropping to 0.10 makes Lumi visually subordinate to the team. Scene narrative: "step back so the team can be seen."

**Why MeshTransmissionMaterial bokeh?** Master plan §3.4 Scene 4 specifies "soft transmission orbs at 8-12 depth positions providing background depth-blur." Drei's `<MeshTransmissionMaterial>` is the canonical way to get cinematic soft-bokeh in R3F — it samples the framebuffer behind each sphere and produces a real refraction. The visual effect is a warm-key-light room with floating soft orbs of light.

**Why "We're hiring N" as a text link (not a CTA button)?** Master plan §9.1 Track 3: "Discreet recruit hook." Buttons signal "primary action" and would compete with the Buy CTA (FR-SCENE-011 sticky). A text link signals "if you're curious, here's the door." The recruit-track is meant to feel like an invitation, not a pitch. FR-CTA-001's hub at Scene 6 is where talent gets the proper landing.

## §3 — Deliverable structure

```
apps/web/components/scenes/scene-4-team/
├── Scene4Team.tsx                  # server re-export
├── Scene4Canvas.tsx                # R3F content
├── AvatarSphere.tsx                # individual avatar mesh + hover handler
├── BokehLayer.tsx                  # MeshTransmissionMaterial spheres
├── HiringHook.tsx                  # DOM "We're hiring N" link
├── AvatarTooltip.tsx               # DOM tooltip for hover reveal
├── scene-4-static.webp             # SSR fallback
└── __tests__/
    ├── scene-4.spec.ts             # Playwright integration
    ├── avatar.unit.test.ts         # Vitest unit
    └── hiring-hook.unit.test.ts    # Vitest unit

content/
└── team.json                       # 10 entries: { firstName, role }
```

### §3.2 — `AvatarSphere.tsx` shape

```tsx
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

const RIM_VERT = `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RIM_FRAG = `varying vec3 vNormal; uniform vec3 uColor;
void main() {
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.0);
  gl_FragColor = vec4(uColor * (0.3 + fresnel * 0.9), 1.0);
}`;

export function AvatarSphere({
  position, member, onHoverStart, onHoverEnd,
}: {
  position: [number, number, number];
  member: { firstName: string; role: string };
  onHoverStart: (p: [number, number, number], m: { firstName: string; role: string }) => void;
  onHoverEnd: () => void;
}) {
  const ref = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const z = position[2];
  const scale = 0.15 + (z + 2.0) * 0.05;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Parallax intensity based on z (closer avatars parallax more)
    const parallaxMul = (z + 2.5) / 3.5;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.6 + position[0]) * 0.05 * parallaxMul;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      scale={scale * (hovered ? 1.2 : 1.0)}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); onHoverStart(position, member); document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { setHovered(false); onHoverEnd(); document.body.style.cursor = "default"; }}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <shaderMaterial
        vertexShader={RIM_VERT}
        fragmentShader={RIM_FRAG}
        uniforms={{ uColor: { value: [0.976, 0.851, 0.4] } }}   // gold-200
      />
    </mesh>
  );
}
```

### §3.3 — `BokehLayer.tsx` shape

```tsx
import { useMemo } from "react";
import { MeshTransmissionMaterial } from "@react-three/drei";

export function BokehLayer({ count = 10 }: { count?: number }) {
  const positions = useMemo(() =>
    Array.from({ length: count }, (_, i) => [
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      -3 - Math.random() * 2,
    ] as [number, number, number]),
    [count]
  );
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.4 + Math.random() * 0.3, 16, 16]} />
          <MeshTransmissionMaterial
            backside
            thickness={0.5}
            transmission={1.0}
            roughness={0.15}
            ior={1.3}
            chromaticAberration={0.05}
            color="#F9D966"  // gold-200
          />
        </mesh>
      ))}
    </group>
  );
}
```

### §3.4 — `HiringHook.tsx` + `AvatarTooltip.tsx` shape

```tsx
// HiringHook.tsx
"use client";
import { useEffect, useState } from "react";

export function HiringHook() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/jobs/count").then(r => r.json()).then(d => setN(d.count));
  }, []);
  return (
    <a
      href="/work?action=join"
      className="font-mono text-sm text-[var(--brand-gold-200)] hover:underline opacity-80"
    >
      We're hiring {n ?? "5"}
    </a>
  );
}

// AvatarTooltip.tsx
"use client";
import { useEffect, useState } from "react";

export function AvatarTooltip({ screenPos, member }: {
  screenPos: { x: number; y: number } | null;
  member: { firstName: string; role: string } | null;
}) {
  if (!screenPos || !member) return null;
  return (
    <div
      role="tooltip"
      className="fixed z-50 px-3 py-2 bg-[var(--brand-brown-700)] text-[var(--brand-gold-100)] rounded shadow-lg font-mono text-sm pointer-events-none"
      style={{ left: screenPos.x, top: screenPos.y, transform: "translate(-50%, -100%)" }}
    >
      {member.firstName} · {member.role}
    </div>
  );
}
```

### §3.5 — `content/team.json` shape

```json
[
  { "firstName": "Minh",   "role": "Senior Engineer" },
  { "firstName": "Anh",    "role": "Senior Designer" },
  { "firstName": "Linh",   "role": "Senior Engineer" },
  { "firstName": "Trang",  "role": "Senior Product Manager" },
  { "firstName": "Bao",    "role": "Senior Engineer" },
  { "firstName": "Huy",    "role": "Senior Engineer" },
  { "firstName": "Phuong", "role": "Senior Designer" },
  { "firstName": "Khanh",  "role": "Senior Engineer" },
  { "firstName": "Nam",    "role": "Senior Engineer" },
  { "firstName": "Hung",   "role": "Senior Engineer" }
]
```

(10 entries. First-name only. Role kept generic enough to not identify individuals. No last names, no photos, no LinkedIn URLs.)

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Scene mounts via SceneTunnel id="scene-4-team" | Vitest + Playwright DOM check |
| 2 | Exactly 10 AvatarSpheres present | Playwright eval scene-graph count |
| 3 | Lumi emissive ≤ 0.15 during Scene 4 active | Playwright eval `useLumiStore.emissiveBoost` ≤ 0.15 |
| 4 | BokehLayer renders 8-12 transmission spheres | Scene-graph count check |
| 5 | Background eyedrops to `--brand-brown-400` | Pixel sample |
| 6 | No cool-tone accents | Eyedropper sweep |
| 7 | Caption text verbatim from en.json | Cross-ref |
| 8 | "We're hiring N" link present + visually subordinate | Playwright + style inspection: not button-styled, < 14px |
| 9 | Hover over avatar reveals firstName + role only | Playwright hover + tooltip text check |
| 10 | No photos in DOM at avatar coords | Playwright `<img>` count under avatar regions = 0 |
| 11 | No LinkedIn URLs anywhere in Scene 4 | Grep on rendered DOM |
| 12 | content/team.json has exactly 10 entries | Vitest schema check |
| 13 | Each avatar has unique x/y/z (no overlap) | Validator on avatar-placement.md / team.json positions |
| 14 | Camera transition Scene 3 → 4 smooth (500ms ease-genie) | Frame-diff |
| 15 | Reduced-motion: static fallback; tooltip-on-click; keyboard-tab works | Playwright reducedMotion ctx |
| 16 | Disposes 10 avatar + bokeh resources on unmount | Vitest |
| 17 | Hiring-hook deep-links `?action=join` correctly | Playwright click + URL check |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("exactly 10 avatars + Lumi dim", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
  await page.waitForTimeout(500);
  const count = await page.evaluate(() => (window as any).__sceneDebug?.avatarCount);
  expect(count).toBe(10);
  const emissive = await page.evaluate(() => (window as any).__stores?.lumi?.emissiveBoost);
  expect(emissive).toBeLessThanOrEqual(0.15);
});

test("hover reveals first-name only", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
  await page.waitForTimeout(500);
  // Hover over first avatar at known screen coords (read from debug)
  // ... assert tooltip text doesn't contain last name patterns or "Nguyen" etc.
});

test("no photos, no LinkedIn", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
  const html = await page.content();
  expect(html).not.toMatch(/linkedin\.com\/in\//);
  // No <img> tags with team member names
});

test("hiring hook deep-link", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
  await page.click('a:has-text("We\'re hiring")');
  expect(page.url()).toContain("/work?action=join");
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-005 (Scene 4 comp + avatar-placement.md + privacy rules), FR-CHAR-011 (idle clip), FR-CMS-002 (caption), FR-CMS-004 (Sanity TeamMember + Job schema).

**Operational:** FR-WEB-003, FR-WEB-004, FR-DS-006, FR-A11Y-001, FR-CTA-004 (Join form deep-link target).

**Downstream:** FR-SCENE-017 (Scene 5 transition), FR-SCENE-020 (orchestrator), FR-CTA-004 (consumes the hiring hook click).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| 11+ or 9- avatars (brand-proof violation) | AC#2 count + master-plan §16.2 gate | Restore to exactly 10; "Ten of us" copy is canonical |
| Photo uploaded to TeamMember (FR-CMS-004 schema violation) | AC#10 + Sanity schema validation | Sanity schema MUST omit `photo` field on TeamMember; reject content uploads with photo |
| LinkedIn URL slipped into team.json | AC#11 grep | Strip; team.json schema validation forbids URL fields |
| Hiring CTA too prominent (button-styled, large) | AC#8 + founder visual review | Demote to text-link; FR-CTA-001 hub is the primary CTA |
| Lumi too bright (steals the scene) | AC#3 emissive value | Set boost to 0.10 on scene-enter; restore to 0.20 on exit |
| Avatars cluster (no depth variety) | AC#13 | Spread z-positions; ensure parallax visible at typical scroll velocities |
| Bokeh layer too thick (obscures avatars) | Visual smoke | Reduce transmission count to 8 or thickness to 0.3 |
| Tooltip persists after hover-out | AC#9 + manual | Verify `onPointerLeave` resets state; 3s timeout fallback |
| Tooltip reveals last name (Sanity drift) | AC#9 + content audit | team.json schema strictly `firstName` only; build-time validator |
| Reduced-motion path loses keyboard a11y | AC#15 | Static fallback has tab-focusable avatar regions with aria-label reveals |
| API `/api/jobs/count` 404s (Sanity offline) | AC#8 hiring hook | Fallback hardcoded to "5" |
| Camera jump-cut (gsap missed) | AC#14 | Verify scroll-rig camera-offset bound to scene boundary |

## §8 — Deliverable preview

After shipping, scrolling from Scene 3 into Scene 4:
1. Camera pulls slightly forward + up (500ms).
2. Background fades brown-500 → brown-400 (warmer golden-hour).
3. Lumi emissive dims from 0.20 → 0.10; Lumi visibly steps back into the warm-lit space.
4. 10 AvatarSpheres fade in at varying depths; closer ones larger.
5. Bokeh layer (8-12 transmission spheres) blurs background into soft warm orbs.
6. Caption types: "Ten of us. All senior. All Vietnamese. All remote."
7. "We're hiring 5" appears below caption as subordinate link.
8. User hovers an avatar; tooltip reveals "Minh · Senior Engineer".
9. User clicks "We're hiring 5"; deep-links to `/work?action=join` → FR-CTA-004 Join form.

Reduced-motion: static webp with the same composition, click-toggle reveals via accessible hot-zones.

## §9 — Notes

**On team.json maintenance:** When the team grows past 10 (or shrinks), update `content/team.json` (still kept anonymized) + FR-CMS-002 caption ("Ten of us" → new number) + master plan §1.3 → master-plan amendment. The 10-count is a brand-proof number, not a runtime constraint.

**On photo policy:** Some team members may want their photos shown for trust signaling. This is a future amendment territory (FR-A11Y-NNN consent flow + FR-CMS-004 schema extension), not slice 1. For now: strict no-photos.

**On hiring hook A/B testing:** Marketing may want to test "We're hiring 5" vs "Join our team" vs "We're looking for senior engineers." Slice 2 amendment via FR-CTA-001 + FR-SEO-007 analytics integration.

*End of FR-SCENE-016.*
