# Research Foundations for the CyberSkill Interactive Storytelling Landing Page (PRD + SRS Basis)

## TL;DR
- **Build a Next.js (App Router) + React Three Fiber + GSAP/ScrollTrigger + Lenis storytelling site, with the Golden Genie as a scroll-driven, gaze-tracking glTF character that becomes an Anthropic Claude–powered chat persona, proxied through a serverless backend that never exposes the API key — deployed on Vercel.** This satisfies lead-gen-first, portfolio, and recruiting goals simultaneously while keeping Core Web Vitals defensible via progressive enhancement.
- **The existing `cyberskill-official/design-system` repo is a doctrine-first system (a single ~1.3MB `DESIGN.md`, v1.3.0), NOT a ready-to-install component library.** Its implementation packages (`@cyberskill/tokens`, `@cyberskill/react`, `@cyberskill/style-packs`) are documented but were not found published to public npm — so the build will inherit *design tokens and rules* (Umber `#45210E`, Ochre `#F4BA17`, Vietnamese-first, APCA Lc≥75, Liquid Glass) but must implement components from scratch.
- **The single biggest risk is the tension between an immersive 3D/animated experience and lead-gen conversion + SEO.** Resolve it with HTML-first server rendering, a mobile static fallback for the 3D scene, `prefers-reduced-motion` paths, and a persistent, low-friction CTA + conversational lead capture — treat the Genie as enhancement layered on a fast, crawlable base, never as the base itself.

---

## A. Design System Repo Analysis

**Repository:** `github.com/cyberskill-official/design-system` — public, ~27 commits, languages JavaScript 51% / CSS 48% / HTML 0.9%, currently **v1.3.0 (2026-06-13)**, audit tier "L3 — enterprise-grade," combined audit score 80.3%.

### What it actually is
This is a **"single-file doctrine" design system**, not a conventional component library. The canonical shipping artifact is **three Markdown files at the repo root**:
- `DESIGN.md` — ~1.3 MB single source of truth, **22 Parts**, decimal-numbered (e.g., §5.7). This is the doctrine.
- `README.md` — the operating manual (governance, RFC process, distribution).
- `CHANGELOG.md` — version history (Keep a Changelog format).

The README explicitly states everything else (`tokens/`, `packages/`, `src/`) is **"local-only working state, gitignored, and regenerable"** and marked "(optional) … when shipped" / "(when present)." Distribution rule: "downstream projects copy only the three top-level files."

### Verified gap (critical for the SRS)
A targeted verification pass could **not confirm that the implementation packages are published to public npm.** Searches surfaced only **`@cyberskill/shared` (v2.27.0)** — and that package lives under a *different* GitHub org (`cyberskill-world`), not `cyberskill-official`. The packages the README references in code examples — `@cyberskill/tokens`, `@cyberskill/react` (with `glass.css`), `@cyberskill/style-packs` — did **not** appear in public npm indexing. **Practical implication: treat the design system as a source of tokens, rules, and visual doctrine, not as an installable React component dependency.** The PRD should budget for building the actual components (Button, TextField, Dialog, etc.) in-repo, themed to the doctrine, and should add a task to *confirm with CyberSkill whether a private npm registry / GitHub Packages feed exists* before assuming `@cyberskill/react` is consumable.

### What a developer concretely inherits (from the doctrine)
**Anchor immutables (must not be changed without a v2.0.0 RFC):**
- **Slogan:** EN "Turn Your Will Into Real" / VN "Hiện Thực Hoá Ý Chí."
- **Primary brand color — Umber:** `oklch(0.265 0.073 44.3)` / `#45210E` / `color(display-p3 0.265 0.13 0.06)`.
- **Primary accent — Ochre:** `oklch(0.811 0.162 83.7)` / `#F4BA17` / `color(display-p3 0.95 0.74 0.13)`.
- **Voice axes:** warm · direct · honest · respectful (all four simultaneously — "a chord, not a slider").
- **Vietnamese-first commitment:** every UI string ships a VN counterpart or an explicit deferral note.
- **APCA contrast floor:** Lc ≥ 75 for body text, Lc ≥ 90 for interactive elements (measured at the rendered translucent state for glass surfaces).

