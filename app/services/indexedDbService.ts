// src/services/indexedDbService.ts

import Dexie, { Table } from "dexie";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { IGoal, ISubtask, IJournalEntry, IIdea, IQuote } from "@/types"; // Import new interfaces
import { format } from "date-fns"; // Import format for dynamic filename
import { initialQuotes } from "@/lib/data/quotes"; // Import initial quotes

// Define the database name and version
const DB_NAME = "GoalFlowDB";
const DB_VERSION = 3; // Keep version 3 as no new schema changes, just data population logic change

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
  icon?: string;
  journalEntries?: IJournalEntry[];
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
    icon?: string,
    journalEntries?: IJournalEntry[]
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
    this.icon = icon;
    this.journalEntries = journalEntries || [];
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
 * JournalEntry Class (for Dexie's mapToClass)
 */
class JournalEntry implements IJournalEntry {
  id: string;
  goalId: string;
  content: string;
  createdAt: number;
  updatedAt: number;

  constructor(
    id: string,
    goalId: string,
    content: string,
    createdAt: number,
    updatedAt: number
  ) {
    this.id = id;
    this.goalId = goalId;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

/**
 * Idea Class (for Dexie's mapToClass)
 */
class Idea implements IIdea {
  id: string;
  content: string;
  effort: "low" | "medium" | "high" | "";
  impact: "low" | "medium" | "high" | "";
  isConverted: boolean;
  createdAt: number;
  convertedGoalId?: string;

  constructor(
    id: string,
    content: string,
    effort: "low" | "medium" | "high" | "",
    impact: "low" | "medium" | "high" | "",
    isConverted: boolean,
    createdAt: number,
    convertedGoalId?: string
  ) {
    this.id = id;
    this.content = content;
    this.effort = effort;
    this.impact = impact;
    this.isConverted = isConverted;
    this.createdAt = createdAt;
    this.convertedGoalId = convertedGoalId;
  }
}

/**
 * Quote Class (for Dexie's mapToClass)
 */
class Quote implements IQuote {
  id: string;
  text: string;
  author?: string;
  createdAt: number;

  constructor(id: string, text: string, createdAt: number, author?: string) {
    this.id = id;
    this.text = text;
    this.author = author;
    this.createdAt = createdAt;
  }
}

/**
 * Extends Dexie to define our database schema and tables.
 */
class GoalFlowDexie extends Dexie {
  // Declare tables for our goal and subtask data
  goals!: Table<IGoal, string>;
  subtasks!: Table<ISubtask, string>;
  ideas!: Table<IIdea, string>;
  quotes!: Table<IQuote, string>;

  constructor() {
    super(DB_NAME);

    // Define the database schema for version 1 (initial)
    this.version(1).stores({
      goals:
        "id, title, description, targetDate, category, priority, status, progress, createdAt, updatedAt",
      subtasks: "id, goalId, isCompleted, createdAt",
    });

    // Define the database schema for version 2 (added shortDescription, icon, journalEntries, ideas table)
    this.version(2)
      .stores({
        goals:
          "id, title, shortDescription, description, targetDate, category, priority, status, progress, icon, createdAt, updatedAt",
        subtasks: "id, goalId, isCompleted, targetDate, createdAt",
        ideas: "id, isConverted, createdAt",
      })
      .upgrade((tx) => {
        // Handle upgrade from version 1 to 2
        tx.goals.toCollection().modify((goal) => {
          if (goal.shortDescription === undefined) goal.shortDescription = "";
          if (goal.icon === undefined) goal.icon = "";
          if (goal.journalEntries === undefined) goal.journalEntries = [];
        });
      });

    // Define the database schema for version 3 (added effort, impact to ideas, and quotes table)
    this.version(3)
      .stores({
        goals:
          "id, title, shortDescription, description, targetDate, category, priority, status, progress, icon, createdAt, updatedAt",
        subtasks: "id, goalId, isCompleted, targetDate, createdAt",
        ideas: "id, isConverted, createdAt, effort, impact",
        quotes: "id, createdAt",
      })
      .upgrade(async (tx) => {
        // Made upgrade function async
        // Handle upgrade from version 2 to 3
        await tx
          .table("ideas")
          .toCollection()
          .modify((idea) => {
            // Use await for modify
            if (idea.effort === undefined) idea.effort = "";
            if (idea.impact === undefined) idea.impact = "";
          });
        // Removed quote population from here
      });

    // Populate initial quotes when the database is first created (on 'populate' event)
    this.on("populate", () => {
      const quotesWithIdsAndTimestamps = initialQuotes.map((quote, index) => ({
        ...quote,
        id: uuidv4(),
        createdAt: Date.now() + index, // Ensure unique timestamps for sorting
      }));
      this.quotes.bulkAdd(quotesWithIdsAndTimestamps);
    });

    // Map the interfaces to the tables for type safety
    this.goals.mapToClass(Goal);
    this.subtasks.mapToClass(Subtask);
    this.ideas.mapToClass(Idea);
    this.quotes.mapToClass(Quote);
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
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    journalEntries: goalData.journalEntries || [],
  };
  await db.goals.add(newGoal);
  return newGoal;
}

/**
 * Retrieves all goals from the database.
 * @returns An array of all goals.
 */
export async function getGoals(): Promise<IGoal[]> {
  return await db.goals.toArray();
}

/**
 * Retrieves a single goal by its ID.
 * @param id The ID of the goal to retrieve.
 * @returns The goal object, or undefined if not found.
 */
export async function getGoalById(id: string): Promise<IGoal | undefined> {
  return await db.goals.get(id);
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
  const updatedChanges = { ...changes, updatedAt: Date.now() };
  return await db.goals.update(id, updatedChanges);
}

/**
 * Deletes a goal and all its associated subtasks from the database.
 * @param id The ID of the goal to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteGoal(id: string): Promise<void> {
  await db.transaction("rw", db.goals, db.subtasks, async () => {
    await db.goals.delete(id);
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
    id: uuidv4(),
    createdAt: Date.now(),
  };
  await db.subtasks.add(newSubtask);
  return newSubtask;
}

/**
 * Retrieves all subtasks for a specific goal.
 * @param goalId The ID of the parent goal.
 * @returns An array of subtasks for the given goal.
 */
export async function getSubtasksForGoal(goalId: string): Promise<ISubtask[]> {
  return await db.subtasks.where("goalId").equals(goalId).toArray();
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
  return await db.subtasks.update(id, changes);
}

/**
 * Deletes a subtask from the database.
 * @param id The ID of the subtask to delete.
 * @returns The number of records deleted (1 if successful, 0 otherwise).
 */
export async function deleteSubtask(id: string): Promise<number> {
  return await db.subtasks.delete(id);
}

// --- Journal Entry Operations ---

/**
 * Adds a new journal entry to a goal.
 * @param goalId The ID of the goal to add the entry to.
 * @param content The content of the journal entry.
 * @returns The updated goal with the new journal entry.
 */
export async function addJournalEntry(
  goalId: string,
  content: string
): Promise<IGoal | undefined> {
  const goal = await db.goals.get(goalId);
  if (!goal) return undefined;

  const newEntry: IJournalEntry = {
    id: uuidv4(),
    goalId,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updatedEntries = [...(goal.journalEntries || []), newEntry];
  await updateGoal(goalId, { journalEntries: updatedEntries as any });
  return { ...goal, journalEntries: updatedEntries, updatedAt: Date.now() };
}

/**
 * Updates an existing journal entry for a goal.
 * @param goalId The ID of the goal the entry belongs to.
 * @param entryId The ID of the journal entry to update.
 * @param newContent The new content for the entry.
 * @returns The updated goal with the modified journal entry.
 */
export async function updateJournalEntry(
  goalId: string,
  entryId: string,
  newContent: string
): Promise<IGoal | undefined> {
  const goal = await db.goals.get(goalId);
  if (!goal) return undefined;

  const updatedEntries = (goal.journalEntries || []).map((entry) =>
    entry.id === entryId
      ? { ...entry, content: newContent, updatedAt: Date.now() }
      : entry
  );

  await updateGoal(goalId, { journalEntries: updatedEntries as any });
  return { ...goal, journalEntries: updatedEntries, updatedAt: Date.now() };
}

/**
 * Deletes a journal entry from a goal.
 * @param goalId The ID of the goal the entry belongs to.
 * @param entryId The ID of the journal entry to delete.
 * @returns The updated goal with the entry removed.
 */
export async function deleteJournalEntry(
  goalId: string,
  entryId: string
): Promise<IGoal | undefined> {
  const goal = await db.goals.get(goalId);
  if (!goal) return undefined;

  const updatedEntries = (goal.journalEntries || []).filter(
    (entry) => entry.id !== entryId
  );

  await updateGoal(goalId, { journalEntries: updatedEntries as any });
  return { ...goal, journalEntries: updatedEntries, updatedAt: Date.now() };
}

// --- Idea CRUD Operations ---

/**
 * Adds a new idea to the database.
 * @param ideaData The data for the new idea (excluding id, createdAt).
 * @returns The newly created idea object.
 */
export async function addIdea(
  ideaData: Omit<IIdea, "id" | "createdAt" | "isConverted" | "convertedGoalId">
): Promise<IIdea> {
  const newIdea: IIdea = {
    ...ideaData,
    id: uuidv4(),
    isConverted: false,
    createdAt: Date.now(),
  };
  await db.ideas.add(newIdea);
  return newIdea;
}

/**
 * Retrieves all ideas from the database.
 * @returns An array of all ideas.
 */
export async function getIdeas(): Promise<IIdea[]> {
  return await db.ideas.toArray();
}

/**
 * Updates an existing idea in the database.
 * @param id The ID of the idea to update.
 * @param changes An object containing the properties to update.
 * @returns The number of records updated (1 if successful, 0 otherwise).
 */
export async function updateIdea(
  id: string,
  changes: Partial<Omit<IIdea, "id" | "createdAt">>
): Promise<number> {
  return await db.ideas.update(id, changes);
}

/**
 * Deletes an idea from the database.
 * @param id The ID of the idea to delete.
 * @returns The number of records deleted (1 if successful, 0 otherwise).
 */
export async function deleteIdea(id: string): Promise<number> {
  return await db.ideas.delete(id);
}

// --- Quote CRUD Operations ---

/**
 * Adds a new quote to the database.
 * @param quoteData The data for the new quote (excluding id, createdAt).
 * @returns The newly created quote object.
 */
export async function addQuote(
  quoteData: Omit<IQuote, "id" | "createdAt">
): Promise<IQuote> {
  const newQuote: IQuote = {
    ...quoteData,
    id: uuidv4(),
    createdAt: Date.now(),
  };
  await db.quotes.add(newQuote);
  return newQuote;
}

/**
 * Retrieves all quotes from the database.
 * @returns An array of all quotes.
 */
export async function getQuotes(): Promise<IQuote[]> {
  return await db.quotes.toArray();
}

/**
 * Updates an existing quote in the database.
 * @param id The ID of the quote to update.
 * @param changes An object containing the properties to update.
 * @returns The number of records updated (1 if successful, 0 otherwise).
 */
export async function updateQuote(
  id: string,
  changes: Partial<Omit<IQuote, "id" | "createdAt">>
): Promise<number> {
  return await db.quotes.update(id, changes);
}

/**
 * Deletes a quote from the database.
 * @param id The ID of the quote to delete.
 * @returns The number of records deleted (1 if successful, 0 otherwise).
 */
export async function deleteQuote(id: string): Promise<number> {
  return await db.quotes.delete(id);
}

// --- Data Export/Import Operations ---

/**
 * Exports all goals and their associated subtasks as a JSON file.
 */
export async function exportAllData(): Promise<void> {
  try {
    const allGoals = await db.goals.toArray();
    const allSubtasks = await db.subtasks.toArray();
    const allIdeas = await db.ideas.toArray();
    const allQuotes = await db.quotes.toArray();

    const dataToExport = {
      goals: allGoals,
      subtasks: allSubtasks,
      ideas: allIdeas,
      quotes: allQuotes,
      exportedAt: Date.now(),
      version: DB_VERSION,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goalflow_data_export_${format(
      new Date(),
      "yyyyMMdd_HHmmss"
    )}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Data exported successfully.");
  } catch (error) {
    console.error("Failed to export data:", error);
    throw error;
  }
}

/**
 * Imports data from a JSON object, clearing existing data first.
 * @param importedData The parsed JSON object containing goals, subtasks, ideas, and quotes.
 * @returns A promise that resolves when the import is complete.
 */
export async function importAllData(importedData: {
  goals: IGoal[];
  subtasks: ISubtask[];
  ideas?: IIdea[];
  quotes?: IQuote[];
  version?: number;
}): Promise<void> {
  try {
    if (
      !importedData ||
      !Array.isArray(importedData.goals) ||
      !Array.isArray(importedData.subtasks)
    ) {
      throw new Error("Invalid import data format.");
    }

    await db.transaction(
      "rw",
      db.goals,
      db.subtasks,
      db.ideas,
      db.quotes,
      async () => {
        await db.goals.clear();
        await db.subtasks.clear();
        await db.ideas.clear();
        await db.quotes.clear();

        const goalsToImport = importedData.goals.map((goal) => ({
          ...goal,
          shortDescription: goal.shortDescription || "",
          icon: goal.icon || "",
          journalEntries: goal.journalEntries || [],
        }));
        await db.goals.bulkAdd(goalsToImport);

        const ideasToImport = (importedData.ideas || []).map((idea) => ({
          ...idea,
          effort: idea.effort || "",
          impact: idea.impact || "",
        }));
        await db.ideas.bulkAdd(ideasToImport);

        await db.subtasks.bulkAdd(importedData.subtasks);

        if (importedData.quotes) {
          await db.quotes.bulkAdd(importedData.quotes);
        }
      }
    );

    console.log("Data imported successfully.");
  } catch (error) {
    console.error("Failed to import data:", error);
    throw error;
  }
}
