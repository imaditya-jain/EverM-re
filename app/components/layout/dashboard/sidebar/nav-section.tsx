"use client";

import { useSidebar } from "./sidebar-context";
import { NavItem } from "./nav-item";
import { NavSection as NavSectionType } from "./nav-config";
import { cn } from "@/app/lib/utils";

interface NavSectionProps {
  section: NavSectionType;
}

export function NavSection({ section }: NavSectionProps) {
  const { collapsed, mode } = useSidebar();
  const showLabel = mode === "mobile" || !collapsed;

  return (
    <div className="flex flex-col gap-0.5">
      {section.title && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            showLabel ? "h-5 opacity-100 mb-1" : "h-0 opacity-0 mb-0"
          )}
        >
          <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-muted/60 select-none">
            {section.title}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-0.5 m-0 p-0">
        {section.items.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </ul>
    </div>
  );
}
