// src/app/(main)/dashboard/page.tsx
"use client"; // Mark as a Client Component

import { useEffect, useState, useTransition, useRef } from "react";
import { IGoal, ISubtask } from "@/types"; // Import your goal interface
import {
  getGoals,
  deleteGoal,
  exportAllData,
  importAllData,
  updateGoal,
} from "@/services/indexedDbService"; // Import updateGoal
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isBefore, addDays, differenceInDays } from "date-fns";
import Link from "next/link";
import {
  Trash2,
  Edit,
  Download,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useConfirmDialog } from "@/lib/hooks/useConfirmProvider";
import Fuse from "fuse.js"; // Import Fuse.js

export default function DashboardPage() {
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, startExportTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();
  const [isUpdatingStatus, startUpdatingStatusTransition] = useTransition();

  // State for filtering and sorting
  const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'active', 'completed', 'archived'
  const [filterPriority, setFilterPriority] = useState<string>("all"); // 'all', 'low', 'medium', 'high'
  const [sortBy, setSortBy] = useState<string>("createdAt"); // 'title', 'targetDate', 'createdAt'
  const [sortOrder, setSortOrder] = useState<string>("desc"); // 'asc', 'desc'
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query

  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirmDialog();

  // Fuse.js options for fuzzy searching
  const fuseOptions = {
    keys: ["title", "description", "category"], // Fields to search in
    threshold: 0.3, // Fuzziness threshold (0.0 = exact match, 1.0 = match anything)
    includeScore: true, // Include score in results (optional, for debugging/ranking)
  };
  const fuse = new Fuse(goals, fuseOptions); // Initialize Fuse with all goals

  // Function to fetch goals from IndexedDB
  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const allGoals = await getGoals();
      setGoals(allGoals);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      setError("Failed to load goals. Please refresh the page.");
      toast.error("Failed to load goals. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // Filter and sort goals based on state
  const filteredAndSortedGoals = (() => {
    let currentGoals = goals;

    // Apply search query filter using Fuse.js
    if (searchQuery.trim() !== "") {
      const searchResults = fuse.search(searchQuery.trim());
      currentGoals = searchResults.map((result) => result.item);
    }

    // Apply status filter
    currentGoals = currentGoals.filter((goal) => {
      if (filterStatus !== "all" && goal.status !== filterStatus) {
        return false;
      }
      return true;
    });

    // Apply priority filter
    currentGoals = currentGoals.filter((goal) => {
      if (filterPriority !== "all" && goal.priority !== filterPriority) {
        return false;
      }
      return true;
    });

    // Apply sorting
    return currentGoals.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "targetDate") {
        comparison =
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      } else if (sortBy === "createdAt") {
        comparison = a.createdAt - b.createdAt;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  })(); // Use an IIFE for immediate execution and cleaner derived state

  const handleExportData = () => {
    startExportTransition(async () => {
      try {
        await exportAllData();
        toast.success("Data Exported", {
          description: "Your GoalFlow data has been successfully exported.",
        });
      } catch (err) {
        toast.error("Export Failed", {
          description:
            "There was an error exporting your data. See console for details.",
        });
      }
    });
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const confirmed = await confirm({
      title: "Confirm Data Import",
      message:
        "Importing data will CLEAR ALL your current goals and subtasks and replace them with the imported data. Are you sure you want to proceed?",
      confirmText: "Import & Replace",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    startImportTransition(async () => {
      try {
        const fileContent = await file.text();
        const importedData = JSON.parse(fileContent);

        const isValidImport = (
          data: any
        ): data is {
          goals: IGoal[];
          subtasks: ISubtask[];
          version?: number;
        } => {
          return (
            typeof data === "object" &&
            Array.isArray(data.goals) &&
            data.goals.every(
              (goal: any) =>
                "id" in goal && "title" in goal && "targetDate" in goal
            ) &&
            Array.isArray(data.subtasks) &&
            data.subtasks.every(
              (subtask: any) =>
                "id" in subtask && "goalId" in subtask && "title" in subtask
            )
          );
        };

        if (!isValidImport(importedData)) {
          throw new Error("Invalid or corrupted GoalFlow export file format.");
        }

        await importAllData(importedData);
        await fetchGoals(); // Re-fetch goals to update the UI
        toast.success("Import Successful", {
          description:
            "Your goals have been successfully imported and updated.",
        });
      } catch (err) {
        console.error("Failed to import data:", err);
        toast.error("Import Failed", {
          description: `Failed to import data: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please ensure it's a valid GoalFlow export file.`,
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  // Helper function to determine goal status badge and days left
  const getGoalStatusBadge = (goal: IGoal) => {
    if (goal.status === "completed") {
      return <Badge variant="success">Completed</Badge>;
    }
    if (goal.status === "archived") {
      return <Badge variant="outline">Archived</Badge>;
    }

    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    const daysRemaining = differenceInDays(targetDate, today);

    let statusText: string;
    let statusVariant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning" = "secondary";
    let StatusIcon: React.ElementType | null = null;

    if (isPast(targetDate) && isBefore(targetDate, today)) {
      statusText = "Overdue";
      statusVariant = "destructive";
      StatusIcon = AlertCircle;
    } else if (daysRemaining <= 7 && daysRemaining >= 0) {
      // Due within 7 days (inclusive of today)
      statusText =
        daysRemaining === 0
          ? "Due Today"
          : `Due in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
      statusVariant = "warning";
      StatusIcon = Clock;
    } else {
      statusText = `Active (${daysRemaining} day${
        daysRemaining === 1 ? "" : "s"
      } left)`;
      statusVariant = "secondary";
    }

    return (
      <Badge variant={statusVariant} className="flex items-center gap-1">
        {StatusIcon && <StatusIcon className="h-3 w-3" />} {statusText}
      </Badge>
    );
  };

  // New handler for marking goal status
  const handleToggleGoalStatus = async (
    goalId: string,
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
    });

    if (confirmed) {
      startUpdatingStatusTransition(async () => {
        try {
          await updateGoal(goalId, { status: newStatus });
          // Update the local state to reflect the change immediately
          setGoals((prevGoals) =>
            prevGoals.map((goal) =>
              goal.id === goalId
                ? { ...goal, status: newStatus, updatedAt: Date.now() }
                : goal
            )
          );
          toast.success("Goal Status Updated", {
            description: `Goal has been marked as ${newStatus}.`,
          });
        } catch (err) {
          console.error(`Failed to update goal status for ${goalId}:`, err);
          toast.error("Status Update Failed", {
            description: "Could not update goal status. Please try again.",
          });
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-muted-foreground">Loading goals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Your Goals Dashboard
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExportData}
            disabled={isExporting || goals.length === 0 || isImporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button
            onClick={handleImportButtonClick}
            disabled={isImporting || isExporting}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? "Importing..." : "Import Data"}
          </Button>
        </div>
      </div>

      {/* Filtering, Sorting, and Search Controls */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-status"
              className="text-sm font-medium whitespace-nowrap"
            >
              Status:
            </label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
              disabled={loading || error !== null}
            >
              <SelectTrigger id="filter-status" className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-priority"
              className="text-sm font-medium whitespace-nowrap"
            >
              Priority:
            </label>
            <Select
              value={filterPriority}
              onValueChange={setFilterPriority}
              disabled={loading || error !== null}
            >
              <SelectTrigger id="filter-priority" className="w-full">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-by"
              className="text-sm font-medium whitespace-nowrap"
            >
              Sort By:
            </label>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
              disabled={loading || error !== null}
            >
              <SelectTrigger id="sort-by" className="w-full">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="targetDate">Target Date</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-order"
              className="text-sm font-medium whitespace-nowrap"
            >
              Order:
            </label>
            <Select
              value={sortOrder}
              onValueChange={setSortOrder}
              disabled={loading || error !== null}
            >
              <SelectTrigger id="sort-order" className="w-full">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search goals by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            disabled={loading || error !== null}
          />
        </div>
      </div>

      <p className="text-muted-foreground">
        Welcome to GoalFlow! Here you'll see an overview of all your goals.
      </p>

      {filteredAndSortedGoals.length === 0 ? (
        <div className="p-6 border rounded-lg shadow-sm text-center text-muted-foreground">
          {goals.length === 0
            ? 'You haven\'t set any goals yet! Click "Add New Goal" in the header to get started.'
            : "No goals match your current filters. Try adjusting them!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGoals.map((goal) => (
            // Wrap the entire Card with Link
            <Link key={goal.id} href={`/goals/${goal.id}`} className="block">
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold">
                      {goal.title}
                    </CardTitle>
                    {/* Display goal status badge */}
                    {getGoalStatusBadge(goal)}
                  </div>
                  <CardDescription className="text-sm line-clamp-2">
                    {goal.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                      Target: {format(new Date(goal.targetDate), "PPP")}
                    </span>
                    {goal.category && (
                      <Badge variant="outline">{goal.category}</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="w-full" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-4">
                  {/* New button to toggle goal status */}
                  <Button
                    variant={
                      goal.status === "completed" ? "secondary" : "default"
                    }
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigating to goal details page
                      e.stopPropagation(); // Stop event propagation
                      handleToggleGoalStatus(goal.id, goal.status);
                    }}
                    disabled={isUpdatingStatus}
                  >
                    {goal.status === "completed" ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" /> Mark as Active
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as
                        Completed
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
