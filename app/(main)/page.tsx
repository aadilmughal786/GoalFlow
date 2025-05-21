// src/app/(main)/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Goal,
  CheckCircle2,
  LayoutDashboard,
  Search,
  ArchiveIcon,
  Sun,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px-64px)] text-center px-4 py-12 sm:px-6 lg:px-8">
      {" "}
      {/* Adjusted min-height for header and footer */}
      <div className="max-w-3xl mx-auto space-y-8">
        <Goal className="h-24 w-24 text-primary mx-auto animate-bounce-slow" />{" "}
        {/* Animated Goal Icon */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Achieve Your Goals with <span className="text-primary">GoalFlow</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          GoalFlow is your personal, intuitive, and powerful goal tracker
          designed to help you break down your aspirations, track progress, and
          stay motivated.
        </p>
        {/* Added personal philosophy statement */}
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          I believe in the philosophy of building one thing for a specific
          purpose, and building that one thing exceptionally well. GoalFlow is
          built with this principle in mind: to provide a focused,
          distraction-free environment solely dedicated to helping you achieve
          your goals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <FeatureCard
            icon={<LayoutDashboard className="h-8 w-8 text-primary" />}
            title="Intuitive Dashboard"
            description="Get a clear overview of all your goals, their progress, and deadlines at a glance."
          />
          <FeatureCard
            icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
            title="Detailed Subtasks"
            description="Break down large goals into manageable subtasks and track completion with ease."
          />
          <FeatureCard
            icon={<Search className="h-8 w-8 text-primary" />}
            title="Smart Search & Filters"
            description="Quickly find any goal using fuzzy search and powerful filtering options."
          />
          <FeatureCard
            icon={<ArchiveIcon className="h-8 w-8 text-primary" />}
            title="Archive & Organize"
            description="Keep your active list clean by archiving completed or inactive goals, easily retrievable later."
          />
          <FeatureCard
            icon={<Sun className="h-8 w-8 text-primary" />}
            title="Dark & Light Mode"
            description="Switch between themes for a comfortable viewing experience, day or night."
          />
          <FeatureCard
            icon={<Goal className="h-8 w-8 text-primary" />}
            title="Rich Descriptions"
            description="Add detailed, formatted descriptions to your goals using a powerful rich text editor."
          />
        </div>
        <div className="mt-12">
          <Button
            asChild
            size="lg"
            className="px-8 py-3 text-lg font-semibold shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Link href="/dashboard">Try GoalFlow Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 space-y-4">
      {icon}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}
