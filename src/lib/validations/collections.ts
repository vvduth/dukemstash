import { z } from "zod";

const nameField = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().min(1, "Name is required").max(100, "Name is too long"));

const descriptionField = z
  .string()
  .nullable()
  .transform((s) => (s?.trim() || null));

export const createCollectionSchema = z.object({
  name: nameField,
  description: descriptionField,
});

export const updateCollectionSchema = z.object({
  id: z.string().min(1, "Collection ID is required"),
  name: nameField,
  description: descriptionField,
});
