"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { timeAgo, truncate, confidenceColor, cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

function MobileLeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  return (
    <div
      className="rounded-lg border bg-card p-3 active:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm truncate mr-2">
          {lead.author_name || "Unknown"}
        </span>
        <StatusBadge status={lead.status} />
      </div>
      <p dir="auto" className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
        {lead.text}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{timeAgo(lead.posted_at)}</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full", confidenceColor(lead.confidence))}
              style={{ width: `${Math.round(lead.confidence * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {Math.round(lead.confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();

  if (leads.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No leads found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Leads will appear here once the scraper finds matches
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card layout */}
      <div className="flex flex-col gap-2 md:hidden">
        {leads.map((lead) => (
          <MobileLeadCard
            key={lead.id}
            lead={lead}
            onClick={() => router.push(`/leads/${lead.id}`)}
          />
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Posted</TableHead>
              <TableHead className="w-[140px]">Author</TableHead>
              <TableHead className="text-center">Post</TableHead>
              <TableHead className="w-[120px]">Confidence</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/leads/${lead.id}`)}
              >
                <TableCell className="text-muted-foreground text-xs">
                  {timeAgo(lead.posted_at)}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {lead.author_name || "Unknown"}
                </TableCell>
                <TableCell>
                  <p dir="auto" className="text-sm text-muted-foreground leading-relaxed">
                    {truncate(lead.text, 80)}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", confidenceColor(lead.confidence))}
                        style={{ width: `${Math.round(lead.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Math.round(lead.confidence * 100)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
