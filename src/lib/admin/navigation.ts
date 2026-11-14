import { UserRole } from "@prisma/client";
import { canAccessFinance, MASTER_DATA_ROLES, STAFF_ROLES } from "@/lib/auth/staff-roles";

export type AdminIconName =
  | "home"
  | "users"
  | "clipboard"
  | "table"
  | "chart"
  | "banknotes"
  | "receipt"
  | "building"
  | "calendar"
  | "arrow-path";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
  roles: UserRole[];
  /** Prefix match for active state (default: exact href). */
  matchPrefix?: boolean;
};

export type AdminNavCategory = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

const ALL_STAFF = STAFF_ROLES;
const FINANCE = [
  UserRole.ADMIN,
  UserRole.EXECUTIVE_MANAGER,
  UserRole.OPERATIONAL_MANAGER,
] as const;
const MASTER_NAV = MASTER_DATA_ROLES;

export const ADMIN_NAV: AdminNavCategory[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { href: "/admin", label: "Overview", icon: "home", roles: [...ALL_STAFF] },
    ],
  },
  {
    id: "membership",
    label: "Membership",
    items: [
      {
        href: "/admin/membership/applications",
        label: "Applications",
        icon: "users",
        roles: [...ALL_STAFF],
        matchPrefix: true,
      },
    ],
  },
  {
    id: "website",
    label: "Website",
    items: [
      {
        href: "/admin/team",
        label: "Our Team",
        icon: "users",
        roles: [...ALL_STAFF],
        matchPrefix: true,
      },
    ],
  },
  {
    id: "events",
    label: "Events",
    items: [
      {
        href: "/admin/events/registrations",
        label: "Registrations",
        icon: "calendar",
        roles: [...ALL_STAFF],
        matchPrefix: true,
      },
      {
        href: "/admin/events",
        label: "Registration settings",
        icon: "calendar",
        roles: [...ALL_STAFF],
        matchPrefix: true,
      },
    ],
  },
  {
    id: "surveys",
    label: "Educator surveys",
    items: [
      {
        href: "/admin/surveys",
        label: "All surveys",
        icon: "clipboard",
        roles: [...ALL_STAFF],
        matchPrefix: true,
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { href: "/admin/finance", label: "Summary", icon: "chart", roles: [...FINANCE] },
      {
        href: "/admin/finance/expenses",
        label: "Expenditure",
        icon: "receipt",
        roles: [...FINANCE],
      },
      {
        href: "/admin/finance/income",
        label: "Manual income",
        icon: "banknotes",
        roles: [...FINANCE],
      },
      {
        href: "/admin/finance/catalog",
        label: "Programs & plans",
        icon: "building",
        roles: [...FINANCE],
      },
      {
        href: "/admin/finance/renewals",
        label: "Renewals",
        icon: "arrow-path",
        roles: [...FINANCE],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        href: "/admin/master",
        label: "Master data",
        icon: "table",
        roles: [...MASTER_NAV],
        matchPrefix: true,
      },
    ],
  },
];

export function navForRole(role: UserRole): AdminNavCategory[] {
  return ADMIN_NAV.map((category) => ({
    ...category,
    items: category.items.filter((item) => item.roles.includes(role)),
  })).filter((category) => category.items.length > 0);
}

export function roleCanAccessPath(role: UserRole, pathname: string): boolean {
  if (!STAFF_ROLES.includes(role)) return false;
  if (canAccessFinance(role) && pathname.startsWith("/admin/finance")) {
    return true;
  }
  if (pathname.startsWith("/admin/team") || pathname.startsWith("/admin/events")) {
    return STAFF_ROLES.includes(role);
  }
  for (const category of ADMIN_NAV) {
    for (const item of category.items) {
      if (!item.roles.includes(role)) continue;
      const matches = item.matchPrefix
        ? pathname === item.href || pathname.startsWith(`${item.href}/`)
        : pathname === item.href;
      if (matches) return true;
    }
  }
  if (pathname === "/admin" || pathname === "/admin/") return STAFF_ROLES.includes(role);
  return false;
}

export function defaultAdminLanding(role: UserRole): string {
  if (canAccessFinance(role)) return "/admin/finance";
  return "/admin/membership/applications";
}
