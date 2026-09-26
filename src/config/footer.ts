import type { NavItem } from "./navigation";

/**
 * Footer Navigation Configuration — Stage 4.14
 *
 * Organizes footer links into labeled groups for the SiteFooter component.
 * Uses the same NavItem type as the main navigation for consistency.
 */

export type FooterNavGroup = {
  /** Group heading displayed above the links. */
  heading: string;
  /** Navigation items within this group. */
  items: NavItem[];
};

export const footerNavGroups: FooterNavGroup[] = [
  {
    heading: "Shop",
    items: [
      { label: "All Products", href: "/shop" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    heading: "Discover",
    items: [
      { label: "Journal", href: "/journal" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Campaigns", href: "/campaigns" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "My Account", href: "/account" },
      { label: "Bag", href: "/bag" },
    ],
  },
  {
    heading: "Information",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
  },
];
