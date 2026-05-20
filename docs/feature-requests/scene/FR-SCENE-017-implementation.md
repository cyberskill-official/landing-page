---
id: FR-SCENE-017
title: "Scene 5 Vietnam→Global impl — globe + `nonla_appear`/`nonla_tip` + HCMC→NA/EU arc + cultural-arc closure"
module: SCENE
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: R3F Architect + Frontend Lead + Founder (cultural review)
created: 2026-05-16
shipped: 2026-05-19
strict_audited: 2026-05-19
related_frs: [FR-SCENE-006, FR-SCENE-016, FR-SCENE-020, FR-CHAR-011, FR-CHAR-012, FR-CMS-002, FR-DS-005, FR-CTA-008]
depends_on: [FR-SCENE-016, FR-SCENE-006, FR-CHAR-011, FR-CHAR-012]
blocks: [FR-SCENE-018, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 5 — "Vietnam → Global · Pride / scale-readiness"
  - docs/01-master-plan-v2.md §3.3a `nonla_appear` (1.0s) + `nonla_tip` (1.5s)
  - docs/01-master-plan-v2.md §3.4 Scene 5 — stylized globe, nón lá tilt, HCMC→NA/EU arc
  - docs/01-master-plan-v2.md §3.3b — "Lumi has chosen its identity" (nón lá persists)
  - docs/01-master-plan-v2.md §9.2 — trust signals strip + time-zone live clock
  - docs/01-master-plan-v2.md §1.4 — "do NOT lead with cost"

language: typescript + react 19 + r3f 9 + glsl
service: apps/web/components/scenes/scene-5-vietnam-global/
new_files:
  - apps/web/components/scenes/scene-5-vietnam-global/Scene5VietnamGlobal.tsx
  - apps/web/components/scenes/scene-5-vietnam-global/Scene5Canvas.tsx
  - apps/web/components/scenes/scene-5-vietnam-global/StylizedGlobe.tsx
  - apps/web/components/scenes/scene-5-vietnam-global/HcmcPin.tsx
  - apps/web/components/scenes/scene-5-vietnam-global/DestinationArc.tsx
  - apps/web/components/scenes/scene-5-vietnam-global/TrustSignalsStrip.tsx
  - apps/web/components/scenes/scene-5-vietnam-global/__tests__/scene-5.spec.ts

effort_hours: 14
risk_if_skipped: "Scene 5 is THE cultural beat. It's where the site addresses 'but you're in Vietnam' head-on. The nón lá moment IS the cultural-identity payoff. Get this wrong and the buyer audience exits during this scene. Get this right and the partner + recruit audiences trust the brand for the rest of the cinematic. This is the single highest-stakes implementation FR in the entire project."
---

## §1 — Description (BCP-14 normative)

1. **MUST** mount Scene 5 via `<SceneTunnel id="scene-5-vietnam-global">`. Apply `data-scene="scene-5"` attribute on the section element — this activates the FR-DS-005 CSS-cascade scope for `--accent-flag-red` and `--accent-star-yellow`.

2. **MUST** drive Lumi's animation sequence:
   - On scene-enter (progress > 0.1): `setCurrentAnim("nonla_appear")` (1.0s no-loop).
   - On `nonla_appear` finish (mixer.finished event): `setCurrentAnim("nonla_tip")` (1.5s no-loop) — Lumi tilts the hat in friendly salute.
   - On `nonla_tip` finish: default-to-idle (FR-SCENE-010 automatic).

3. **MUST** set `useLumiStore.setNonlaVisible(true)` on `nonla_appear` start. This flag activates the FR-CHAR-012 hat mesh visibility via the `nonla_visible` custom property. The flag stays `true` for the rest of the cinematic (master plan §3.3b: "nón lá stays on through the footer"). It is reset ONLY on full page reload — NOT on scene-exit, NOT on scroll-back.

4. **MUST** render the **stylized globe** per FR-SCENE-006 globe-spec.md:
   - Geometry: icosahedral sphere subdivided to ~ 6000 triangles (5-subdivision icosphere is 5120 tri; calibrate to hit 6000 ±10%).
   - Material: flat-shaded `meshStandardMaterial` with warm-tint colour `#A36A3F` (brand-brown-200) + `flatShading: true` for the faceted geometric look.
   - NO realistic Earth texture (master plan §3.4 explicit). NO photo-realistic landmasses, oceans, or atmosphere.
   - Position: world centre `[0, 0, 0]`, scaled 1.5 unit radius.
   - Spins via `useFrame`: `globe.rotation.y += deltaTime * 0.15` (slow clockwise from north pole view).

5. **MUST** render the **HCMC Vietnam pin** pulsing in `--accent-flag-red` (`#DA251D`):
   - World position computed from HCMC coordinates (10.776°N, 106.701°E) via lat/lon → sphere-surface mapping. Standard formula: `x = cos(lat) * cos(lon) * R`, `y = sin(lat) * R`, `z = cos(lat) * sin(lon) * R` with R = globe radius.
   - Pin geometry: small cone (radius 0.04, height 0.15) pointing outward (parented to globe rotation so pin rotates with globe).
   - Pulse: shader-driven `uTime` uniform; opacity oscillates 0.6 ↔ 1.0 at 1Hz.

6. **MUST** render **3 destination pins** at NA/EU coordinates per master plan §1.2 `areaServed` list (US/Canada/EU/UK/AU — pick 3 visually balanced):
   - NYC pin (40.71°N, -74.01°E)
   - London pin (51.51°N, -0.13°E)
   - Berlin pin (52.52°N, 13.41°E)
   - Each pin: cone in `--accent-star-yellow` (`#FFEB3B`), same geometry as HCMC pin.

7. **MUST** draw the **HCMC→destination arc** during/after the `nonla_tip` clip:
   - Curve: great-circle path from HCMC to each destination (3 arcs total).
   - Implementation: SLERP between two unit-sphere positions, sampled at 16 points along each arc, fed into a `TubeGeometry`.
   - Shader: progress-driven additive blend, colour gradient from `--brand-gold-400` (`#E8B523`) at HCMC end to `--accent-star-yellow` (`#FFEB3B`) at destination end.
   - Draw timing: arc-draw animation syncs with Scene 5 caption typing (4.0s total reveal).

8. **MUST** include the Scene 5 caption from FR-CMS-002 `scene-5-vietnam-global-primary` verbatim: *"From Sài Gòn to your time zone."* (or the VI variant on /vi route per FR-CMS-007 i18n loader: *"Từ Sài Gòn đến múi giờ của bạn."*)

9. **MUST** include the **time-zone-honesty live-clock widget** per FR-CTA-008. Widget displays:
   - HCMC current time (UTC+7).
   - Visitor's local time (browser `Intl.DateTimeFormat().resolvedOptions().timeZone`).
   - Overlap-hours band ("9am-12pm overlap with US East coast today").
   - Position: bottom-third of viewport, DOM overlay below globe.

10. **MUST** include the **"Why us, why Vietnam" trust signals strip** per master plan §9.2:
    - DUNS 673219568 (linked external to D&B verification URL).
    - Founded 2020.
    - 10 senior engineers (dynamic from FR-CMS-004).
    - 2 active engagements.
    - Time-zone honesty: "Our 9am is your evening tomorrow" tagline.
    - GDPR-ready badge.
    - NDAs standard.
    - Position: DOM overlay below globe, above live clock.

11. **MUST NOT** include any cost-led copy anywhere in Scene 5. Banned words: "cheap", "affordable", "low-cost", "rate", "competitive pricing". CI grep enforces (AC#13). Master plan §1.4 explicit.

12. **MUST** transition camera Scene 4 → 5 over 600ms ease-genie (slightly slower than other transitions; this is the dramatic reveal beat). Camera moves to `[0, 0.2, 6.5]` (pulled back, slightly above horizon to see the globe).

13. **MUST** be SSR-safe + reduced-motion-aware:
    - SSR HTML: caption + trust signals strip + live clock (all DOM, all SSR-rendered) + static webp of the globe with HCMC pin + 3 destination pins + arc visible.
    - Reduced-motion: no globe rotation, no arc draw animation, no pin pulse; trust signals + live clock fully functional.

14. **MUST NOT** introduce a realistic Earth texture, photo of Vietnam, or any nationally-charged imagery beyond the canonical flag-red HCMC pin + yellow star (on the nón lá from FR-CHAR-012). NO Vietnamese flag rendered explicitly; NO dragons; NO áo dài patterns; NO ceremonial imagery. Casual register per FR-CHAR-003 cultural-note.md.

15. **MUST** be reviewed and signed off by the **Founder (Stephen Cheng) for cultural correctness** specifically — this signoff is distinct from designer brand signoff. Sign-off captured in `design/scenes/scene-5-vietnam-global/cultural-review-signoff.md`.

16. **MUST** ship Vitest unit tests for `StylizedGlobe` (tri count ≈ 6000, no Earth texture, spin rate), `HcmcPin` (coords correct, pulses), `DestinationArc` (great-circle path correct, gradient applied), `TrustSignalsStrip` (no cost-led copy, DUNS linked).

17. **MUST** ship Playwright integration tests: `nonla_appear` then `nonla_tip` fires in sequence, nón lá visible after Scene 5 + persists through Scene 6 + footer, arc draws within 4s, trust signals strip + live clock present, no cost-led copy, accent vars NOT visible in Scenes 0-4.

18. **SHOULD** include `?debug=scene-5` overlay showing: nonla_visible state, arc-draw progress, HCMC↔visitor TZ overlap hours.

## §2 — Why this design

**Why a stylized icosahedral globe (not realistic)?** Master plan §3.4: realistic Earth textures (NASA imagery) read as stock / templated. The stylized geometric globe says "we crafted this representation" — coherent with the brand's craft language. The faceted look also tonally matches the warm-cinematic register (realistic globes feel scientific / corporate).

**Why three destination pins (not a globe spinning past many cities)?** Master plan §1.2 areaServed lists US/Canada/EU/UK/AU. Three pins (NYC + London + Berlin) cover the canonical "Western markets" message visually-balanced (one in NA, two in EU). Showing 5+ pins crowds the visual. Showing 1 pin understates the global reach. Three is the calibrated middle.

**Why great-circle SLERP arcs (not parametric Bezier)?** Great-circle paths are the natural shortest-path on a sphere — they LOOK like real flight routes (curved-up over the polar regions, not flat across the surface). Parametric Bezier in 2D would look "drawn-on-a-map" which feels like a printed brochure, not the cinematic register. SLERP between two unit-sphere positions yields true great-circle.

**Why arc-draw synced to caption typing?** Master plan §3.4 Scene 5 art direction: "The arc-draw animation MUST sync with the Scene 5 caption." Visually pairs the words "From Sài Gòn to your time zone" with the arc growing across the globe. The pairing IS the narrative beat — caption + visual say the same thing simultaneously.

**Why the nón lá moment is restricted to Scene 5 entry only?** Master plan §3.3 character table + §3.3b: "Nón lá appears in Scene 5 only; stays on through the footer." The first-time-appearance is what makes it a cultural beat — if Lumi had been wearing the hat in earlier scenes, the reveal would have no emotional charge. FR-CHAR-012 §1 #4 enforces visibility off until Scene 5 sets the store flag.

**Why founder cultural signoff distinct from brand signoff?** Cultural authority is not the same as brand authority. The founder (Stephen Cheng, Trịnh Thái Anh) is Vietnamese; he holds final say on whether the nón lá implementation reads as "casual everyday Vietnamese" vs "exoticised" vs "ceremonial / tourist-coded". Brand designers can approve the visual; only the founder can approve the cultural read. This signoff is mandatory.

**Why ban cost-led copy in Scene 5?** Master plan §1.4 strategy synthesis: "do NOT lead with cost." Scene 5 is where buyers ask "but you're in Vietnam — is this a cost play?" If the trust signals strip says "competitive pricing" or "affordable rates", we've answered "yes, this is a cost play" and the buyer audience moves to the FPT pricing tier in their head. Instead, the strip leads with quality signals (10 senior engineers, time-zone honesty, GDPR-ready, NDAs standard) — answering "no, this is a craft + reach play."

**Why the time-zone live clock?** Master plan §9.2: "time-zone honesty" is a trust signal. Visitors from the US ask "will they be online when I am?" The widget answers concretely with overlap hours computed in real time. It transforms "Vietnam = inconvenient time zone" into "Vietnam = your evening is our morning, here's the overlap window."

## §3 — Deliverable structure

```
apps/web/components/scenes/scene-5-vietnam-global/
├── Scene5VietnamGlobal.tsx         # server re-export
├── Scene5Canvas.tsx                # R3F orchestration
├── StylizedGlobe.tsx               # icosahedral sphere + spin
├── HcmcPin.tsx                     # HCMC pulsing pin
├── DestinationPin.tsx              # NYC / London / Berlin
├── DestinationArc.tsx              # great-circle SLERP + gradient shader
├── TrustSignalsStrip.tsx           # DOM trust signals
├── (FR-CTA-008 owns: TimezoneLiveClock.tsx)
├── scene-5-static.webp             # SSR fallback
└── __tests__/
    ├── scene-5.spec.ts
    ├── stylized-globe.unit.test.ts
    ├── hcmc-pin.unit.test.ts
    └── destination-arc.unit.test.ts

design/scenes/scene-5-vietnam-global/
└── cultural-review-signoff.md      # Founder signoff (mandatory)
```

### §3.2 — `StylizedGlobe.tsx` shape

```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { IcosahedronGeometry, MeshStandardMaterial } from "three";

export function StylizedGlobe() {
  const ref = useRef<any>(null);
  const geom = useMemo(() => new IcosahedronGeometry(1.5, 5), []);   // ~5120 tri at detail 5
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <mesh ref={ref} geometry={geom}>
      <meshStandardMaterial
        color="#A36A3F"          // brand-brown-200
        flatShading
        roughness={0.7}
        metalness={0.15}
      />
    </mesh>
  );
}
```

### §3.3 — `HcmcPin.tsx` + lat/lon → sphere shape

```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, ShaderMaterial } from "three";

const HCMC_LAT = 10.776;
const HCMC_LON = 106.701;
const GLOBE_R = 1.5;

function latLonToVec(lat: number, lon: number, r: number = GLOBE_R) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  return new Vector3(
    Math.cos(phi) * Math.cos(theta) * r,
    Math.sin(phi) * r,
    Math.cos(phi) * Math.sin(theta) * r,
  );
}

export function HcmcPin() {
  const matRef = useRef<ShaderMaterial>(null);
  const pos = useMemo(() => latLonToVec(HCMC_LAT, HCMC_LON), []);
  // Cone points outward — orient so cone tip points along position vector (outward)
  useFrame(({ clock }) => {
    if (matRef.current) {
      const pulse = 0.6 + 0.4 * Math.sin(clock.elapsedTime * 6.28);  // 1 Hz
      matRef.current.uniforms.uAlpha.value = pulse;
    }
  });
  return (
    <mesh position={pos} lookAt={[0, 0, 0]}>
      <coneGeometry args={[0.04, 0.15, 12]} />
      <shaderMaterial
        ref={matRef}
        transparent
        uniforms={{ uAlpha: { value: 1 } }}
        vertexShader={`varying float vY; void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={`uniform float uAlpha; void main() { gl_FragColor = vec4(0.855, 0.145, 0.114, uAlpha); }`}  // #DA251D
      />
    </mesh>
  );
}

