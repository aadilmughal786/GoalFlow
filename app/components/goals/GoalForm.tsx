// src/components/goals/GoalForm.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import dynamic from "next/dynamic"; // For dynamic import of Lucide icons

import { addGoal, updateGoal } from "@/services/indexedDbService";
import { IGoal } from "@/types";

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
    Omit<IGoal, "id" | "createdAt" | "updatedAt" | "progress">
  >(() => {
    if (initialGoalData) {
      return {
        title: initialGoalData.title,
        shortDescription: initialGoalData.shortDescription || "",
        description: initialGoalData.description || "",
        targetDate: initialGoalData.targetDate,
        category: initialGoalData.category || "",
        priority: initialGoalData.priority,
        status: initialGoalData.status,
        icon: initialGoalData.icon || "", // Initialize icon
      };
    }
    return {
      title: "",
      shortDescription: "",
      description: "",
      targetDate: "",
      category: "",
      priority: "medium",
      status: "active",
      icon: "", // Initialize icon
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
        description: initialGoalData.description || "",
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
        description: "",
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

  const handleDescriptionChange = (html: string) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const handleSelectChange = (id: "priority" | "status", value: string) => {
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

    if (!formData.title || !formData.targetDate || !formData.priority) {
      toast.error("Missing Information", {
        description:
          "Please fill in all required fields: Title, Target Date, and Priority.",
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
          });
          savedGoal = {
            ...initialGoalData,
            ...formData,
            updatedAt: Date.now(),
          };
        } else {
          savedGoal = await addGoal({ ...formData, progress: 0 });
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
          Why is this goal important to you? (Short description for cards)
        </Label>{" "}
        {/* Updated prompt */}
        <Input
          id="shortDescription"
          placeholder="e.g., To enhance my web development skills and build exciting projects."
          value={formData.shortDescription}
          onChange={handleInputChange}
          maxLength={150}
          disabled={isSaving || isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Goal Icon (Lucide icon name or emoji)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="icon"
            placeholder="e.g., Target, Rocket, 🚀"
            value={formData.icon}
            onChange={handleInputChange}
            maxLength={20}
            disabled={isSaving || isPending}
            className="flex-1"
          />
          {formData.icon && (
            <div className="p-2 border rounded-md flex items-center justify-center h-10 w-10 text-primary">
              <DynamicLucideIcon name={formData.icon} className="h-6 w-6" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a{" "}
          <a
            href="https://lucide.dev/icons"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Lucide React icon name
          </a>{" "}
          (e.g., `Rocket`, `Heart`, `Sparkles`) or an emoji.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description (Optional)</Label>
        <RichTextEditor
          content={formData.description || ""}
          onChange={handleDescriptionChange}
          placeholder="Provide more details about your goal..."
          disabled={isSaving || isPending}
        />
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
          <Label htmlFor="category">Category (Optional)</Label>
          <Input
            id="category"
            placeholder="e.g., Career, Fitness"
            value={formData.category}
            onChange={handleInputChange}
            disabled={isSaving || isPending}
          />
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
