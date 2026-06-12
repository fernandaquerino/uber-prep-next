import { z } from "zod";

export const techEnglishTypeValues = [
  "phrase",
  "vocabulary",
  "template",
  "question",
  "answer",
  "scenario",
] as const;

export const techEnglishScenarioValues = [
  "intro",
  "coding",
  "system_design",
  "behavioral",
  "pair_programming",
  "clarifying",
  "tradeoffs",
  "feedback",
  "general",
] as const;

export const createTechEnglishSchema = z.object({
  type: z.enum(techEnglishTypeValues),
  scenario: z.enum(techEnglishScenarioValues),
  title: z.string().min(1, "Título é obrigatório").max(200),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  translation: z.string().optional(),
  category: z.string().optional(),
  topicIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const updateTechEnglishSchema = createTechEnglishSchema.partial();

export type CreateTechEnglishFormValues = z.infer<typeof createTechEnglishSchema>;
export type UpdateTechEnglishFormValues = z.infer<typeof updateTechEnglishSchema>;
