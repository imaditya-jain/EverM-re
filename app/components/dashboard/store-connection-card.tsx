import Link from "next/link";
import { ExternalLink, RefreshCcw, Sparkles, Store as StoreIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { DashboardStore } from "@/types";
import { cardClass, formatRelative } from "./utils";
import { ShopifyMark } from "./shopify-mark";

type StoreConnectionCardProps = {
  store: DashboardStore;
  syncing: boolean;
  auditing: boolean;
  onSync: () => void;
  onAudit: () => void;
};

export function StoreConnectionCard({
  store,
  syncing,
  auditing,
  onSync,
  onAudit,
}: StoreConnectionCardProps) {
  return (
    <section className={cn(cardClass, "grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center")}>
      <div className="flex min-w-0 items-center gap-5">
        <ShopifyMark className="h-[58px] w-[58px] shrink-0 text-[32px]" />
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-muted-strong">Connected Store</p>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[14px] font-bold text-foreground">{store.shop}</h2>
            <ExternalLink size={14} className="shrink-0 text-muted-strong" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-7 items-center rounded-[6px] bg-[#e8fff0] px-3 text-[12px] font-bold text-success">
              Connected
            </span>
            <span className="text-[12px] font-medium text-muted-strong">
              Last sync {formatRelative(store.lastSyncAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex h-[40px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[13px] font-bold text-primary shadow-sm transition hover:bg-surface-soft disabled:opacity-70"
        >
          <RefreshCcw size={15} className={cn("shrink-0", syncing && "animate-spin")} />
          <span className="truncate">{syncing ? "Syncing" : "Sync Products"}</span>
        </button>
        <button
          onClick={onAudit}
          disabled={auditing}
          className="flex h-[40px] min-w-0 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-4 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(109,40,217,0.24)] disabled:opacity-70"
        >
          <Sparkles size={15} className={cn("shrink-0", auditing && "animate-pulse")} />
          <span className="truncate">{auditing ? "Auditing" : "Run Audit"}</span>
        </button>
        <Link
          href="/dashboard/store"
          className="flex h-[40px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[13px] font-bold text-foreground shadow-sm transition hover:bg-surface-soft"
        >
          <StoreIcon size={15} className="shrink-0" />
          <span className="truncate">Manage Store</span>
        </Link>
      </div>
    </section>
  );
}
