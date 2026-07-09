# Epic 1 - lead pipeline

Goal: a submitted lead provably reaches a human and a durable store, and the pipeline can never break silently. This epic gates everything else; a site that converts better into a black hole converts nothing.

Context: app/api/lead/route.ts fans out to four sinks (JSONL file, Resend email, Slack webhook, CyberOS webhook). The file sink always fails on Vercel's read-only filesystem; the other three no-op until their env vars exist. Both the classic form (components/cta/LeadForm.tsx) and Lumi chat (components/genie/GenieChatPanel.tsx) post to this route.

---

### LEAD-01 Configure lead sink env vars + Resend domain
Wave 1 | owner: human | effort: S | depends: none

Why: without these, production leads exist only as console lines in Vercel function logs.

Do:
1. In Resend: add and verify the cyberskill.world sending domain (add the SPF, DKIM, and DMARC DNS records Resend shows). Create an API key.
2. In Vercel (project settings, Production env): set RESEND_API_KEY; optionally LEAD_EMAIL_FROM (defaults to "CyberSkill Leads <leads@cyberskill.world>").
3. Optionally set LEAD_SLACK_WEBHOOK_URL (create an incoming webhook in the team Slack).
4. Redeploy so the env takes effect.

Done when: env vars visible in Vercel production, Resend domain shows verified, and a test email from the route arrives at info@cyberskill.world (see LEAD-05).

---

### LEAD-02 Deploy CyberOS lead-intake endpoint + wire webhook
Wave 1 | owner: human | effort: M | depends: none

Why: CyberOS is the intended durable system of record for leads (FR-BIZ-001). Until it is live, there is no queryable lead store.

Do:
1. In the cyberos repo: review branch auto/lead-intake (POST /v1/chat/leads, shared-secret auth, clippy/test green as of 2026-07-04), merge, and deploy.
2. Set the shared secret on the CyberOS side, then in Vercel set LEAD_CRM_WEBHOOK_URL=https://os.cyberskill.world/v1/chat/leads and LEAD_CRM_TOKEN to the same secret.
3. Redeploy the landing page.

Done when: a POST from the production site returns 2xx and the lead row is visible in CyberOS.

---

### LEAD-03 Sentry alert when every lead sink fails
Wave 1 | owner: agent | effort: S | depends: none

Why: the fan-out is best-effort by design (the user always gets ok:true), so a fully dead pipeline is invisible today.

Do:
1. In app/api/lead/route.ts, after Promise.allSettled, count rejected sinks against configured sinks (a sink with no env var configured counts as skipped, not failed).
2. If every configured sink failed, or zero sinks are configured in production, call Sentry.captureException (or captureMessage, level error) with the per-sink reasons; keep the ok:true response.
3. Unit test: mock all sinks to reject and assert the Sentry capture is called and the response stays ok:true. Follow the existing test setup under tests/.

Done when: test proves capture-on-total-failure and capture-on-zero-configured; gates green.

---

### LEAD-04 Weekly synthetic lead check in CI
Wave 1 | owner: agent | effort: M | depends: LEAD-03

Why: the report promises "a broken pipeline can never stay broken for a month"; this is the mechanism.

Do:
1. Extend lib/lead/schema.ts handling so source "synthetic" is accepted; in the route, a synthetic lead skips the CyberOS forward (or tags the record test=true) and prefixes the email subject with [SYNTHETIC].
2. Add scripts/synthetic-lead.mjs: POST a fixed payload (name "Synthetic Check", email synthetic@cyberskill.world, source "synthetic") to https://cyberskill.world/api/lead and fail non-2xx.
3. Add .github/workflows/synthetic-lead.yml on a weekly cron; a failing run notifies via GitHub's failure email (Slack step optional, env-gated).
4. Document the expected weekly [SYNTHETIC] email in this file's ledger entry.

Done when: workflow file exists, script runs green against a local dev server in CI or locally, and the behavior (skip CRM, tagged subject) is unit-tested.

---

### LEAD-05 Production end-to-end lead test (form + chat)
Wave 1 | owner: human | effort: S | depends: LEAD-01 (LEAD-02 for the CyberOS leg)

Why: only a real submission proves the whole chain.

Do:
1. On https://cyberskill.world/en, submit the classic form with a real test message; repeat via Lumi chat's lead flow; repeat once on /vi.
2. Confirm each arrives: email at info@, Slack ping (if configured), CyberOS record (if LEAD-02 done). Reply to the email to confirm Reply-To goes back to the sender.
3. Record the evidence (timestamps, screenshots or message links) in LEDGER.md.

Done when: all three submissions confirmed received on every configured sink.
