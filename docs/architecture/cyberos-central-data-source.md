# CyberOS as central data source — FR backlog recommendation

**Status:** operator guidance (not a shippable FR)  
**Date:** 2026-07-14  
**Audience:** product owner + agents working the landing-page backlog  
**Trigger:** Operator decision that *all landing-page data* (leads, blogs/notes, and related publishable content) will migrate to / be managed by **CyberOS** as the centralized system of record.

---

## Operator summary (read this first)

| Do | Don’t |
|---|---|
| **Update** lead SoR FRs so CyberOS is primary (not a sheet forever) and local Prisma is **edge cache / fail-open**, not a second CRM | Expand remaining **UI-only** FRs (A11Y lab, directories, GBP) to “use CyberOS” without a read contract |
| **Update** mutable CMS FRs (testimonials, case studies, about/team, PDF) so SSOT is CyberOS content, not only `lib/content/*.ts` | Assume shipping more copy into `lib/content/notes.ts` forever is fine |
| **Add 4 new FRs** (drafts landed): BIZ-016 platform, OPS-019 content read model, OPS-020 lead dual-write/migration, CMS-021 notes authoring | Build a full CMS inside the landing repo |
| **Leave** pure human off-site FRs (GBP, Search Console, awards, certifications) | Block A11Y / booking work on CyberOS content |

**Do not expand remaining UI FRs until:** FR-BIZ-002 (lead webhook) is green **and** FR-OPS-019 (content read contract) has a versioned API shape — otherwise agents will keep baking in-repo SSOT that you will rewrite twice.

---

## 1. Domain map: today → CyberOS target

Grounded in paths that exist in this repo today.

| Domain | Today (this repo) | Target with CyberOS as SoR | Landing-page role |
|---|---|---|---|
| **Leads** (contact, teardown, partnership, talent) | `app/api/lead/route.ts` fans out to file + Resend + Slack + **CyberOS webhook** (`LEAD_CRM_WEBHOOK_URL` / `forwardToCyberOs`) + local `lib/db` (`InMemoryAdapter` / `PrismaDbAdapter`) | CyberOS is **system of record** (status, next-action, SLA, partner track). Local DB remains optional durability / offline buffer | Write path only: validate → dual-write CyberOS primary + local best-effort |
| **Chat transcripts** | `app/api/genie` + `lib/db` (`saveTranscript`, FR-CHAR-028 done) | CyberOS stores transcripts linked to leads; PDPL retention/erasure in CyberOS + local prune | Forward transcript with lead / session id; local prune still required if dual-write |
| **Newsletter / subscribe** | `app/api/subscribe` + Resend | Optional: CyberOS contacts module or keep Resend as SoR for marketing lists | Prefer **out of scope** for CyberOS v1 unless BIZ-010 needs one list |
| **Notes / blogs** | `lib/content/notes.ts` typed array; routes under `app/[lang]/notes` | CyberOS CMS for posts (author, dates, TLDR, EN+VI); landing **reads** published posts | Consumer of OPS-019 read model; deprecate TS file as write SSOT |
| **Case studies / work** | `lib/content/site.ts` (`work`), FR-CMS-009 still open | CyberOS content entities + permission meta (BIZ-006) | Same read model |
| **Testimonials / logos** | `lib/content/site.ts` arrays; CMS-004/006/009 open | CyberOS content + permission records | Same; empty = no markup (already enforced) |
| **Commercial policy / company facts** | `lib/content/policy.ts`, `lib/content/site.ts` (`company`) | **Hybrid:** slow-changing legal/brand facts may stay git-reviewed; commercial ranges/capacity either git (BIZ-013) *or* CyberOS with audit trail | Prefer git SSOT for policy until CyberOS has approval workflow; re-evaluate after BIZ-016 |
| **Changelog /now** | `lib/content/changelog.ts` | CyberOS or git — low churn; leave git until content API exists | Leave |
| **Services long-form** | `lib/content/services.ts` | CyberOS when marketing edits weekly; else git | Leave short-term |
| **Analytics / Clarity** | first-party events, Clarity env | **Out of scope** for centralization (not “leads/blogs”) | Leave |

**Key existing FRs already pointing at CyberOS for leads:**  
FR-BIZ-002 (deploy intake), FR-BIZ-003 (e2e), FR-OPS-005 / FR-OPS-014 (local adapter), FR-CTA-006 (CRM field map), FR-BIZ-009 (SoR + SLA).

