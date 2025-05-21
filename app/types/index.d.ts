// src/lib/types/index.d.ts

/**
 * Represents a main goal in the GoalFlow application.
 */
export interface IGoal {
  id: string; // Unique identifier for the goal (UUID)
  title: string; // The main title or name of the goal
  shortDescription?: string; // Optional short description for cards/summaries
  description?: string; // Optional detailed description of the goal
  targetDate: string; // The target completion date (ISO date string, e.g., 'YYYY-MM-DD')
  category?: string; // Optional category for the goal (e.g., 'Fitness', 'Career')
  priority: "low" | "medium" | "high"; // Priority level of the goal
  status: "active" | "completed" | "archived"; // Current status of the goal
  progress: number; // Percentage of progress (0-100) - will be derived from subtasks
  icon?: string; // New: Optional icon name (e.g., Lucide React icon name or emoji)
  createdAt: number; // Timestamp of when the goal was created
  updatedAt: number; // Timestamp of when the goal was last updated
}

/**
 * Represents a subtask associated with a main goal.
 */
export interface ISubtask {
  id: string; // Unique identifier for the subtask (UUID)
  goalId: string; // ID of the parent goal this subtask belongs to
  title: string; // The title or description of the subtask
  isCompleted: boolean; // Whether the subtask is completed or not
  targetDate: string; // Target completion date for the subtask
  createdAt: number; // Timestamp of when the subtask was created
}
