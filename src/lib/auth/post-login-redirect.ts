import { UserRole } from "@prisma/client";

const STAFF_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.EXECUTIVE_MANAGER,
  UserRole.OPERATIONAL_MANAGER,
];

export function postLoginRedirectPath(role: UserRole, explicitRedirect?: string | null): string {
  if (explicitRedirect?.startsWith("/") && !explicitRedirect.startsWith("//")) {
    return explicitRedirect;
  }
  if (STAFF_ROLES.includes(role)) {
    return "/admin";
  }
  return "/member";
}
