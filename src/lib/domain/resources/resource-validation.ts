import { z } from "zod";

export const resourceTypeValues = [
  "article",
  "video",
  "course",
  "documentation",
  "book",
  "exercise",
  "repo",
  "cheatsheet",
  "other",
] as const;

export const resourceDifficultyValues = ["beginner", "intermediate", "advanced"] as const;

export const resourceStatusValues = [
  "not_started",
  "in_progress",
  "completed",
  "saved_for_later",
  "archived",
] as const;

export const createResourceSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  description: z.string().max(500).optional(),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  type: z.enum(resourceTypeValues),
  category: z.string().min(1, "Categoria é obrigatória"),
  topicIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(resourceDifficultyValues).optional(),
  estimatedMinutes: z.number().int().min(1).max(600).optional(),
  linkedPlanBlockIds: z.array(z.string()).default([]),
});

export const updateResourceSchema = createResourceSchema.partial();

export type CreateResourceFormValues = z.infer<typeof createResourceSchema>;
export type UpdateResourceFormValues = z.infer<typeof updateResourceSchema>;
