// src/app/(main)/goals/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGoalById, deleteGoal } from "@/services/indexedDbService";
import { IGoal } from "@/types";
import { GoalForm } from "@/components/goals/GoalForm";
import { SubtaskList } from "@/components/goals/SubtaskList";
import { GoalDetailsDisplay } from "@/components/goals/GoalDetailsDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useConfirmDialog } from "@/lib/hooks/useConfirmProvider";
import { Trash2 } from "lucide-react";

export default function EditGoalPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;
  const [goal, setGoal] = useState<IGoal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const confirm = useConfirmDialog();

  useEffect(() => {
    async function fetchGoal() {
      if (!goalId) {
        setError("Goal ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedGoal = await getGoalById(goalId);
        if (fetchedGoal) {
          setGoal(fetchedGoal);
          setIsEditing(false);
        } else {
          setError("Goal not found.");
          toast.error("Goal Not Found", {
            description: "The goal you are trying to view does not exist.",
          });
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Failed to fetch goal details:", err);
        setError("Failed to load goal details. Please try again.");
        toast.error("Error Loading Goal", {
          description: "Failed to load goal details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchGoal();
  }, [goalId, router]);

  const handleGoalProgressUpdate = (newProgress: number) => {
    setGoal((prevGoal) => {
      if (prevGoal) {
        return { ...prevGoal, progress: newProgress };
      }
      return null;
    });
  };

  const handleDeleteGoal = async () => {
    const confirmed = await confirm({
      title: "Delete Goal?",
      message:
        "Are you sure you want to delete this goal and all its subtasks? This action cannot be undone!",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      try {
        await deleteGoal(goalId);
        toast.success("Goal Deleted", {
          description:
            "The goal and its subtasks have been successfully deleted.",
        });
        router.push("/dashboard");
      } catch (err) {
        console.error("Failed to delete goal:", err);
        toast.error("Failed to delete goal", {
          description: "Failed to delete goal. Please try again.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-start justify-center min-h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Goal Details/Form Skeleton */}
          <Card className="w-full p-6 space-y-6">
            <Skeleton className="h-8 w-3/4" /> {/* Title */}
            <Skeleton className="h-4 w-1/2" /> {/* Description */}
            <Skeleton className="h-24 w-full" /> {/* Textarea/Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" /> {/* Date */}
              <Skeleton className="h-10 w-full" /> {/* Category */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" /> {/* Priority */}
              <Skeleton className="h-10 w-full" /> {/* Status */}
            </div>
            <Skeleton className="h-8 w-full" /> {/* Progress label */}
            <Skeleton className="h-4 w-full" /> {/* Progress bar */}
            <Skeleton className="h-12 w-full" /> {/* Button */}
          </Card>

          {/* Subtask List Skeleton */}
          <Card className="w-full p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" /> {/* Subtasks Title */}
            <Skeleton className="h-4 w-2/3" /> {/* Subtasks Description */}
            <div className="flex space-x-2 mb-4">
              <Skeleton className="h-10 flex-1" /> {/* Input */}
              <Skeleton className="h-10 w-20" /> {/* Button */}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <Skeleton className="h-5 w-5 rounded-sm" /> {/* Checkbox */}
                  <Skeleton className="h-4 w-2/3 ml-3" /> {/* Subtask title */}
                  <Skeleton className="h-8 w-8 rounded-full" />{" "}
                  {/* Delete button */}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">
              Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center min-h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEditing ? "Edit Goal" : "Goal Details"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Modify the details of your goal."
                : "View the full details of your goal."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goal &&
              (isEditing ? (
                <GoalForm initialGoalData={goal} />
              ) : (
                <GoalDetailsDisplay
                  goal={goal}
                  onEditClick={() => setIsEditing(true)}
                  onDeleteClick={handleDeleteGoal}
                />
              ))}
          </CardContent>
          {/* No longer need a separate delete button here as it's in GoalDetailsDisplay */}
        </Card>

        {goal && (
          <SubtaskList
            goalId={goal.id}
            onProgressChange={handleGoalProgressUpdate}
          />
        )}
      </div>
    </div>
  );
}
