import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Name is required").max(100, "Name is too long")),
  description: z
    .string()
    .nullable()
    .transform((s) => (s?.trim() || null)),
});
