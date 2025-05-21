// src/components/layout/Header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Goal } from "lucide-react"; // Adding a simple icon for the logo

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Goal className="h-6 w-6 text-primary" /> {/* Goal icon */}
            <span className="text-xl font-bold tracking-tight text-foreground">
              GoalFlow
            </span>
          </Link>
          {/* Future: Add responsive navigation links here */}
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild className="px-4 py-2 text-sm font-medium">
            <Link href="/goals/new">Add New Goal</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
