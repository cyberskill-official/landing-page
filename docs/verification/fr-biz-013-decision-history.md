# FR-BIZ-013 decision history evidence (AC 1.4)

**FR:** FR-BIZ-013 — Decide the commercial policy the site is allowed to publish  
**Recorded:** 2026-07-14  
**Mechanism:** in-module append-only list `commercialPolicyHistory` in `lib/content/policy.ts`

## Rule

A decision the company cannot keep is recorded as **changed** or **withdrawn** in
`commercialPolicyHistory`. It is never rewritten into vaguer public copy in
`commercialPolicy`. Dependents must call `isDecisionPublishable(field)` (and
`isPolicyPublishable(policy)`) before rendering commercial strings.

## Initial owner approval (2026-07-14)

| Field | Status | Note |
|---|---|---|
| ctaPromise | active | Owner-approved outcome-led CTA promise |
| engagementModels | active | Dedicated Senior Team + Fixed-Scope Delivery |
| capacity | active | 3 projects/quarter; next open Q4 2026 |
| registrationNumber | active | 0316489568 |
| partnershipOffer | active | HCMC senior engineers / timezone alignment |
| heroAudience | active | fast-growing startups and scaling enterprises |

## Subsequent changes

*(none yet — append here and in `commercialPolicyHistory` when a decision is
withdrawn or superseded; leave the prior value on the history entry, do not
soften the live field into a placeholder.)*
