/**
 * FR-BIZ-006: permission / consent records for proof assets and team members.
 * No client name, logo, quote, photo, or metric ships without a record here
 * (or on the content entity once FR-OPS-019 / CyberOS meta lands).
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
 * Empty until the owner records real grants (FR-BIZ-006 §1.2).
 */
export const clientPermissions: PermissionRecord[] = [];

/**
 * Team publication consents (FR-BIZ-006 §1.4 / FR-CMS-006 §1.4).
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
