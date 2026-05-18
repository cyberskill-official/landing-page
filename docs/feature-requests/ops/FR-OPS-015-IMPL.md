---
id: FR-OPS-015
title: "Awards submission packet — Awwwards / FWA / CSSDA with cultural-narrative description, within 2 weeks of launch"
module: OPS
priority: SHOULD
status: blocked
blocked_reason: "Submission packet and credits draft are ready; public launch URL, production captures, and actual award submission IDs are pending."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Founder + Designer + Marketing
created: 2026-05-16
related_frs: [FR-OPS-014, FR-SCENE-017, FR-CHAR-003, FR-SCENE-019, FR-SCENE-024]
depends_on: [FR-OPS-014]
blocks: []
language: documentation + media production
service: docs/launch/
new_files:
  - docs/launch/awards-submission-packet.md
  - docs/launch/awards-media/hero-1920x1080.jpg
  - docs/launch/awards-media/screencap-30s.mp4
  - docs/launch/awards-credits.md

source_pages:
  - docs/01-master-plan-v2.md §10 P6 + §13 (awards strategy)
  - Awwwards / FWA / CSSDA submission guidelines

effort_hours: 4
risk_if_skipped: "Awards = compounding credibility. SOTY (Site of the Year) winners get ~10× organic traffic spike. Without packet ready at launch, miss fresh-launch window."
---

## §1 — Description (BCP-14 normative)

1. **MUST** prepare submission docs:
   - **Hero screenshots:** 1920×1080 JPG ≥ 3 angles (Scene 0, 5, 6).
   - **30s screen-capture video:** MP4 h.264 1080p.
   - **Tech stack list:** Next 15, R3F, Three.js, Sanity, Blender, etc.
   - **Cultural narrative:** ~300 words — Vietnamese studio + Lumi/nón lá story (founder voice).
   - **Team credits:** contributors + roles + links.
2. **MUST** submit to all 3:
   - **Awwwards** (SotD → SotM → SOTY nomination).
   - **FWA** (FWA of the Day → FWA of the Year).
   - **CSSDA** (SotD → Special Kudos).
3. **MUST** cultural-narrative for jury — "why" behind Vietnamese cultural anchor (FR-SCENE-017, FR-CHAR-003 casual nón lá).
4. **MUST** screen-cap shows: Scene 0 → 5 transition + Scene 6 CTA + Easter egg (FR-SCENE-024).
5. **MUST** submit within **2 weeks** of public launch (freshness bonus).
6. **MUST** archive at `docs/launch/awards-submission-packet.md`.
7. **MUST NOT** falsify claims (perf metrics, team size). Honesty matters.

## §2 — Why this design

**Why awards?** Credibility + traffic spike + recruiting signal.

**Why all 3?** Different jury demographics — Awwwards (designers), FWA (creative dev), CSSDA (front-end). Hedge.

**Why cultural narrative?** Differentiates from generic submissions. Vietnamese cultural anchor = jury memorable.

**Why 30s screen-cap?** Jury attention is 30 seconds.

**Why within 2 weeks?** Freshness bonus in jury weighting.

**Why no falsification?** Reputation. Tech audience catches lies.

## §3 — Public surface

