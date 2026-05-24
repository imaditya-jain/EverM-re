import {
  LayoutDashboard,
  Package,
  Sparkles,
  Settings,
  Store,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Products",
        href: "/dashboard/products",
        icon: Package,
      },
      {
        label: "AI SEO",
        href: "/dashboard/ai-seo",
        icon: Sparkles,
        badge: 18,
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        label: "Store Connection",
        href: "/dashboard/store",
        icon: Store,
      },
    ],
  },
];