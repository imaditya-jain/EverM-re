"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/app/lib/utils";

export function SidebarBrand() {
  const { collapsed, mode } = useSidebar();

  const showLabel = mode === "mobile" || !collapsed;

  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-1 py-1",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "transition-all duration-200",
        !showLabel && "justify-center"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
        <Bot size={15} className="text-white" strokeWidth={2} />
      </div>

      <div
        className={cn(
          "overflow-hidden whitespace-nowrap transition-all duration-200 ease-out",
          showLabel ? "w-34 opacity-100" : "w-0 opacity-0"
        )}
      >
        <span className="text-[16px] font-bold tracking-tight text-foreground sora leading-none">
          StorePilot <span className="text-primary">AI</span>
        </span>
      </div>
    </Link>
  );
}
