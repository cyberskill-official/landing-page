# CyberOS as central data source — task backlog recommendation

**Status:** operator guidance (not a shippable task)  
**Date:** 2026-07-14  
**Audience:** product owner + agents working the landing-page backlog  
**Trigger:** Operator decision that *all landing-page data* (leads, blogs/notes, and related publishable content) will migrate to / be managed by **CyberOS** as the centralized system of record.

---

## Operator summary (read this first)

| Do | Don’t |
|---|---|
| **Update** lead SoR tasks so CyberOS is primary (not a sheet forever) and local Prisma is **edge cache / fail-open**, not a second CRM | Expand remaining **UI-only** tasks (A11Y lab, directories, GBP) to “use CyberOS” without a read contract |
| **Update** mutable CMS tasks (testimonials, case studies, about/team, PDF) so SSOT is CyberOS content, not only `lib/content/*.ts` | Assume shipping more copy into `lib/content/notes.ts` forever is fine |
| **Add 4 new tasks** (drafts landed): BIZ-016 platform, OPS-019 content read model, OPS-020 lead dual-write/migration, CMS-021 notes authoring | Build a full CMS inside the landing repo |
| **Leave** pure human off-site tasks (GBP, Search Console, awards, certifications) | Block A11Y / booking work on CyberOS content |

**Do not expand remaining UI tasks until:** TASK-BIZ-002 (lead webhook) is green **and** TASK-OPS-019 (content read contract) has a versioned API shape — otherwise agents will keep baking in-repo SSOT that you will rewrite twice.

---

## 1. Domain map: today → CyberOS target

Grounded in paths that exist in this repo today.

| Domain | Today (this repo) | Target with CyberOS as SoR | Landing-page role |
|---|---|---|---|
| **Leads** (contact, teardown, partnership, talent) | `app/api/lead/route.ts` fans out to file + Resend + Slack + **CyberOS webhook** (`LEAD_CRM_WEBHOOK_URL` / `forwardToCyberOs`) + local `lib/db` (`InMemoryAdapter` / `PrismaDbAdapter`) | CyberOS is **system of record** (status, next-action, SLA, partner track). Local DB remains optional durability / offline buffer | Write path only: validate → dual-write CyberOS primary + local best-effort |
| **Chat transcripts** | `app/api/genie` + `lib/db` (`saveTranscript`, TASK-CHAR-028 done) | CyberOS stores transcripts linked to leads; PDPL retention/erasure in CyberOS + local prune | Forward transcript with lead / session id; local prune still required if dual-write |
| **Newsletter / subscribe** | `app/api/subscribe` + Resend | Optional: CyberOS contacts module or keep Resend as SoR for marketing lists | Prefer **out of scope** for CyberOS v1 unless BIZ-010 needs one list |
| **Notes / blogs** | `lib/content/notes.ts` typed array; routes under `app/[lang]/notes` | CyberOS CMS for posts (author, dates, TLDR, EN+VI); landing **reads** published posts | Consumer of OPS-019 read model; deprecate TS file as write SSOT |
| **Case studies / work** | `lib/content/site.ts` (`work`), TASK-CMS-009 still open | CyberOS content entities + permission meta (BIZ-006) | Same read model |
| **Testimonials / logos** | `lib/content/site.ts` arrays; CMS-004/006/009 open | CyberOS content + permission records | Same; empty = no markup (already enforced) |
| **Commercial policy / company facts** | `lib/content/policy.ts`, `lib/content/site.ts` (`company`) | **Hybrid:** slow-changing legal/brand facts may stay git-reviewed; commercial ranges/capacity either git (BIZ-013) *or* CyberOS with audit trail | Prefer git SSOT for policy until CyberOS has approval workflow; re-evaluate after BIZ-016 |
| **Changelog /now** | `lib/content/changelog.ts` | CyberOS or git — low churn; leave git until content API exists | Leave |
| **Services long-form** | `lib/content/services.ts` | CyberOS when marketing edits weekly; else git | Leave short-term |
| **Analytics / Clarity** | first-party events, Clarity env | **Out of scope** for centralization (not “leads/blogs”) | Leave |

