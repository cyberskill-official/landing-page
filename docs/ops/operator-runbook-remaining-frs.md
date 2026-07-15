# Operator runbook: remaining feature requests

**Date:** 2026-07-14  
**Audience:** owner (human steps) + agents  
**Related:** `docs/architecture/cyberos-central-data-source.md`

---

## Operator summary (updated 2026-07-15)

| Do next (order) | FR | You |
|---|---|---|
| 1. Finish lead e2e residual | BIZ-003 | Tick `docs/verification/fr-biz-003-lead-pipeline-e2e-2026-07-15.md` (/vi + Reply-To) |
| 2. Social / messaging URLs | BIZ-007 | Paste live URLs → agent wires `lib/content/site.ts` |
| 3. Google Business + NAP | BIZ-004 | Claim GBP; fill `docs/ops/nap-listings-register.md` |
| 4. Search Console + Bing | BIZ-008 | Verify + sitemap; log `docs/ops/seo-monthly-log.md` |
| 5. Directories / reviews | BIZ-005 | After GBP |
| 6. Standing programs | BIZ-010 | After social |
| 7. Manual a11y lab | A11Y-008 / 014 | `docs/verification/a11y-manual-checklist.md` |
| Parked long external | BIZ-011, 014, 015 | Press / ISO / AI citation |
| **Out of this wave** | BIZ-002/016, CMS-004/009 | CyberOS + real testimonials/case studies |

**Already true in prod:** Resend + `RESEND_API_KEY`; CRM webhook optional until CyberOS; LinkedIn + GitHub in SSOT.

**Agent already finished (code):** policy SSOT, booking CTA, profile PDFs, about/team, permission drafts, content read-model scaffold, dual-write helpers, Lumi scripted chat, Verify-us home dedupe.

---

## 1. Triage: every ready + draft FR

Classification: **agent-doable** (done or scaffolded this wave) vs **human/blocked**.

| FR | Class | Classification | Why / what remains |
|---|---|---|---|
| FR-A11Y-008 | mixed | **human** | Manual VoiceOver + NVDA pass |
| FR-A11Y-014 | mixed | **human** | On-device lab (phones, contrast) |
| FR-BIZ-001 | human | **human** | Resend, Slack, CRM secrets in Vercel |
| FR-BIZ-002 | human | **human** | Deploy CyberOS lead-intake; set `LEAD_CRM_*` |
| FR-BIZ-003 | human | **human** | Live e2e lead visible in CyberOS |
| FR-BIZ-004 | human | **human** | Google Business Profile + NAP |
| FR-BIZ-005 | mixed | **human** | Directories + verified reviews (needs BIZ-004) |
| FR-BIZ-006 | mixed | **human** (scaffold done) | §1.2: send ≥3 client requests; secure 1 named case study |
| FR-BIZ-007 | human | **human** | Social / messaging profiles |
| FR-BIZ-008 | human | **human** | Search Console + Bing + monthly review |
| FR-BIZ-009 | mixed | **human** (blocked) | Needs BIZ-002 + OPS-020; interim sheet ready |
| FR-BIZ-010 | mixed | **human** (blocked) | Needs BIZ-007 social |
| FR-BIZ-011 | mixed | **human** (blocked) | Needs BIZ-005 mentions |
| FR-BIZ-012 | human | **human** | PDPL counsel + CyberOS processor |
| FR-BIZ-014 | human | **human** | ISO/SOC path decision |
| FR-BIZ-015 | human | **human** | AI citation monitoring ritual |
| FR-CMS-004 | mixed | **human** (blocked) | Needs BIZ-006 cleared quotes |
| FR-CMS-009 | mixed | **human** (blocked) | Needs BIZ-006 cleared case studies |
| FR-BIZ-016 | draft | **human** | CyberOS platform APIs |
| FR-OPS-019 | draft | **agent-scaffolded** | Git read-model in `lib/content/read-model.ts`; CyberOS fetch later |
| FR-OPS-020 | draft | **agent-scaffolded** | Dual-write helpers + tests; live migration after BIZ-002 |
| FR-CMS-021 | draft | **human** (blocked) | Notes authoring after OPS-019 + BIZ-016 |

