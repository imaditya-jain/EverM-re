"use client";

import { useSidebar } from "./sidebar-context";
import { SidebarBrand } from "./sidebar-brand";
import { NavSection } from "./nav-section";
import { SidebarUser } from "./sidebar-user";
import { CollapseToggle } from "./collapse-toggle";
import { NAV_SECTIONS } from "./nav-config";
import { cn } from "@/app/lib/utils";
import { useAppSelector } from "@/lib/hooks";

export function Sidebar() {
  const { collapsed } = useSidebar();
  const user = useAppSelector((state) => state.auth.user);
  const name = user ? `${user.firstName} ${user.lastName}` : "User";
  const email = user?.email || "";
  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "hidden md:flex",
        "relative flex-col h-screen",
        "transition-[width] duration-300 ease-out will-change-[width]",
        "md:w-17 lg:w-57",
        collapsed ? "lg:w-17" : "lg:w-57",
        "bg-white border-r border-border overflow-hidden"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-border px-3 py-4",
          "md:justify-center lg:justify-between",
          collapsed && "lg:justify-center"
        )}
      >
        <SidebarBrand />
        <div className={cn("hidden lg:flex", collapsed && "lg:hidden")}>
          <CollapseToggle />
        </div>
      </div>
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex flex-col gap-4">
          {NAV_SECTIONS.map((section, idx) => (
            <NavSection key={idx} section={section} />
          ))}
        </div>
      </nav>
      {collapsed && (
        <div className="hidden lg:flex justify-center px-2 py-2 border-t border-border">
          <CollapseToggle />
        </div>
      )}
      <div className="border-t border-border px-2 py-3">
        <SidebarUser name={name} email={email} initials={initials} />
      </div>
    </aside>
  );
}