**Key existing tasks already pointing at CyberOS for leads:**  
TASK-BIZ-002 (deploy intake), TASK-BIZ-003 (e2e), TASK-OPS-005 / TASK-OPS-014 (local adapter), TASK-CTA-006 (CRM field map), TASK-BIZ-009 (SoR + SLA).

---

## 2. Disposition of every `ready_to_implement` task

Keyword per id: **leave** | **update** | **depends_on** (new task) | **supersede** (none this wave).

| task | Disposition | Guidance |
|---|---|---|
| **TASK-CTA-005** | **leave** | Booking URL is env config (`NEXT_PUBLIC_BOOKING_URL`); not content/lead SoR. |
| **TASK-CTA-016** | **update** + **depends_on** TASK-OPS-019 | §1.1 “from the site's content module” → “from the **publishable content read model** (CyberOS or fallback module) so PDF cannot drift from live site.” Do not hardcode a second copy of entity/services. |
| **TASK-CMS-004** | **update** + **depends_on** TASK-OPS-019 | Keep shape/permission ACs; change “content source” from only `lib/content/site.ts` to **CyberOS-published testimonials** with local typed fallback for build-time CI. |
| **TASK-CMS-006** | **update** + **depends_on** TASK-OPS-019 | Team/about content authored in CyberOS; landing renders via read model. |
| **TASK-CMS-009** | **update** + **depends_on** TASK-OPS-019, TASK-BIZ-006 | Real case studies + metrics source notes live in CyberOS; permission still human (BIZ-006). |
| **TASK-A11Y-008** | **leave** | Manual SR pass; independent of data centralization. |
| **TASK-A11Y-014** | **leave** | Device lab; independent. |
| **TASK-BIZ-001** | **leave** | Resend/Slack/API keys still required for edge notifications even with CyberOS SoR. |
| **TASK-BIZ-002** | **update** | Keep human deploy of lead-intake; add clause: CyberOS is **primary** lead SoR; landing dual-writes; CyberOS outage must not fail visitor (already edge case). Point §4 “Building CyberOS side” at **TASK-BIZ-016**. |
| **TASK-BIZ-003** | **leave** | Production e2e proof still required after 002. |
| **TASK-BIZ-004** | **leave** | GBP/NAP off-site. |
| **TASK-BIZ-005** | **leave** | Directories/reviews off-site. |
| **TASK-BIZ-006** | **update** | Permission ledger should be **referenced in CyberOS content meta** (and still evidenceable in git until OPS-019 ships). |
| **TASK-BIZ-007** | **leave** | Social profiles. |
| **TASK-BIZ-008** | **leave** | Search Console/Bing ritual. |
| **TASK-BIZ-009** | **update** + **depends_on** TASK-BIZ-002 | §1.1: sheet is **interim only** until CyberOS live; after BIZ-002/003, CyberOS is the only SoR for status/next-action; weekly review runs from CyberOS exports. |
| **TASK-BIZ-010** | **leave** | Nurture programs; may later consume CyberOS segments (non-blocking). |
| **TASK-BIZ-011** | **leave** | Press/awards. |
| **TASK-BIZ-012** | **update** | PDPL review must include **CyberOS as processor/sub-processor** for leads + content, not only Anthropic chat transfer. |
| **TASK-BIZ-014** | **leave** | ISO/SOC path. |
| **TASK-BIZ-015** | **leave** | Citation monitoring. |

**Count check:** 21 ready tasks listed above (matches BACKLOG `ready_to_implement` set as of 2026-07-14).

### Done tasks whose §1 still assume local-only CMS (do not re-open unless shipping centralization)

| task | Note |
|---|---|
| TASK-CMS-001/007/010, TASK-SEO-011/015/016/017/018 | “Content module” language remains valid as **read interface**; implementation becomes adapter over CyberOS when OPS-019 lands |
| TASK-OPS-005 / TASK-OPS-014 | Stay as landing **persistence contract**; role becomes dual-write / cache under OPS-020 |
| TASK-BIZ-013 / `lib/content/policy.ts` | Keep git-reviewed commercial policy until CyberOS has approval + review cadence UX |

---

## 3. Minimal new task set (required)

Without these, remaining CMS/lead tasks will keep encoding the wrong SSOT.

