import type { UberPrepDatabase } from "@/lib/db/schema";
import type { NoteRecord, NoteVersion } from "@/types/database";
import type {
  CreateNoteInput,
  UpdateNoteInput,
  NotesPageData,
} from "@/lib/domain/notes/note.types";
import { toNoteListItem } from "@/lib/domain/notes/note.types";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createNote(db: UberPrepDatabase, input: CreateNoteInput): Promise<string> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const record: NoteRecord = {
    id,
    type: input.type,
    title: input.title.trim() || "Nota sem título",
    category: input.category,
    topicId: input.topicId,
    tags: input.tags ?? [],
    content: input.content ?? "",
    lifecycleStatus: "active",
    isPrimary: input.isPrimary ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await db.notes.add(record);
  return id;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateNote(
  db: UberPrepDatabase,
  id: string,
  input: UpdateNoteInput,
): Promise<void> {
  const now = new Date().toISOString();
  const updates: Partial<NoteRecord> = { updatedAt: now };

  if (input.title !== undefined) updates.title = input.title.trim() || "Nota sem título";
  if (input.content !== undefined) updates.content = input.content;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.category !== undefined) updates.category = input.category;
  if (input.topicId !== undefined) updates.topicId = input.topicId;

  await db.notes.update(id, updates);
}

// ─── Archive / Restore ────────────────────────────────────────────────────────

export async function archiveNote(db: UberPrepDatabase, id: string): Promise<void> {
  await db.notes.update(id, {
    lifecycleStatus: "archived",
    updatedAt: new Date().toISOString(),
  });
}

export async function restoreArchivedNote(db: UberPrepDatabase, id: string): Promise<void> {
  await db.notes.update(id, {
    lifecycleStatus: "active",
    updatedAt: new Date().toISOString(),
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteNote(db: UberPrepDatabase, id: string): Promise<void> {
  await Promise.all([
    db.notes.delete(id),
    db.noteVersions.where("noteId").equals(id).delete(),
    db.noteLinks.where("noteId").equals(id).delete(),
  ]);
}

// ─── Versions ─────────────────────────────────────────────────────────────────

export async function saveNoteVersion(
  db: UberPrepDatabase,
  noteId: string,
  reason: NoteVersion["reason"],
): Promise<void> {
  const note = await db.notes.get(noteId);
  if (!note) return;

  const version: NoteVersion = {
    id: crypto.randomUUID(),
    noteId,
    title: note.title,
    content: note.content,
    reason,
    createdAt: new Date().toISOString(),
  };

  await db.noteVersions.add(version);
}

export async function restoreNoteVersion(
  db: UberPrepDatabase,
  noteId: string,
  versionId: string,
): Promise<void> {
  const [note, version] = await Promise.all([db.notes.get(noteId), db.noteVersions.get(versionId)]);

  if (!note || !version) return;

  // Save current state as a "before_restore" version
  await saveNoteVersion(db, noteId, "before_restore");

  // Restore from chosen version
  const now = new Date().toISOString();
  await db.notes.update(noteId, {
    title: version.title,
    content: version.content,
    updatedAt: now,
  });
}

// ─── Page Data ────────────────────────────────────────────────────────────────

export async function getNotesPageData(db: UberPrepDatabase): Promise<NotesPageData> {
  const [allNotes, allVersions] = await Promise.all([
    db.notes.toArray(),
    db.noteVersions.toArray(),
  ]);

  const activeNotes = allNotes.filter((n) => n.lifecycleStatus === "active");

  const countsByCategory: Record<string, number> = {};
  const countsByTopic: Record<string, number> = {};
  const tagSet = new Set<string>();

  for (const note of activeNotes) {
    if (note.category) {
      countsByCategory[note.category] = (countsByCategory[note.category] ?? 0) + 1;
    }
    if (note.topicId) {
      countsByTopic[note.topicId] = (countsByTopic[note.topicId] ?? 0) + 1;
    }
    for (const tag of note.tags) {
      tagSet.add(tag);
    }
  }

  return {
    notes: allNotes.map(toNoteListItem),
    versions: allVersions,
    countsByCategory,
    countsByTopic,
    allTags: Array.from(tagSet).sort(),
  };
}
