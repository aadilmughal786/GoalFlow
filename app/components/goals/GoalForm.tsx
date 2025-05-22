// src/components/goals/GoalForm.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { addGoal, updateGoal } from "@/services/indexedDbService";
import { IGoal } from "@/types";

// Dynamically import all Lucide icons to be able to render them by string name
const DynamicLucideIcon = dynamic(
  async () => {
    const lucideIcons = await import("lucide-react");
    // Define the component directly inside the async function
    const IconRenderer = ({
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
    return IconRenderer; // Return the component itself
  },
  { ssr: false }
);

// Curated list of 20 relevant Lucide icons for goals
const GOAL_ICONS = [
  "Target",
  "Rocket",
  "CheckCircle2",
  "Trophy",
  "Book",
  "Briefcase",
  "Heart",
  "Zap",
  "Sparkles",
  "Mountain",
  "GraduationCap",
  "Dumbbell",
  "PiggyBank",
  "Plane",
  "Home",
  "Code",
  "Brush",
  "Music",
  "Camera",
  "Shield",
];

// Curated list of predefined categories for goals
const GOAL_CATEGORIES = [
  "Personal Growth",
  "Career & Work",
  "Health & Fitness",
  "Finance",
  "Education",
  "Relationships",
  "Hobbies",
  "Travel",
  "Creativity",
  "Community",
  "Home & Living",
  "Technology",
  "Mindfulness",
  "Learning",
  "Side Project",
  "Volunteering",
  "Skill Development",
  "Wellness",
  "Adventure",
  "Productivity",
];

interface GoalFormProps {
  initialGoalData?: IGoal;
  onGoalSaved: (updatedGoal: IGoal) => void;
  isSaving: boolean;
  onCancelEdit?: () => void;
}

export function GoalForm({
  initialGoalData,
  onGoalSaved,
  isSaving,
  onCancelEdit,
}: GoalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<
    Omit<
      IGoal,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "progress"
      | "description"
      | "journalEntries"
    >
  >(() => {
    if (initialGoalData) {
      return {
        title: initialGoalData.title,
        shortDescription: initialGoalData.shortDescription || "",
        targetDate: initialGoalData.targetDate,
        category: initialGoalData.category || "",
        priority: initialGoalData.priority,
        status: initialGoalData.status,
        icon: initialGoalData.icon || "",
      };
    }
    return {
      title: "",
      shortDescription: "",
      targetDate: "",
      category: "", // Default to empty, will be required by select
      priority: "medium",
      status: "active",
      icon: "",
    };
  });

  const [date, setDate] = useState<Date | undefined>(() => {
    return initialGoalData?.targetDate
      ? parseISO(initialGoalData.targetDate)
      : undefined;
  });

  useEffect(() => {
    if (initialGoalData) {
      setFormData({
        title: initialGoalData.title,
        shortDescription: initialGoalData.shortDescription || "",
        targetDate: initialGoalData.targetDate,
        category: initialGoalData.category || "",
        priority: initialGoalData.priority,
        status: initialGoalData.status,
        icon: initialGoalData.icon || "",
      });
      setDate(parseISO(initialGoalData.targetDate));
    } else {
      setFormData({
        title: "",
        shortDescription: "",
        targetDate: "",
        category: "",
        priority: "medium",
        status: "active",
        icon: "",
      });
      setDate(undefined);
    }
  }, [initialGoalData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Updated handleSelectChange to accept 'category' as an ID
  const handleSelectChange = (
    id: "priority" | "status" | "icon" | "category",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setFormData((prev) => ({
      ...prev,
      targetDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.shortDescription.trim() ||
      !formData.targetDate ||
      !formData.category.trim() || // Ensure category is selected
      !formData.priority ||
      !formData.icon.trim()
    ) {
      toast.error("Missing Information", {
        description:
          "Please fill in all required fields: Title, Short Description, Target Date, Category, Priority, and Icon.",
      });
      return;
    }

    if (isSaving) return;

    startTransition(async () => {
      try {
        let savedGoal: IGoal;
        if (initialGoalData?.id) {
          await updateGoal(initialGoalData.id, {
            ...formData,
            progress: initialGoalData.progress,
            description: initialGoalData.description,
            journalEntries: initialGoalData.journalEntries,
          });
          savedGoal = {
            ...initialGoalData,
            ...formData,
            updatedAt: Date.now(),
          };
        } else {
          savedGoal = await addGoal({
            ...formData,
            progress: 0,
            description: "",
            journalEntries: [],
          });
          toast.success("Goal Created", {
            description: "Your new goal has been successfully added.",
          });
          router.push(`/goals/${savedGoal.id}`);
        }
        onGoalSaved(savedGoal);
      } catch (error) {
        console.error("Failed to save goal:", error);
        toast.error("Failed to save goal", {
          description: `Failed to save goal: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Please try again.`,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} id="goal-form" className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Goal Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Learn Next.js"
          value={formData.title}
          onChange={handleInputChange}
          required
          disabled={isSaving || isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">
          Why is this goal important to you? (Short description for cards){" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="shortDescription"
          placeholder="e.g., To enhance my web development skills and build exciting projects."
          value={formData.shortDescription}
          onChange={handleInputChange}
          maxLength={150}
          required
          disabled={isSaving || isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">
          Goal Icon <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.icon}
          onValueChange={(value: string) => handleSelectChange("icon", value)}
          disabled={isSaving || isPending}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {GOAL_ICONS.map((iconName) => (
              <SelectItem key={iconName} value={iconName}>
                <div className="flex items-center gap-2">
                  <DynamicLucideIcon name={iconName} className="h-5 w-5" />
                  <span>{iconName}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.icon && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            Selected Icon:{" "}
            <DynamicLucideIcon
              name={formData.icon}
              className="h-4 w-4 text-primary"
            />
            <span className="font-medium">{formData.icon}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetDate">
            Target Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={isSaving || isPending}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                disabled={isSaving || isPending}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value: string) =>
              handleSelectChange("category", value)
            }
            disabled={isSaving || isPending}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {GOAL_CATEGORIES.map((categoryName) => (
                <SelectItem key={categoryName} value={categoryName}>
                  {categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">
            Priority <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high") =>
              handleSelectChange("priority", value)
            }
            disabled={isSaving || isPending}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value: "active" | "completed" | "archived") =>
              handleSelectChange("status", value)
            }
            disabled={isSaving || isPending}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!initialGoalData && (
        <div className="flex justify-end pt-6 border-t mt-8">
          <Button
            type="submit"
            className="w-full sm:w-auto cursor-pointer"
            disabled={isSaving || isPending}
          >
            {isSaving || isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSaving || isPending ? "Creating Goal..." : "Create Goal"}
          </Button>
        </div>
      )}
    </form>
  );
}
