import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";

const statusConfig: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  viewed: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  contacted: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  handled: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  archived: { bg: "bg-stone-100", text: "text-stone-500", dot: "bg-stone-400" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
