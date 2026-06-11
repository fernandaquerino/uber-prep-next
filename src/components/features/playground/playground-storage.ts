import { z } from "zod";
import type { TestCase } from "./playground";

export type StoredSolutionNotes = {
  status?: string;
  errorType?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  notes?: string;
  testCases?: TestCase[];
  testPassRate?: number | null;
  lastTestedAt?: string | null;
};

const testCaseSchema = z.object({
  input: z.string().default(""),
  expected: z.string().default(""),
});

const storedSolutionNotesSchema = z.object({
  status: z.string().optional(),
  errorType: z.string().nullable().optional(),
  timeComplexity: z.string().nullable().optional(),
  spaceComplexity: z.string().nullable().optional(),
  notes: z.string().optional(),
  testCases: z.array(testCaseSchema).optional(),
  testPassRate: z.number().nullable().optional(),
  lastTestedAt: z.string().nullable().optional(),
});

export function createSolutionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `playground:${crypto.randomUUID()}`;
  }

  return `playground:${Date.now()}`;
}

export function serializeSolutionNotes(input: StoredSolutionNotes): string {
  return JSON.stringify(input, null, 2);
}

export function parseStoredSolutionNotes(notes: string | undefined): StoredSolutionNotes {
  if (!notes) return {};

  try {
    const parsed = storedSolutionNotesSchema.safeParse(JSON.parse(notes));
    return parsed.success ? parsed.data : { notes };
  } catch {
    return { notes };
  }
}

export function normalizeStoredTestCases(testCases: unknown): TestCase[] {
  const parsed = z.array(testCaseSchema).safeParse(testCases);

  if (!parsed.success || parsed.data.length === 0) {
    return [{ input: "", expected: "" }];
  }

  return parsed.data;
}