---

## 2. Step-by-step: lead pipeline (do this first)

### Step 2.1 — FR-BIZ-001: Configure lead sinks

1. Open Vercel → project → Settings → Environment Variables (Production).  
2. Set (names from `.env.example`):

| Variable | Purpose | Secret? |
|---|---|---|
| `RESEND_API_KEY` | Lead + ack email | yes |
| `LEAD_EMAIL_FROM` | Optional From override | no |
| `LEAD_SLACK_WEBHOOK_URL` | Team ping | yes |
| `LEAD_CRM_WEBHOOK_URL` | CyberOS / CRM intake | yes |
| `LEAD_CRM_TOKEN` | Bearer for CRM | yes |
| `DATABASE_URL` | Optional Prisma durability | yes |
| `NEXT_PUBLIC_BOOKING_URL` | Optional Cal.com etc. (https only) | public |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin | public |

3. Redeploy production.  
4. **Done when:** `GET /api/health` is 200; submit a test lead in preview/production and receive Slack and/or email (or see JSONL under `LEAD_STORE_DIR` / `.data/leads.jsonl` in non-serverless).

### Step 2.2 — FR-BIZ-016 then FR-BIZ-002: CyberOS lead-intake

1. In CyberOS, implement/deploy authenticated lead-intake (shared secret).  
2. Put the public webhook URL in `LEAD_CRM_WEBHOOK_URL` and secret in `LEAD_CRM_TOKEN`.  
3. Redeploy landing.  
4. **Done when:** unauthenticated POST → 401/403; authenticated POST from landing → 2xx and row visible in CyberOS.

### Step 2.3 — FR-BIZ-003: Production e2e

1. On https://cyberskill.world (or prod alias), submit the contact form with a real mailbox you control.  
2. Confirm: thank-you UI, ack email (if Resend set), CyberOS row with intent/source/locale/utm.  
3. **Done when:** evidence screenshot or export of CyberOS row + timestamp.

### Step 2.4 — FR-BIZ-009 interim (until CyberOS)

1. Copy columns from `docs/ops/lead-interim-sor-sheet.md` into a private sheet.  
2. Paste each lead; set `status` + `next_action_at`.  
3. Run weekly review; log under `docs/ops/funnel-reviews/YYYY-MM-DD.md`.  
4. Retire sheet when BIZ-003 + dual-write migration complete.

---

## 3. Step-by-step: client proof (unblocks CMS-004 / CMS-009)

### Step 3.1 — FR-BIZ-006 §1.2 (you)

1. Open `docs/content/permission-request-en.md` and `permission-request-vi.md`.  
2. Send to **≥3** past clients (email is fine).  
3. Track replies; aim for **≥1 full named case study** (name + metrics + permission).  
4. For each grant, append a row to `clientPermissions` in `lib/content/permissions.ts`:

```ts
{
  id: "client-acme-2026",
  grantedBy: "Jane Doe",
  grantedAt: "2026-07-20",
  reference: "email:jane@acme.com#thread-…",
  scopes: ["name", "logo", "metrics", "quote"],
}
```

5. **Done when:** ≥3 sends documented; ≥1 grant with scopes; agent can wire CMS-004/009 without inventing data.

### Step 3.2 — FR-CMS-004 testimonials (after grants)

1. Add objects to `testimonials` in `lib/content/site.ts` with `permission` matching a `clientPermissions` id / fields.  
2. Run `npm test` — `content/testimonial-permission` must pass.  
3. **Done when:** quotes render with name/role/company; empty array still emits no fake quotes.

### Step 3.3 — FR-CMS-009 case studies (after grants)

