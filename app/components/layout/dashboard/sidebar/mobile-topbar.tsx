"use client";

import { Bell } from "lucide-react";
import { SidebarBrand } from "./sidebar-brand";
import { MobileMenuButton } from "./mobile-menu-button";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/app/lib/utils";

export function MobileTopbar() {
  const { mode } = useSidebar();

  if (mode !== "mobile") return null;

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-white sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-2">
        <MobileMenuButton />
        <SidebarBrand />
      </div>

      <button
        aria-label="Notifications"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl",
          "text-muted-strong hover:text-foreground hover:bg-surface-soft",
          "border border-border/60 transition-all duration-150",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        )}
      >
        <Bell size={17} strokeWidth={2} />
        <span className="absolute top-1.5 right-1.5 h-1.75 w-1.75 rounded-full bg-primary ring-2 ring-white" />
      </button>
    </header>
  );
}