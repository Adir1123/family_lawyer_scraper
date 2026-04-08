"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "viewed", label: "Viewed" },
  { value: "contacted", label: "Contacted" },
  { value: "handled", label: "Handled" },
  { value: "archived", label: "Archived" },
];

export function LeadsFilters({
  currentStatus,
  currentSort,
  currentOrder,
}: {
  currentStatus?: string;
  currentSort: string;
  currentOrder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/leads?${params.toString()}`);
  }

  function toggleOrder() {
    updateParams("order", currentOrder === "desc" ? "asc" : "desc");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <Select
        value={currentStatus || ""}
        onChange={(e) => updateParams("status", e.target.value)}
        className="w-full md:w-[160px]"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <Button variant="outline" size="sm" onClick={toggleOrder}>
        {currentOrder === "desc" ? "Newest first" : "Oldest first"}
      </Button>
    </div>
  );
}
