import { describe, expect, it } from "vitest";
import {
  normalizeStoredTestCases,
  parseStoredSolutionNotes,
  serializeSolutionNotes,
} from "../playground-storage";

describe("playground storage helpers", () => {
  it("serializes and parses solution metadata", () => {
    const raw = serializeSolutionNotes({
      status: "passed",
      errorType: "edge case",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      notes: "Usei hashmap.",
      testCases: [{ input: "twoSum([2,7], 9)", expected: "[0,1]" }],
      testPassRate: 100,
      lastTestedAt: "2026-06-11T10:00:00.000Z",
    });

    expect(parseStoredSolutionNotes(raw)).toMatchObject({
      status: "passed",
      errorType: "edge case",
      testPassRate: 100,
      testCases: [{ input: "twoSum([2,7], 9)", expected: "[0,1]" }],
    });
  });

  it("keeps legacy plain notes readable", () => {
    expect(parseStoredSolutionNotes("nota antiga")).toEqual({ notes: "nota antiga" });
  });

  it("normalizes invalid or empty test cases to a blank editable row", () => {
    expect(normalizeStoredTestCases(undefined)).toEqual([{ input: "", expected: "" }]);
    expect(normalizeStoredTestCases([{ input: "fn()", expected: "1" }])).toEqual([
      { input: "fn()", expected: "1" },
    ]);
  });
});
