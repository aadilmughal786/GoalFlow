// src/app/(main)/dashboard/page.tsx
"use client"; // Mark as a Client Component

import { useEffect, useState, useTransition, useRef } from "react";
import { IGoal, ISubtask, IIdea, IQuote } from "@/types"; // Import IIdea, IQuote
import {
  getGoals,
  deleteGoal,
  exportAllData,
  importAllData,
  updateGoal,
  getQuotes,
} from "@/services/indexedDbService"; // Import getQuotes
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
  PlusCircle,
  ArchiveIcon,
  UnarchiveIcon,
  MessageSquare,
  CalendarDays,
  Tag,
  ArrowUpCircle,
  Goal,
  Loader2,
  Lightbulb,
  Quote as QuoteIcon,
} from "lucide-react"; // Added Quote icon
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
import Fuse from "fuse.js";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function DashboardPage() {
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, startExportTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(
    new Set()
  );

  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentQuote, setCurrentQuote] = useState<IQuote | null>(null); // New state for current quote

  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirmDialog();

  const fuseOptions = {
    keys: ["title", "shortDescription", "description", "category"],
    threshold: 0.3,
    includeScore: true,
  };
  const fuse = new Fuse(goals, fuseOptions);

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

  const fetchAndSetRandomQuote = async () => {
    try {
      const quotes = await getQuotes();
      if (quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
      } else {
        setCurrentQuote(null);
      }
    } catch (err) {
      console.error("Failed to fetch quotes:", err);
      setCurrentQuote(null);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchAndSetRandomQuote(); // Fetch quote on component mount
  }, []);

  useEffect(() => {
    if (!loading && goals.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      goals.forEach((goal) => {
        if (goal.status === "active" && !shownNotifications.has(goal.id)) {
          const target = new Date(goal.targetDate);
          target.setHours(0, 0, 0, 0);

          const daysDiff = differenceInDays(target, now);

          if (isPast(target) && isBefore(target, now)) {
            toast.error(`Goal Overdue: ${goal.title}`, {
              description: `This goal was due on ${format(target, "PPP")}.`,
              duration: 5000,
              id: `overdue-${goal.id}`,
            });
            setShownNotifications((prev) => new Set(prev).add(goal.id));
          } else if (daysDiff >= 0 && daysDiff <= 3) {
            const dueText =
              daysDiff === 0
                ? "today"
                : `in ${daysDiff} day${daysDiff === 1 ? "" : "s"}`;
            toast.warning(`Goal Due Soon: ${goal.title}`, {
              description: `This goal is due ${dueText}.`,
              duration: 5000,
              id: `due-soon-${goal.id}`,
            });
            setShownNotifications((prev) => new Set(prev).add(goal.id));
          }
        }
      });
    }
  }, [loading, goals, shownNotifications]);

  const filteredAndSortedGoals = (() => {
    let currentGoals = goals;

    if (searchQuery.trim() !== "") {
      const searchResults = fuse.search(searchQuery.trim());
      currentGoals = searchResults.map((result) => result.item);
    }

    currentGoals = currentGoals.filter((goal) => {
      if (filterStatus !== "all" && goal.status !== filterStatus) {
        return false;
      }
      if (filterPriority !== "all" && goal.priority !== filterPriority) {
        return false;
      }
      return true;
    });

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
  })();

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

        // Extended isValidImport to check for quotes and new idea fields
        const isValidImport = (
          data: any
        ): data is {
          goals: IGoal[];
          subtasks: ISubtask[];
          ideas?: IIdea[];
          quotes?: IQuote[];
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
            ) &&
            (data.ideas === undefined ||
              (Array.isArray(data.ideas) &&
                data.ideas.every(
                  (idea: any) => "id" in idea && "content" in idea
                ))) &&
            (data.quotes === undefined ||
              (Array.isArray(data.quotes) &&
                data.quotes.every(
                  (quote: any) => "id" in quote && "text" in quote
                )))
          );
        };

        if (!isValidImport(importedData)) {
          throw new Error("Invalid or corrupted GoalFlow export file format.");
        }

        await importAllData(importedData);
        await fetchGoals();
        await fetchAndSetRandomQuote(); // Re-fetch quote after import
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

  const getGoalStatusBadge = (goal: IGoal) => {
    if (goal.status === "completed") {
      return <Badge variant="success">Completed</Badge>;
    } else if (goal.status === "archived") {
      return <Badge variant="outline">Archived</Badge>;
    } else {
      const targetDate = new Date(goal.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysRemaining = differenceInDays(targetDate, today);

      if (isPast(targetDate) && isBefore(targetDate, today)) {
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Overdue
          </Badge>
        );
      } else if (daysRemaining === 0) {
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Due Today
          </Badge>
        );
      } else if (daysRemaining > 0 && daysRemaining <= 7) {
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Due Soon
          </Badge>
        );
      } else {
        return <Badge variant="secondary">Active</Badge>;
      }
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-8 w-full" />
        </Card>
      ))}
    </div>
  );

  const renderFilterSearchSkeletons = () => (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 w-full">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Your Goals Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to GoalFlow! Here you'll see an overview of all your goals.
        </p>
        {renderFilterSearchSkeletons()}
        {renderSkeletons()}
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
            className="cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
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
            className="cursor-pointer"
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isImporting ? "Importing..." : "Import Data"}
          </Button>
        </div>
      </div>

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
              <SelectTrigger
                id="filter-status"
                className="w-full cursor-pointer"
              >
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
              <SelectTrigger
                id="filter-priority"
                className="w-full cursor-pointer"
              >
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
              <SelectTrigger id="sort-by" className="w-full cursor-pointer">
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
              <SelectTrigger id="sort-order" className="w-full cursor-pointer">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search goals by title, short description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            disabled={loading || error !== null}
          />
        </div>
      </div>

      {currentQuote && (
        <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 shadow-md">
          <CardContent className="p-0 space-y-3">
            <QuoteIcon className="h-8 w-8 text-primary mx-auto" />
            <p className="text-xl italic font-semibold text-foreground leading-relaxed">
              &ldquo;{currentQuote.text}&rdquo;
            </p>
            {currentQuote.author && (
              <p className="text-sm text-muted-foreground">
                - {currentQuote.author}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground">
        Welcome to GoalFlow! Here you'll see an overview of all your goals.
      </p>

      {filteredAndSortedGoals.length === 0 ? (
        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
          <Goal className="h-16 w-16 text-primary/60" />
          <h3 className="text-xl font-semibold">No Goals Found</h3>
          {goals.length === 0 ? (
            <p>You haven't set any goals yet. Let's create your first one!</p>
          ) : (
            <p>
              No goals match your current filters or search query. Try adjusting
              them!
            </p>
          )}
          <Button asChild className="mt-4 cursor-pointer">
            <Link href="/goals/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Goal
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGoals.map((goal) => {
            const statusBadge = getGoalStatusBadge(goal);

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
              <Link key={goal.id} href={`/goals/${goal.id}`} className="block">
                <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        {goal.icon && (
                          <div className="flex-shrink-0 text-primary">
                            <DynamicLucideIcon
                              name={goal.icon}
                              className="h-5 w-5"
                            />
                          </div>
                        )}
                        <CardTitle className="text-xl font-semibold leading-tight text-foreground">
                          {goal.title}
                        </CardTitle>
                      </div>
                      {statusBadge}
                    </div>
                    {goal.shortDescription && (
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 flex-shrink-0" />
                          {goal.shortDescription}
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 p-4 pt-3 space-y-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Target: {format(new Date(goal.targetDate), "PPP")}
                        </span>
                        {daysLeftDisplay}
                      </div>
                      {goal.category && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 flex-shrink-0" />
                          <Badge variant="outline">{goal.category}</Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 flex-shrink-0" />
                        <Badge
                          variant={
                            goal.priority === "high"
                              ? "destructive"
                              : goal.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {goal.priority.charAt(0).toUpperCase() +
                            goal.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1 mt-4">
                      <div className="flex justify-between text-sm text-foreground">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="w-full h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
