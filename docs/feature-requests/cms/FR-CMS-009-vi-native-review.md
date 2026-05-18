---
id: FR-CMS-009
title: "Vietnamese script + UI string native-speaker review — out-of-team paid reviewer, rubric-driven, register defense"
module: CMS
priority: MUST
status: blocked
blocked_reason: "External paid Vietnamese native-speaker reviewer, receipt, and founder signoff are still required. Rubric, banned-phrase gate, and review packet are ready."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Founder + External Vietnamese Reviewer
created: 2026-05-16
related_frs: [FR-CMS-003, FR-CMS-007, FR-CMS-010, FR-CHAR-003, FR-SCENE-017]
depends_on: [FR-CMS-003]
blocks: []
language: documentation + content review process
service: content/narrative/lines/ + apps/web/messages/vi.json
new_files:
  - content/narrative/lines/native-review-2026-MM-DD.md
  - content/narrative/lines/VI_REGISTER_RUBRIC.md
  - content/narrative/lines/banned-phrases.txt

source_pages:
  - docs/01-master-plan-v2.md §10 — "Phase 5 VI localization with native review"
  - FR-CMS-003 — Vietnamese variant rules
  - FR-CHAR-003 — cultural-note casual register specification
  - FR-SCENE-017 — Vietnam → Global cultural anchor

effort_hours: 6
risk_if_skipped: "Vietnamese audience is 90% of CyberSkill's primary market. Bad Vietnamese (machine-translated, formal-where-casual, wrong dialect) feels foreign + amateur. Brand authenticity collapses. Founder cannot self-review alone — needs out-of-team eyes."
---

## §1 — Description (BCP-14 normative)

1. **MUST** engage a Vietnamese native speaker (NOT on the build team) to review:
   - `content/narrative/lines/vi.json` (scene narration).
   - `apps/web/messages/vi.json` (UI strings: buttons, form labels, error messages).
   - `content/accessibility/*.vi.md` (accessibility statement Vietnamese variant).
   - Footer copy, legal text, all locale strings.
