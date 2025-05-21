// src/app/(main)/goals/new/page.tsx
import { GoalForm } from "@/components/goals/GoalForm"; // We'll create this next
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewGoalPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Goal</CardTitle>
          <CardDescription>
            Define your next big aspiration. All fields are required unless
            marked optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm />
        </CardContent>
      </Card>
    </div>
  );
}
