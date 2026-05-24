"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  Copy,
  HelpCircle,
  Info,
  RefreshCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { SiShopify } from "react-icons/si";
import { toast } from "react-toastify";
import { authFetch } from "@/app/lib/auth-fetch";
import { cn } from "@/app/lib/utils";

type ProductDetail = {
  id: string;
  shopifyProductId: string;
  title: string;
  handle: string;
  description: string;
  image: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  seoStatus: "optimized" | "pending";
  updatedAtShopify: string;
  syncAt: string;
};

type ProductDetailResponse = {
  store: {
    shop: string;
  };
  product: ProductDetail;
};

const cardClass =
  "rounded-[8px] border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not synced";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

function DashboardHeader({ shop, productTitle }: { shop?: string; productTitle?: string }) {
  return (
    <header className="hidden h-[72px] items-center justify-between border-b border-border bg-white px-9 md:flex">
      <div className="flex min-w-0 items-center gap-3 text-[13px] font-medium text-muted">
        <Link href="/dashboard/products" className="hover:text-primary">Products</Link>
        <ChevronDown size={13} className="-rotate-90" />
        <span className="truncate font-semibold text-foreground">{productTitle || "Product"}</span>
      </div>

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-[6px] bg-[#e8fff0] px-2 text-[11px] font-bold text-success">
      {status.toUpperCase()}
    </span>
  );
}

export default function ProductDetailView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const product = data?.product;

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/v1/shopify/products/${params.id}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Unable to load product.");
        return;
      }

      setData(result.data);
      setSeoTitle(result.data.product.seoTitle || result.data.product.title);
      setSeoDescription(result.data.product.seoDescription || result.data.product.description || "");
    } catch (error) {
      console.log(error);
      toast.error("Unable to load product.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProduct();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProduct]);

  const previewUrl = useMemo(() => {
    const shop = data?.store.shop || "store.myshopify.com";
    return `${shop} › products › ${product?.handle || ""}`;
  }, [data?.store.shop, product?.handle]);

  const handleGenerateSeo = async () => {
    if (!product) return;

    try {
      setGenerating(true);
      const response = await authFetch("/api/v1/ai/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          description: product.description || seoDescription || product.title,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Unable to generate SEO.");
        return;
      }

      setSeoTitle(result.data.response.seoTitle || product.title);
      setSeoDescription(result.data.response.metaDescription || "");
      toast.success(result.message || "SEO generated successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Unable to generate SEO.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSeo = async () => {
    if (!product) return;

    try {
      setSaving(true);
      const response = await authFetch(`/api/v1/shopify/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seoTitle, seoDescription }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Unable to save SEO.");
        return;
      }

      toast.success(result.message || "SEO saved successfully.");
      await loadProduct();
    } catch (error) {
      console.log(error);
      toast.error("Unable to save SEO.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <DashboardHeader />
        <main className="mx-auto max-w-[1120px] px-4 py-7 sm:px-7 lg:px-9">
          <div className="h-8 w-72 animate-pulse rounded-[8px] bg-surface-muted" />
          <div className={cn(cardClass, "mt-7 h-[520px] animate-pulse")} />
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-full bg-background">
        <DashboardHeader />
        <main className="mx-auto max-w-[1120px] px-4 py-7 sm:px-7 lg:px-9">
          <section className={cn(cardClass, "p-6")}>
            <h1 className="sora text-[24px] font-bold text-foreground">Product not found</h1>
            <button onClick={() => router.push("/dashboard/products")} className="mt-5 h-10 rounded-[8px] bg-primary px-5 text-[13px] font-bold text-white">
              Back to Products
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <DashboardHeader shop={data?.store.shop} productTitle={product.title} />

      <main className="mx-auto max-w-[1120px] px-4 py-7 sm:px-7 lg:px-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="sora text-[27px] font-bold leading-tight text-foreground">
                {product.title}
              </h1>
              <StatusBadge status={product.status} />
            </div>
            <div className="mt-2 flex items-center gap-3 text-[14px] font-semibold text-muted-strong">
              <span>/products/{product.handle}</span>
              <button onClick={() => navigator.clipboard.writeText(`/products/${product.handle}`)} className="text-muted-strong hover:text-primary">
                <Copy size={15} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:flex">
            <Link href="/dashboard/products" className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[13px] font-bold text-foreground shadow-sm hover:bg-surface-soft">
              <ArrowLeft size={16} className="shrink-0" />
              <span className="min-w-0 truncate">Back to Products</span>
            </Link>
            <button onClick={loadProduct} className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 text-[13px] font-bold text-foreground shadow-sm hover:bg-surface-soft">
              <RefreshCcw size={16} className="shrink-0" />
              <span className="min-w-0 truncate">Sync from Shopify</span>
            </button>
            <button onClick={handleGenerateSeo} disabled={generating} className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-4 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(109,40,217,0.24)] disabled:opacity-70 sm:col-span-2 xl:col-span-1">
              <Sparkles size={16} className="shrink-0" />
              <span className="min-w-0 truncate">{generating ? "Generating" : "Generate AI SEO"}</span>
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-[260px_1fr_390px]">
          <section className={cn(cardClass, "p-4")}>
            <div className="aspect-square overflow-hidden rounded-[8px] bg-surface-soft">
              {product.image ? (
                <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary">
                  <SiShopify size={52} />
                </div>
              )}
            </div>

            <div className="mt-7">
              <h2 className="sora text-[15px] font-bold text-foreground">Product Information</h2>
              <div className="mt-5 space-y-5 text-[13px]">
                <div>
                  <p className="font-medium text-muted-strong">Shopify Product ID</p>
                  <div className="mt-2 flex items-start gap-2 font-semibold text-foreground">
                    <span className="break-all">{product.shopifyProductId}</span>
                    <button onClick={() => navigator.clipboard.writeText(product.shopifyProductId)} className="shrink-0 text-muted-strong hover:text-primary">
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-strong">Status</p>
                  <div className="mt-2"><StatusBadge status={product.status} /></div>
                </div>
                <div>
                  <p className="font-medium text-muted-strong">Last Synced</p>
                  <p className="mt-2 font-bold text-foreground">{formatDateTime(product.syncAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-strong">Updated At Shopify</p>
                  <p className="mt-2 font-bold text-foreground">{formatDateTime(product.updatedAtShopify)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className={cn(cardClass, "p-5 sm:p-6")}>
            <h2 className="sora text-[17px] font-bold text-foreground">SEO Details</h2>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between gap-4">
                <label htmlFor="seoTitle" className="flex items-center gap-2 text-[14px] font-bold text-foreground">
                  SEO Title
                  <HelpCircle size={14} className="text-muted" />
                </label>
                <span className="text-[12px] font-medium text-muted-strong">{seoTitle.length} / 70 characters</span>
              </div>
              <input id="seoTitle" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className="h-[52px] w-full rounded-[8px] border border-border bg-white px-4 text-[14px] font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.12)]" />
              <p className="mt-2 text-[12px] font-semibold text-success">Recommended: 50-60 characters</p>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between gap-4">
                <label htmlFor="seoDescription" className="flex items-center gap-2 text-[14px] font-bold text-foreground">
                  SEO Description
                  <HelpCircle size={14} className="text-muted" />
                </label>
                <span className="text-[12px] font-medium text-muted-strong">{seoDescription.length} / 320 characters</span>
              </div>
              <textarea id="seoDescription" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} className="min-h-[114px] w-full resize-y rounded-[8px] border border-border bg-white px-4 py-3 text-[14px] font-medium leading-6 text-foreground outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(109,40,217,0.12)]" />
              <p className="mt-2 text-[12px] font-semibold text-success">Recommended: 120-160 characters</p>
            </div>

            <div className="mt-7 flex gap-3 rounded-[8px] bg-surface-soft px-4 py-4 text-[13px] font-medium leading-5 text-primary">
              <Sparkles size={16} className="mt-0.5 shrink-0" />
              <span>Click &quot;Generate AI SEO&quot; to get AI-optimized title and description.</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[110px_1fr]">
              <button onClick={() => { setSeoTitle(product.seoTitle || product.title); setSeoDescription(product.seoDescription || product.description || ""); }} className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-3 text-[13px] font-bold text-muted-strong hover:bg-surface-soft">
                <RefreshCcw size={15} className="shrink-0" />
                <span className="min-w-0 truncate">Reset</span>
              </button>
              <button onClick={handleSaveSeo} disabled={saving} className="flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-3 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(109,40,217,0.24)] disabled:opacity-70">
                <Save size={15} className="shrink-0" />
                <span className="min-w-0 truncate">{saving ? "Saving" : "Save SEO"}</span>
              </button>
            </div>
          </section>

          <div className="space-y-5">
            <section className={cn(cardClass, "p-5 sm:p-6")}>
              <h2 className="sora text-[17px] font-bold text-foreground">Google Preview</h2>
              <div className="mt-5 border-t border-border pt-5">
                <div className="flex flex-wrap items-center gap-5 text-[13px] font-medium text-muted-strong">
                  <span>Preview as:</span>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={previewMode === "mobile"} onChange={() => setPreviewMode("mobile")} className="accent-[var(--primary)]" />
                    Mobile
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={previewMode === "desktop"} onChange={() => setPreviewMode("desktop")} className="accent-[var(--primary)]" />
                    Desktop
                  </label>
                </div>

                <div className={cn("mt-6 rounded-[8px] border border-border bg-white p-5", previewMode === "desktop" && "max-w-[620px]")}>
                  <p className="truncate text-[12px] font-medium text-foreground">
                    <span className="mr-2 inline-flex h-3 w-3 items-center justify-center rounded-full bg-accent text-[8px] text-white">i</span>
                    {previewUrl}
                  </p>
                  <h3 className="mt-3 text-[18px] font-semibold leading-7 text-primary">{seoTitle || product.title}</h3>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-muted-strong">{seoDescription || product.description}</p>
                </div>
              </div>
            </section>

            <section className={cn(cardClass, "p-5 sm:p-6")}>
              <h2 className="sora text-[17px] font-bold text-foreground">SEO Status</h2>
              <div className="mt-6 space-y-6">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8fff0] text-success">
                    <CheckCircle2 size={21} />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">SEO Title</h3>
                    <p className="mt-1 text-[13px] font-medium text-muted-strong">A title is set and looks good.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8fff0] text-success">
                    <CheckCircle2 size={21} />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">SEO Description</h3>
                    <p className="mt-1 text-[13px] font-medium text-muted-strong">A meta description is set and looks good.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-5 flex gap-3 rounded-[8px] bg-[#eef6ff] px-5 py-4 text-[13px] font-medium text-muted-strong">
          <Info size={18} className="shrink-0 text-accent" />
          <span>Your SEO will be saved when you click &quot;Save SEO&quot;.</span>
        </div>
      </main>
    </div>
  );
}
