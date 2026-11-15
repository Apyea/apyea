/** Canonical public marketing nav — use everywhere (header, footer). */
export type PublicNavItem = {
  href: string;
  label: string;
};

export const PUBLIC_SITE_NAV: PublicNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/team", label: "Our Team" },
  { href: "/events", label: "Programmes" },
  { href: "/membership/apply", label: "Membership" },
  { href: "/survey", label: "Yoga Educators" },
  { href: "/login", label: "Sign in" },
];

/** Home page section anchors (footer / secondary links only). */
export const LANDING_SECTION_NAV: PublicNavItem[] = [
  { href: "/#about", label: "About" },
  { href: "/#vision", label: "Vision" },
  { href: "/#programs", label: "Programmes" },
  { href: "/join", label: "Join campaign" },
];