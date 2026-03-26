"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createItem as createItemDb,
  updateItem as updateItemDb,
  deleteItem as deleteItemDb,
} from "@/lib/db/items";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";

export async function createItem(
  data: z.input<typeof createItemSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const item = await createItemDb(session.user.id, parsed.data);
    return { success: true as const, data: item };
  } catch {
    return { success: false as const, error: "Failed to create item" };
  }
}

export async function updateItem(
  itemId: string,
  data: z.input<typeof updateItemSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const updated = await updateItemDb(itemId, session.user.id, parsed.data);
    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Failed to update item" };
  }
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const result = await deleteItemDb(itemId, session.user.id);
    if (!result) {
      return { success: false as const, error: "Item not found" };
    }
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete item" };
  }
}