**Theming / surface approach:** Default surface treatment is **"Liquid Glass" (Part 21)**, five materials (Whisper / Light / Standard / Heavy / Solid), shipped in code as `--cs-glass-*` / `--cs-depth-*` tokens plus a `glass.css`, applied opt-in via `.cs-surface-whisper|light|standard|heavy|solid` classes (and a `.cs-glass-card` alias). It collapses back to solid surfaces under `prefers-reduced-transparency`, `forced-colors`, `@media print`, and `@supports not (backdrop-filter)`. Theming uses `data-theme="light|dark"` (light is the default) and `data-cs-style="<id>"` for 50 separately-stored "Style Packs." Token build is via **Style Dictionary**, DTCG-format, with stated multi-platform output (CSS/TS/Swift/Kotlin/Flutter/Figma). Dark mode IS supported via the theme attribute.

**Other inheritable rules:** WCAG 2.2 AA is the explicit floor; tokens must inherit from the anchors (no magic hex like hardcoded `#45210E` — use `cs-color-brand-umber`); per-project freedom to override themes/density/typography and compose new components, but not to modify Tier-1 component behavior or voice without an RFC. The repo is "MCP-native" and `AGENTS.md`/`CLAUDE.md`-aware — relevant because the build will happen in Claude CoWork.

### Gaps the storytelling site must fill
The doctrine covers brand, tokens, accessibility, content, and governance, but contains **nothing about animation choreography, 3D/WebGL, scroll storytelling, or a conversational character.** All motion design, the Genie 3D pipeline, scroll sequencing, and the chat system are net-new and should be authored as an extension layer (likely a new "Part 23 — Storytelling & Motion" RFC if CyberSkill wants it folded back into the doctrine, or kept project-local). Because there's no shipped component library to confirm, the SRS must also specify the actual UI primitives.

---

## B. Scroll-Driven 3D Storytelling Reference (motionsites.ai style)

Note on the source: `motionsites.ai` is itself a **paid library of AI prompts and animated hero-section templates** (one-time deal, ~$29–$199 founding price), not an engineering reference. Its public gallery showcases the *aesthetic* — agency, SaaS, portfolio, fintech, automotive, Web3 hero concepts — and its distributed example prompts target "a full-screen React hero, Tailwind CSS v4 styling, background video." Treat it as mood/aesthetic inspiration; the engineering patterns below come from production studios (Codrops, 14islands, Active Theory–class work).

### Common techniques & "feel"
- **Smooth/inertia scroll** as the backbone (Lenis) so motion feels continuous, not stepped.
- **Scroll-triggered + pinned ("sticky") sections** where a section locks and its content animates against scroll progress (GSAP ScrollTrigger `pin: true`, `scrub`).
- **3D scenes tied to scroll progress** — a fixed full-viewport canvas behind the DOM; each section's normalized progress (0→1) drives camera moves, model rotation, morph targets, lighting. A common pattern: one camera animation clip with one keyframe per "shot," indexed by section.
- **Parallax / layered depth**, staggered text reveals (SplitText), mask/clip-path reveals, marquees, and choreographed page transitions.
- **Section-by-section narrative reveal** ("scrollytelling 2.0") — the page is a guided story, not a wall of content.
- Pacing discipline (Active Theory, Uncommon, Epic cited as exemplars): know when to do a full-screen takeover vs. a subtle hover; animations create *anticipation* and reveal information "at the perfect moment."

