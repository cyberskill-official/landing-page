export const CMS_DELETE_ALLOWED_ROLES = ['administrator', 'developer', 'content-lead'] as const;

export type CmsDeleteAllowedRole = (typeof CMS_DELETE_ALLOWED_ROLES)[number];

export function canDeleteDocument(roleNames: readonly string[]): boolean {
  return roleNames.some((roleName) =>
    CMS_DELETE_ALLOWED_ROLES.includes(roleName as CmsDeleteAllowedRole),
  );
}

export const TEAM_MEMBER_FORBIDDEN_FIELDS = [
  'email',
  'phone',
  'real_name',
  'legal_name',
  'home_location',
  'address',
  'dependents',
  'salary',
  'age',
  'linkedIn',
  'linkedin',
  'linked_in',
] as const;

