export const cardClass =
  "rounded-[8px] border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]";

export const formatRelative = (value?: string | null) => {
  if (!value) return "Not synced";
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000)
  );
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

export const scoreTone = (score: number) => {
  if (score >= 80) return "Good";
  if (score >= 50) return "Average";
  return "Needs Work";
};

export const scoreBadgeClass = (score: number) => {
  if (score >= 80) return "bg-[#e8fff0] text-success";
  if (score >= 50) return "bg-[#fff4df] text-warning";
  return "bg-red-50 text-red-600";
};
