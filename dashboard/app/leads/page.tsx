import { createClient } from "@/lib/supabase-server";
import { NavBar } from "@/components/nav-bar";
import { LeadsTable } from "@/components/leads-table";
import { LeadsFilters } from "@/components/leads-filters";
import { LeadsGroupTabs } from "@/components/leads-group-tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { LeadStatus } from "@/lib/types";

const PAGE_SIZE = 25;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; order?: string; page?: string; group?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as LeadStatus | undefined;
  const group = params.group;
  const sort = params.sort || "created_at";
  const order = params.order === "asc" ? true : false;
  const page = parseInt(params.page || "1", 10);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Fetch distinct groups for tabs
  const { data: groupRows } = await supabase
    .from("leads")
    .select("group_url")
    .order("group_url");
  const groups = [...new Set((groupRows ?? []).map((r) => r.group_url).filter(Boolean))];

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }
  if (group) {
    query = query.eq("group_url", group);
  }

  query = query.order(sort, { ascending: order }).range(from, to);

  const { data: leads, count } = await query;

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Leads</h1>
          <span className="text-sm text-muted-foreground">
            {count || 0} total
          </span>
        </div>

        <LeadsGroupTabs groups={groups} currentGroup={group} currentStatus={status} />
        <LeadsFilters currentStatus={status} currentSort={sort} currentOrder={order ? "asc" : "desc"} />

        <div className="mt-4">
          <LeadsTable leads={leads || []} />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {page > 1 && (
              <Link
                href={{ query: { ...params, page: String(page - 1) } }}
              >
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            <span className="text-sm text-muted-foreground px-3">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={{ query: { ...params, page: String(page + 1) } }}
              >
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
