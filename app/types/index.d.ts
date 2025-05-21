// src/lib/types/index.d.ts

/**
 * Represents a journal entry for a specific goal.
 */
export interface IJournalEntry {
  id: string; // Unique identifier for the journal entry
  goalId: string; // ID of the goal this entry belongs to
  content: string; // The rich text content of the journal entry (HTML string)
  createdAt: number; // Timestamp of when the entry was created
  updatedAt: number; // Timestamp of when the entry was last updated
}

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
  icon?: string; // Optional icon name (e.g., Lucide React icon name or emoji)
  journalEntries?: IJournalEntry[]; // Array of journal entries for this goal
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

/**
 * Represents an idea captured in the Idea Box.
 */
export interface IIdea {
  id: string; // Unique identifier for the idea
  content: string; // The content/description of the idea
  effort: "low" | "medium" | "high" | ""; // New: Estimated effort to convert/implement
  impact: "low" | "medium" | "high" | ""; // New: Estimated impact if implemented
  isConverted: boolean; // Whether the idea has been converted into a goal
  createdAt: number; // Timestamp of when the idea was created
  convertedGoalId?: string; // Optional: ID of the goal it was converted into
}

/**
 * Represents a motivational quote.
 */
export interface IQuote {
  id: string; // Unique identifier for the quote
  text: string; // The text of the quote
  author?: string; // Optional author of the quote
  createdAt: number; // Timestamp of when the quote was added (for internal management)
}
