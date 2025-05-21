// src/app/(main)/ideas/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IIdea } from "@/types";
import {
  getIdeas,
  addIdea,
  updateIdea,
  deleteIdea,
  addGoal,
} from "@/services/indexedDbService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useConfirmDialog } from "@/lib/hooks/useConfirmProvider";
import {
  Loader2,
  Lightbulb,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  ArrowRightCircle,
  Scale,
  Zap,
  Link,
} from "lucide-react"; // Added Scale, Zap icons
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Label } from "@/components/ui/label"; // Import Label
import { Badge } from "@/components/ui/badge";

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<IIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newIdeaContent, setNewIdeaContent] = useState("");
  const [newIdeaEffort, setNewIdeaEffort] = useState<IIdea["effort"]>(""); // New state for new idea effort
  const [newIdeaImpact, setNewIdeaImpact] = useState<IIdea["impact"]>(""); // New state for new idea impact
  const [isAddingIdea, startAddingIdeaTransition] = useTransition();

  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingIdeaContent, setEditingIdeaContent] = useState("");
  const [editingIdeaEffort, setEditingIdeaEffort] =
    useState<IIdea["effort"]>(""); // New state for editing idea effort
  const [editingIdeaImpact, setEditingIdeaImpact] =
    useState<IIdea["impact"]>(""); // New state for editing idea impact
  const [isUpdatingIdea, startUpdatingIdeaTransition] = useTransition();

  const [isDeletingIdea, startDeletingIdeaTransition] = useTransition();
  const [isConvertingIdea, startConvertingIdeaTransition] = useTransition();

  const confirm = useConfirmDialog();

  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedIdeas = await getIdeas();
      // Sort ideas: unconverted first, then by creation date (newest first)
      const sortedIdeas = fetchedIdeas.sort((a, b) => {
        if (a.isConverted && !b.isConverted) return 1; // Converted ideas go to the bottom
        if (!a.isConverted && b.isConverted) return -1; // Unconverted ideas stay on top
        return b.createdAt - a.createdAt; // Newest first for ideas of same converted status
      });
      setIdeas(sortedIdeas);
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
      setError("Failed to load ideas. Please refresh the page.");
      toast.error("Failed to load ideas", {
        description: "There was an error loading your ideas.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaContent.trim()) {
      toast.error("Idea content cannot be empty.");
      return;
    }

    startAddingIdeaTransition(async () => {
      try {
        await addIdea({
          content: newIdeaContent,
          effort: newIdeaEffort,
          impact: newIdeaImpact,
        }); // Pass new fields
        setNewIdeaContent("");
        setNewIdeaEffort(""); // Clear new idea effort
        setNewIdeaImpact(""); // Clear new idea impact
        toast.success("Idea Added", {
          description: "Your new idea has been saved.",
        });
        await fetchIdeas(); // Re-fetch to update the list
      } catch (err) {
        console.error("Failed to add idea:", err);
        toast.error("Failed to add idea", {
          description: "Could not add idea. Please try again.",
        });
      }
    });
  };

  const handleEditIdea = (idea: IIdea) => {
    setEditingIdeaId(idea.id);
    setEditingIdeaContent(idea.content);
    setEditingIdeaEffort(idea.effort); // Set editing effort
    setEditingIdeaImpact(idea.impact); // Set editing impact
  };

  const handleSaveEditedIdea = async (ideaId: string) => {
    if (!editingIdeaContent.trim()) {
      toast.error("Idea content cannot be empty.");
      return;
    }

    startUpdatingIdeaTransition(async () => {
      try {
        await updateIdea(ideaId, {
          content: editingIdeaContent,
          effort: editingIdeaEffort,
          impact: editingIdeaImpact,
        }); // Update new fields
        setEditingIdeaId(null);
        setEditingIdeaContent("");
        setEditingIdeaEffort(""); // Clear editing effort
        setEditingIdeaImpact(""); // Clear editing impact
        toast.success("Idea Updated", {
          description: "Your idea has been updated.",
        });
        await fetchIdeas(); // Re-fetch to update the list
      } catch (err) {
        console.error("Failed to update idea:", err);
        toast.error("Failed to update idea", {
          description: "Could not update idea. Please try again.",
        });
      }
    });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    const confirmed = await confirm({
      title: "Delete Idea",
      message:
        "Are you sure you want to delete this idea? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      isConfirming: isDeletingIdea,
    });

    if (confirmed) {
      startDeletingIdeaTransition(async () => {
        try {
          await deleteIdea(ideaId);
          toast.success("Idea Deleted", {
            description: "Your idea has been permanently deleted.",
          });
          await fetchIdeas(); // Re-fetch to update the list
        } catch (err) {
          console.error("Failed to delete idea:", err);
          toast.error("Failed to delete idea", {
            description: "Could not delete idea. Please try again.",
          });
        }
      });
    }
  };

  const handleConvertIdeaToGoal = async (idea: IIdea) => {
    const confirmed = await confirm({
      title: "Convert Idea to Goal?",
      message: `Are you sure you want to convert "${idea.content}" into a new goal? You will be redirected to the new goal creation page.`,
      confirmText: "Convert",
      cancelText: "Cancel",
      isConfirming: isConvertingIdea,
    });

    if (confirmed) {
      startConvertingIdeaTransition(async () => {
        try {
          // Create a new goal from the idea content
          const newGoal = await addGoal({
            title: idea.content.substring(0, 100), // Take first 100 chars as title
            shortDescription: idea.content.substring(0, 150), // Take first 150 chars as short description
            description: `<p>${idea.content}</p>`, // Use full content as detailed description
            targetDate: format(addDays(new Date(), 30), "yyyy-MM-dd"), // Default to 30 days from now
            priority: "medium",
            status: "active",
            progress: 0,
            icon: "Lightbulb", // Default icon for converted ideas
          });

          // Mark the idea as converted and link it to the new goal
          await updateIdea(idea.id, {
            isConverted: true,
            convertedGoalId: newGoal.id,
          });

          toast.success("Idea Converted!", {
            description: `"${idea.content.substring(
              0,
              50
            )}..." has been converted to a new goal.`,
          });

          await fetchIdeas(); // Re-fetch ideas to update their status
          router.push(`/goals/${newGoal.id}`); // Redirect to the new goal's detail page
        } catch (err) {
          console.error("Failed to convert idea to goal:", err);
          toast.error("Conversion Failed", {
            description: `Could not convert idea to goal: ${
              err instanceof Error ? err.message : "Unknown error"
            }.`,
          });
        }
      });
    }
  };

  const renderEffortBadge = (effort: IIdea["effort"]) => {
    if (!effort) return null;
    let variant:
      | "default"
      | "secondary"
      | "outline"
      | "destructive"
      | "success"
      | "warning" = "secondary";
    if (effort === "high") variant = "destructive";
    else if (effort === "medium") variant = "default";
    else if (effort === "low") variant = "success";
    return (
      <Badge variant={variant} className="capitalize">
        {effort} Effort
      </Badge>
    );
  };

  const renderImpactBadge = (impact: IIdea["impact"]) => {
    if (!impact) return null;
    let variant:
      | "default"
      | "secondary"
      | "outline"
      | "destructive"
      | "success"
      | "warning" = "secondary";
    if (impact === "high") variant = "success";
    else if (impact === "medium") variant = "default";
    else if (impact === "low") variant = "destructive";
    return (
      <Badge variant={variant} className="capitalize">
        {impact} Impact
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <Skeleton className="h-24 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
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
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Lightbulb className="h-8 w-8 text-primary" /> Your Idea Box
      </h1>
      <p className="text-muted-foreground">
        A place to capture all your thoughts, inspirations, and future
        aspirations before they become goals.
      </p>

      {/* Add New Idea Form */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-xl">Add a New Idea</CardTitle>
        <form onSubmit={handleAddIdea} className="flex flex-col gap-3">
          <Textarea
            placeholder="What's your big idea? Jot it down here..."
            value={newIdeaContent}
            onChange={(e) => setNewIdeaContent(e.target.value)}
            rows={3}
            disabled={isAddingIdea}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newIdeaEffort">Effort to Implement</Label>
              <Select
                value={newIdeaEffort}
                onValueChange={(value: IIdea["effort"]) =>
                  setNewIdeaEffort(value)
                }
                disabled={isAddingIdea}
              >
                <SelectTrigger id="newIdeaEffort">
                  <SelectValue placeholder="Select Effort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newIdeaImpact">Potential Impact</Label>
              <Select
                value={newIdeaImpact}
                onValueChange={(value: IIdea["impact"]) =>
                  setNewIdeaImpact(value)
                }
                disabled={isAddingIdea}
              >
                <SelectTrigger id="newIdeaImpact">
                  <SelectValue placeholder="Select Impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isAddingIdea || !newIdeaContent.trim()}
            className="w-full sm:w-auto self-end cursor-pointer"
          >
            {isAddingIdea ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add Idea
          </Button>
        </form>
      </Card>

      {/* List Existing Ideas */}
      <h2 className="text-2xl font-bold tracking-tight pt-4">All Ideas</h2>
      {ideas.length === 0 ? (
        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
          <Lightbulb className="h-16 w-16 text-primary/60" />
          <h3 className="text-xl font-semibold">No Ideas Captured Yet</h3>
          <p>Start by adding your first idea above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <Card
              key={idea.id}
              className={`p-4 flex flex-col ${
                idea.isConverted ? "opacity-70 border-dashed" : ""
              }`}
            >
              <CardContent className="flex-1 p-0">
                {editingIdeaId === idea.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editingIdeaContent}
                      onChange={(e) => setEditingIdeaContent(e.target.value)}
                      rows={3}
                      disabled={isUpdatingIdea}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <Label htmlFor="editingIdeaEffort">
                          Effort to Implement
                        </Label>
                        <Select
                          value={editingIdeaEffort}
                          onValueChange={(value: IIdea["effort"]) =>
                            setEditingIdeaEffort(value)
                          }
                          disabled={isUpdatingIdea}
                        >
                          <SelectTrigger id="editingIdeaEffort">
                            <SelectValue placeholder="Select Effort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editingIdeaImpact">
                          Potential Impact
                        </Label>
                        <Select
                          value={editingIdeaImpact}
                          onValueChange={(value: IIdea["impact"]) =>
                            setEditingIdeaImpact(value)
                          }
                          disabled={isUpdatingIdea}
                        >
                          <SelectTrigger id="editingIdeaImpact">
                            <SelectValue placeholder="Select Impact" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingIdeaId(null);
                          setEditingIdeaContent("");
                          setEditingIdeaEffort("");
                          setEditingIdeaImpact("");
                        }}
                        disabled={isUpdatingIdea}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEditedIdea(idea.id)}
                        disabled={isUpdatingIdea || !editingIdeaContent.trim()}
                        className="cursor-pointer"
                      >
                        {isUpdatingIdea ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-foreground text-base">{idea.content}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {renderEffortBadge(idea.effort)}
                      {renderImpactBadge(idea.impact)}
                    </div>
                    <p className="text-sm text-muted-foreground text-right">
                      Added: {format(new Date(idea.createdAt), "PPP HH:mm")}
                    </p>
                    {idea.isConverted && idea.convertedGoalId && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Converted to Goal:{" "}
                        <Link
                          href={`/goals/${idea.convertedGoalId}`}
                          className="underline hover:no-underline cursor-pointer"
                        >
                          {idea.convertedGoalId.substring(0, 8)}...
                        </Link>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-0 pt-4">
                {!idea.isConverted && editingIdeaId !== idea.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditIdea(idea)}
                    disabled={
                      isUpdatingIdea || isDeletingIdea || isConvertingIdea
                    }
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                {!idea.isConverted && editingIdeaId !== idea.id && (
                  <Button
                    size="sm"
                    onClick={() => handleConvertIdeaToGoal(idea)}
                    disabled={
                      isConvertingIdea || isUpdatingIdea || isDeletingIdea
                    }
                    className="cursor-pointer"
                  >
                    {isConvertingIdea ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <ArrowRightCircle className="h-4 w-4 mr-1" />
                    )}
                    Convert to Goal
                  </Button>
                )}
                {editingIdeaId !== idea.id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteIdea(idea.id)}
                    disabled={
                      isDeletingIdea || isUpdatingIdea || isConvertingIdea
                    }
                    className="cursor-pointer"
                  >
                    {isDeletingIdea ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
