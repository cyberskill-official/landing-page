---
id: TASK-OPS-014
title: "Integrate Prisma PostgreSQL client with connection pooling and secure credentials"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [TASK-OPS-005]
routed_back_count: 0
awh: N/A
---

# TASK-OPS-014: Integrate Prisma PostgreSQL client with connection pooling and secure credentials

## 0. Why (evidence)
To transition from the developer-centric InMemoryAdapter to a secure, enterprise-ready relational datastore (PostgreSQL) when `DATABASE_URL` is set in production. This will enforce data durability across serverless function lifecycles and ensure PDPL compliance audits are backed by a real SQL store.

## 1. Description (normative)
- 1.1 The database adapter factory SHALL initialize a PrismaClient configured for PostgreSQL connection pooling when `DATABASE_URL` is present.
- 1.2 The Prisma client integration SHALL configure connection timeouts and retry limits to survive transient serverless cold starts.
- 1.3 The production database integration SHALL run all writes inside transactions where necessary to link lead updates and transcripts atomically.
- 1.4 The schema migration path SHALL be managed via versioned schema.sql and validated in production deployment before connection starts.

## 2. Acceptance criteria
- [ ] AC for 1.1 - when DATABASE_URL is set, the Prisma adapter initializes and retrieves records - test: `db/prisma-initialization`
- [ ] AC for 1.2 - connection timeout errors fail safe to no-op without crashing the handler - test: `db/prisma-connection-fallback`
- [ ] AC for 1.3 - saving transcript linked to lead uses transactions to maintain integrity - test: `db/prisma-atomic-writes`
- [ ] AC for 1.4 - SQL schema matches the database model definitions exactly - test: `db/schema-parity`

## 3. Edge cases
- Serverless database connections exhausting pool capacity.
- Database credentials containing special characters requiring URL encoding.

## 4. Out of scope
- Dynamic SQL queries or raw database executions without Prisma models.
- Database provisioning or hosting setups (deferred to human operations TASK-BIZ-002).

## 5. Protected invariants
- User leads and transcripts must never be exposed or logged in raw query outputs.
