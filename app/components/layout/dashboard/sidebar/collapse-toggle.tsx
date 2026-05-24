"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/app/lib/utils";

export function CollapseToggle() {
  const { collapsed, toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
        "text-muted hover:text-foreground hover:bg-surface-soft",
        "border border-transparent hover:border-border",
        "transition-all duration-200 ease-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      )}
    >
      {collapsed ? (
        <PanelLeftOpen size={16} strokeWidth={2} />
      ) : (
        <PanelLeftClose size={16} strokeWidth={2} />
      )}
    </button>
  );
}