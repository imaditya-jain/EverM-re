"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/app/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { logoutUserHandler } from "@/lib/features/auth.feature";
import { toast } from "react-toastify";

interface SidebarUserProps {
  name: string;
  email: string;
  initials: string;
}

export function SidebarUser({ name, email, initials }: SidebarUserProps) {
  const { collapsed, mode } = useSidebar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const showLabel = mode === "mobile" || !collapsed;

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await dispatch(logoutUserHandler({})).unwrap();
      router.replace("/auth/login");
    } catch (error) {
      console.log(error);
      toast.error("Unable to sign out.");
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={!showLabel ? `User menu for ${name}` : undefined}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl px-3 py-2.5",
          "border border-border/60 bg-surface hover:bg-surface-soft",
          "transition-all duration-200 ease-out",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "min-h-11 md:min-h-auto",
          !showLabel && "justify-center px-2.5"
        )}
      >
        <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[12px] font-bold select-none">
          {initials}
        </div>

        {showLabel && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[14px] font-semibold text-foreground leading-none truncate">
                {name}
              </p>
              <p className="mt-0.5 text-[12px] text-muted truncate">{email}</p>
            </div>
            <ChevronDown
              size={13}
              className={cn(
                "shrink-0 text-muted transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute bottom-full mb-2 z-50",
            "rounded-xl border border-border bg-white p-1 shadow-xl shadow-black/8",
            "animate-in fade-in slide-in-from-bottom-2 duration-150",
            !showLabel ? "left-0 w-48" : "left-0 right-0"
          )}
        >
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-[13px] font-semibold text-foreground truncate">
              {name}
            </p>
            <p className="text-[12px] text-muted truncate">{email}</p>
          </div>

          <button
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-muted-strong hover:bg-surface-soft hover:text-foreground transition-colors min-h-10"
            onClick={() => setOpen(false)}
          >
            <User size={13} />
            Profile
          </button>

          <button
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-muted-strong hover:bg-surface-soft hover:text-foreground transition-colors min-h-10"
            onClick={() => setOpen(false)}
          >
            <Settings size={13} />
            Account settings
          </button>

          <hr className="my-1 border-border" />

          <button
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-red-500 hover:bg-red-50 transition-colors min-h-10 disabled:opacity-70"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={13} />
            {loggingOut ? "Signing out" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
