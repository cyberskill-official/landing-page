/**
 * TASK-BIZ-006: permission / consent records for proof assets and team members.
 * No client name, logo, quote, photo, or metric ships without a record here
 * (or on the content entity once TASK-OPS-019 / CyberOS meta lands).
 */

export type PermissionScope =
  | "name"
  | "logo"
  | "metrics"
  | "quote"
  | "photo"
  | "screenshot"
  | "industry_only"
  | "team_profile";

export type PermissionRecord = {
  /** Stable id referenced from content entities */
  id: string;
  /** Who granted (client contact or team member) */
  grantedBy: string;
  /** ISO date YYYY-MM-DD */
  grantedAt: string;
  /** Evidence pointer: email thread, doc URL, ticket id, etc. */
  reference: string;
  scopes: PermissionScope[];
  /** Optional note (never published as public copy) */
  note?: string;
};

/**
 * Client proof permissions (case studies, logos, testimonials).
 * Operator attestation 2026-07-15: clients allowed all permissions for published
 * case-study content (see docs/verification/fr-biz-006-permissions-2026-07-15.md).
 */
export const clientPermissions: PermissionRecord[] = [
  {
    id: "client-logistics-ops-2026",
    grantedBy: "Client contact (logistics operations)",
    grantedAt: "2026-07-15",
    reference: "operator-attestation:2026-07-15#all-permissions;slug=operations-platform",
    scopes: ["industry_only", "metrics", "name"],
    note: "NDA industry label on site; metrics cleared for public case study",
  },
  {
    id: "client-eduspark-2026",
    grantedBy: "Client contact (EduSpark Vietnam)",
    grantedAt: "2026-07-15",
    reference: "operator-attestation:2026-07-15#all-permissions;slug=member-mobile-app",
    scopes: ["name", "metrics", "quote", "logo", "photo", "screenshot"],
    note: "Named case study EduSpark Vietnam; all scopes approved",
  },
  {
    id: "client-linn-decor-2026",
    grantedBy: "Client contact (Linn Decor)",
    grantedAt: "2026-07-15",
    reference: "operator-attestation:2026-07-15#all-permissions;slug=commerce-portal",
    scopes: ["name", "metrics", "quote", "logo", "photo", "screenshot"],
    note: "Named case study Linn Decor; all scopes approved",
  },
  {
    id: "client-healthcare-2026",
    grantedBy: "Client contact (healthcare)",
    grantedAt: "2026-07-15",
    reference: "operator-attestation:2026-07-15#all-permissions;slug=legacy-migration",
    scopes: ["industry_only", "name", "metrics"],
    note: "NDA industry label on site; migration narrative cleared",
  },
];

/**
 * Team publication consents (TASK-BIZ-006 §1.4 / TASK-CMS-006 §1.4).
 * Founder public profile is self-consented for site publication.
 */
export const teamConsents: PermissionRecord[] = [
  {
    id: "team-stephen-2026",
    grantedBy: "Mr. Stephen",
    grantedAt: "2026-07-14",
    reference: "founder-self-consent:public-linkedin+site-entity",
    scopes: ["team_profile", "name", "photo"],
    note: "Founder consents to name, role, bio, and LinkedIn on /team",
  },
];

export function findPermission(
  id: string,
  list: PermissionRecord[] = [...clientPermissions, ...teamConsents],
): PermissionRecord | undefined {
  return list.find((p) => p.id === id);
}

export function requirePermission(
  id: string | undefined,
  list: PermissionRecord[] = [...clientPermissions, ...teamConsents],
): PermissionRecord {
  if (!id) {
    throw new Error("Missing permission id on content entity");
  }
  const p = findPermission(id, list);
  if (!p) {
    throw new Error(`No permission record for id=${id}`);
  }
  return p;
}
