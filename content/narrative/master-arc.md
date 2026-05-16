# Master Narrative Arc — CyberSkill Landing Page

**Status:** v1.0.0 — adopted with FR-CMS-001 signoff, 2026-05-16
**Owner:** Stephen Cheng (founder, creative director)
**Companion files:** [`voice-rules.md`](./voice-rules.md), [`scene-defs.json`](./scene-defs.json), [`lines/en.json`](./lines/en.json), [`lines/vi.json`](./lines/vi.json)

The 18-week marketing site delivers a Pixar-style three-act compressed into 7 scroll-driven scenes (~ 9 viewport heights, ~ 90 s of dwell at average scroll cadence) anchored by **Lumi the Golden Genie** — a 3D character born from the CyberSkill logo.

---

## §1 — Messaging hierarchy

### Master proposition

> *"We turn your will into real software — small senior team, global craft, Vietnamese roots."*

### Audience-specific proof points

| Audience | Proof points |
|---|---|
| **NA/EU enterprise & SMB buyers** | 10 senior-only engineers · founded 2020 · DUNS 673219568 · 2 active long-term enterprise engagements · time-zone-honest · GDPR-ready |
| **Tech partners / agencies** | White-label friendly · React / Three.js / AI specialisation · design-system-native (we ship with our own DS, not Bootstrap) |
| **Talent / recruits** | Remote-first · craft-first culture · senior peers · founder-accessible |

### Tone

Confident, warm, slightly mythic in narration; precise and quantitative in proof. Lumi narrates emotionally; the page text proves rationally.

---

## §2 — The 7-scene arc (3-act compression)

### Act 1 — Setup (Scenes 0 + 1)

We hook the visitor with the master question, then earn the relationship by revealing the human origin behind the brand.

| Scene | Title | Beat |
|---|---|---|
| 0 Hero | "What if your will became real?" | Curiosity |
| 1 Origin | "Saigon, 2020." | Empathy |

### Act 2 — Confrontation (Scenes 2 + 3 + 4)

We answer "what do you do?", "how do you do it?", and "who is this we?" — in that order — closing the trust loop.

| Scene | Title | Beat |
|---|---|---|
| 2 Transformation | "From sketch to system." | Wonder |
| 3 Capabilities | "How we turn will into real." | Confidence |
| 4 Team | "Ten people. One craft." | Trust / warmth |

### Act 3 — Resolution (Scenes 5 + 6 + Footer)

We address the elephant ("but you're in Vietnam") with pride, fork the visitor into one of three CTAs, and close with persistent trust signals.

| Scene | Title | Beat |
|---|---|---|
| 5 Vietnam → Global | "From Sài Gòn to your time zone." | Pride / scale-readiness |
| 6 CTA Hub | "What do you want to make real?" | Decision |
| Footer | Trust signals + secondary nav | Closure |

Full structural data: [`scene-defs.json`](./scene-defs.json). Verbatim narration lines: [`lines/en.json`](./lines/en.json) + [`lines/vi.json`](./lines/vi.json).

---

## §3 — Scroll-jacking ethics (master plan §2.3)

Scenes are **scroll-LINKED**, never **scroll-HIJACKED**. The user always controls progress.

- Lenis smooths; GSAP ScrollTrigger reads progress; the user's wheel/trackpad delta directly drives `scroll.progress`.
- Always-visible **Skip story** pill (top-right) jumps directly to Scene 6 (CTA Hub).
- `prefers-reduced-motion` → 7-panel SVG storyboard fallback at `/lite` (FR-A11Y-001).
- Skip-3D toggle in header → `/lite` redirect, persisted in localStorage.

---

## §4 — Localisation hooks

- Every narration line in `i18n/{en,vi}.json` (FR-CMS-007 builds the loader).
- Scene structure (`scene-defs.json`) is locale-independent — only line text varies.
- `<link rel="alternate" hreflang>` for both en + vi + x-default (FR-CMS-008).
- Vietnamese register slightly more poetic per `voice-rules.md` §5; FR-CMS-003 owns the VI variants.

---

## §5 — Skip-story anchor

`<a href="#cta-hub">Skip story</a>` — top-right corner, every breakpoint, every scene. WCAG 2.3.3 + master plan §7.3 mandate; FR-A11Y-003 implements.

---

## §A — Tone reference appendix

(Lifted from `voice-rules.md` §6 — kept here for Copywriter convenience.)

### Acceptable Lumi voice

- "Whisper an idea. I'll show you the rest."
- "Most software dies in the gap between sketch and ship. We close it."
- "From Sài Gòn to your time zone."

### Would fail audit

- ~~"Let's synergize your vision into reality!"~~
- ~~"World-class Vietnamese developers ready to leverage AI for your roadmap."~~
- ~~"We at CyberSkill are passionate about cutting-edge solutions 🚀"~~

---

*End of master arc. Lock at signoff; amendments via FR-CMS-NNN-narrative-revision-N successor FRs per AGENTS.md §16.2.*
