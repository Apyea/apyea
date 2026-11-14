import { UserRole } from "@prisma/client";

export const STAFF_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.EXECUTIVE_MANAGER,
  UserRole.OPERATIONAL_MANAGER,
];

export const FINANCE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.EXECUTIVE_MANAGER,
  UserRole.OPERATIONAL_MANAGER,
];

export function isStaffRole(role: string): role is UserRole {
  return (STAFF_ROLES as string[]).includes(role);
}

export function canAccessFinance(role: UserRole) {
  return FINANCE_ROLES.includes(role);
}

export const MASTER_DATA_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.EXECUTIVE_MANAGER,
];

export const ADMIN_ONLY_ROLES: UserRole[] = [UserRole.ADMIN];
