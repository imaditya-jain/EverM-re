"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { SiShopify } from "react-icons/si";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { getStoreStatusHandler } from "@/lib/features/store.feature";
import { cn } from "@/app/lib/utils";

export function Topbar() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.store);
  const { productDetailData } = useAppSelector((state) => state.product);
  const pathname = usePathname();
  
  useEffect(() => {
    dispatch(getStoreStatusHandler());
  }, [dispatch]);
  
  const connected = status.connected;
  const shop = status.store?.shop;

  const isStoreConnection = pathname?.includes("/dashboard/store");
  const isProductDetail = pathname?.includes("/dashboard/products/") && pathname !== "/dashboard/products";

  return (
    <header className="hidden shrink-0 h-[72px] items-center justify-between border-b border-border bg-white px-9 md:flex">
      <div className="flex min-w-0 items-center gap-3 text-[13px] font-medium text-muted">
        {isStoreConnection && connected && (
          <>
            <span>Store Connection</span>
            <ChevronDown size={13} className="-rotate-90" />
            <span className="font-semibold text-foreground">Connected Store</span>
          </>
        )}
        {isProductDetail && (
          <>
            <Link href="/dashboard/products" className="hover:text-primary">Products</Link>
            <ChevronDown size={13} className="-rotate-90" />
            <span className="truncate font-semibold text-foreground">{productDetailData?.product?.title || "Product"}</span>
          </>
        )}
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