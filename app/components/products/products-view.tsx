"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { SiShopify } from "react-icons/si";
import { toast } from "react-toastify";
import { authFetch } from "@/app/lib/auth-fetch";
import { cn } from "@/app/lib/utils";

type ProductItem = {
  id: string;
  shopifyProductId: string;
  title: string;
  handle: string;
  description: string;
  image: string;
  status: string;
  seoStatus: "optimized" | "pending";
  seoTitle: string;
  seoDescription: string;
  updatedAtShopify: string;
  syncAt: string;
};

type ProductsResponse = {
  store: {
    shop: string;
    lastSyncAt: string;
  };
  stats: {
    totalProducts: number;
    optimizedProducts: number;
    pendingProducts: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  products: ProductItem[];
};

const cardClass =
  "rounded-[8px] border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]";

const formatDate = (value?: string | null) => {
  if (!value) return "Not synced";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatTime = (value?: string | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatRelative = (value?: string | null) => {
  if (!value) return "Not synced";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return formatDate(value);
};

function DashboardHeader({ shop }: { shop?: string }) {
  return (
    <header className="hidden h-[72px] items-center justify-end border-b border-border bg-white px-9 md:flex">
      <div className="flex items-center gap-7">
        <button className="flex h-[44px] min-w-[266px] items-center justify-between gap-4 rounded-[8px] border border-border bg-white px-4 text-[13px] font-semibold text-foreground shadow-sm">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-[#ecf8ed] text-[15px] text-[#65b84c]">
              <SiShopify />
            </span>
            <span className="truncate">{shop || "No store connected"}</span>
          </span>
          <ChevronDown size={16} className="text-muted-strong" />
        </button>

        <button className="relative flex h-[44px] w-[44px] items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm">
          <Bell size={19} />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: typeof Box;
  tone: string;
}) {
  return (
    <section className={cn(cardClass, "flex min-h-[116px] items-center gap-5 p-5")}>
      <span className={cn("flex h-13 w-13 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon size={25} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted-strong">{title}</p>
        <p className="mt-2 sora text-[25px] font-bold text-foreground">{value}</p>
        <p className="mt-2 truncate text-[12px] font-medium text-muted-strong">
          {sub}
        </p>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isDraft = status.toUpperCase() === "DRAFT";

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-[6px] px-2 text-[11px] font-bold",
        isDraft ? "bg-orange-50 text-orange-500" : "bg-[#e8fff0] text-success"
      )}
    >
      {status.toUpperCase()}
    </span>
  );
}

function SeoBadge({ status }: { status: ProductItem["seoStatus"] }) {
  const optimized = status === "optimized";

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-[6px] px-2 text-[11px] font-bold",
        optimized ? "bg-[#e8fff0] text-success" : "bg-[#fff4df] text-warning"
      )}
    >
      {optimized ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
      {optimized ? "Optimized" : "Pending"}
    </span>
  );
}

function ProductImage({ src, title }: { src: string; title: string }) {
  return (
    <div className="h-[48px] w-[48px] overflow-hidden rounded-[8px] bg-surface-soft">
      {src ? (
        <img src={src} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary">
          <Box size={22} />
        </div>
      )}
    </div>
  );
}

export default function ProductsView() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [seoStatus, setSeoStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status,
      seoStatus,
    });

    if (search.trim()) params.set("search", search.trim());

    return params.toString();
  }, [limit, page, search, seoStatus, status]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/v1/shopify/products?${queryString}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Unable to load products.");
        setData(null);
        return;
      }

      setData(result.data);
    } catch (error) {
      console.log(error);
      toast.error("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProducts();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await authFetch("/api/v1/shopify/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursor: null }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Unable to sync products.");
        return;
      }

      toast.success(result.message || "Products synced successfully.");
      await loadProducts();
    } catch (error) {
      console.log(error);
      toast.error("Unable to sync products.");
    } finally {
      setSyncing(false);
    }
  };

  const generateSeo = async (product: ProductItem) => {
    try {
      setGeneratingId(product.id);
      const response = await authFetch("/api/v1/ai/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          description: product.description || product.seoDescription || product.title,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Unable to generate SEO.");
        return;
      }

      const generated = result.data.response;
      const saveResponse = await authFetch(`/api/v1/shopify/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seoTitle: generated.seoTitle,
          seoDescription: generated.metaDescription,
        }),
      });
      const saveResult = await saveResponse.json();

      if (!saveResponse.ok || !saveResult.success) {
        toast.error(saveResult.error || "Unable to save SEO.");
        return;
      }

      toast.success("SEO generated successfully.");
      await loadProducts();
    } catch (error) {
      console.log(error);
      toast.error("Unable to generate SEO.");
    } finally {
      setGeneratingId(null);
    }
  };

  const products = data?.products || [];
  const totalPages = data?.pagination.totalPages || 1;
  const start = data && data.pagination.total > 0 ? (data.pagination.page - 1) * data.pagination.limit + 1 : 0;
  const end = data ? Math.min(data.pagination.page * data.pagination.limit, data.pagination.total) : 0;

  return (
    <div className="min-h-full bg-background">
      <DashboardHeader shop={data?.store.shop} />

      <main className="mx-auto max-w-[1120px] px-4 py-7 sm:px-7 lg:px-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="sora text-[27px] font-bold leading-tight text-foreground">
              Products
            </h1>
            <p className="mt-2 text-[14px] font-medium leading-6 text-muted-strong">
              Manage synced Shopify products and generate AI-powered SEO content.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[13px] font-bold text-primary shadow-sm transition hover:bg-surface-soft disabled:opacity-70"
            >
              <RefreshCcw size={16} className={cn("shrink-0", syncing && "animate-spin")} />
              <span className="min-w-0 truncate">{syncing ? "Syncing" : "Sync Products"}</span>
            </button>
            <button
              onClick={() => products.find((item) => item.seoStatus === "pending") && generateSeo(products.find((item) => item.seoStatus === "pending") as ProductItem)}
              disabled={!products.some((item) => item.seoStatus === "pending") || Boolean(generatingId)}
              className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-4 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(109,40,217,0.24)] disabled:opacity-70"
            >
              <Sparkles size={16} className="shrink-0" />
              <span className="min-w-0 truncate">Generate AI SEO</span>
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total Products" value={data?.stats.totalProducts || 0} sub="All synced products" icon={Box} tone="bg-surface-soft text-primary" />
          <MetricCard title="Optimized" value={data?.stats.optimizedProducts || 0} sub="Products with SEO" icon={CheckCircle2} tone="bg-[#e8fff0] text-success" />
          <MetricCard title="Pending" value={data?.stats.pendingProducts || 0} sub="Products need SEO" icon={Clock3} tone="bg-[#fff4df] text-warning" />
          <MetricCard title="Last Synced" value={formatRelative(data?.store.lastSyncAt)} sub={data?.store.lastSyncAt ? `${formatDate(data.store.lastSyncAt)} at ${formatTime(data.store.lastSyncAt)}` : "No sync yet"} icon={RefreshCcw} tone="bg-[#eaf2ff] text-accent" />
        </div>

        <section className={cn(cardClass, "mt-5 p-4")}>
          <div className="grid gap-4 lg:grid-cols-[1fr_170px_190px_110px] lg:items-end">
            <label className="block">
              <span className="sr-only">Search products</span>
              <span className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-strong" size={18} />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products by title or handle..."
                  className="h-[42px] w-full rounded-[8px] border border-border bg-white pl-12 pr-4 text-[14px] font-medium text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.12)]"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-muted-strong">Status</span>
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-[42px] w-full rounded-[8px] border border-border bg-white px-3 text-[13px] font-semibold text-foreground outline-none focus:border-primary">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-muted-strong">SEO Status</span>
              <select value={seoStatus} onChange={(event) => { setSeoStatus(event.target.value); setPage(1); }} className="h-[42px] w-full rounded-[8px] border border-border bg-white px-3 text-[13px] font-semibold text-foreground outline-none focus:border-primary">
                <option value="all">All SEO Status</option>
                <option value="optimized">Optimized</option>
                <option value="pending">Pending</option>
              </select>
            </label>

            <button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setSeoStatus("all");
                setPage(1);
              }}
              className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[13px] font-bold text-muted-strong transition hover:bg-surface-soft"
            >
              <RefreshCcw size={15} className="shrink-0" />
              <span className="min-w-0 truncate">Reset</span>
            </button>
          </div>
        </section>

        <section className={cn(cardClass, "mt-5 overflow-hidden")}>
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <thead className="bg-white">
                <tr className="border-b border-border text-[12px] font-bold text-muted-strong">
                  <th className="px-5 py-4">Image</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">SEO Status</th>
                  <th className="px-5 py-4">Updated At (Shopify)</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-[14px] font-medium text-muted">Loading products...</td></tr>
                ) : products.length ? (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-4"><ProductImage src={product.image} title={product.title} /></td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-bold text-foreground">{product.title}</p>
                        <p className="mt-1 text-[12px] font-medium text-muted-strong">/products/{product.handle}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={product.status} /></td>
                      <td className="px-5 py-4"><SeoBadge status={product.seoStatus} /></td>
                      <td className="px-5 py-4 text-[12px] font-medium leading-5 text-muted-strong">{formatDate(product.updatedAtShopify)}<br />{formatTime(product.updatedAtShopify)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/dashboard/products/${product.id}`} className="flex h-8 items-center rounded-[6px] border border-border bg-white px-4 text-[12px] font-bold text-foreground hover:bg-surface-soft">View</Link>
                          <button onClick={() => generateSeo(product)} disabled={generatingId === product.id} className="flex h-8 max-w-[116px] items-center rounded-[6px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-3 text-[12px] font-bold text-white disabled:opacity-70">
                            <span className="truncate">{generatingId === product.id ? "Generating" : "Generate SEO"}</span>
                          </button>
                          <button className="text-muted-strong"><MoreHorizontal size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-[14px] font-medium text-muted">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border xl:hidden">
            {loading ? (
              <div className="p-6 text-center text-[14px] font-medium text-muted">Loading products...</div>
            ) : products.length ? (
              products.map((product) => (
                <article key={product.id} className="p-4">
                  <div className="flex gap-4">
                    <ProductImage src={product.image} title={product.title} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[14px] font-bold text-foreground">{product.title}</h2>
                      <p className="mt-1 truncate text-[12px] font-medium text-muted-strong">/products/{product.handle}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge status={product.status} />
                        <SeoBadge status={product.seoStatus} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link href={`/dashboard/products/${product.id}`} className="flex h-9 min-w-0 flex-1 items-center justify-center rounded-[6px] border border-border bg-white px-3 text-[12px] font-bold text-foreground">
                      <span className="truncate">View</span>
                    </Link>
                    <button onClick={() => generateSeo(product)} disabled={generatingId === product.id} className="flex h-9 min-w-0 flex-1 items-center justify-center rounded-[6px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-3 text-[12px] font-bold text-white disabled:opacity-70">
                      <span className="truncate">{generatingId === product.id ? "Generating" : "Generate SEO"}</span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-6 text-center text-[14px] font-medium text-muted">No products found.</div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-medium text-muted-strong">
              Showing {start} to {end} of {data?.pagination.total || 0} products
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setPage((value) => Math.max(value - 1, 1))} disabled={page <= 1} className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-border text-muted-strong disabled:opacity-50"><ChevronLeft size={16} /></button>
              <span className="flex h-9 min-w-9 items-center justify-center rounded-[8px] bg-surface-soft px-3 text-[13px] font-bold text-primary">{page}</span>
              <span className="text-[13px] font-semibold text-muted-strong">of {totalPages}</span>
              <button onClick={() => setPage((value) => Math.min(value + 1, totalPages))} disabled={page >= totalPages} className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-border text-muted-strong disabled:opacity-50"><ChevronRight size={16} /></button>
              <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="h-9 rounded-[8px] border border-border bg-white px-3 text-[13px] font-bold text-foreground outline-none">
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
