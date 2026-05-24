"use client";

import { Menu, X } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/app/lib/utils";

export function MobileMenuButton({ className }: { className?: string }) {
  const { mobileOpen, toggleMobile } = useSidebar();

  return (
    <button
      onClick={toggleMobile}
      aria-label={mobileOpen ? "Close menu" : "Open menu"}
      aria-expanded={mobileOpen}
      aria-controls="mobile-drawer"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        "text-muted-strong hover:text-foreground hover:bg-surface-soft",
        "border border-border/60",
        "transition-all duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      {mobileOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
    </button>
  );
}