export { latLonToVec };  // re-used by DestinationPin + DestinationArc
```

### §3.4 — `DestinationArc.tsx` — great-circle SLERP shape

```tsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, CatmullRomCurve3, TubeGeometry, ShaderMaterial, AdditiveBlending } from "three";
import { useSceneProgress } from "@/lib/stores";
import { latLonToVec } from "./HcmcPin";

const ARC_VERT = `varying float vSeg; attribute float aSeg;
void main() { vSeg = aSeg; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ARC_FRAG = `varying float vSeg; uniform float uDrawProgress;
uniform vec3 uColorStart; uniform vec3 uColorEnd;
void main() {
  if (vSeg > uDrawProgress) discard;
  vec3 c = mix(uColorStart, uColorEnd, vSeg);
  gl_FragColor = vec4(c, 0.9);
}`;

function slerpGreatCircle(a: Vector3, b: Vector3, samples: number = 16, arcLift: number = 0.35): Vector3[] {
  const omega = Math.acos(a.clone().normalize().dot(b.clone().normalize()));
  const sinOmega = Math.sin(omega);
  const points: Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    // Standard SLERP
    const factorA = Math.sin((1 - t) * omega) / sinOmega;
    const factorB = Math.sin(t * omega) / sinOmega;
    const p = a.clone().multiplyScalar(factorA).add(b.clone().multiplyScalar(factorB));
    // Lift arc above globe surface (great-circle on sphere with bulge)
    const elevation = 1 + arcLift * Math.sin(t * Math.PI);
    p.normalize().multiplyScalar(p.length() * elevation);
    points.push(p);
  }
  return points;
}

export function DestinationArc({ fromLatLon, toLatLon, delayOffset = 0 }: {
  fromLatLon: [number, number];
  toLatLon: [number, number];
  delayOffset?: number;
}) {
  const matRef = useRef<ShaderMaterial>(null);
  const progress = useSceneProgress();
  const geom = useMemo(() => {
    const start = latLonToVec(...fromLatLon);
    const end = latLonToVec(...toLatLon);
    const pts = slerpGreatCircle(start, end);
    const curve = new CatmullRomCurve3(pts);
    return new TubeGeometry(curve, 64, 0.015, 8, false);
  }, [fromLatLon, toLatLon]);

  useFrame(() => {
    if (!matRef.current) return;
    const local = Math.max(0, (progress - 0.4 - delayOffset) / 0.4);  // [0.4 .. 0.8]
    matRef.current.uniforms.uDrawProgress.value = Math.min(1, local);
  });

  return (
    <mesh geometry={geom}>
      <shaderMaterial
        ref={matRef}
        vertexShader={ARC_VERT}
        fragmentShader={ARC_FRAG}
        transparent depthWrite={false} blending={AdditiveBlending}
        uniforms={{
          uDrawProgress: { value: 0 },
          uColorStart: { value: new Vector3(0.910, 0.710, 0.137) },   // #E8B523 gold-400
          uColorEnd:   { value: new Vector3(1.000, 0.922, 0.231) },   // #FFEB3B star-yellow
        }}
      />
    </mesh>
  );
}
```

