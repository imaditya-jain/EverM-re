"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { DashboardAnalytics } from "@/types";
import { cardClass, scoreBadgeClass, scoreTone } from "./utils";

function PrioritySummary({ data }: { data: DashboardAnalytics }) {
  const total =
    data.high_priority_products +
    data.medium_priority_products +
    data.low_priority_products;
  const high = total ? (data.high_priority_products / total) * 100 : 0;
  const medium = total ? (data.medium_priority_products / total) * 100 : 0;
  const low = total ? (data.low_priority_products / total) * 100 : 0;

  const items = [
    { label: "High Priority", value: data.high_priority_products, pct: high, color: "bg-red-500" },
    { label: "Medium Priority", value: data.medium_priority_products, pct: medium, color: "bg-warning" },
    { label: "Low Priority", value: data.low_priority_products, pct: low, color: "bg-success" },
  ];

  return (
    <section className={cn(cardClass, "p-5")}>
      <h2 className="text-[13px] font-bold text-foreground">Priority Summary</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-[170px_1fr] sm:items-center">
        <div className="flex items-center justify-center">
          <div
            className="flex h-[150px] w-[150px] items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#ef4444 0 ${high}%, #f59e0b ${high}% ${high + medium}%, #22c55e ${high + medium}% 100%)`,
            }}
          >
            <div className="flex h-[90px] w-[90px] flex-col items-center justify-center rounded-full bg-white">
              <span className="sora text-[25px] font-bold text-foreground">{total}</span>
              <span className="text-[11px] font-semibold text-muted-strong">Total</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-3 text-[13px] font-bold text-foreground">
                  <span className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                  {item.label}
                </span>
                <span className="text-[13px] font-bold text-foreground">{item.value}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                <span
                  className={cn("block h-full rounded-full", item.color)}
                  style={{ width: `${Math.max(item.pct, item.value ? 5 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {data.high_priority_products > 0 && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-[8px] bg-red-50 px-4 py-3 text-red-600">
          <span className="flex items-center gap-2 text-[12px] font-bold">
            <AlertTriangle size={15} />
            {data.high_priority_products} products need immediate attention
          </span>
          <ArrowRight size={15} />
        </div>
      )}
    </section>
  );
}

function SeoHealth({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 52;
  const progress = Math.max(0, Math.min(score, 100));

  return (
    <section className={cn(cardClass, "p-5")}>
      <h2 className="text-[13px] font-bold text-foreground">SEO Health</h2>
      <div className="mt-5 flex flex-col items-center">
        <div className="relative h-[170px] w-[170px]">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r="52" fill="none" stroke="#eef2f7" strokeWidth="13" />
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke={score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              strokeLinecap="round"
              strokeWidth="13"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="sora text-[31px] font-bold text-foreground">{score.toFixed(1)}</span>
            <span className="mt-1 text-[12px] font-semibold text-muted-strong">Out of 100</span>
          </div>
        </div>
        <span className={cn("mt-2 rounded-[6px] px-3 py-1 text-[12px] font-bold", scoreBadgeClass(score))}>
          {scoreTone(score)}
        </span>
        <p className="mt-4 text-center text-[12px] font-medium leading-5 text-muted-strong">
          Keep improving product metadata to lift your store&apos;s organic visibility.
        </p>
      </div>
    </section>
  );
}

export function DashboardChartsSection({ data }: { data: DashboardAnalytics }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <PrioritySummary data={data} />
      <SeoHealth score={data.store_seo_score || 0} />
    </div>
  );
}
