// src/components/goals/GoalForm.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from '@/components/ui/textarea'; // Removed Textarea
import { RichTextEditor } from "@/components/ui/rich-text-editor"; // Import RichTextEditor
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
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { addGoal, updateGoal } from "@/services/indexedDbService";
import { IGoal } from "@/types";

interface GoalFormProps {
  initialGoalData?: IGoal; // Optional prop for editing existing goals
}

export function GoalForm({ initialGoalData }: GoalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<
    Omit<IGoal, "id" | "createdAt" | "updatedAt">
  >(() => {
    if (initialGoalData) {
      return {
        title: initialGoalData.title,
        description: initialGoalData.description || "", // Ensure description is an empty string if null/undefined
        targetDate: initialGoalData.targetDate,
        category: initialGoalData.category || "",
        priority: initialGoalData.priority,
        status: initialGoalData.status,
        progress: initialGoalData.progress,
      };
    }
    return {
      title: "",
      description: "",
      targetDate: "",
      category: "",
      priority: "medium",
      status: "active",
      progress: 0,
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
        description: initialGoalData.description || "",
        targetDate: initialGoalData.targetDate,
        category: initialGoalData.category || "",
        priority: initialGoalData.priority,
        status: initialGoalData.status,
        progress: initialGoalData.progress,
      });
      setDate(parseISO(initialGoalData.targetDate));
    } else {
      setFormData({
        title: "",
        description: "",
        targetDate: "",
        category: "",
        priority: "medium",
        status: "active",
        progress: 0,
      });
      setDate(undefined);
    }
  }, [initialGoalData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Changed event type
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

  const handleProgressChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, progress: value[0] }));
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

    startTransition(async () => {
      try {
        if (initialGoalData?.id) {
          await updateGoal(initialGoalData.id, formData);
          toast.success("Goal Updated", {
            description: "Your goal has been successfully updated.",
          });
        } else {
          await addGoal(formData);
          toast.success("Goal Created", {
            description: "Your new goal has been successfully added.",
          });
        }
        router.push("/dashboard");
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <RichTextEditor
          content={formData.description || ""} // Pass current description
          onChange={handleDescriptionChange} // Handle content changes
          placeholder="Provide more details about your goal..."
          disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
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

      <div className="space-y-2">
        <Label htmlFor="progress">Current Progress: {formData.progress}%</Label>
        <Slider
          id="progress"
          defaultValue={[0]}
          max={100}
          step={1}
          value={[formData.progress]}
          onValueChange={handleProgressChange}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? initialGoalData
            ? "Updating Goal..."
            : "Creating Goal..."
          : initialGoalData
          ? "Update Goal"
          : "Create Goal"}
      </Button>
    </form>
  );
}