2. **MUST** review per the `VI_REGISTER_RUBRIC.md` guidance (slightly poetic + dialect-neutral + casual nón lá register per FR-CHAR-003):
   - **Register:** casual / friendly / conversational. NOT formal/literary. NOT slang.
   - **Dialect:** standard / neutral (Hanoi-leaning written norm).
   - **Tone:** slightly poetic for narrative (Lumi's lines); plain + warm for UI.
   - **Banned phrases:** machine-translation-prone Westernisms; over-formal registers.
3. **MUST** archive review feedback at `content/narrative/lines/native-review-{YYYY-MM-DD}.md` with per-string: original / suggested / accept-or-reject / rationale.
4. **MUST** review must be paid (~$300-500). Not unpaid favor; signals quality intent.
5. **MUST** hold the register-rules line — if reviewer pushes formal, founder defers to brand voice (FR-CHAR-003) per rubric.
6. **MUST** include cultural-fit review of Scene 5 Vietnamese content + Vietnamese tagline (FR-CMS-010).
7. **MUST** be re-run when major Vietnamese content drops (new case studies, etc.).

## §2 — Why this design

**Why out-of-team reviewer?** Founder is Vietnamese but in the build; can't see his own blind spots. Native speaker outside the project provides independent eyes.

**Why rubric?** Reviewers without rubric default to standard formal Vietnamese. Our brand voice is casual. Rubric anchors the review.

**Why "banned phrases"?** Common machine-translation mistakes caught explicitly.

**Why paid?** Friend-favor reviews are perfunctory. Paid is professional + accountable.

**Why review-the-reviewer?** Sometimes natives push formal because "sounds proper." We defer to BRAND voice (casual) over native-speaker preference if conflict.

**Why archive?** Audit trail. Future query: "why is this phrase like this?" — answer in review doc.

## §3 — Public surface

```markdown
<!-- content/narrative/lines/VI_REGISTER_RUBRIC.md -->
# Vietnamese register rubric

## Register: casual & warm
- Use "bạn" (informal you) for visitors; "chúng tôi" (we) for team.
- Avoid "Quý khách", "Kính chào".
- Imagine a creative studio Vietnamese host welcoming foreign + local friends.

## Dialect: neutral
- Standard written Vietnamese, Hanoi-leaning norms.
- Avoid strong dialect markers.

## Poetic register (Lumi narration)
- Slightly lyrical, evocative — folk story to a friend.
- Example: "Lumi — vì ánh sáng biến nguyện ước thành sự thật"

## UI strings: plain + warm
- Concise. Friendly. Direct.
- Buttons: imperative ("Gửi" not "Vui lòng gửi").

## Banned phrases
- Kính chào quý khách (over-formal)
- Direct translations of "scale your business" → translate intent
- Heavy jargon ("nền tảng đột phá")
- Western idioms
```

```markdown
<!-- content/narrative/lines/native-review-2026-05-22.md -->
# Vietnamese review — 2026-05-22

**Reviewer:** [Name] — Vietnamese native, Hanoi freelance translator, no CyberSkill relation
**Engagement:** 6 hours over 2 days, paid $400 via Wise.

## Summary
Reviewed 87 strings. Revised 23 (26%). No fundamental register issues; minor word-choice + diacritics.

Recurring patterns: Southern dialect bias (5 cases), auto-translation awkwardness (3 cases).

## Per-string

### Scene 0 narration
- Original: "Một buổi chiều ấm áp ở Sài Gòn..."
- Suggestion: "Một buổi chiều ấm áp tại Sài Gòn..."
- Decision: Accepted ("tại" more standard).

### Button "Partner with us"
- Original: "Hợp tác với chúng tôi"
- Suggestion: "Cùng hợp tác"
- Decision: Rejected (suggestion loses "with us" clarity).

[... full list ...]

## Cultural review (Scene 5 + tagline)
- Scene 5 narration: appropriate tone, no religious/political concerns. Approved.
- Tagline "Vì ánh sáng biến nguyện ước thành sự thật": cultural fit, diacritics correct. Approved.

## Sign-off
- Reviewer: [signature, date]
- Founder: [signature, date]
```

```text
<!-- content/narrative/lines/banned-phrases.txt -->
Kính chào quý khách
Quý khách
Kính thưa
Trân trọng kính mời
... (full list)
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Review document present | File exists |
| 2 | Reviewer paid (receipt archived) | Founder confirmation |
| 3 | All flagged issues triaged with decision + rationale | Doc structure |
| 4 | Accepted revisions merged into vi.json + content/* | Diff vs review doc |
| 5 | VI_REGISTER_RUBRIC.md present + used | File + reference |
| 6 | Banned phrases list curated | banned-phrases.txt non-empty |
| 7 | Scene 5 + tagline reviewed | Doc section |
| 8 | Founder signoff on final list | Doc signoff |
| 9 | Re-run scheduled for major content additions | Process doc |

## §5 — Verification

```bash
# Doc structure check
test -f content/narrative/lines/native-review-2026-05-22.md
grep -q "Reviewer:" content/narrative/lines/native-review-2026-05-22.md
grep -q "Per-string" content/narrative/lines/native-review-2026-05-22.md
grep -q "Sign-off" content/narrative/lines/native-review-2026-05-22.md

# Verify accepted revisions in vi.json
jq '.scene0.narration' apps/web/messages/vi.json
```

## §6 — Dependencies

**Concept:** FR-CMS-003 (variant content source), FR-CMS-007 (locale loader consumer), FR-CMS-010 (tagline review), FR-CHAR-003 (register rules), FR-SCENE-017 (cultural anchor).

**Operational:** Reviewer engagement via Upwork / founder's network. Wise / PayPal for payment.

**Downstream:** All Vietnamese content; FR-A11Y-012 audit consumes review status.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Reviewer pushes formal register | Conflict in doc | Hold per FR-CHAR-003; document rejection |
| Reviewer doesn't catch cultural mis-step | Founder cross-check | Multi-reviewer for high-stakes |
| Surface-level review | Time budget tight | Pay for 6h+; per-string entries mandatory |
| Reviewer in CyberSkill orbit (bias) | Screen | Outside founder's network |
| Diacritic corruption in source | Visual | UTF-8 throughout (FR-SEO-001 guard) |
| Review archived but vi.json not updated | AC#4 | Merge step explicit |
| Banned phrases missing entries | Discovery | Add patterns as found |
| Reviewer unavailable | Process | Cycle 2-3 reviewers/year |
| Drift after launch | Quarterly mini-review | Schedule |
| Tagline cultural concern | Specific signoff | Required doc section |
| Founder defers wrong on register | Voice creep | Periodic re-read FR-CHAR-003 |
| Hanoi vs Saigon dialect debate | Default | Standard written = Hanoi baseline |
| Reviewer demands credit | Documentation | Acknowledge if requested |

## §8 — Deliverable preview

Founder receives review doc; merges accepted revisions:
1. 26% strings revised; minor word choice + diacritics.
2. vi.json updated.
3. Cultural anchors approved.
4. Doc archived.
5. Reviewer paid $400; available for future.

## §9 — Notes

**On finding reviewers:** Upwork freelance Vietnamese translators with literary/marketing background. Vet 2-3 with sample paragraph.

**On register vs preference:** Brand voice (FR-CHAR-003) authoritative; reviewer advisory.

**On re-engagement:** Major content drop → mini-review. Annual full re-review.

*End of FR-CMS-009.*
