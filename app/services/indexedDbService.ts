// src/services/indexedDbService.ts

import Dexie, { Table } from "dexie";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { IGoal, ISubtask } from "@/types"; // Import our defined interfaces
import { format } from "date-fns"; // Import format for dynamic filename

// Define the database name and version
const DB_NAME = "GoalFlowDB";
const DB_VERSION = 1;

/**
 * Goal Class (optional, but good for Dexie's mapToClass)
 * Can add methods directly to the Goal object if needed.
 */
class Goal implements IGoal {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  targetDate: string;
  category?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "archived";
  progress: number;
  icon?: string; // New: icon property
  createdAt: number;
  updatedAt: number;

  constructor(
    id: string,
    title: string,
    targetDate: string,
    priority: "low" | "medium" | "high",
    status: "active" | "completed" | "archived",
    progress: number,
    createdAt: number,
    updatedAt: number,
    shortDescription?: string,
    description?: string,
    category?: string,
    icon?: string // New: icon parameter
  ) {
    this.id = id;
    this.title = title;
    this.shortDescription = shortDescription;
    this.description = description;
    this.targetDate = targetDate;
    this.category = category;
    this.priority = priority;
    this.status = status;
    this.progress = progress;
    this.icon = icon; // Assign new property
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

/**
 * Subtask Class (optional, but good for Dexie's mapToClass)
 * Can add methods directly to the Subtask object if needed.
 */
class Subtask implements ISubtask {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  targetDate: string;
  createdAt: number;

  constructor(
    id: string,
    goalId: string,
    title: string,
    isCompleted: boolean,
    targetDate: string,
    createdAt: number
  ) {
    this.id = id;
    this.goalId = goalId;
    this.title = title;
    this.isCompleted = isCompleted;
    this.targetDate = targetDate;
    this.createdAt = createdAt;
  }
}

/**
 * Extends Dexie to define our database schema and tables.
 */
class GoalFlowDexie extends Dexie {
  // Declare tables for our goal and subtask data
  goals!: Table<IGoal, string>; // 'string' indicates the type of the primary key (id)
  subtasks!: Table<ISubtask, string>; // 'string' indicates the type of the primary key (id)

  constructor() {
    super(DB_NAME); // Initialize Dexie with the database name

    // Define the database schema for version 1
    this.version(DB_VERSION).stores({
      goals:
        "id, title, targetDate, category, priority, status, progress, createdAt, updatedAt, icon", // Added 'icon' to schema
      subtasks: "id, goalId, isCompleted, targetDate, createdAt",
    });

    // Map the interfaces to the tables for type safety
    this.goals.mapToClass(Goal);
    this.subtasks.mapToClass(Subtask);
  }
}

// Instantiate the database
export const db = new GoalFlowDexie();

// --- Goal CRUD Operations ---

/**
 * Adds a new goal to the database.
 * @param goalData The data for the new goal (excluding id, createdAt, updatedAt).
 * @returns The newly created goal object with generated ID and timestamps.
 */
export async function addGoal(
  goalData: Omit<IGoal, "id" | "createdAt" | "updatedAt">
): Promise<IGoal> {
  const newGoal: IGoal = {
    ...goalData,
    id: uuidv4(), // Generate a unique ID
    createdAt: Date.now(), // Set creation timestamp
    updatedAt: Date.now(), // Set initial update timestamp
  };
  await db.goals.add(newGoal); // Add the goal to the 'goals' table
  return newGoal;
}

/**
 * Retrieves all goals from the database.
 * @returns An array of all goals.
 */
export async function getGoals(): Promise<IGoal[]> {
  return await db.goals.toArray(); // Get all goals as an array
}

/**
 * Retrieves a single goal by its ID.
 * @param id The ID of the goal to retrieve.
 * @returns The goal object, or undefined if not found.
 */
export async function getGoalById(id: string): Promise<IGoal | undefined> {
  return await db.goals.get(id); // Get a goal by its primary key
}

/**
 * Updates an existing goal in the database.
 * @param id The ID of the goal to update.
 * @param changes An object containing the properties to update.
 * @returns The number of records updated (1 if successful, 0 otherwise).
 */
export async function updateGoal(
  id: string,
  changes: Partial<Omit<IGoal, "id" | "createdAt">>
): Promise<number> {
  // Ensure updatedAt is always updated
  const updatedChanges = { ...changes, updatedAt: Date.now() };
  return await db.goals.update(id, updatedChanges); // Update the goal by its ID
}

/**
 * Deletes a goal and all its associated subtasks from the database.
 * @param id The ID of the goal to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteGoal(id: string): Promise<void> {
  await db.transaction("rw", db.goals, db.subtasks, async () => {
    // Delete the goal itself
    await db.goals.delete(id);
    // Delete all subtasks associated with this goal
    await db.subtasks.where("goalId").equals(id).delete();
  });
}

// --- Subtask CRUD Operations ---

/**
 * Adds a new subtask to the database.
 * @param subtaskData The data for the new subtask (excluding id, createdAt).
 * @returns The newly created subtask object with generated ID and timestamp.
 */
export async function addSubtask(
  subtaskData: Omit<ISubtask, "id" | "createdAt">
): Promise<ISubtask> {
  const newSubtask: ISubtask = {
    ...subtaskData,
    id: uuidv4(), // Generate a unique ID
    createdAt: Date.now(), // Set creation timestamp
  };
  await db.subtasks.add(newSubtask); // Add the subtask to the 'subtasks' table
  return newSubtask;
}

/**
 * Retrieves all subtasks for a specific goal.
 * @param goalId The ID of the parent goal.
 * @returns An array of subtasks for the given goal.
 */
export async function getSubtasksForGoal(goalId: string): Promise<ISubtask[]> {
  return await db.subtasks.where("goalId").equals(goalId).toArray(); // Filter subtasks by goalId
}

/**
 * Updates an existing subtask in the database.
 * @param id The ID of the subtask to update.
 * @param changes An object containing the properties to update.
 * @returns The number of records updated (1 if successful, 0 otherwise).
 */
export async function updateSubtask(
  id: string,
  changes: Partial<Omit<ISubtask, "id" | "createdAt">>
): Promise<number> {
  return await db.subtasks.update(id, changes); // Update the subtask by its ID
}

/**
 * Deletes a subtask from the database.
 * @param id The ID of the subtask to delete.
 * @returns The number of records deleted (1 if successful, 0 otherwise).
 */
export async function deleteSubtask(id: string): Promise<number> {
  return await db.subtasks.delete(id); // Delete the subtask by its ID
}

// --- Data Export/Import Operations ---

/**
 * Exports all goals and their associated subtasks as a JSON file.
 */
export async function exportAllData(): Promise<void> {
  try {
    const allGoals = await db.goals.toArray();
    const allSubtasks = await db.subtasks.toArray();

    const dataToExport = {
      goals: allGoals,
      subtasks: allSubtasks,
      exportedAt: Date.now(),
      version: DB_VERSION, // Include DB version for potential future import compatibility
    };

    const jsonString = JSON.stringify(dataToExport, null, 2); // Pretty print JSON

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goalflow_data_export_${format(
      new Date(),
      "yyyyMMdd_HHmmss"
    )}.json`; // Dynamic filename
    document.body.appendChild(a); // Append to body to make it clickable
    a.click(); // Programmatically click the link to trigger download
    document.body.removeChild(a); // Clean up the link
    URL.revokeObjectURL(url); // Release the object URL

    console.log("Data exported successfully.");
  } catch (error) {
    console.error("Failed to export data:", error);
    alert("Failed to export data. Please check console for details.");
  }
}

/**
 * Imports goals and subtasks from a JSON file into the database.
 * This operation will clear existing data before importing.
 * @param data The parsed JSON data containing goals and subtasks.
 */
export async function importAllData(data: {
  goals: IGoal[];
  subtasks: ISubtask[];
  version?: number;
}): Promise<void> {
  await db.transaction("rw", db.goals, db.subtasks, async () => {
    // Clear existing data
    await db.goals.clear();
    await db.subtasks.clear();

    // Add imported data
    await db.goals.bulkAdd(data.goals);
    await db.subtasks.bulkAdd(data.subtasks);
  });
}
