import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import type { RunMetrics } from "@/lib/types";

interface StatsCardsProps {
  statusCounts: Record<string, number>;
  lastRun: RunMetrics | null;
}

export function StatsCards({ statusCounts, lastRun }: StatsCardsProps) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const cards = [
    {
      label: "Total Leads",
      value: total,
      accent: "border-t-amber-500",
      sub: null,
    },
    {
      label: "New",
      value: statusCounts["new"] || 0,
      accent: "border-t-sky-500",
      sub: null,
    },
    {
      label: "Contacted",
      value: statusCounts["contacted"] || 0,
      accent: "border-t-amber-500",
      sub: null,
    },
    {
      label: "Last Run",
      value: lastRun ? timeAgo(lastRun.completed_at) : "Never",
      accent: "border-t-emerald-500",
      sub: lastRun
        ? `${lastRun.posts_scraped} scanned, ${lastRun.leads_found} leads`
        : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={`border-t-2 ${card.accent}`}>
          <CardContent className="pt-5">
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
            {card.sub && (
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