1. Replace anonymized entries in `work` / `caseStudyDetails` with cleared data + metric source notes.  
2. Link `permission` on every logo/screenshot/quote.  
3. Run case-study tests.  
4. **Done when:** 2–3 metrics with units/period/source; no placeholder prose.

---

## 4. Step-by-step: off-site presence

| Order | FR | Steps | Done when |
|---|---|---|---|
| 1 | BIZ-004 | Claim Google Business Profile; match NAP to `company.address` in `lib/content/site.ts` | GBP live; address identical everywhere |
| 2 | BIZ-007 | Create LinkedIn company (done?), Zalo/FB/WhatsApp if wanted; add URLs to `company.profiles` / `contacts` | Only live URLs in config |
| 3 | BIZ-005 | Clutch/directories; request reviews | Profiles live; 1+ verified review |
| 4 | BIZ-008 | Search Console + Bing; submit `https://cyberskill.world/sitemap.xml`; calendar monthly review | Property verified; sitemap accepted |
| 5 | BIZ-010 | Welcome email sequence, founder LinkedIn cadence, quarterly letter | Rituals running (docs ok) |
| 6 | BIZ-011 | One listicle / press / awards attempt | Submission recorded |
| 7 | BIZ-012 | Counsel PDPL + Anthropic + **CyberOS as processor** | Dated review memo |
| 8 | BIZ-014 / 015 | Certification decision; AI citation check calendar | Written decision / first check log |

---

## 5. Step-by-step: manual accessibility

### FR-A11Y-008 (VoiceOver + NVDA)

1. Mac Safari + VoiceOver: home EN/VI, contact form, Lumi chat open/close, team, services.  
2. Windows Firefox/Chrome + NVDA: same.  
3. Log issues in `docs/verification/a11y-sr-YYYY-MM-DD.md`.  
4. **Done when:** no critical SR traps; form labels announced; chat live regions ok.

### FR-A11Y-014 (device lab)

1. iPhone Safari + Android Chrome: home, form, persistent CTA, 44px targets.  
2. Check contrast on gold buttons vs background.  
3. Log in `docs/verification/a11y-device-YYYY-MM-DD.md`.  
4. **Done when:** no horizontal scroll bugs; CTA not covering content; contrast pass notes.

---

## 6. CyberOS content wave (after leads work)

| Order | FR | Who | Done when |
|---|---|---|---|
| 1 | BIZ-016 | human | Content + lead APIs documented and live |
| 2 | OPS-019 | agent | Read-model fetches CyberOS; git fallback already in `lib/content/read-model.ts` |
| 3 | OPS-020 | mixed | Historical leads migrated; dual-write primary CyberOS |
| 4 | CMS-021 | mixed | New notes authored in CyberOS |

---

## 7. Quick reference: repo paths

| Concern | Path |
|---|---|
| Env template | `.env.example` |
| Lead API | `app/api/lead/route.ts` |
| CRM field map | `lib/lead/crm-mapping.ts` |
| Dual-write policy helpers | `lib/lead/dual-write.ts` |
| Content read model | `lib/content/read-model.ts` |
| Permissions | `lib/content/permissions.ts` |
| Permission email drafts | `docs/content/permission-request-en.md`, `…-vi.md` |
| Commercial policy | `lib/content/policy.ts` |
| Booking CTA | `lib/content/booking.ts`, `components/cta/BookingLink.tsx` |
| Profile PDFs | `public/downloads/cyberskill-profile-*.pdf` |
| Interim lead sheet | `docs/ops/lead-interim-sor-sheet.md` |
| Architecture | `docs/architecture/cyberos-central-data-source.md` |

---

## 8. Agent progress note (this goal)

- **Implemented scaffolds:** content read-model (git), dual-write helpers + tests, interim SoR sheet, this runbook.  
- **Not marked done:** pure human FRs; CMS-004/009; BIZ-006 §1.2; draft CyberOS platform FRs.  
