export function DashboardHeader({ firstName }: { firstName: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h1 className="sora text-[24px] font-bold leading-tight text-foreground sm:text-[27px]">
        Welcome back, {firstName}
      </h1>
      <p className="text-[14px] font-medium leading-6 text-muted-strong">
        Here&apos;s what&apos;s happening with your store today.
      </p>
    </div>
  );
}
