import type { LucideIcon } from "lucide-react";
import { Box, CheckCircle2, FileText, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { DashboardAnalytics } from "@/types";
import { cardClass, scoreTone } from "./utils";

type SummaryCardProps = {
  title: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  tone: string;
};

function SummaryCard({ title, value, sub, icon: Icon, tone }: SummaryCardProps) {
  return (
    <section className={cn(cardClass, "flex min-h-[116px] items-center gap-4 p-5")}>
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon size={23} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted-strong">{title}</p>
        <p className="mt-2 sora text-[24px] font-bold leading-none text-foreground">{value}</p>
        <p className="mt-2 truncate text-[12px] font-medium text-muted-strong">{sub}</p>
      </div>
    </section>
  );
}

export function SummaryCardsSection({ data }: { data: DashboardAnalytics }) {
  const score = Number(data.store_seo_score || 0).toFixed(1);
  const metrics: SummaryCardProps[] = [
    {
      title: "Total Products",
      value: data.total_products,
      sub: "All products in store",
      icon: Box,
      tone: "bg-surface-soft text-primary",
    },
    {
      title: "Audited Products",
      value: data.audited_products,
      sub: "Products audited by AI",
      icon: FileText,
      tone: "bg-[#eaf2ff] text-accent",
    },
    {
      title: "Audit Completed",
      value: data.audit_completed_products,
      sub: "Successfully completed",
      icon: CheckCircle2,
      tone: "bg-[#e8fff0] text-success",
    },
    {
      title: "Audit Failed",
      value: data.audit_failed_products,
      sub: "Failed audits",
      icon: XCircle,
      tone: "bg-red-50 text-red-500",
    },
    {
      title: "Average SEO Score",
      value: score,
      sub: scoreTone(data.store_seo_score),
      icon: ShieldCheck,
      tone: "bg-[#eef3ff] text-primary",
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-[13px] font-bold text-foreground">SEO Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <SummaryCard key={metric.title} {...metric} />
        ))}
      </div>
    </section>
  );
}
