---
id: FR-OPS-004
title: "Env and secret management across production and preview, with separate keys"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-G, growth/LEAD-01, audit-A/section-8]
---

# FR-OPS-004: Env and secret management across production and preview, with separate keys

## 0. Why (evidence)

Research doc §G. Every FR that touches a lead sink, a datastore, a KV or an AI key depends on this being right, and the
2026-07-11 audits add the stakes: PDPL fines reach 5% of prior-year revenue for a cross-border transfer breach, and a
leaked preview key that can write production data is exactly that class of incident. Raised to MUST.

## 1. Description (normative)

- 1.1 Production and preview SHALL use separate keys for every provider, so a leaked preview key can reach neither production traffic, quota, nor production data.
- 1.2 `.env.example` SHALL enumerate every required variable by name with placeholder values only, so a fresh checkout knows what to set.
- 1.3 `docs/deploy/env-vars.md` SHALL document each variable: what it is, where it is set, which environments consume it, and what breaks when it is absent.
- 1.4 A CI check SHALL assert that no secret value and no `NEXT_PUBLIC_`-prefixed secret appears in the client bundle or the repository.
- 1.5 The code SHALL read every provider key from server env and SHALL fail closed (a named error, never a silent no-op on a write path) when a required production key is absent; provisioning the separate production and preview key VALUES is FR-BIZ-001.

## 2. Acceptance criteria

- [ ] AC for 1.1 - production and preview resolve distinct keys, verified in the provider dashboards - evidence: screenshots recorded
- [ ] AC for 1.2 - .env.example lists every variable the code reads, with placeholders only - test: `ci/env-example-parity`
- [ ] AC for 1.3 - the env doc maps each variable to its environments - test: `docs/env-vars`
- [ ] AC for 1.4 - a seeded secret in the client bundle fails CI - test: `ci/no-public-secrets`
- [ ] AC for 1.5 - with a required production key absent, the write path returns a named error and the alert fires - test: `ci/env-fail-closed`

## 3. Edge cases

- A preview deployment must never email a real lead or write to the production CRM.
- A variable added in code but not in .env.example must fail CI, not surprise the next deploy.

## 4. Out of scope / non-goals

- Obtaining the credentials themselves (FR-BIZ-001).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.2: every secret lives only in server env; no NEXT_PUBLIC_ secret, ever (NFR-SEC-001).
- NFR-SEC-001 keyless secrets: no secret is ever committed or exposed to the client.
