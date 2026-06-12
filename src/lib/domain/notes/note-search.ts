import type { NoteRecord } from "@/types/database";
import type { NoteFilters } from "./note.types";

/** Normalize a string: lowercase and remove diacritics */
function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Strip markdown formatting for plain-text search */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/#{1,6}\s+/g, " ")
    .replace(/[*_~>]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

/**
 * Full-text search across title, content (plain text), and tags.
 * Accent-insensitive and case-insensitive.
 */
export function searchNotes(notes: NoteRecord[], query: string): NoteRecord[] {
  const q = normalize(query.trim());
  if (!q) return notes;

  return notes.filter((note) => {
    const titleMatch = normalize(note.title).includes(q);
    if (titleMatch) return true;

    const contentMatch = normalize(toPlainText(note.content)).includes(q);
    if (contentMatch) return true;

    const tagMatch = note.tags.some((tag) => normalize(tag).includes(q));
    return tagMatch;
  });
}

/**
 * Apply structured filters (category, topicId, tag, lifecycleStatus) to a list.
 * Does NOT handle text search — use searchNotes for that.
 */
export function filterNotes(notes: NoteRecord[], filters: NoteFilters): NoteRecord[] {
  let result = notes;

  if (filters.lifecycleStatus) {
    result = result.filter((n) => n.lifecycleStatus === filters.lifecycleStatus);
  } else {
    // Default: active only
    result = result.filter((n) => n.lifecycleStatus === "active");
  }

  if (filters.category) {
    result = result.filter((n) => n.category === filters.category);
  }

  if (filters.topicId) {
    result = result.filter((n) => n.topicId === filters.topicId);
  }

  if (filters.tag) {
    const tag = normalize(filters.tag);
    result = result.filter((n) => n.tags.some((t) => normalize(t) === tag));
  }

  if (filters.query?.trim()) {
    result = searchNotes(result, filters.query);
  }

  return result;
}
