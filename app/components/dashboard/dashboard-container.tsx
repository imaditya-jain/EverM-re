import type { ReactNode } from "react";

export function DashboardContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-background">
      <main className="mx-auto max-w-[1380px] px-4 py-7 sm:px-7 lg:px-9">
        {children}
      </main>
    </div>
  );
}
