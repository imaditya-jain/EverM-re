"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  LockKeyhole,
  PackageCheck,
  RefreshCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { SiShopify } from "react-icons/si";
import { toast } from "react-toastify";
import ConnectStoreForm from "@/app/components/forms/connect-store.form";
import { authFetch } from "@/app/lib/auth-fetch";
import { cn } from "@/app/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { disconnectStoreHandler, getStoreStatusHandler, syncProductsHandler } from "@/lib/features/store.feature";

type StoreStatus = {
  connected: boolean;
  store?: {
    shop: string;
    connectedAt: string;
    totalProducts: number;
    syncedProducts: number;
    syncingProducts: number;
    notSyncedProducts: number;
    failedProducts: number;
    collections: number;
    lastSyncAt: string | null;
  };
};

const cardClass =
  "rounded-[8px] border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not synced yet";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatConnectedAt = (value: string) => `Connected on ${formatDateTime(value)}`;

const formatRelative = (value?: string | null) => {
  if (!value) return "Not synced yet";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return formatDateTime(value);
};

const formatNextSync = (value?: string | null) => {
  if (!value) return "After first sync";
  const next = new Date(value).getTime() + 60 * 60000;
  const diff = next - Date.now();
  if (diff <= 0) return "Ready now";
  const minutes = Math.max(1, Math.ceil(diff / 60000));
  return `In ${minutes} min`;
};

function ShopifyMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-[8px] bg-[#ecf8ed] text-[#65b84c]",
        className
      )}
    >
      <SiShopify />
    </span>
  );
}

function SecurityNote() {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-[13px] text-muted">
      <LockKeyhole size={14} />
      <span>We take security seriously. Your data is safe with us.</span>
    </div>
  );
}

function ConnectIntroCard() {
  return (
    <section className={cn(cardClass, "p-6 sm:p-7")}>
      <div className="flex items-start gap-4">
        <ShopifyMark className="h-[52px] w-[52px] text-[25px]" />
        <div>
          <h2 className="sora text-[19px] font-bold leading-7 text-foreground">
            Enter Shopify Store URL
          </h2>
          <p className="mt-1 text-[13px] font-medium leading-6 text-muted-strong">
            Enter your Shopify store domain to get started.
          </p>
        </div>
      </div>

      <ConnectStoreForm />

      <div className="mt-6 flex gap-4 rounded-[8px] bg-[#f6fffb] px-4 py-4 text-[13px] text-muted-strong">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dff8e8] text-success">
          <ShieldCheck size={17} />
        </span>
        <p className="leading-6">
          <span className="block font-semibold text-muted-strong">
            Your store connection is encrypted and secure.
          </span>
          We only access the permissions required for SEO optimization.
        </p>
      </div>
    </section>
  );
}

