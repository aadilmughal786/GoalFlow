// src/components/layout/Header.tsx
"use client"; // This component uses client-side hooks like useTheme

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Goal, Sun, Moon } from "lucide-react"; // Adding Sun and Moon icons
import { useTheme } from "next-themes"; // Import useTheme hook

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Goal className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              GoalFlow
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild className="px-4 py-2 text-sm font-medium">
            <Link href="/goals/new">Add New Goal</Link>
          </Button>
          {/* Dark/Light Mode Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
