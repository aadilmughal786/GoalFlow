// src/app/(main)/goals/new/page.tsx
"use client";

import { useState, useTransition } from "react";
import { GoalForm } from "@/components/goals/GoalForm";
import { IGoal } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewGoalPage() {
  const router = useRouter();
  const [isSavingGoal, startSavingGoalTransition] = useTransition();

  const handleGoalSaved = (newGoal: IGoal) => {
    startSavingGoalTransition(() => {
      // The GoalForm itself now handles the redirection for new goals.
      // This callback can still be used for other side effects if needed,
      // but the primary navigation is done within GoalForm.
      toast.success("Goal Created Successfully", {
        description: `Goal "${newGoal.title}" has been added.`,
      });
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Goal</h1>
      <p className="text-muted-foreground">
        Define your new objective and set its key details.
      </p>
      <GoalForm onGoalSaved={handleGoalSaved} isSaving={isSavingGoal} />
    </div>
  );
}