function WhatHappensNextCard() {
  const steps = [
    {
      title: "Authorize Store",
      text: "Approve Shopify permissions securely.",
      icon: Shield,
    },
    {
      title: "Sync Products",
      text: "Import your products into the dashboard.",
      icon: RefreshCcw,
    },
    {
      title: "Generate AI SEO",
      text: "Optimize product SEO using AI.",
      icon: Sparkles,
    },
  ];

  return (
    <section className={cn(cardClass, "p-6 sm:p-7")}>
      <h2 className="sora text-[18px] font-bold text-foreground">
        What happens next?
      </h2>
      <div className="mt-6 space-y-7">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative flex gap-5">
              {index < steps.length - 1 && (
                <span className="absolute left-7 top-12 h-12 w-px border-l border-dashed border-border" />
              )}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-soft text-primary">
                <Icon size={24} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <div className="pt-1">
                <h3 className="sora text-[15px] font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] font-medium leading-6 text-muted-strong">
                  {step.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WhyConnectCard() {
  const items = [
    {
      title: "Sync Products",
      text: "Automatically import your products, collections, and metadata.",
      icon: Box,
    },
    {
      title: "AI-Powered SEO",
      text: "Generate SEO titles, descriptions, and keywords using AI.",
      icon: FileText,
    },
    {
      title: "Improve Rankings",
      text: "Boost your search rankings and drive more organic traffic.",
      icon: BarChart3,
    },
    {
      title: "Save Time",
      text: "Automate SEO optimization and focus on growing your business.",
      icon: Clock3,
    },
  ];

  return (
    <section className={cn(cardClass, "grid gap-7 p-6 sm:p-7 lg:grid-cols-[155px_1fr]")}>
      <div className="flex items-center justify-center">
        <div className="relative flex h-[130px] w-[130px] items-center justify-center rounded-[8px] bg-surface-soft">
          <div className="absolute top-4 h-9 w-[96px] rounded-t-[8px] bg-white shadow-sm" />
          <div className="absolute top-4 grid h-9 w-[104px] grid-cols-3 overflow-hidden rounded-t-[8px]">
            <span className="bg-primary" />
            <span className="bg-[#b794ff]" />
            <span className="bg-primary" />
          </div>
          <div className="mt-10 flex h-[68px] w-[86px] items-center justify-center rounded-b-[8px] bg-white shadow-sm">
            <ShopifyMark className="h-11 w-11 text-[25px]" />
          </div>
          <span className="absolute bottom-4 right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#eafff2] text-success">
            <Check size={18} strokeWidth={3} />
          </span>
        </div>
      </div>

      <div>
        <h2 className="sora text-[18px] font-bold text-foreground">
          Why connect your store?
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="grid grid-cols-[42px_1fr] gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-soft text-primary">
                  <Icon size={21} />
                </span>
                <div>
                  <h3 className="text-[13px] font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[12px] font-medium leading-5 text-muted-strong">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ConnectStoreScreen() {
  return (
    <div className="mx-auto max-w-[1090px] px-4 py-7 sm:px-7 lg:px-9">
      <div>
        <h1 className="sora text-[27px] font-bold leading-tight text-foreground">
          Connect Your Shopify Store
        </h1>
        <p className="mt-3 max-w-[430px] text-[15px] font-medium leading-7 text-muted-strong">
          Securely connect your Shopify store to sync products and generate AI-powered SEO content.
        </p>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ConnectIntroCard />
        <WhatHappensNextCard />
      </div>

      <div className="mt-6">
        <WhyConnectCard />
      </div>

      <SecurityNote />
    </div>
  );
}

function StoreSummary({
  status,
  onSync,
  onDisconnect,
  syncing,
  disconnecting,
}: {
  status: StoreStatus["store"];
  onSync: () => void;
  onDisconnect: () => void;
  syncing: boolean;
  disconnecting: boolean;
}) {
  if (!status) return null;

  return (
    <section className={cn(cardClass, "flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between")}>
      <div className="flex items-center gap-5">
        <ShopifyMark className="h-[62px] w-[62px] text-[34px]" />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="sora text-[21px] font-bold text-foreground">
              {status.shop}
            </h2>
            <ExternalLink size={18} className="text-muted-strong" />
          </div>
          <p className="mt-2 flex items-center gap-2 text-[14px] font-medium text-muted-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {formatConnectedAt(status.connectedAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex h-[40px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[14px] font-bold text-primary shadow-sm transition hover:bg-surface-soft disabled:opacity-70"
        >
          <RefreshCcw size={16} className={cn("shrink-0", syncing && "animate-spin")} />
          <span className="min-w-0 truncate">{syncing ? "Syncing" : "Sync Now"}</span>
        </button>
        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          className="flex h-[40px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[14px] font-bold text-red-500 shadow-sm transition hover:bg-red-50 disabled:opacity-70"
        >
          <Trash2 size={16} className="shrink-0" />
          <span className="min-w-0 truncate">{disconnecting ? "Disconnecting" : "Disconnect"}</span>
        </button>
      </div>
    </section>
  );
}

function SyncStatusCard({ status }: { status: StoreStatus["store"] }) {
  if (!status) return null;

  const stats = [
    {
      label: "Synced",
      value: status.syncedProducts,
      iconClass: "bg-[#e9fff0] text-success",
      icon: CheckCircle2,
    },
    {
      label: "Syncing",
      value: status.syncingProducts,
      iconClass: "bg-[#fff5dd] text-warning",
      icon: RefreshCcw,
    },
    {
      label: "Not Synced",
      value: status.notSyncedProducts,
      iconClass: "bg-[#eef3ff] text-muted",
      icon: Clock3,
    },
    {
      label: "Failed",
      value: status.failedProducts,
      iconClass: "bg-[#ffecec] text-red-500",
      icon: Trash2,
    },
  ];

  const progress = status.totalProducts > 0 ? 100 : 0;

  return (
    <section className={cn(cardClass, "p-6 sm:p-7")}>
      <h2 className="sora text-[17px] font-bold text-foreground">
        Product Sync Status
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[190px_1fr_1px_310px] lg:items-center">
        <div className="flex items-center justify-center">
          <div
            className="flex h-[132px] w-[132px] items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${progress}%, var(--surface-soft) 0)`,
            }}
          >
            <div className="flex h-[102px] w-[102px] flex-col items-center justify-center rounded-full bg-white">
              <span className="sora text-[29px] font-bold text-foreground">
                {status.totalProducts}
              </span>
              <span className="mt-1 text-[12px] font-medium text-muted-strong">
                Total Products
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between gap-4 text-[14px]">
                <span className="flex items-center gap-3 font-medium text-muted-strong">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", item.iconClass)}>
                    <Icon size={14} />
                  </span>
                  {item.label}
                </span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            );
          })}
        </div>

        <div className="hidden h-[164px] bg-border lg:block" />

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-[12px] font-bold text-muted-strong">Last Sync</p>
            <p className="mt-2 sora text-[19px] font-bold text-foreground">
              {formatRelative(status.lastSyncAt)}
            </p>
            <p className="mt-1 text-[12px] font-medium text-muted-strong">
              {formatDateTime(status.lastSyncAt)}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-muted-strong">Next Sync</p>
            <p className="mt-2 sora text-[19px] font-bold text-foreground">
              {formatNextSync(status.lastSyncAt)}
            </p>
            <p className="mt-1 text-[12px] font-medium text-muted-strong">
              Auto-sync every 60 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreMetricCards({ status }: { status: StoreStatus["store"] }) {
  if (!status) return null;

  const metrics = [
    {
      label: "Total Products",
      value: status.totalProducts,
      sub: "In your store",
      icon: Box,
      className: "bg-surface-soft text-primary",
    },
    {
      label: "Synced Products",
      value: status.syncedProducts,
      sub: "100% of total",
      icon: CheckCircle2,
      className: "bg-[#e8fff0] text-success",
    },
    {
      label: "Collections",
      value: status.collections,
      sub: "Imported",
      icon: PackageCheck,
      className: "bg-[#eaf2ff] text-accent",
    },
    {
      label: "Last Updated",
      value: formatRelative(status.lastSyncAt),
      sub: formatDateTime(status.lastSyncAt),
      icon: Tag,
      className: "bg-[#fff7e7] text-warning",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <section key={metric.label} className={cn(cardClass, "flex min-h-[126px] items-center gap-5 p-5")}>
            <span className={cn("flex h-13 w-13 shrink-0 items-center justify-center rounded-full", metric.className)}>
              <Icon size={25} />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-muted-strong">
                {metric.label}
              </p>
              <p className="mt-2 sora text-[22px] font-bold text-foreground">
                {metric.value}
              </p>
              <p className="mt-2 truncate text-[12px] font-medium text-muted-strong">
                {metric.sub}
              </p>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function WhatsNextCard() {
  return (
    <section className={cn(cardClass, "flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between")}>
      <div className="flex items-center gap-5">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[8px] bg-surface-soft text-primary">
          <BookOpen size={26} />
        </span>
        <div>
          <h2 className="sora text-[18px] font-bold text-foreground">
            What&apos;s next?
          </h2>
          <p className="mt-2 text-[13px] font-medium leading-6 text-muted-strong">
            Go to Products to view your store products and start generating AI SEO content.
          </p>
        </div>
      </div>
      <Link href="/dashboard/products" className="flex h-[42px] min-w-0 items-center justify-center gap-3 rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-5 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(109,40,217,0.24)]">
        <span className="min-w-0 truncate">View Products</span>
        <ArrowRight size={16} className="shrink-0" />
      </Link>
    </section>
  );
}

function ConnectedStoreScreen({
  status,
  onSync,
  onDisconnect,
  syncing,
  disconnecting,
}: {
  status: StoreStatus["store"];
  onSync: () => void;
  onDisconnect: () => void;
  syncing: boolean;
  disconnecting: boolean;
}) {
  return (
    <div className="mx-auto max-w-[1090px] px-4 py-7 sm:px-7 lg:px-9">
      <div className="flex items-start gap-4">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7ffef] text-success">
          <CheckCircle2 size={20} />
        </span>
        <div>
          <h1 className="sora text-[27px] font-bold leading-tight text-foreground">
            Your Shopify Store is Connected
          </h1>
          <p className="mt-3 text-[14px] font-medium text-muted-strong">
            Your store is connected successfully. We&apos;re syncing your products and data.
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        <StoreSummary
          status={status}
          onSync={onSync}
          onDisconnect={onDisconnect}
          syncing={syncing}
          disconnecting={disconnecting}
        />
        <SyncStatusCard status={status} />
        <StoreMetricCards status={status} />
        <WhatsNextCard />
      </div>

      <SecurityNote />
    </div>
  );
}

function StoreConnectionLoading() {
  return (
    <div className="mx-auto max-w-[1090px] px-4 py-7 sm:px-7 lg:px-9">
      <div className="h-8 w-72 animate-pulse rounded-[8px] bg-surface-muted" />
      <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-[8px] bg-surface-muted" />
      <div className={cn(cardClass, "mt-7 h-[365px] animate-pulse bg-white")} />
    </div>
  );
}

export default function StoreConnectionView() {
  const dispatch = useAppDispatch();
  const { status, loading, syncing, disconnecting } = useAppSelector((state) => state.store);

  const shop = useMemo(() => status.store?.shop, [status.store?.shop]);

  const loadStoreStatus = useCallback(async () => {
    try {
      await dispatch(getStoreStatusHandler()).unwrap();
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadStoreStatus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStoreStatus]);

  const handleSync = async () => {
    try {
      const result = await dispatch(syncProductsHandler()).unwrap();
      toast.success(result.message || "Products synced successfully.");
      await loadStoreStatus();
    } catch (error: any) {
      console.log(error);
      toast.error(error.error || "Unable to sync products.");
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await dispatch(disconnectStoreHandler()).unwrap();
      toast.success(result.message || "Store disconnected successfully.");
    } catch (error: any) {
      console.log(error);
      toast.error(error.error || "Unable to disconnect store.");
    }
  };

  return (
    <div className="min-h-full bg-background">
      {loading ? (
        <StoreConnectionLoading />
      ) : status.connected ? (
        <ConnectedStoreScreen
          status={status.store}
          onSync={handleSync}
          onDisconnect={handleDisconnect}
          syncing={syncing}
          disconnecting={disconnecting}
        />
      ) : (
        <ConnectStoreScreen />
      )}
    </div>
  );
}
