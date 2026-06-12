import type { NoteRecord, NoteVersion } from "@/types/database";

export type NoteFilters = {
  query?: string;
  category?: string;
  topicId?: string;
  tag?: string;
  lifecycleStatus?: "active" | "archived";
};

export type CreateNoteInput = {
  type: NoteRecord["type"];
  title: string;
  category?: string;
  topicId?: string;
  tags?: string[];
  content?: string;
  isPrimary?: boolean;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  tags?: string[];
  category?: string;
  topicId?: string;
};

export type NoteListItem = {
  id: string;
  title: string;
  type: NoteRecord["type"];
  category?: string;
  topicId?: string;
  tags: string[];
  excerpt: string;
  lifecycleStatus: "active" | "archived";
  isPrimary: boolean;
  updatedAt: string;
  createdAt: string;
};

export type NotesPageData = {
  notes: NoteListItem[];
  versions: NoteVersion[];
  /** counts keyed by category key */
  countsByCategory: Record<string, number>;
  /** counts keyed by topicId */
  countsByTopic: Record<string, number>;
  allTags: string[];
};

/** Derive a short excerpt from markdown content */
export function makeExcerpt(content: string, maxLength = 120): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxLength ? plain.slice(0, maxLength) + "…" : plain;
}

/** Build a NoteListItem from a NoteRecord */
export function toNoteListItem(record: NoteRecord): NoteListItem {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    category: record.category,
    topicId: record.topicId,
    tags: record.tags,
    excerpt: makeExcerpt(record.content),
    lifecycleStatus: record.lifecycleStatus,
    isPrimary: record.isPrimary,
    updatedAt: record.updatedAt,
    createdAt: record.createdAt,
  };
}
