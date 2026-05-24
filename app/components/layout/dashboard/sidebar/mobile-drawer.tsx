"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { SidebarBrand } from "./sidebar-brand";
import { NavSection } from "./nav-section";
import { SidebarUser } from "./sidebar-user";
import { NAV_SECTIONS } from "./nav-config";
import { cn } from "@/app/lib/utils";

export function MobileDrawer() {
  const { mobileOpen, closeMobile } = useSidebar();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden",
          "transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        id="mobile-drawer"
        aria-label="Navigation menu"
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-70 md:hidden",
          "flex flex-col bg-white shadow-2xl shadow-black/10",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >

        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <SidebarBrand />
          <button
            onClick={closeMobile}
            aria-label="Close menu"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "text-muted hover:text-foreground hover:bg-surface-soft",
              "border border-transparent hover:border-border",
              "transition-all duration-150",
              "outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            )}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex flex-col gap-4">
            {NAV_SECTIONS.map((section, idx) => (
              <NavSection key={idx} section={section} />
            ))}
          </div>
        </nav>

        <div className="border-t border-border px-3 py-3">
          <SidebarUser name="Aditya" email="aditya@example.com" initials="A" />
        </div>
      </aside>
    </>
  );
}