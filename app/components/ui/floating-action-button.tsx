// src/components/ui/floating-action-button.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"; // Plus icon for adding new goal

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        asChild
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow duration-200"
      >
        <Link href="/goals/new" aria-label="Add new goal">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
