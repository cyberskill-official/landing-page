---
id: TASK-OPS-018
title: "Secure prune cron API route against spoofing via edge routing and signature validation"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [TASK-CHAR-028]
routed_back_count: 0
awh: N/A
---

# TASK-OPS-018: Secure prune cron API route against spoofing via edge routing and signature validation

## 0. Why (evidence)
The lead data pruning cron endpoint (/api/cron/prune) is critical for PDPL compliance. To prevent malicious actors from triggering unauthorized prune requests or attempting denial of service (DoS) attacks on the database, the endpoint must be locked down beyond a simple query secret.

## 1. Description (normative)
- 1.1 The `/api/cron/prune` API route SHALL validate security headers (like `CRON_SECRET` env variables and provider-specific signature headers) before executing.
- 1.2 The route SHALL reject requests from unauthorized IP ranges or direct public requests if supported by the edge network.
- 1.3 Execution metrics (records pruned, duration) SHALL be logged securely with masking of any potentially sensitive debug outputs.

## 2. Acceptance criteria
- [ ] AC for 1.1 - requests missing the secret or signature are rejected with 401 Unauthorized - test: `security/cron-token-validation`
- [ ] AC for 1.2 - requests with expired signatures or bad headers fail immediately - test: `security/cron-signature-failure`
- [ ] AC for 1.3 - execution is audited in server logs without exposing record details - test: `security/cron-audit-logging`

## 3. Edge cases
- Vercel or hosting platform system cron service updating signature keys, causing legitimate pruning tasks to fail verification.
- Time drift between the signer and the receiver server breaking timestamp validation.

## 4. Out of scope
- Implementation of global IP blocking rules (handled at CDN firewall / WAF).

## 5. Protected invariants
- Restricting access to the cron route must never throw server errors that block other visitor API paths.