### Dominant 2026 tech stack (with current versions and roles)
| Library | Role | 2026 status / version |
|---|---|---|
| **GSAP + ScrollTrigger** | The de-facto scroll-animation engine; timeline sequencing, pin, scrub, SplitText, MorphSVG | **Now 100% free including all former Club plugins** (Webflow-sponsored, v3.13 release; npm shows 3.15 line). Standard license covers commercial use. `@gsap/react` exposes the `useGSAP()` hook for safe React cleanup. **ScrollSmoother is now free too** (was previously Club-only). |
| **Lenis** (`lenis`, `lenis/react`) | Smooth/inertia scroll that does NOT break `position: sticky` or Intersection Observers | Actively maintained (1.3.x line, e.g. 1.3.23). Use `lenis/react`'s `ReactLenis`; drive it from GSAP's ticker with `autoRaf: false`. Replaces the older `@studio-freight/react-lenis`. |
| **Three.js** | Core WebGL/WebGPU engine | Actively developed; has transitioned to a `WebGPURenderer` with WebGL fallback. Core is ~600KB minified before scene code. |
| **React Three Fiber (R3F)** | React renderer for Three.js | v9.x, aligned with React 19; the idiomatic way to build the scene declaratively in a React/Next app. |
| **@react-three/drei** | R3F helper library | Provides `useGLTF`, `useAnimations`, `ScrollControls`/`useScroll`, `Environment`, `Lod`, loaders, controls — eliminates boilerplate. |
| **Framer Motion / "Motion"** | DOM/UI micro-animations, gestures, layout & exit animations, declarative React | Now shipped as `motion` (~8KB footprint), strong Next.js SSR support. Best for UI chrome, not the 3D scene. |
| **Lottie** | Lightweight vector animations exported from After Effects | Good for icon/illustration motion without WebGL cost. |
| **Theatre.js** | Visual timeline/sequence editor that records keyframes to JSON; pairs with Three.js for cinematic scroll sequences | Powerful but niche/experimental; visual "director" for complex 3D paths. Optional. |
| **WebGL shaders (GLSL)** | Custom material/visual effects (glow, dissolve, particles) | Used for the "magic" golden-genie glow, smoke/particle effects. |

**How they fit together (the canonical RAF loop):** Lenis owns smooth scroll; GSAP's ticker drives Lenis's `raf()` (`gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`); ScrollTrigger updates on Lenis's scroll event; R3F's `useFrame`/`useScroll` (or a ScrollTrigger `onUpdate` writing section progress) drives the 3D scene each frame. A single fixed canvas renders the whole story so assets load once.

---

## C. 3D Character (Genie) Implementation