---

## 2. Disposition of every `ready_to_implement` FR

Keyword per id: **leave** | **update** | **depends_on** (new FR) | **supersede** (none this wave).

| FR | Disposition | Guidance |
|---|---|---|
| **FR-CTA-005** | **leave** | Booking URL is env config (`NEXT_PUBLIC_BOOKING_URL`); not content/lead SoR. |
| **FR-CTA-016** | **update** + **depends_on** FR-OPS-019 | §1.1 “from the site's content module” → “from the **publishable content read model** (CyberOS or fallback module) so PDF cannot drift from live site.” Do not hardcode a second copy of entity/services. |
| **FR-CMS-004** | **update** + **depends_on** FR-OPS-019 | Keep shape/permission ACs; change “content source” from only `lib/content/site.ts` to **CyberOS-published testimonials** with local typed fallback for build-time CI. |
| **FR-CMS-006** | **update** + **depends_on** FR-OPS-019 | Team/about content authored in CyberOS; landing renders via read model. |
| **FR-CMS-009** | **update** + **depends_on** FR-OPS-019, FR-BIZ-006 | Real case studies + metrics source notes live in CyberOS; permission still human (BIZ-006). |
| **FR-A11Y-008** | **leave** | Manual SR pass; independent of data centralization. |
| **FR-A11Y-014** | **leave** | Device lab; independent. |
| **FR-BIZ-001** | **leave** | Resend/Slack/API keys still required for edge notifications even with CyberOS SoR. |
| **FR-BIZ-002** | **update** | Keep human deploy of lead-intake; add clause: CyberOS is **primary** lead SoR; landing dual-writes; CyberOS outage must not fail visitor (already edge case). Point §4 “Building CyberOS side” at **FR-BIZ-016**. |
| **FR-BIZ-003** | **leave** | Production e2e proof still required after 002. |
| **FR-BIZ-004** | **leave** | GBP/NAP off-site. |
| **FR-BIZ-005** | **leave** | Directories/reviews off-site. |
| **FR-BIZ-006** | **update** | Permission ledger should be **referenced in CyberOS content meta** (and still evidenceable in git until OPS-019 ships). |
| **FR-BIZ-007** | **leave** | Social profiles. |
| **FR-BIZ-008** | **leave** | Search Console/Bing ritual. |
| **FR-BIZ-009** | **update** + **depends_on** FR-BIZ-002 | §1.1: sheet is **interim only** until CyberOS live; after BIZ-002/003, CyberOS is the only SoR for status/next-action; weekly review runs from CyberOS exports. |
| **FR-BIZ-010** | **leave** | Nurture programs; may later consume CyberOS segments (non-blocking). |
| **FR-BIZ-011** | **leave** | Press/awards. |
| **FR-BIZ-012** | **update** | PDPL review must include **CyberOS as processor/sub-processor** for leads + content, not only Anthropic chat transfer. |
| **FR-BIZ-014** | **leave** | ISO/SOC path. |
| **FR-BIZ-015** | **leave** | Citation monitoring. |

**Count check:** 21 ready FRs listed above (matches BACKLOG `ready_to_implement` set as of 2026-07-14).

### Done FRs whose §1 still assume local-only CMS (do not re-open unless shipping centralization)

| FR | Note |
|---|---|
| FR-CMS-001/007/010, FR-SEO-011/015/016/017/018 | “Content module” language remains valid as **read interface**; implementation becomes adapter over CyberOS when OPS-019 lands |
| FR-OPS-005 / FR-OPS-014 | Stay as landing **persistence contract**; role becomes dual-write / cache under OPS-020 |
| FR-BIZ-013 / `lib/content/policy.ts` | Keep git-reviewed commercial policy until CyberOS has approval + review cadence UX |

---

## 3. Minimal new FR set (required)

Without these, remaining CMS/lead FRs will keep encoding the wrong SSOT.

### FR-BIZ-016 — CyberOS central data platform for landing (leads + content)  
- **Class:** improvement · **Owner:** human · **Depends on:** —  
- **SHALL:** (1) CyberOS expose authenticated lead-intake + content publish APIs used by the landing site; (2) define data ownership (CyberOS SoR vs landing edge cache); (3) document env vars and failure modes; (4) PDPL retention/erasure story for leads and transcripts.  
- **Draft:** `docs/feature-requests/biz/FR-BIZ-016-cyberos-central-data-platform/spec.md`

