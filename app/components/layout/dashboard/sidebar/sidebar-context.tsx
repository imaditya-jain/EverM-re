"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";

type SidebarMode = "desktop" | "tablet" | "mobile";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
  mode: SidebarMode;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "storepilot:sidebar:collapsed";
const STORAGE_EVENT = "storepilot:sidebar:collapsed-change";

function getMode(width: number): SidebarMode {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function getCollapsedSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribeToCollapsed(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

function getModeSnapshot(): SidebarMode {
  if (typeof window === "undefined") return "desktop";
  return getMode(window.innerWidth);
}

function getModeServerSnapshot(): SidebarMode {
  return "desktop";
}

function subscribeToMode(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribeToCollapsed,
    getCollapsedSnapshot,
    () => false
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const mode = useSyncExternalStore(
    subscribeToMode,
    getModeSnapshot,
    getModeServerSnapshot
  );

  useEffect(() => {
    const handleMq = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };

    window.addEventListener("resize", handleMq);
    return () => window.removeEventListener("resize", handleMq);
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(v));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const toggle = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed]
  );

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggle,
        setCollapsed,
        mobileOpen,
        openMobile,
        closeMobile,
        toggleMobile,
        mode,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}
