// src/components/layout/Header.tsx
"use client"; // This component uses client-side hooks like useTheme

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Goal, Sun, Moon, Menu } from "lucide-react"; // Adding Menu icon
import { useTheme } from "next-themes"; // Import useTheme hook
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button asChild variant="ghost" className="text-sm font-medium">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild className="px-4 py-2 text-sm font-medium">
            <Link href="/goals/new">Add New Goal</Link>
          </Button>
          {/* Dark/Light Mode Toggle Button for Desktop */}
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
        </nav>

        {/* Mobile Navigation (Hamburger Menu) */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Dark/Light Mode Toggle Button for Mobile */}
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <Goal className="h-6 w-6 text-primary" />
                  <span>GoalFlow</span>
                </SheetTitle>
                <SheetDescription>Your personal goal tracker.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Link
                  href="/dashboard"
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/goals/new"
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Add New Goal
                </Link>
                {/* Add more mobile navigation links here if needed */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
