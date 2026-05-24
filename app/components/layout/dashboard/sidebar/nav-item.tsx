"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/app/lib/utils";

interface NavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export function NavItem({ label, href, icon: Icon, badge }: NavItemProps) {
  const pathname = usePathname();
  const { collapsed, mode, closeMobile } = useSidebar();

  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const showLabel = mode === "mobile" || !collapsed;

  return (
    <li className="relative group/nav-item list-none">
      <Link
        href={href}
        onClick={mode === "mobile" ? closeMobile : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium",
          "transition-all duration-200 ease-out",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "min-h-11 md:min-h-9.5",
          isActive
            ? "bg-surface-soft text-primary shadow-sm"
            : "text-muted-strong hover:bg-surface-soft/60 hover:text-foreground",
          !showLabel && "justify-center px-2.5"
        )}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-primary"
          />
        )}

        <Icon
          size={18}
          strokeWidth={isActive ? 2.5 : 2}
          className={cn(
            "shrink-0 transition-colors duration-150",
            isActive
              ? "text-primary"
              : "text-muted group-hover/nav-item:text-foreground"
          )}
        />

        {showLabel && (
          <span className="flex-1 truncate leading-none">{label}</span>
        )}

        {badge !== undefined && badge > 0 && showLabel && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-warning/12 px-1.5 text-[11px] font-bold text-warning tabular-nums">
            {badge > 99 ? "99+" : badge}
          </span>
        )}

        {badge !== undefined && badge > 0 && !showLabel && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 h-1.75 w-1.75 rounded-full bg-warning ring-2 ring-white"
          />
        )}
      </Link>

      {!showLabel && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 z-50",
            "flex items-center gap-2 rounded-lg bg-foreground px-2.5 py-1.5",
            "text-[12px] font-medium text-white shadow-lg whitespace-nowrap",
            "opacity-0 scale-95 origin-left",
            "group-hover/nav-item:opacity-100 group-hover/nav-item:scale-100",
            "transition-all duration-150 ease-out"
          )}
        >
          <span
            aria-hidden="true"
            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground"
          />
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold text-white">
              {badge}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
