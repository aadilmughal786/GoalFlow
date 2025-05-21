// src/components/goals/GoalDetailsDisplay.tsx
"use client";

import { IGoal } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Edit,
  CalendarIcon,
  Tag,
  Info,
  ListChecks,
  ArrowUpCircle,
  Trash2,
} from "lucide-react"; // Added icons

interface GoalDetailsDisplayProps {
  goal: IGoal;
  onEditClick: () => void; // Callback to switch to edit mode
  onDeleteClick: () => void; // Callback for delete action
}

export function GoalDetailsDisplay({
  goal,
  onEditClick,
  onDeleteClick,
}: GoalDetailsDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-3xl font-bold tracking-tight">{goal.title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onEditClick}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Goal
          </Button>
          <Button
            variant="destructive"
            onClick={onDeleteClick}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete Goal
          </Button>
        </div>
      </div>

      {goal.description && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" /> Description
          </h3>
          <p className="text-muted-foreground">{goal.description}</p>
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

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Progress: {goal.progress}%</h3>
        <Progress value={goal.progress} className="w-full" />
      </div>

      <p className="text-sm text-muted-foreground text-right">
        Created: {format(new Date(goal.createdAt), "PPP HH:mm")} | Last Updated:{" "}
        {format(new Date(goal.updatedAt), "PPP HH:mm")}
      </p>
    </div>
  );
}
