import { ReactNode } from "react";
import { SidebarProvider } from "@/app/components/layout/dashboard/sidebar/sidebar-context";
import { Sidebar } from "@/app/components/layout/dashboard/sidebar/index";
import { MobileDrawer } from "@/app/components/layout/dashboard/sidebar/mobile-drawer";
import { MobileTopbar } from "@/app/components/layout/dashboard/sidebar/mobile-topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar />
        <MobileDrawer />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <MobileTopbar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}