### TASK-BIZ-016 — CyberOS central data platform for landing (leads + content)  
- **Class:** improvement · **Owner:** human · **Depends on:** —  
- **SHALL:** (1) CyberOS expose authenticated lead-intake + content publish APIs used by the landing site; (2) define data ownership (CyberOS SoR vs landing edge cache); (3) document env vars and failure modes; (4) PDPL retention/erasure story for leads and transcripts.  
- **Draft:** `docs/tasks/biz/TASK-BIZ-016-cyberos-central-data-platform/spec.md`

### TASK-OPS-019 — Landing content read model from CyberOS  
- **Class:** product · **Owner:** agent · **Depends on:** TASK-BIZ-016  
- **SHALL:** (1) versioned read contract for notes, work, testimonials, team; (2) build/runtime fetch with **git-module fallback** if CyberOS unavailable; (3) EN+VI parity gate; (4) no inventing CMS UI in the landing repo.  
- **Draft:** `docs/tasks/ops/TASK-OPS-019-cyberos-content-read-model/spec.md`

### TASK-OPS-020 — Lead dual-write and historical migration to CyberOS  
- **Class:** improvement · **Owner:** mixed · **Depends on:** TASK-BIZ-002, TASK-OPS-005  
- **SHALL:** (1) every `/api/lead` success path attempts CyberOS first; (2) local `lib/db` remains best-effort; (3) one-time migration of historical local leads; (4) zero silent loss + OPS-010 alerts on CyberOS failure.  
- **Draft:** `docs/tasks/ops/TASK-OPS-020-lead-dual-write-and-migration/spec.md`

### TASK-CMS-021 — Notes/blog authoring via CyberOS (deprecates `notes.ts` as write SSOT)  
- **Class:** product · **Owner:** mixed · **Depends on:** TASK-OPS-019, TASK-CMS-010  
- **SHALL:** (1) new posts authored in CyberOS with author/dates/TLDR; (2) landing `/notes` reads OPS-019; (3) migration of existing `lib/content/notes.ts` posts; (4) RSS/llms stay generated from the same read model.  
- **Draft:** `docs/tasks/cms/TASK-CMS-021-cyberos-notes-authoring/spec.md`

**Explicitly not proposed as separate tasks (covered above):** generic “move analytics to CyberOS”, “rebuild Prisma out”, “full headless CMS in Next”.

---

## 4. Suggested implementation order

```text
TASK-BIZ-001 (secrets) 
  → TASK-BIZ-016 (CyberOS platform capabilities) [human]
  → TASK-BIZ-002 + TASK-BIZ-003 (lead webhook live + e2e)
  → TASK-OPS-020 (dual-write + migrate history)
  → TASK-BIZ-009 (SLA ritual on CyberOS SoR)
  → TASK-OPS-019 (content read model)
  → TASK-CMS-021 (notes authoring)
  → update CMS-004/006/009 + CTA-016 to depend on OPS-019
```

Parallel, unblocked: TASK-A11Y-008/014, TASK-CTA-005 (when booking URL exists), TASK-BIZ-004/005/007/008/011/014/015.

---

## 5. What *not* to change yet

- Do **not** rewrite all of `lib/content/*` in one go; OPS-019 is the seam.
- Do **not** delete local Prisma adapter; dual-write is safer for serverless cold starts and CyberOS outages.
- Do **not** put commercial policy only in CyberOS until review cadence + history (BIZ-013 AC 1.4) is productized there.
- Analytics (TASK-OPS-011/012) stay first-party; not part of “leads + blogs” centralization.

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
| Lead intake task | `docs/tasks/biz/TASK-BIZ-002-cyberos-lead-intake/spec.md` |
| Local datastore task | `docs/tasks/ops/TASK-OPS-005-lead-db/spec.md` |

---

## 7. Next operator actions

1. Accept or edit the four **draft** tasks; promote to `ready_to_implement` after audit when CyberOS roadmap is clear.  
2. Apply the **update** notes to TASK-BIZ-002/009/012, TASK-CMS-004/006/009, TASK-CTA-016, TASK-BIZ-006 (agent can patch §1 in a follow-up TASK-authoring pass).  
3. Continue shipping unblocked tasks (A11Y, booking, directories) without waiting for CMS centralization.
