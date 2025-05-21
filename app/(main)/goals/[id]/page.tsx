// src/app/(main)/goals/[id]/page.tsx
"use client"; // This page will use client-side hooks to fetch data

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGoalById, deleteGoal } from "@/services/indexedDbService";
import { IGoal } from "@/types";
import { GoalForm } from "@/components/goals/GoalForm";
import { SubtaskList } from "@/components/goals/SubtaskList";
import { GoalDetailsDisplay } from "@/components/goals/GoalDetailsDisplay"; // Import the new component
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
import { Trash2 } from "lucide-react"; // Import Trash2 icon

export default function EditGoalPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;
  const [goal, setGoal] = useState<IGoal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // New state for view/edit mode
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
          setIsEditing(false); // Default to read-only view when page loads
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

  // Callback to update goal progress in this component's state
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
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Loading Goal...
            </CardTitle>
            <CardDescription>
              Please wait while we fetch the goal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
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
            {/* Title changes based on mode */}
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
          {/* Only show delete button in CardFooter if in edit mode (or always if preferred) */}
          {/* Keeping it always visible here for consistency with GoalDetailsDisplay's button */}
          {!isEditing &&
            goal && ( // Only show if not editing and goal is loaded
              <CardFooter className="flex justify-end pt-4">
                {/* The delete button is now part of GoalDetailsDisplay, so this can be removed or made conditional */}
                {/* <Button variant="destructive" onClick={handleDeleteGoal}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Goal
              </Button> */}
              </CardFooter>
            )}
        </Card>

        {/* Subtasks are always shown, regardless of view/edit mode */}
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
