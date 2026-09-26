export interface NavItem {
  label: string;
  href: string;
}

export const primaryNavigation: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Journal", href: "/journal" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "About", href: "/about" },
];

export const utilityNavigation: NavItem[] = [
  { label: "Search", href: "/search" },
  { label: "Account", href: "/account" },
  { label: "Bag", href: "/bag" },
];