### §3.5 — `TrustSignalsStrip.tsx` shape

```tsx
"use client";
export function TrustSignalsStrip() {
  return (
    <aside className="trust-signals-strip absolute bottom-32 left-0 right-0 px-8" aria-label="Trust signals">
      <ul className="flex flex-wrap gap-6 justify-center font-mono text-sm text-[var(--brand-gold-100)]">
        <li><a href="https://www.dnb.com/business-directory/company-profiles/cyberskill.673219568" rel="external">D-U-N-S 673219568</a></li>
        <li>Founded 2020</li>
        <li>10 senior engineers</li>
        <li>2 active engagements</li>
        <li>GDPR-ready</li>
        <li>NDAs standard</li>
      </ul>
      <p className="text-center mt-3 text-xs text-[var(--brand-gold-200)] opacity-80">
        Our 9am is your evening tomorrow.
      </p>
    </aside>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Scene mounts via SceneTunnel id="scene-5-vietnam-global"; data-scene="scene-5" attribute set | Vitest + Playwright DOM check |
| 2 | `nonla_appear` fires on scene-enter | Playwright eval `currentAnim === "nonla_appear"` |
| 3 | `nonla_tip` follows `nonla_appear` (mixer.finished listener) | Playwright wait 1.2s + check anim transition |
| 4 | `useLumiStore.nonlaVisible === true` after nonla_appear | Playwright store eval |
| 5 | Nón lá persists through Scene 6 + footer | Scroll to footer; assert nonlaVisible still true |
| 6 | Stylized globe geometry ≈ 6000 tri | R3F dev panel mesh inspection |
| 7 | No realistic Earth texture | Static analysis: no PNG/JPG texture imports in StylizedGlobe |
| 8 | HCMC pin at correct world coords (10.776°N, 106.701°E) | Pin position match within 0.01 unit |
| 9 | HCMC pin pulses red (#DA251D) at ~1Hz | Pixel-sample + temporal-diff at pin coord |
| 10 | 3 destination pins (NYC, London, Berlin) at correct coords | Pin position check |
| 11 | Arc draws gold-400 → star-yellow gradient | Pixel sample at arc midpoint + endpoint |
| 12 | Arc-draw syncs with caption typing (~4s) | Frame-diff timing |
| 13 | NO cost-led copy: grep returns 0 | `grep -iE 'cheap\|affordable\|low.cost\|rate' apps/web/components/scenes/scene-5-vietnam-global/` |
| 14 | Trust signals strip DOM-rendered + accessible | a11y tree |
| 15 | DUNS 673219568 linked externally | DOM check on `<a>` href |
| 16 | Time-zone live clock present + functional | FR-CTA-008 integration test |
| 17 | data-scene-5 scope active in Scene 5; inactive in 0-4 | Computed-style check on `--accent-flag-red` |
| 18 | Reduced-motion: globe static; arc fully visible; pins static | Playwright reducedMotion ctx |
| 19 | SSR HTML contains caption + trust signals + static globe webp | curl + grep |
| 20 | Founder cultural signoff archived | File existence: `design/scenes/scene-5-vietnam-global/cultural-review-signoff.md` |
| 21 | Camera transition Scene 4 → 5 = 600ms ease-genie | Frame-diff |
| 22 | Disposes globe + pins + arcs on unmount | Vitest |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("nonla_appear → nonla_tip sequence", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5));
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim)).toBe("nonla_appear");
  await page.waitForTimeout(1100);  // 1.0s + buffer
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.currentAnim)).toBe("nonla_tip");
});

test("nón lá persists through footer", async ({ page }) => {
  await page.goto("/");
  // Scroll into Scene 5 to activate
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5));
  await page.waitForTimeout(2500);
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.nonlaVisible)).toBe(true);
  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as any).__stores?.lumi?.nonlaVisible)).toBe(true);
});

test("no cost-led copy in Scene 5 component", async () => {
  const { readFileSync } = await import("fs");
  const { glob } = await import("glob");
  const files = await glob("apps/web/components/scenes/scene-5-vietnam-global/*.{tsx,ts}");
  for (const f of files) {
    const txt = readFileSync(f, "utf8").toLowerCase();
    expect(txt).not.toMatch(/cheap|affordable|low.?cost|competitive pricing|\brate\b/);
  }
});

test("Founder cultural signoff archived", async () => {
  const { existsSync } = await import("fs");
  expect(existsSync("design/scenes/scene-5-vietnam-global/cultural-review-signoff.md")).toBe(true);
});

test("HCMC pin world position correct", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5));
  const pos = await page.evaluate(() => (window as any).__sceneDebug?.hcmcPinWorldPos);
  // Expected: latLonToVec(10.776, 106.701, 1.5) ≈ [-0.421, 0.280, 1.412]
  expect(Math.abs(pos.x - (-0.421))).toBeLessThan(0.01);
});

test("accent vars NOT visible outside Scene 5", async ({ page }) => {
  await page.goto("/");
  // Scene 3 (no accent scope)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3));
  const accent3 = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("--accent-flag-red")
  );
  expect(accent3.trim()).toBe("");
  // Scene 5 (accent scope active)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5));
  const accent5 = await page.evaluate(() =>
    getComputedStyle(document.querySelector('[data-scene="scene-5"]')!).getPropertyValue("--accent-flag-red")
  );
  expect(accent5.trim()).toBe("#DA251D");
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-006 (Scene 5 comp + globe-spec.md + arc-spec.md), FR-CHAR-011 (`nonla_appear` + `nonla_tip` clips), FR-CHAR-012 (nón lá mesh + `nonla_visible` toggle), FR-CMS-002 (caption), FR-DS-005 (accent token scope).

**Operational:** FR-WEB-003, FR-WEB-004, FR-DS-006, FR-A11Y-001, FR-CTA-008 (live clock), FR-CMS-007 (i18n loader for VI variant), FR-CMS-004 (trust-signal data from Sanity).

**Downstream:** FR-SCENE-018 (Scene 6 — nón lá must persist), FR-SCENE-019 (footer — nón lá in corner avatar), FR-SCENE-020 (orchestrator).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Nón lá renders before Scene 5 (cultural-arc break) | Cross-FR audit: Scenes 0-4 snapshot test; `nonlaVisible` must be `false` at scenes 0-4 | FR-CHAR-012 §1 #4 `nonla_visible` defaults false; only Scene 5 sets it true |
| `nonla_appear` doesn't transition to `nonla_tip` | AC#3 | Verify mixer.finished listener in FR-SCENE-010 picker fires on Scene 5 clip context |
| Globe renders with realistic Earth texture | AC#7 + visual review | Strip texture imports; FR-SCENE-006 spec requires flat-shaded |
| HCMC coord wrong (lat/lon swapped) | AC#8 | Use lat=10.776, lon=106.701 in latLonToVec; northern + eastern hemisphere |
| Arc misses destination pin | AC#11 + visual | Verify SLERP samples end at target pin world coord exactly |
| Arc draws all-at-once (uDrawProgress not animating) | AC#12 | Verify useFrame uniform update bound to scene progress |
| Cost-led copy slipped in (developer "competitive pricing" temptation) | AC#13 grep | Reject PR; master plan §1.4 forbids; trust signals strip stays quality-led |
| Trust signals strip displays inflated certifications (ISO 27001 / SOC 2) | Cross-ref FR-SEO-001 | Strip aspirational; trust signals strip MUST match FR-SEO-001 Schema.org claims |
| Founder cultural signoff missing | AC#20 | Schedule founder review; do NOT ship Scene 5 without signoff |
| Accent vars leak to Scene 4 or earlier | AC#17 | Verify `data-scene="scene-5"` attribute is scoped per-scene; FR-DS-005 cascade rule |
| Time-zone clock shows wrong overlap (DST drift) | FR-CTA-008 manual QA | Test on both DST shoulder dates; use `Intl.DateTimeFormat` with timeZone option |
| Reduced-motion still spins globe | AC#18 | Early-return useFrame globe rotation under reducedMotion |
| Memory leak: globe + 4 pins + 3 arcs not disposed | AC#22 Vitest | disposeSubtree on all meshes + materials |
| Vietnamese caption diacritics corrupted (UTF-8) | AC#19 SSR HTML inspection | Verify FR-CMS-007 i18n loader emits UTF-8; build pipeline preserves NFC normalisation |
| Globe lookat / orientation off | Visual review | Camera at [0, 0.2, 6.5]; globe at world origin; HCMC pin visible at scene-enter |
| 4th destination pin added (scope creep) | AC#10 count | Cap at 3 pins; visual balance requires odd count NA/EU split |

## §8 — Deliverable preview

After shipping, scrolling from Scene 4 into Scene 5:
1. Camera pulls back + tilts up (600ms slower than other transitions — dramatic reveal).
2. Background transitions to a warmer brown variant.
3. Globe fades in centred; starts spinning slowly clockwise.
4. HCMC pin appears + pulses red at 1Hz.
5. Lumi crossfades idle → `nonla_appear`: red nón lá with yellow star fades onto hat_socket bone over 1.0s.
6. At nonla_appear finish (mixer.finished): `nonla_tip` plays — Lumi tilts hat forward in friendly salute over 1.5s.
7. During `nonla_tip` + after: 3 destination pins fade in (NYC, London, Berlin).
8. 3 great-circle arcs draw from HCMC to each destination, gold-400 → star-yellow gradient, sync'd to caption typing.
9. Caption types: "From Sài Gòn to your time zone." (or VI variant).
10. Below globe: trust signals strip + time-zone live clock fade in.
11. After clip ends: Lumi returns to idle. nón lá stays on (forever, until page reload).
12. User scrolls; Scene 6 takes over — nón lá visible in Lumi at Scene 6 CTA Hub.
13. User scrolls to footer; Lumi corner avatar still wearing the nón lá.

Reduced-motion: globe static + pins + arcs fully visible (no draw animation); nón lá appears instantly without `nonla_appear` clip; trust signals + live clock fully functional.

## §9 — Notes

**On the founder cultural signoff:** This is non-negotiable. The founder is the only person on the team with the cultural authority to approve / reject the nón lá moment. The signoff file MUST exist before Scene 5 ships. If the founder is unavailable, Scene 5 ships behind a feature flag and Lumi continues without the nón lá until signoff is captured.

**On lat/lon precision:** HCMC = 10.776°N, 106.701°E is the canonical center-of-city coordinate. NYC = 40.71°N, -74.01°E. London = 51.51°N, -0.13°E. Berlin = 52.52°N, 13.41°E. Future amendments to areaServed list trigger new pin positions.

**On the time-zone clock UX:** Visitors in a TZ with no overlap with HCMC business hours (e.g. west coast US in winter, where the overlap is 8pm-11pm visitor time) MIGHT find the widget alarming ("there's no overlap!"). FR-CTA-008 §1 #5 specifies a fallback message: "Your evening reaches our morning — pick a slot, we'll meet you there." Tested in cross-browser smoke.

**On `data-scene-5` vs `data-scene="scene-5"` attribute naming:** FR-DS-005 §1 #2 specifies `[data-scene="scene-5"]` selector. Hyphenated value, not standalone attribute. The scene's wrapper section uses `data-scene="scene-5"` exactly. Lint rule enforces.

**On future cultural-arc extensions:** Tết / Mid-Autumn / Vietnamese National Day variants of the nón lá are FR-OPS-007 Recipe G Easter-egg variants — they swap the texture but keep the hat geometry. Out of scope for slice 1; founder cultural signoff required per variant.

*End of FR-SCENE-017.*
