// src/components/goals/GoalDetailsDisplay.tsx
"use client";

import { IGoal } from "@/types";
import { format, isPast, isBefore, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  CalendarIcon,
  Tag,
  Info,
  ListChecks,
  ArrowUpCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic"; // For dynamic import of Lucide icons

// Dynamically import all Lucide icons to be able to render them by string name
const DynamicLucideIcon = dynamic(
  async () => {
    const lucideIcons = await import("lucide-react");
    return ({
      name,
      ...props
    }: { name: string } & React.SVGProps<SVGSVGElement>) => {
      const IconComponent = lucideIcons[name as keyof typeof lucideIcons];
      if (IconComponent) {
        return <IconComponent {...props} />;
      }
      // Fallback for emojis or invalid icon names
      return <span {...props}>{name}</span>;
    };
  },
  { ssr: false }
);

interface GoalDetailsDisplayProps {
  goal: IGoal;
}

export function GoalDetailsDisplay({ goal }: GoalDetailsDisplayProps) {
  // Calculate days left for main goal
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysRemaining = differenceInDays(targetDate, today);

  let daysLeftDisplay = null;
  if (goal.status === "active") {
    if (isPast(targetDate) && isBefore(targetDate, today)) {
      daysLeftDisplay = (
        <span className="text-destructive text-xs font-medium ml-1">
          ({Math.abs(daysRemaining)} day
          {Math.abs(daysRemaining) === 1 ? "" : "s"} ago)
        </span>
      );
    } else if (daysRemaining === 0) {
      daysLeftDisplay = (
        <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium ml-1">
          (Due Today)
        </span>
      );
    } else if (daysRemaining > 0) {
      daysLeftDisplay = (
        <span className="text-muted-foreground text-xs font-medium ml-1">
          ({daysRemaining} day{daysRemaining === 1 ? "" : "s"} left)
        </span>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        {" "}
        {/* Adjusted for icon and title */}
        {goal.icon && (
          <div className="flex-shrink-0 text-primary">
            <DynamicLucideIcon name={goal.icon} className="h-8 w-8" />
          </div>
        )}
        <h2 className="text-3xl font-bold tracking-tight">{goal.title}</h2>
      </div>

      {goal.shortDescription && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" /> Why this
            Goal?
          </h3>
          <p className="text-muted-foreground">{goal.shortDescription}</p>
        </div>
      )}

      {goal.description && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" /> Detailed
            Description
          </h3>
          <div
            className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-background/50 text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: goal.description }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Target
            Date
          </h3>
          <p className="text-muted-foreground">
            {format(new Date(goal.targetDate), "PPP")}
            {daysLeftDisplay}
          </p>
        </div>

        {goal.category && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" /> Category
            </h3>
            <Badge variant="outline">{goal.category}</Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" /> Priority
          </h3>
          <Badge
            variant={
              goal.priority === "high"
                ? "destructive"
                : goal.priority === "medium"
                ? "default"
                : "secondary"
            }
          >
            {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" /> Status
          </h3>
          <Badge variant="secondary">
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          Overall Progress
        </h3>
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-primary transition-all duration-500 ease-in-out"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={
                2 * Math.PI * 40 - (2 * Math.PI * 40 * goal.progress) / 100
              }
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {goal.progress}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-right">
        Created: {format(new Date(goal.createdAt), "PPP HH:mm")} | Last Updated:{" "}
        {format(new Date(goal.updatedAt), "PPP HH:mm")}
      </p>
    </div>
  );
}
