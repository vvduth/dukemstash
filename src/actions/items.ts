"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as updateItemDb } from "@/lib/db/items";
import { updateItemSchema } from "@/lib/validations/items";

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
