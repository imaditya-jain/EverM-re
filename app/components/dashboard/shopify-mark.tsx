import { SiShopify } from "react-icons/si";
import { cn } from "@/app/lib/utils";

export function ShopifyMark({ className }: { className?: string }) {
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
