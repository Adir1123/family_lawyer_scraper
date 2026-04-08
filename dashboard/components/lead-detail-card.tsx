import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { confidenceColor, cn, timeAgo } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/lib/types";
import { StatusUpdateForm } from "@/components/status-update-form";

export function LeadDetailCard({ lead }: { lead: Lead }) {
  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as LeadStatus;
    const supabase = await createClient();
    await supabase.from("leads").update({ status: newStatus }).eq("id", lead.id);
    revalidatePath("/leads");
    revalidatePath(`/leads/${lead.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{lead.author_name || "Unknown Author"}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{timeAgo(lead.posted_at)}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Post text */}
        <div className="rounded-lg bg-secondary/50 p-4">
          <p dir="auto" className="text-sm leading-relaxed whitespace-pre-wrap">
            {lead.text}
          </p>
        </div>

        {/* Confidence */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Confidence</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden max-w-xs">
              <div
                className={cn("h-full rounded-full", confidenceColor(lead.confidence))}
                style={{ width: `${Math.round(lead.confidence * 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium">{Math.round(lead.confidence * 100)}%</span>
            <span className="text-xs text-muted-foreground capitalize">({lead.category})</span>
          </div>
        </div>

        {/* AI Reasoning */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">AI Reasoning</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{lead.reasoning}</p>
        </div>

        {/* Source */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Source</p>
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {lead.url}
          </a>
        </div>

        {/* Status update */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Update Status</p>
          <StatusUpdateForm currentStatus={lead.status} action={updateStatus} />
        </div>
      </CardContent>
    </Card>
  );
}
