"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeadsGroupTabsProps {
  groups: string[];
  currentGroup: string | undefined;
  currentStatus: string | undefined;
}

function extractGroupName(url: string): string {
  const match = url.match(/facebook\.com\/groups\/([^/]+)/);
  if (!match) return url;
  const slug = match[1];
  // If it's a numeric ID, show shortened version
  if (/^\d+$/.test(slug)) return `Group ${slug.slice(-6)}`;
  // Otherwise show the slug name
  return slug.replace(/[-_]/g, " ");
}

export function LeadsGroupTabs({ groups, currentGroup, currentStatus }: LeadsGroupTabsProps) {
  if (groups.length <= 1) return null;

  function buildHref(group?: string) {
    const params = new URLSearchParams();
    if (group) params.set("group", group);
    if (currentStatus) params.set("status", currentStatus);
    const qs = params.toString();
    return qs ? `/leads?${qs}` : "/leads";
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
      <Link
        href={buildHref()}
        className={cn(
          "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          !currentGroup
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </Link>
      {groups.map((group) => (
        <Link
          key={group}
          href={buildHref(group)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            currentGroup === group
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {extractGroupName(group)}
        </Link>
      ))}
    </div>
  );
}
