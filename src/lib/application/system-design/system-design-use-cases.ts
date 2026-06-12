import type { UberPrepDatabase } from "@/lib/db/schema";
import type { SystemDesignDraft } from "@/types/database";
import { getSystemDesignTemplate } from "@/lib/data/system-design-templates";
import { createMock } from "@/lib/application/mocks/mock-use-cases";
import { DatabaseError } from "@/lib/db/errors";

function generateId(): string {
  return `sdd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveSystemDesignDraft(
  db: UberPrepDatabase,
  templateId: string,
  answers: Record<string, string>,
  checklistState: Record<string, boolean>,
): Promise<string> {
  const template = getSystemDesignTemplate(templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  const now = new Date().toISOString();

  try {
    const existing = await db.systemDesignDrafts
      .where("templateId")
      .equals(templateId)
      .first();

    const id = existing?.id ?? generateId();
    const record: SystemDesignDraft = {
      id,
      templateId,
      templateVersion: template.version,
      answers,
      checklistState,
      linkedMockId: existing?.linkedMockId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await db.systemDesignDrafts.put(record);
    return id;
  } catch (err) {
    throw new DatabaseError(`Failed to save system design draft for ${templateId}`, err);
  }
}

export async function getSystemDesignDraft(
  db: UberPrepDatabase,
  templateId: string,
): Promise<SystemDesignDraft | null> {
  try {
    return (await db.systemDesignDrafts.where("templateId").equals(templateId).first()) ?? null;
  } catch (err) {
    throw new DatabaseError(`Failed to get draft for template ${templateId}`, err);
  }
}

export async function resetSystemDesignDraft(
  db: UberPrepDatabase,
  templateId: string,
): Promise<void> {
  try {
    await db.systemDesignDrafts.where("templateId").equals(templateId).delete();
  } catch (err) {
    throw new DatabaseError(`Failed to reset draft for template ${templateId}`, err);
  }
}

/**
 * Register a system design draft as a completed mock.
 * Returns the new mock ID.
 */
export async function registerDraftAsMock(
  db: UberPrepDatabase,
  templateId: string,
  today: string,
): Promise<string> {
  const template = getSystemDesignTemplate(templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  const draft = await db.systemDesignDrafts.where("templateId").equals(templateId).first();

  // Build response from draft answers (concatenate section answers)
  const response = template.sections
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const answer = draft?.answers[s.id] ?? "";
      if (!answer.trim()) return null;
      return `## ${s.title}\n${answer}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const mockId = await createMock(db, {
    type: "system_design",
    title: template.title,
    date: today,
    status: "in_progress",
    prompt: template.description,
    response: response || undefined,
    sourceType: "system_design_template",
    sourceId: templateId,
  } as Parameters<typeof createMock>[1] & { sourceType: "system_design_template"; sourceId: string });

  // Link the draft to this mock
  if (draft) {
    await db.systemDesignDrafts.put({ ...draft, linkedMockId: mockId, updatedAt: new Date().toISOString() });
  }

  return mockId;
}
