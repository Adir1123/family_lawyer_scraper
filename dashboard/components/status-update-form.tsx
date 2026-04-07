"use client";

import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { LeadStatus } from "@/lib/types";

const statuses: LeadStatus[] = ["new", "viewed", "contacted", "handled", "archived"];

export function StatusUpdateForm({
  currentStatus,
  action,
}: {
  currentStatus: LeadStatus;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <Select name="status" defaultValue={currentStatus} className="w-[160px]">
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm">
        Update
      </Button>
    </form>
  );
}
