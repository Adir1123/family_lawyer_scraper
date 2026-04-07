import { createClient } from "@/lib/supabase-server";
import { NavBar } from "@/components/nav-bar";
import { StatsCards } from "@/components/stats-cards";
import { LeadsChart } from "@/components/leads-chart";
import type { LeadStatus } from "@/lib/types";

export default async function StatsPage() {
  const supabase = await createClient();

  // Fetch lead counts by status
  const statuses: LeadStatus[] = ["new", "viewed", "contacted", "handled", "archived"];
  const statusCounts: Record<string, number> = {};

  for (const s of statuses) {
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", s);
    statusCounts[s] = count || 0;
  }

  // Fetch latest run metrics
  const { data: lastRun } = await supabase
    .from("run_metrics")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch daily lead counts for chart
  const { data: dailyLeads } = await supabase.rpc("leads_per_day", {
    days_back: 30,
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
        <h1 className="text-2xl font-semibold mb-6">Stats</h1>
        <StatsCards statusCounts={statusCounts} lastRun={lastRun} />
        <div className="mt-8">
          <LeadsChart data={dailyLeads || []} />
        </div>
      </main>
    </div>
  );
}
