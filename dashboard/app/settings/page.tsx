import { createClient } from "@/lib/supabase-server";
import { NavBar } from "@/components/nav-bar";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Fetch the single scraper config row
  const { data: config } = await supabase
    .from("scraper_config")
    .select("*")
    .limit(1)
    .single();

  // Fetch latest run metrics
  const { data: lastRun } = await supabase
    .from("run_metrics")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (!config) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
          <h1 className="text-2xl font-semibold mb-6">Settings</h1>
          <p className="text-muted-foreground">
            No scraper configuration found. Please insert a row into the scraper_config table.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        <SettingsForm config={config} lastRun={lastRun} />
      </main>
    </div>
  );
}
