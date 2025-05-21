// src/components/goals/SubtaskList.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { ISubtask, IGoal } from "@/types";
import {
  addSubtask,
  getSubtasksForGoal,
  updateSubtask,
  deleteSubtask,
  getGoalById,
  updateGoal,
} from "@/services/indexedDbService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ListTodo } from "lucide-react"; // Added ListTodo icon
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useConfirmDialog } from "@/lib/hooks/useConfirmProvider";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface SubtaskListProps {
  goalId: string;
  onProgressChange?: (newProgress: number) => void;
}

export function SubtaskList({ goalId, onProgressChange }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, startAddingTransition] = useTransition();
  const confirm = useConfirmDialog();

  const calculateGoalProgress = (currentSubtasks: ISubtask[]): number => {
    if (currentSubtasks.length === 0) {
      return 0;
    }
    const completedSubtasks = currentSubtasks.filter(
      (st) => st.isCompleted
    ).length;
    return Math.round((completedSubtasks / currentSubtasks.length) * 100);
  };

  const updateParentGoalProgress = async (currentSubtasks: ISubtask[]) => {
    const newProgress = calculateGoalProgress(currentSubtasks);
    try {
      await updateGoal(goalId, { progress: newProgress });
      onProgressChange?.(newProgress);
      console.log(`Goal ${goalId} progress updated to ${newProgress}%`);
    } catch (err) {
      console.error(
        `Failed to update parent goal progress for ${goalId}:`,
        err
      );
      toast.error("Progress Update Failed", {
        description: "Could not update the main goal's progress.",
      });
    }
  };

  const fetchSubtasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSubtasks = await getSubtasksForGoal(goalId);
      const sortedSubtasks = fetchedSubtasks.sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return 1;
        if (!a.isCompleted && b.isCompleted) return -1;
        return a.createdAt - b.createdAt;
      });
      setSubtasks(sortedSubtasks);
      await updateParentGoalProgress(sortedSubtasks);
    } catch (err) {
      console.error("Failed to fetch subtasks:", err);
      setError("Failed to load subtasks. Please try again.");
      toast.error("Failed to load subtasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (goalId) {
      fetchSubtasks();
    }
  }, [goalId]);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) {
      toast.error("Missing Information", {
        description: "Subtask title cannot be empty.",
      });
      return;
    }

    startAddingTransition(async () => {
      try {
        const addedSubtask = await addSubtask({
          goalId,
          title: newSubtaskTitle.trim(),
          isCompleted: false,
        });
        const updatedSubtasks = [...subtasks, addedSubtask].sort((a, b) => {
          if (a.isCompleted && !b.isCompleted) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          return a.createdAt - b.createdAt;
        });
        setSubtasks(updatedSubtasks);
        setNewSubtaskTitle("");
        toast.success("Subtask Added", {
          description: "New subtask has been successfully added.",
        });
        await updateParentGoalProgress(updatedSubtasks);
      } catch (err) {
        console.error("Failed to add subtask:", err);
        toast.error("Failed to add subtask", {
          description: "Failed to add subtask. Please try again.",
        });
      }
    });
  };

  const handleToggleSubtaskCompletion = async (
    subtaskId: string,
    isCompleted: boolean
  ) => {
    try {
      await updateSubtask(subtaskId, { isCompleted });
      const updatedSubtasks = subtasks
        .map((st) => (st.id === subtaskId ? { ...st, isCompleted } : st))
        .sort((a, b) => {
          if (a.isCompleted && !b.isCompleted) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          return a.createdAt - b.createdAt;
        });
      setSubtasks(updatedSubtasks);
      toast.success("Subtask Updated", {
        description: `Subtask marked as ${
          isCompleted ? "completed" : "incomplete"
        }.`,
      });
      await updateParentGoalProgress(updatedSubtasks);
    } catch (err) {
      console.error("Failed to update subtask:", err);
      toast.error("Failed to update subtask status", {
        description: "Failed to update subtask status. Please try again.",
      });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const confirmed = await confirm({
      title: "Delete Subtask?",
      message:
        "Are you sure you want to delete this subtask? This action cannot be undone!",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      try {
        await deleteSubtask(subtaskId);
        const updatedSubtasks = subtasks.filter((st) => st.id !== subtaskId);
        setSubtasks(updatedSubtasks);
        toast.success("Subtask Deleted", {
          description: "Subtask has been successfully deleted.",
        });
        await updateParentGoalProgress(updatedSubtasks);
      } catch (err) {
        console.error("Failed to delete subtask:", err);
        toast.error("Failed to delete subtask", {
          description: "Failed to delete subtask. Please try again.",
        });
      }
    }
  };

  // Render Skeletons for loading state
  const renderSubtaskSkeletons = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map(
        (
          _,
          i // Render 3 skeleton subtasks
        ) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 border rounded-md"
          >
            <Skeleton className="h-5 w-5 rounded-sm" /> {/* Checkbox */}
            <Skeleton className="h-4 w-2/3 ml-3" /> {/* Subtask title */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Delete button */}
          </div>
        )
      )}
    </div>
  );

  if (loading) {
    return (
      <Card className="mt-6 p-6 space-y-4">
        <Skeleton className="h-6 w-1/3" /> {/* Subtasks Title */}
        <Skeleton className="h-4 w-2/3" /> {/* Subtasks Description */}
        <div className="flex space-x-2 mb-4">
          <Skeleton className="h-10 flex-1" /> {/* Input */}
          <Skeleton className="h-10 w-20" /> {/* Button */}
        </div>
        {renderSubtaskSkeletons()}
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 text-red-500 text-center py-4">
        <p>{error}</p>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Subtasks</CardTitle>
        <CardDescription>
          Break down your goal into smaller, actionable steps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddSubtask} className="flex space-x-2 mb-4">
          <Input
            placeholder="Add a new subtask..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            disabled={isAdding}
          />
          <Button type="submit" disabled={isAdding}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </form>

        {subtasks.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
            <ListTodo className="h-16 w-16 text-primary/60" />
            <h3 className="text-xl font-semibold">No Subtasks Yet</h3>
            <p>Add some steps to break down this goal!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center justify-between p-3 border rounded-md bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    id={`subtask-${subtask.id}`}
                    checked={subtask.isCompleted}
                    onCheckedChange={(checked) =>
                      handleToggleSubtaskCompletion(
                        subtask.id,
                        Boolean(checked)
                      )
                    }
                  />
                  <Label
                    htmlFor={`subtask-${subtask.id}`}
                    className={`flex-1 text-base ${
                      subtask.isCompleted
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {subtask.title}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  aria-label={`Delete subtask ${subtask.title}`}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Subtasks automatically sort with completed items at the bottom.
      </CardFooter>
    </Card>
  );
}
