import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { cardClass } from "./utils";
import { DashboardContainer } from "./dashboard-container";

export function DashboardLoading() {
  return (
    <DashboardContainer>
      <div className="h-8 w-72 animate-pulse rounded-[8px] bg-surface-muted" />
      <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-[8px] bg-surface-muted" />
      <div className={cn(cardClass, "mt-7 h-[92px] animate-pulse")} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={cn(cardClass, "h-[116px] animate-pulse")} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className={cn(cardClass, "h-[270px] animate-pulse")} />
        <div className={cn(cardClass, "h-[270px] animate-pulse")} />
        <div className={cn(cardClass, "h-[270px] animate-pulse")} />
      </div>
    </DashboardContainer>
  );
}

export function DashboardError({
  error,
  onRetry,
  loading,
}: {
  error: string;
  onRetry: () => void;
  loading: boolean;
}) {
  return (
    <DashboardContainer>
      <section className={cn(cardClass, "mx-auto max-w-[560px] p-7 text-center")}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={24} />
        </span>
        <h1 className="mt-5 sora text-[22px] font-bold text-foreground">Dashboard unavailable</h1>
        <p className="mt-3 text-[14px] font-medium leading-6 text-muted-strong">{error}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onRetry}
            disabled={loading}
            className="flex h-[40px] min-w-0 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-5 text-[13px] font-bold text-white disabled:opacity-70"
          >
            <RefreshCcw size={15} className={cn(loading && "animate-spin")} />
            <span>{loading ? "Retrying" : "Retry"}</span>
          </button>
          <Link
            href="/dashboard/store"
            className="flex h-[40px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border px-5 text-[13px] font-bold text-foreground"
          >
            Store Connection
          </Link>
        </div>
      </section>
    </DashboardContainer>
  );
}
