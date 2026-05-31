"use client";

import { useEffect } from "react";
import { Activity, RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/app/lib/utils";
import { getDashboardHandler, runStoreSeoAuditHandler } from "@/lib/features/dashboard.feature";
import { syncProductsHandler } from "@/lib/features/store.feature";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { markDashboardLoadedForSession } from "@/lib/slices/dashboard.slice";
import { DashboardChartsSection } from "./dashboard-charts-section";
import { DashboardContainer } from "./dashboard-container";
import { DashboardError, DashboardLoading } from "./dashboard-feedback";
import { DashboardHeader } from "./dashboard-header";
import { StoreConnectionCard } from "./store-connection-card";
import { SummaryCardsSection } from "./summary-cards-section";
import { formatRelative } from "./utils";

const DASHBOARD_AUTO_LOAD_SESSION_KEY = "storepilot.dashboard.autoLoaded";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    return error.error;
  }

  return fallback;
};

export default function DashboardView() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const syncing = useAppSelector((state) => state.store.syncing);
  const { dashboardData, loading, refreshing, auditing, hasLoadedForSession, error } = useAppSelector(
    (state) => state.dashboard
  );

  const firstName = user?.firstName || user?.userName || "there";

  useEffect(() => {
    if (hasLoadedForSession) return;

    if (window.sessionStorage.getItem(DASHBOARD_AUTO_LOAD_SESSION_KEY) === "true") {
      dispatch(markDashboardLoadedForSession());
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(DASHBOARD_AUTO_LOAD_SESSION_KEY, "true");
      dispatch(getDashboardHandler());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [dispatch, hasLoadedForSession]);

  const handleRefresh = () => {
    dispatch(getDashboardHandler());
  };

  const handleSync = async () => {
    try {
      const result = await dispatch(syncProductsHandler()).unwrap();
      toast.success(result.message || "Products synced successfully.");
      await dispatch(getDashboardHandler()).unwrap();
    } catch (syncError: unknown) {
      console.log(syncError);
      toast.error(getErrorMessage(syncError, "Unable to sync products."));
    }
  };

  const handleAudit = async () => {
    try {
      const result = await dispatch(runStoreSeoAuditHandler()).unwrap();
      toast.success(result.message || "SEO audit completed.");
      await dispatch(getDashboardHandler()).unwrap();
    } catch (auditError: unknown) {
      console.log(auditError);
      toast.error(getErrorMessage(auditError, "Unable to run SEO audit."));
    }
  };

  if (loading) return <DashboardLoading />;

  if (error || !dashboardData) {
    return (
      <DashboardError
        error={error || "Unable to load dashboard analytics."}
        onRetry={handleRefresh}
        loading={refreshing}
      />
    );
  }

  return (
    <DashboardContainer>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <DashboardHeader firstName={firstName} />
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold text-muted-strong">
          <Activity size={15} className={cn(refreshing && "animate-pulse text-primary")} />
          <span>Updated {formatRelative(dashboardData.store.lastSyncAt)}</span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex h-8 items-center gap-2 rounded-[6px] border border-border bg-white px-3 text-[12px] font-bold text-foreground shadow-sm transition hover:bg-surface-soft disabled:opacity-70"
          >
            <RefreshCcw size={14} className={cn(refreshing && "animate-spin")} />
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <StoreConnectionCard
          store={dashboardData.store}
          syncing={syncing}
          auditing={auditing}
          onSync={handleSync}
          onAudit={handleAudit}
        />
      </div>

      <div className="mt-5">
        <SummaryCardsSection data={dashboardData} />
      </div>

      <div className="mt-5">
        <DashboardChartsSection data={dashboardData} />
      </div>
    </DashboardContainer>
  );
}
