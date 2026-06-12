import type { UberPrepDatabase } from "@/lib/db/schema";
import type { ChecklistSession, ChecklistSessionItem } from "@/types/database";
import { getAllDefaultChecklistItems } from "@/lib/data/mock-checklists";
import { DatabaseError } from "@/lib/db/errors";

function generateId(): string {
  return `cl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildDefaultItems(): ChecklistSessionItem[] {
  return getAllDefaultChecklistItems().map((item) => ({
    id: item.id,
    group: item.group,
    text: item.text,
    isCustom: false,
    checked: false,
  }));
}

export async function createChecklistSession(
  db: UberPrepDatabase,
  label?: string,
): Promise<string> {
  const now = new Date().toISOString();
  const items = buildDefaultItems();
  const id = generateId();

  const session: ChecklistSession = {
    id,
    label,
    items,
    completedCount: 0,
    totalCount: items.length,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.checklistSessions.put(session);
    return id;
  } catch (err) {
    throw new DatabaseError("Failed to create checklist session", err);
  }
}

export async function getLatestChecklistSession(
  db: UberPrepDatabase,
): Promise<ChecklistSession | null> {
  try {
    const all = await db.checklistSessions.orderBy("createdAt").reverse().limit(1).toArray();
    return all[0] ?? null;
  } catch (err) {
    throw new DatabaseError("Failed to get latest checklist session", err);
  }
}

export async function listChecklistSessions(
  db: UberPrepDatabase,
): Promise<ChecklistSession[]> {
  try {
    return db.checklistSessions.orderBy("createdAt").reverse().toArray();
  } catch (err) {
    throw new DatabaseError("Failed to list checklist sessions", err);
  }
}

export async function toggleChecklistItem(
  db: UberPrepDatabase,
  sessionId: string,
  itemId: string,
  checked: boolean,
): Promise<void> {
  const session = await db.checklistSessions.get(sessionId);
  if (!session) throw new Error(`Checklist session not found: ${sessionId}`);

  const now = new Date().toISOString();
  const items = session.items.map((item) =>
    item.id === itemId
      ? { ...item, checked, checkedAt: checked ? now : undefined }
      : item,
  );

  const completedCount = items.filter((i) => i.checked).length;

  try {
    await db.checklistSessions.put({
      ...session,
      items,
      completedCount,
      updatedAt: now,
    });
  } catch (err) {
    throw new DatabaseError(`Failed to toggle checklist item ${itemId}`, err);
  }
}

export async function addCustomChecklistItem(
  db: UberPrepDatabase,
  sessionId: string,
  group: string,
  text: string,
): Promise<void> {
  const session = await db.checklistSessions.get(sessionId);
  if (!session) throw new Error(`Checklist session not found: ${sessionId}`);

  const now = new Date().toISOString();
  const item: ChecklistSessionItem = {
    id: `custom-${Date.now()}`,
    group,
    text,
    isCustom: true,
    checked: false,
  };

  try {
    await db.checklistSessions.put({
      ...session,
      items: [...session.items, item],
      totalCount: session.totalCount + 1,
      updatedAt: now,
    });
  } catch (err) {
    throw new DatabaseError("Failed to add custom checklist item", err);
  }
}

export async function resetChecklistSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<void> {
  const session = await db.checklistSessions.get(sessionId);
  if (!session) throw new Error(`Checklist session not found: ${sessionId}`);

  const now = new Date().toISOString();
  const items = session.items.map((item) => ({
    ...item,
    checked: false,
    checkedAt: undefined,
  }));

  try {
    await db.checklistSessions.put({
      ...session,
      items,
      completedCount: 0,
      updatedAt: now,
    });
  } catch (err) {
    throw new DatabaseError(`Failed to reset checklist session ${sessionId}`, err);
  }
}

export async function deleteChecklistSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<void> {
  try {
    await db.checklistSessions.delete(sessionId);
  } catch (err) {
    throw new DatabaseError(`Failed to delete checklist session ${sessionId}`, err);
  }
}
