import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { LeadDetailCard } from "@/components/lead-detail-card";
import { BackButton } from "@/components/back-button";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8 animate-slide-up">
        <BackButton />
        <LeadDetailCard lead={lead} />
      </main>
    </div>
  );
}
