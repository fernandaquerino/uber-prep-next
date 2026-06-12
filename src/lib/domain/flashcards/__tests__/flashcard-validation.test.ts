import { describe, it, expect } from "vitest";
import { validateFlashcardInput, normalizeTags, normalizeTag } from "../flashcard-validation";

describe("validateFlashcardInput", () => {
  it("returns empty errors for valid input", () => {
    const errors = validateFlashcardInput({
      front: "What is a closure?",
      back: "A function that captures its lexical scope.",
      category: "js",
      tags: ["closure", "javascript"],
    });
    expect(errors).toHaveLength(0);
  });

  it("returns error for empty front", () => {
    const errors = validateFlashcardInput({ front: "   " });
    expect(errors.some((e) => e.field === "front")).toBe(true);
  });

  it("returns error for empty back", () => {
    const errors = validateFlashcardInput({ back: "" });
    expect(errors.some((e) => e.field === "back")).toBe(true);
  });

  it("returns error for invalid category", () => {
    const errors = validateFlashcardInput({ category: "unknown" });
    expect(errors.some((e) => e.field === "category")).toBe(true);
  });

  it("accepts all valid categories", () => {
    const valid = ["algo", "system", "js", "fe_coding", "mock", "behavioral", "react", "english", "general"];
    for (const category of valid) {
      const errors = validateFlashcardInput({ category });
      expect(errors.some((e) => e.field === "category")).toBe(false);
    }
  });

  it("returns error when tags exceed max count", () => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
    const errors = validateFlashcardInput({ tags });
    expect(errors.some((e) => e.field === "tags")).toBe(true);
  });
});

describe("normalizeTag", () => {
  it("lowercases", () => {
    expect(normalizeTag("HashMaP")).toBe("hashmap");
  });

  it("replaces spaces with hyphens", () => {
    expect(normalizeTag("binary search")).toBe("binary-search");
  });

  it("trims whitespace", () => {
    expect(normalizeTag("  closure  ")).toBe("closure");
  });
});

describe("normalizeTags", () => {
  it("deduplicates tags", () => {
    const result = normalizeTags(["hashmap", "HASHMAP", "hashmap"]);
    expect(result).toEqual(["hashmap"]);
  });

  it("removes empty strings after normalization", () => {
    const result = normalizeTags(["   ", "algo"]);
    expect(result).toEqual(["algo"]);
  });
});