```markdown
<!-- docs/launch/awards-submission-packet.md -->
# Awards submission packet — CyberSkill.world

## Site URL
https://cyberskill.world

## Tagline
EN: Turn Your Will Into Real
VI: Vì ánh sáng biến nguyện ước thành sự thật

## Cultural narrative (~300 words)
CyberSkill is a Vietnamese software studio founded 2020 in HCMC. We built our site as a cinematic 8-scene journey — not because every project needs Three.js, but because our brand is about bridging Vietnamese cultural roots and global technical craft.

Anchored by Lumi, a golden genie wearing a casual nón lá (not ceremonial). Lumi accompanies the visitor through a story arc: Saigon rooftop at dusk → wish formation → prototyping → team silhouettes → globe rotating from Vietnam outward → CTA hub respecting the visitor.

Cultural choices to flag:
1. **Casual nón lá** — not the áo dài + ceremonial nón lá pairing of Vietnamese tourism. Visual register: "neighborhood Saigon," not "imperial Hue."
2. **Vietnamese tagline reveal** — "vì ánh sáng biến nguyện ước thành sự thật" appears on hover, even for English visitors. Quiet acknowledgment of Vietnamese imagination.

Performance + a11y as design dimensions: ≤ 1.5s LCP, ≤ 200ms INP, WCAG 2.2 AA, /lite no-3D variant.

## Tech stack
Next 15, React 19, Three.js + R3F + Drei, scroll-rig, GSAP 3 + Lenis, Zustand, Sanity, Vercel, Substance Painter, Blender 4.x, glTF-Transform.

## Team
- Founder + Creative Director: Stephen Cheng / Trịnh Thái Anh
- 3D Lead, Frontend Lead, Designer, Backend Lead, A11Y Lead.

## Hero screenshots
- awards-media/hero-scene0-1920x1080.jpg
- awards-media/hero-scene5-1920x1080.jpg
- awards-media/hero-scene6-1920x1080.jpg

## 30s screencap
awards-media/screencap-30s.mp4

## Verifiable metrics
Lighthouse mobile: 92 Perf / 100 a11y / 100 SEO / 100 BP
LCP 1.4s | INP 120ms | CLS 0.05 | WCAG 2.2 AA full
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Submission packet present | File |
| 2 | 3 hero screenshots 1920×1080 | identify |
| 3 | 30s screencap MP4 | ffprobe |
| 4 | Cultural narrative ~300 words | wc -w |
| 5 | Team credits document | File |
| 6 | Submitted to Awwwards | Submission ID |
| 7 | Submitted to FWA | Submission ID |
| 8 | Submitted to CSSDA | Submission ID |
| 9 | All 3 within 2 weeks of launch | Date check |
| 10 | No falsified claims | Founder review |

## §5 — Verification

```bash
identify docs/launch/awards-media/hero-*.jpg | awk '{print $3}'
# Expected: 1920x1080

ffprobe -v error -show_entries format=duration -of csv=p=0 docs/launch/awards-media/screencap-30s.mp4
# Expected: ~30

wc -w docs/launch/awards-submission-packet.md
```

## §6 — Dependencies

**Concept:** FR-OPS-014 (live URL), FR-SCENE-017 (cultural anchor), FR-CHAR-003 (cultural-note), FR-SCENE-019 (avatar in screencap), FR-SCENE-024 (Easter egg in screencap).

**Operational:** Screen-cap tool (QuickTime / OBS), video editor, submission portals.

**Downstream:** Partner-pipeline conversion lift; recruiting credibility.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Submission rejected | Jury feedback | Iterate; resubmit next cycle |
| Hero shot not striking | Visual review | Re-shoot |
| Video too long/short | ffprobe | 28-32s acceptable |
| Cultural narrative reads boring | Founder rewrite | Storytelling pass |
| Submitted late | Date check | Live with freshness penalty |
| Perf claims fail verification | Cite Lighthouse | Document precise conditions |
| Cultural reference mis-step | FR-CHAR-003 vet | Founder cultural review |
| Submission fees not budgeted | Awards cost | $55 total budgeted |
| Site down during jury visit | Uptime | FR-OPS-014 stability |
| Mobile judged separately | Mobile screens | Add 414×896 variants |
| Vietnam-anchored story confuses foreign jury | Narrative clarity | Founder reviews tone |
| Outside vendor (audio?) not credited | Audit credits | Include all contributors |

## §8 — Deliverable preview

Day +1 of launch:
- Founder records 30s screencap.
- Designer captures hero screenshots at canonical camera positions.
- Founder writes cultural narrative; native reviewer signoff.

Day +14:
- All 3 awards submitted; IDs archived.
- Wait for jury (Awwwards ~1 week, FWA ~2, CSSDA ~3).

## §9 — Notes

**On submission cost:** Awwwards $25 + FWA free + CSSDA $30 = $55 budgeted.

**On Vietnamese awards:** Could submit to local Vietnam tech awards. Slice 3 if exists.

**On SOTY:** Awwwards SOTY voted in December. Plan separate year-end submission.

*End of FR-OPS-015.*
