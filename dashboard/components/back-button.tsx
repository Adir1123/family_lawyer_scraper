"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4 -ml-2 text-muted-foreground"
      onClick={() => router.back()}
    >
      &larr; Back to leads
    </Button>
  );
}
