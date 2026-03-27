import { z } from "zod";

export const createItemSchema = z.object({
  itemTypeId: z.string().min(1, "Item type is required"),
  title: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Title is required")),
  description: z
    .string()
    .nullable()
    .transform((s) => (s?.trim() || null)),
  content: z
    .string()
    .nullable()
    .transform((s) => (s?.trim() || null)),
  url: z
    .string()
    .nullable()
    .transform((s) => {
      const trimmed = s?.trim() || null;
      return trimmed;
    })
    .pipe(z.string().url("Invalid URL").nullable()),
  language: z
    .string()
    .nullable()
    .transform((s) => (s?.trim() || null)),
  tags: z.array(
    z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1))
  ),
  fileUrl: z.string().nullable().optional().default(null),
  fileName: z.string().nullable().optional().default(null),
  fileSize: z.number().nullable().optional().default(null),
});

export const updateItemSchema = z.object({
  title: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Title is required")),
  description: z
    .string()
    .nullable()
    .transform((s) => (s?.trim() || null)),
  content: z
    .string()
    .nullable()
    .transform((s) => (s?.trim() || null)),
  url: z
    .string()
    .nullable()
    .transform((s) => {
      const trimmed = s?.trim() || null;
      return trimmed;
    })
    .pipe(z.string().url("Invalid URL").nullable()),
  language: z
    .string()
    .nullable()
    .transform((s) => (s?.trim() || null)),
  tags: z.array(
    z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1))
  ),
});