### Format & animation
- **Use glTF/GLB** — the only widely supported web 3D format with native skeletal animation, morph targets, and named animation clips (translation/rotation/scale channels; linear/step/cubic-spline interpolation).
- **Generate a typed React component from the model** with **gltfjsx**: `npx gltfjsx genie.glb -o Genie.tsx --types --transform` (the `--transform` flag also compresses, resizes textures, dedupes, and prunes).
- **Animation playback/blending:** load with `useGLTF`, drive clips with drei's `useAnimations` hook, which exposes named actions; cross-fade between states with the Three.js `AnimationMixer` (`action.fadeIn/fadeOut`, `crossFadeTo`). Define states: **idle** (default ambient sway/breathing), **active/greeting**, **thinking**, **speaking**, **gesture/point** (toward CTAs).
- **Gaze / look-at:** make the Genie "watch" the cursor by lerping a look-at target toward the pointer position each frame (track normalized mouse coords, update a head/eye bone or the model's `lookAt`), so it feels alive and directs attention.
- **Lip-sync / mouth animation:** drive **morph targets (blend shapes)** on the face mesh in a `useFrame` loop. Options: (1) simple amplitude-based jaw open from the TTS/audio output; (2) viseme-based morphs from a speech engine; (3) a managed real-time lip-sync SDK (e.g., Convai's NeuroSync streams blendshape data at 60fps over WebRTC) if a fuller "digital human" is wanted. Apply lip-sync *after* the animation mixer updates each frame so mouth movement overrides the body's idle.
- **Scroll-tied animation:** map section scroll progress to a Genie animation-clip position or to discrete state changes (e.g., Genie flies/turns as the user advances the story), using ScrollTrigger `onUpdate`/scrub or R3F `ScrollControls`.

### Performance, accessibility, mobile
- **Optimize the model aggressively** with **glTF-Transform** (`gltf-transform optimize model.glb out.glb --compress draco --texture-compress ktx2`):
- **Draco** geometry compression (`KHR_draco_mesh_compression`) — typically 60–90% vertex-data reduction (a 20MB GLB → ~3–5MB); decoder runs in a Web Worker. **Or Meshopt** (`EXT_meshopt_compression`) — similar/better ratios, faster pure-WASM decode, also compresses morph targets and keyframe animation. A GLB can carry Draco *or* Meshopt, not both.
- **KTX2 / Basis Universal textures** (`KHR_texture_basisu`) — stay GPU-compressed, ~4–8× less VRAM than PNG/JPEG (a 200KB PNG can occupy 20MB+ VRAM). Use UASTC for normal/hero maps, ETC1S for diffuse/secondary.
- Resize textures (e.g. 1024² desktop / 512² mobile); target **<100 draw calls/frame**; dispose GPU resources; use `<Lod>` for distance-based detail.
- **Lazy-load the 3D scene** (dynamic import the canvas, `Suspense` boundary, preloader for the GLB) so it never blocks first paint.
- **Mobile fallback:** ship a **static hero image / poster** of the Genie on mobile and low-end GPUs (detect via `devicePixelRatio`/width), skipping the live WebGL scene — this protects Core Web Vitals where the majority of B2B research traffic is mobile.
- **Accessibility:** honor `prefers-reduced-motion` (freeze/replace scene with a static state); provide a `<noscript>` and DOM-level text equivalent of anything the canvas communicates; keyboard-operable controls; never trap focus in the canvas.

### Sourcing / creating the Golden Genie character (realistic options & tradeoffs)
| Approach | What it is | Tradeoffs |
|---|---|---|
| **Commission a custom stylized model** (artist via ArtStation/Fiverr/studio; model in **Blender**, texture in Substance 3D Painter) | Bespoke golden djinn matching brand; full control over silhouette, rig, "magic" details | Highest cost/time; best brand fit and uniqueness; you own IP. **Recommended for the hero character given it's the central brand mascot.** |
| **Sketchfab marketplace** (buy royalty-free; many models are "Mixamo-rigged, ready to animate," include face joints, 4K PBR) | Fast, cheaper starting point; can be customized in Blender | May not match a specific golden-genie vision; licensing must be checked; risk of looking generic. Good for prototyping. |
| **Ready Player Me–style avatar** | Generated full-body avatar, Mixamo-compatible skeleton, supports blendshapes/lip-sync | Fast and riggable, but humanoid-avatar aesthetic — not an obvious fit for a stylized djinn mascot; better for a "human guide." |
| **Mixamo for rigging + animation** | Free auto-rigger + large animation library (idle, gestures, etc.); upload a humanoid mesh, get a skinned rig + animations | Excellent for body animation of a humanoid-ish genie; does not output glTF directly (export FBX → convert via Blender → GLB); face/lip-sync handled separately via morph targets. |

**Recommended path:** Commission (or buy + heavily customize) a stylized golden-genie GLB with a Mixamo-compatible humanoid rig **plus facial blendshapes**; animate the body via Mixamo clips, author idle/gesture states, add ARKit-style viseme blendshapes for lip-sync; optimize with glTF-Transform before shipping.

---

## D. AI-Chat-Powered Conversational Genie (Anthropic Claude)

### Correct, current way to call the Claude API (2026)
- **Endpoint:** `POST https://api.anthropic.com/v1/messages` (the **Messages API**). REST, JSON. The API is stateless — send the full conversation history (array of `{role, content}`) each turn.
- **Required headers:** `x-api-key: <key>`, `anthropic-version: 2023-06-01`, `content-type: application/json`. (Beta features gated behind `anthropic-beta`.)
- **Required body fields:** `model`, `max_tokens` (mandatory on every request), `messages`. `system` is a top-level field (string or array of text blocks; supports `cache_control` for prompt caching). Optional: `temperature`, `top_p`, `stream`, `tools`.
- **Models available in 2026:** the current generation is **Claude Opus 4.x** (most capable; Opus 4.7/4.8 referenced, ~$5/$25 per MTok), **Claude Sonnet 4.x** (balanced — e.g. `claude-sonnet-4-6`), and **Claude Haiku 4.5** (fast/cheap). Prior versions remain callable via pinned IDs. **For a marketing-site Genie, Haiku 4.5 or Sonnet 4.x is the right cost/latency choice**; Opus is unnecessary here. Use pinned model IDs and make the model a config/env value so it can be swapped.
- **Streaming:** set `stream: true` to receive **server-sent events** (`content_block_delta` events carry `delta.text`); render token-by-token for responsiveness. The official SDKs (`@anthropic-ai/sdk` for TS, `anthropic` for Python) provide `.messages.stream()` helpers. Streaming is strongly recommended for chat UX and is required for very large `max_tokens` to avoid HTTP timeouts.
- **Prompt caching:** mark a stable system prompt / company knowledge block with `cache_control: {type: "ephemeral"}` — subsequent calls within the (5-minute, refreshed) window cost ~10% of input — ideal for the always-present CyberSkill grounding context.

### Security architecture (NON-NEGOTIABLE)
**Never put the API key in the browser.** The key is a secret scoped to a workspace and must live only in server-side environment variables. The recommended pattern is a **serverless reverse proxy**: the browser calls *your* endpoint (e.g. `/api/genie`), which reads `ANTHROPIC_API_KEY` from env, forwards the request to Anthropic with the key attached, and streams the response back. This hides the key, lets you enforce CORS, add auth/rate-limiting, validate input, and log conversations server-side. Anthropic's own guidance (and their internal containment write-ups) reinforce proxy-based key handling and inspecting traffic. On Vercel this is a Route Handler / Edge Function (Edge must begin streaming within 25s, can stream up to ~300s; Node/Fluid functions allow longer). Add per-IP/session rate limiting to protect the quota since any public endpoint can be abused.

### Persona design (giving the Genie a consistent voice)
- The **system prompt is the most important configuration** — it defines persona, scope, and guardrails and is authoritative + invisible to users. Build it from: (1) **Character** — the Golden Genie of CyberSkill, warm/direct/honest/respectful (matching the brand voice axes), playful but professional, speaks in first person as the Genie, ties back to "Turn Your Will Into Real"; bilingual EN/VN capable per the Vietnamese-first commitment. (2) **Grounding facts** — company profile (software & design consultancy, HCMC, est. 2020, services: web apps, mobile apps, internal software systems; contact: info@cyberskill.world, +84 906 878 091 / Mr. Stephen, address, DUNS 673219568). (3) **Behavioral rules** — ask one question at a time, acknowledge before asking, keep replies 2–4 sentences, use the visitor's name once known, never pushy. (4) **Guardrails** — stay on CyberSkill topics, refuse off-topic/abuse, never invent capabilities or prices, escalate to human/contact form when unsure or when a high-value lead appears.
- **Grounding approach:** for a single company, embed the company facts directly in the (cached) system prompt; for richer/portfolio Q&A, add a small retrieval (RAG) layer or expose tools. Consider page-context-specific prompt variants (services page vs. careers page) — same infra, different system prompt.
- **Conversation state:** because the API is stateless, persist history per session (client state for the live turn; a database — e.g. Postgres/DynamoDB — for logging and lead records since serverless is stateless). Log all transcripts regardless of whether a lead completes (partial data is still valuable).

### Driving lead generation through conversation
- **Natural capture:** define an information sequence the Genie works toward conversationally — first name → what they're looking for → company → budget/timeline → email — asking one at a time, value-first ("What brings you here?" before "What's your email?"). 3–5 high-signal qualifying questions is the sweet spot.
- **Qualification & handoff:** score against an ICP (company size, project type, budget, timeline); when a "LEAD_CAPTURED" state is reached, hand off to a contact form (pre-filled) and/or trigger a calendar booking for high-intent leads; offer a human handoff on explicit request, complex questions, or negative sentiment.
- **CRM/email integration:** on lead capture, the serverless function writes to a CRM (HubSpot/Salesforce/Pipedrive via native API, webhook, or Zapier/n8n), maps fields (name/email/company/intent → CRM properties + a custom "pain points"/notes field), attaches the full transcript, and fires a real-time notification (email and/or Slack) so the small team can follow up while interest is fresh. Set expectations in the closing message ("Our team will reach out within one business day"). Include a privacy/consent line in the chat per GDPR/Vietnam PDPL (the design system is "PDPL-ready"). Chatbots are reported to convert markedly better than static forms — Dashly's 2025 research states AI chatbots "convert into sales 3x better than traditional website forms," while a separate Glassix study (Feb 2024) found chatbots lift conversion ~23% versus no chatbot — but attribution must be tracked (does the bot add pipeline vs. noise).

### Connecting chat state to character animation
Maintain a shared state machine (e.g., a Zustand store) with the Genie's status: `idle → listening (user typing) → thinking (request in flight) → speaking (streaming tokens) → idle`. The R3F scene subscribes and cross-fades animation clips accordingly: a "thinking" gesture while the proxy call is pending, a talking/mouth-morph loop while tokens stream (amplitude- or viseme-driven), and a return to idle when the stream ends. This is the same pattern managed SDKs use (apply lip-sync in `useFrame` after the mixer). Keep a non-animated fallback for reduced-motion users (text-only chat, static Genie).

---

## E. Landing Page Structure & Lead-Gen Best Practices

### High-converting B2B agency/software page structure
A proven section order, adapted to CyberSkill's three goals:
1. **Hero** — story-driven, value clear in 3–5 seconds; **H1 under ~8 words / 44 characters**; one primary CTA. This is where the Genie greets and the slogan lives. (Leading B2B pages — Monday.com, Linear, Datadog-style — use story-driven heroes with micro-animations and minimal nav distraction.)
2. **Value proposition / outcomes** — lead with business results (time saved, pipeline, reliability), not feature lists.
3. **Services** — web apps, mobile apps, internal software systems (CyberSkill's actual offerings).
4. **Portfolio / case studies** — concrete outcomes ("reduced X by Y%"); this is the credibility pillar. Reveal progressively with scroll.
5. **Social proof / testimonials** — name clients where possible ("including X, Y, Z" beats "45+ companies"); logos, ratings, awards near CTAs.
6. **Team / culture** — doubles as recruiting/employer-branding surface (see below).
7. **CTA + contact** — low-friction form; the Genie chat is an always-available parallel path.

### Lead-capture form & CRO principles
- **One primary CTA per page**; repeat it strategically (hero + footer). Hero CTAs deliver ~20–30% lifts vs footer-only.
- **5 or fewer form fields.** Per Insiteful, landing pages with 5 or fewer fields convert 120% better; the lift traces to an Imagescape case study where cutting a form from 11 fields to 4 produced a 120% conversion increase. Use **progressive profiling** for everything beyond the minimum. Per genesysgrowth's 2026 stats compilation (citing Unbounce/Insiteful), the top abandonment drivers are "security concerns (29%) and excessive length (27%)," and "81% abandon forms after starting."
- **First-person, personalized CTAs** ("Start my project") outperform generic ones — HubSpot, after analyzing 330,000+ CTAs over a six-month period, found "personalized CTAs convert 202% better than basic CTAs."
- **Demo/contact-first for higher ACV** (consultancy work favors "talk to us" over self-serve trial).
- **Trust signals:** client logos, case-study outcomes, certifications, named testimonials, DUNS/registration as a legitimacy marker for an international B2B buyer.
- **Mobile-first** (majority of B2B research is mobile; single-column, ≥44×44px tap targets, page speed <~2s).
- **Benchmarks to set expectations:** the Unbounce Conversion Benchmark Report (Q4 2024 — 41,000 landing pages / 464M visitors / 57M conversions) puts the **SaaS median at 3.8%** vs a 6.6% all-industry median, with top-quartile SaaS at 11.6%. Per Varos 2026 benchmark data, the **top 10% of B2B SaaS visitor-to-lead converters hit 8–15%** while the average sits at 2–5%. Treat conversion *and lead quality* (SQL-to-close), not raw volume, as the KPI.

### Recruiting / employer-branding layer
- A dedicated **careers/culture section or page** that answers "what will my life look like if I work here?" — values, growth, benefits, and **authentic employee-generated content** (day-in-the-life, testimonials; 200+ employee stories is the award-winning bar) rather than stock photos.
- Show, don't tell: back "great culture" claims with employee voices (Edelman data cited across recruiting sources puts trust in employee accounts at 58–79%, well above corporate messaging).
- The Genie can route recruiting-intent visitors to open roles / a talent-community signup, and the same lead-capture infra can handle candidate inquiries.

### Balancing immersion vs. conversion & load time (the central tension)
Top studios resolve "creative immersive site" vs. "lead-gen performance site" via **progressive enhancement**:
- **HTML-first / SSR:** every meaningful page state (H1, value prop, services, CTA, contact) exists as crawlable, server-rendered DOM *before* WebGL boots — so the site works (and ranks, and converts) even if the 3D never loads. 14islands' approach: build a solid responsive layout, add WebGL on top as a second layer.
- **Don't let the canvas own LCP:** if the canvas is empty for 3s, LCP is 3s. Render real hero text/CTA as the LCP element; defer/lazy-load the scene; use a preloader only for the enhancement.
- **Keep the immersive payload off the critical path** and off mobile (static fallback). The persistent CTA + chat ensure conversion paths never depend on the animation finishing.

### Accessibility (WCAG 2.2 AA — the doctrine floor) & SEO for animated/3D/JS sites
- **`prefers-reduced-motion`:** default to reduced/again-toggleable motion; replace scroll-jacking and looping animation with fades/opacity; offer an in-app motion toggle (store in localStorage, OR with the OS query). Motion is a genuine vestibular accessibility concern (per web.dev/CSS-Tricks); provide play/pause control over any non-essential animation.
- **Semantic fallbacks:** `<noscript>` content; DOM text mirrors anything inside the canvas; keyboard operability; ARIA-hide decorative/duplicate scroll elements.
- **SEO/GEO:** a `<canvas>` contains no indexable text — Googlebot (and AI engines like ChatGPT/Perplexity/Claude) read the DOM. Provide SSR/SSG HTML, proper meta tags, hreflang for EN/VN, FAQ schema, one indexable URL per meaningful state. Smooth-scroll/virtual-scroll can hurt accessibility — prefer a library (Lenis) that retains the native scrollbar.
- **Core Web Vitals & budgets:** target LCP <2.5s, healthy INP and CLS; set a **performance-budget JSON in CI** (max bundle size, textures, draw calls) that fails the build on regression; test on mobile emulation (Lighthouse, WebPageTest, Search Console URL Inspection, Spector.js for WebGL). Three.js core (~600KB) + drei + a GLB can blow past 3MB before styling — budget accordingly.

---

## F. Stack & Deployment Recommendations

### Recommended front-end stack (2026)
- **Framework: Next.js (App Router)** over plain Vite+React. Rationale: built-in SSR/SSG/ISR is exactly what the SEO-vs-immersion tension demands; first-class Route Handlers/Edge Functions give the Claude proxy for free; excellent Vercel integration; React 19 + React Compiler auto-memoization. (Vite + React is viable if the team prefers a pure SPA + separate serverless functions, but you lose easy SSR — not recommended given lead-gen/SEO priority.)
- **3D:** React Three Fiber v9 + @react-three/drei (+ GLSL shaders for the golden glow), models as Draco/KTX2-optimized GLB.
- **Motion:** GSAP + ScrollTrigger (+ ScrollSmoother, now free) for scroll storytelling; Lenis for smooth scroll; Framer Motion / `motion` for UI micro-interactions; Lottie for vector accents; optionally Theatre.js for authoring complex camera sequences.
- **Styling:** Implement the CyberSkill design tokens as CSS custom properties (DTCG → Style Dictionary output if/when the token package is available; otherwise hand-port the documented tokens). Pair with Tailwind (the motionsites aesthetic and most 2026 reference builds use Tailwind v4) *or* the design system's own CSS, mapping Tailwind theme values to `--cs-*` tokens so the anchors (Umber/Ochre) and Liquid Glass surfaces are honored. Confirm whether `@cyberskill/react` is privately consumable before depending on it.
- **State:** Zustand for the cross-cutting Genie animation/chat state machine.
- **Backend:** serverless Route Handler(s) for the Claude proxy + lead webhook; a lightweight DB (e.g., Vercel Postgres / Supabase) for transcripts and lead records.

### Deployment
- **Vercel** is the recommended host (native Next.js, Edge/Fluid functions with streaming, global CDN, preview deploys, Web Analytics + Speed Insights, Fluid Compute default 300s duration). Netlify or Cloudflare (Pages + Workers) are valid alternatives — Cloudflare Workers is attractive if cost/edge-compute is paramount.
- **Claude proxy on Vercel:** a Route Handler reading `ANTHROPIC_API_KEY` from Vercel env vars, streaming SSE back to the client. Optionally route through **Vercel AI Gateway** (`ai-gateway.vercel.sh`, Anthropic-compatible `/v1/messages`) for unified observability, token-usage monitoring, and multi-provider fallback — but a direct proxy is simplest and sufficient.
- **Env vars & secrets:** `ANTHROPIC_API_KEY`, model ID, CRM keys, DB URL — all server-side only, never `NEXT_PUBLIC_`. Use Vercel's encrypted env vars (and consider per-environment values for preview vs prod).
- **Analytics:** Vercel Web Analytics + Speed Insights for CWV; a product analytics tool (e.g., GA4/PostHog) for funnel/conversion tracking; wire chatbot and form events into the CRM for revenue attribution (GCLID → conversion → closed-won).

---

## Recommendations

**Staged build plan (decision-ready, with thresholds that change the plan):**

1. **Phase 0 — Resolve the design-system dependency (blocker, do first).** Confirm with CyberSkill whether `@cyberskill/tokens` / `@cyberskill/react` / `@cyberskill/style-packs` exist on a *private* registry or GitHub Packages feed. **If yes:** consume them and theme on top. **If no (current evidence):** hand-port the documented tokens (Umber, Ochre, type/space scale, `--cs-glass-*`/`--cs-depth-*`) into CSS custom properties + Tailwind theme, and scope a small in-repo component library (Button, Field, Dialog, Card) honoring APCA Lc≥75 and Liquid Glass. This decision gates the styling tasks in the SRS.

2. **Phase 1 — Ship the HTML-first conversion core (no 3D yet).** Next.js App Router, SSR'd hero/services/portfolio/social-proof/careers/contact, ≤5-field progressive form, persistent CTA, EN/VN content, meta/hreflang/FAQ schema, analytics. **This alone must hit the lead-gen KPIs** (target visitor-to-lead ≥5%, LCP <2.5s on mobile). Treat everything after this as enhancement.

3. **Phase 2 — Add the Claude chat Genie (text-first).** Serverless proxy (`/api/genie`) with server-side key, streaming SSE, cached system-prompt persona grounded in CyberSkill facts, conversational lead capture → CRM + Slack/email notification, transcript logging, rate limiting, consent line. Start on **Haiku 4.5**; escalate to **Sonnet 4.x** only if answer quality on portfolio/services questions is insufficient.

4. **Phase 3 — Layer the 3D Genie + scroll storytelling.** Commission/acquire the optimized golden-genie GLB (Draco + KTX2, Mixamo body + blendshape lip-sync, gaze tracking); fixed R3F canvas tied to GSAP/ScrollTrigger + Lenis; Zustand state machine binding chat state → animation. **Gate this behind a performance budget in CI** (fail build if mobile LCP >2.5s or bundle exceeds the set ceiling). Ship the static-poster fallback for mobile/low-GPU/reduced-motion *in the same PR* as the scene — never after.

5. **Benchmarks that should change the plan:** if Phase-1 mobile LCP can't stay under 2.5s with the 3D enabled, keep 3D desktop-only indefinitely. If chatbot attribution shows it adds noise rather than pipeline after ~4–6 weeks, downgrade it from hero to a secondary widget. If form conversion sits below ~3% (under the SaaS median), cut form fields and strengthen social proof before adding more animation.

---

## Caveats & uncertainties
- **Design-system implementation packages unverified:** the README documents `@cyberskill/tokens`/`@cyberskill/react`/`@cyberskill/style-packs`, but they were not found on public npm, and the repo's own README calls `packages/` "optional … when present" and gitignored. The only public CyberSkill npm package found was `@cyberskill/shared` v2.27.0 under the *different* org `cyberskill-world`. **Action item:** confirm directly with CyberSkill whether a private registry/GitHub Packages feed exists; otherwise plan to build components from the documented tokens. (The verification environment also could not fetch the raw `package.json`/`CHANGELOG.md`, so the monorepo/build-script details in the README are taken at face value and should be re-checked against the live repo.)
- **motionsites.ai is a prompt/template marketplace, not an engineering spec** — used here for aesthetic direction only; the engineering patterns come from production studios.
- **Model IDs and pricing move fast:** Claude model names/prices cited reflect 2026 snapshots from secondary sources; verify exact current model IDs and rates in the official Anthropic console/docs at build time and keep the model ID in config.
- **Reduced-motion prevalence:** a commonly cited "~25% of users enable reduced motion" figure could not be confirmed against an authoritative source (MDN/W3C/web.dev document the feature but cite no prevalence number), so it is omitted; design for the preference regardless of exact share.
- **Lip-sync fidelity vs. effort:** amplitude-based mouth movement is cheap; true viseme/NeuroSync-grade lip-sync adds significant complexity/cost — decide based on how "alive" the Genie must feel.
- **GSAP licensing:** now free for commercial use (Webflow-sponsored), including ScrollSmoother — but re-confirm the standard license terms at build time.