### FR-OPS-019 — Landing content read model from CyberOS  
- **Class:** product · **Owner:** agent · **Depends on:** FR-BIZ-016  
- **SHALL:** (1) versioned read contract for notes, work, testimonials, team; (2) build/runtime fetch with **git-module fallback** if CyberOS unavailable; (3) EN+VI parity gate; (4) no inventing CMS UI in the landing repo.  
- **Draft:** `docs/feature-requests/ops/FR-OPS-019-cyberos-content-read-model/spec.md`

### FR-OPS-020 — Lead dual-write and historical migration to CyberOS  
- **Class:** improvement · **Owner:** mixed · **Depends on:** FR-BIZ-002, FR-OPS-005  
- **SHALL:** (1) every `/api/lead` success path attempts CyberOS first; (2) local `lib/db` remains best-effort; (3) one-time migration of historical local leads; (4) zero silent loss + OPS-010 alerts on CyberOS failure.  
- **Draft:** `docs/feature-requests/ops/FR-OPS-020-lead-dual-write-and-migration/spec.md`

### FR-CMS-021 — Notes/blog authoring via CyberOS (deprecates `notes.ts` as write SSOT)  
- **Class:** product · **Owner:** mixed · **Depends on:** FR-OPS-019, FR-CMS-010  
- **SHALL:** (1) new posts authored in CyberOS with author/dates/TLDR; (2) landing `/notes` reads OPS-019; (3) migration of existing `lib/content/notes.ts` posts; (4) RSS/llms stay generated from the same read model.  
- **Draft:** `docs/feature-requests/cms/FR-CMS-021-cyberos-notes-authoring/spec.md`

**Explicitly not proposed as separate FRs (covered above):** generic “move analytics to CyberOS”, “rebuild Prisma out”, “full headless CMS in Next”.

---

## 4. Suggested implementation order

```text
FR-BIZ-001 (secrets) 
  → FR-BIZ-016 (CyberOS platform capabilities) [human]
  → FR-BIZ-002 + FR-BIZ-003 (lead webhook live + e2e)
  → FR-OPS-020 (dual-write + migrate history)
  → FR-BIZ-009 (SLA ritual on CyberOS SoR)
  → FR-OPS-019 (content read model)
  → FR-CMS-021 (notes authoring)
  → update CMS-004/006/009 + CTA-016 to depend on OPS-019
```

Parallel, unblocked: FR-A11Y-008/014, FR-CTA-005 (when booking URL exists), FR-BIZ-004/005/007/008/011/014/015.

---

## 5. What *not* to change yet

- Do **not** rewrite all of `lib/content/*` in one go; OPS-019 is the seam.
- Do **not** delete local Prisma adapter; dual-write is safer for serverless cold starts and CyberOS outages.
- Do **not** put commercial policy only in CyberOS until review cadence + history (BIZ-013 AC 1.4) is productized there.
- Analytics (FR-OPS-011/012) stay first-party; not part of “leads + blogs” centralization.

---

## 6. Traceability of “today” citations

| Claim | Resolves to |
|---|---|
| Lead webhook fan-out | `app/api/lead/route.ts` (`forwardToCyberOs`, `LEAD_CRM_WEBHOOK_URL`) |
| Local lead/transcript store | `lib/db/adapter.ts`, `lib/db/index.ts`, `lib/db/prisma.ts`, `lib/db/in-memory.ts` |
| Notes SSOT | `lib/content/notes.ts` |
| Company / work / testimonials | `lib/content/site.ts` |
| Commercial policy | `lib/content/policy.ts` |
| Changelog | `lib/content/changelog.ts` |
| Services long-form | `lib/content/services.ts` |
| Lead intake FR | `docs/feature-requests/biz/FR-BIZ-002-cyberos-lead-intake/spec.md` |
| Local datastore FR | `docs/feature-requests/ops/FR-OPS-005-lead-db/spec.md` |

---

## 7. Next operator actions

1. Accept or edit the four **draft** FRs; promote to `ready_to_implement` after audit when CyberOS roadmap is clear.  
2. Apply the **update** notes to FR-BIZ-002/009/012, FR-CMS-004/006/009, FR-CTA-016, FR-BIZ-006 (agent can patch §1 in a follow-up FR-authoring pass).  
3. Continue shipping unblocked FRs (A11Y, booking, directories) without waiting for CMS centralization.
