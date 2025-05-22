// src/app/(main)/goals/[id]/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getGoalById,
  deleteGoal,
  updateGoal,
  getSubtasksForGoal,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  // Removed: addJournalEntry, updateJournalEntry, deleteJournalEntry,
} from "@/services/indexedDbService";
import { IGoal, ISubtask /* Removed: IJournalEntry */ } from "@/types";
import { toast } from "sonner";
import { GoalDetailsDisplay } from "@/components/goals/GoalDetailsDisplay";
import { GoalForm } from "@/components/goals/GoalForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isPast, isBefore, differenceInDays, parseISO } from "date-fns";
import {
  PlusCircle,
  Trash2,
  Loader2,
  Edit,
  ArchiveIcon,
  ArchiveRestore,
  CheckCircle2,
  RotateCcw,
  XCircle,
  CalendarIcon,
  // Removed: BookOpen, MessageSquare,
} from "lucide-react";
import { useConfirmDialog } from "@/lib/hooks/useConfirmProvider";
// Removed: import { MarkdownEditorPro } from "@/components/ui/markdown-editor-pro";
// Removed: import MarkdownPreview from '@uiw/react-markdown-preview';
// Removed: import { useTheme } from "next-themes";

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  // Removed: const { theme } = useTheme();

  const [goal, setGoal] = useState<IGoal | null>(null);
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Main goal editing state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskTargetDate, setNewSubtaskTargetDate] = useState<
    Date | undefined
  >(undefined);
  const [isAddingSubtask, startAddSubtaskTransition] = useTransition();
  const [isUpdatingSubtask, startUpdateSubtaskTransition] = useTransition();
  const [isDeletingSubtask, startDeletingSubtaskTransition] = useTransition();
  const [isUpdatingGoalStatus, startUpdatingGoalStatusTransition] =
    useTransition();
  const [isArchivingGoal, startArchivingGoalTransition] = useTransition();
  const [isDeletingGoal, startDeletingGoalTransition] = useTransition();
  const [isSavingGoal, startSavingGoalTransition] = useTransition();

  // Removed all Journaling states and functions

  const confirm = useConfirmDialog();

  // Function to calculate goal progress based on subtasks
  const calculateGoalProgress = (currentSubtasks: ISubtask[]): number => {
    if (currentSubtasks.length === 0) {
      return 0;
    }
    const completedSubtasks = currentSubtasks.filter(
      (sub) => sub.isCompleted
    ).length;
    return Math.round((completedSubtasks / currentSubtasks.length) * 100);
  };

  // Function to update main goal's progress in DB
  const updateMainGoalProgress = async (currentSubtasks: ISubtask[]) => {
    if (!goal) return;
    const newProgress = calculateGoalProgress(currentSubtasks);
    if (newProgress !== goal.progress) {
      try {
        await updateGoal(goal.id, { progress: newProgress });
        setGoal((prevGoal) =>
          prevGoal ? { ...prevGoal, progress: newProgress } : null
        );
      } catch (err) {
        console.error("Failed to update main goal progress:", err);
      }
    }
  };

  const fetchGoalAndSubtasks = async () => {
    setLoading(true);
    try {
      const fetchedGoal = await getGoalById(goalId);
      if (fetchedGoal) {
        setGoal(fetchedGoal);
        const fetchedSubtasks = await getSubtasksForGoal(goalId);
        setSubtasks(fetchedSubtasks);
        updateMainGoalProgress(fetchedSubtasks);
      } else {
        toast.error("Goal not found", {
          description: "The requested goal could not be found.",
        });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch goal or subtasks:", err);
      toast.error("Failed to load goal", {
        description: "There was an error loading the goal details.",
      });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (goalId) {
      fetchGoalAndSubtasks();
    }
  }, [goalId]);

  const handleDeleteGoal = async () => {
    const confirmed = await confirm({
      title: "Delete Goal",
      message:
        "Are you sure you want to delete this goal and all its subtasks? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      countdownSeconds: 10,
      isConfirming: isDeletingGoal,
    });

    if (confirmed) {
      startDeletingGoalTransition(async () => {
        try {
          await deleteGoal(goalId);
          toast.success("Goal Deleted", {
            description:
              "The goal and its subtasks have been permanently deleted.",
          });
          router.push("/dashboard");
        } catch (err) {
          console.error("Failed to delete goal:", err);
          toast.error("Deletion Failed", {
            description: "Could not delete the goal. Please try again.",
          });
        }
      });
    }
  };

  const handleArchiveToggle = async (
    id: string,
    currentStatus: IGoal["status"]
  ) => {
    const newStatus: IGoal["status"] =
      currentStatus === "archived" ? "active" : "archived";
    const actionText = newStatus === "archived" ? "archive" : "unarchive";

    const confirmed = await confirm({
      title: `${
        newStatus === "archived" ? "Archive Goal?" : "Unarchive Goal?"
      }`,
      message: `Are you sure you want to ${actionText} this goal?`,
      confirmText: `Yes, ${actionText} it`,
      cancelText: "Cancel",
      isConfirming: isArchivingGoal,
    });

    if (confirmed) {
      startArchivingGoalTransition(async () => {
        try {
          await updateGoal(id, { status: newStatus });
          setGoal((prevGoal) =>
            prevGoal
              ? { ...prevGoal, status: newStatus, updatedAt: Date.now() }
              : null
          );
          toast.success("Goal Status Updated", {
            description: `Goal has been ${actionText}d.`,
          });
        } catch (err) {
          console.error(`Failed to ${actionText} goal:`, err);
          toast.error("Status Update Failed", {
            description: `Could not ${actionText} the goal. Please try again.`,
          });
        }
      });
    }
  };

  const handleToggleGoalStatus = async (
    id: string,
    currentStatus: IGoal["status"]
  ) => {
    const newStatus: IGoal["status"] =
      currentStatus === "completed" ? "active" : "completed";
    const actionText = newStatus === "completed" ? "complete" : "activate";

    const confirmed = await confirm({
      title: `${
        newStatus === "completed" ? "Mark as Completed?" : "Mark as Active?"
      }`,
      message: `Are you sure you want to ${actionText} this goal?`,
      confirmText: `Yes, ${actionText} it`,
      cancelText: "Cancel",
      isConfirming: isUpdatingGoalStatus,
    });

    if (confirmed) {
      startUpdatingGoalStatusTransition(async () => {
        try {
          await updateGoal(id, { status: newStatus });
          setGoal((prevGoal) =>
            prevGoal
              ? { ...prevGoal, status: newStatus, updatedAt: Date.now() }
              : null
          );
          toast.success("Goal Status Updated", {
            description: `Goal has been marked as ${newStatus}.`,
          });
        } catch (err) {
          console.error(`Failed to update goal status for ${id}:`, err);
          toast.error("Status Update Failed", {
            description: "Could not update goal status. Please try again.",
          });
        }
      });
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) {
      toast.error("Subtask title cannot be empty.");
      return;
    }
    if (!newSubtaskTargetDate) {
      toast.error("Subtask target date cannot be empty.");
      return;
    }
    if (!goalId) {
      toast.error("Cannot add subtask: Goal ID is missing.");
      return;
    }

    startAddSubtaskTransition(async () => {
      try {
        const addedSubtask = await addSubtask({
          goalId,
          title: newSubtaskTitle,
          isCompleted: false,
          targetDate: format(newSubtaskTargetDate, "yyyy-MM-dd"),
        });
        const updatedSubtasks = [...subtasks, addedSubtask];
        setSubtasks(updatedSubtasks);
        setNewSubtaskTitle("");
        setNewSubtaskTargetDate(undefined);
        toast.success("Subtask Added", {
          description: "New subtask has been added.",
        });
        await updateMainGoalProgress(updatedSubtasks);
      } catch (err) {
        console.error("Failed to add subtask:", err);
        toast.error("Failed to add subtask", {
          description: "Could not add subtask. Please try again.",
        });
      }
    });
  };

  const handleToggleSubtaskCompletion = async (
    subtaskId: string,
    currentStatus: boolean
  ) => {
    startUpdateSubtaskTransition(async () => {
      try {
        await updateSubtask(subtaskId, { isCompleted: !currentStatus });
        const updatedSubtasks = subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, isCompleted: !currentStatus } : sub
        );
        setSubtasks(updatedSubtasks);
        toast.success("Subtask Updated", {
          description: "Subtask completion status changed.",
        });
        await updateMainGoalProgress(updatedSubtasks);
      } catch (err) {
        console.error("Failed to update subtask:", err);
        toast.error("Subtask Update Failed", {
          description: "Could not update subtask. Please try again.",
        });
      }
    });
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const confirmed = await confirm({
      title: "Delete Subtask",
      message:
        "Are you sure you want to delete this subtask? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      isConfirming: isDeletingSubtask,
    });

    if (confirmed) {
      startDeleteSubtaskTransition(async () => {
        try {
          await deleteSubtask(subtaskId);
          const updatedSubtasks = subtasks.filter(
            (sub) => sub.id !== subtaskId
          );
          setSubtasks(updatedSubtasks);
          toast.success("Subtask Deleted", {
            description: "Subtask has been permanently deleted.",
          });
          await updateMainGoalProgress(updatedSubtasks);
        } catch (err) {
          console.error("Failed to delete subtask:", err);
          toast.error("Subtask Deletion Failed", {
            description: "Could not delete subtask. Please try again.",
          });
        }
      });
    }
  };

  // Removed all Journaling Functions

  const handleGoalSaved = (updatedGoal: IGoal) => {
    startSavingGoalTransition(() => {
      setGoal(updatedGoal);
      setIsEditing(false);
      toast.success("Goal Saved", {
        description: "Your goal has been successfully saved.",
      });
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const getSubtaskStatusInfo = (subtask: ISubtask) => {
    const target = parseISO(subtask.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysDiff = differenceInDays(target, today);

    if (subtask.isCompleted) {
      return (
        <span className="text-sm text-green-600 dark:text-green-400 ml-2">
          (Completed)
        </span>
      );
    } else if (isPast(target) && isBefore(target, today)) {
      return (
        <span className="text-destructive text-xs font-medium ml-2">
          ({Math.abs(daysDiff)} day{Math.abs(daysDiff) === 1 ? "" : "s"}{" "}
          overdue)
        </span>
      );
    } else if (daysDiff === 0) {
      return (
        <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium ml-2">
          (Due Today)
        </span>
      );
    } else if (daysDiff > 0 && daysDiff <= 7) {
      return (
        <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium ml-2">
          ({daysDiff} day{daysDiff === 1 ? "" : "s"} left)
        </span>
      );
    } else if (daysDiff > 7) {
      return (
        <span className="text-muted-foreground text-xs font-medium ml-2">
          ({daysDiff} day{daysDiff === 1 ? "" : "s"} left)
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <Skeleton className="h-48 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-8 w-full mt-8" />
      </div>
    );
  }

  if (!goal) {
    return null;
  }

  const isArchived = goal.status === "archived";
  const isCompleted = goal.status === "completed";

  return (
    <div className="space-y-8">
      {isEditing ? (
        <GoalForm
          initialGoalData={goal}
          onGoalSaved={handleGoalSaved}
          isSaving={isSavingGoal}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <GoalDetailsDisplay goal={goal} />
      )}

      {/* Subtasks section */}
      <div className="space-y-6 pt-8 border-t mt-8">
        <h3 className="text-2xl font-bold tracking-tight">Subtasks</h3>

        {isEditing && ( // Only show add subtask form in edit mode
          <form
            onSubmit={handleAddSubtask}
            className="flex flex-col sm:flex-row gap-2 mb-4"
          >
            <Input
              type="text"
              placeholder="Add a new subtask title..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1"
              disabled={isAddingSubtask}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-auto justify-start text-left font-normal",
                    !newSubtaskTargetDate && "text-muted-foreground"
                  )}
                  disabled={isAddingSubtask}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newSubtaskTargetDate ? (
                    format(newSubtaskTargetDate, "PPP")
                  ) : (
                    <span>Set Target Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newSubtaskTargetDate}
                  onSelect={setNewSubtaskTargetDate}
                  initialFocus
                  disabled={isAddingSubtask}
                />
              </PopoverContent>
            </Popover>
            <Button
              type="submit"
              disabled={
                isAddingSubtask ||
                !newSubtaskTitle.trim() ||
                !newSubtaskTargetDate
              }
              className="cursor-pointer"
            >
              {isAddingSubtask ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-2" />
              )}
              Add Subtask
            </Button>
          </form>
        )}

        {subtasks.length === 0 ? (
          <p className="text-muted-foreground">
            No subtasks yet.{" "}
            {isEditing ? "Add one above!" : "This goal has no subtasks."}
          </p>
        ) : (
          <ul className="space-y-3">
            {subtasks.map((subtask) => (
              <li
                key={subtask.id}
                className="flex items-center justify-between p-3 border rounded-md bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {isEditing ? (
                    <Checkbox
                      id={`subtask-${subtask.id}`}
                      checked={subtask.isCompleted}
                      onCheckedChange={() =>
                        handleToggleSubtaskCompletion(
                          subtask.id,
                          subtask.isCompleted
                        )
                      }
                      disabled={isUpdatingSubtask}
                      className="cursor-pointer"
                    />
                  ) : (
                    subtask.isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )
                  )}
                  <Label
                    htmlFor={`subtask-${subtask.id}`}
                    className={`text-base font-medium ${
                      subtask.isCompleted
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {subtask.title}
                  </Label>
                  <span className="text-sm text-muted-foreground ml-2 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {format(parseISO(subtask.targetDate), "PPP")}
                    {getSubtaskStatusInfo(subtask)}
                  </span>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    disabled={isDeletingSubtask}
                    className="text-destructive hover:text-destructive/80 cursor-pointer"
                  >
                    {isDeletingSubtask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Removed Journaling Section */}

      {/* Action Buttons for Goal (visible based on mode) */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t mt-8">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSavingGoal}
              className="cursor-pointer"
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              type="submit"
              form="goal-form"
              disabled={isSavingGoal}
              className="w-full sm:w-auto cursor-pointer"
            >
              {isSavingGoal ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSavingGoal ? "Updating Goal..." : "Update Goal"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={isCompleted ? "secondary" : "default"}
              onClick={() => handleToggleGoalStatus(goal.id, goal.status)}
              disabled={
                isUpdatingGoalStatus || isArchivingGoal || isDeletingGoal
              }
              className="cursor-pointer"
            >
              {isUpdatingGoalStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isCompleted ? (
                <RotateCcw className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {isUpdatingGoalStatus
                ? "Updating..."
                : isCompleted
                ? "Mark as Active"
                : "Mark as Completed"}
            </Button>

            <Button
              variant={isArchived ? "secondary" : "outline"}
              onClick={() => handleArchiveToggle(goal.id, goal.status)}
              disabled={
                isUpdatingGoalStatus || isArchivingGoal || isDeletingGoal
              }
              className="flex items-center gap-2 cursor-pointer"
            >
              {isArchivingGoal ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isArchived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <ArchiveIcon className="h-4 w-4" />
              )}
              {isArchivingGoal
                ? "Updating..."
                : isArchived
                ? "Unarchive"
                : "Archive"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={
                isUpdatingGoalStatus || isArchivingGoal || isDeletingGoal
              }
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit className="h-4 w-4" /> Edit Goal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGoal}
              disabled={
                isUpdatingGoalStatus || isArchivingGoal || isDeletingGoal
              }
              className="flex items-center gap-2 cursor-pointer"
            >
              {isDeletingGoal ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isDeletingGoal ? "Deleting..." : "Delete Goal"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
