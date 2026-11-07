import { z } from "zod";

export const dalilSchema = z.object({
  arabic: z.string().min(1),
  translation: z.string().min(1),
  source: z.string().min(1),
});

export const summaryContentSchema = z.object({
  tldr: z.string().min(20),
  points: z.array(z.string().min(5)).min(1).max(8),
  dalils: z.array(dalilSchema).max(25),
});

export type SummaryContent = z.infer<typeof summaryContentSchema>;
