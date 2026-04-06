"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createItem as createItemDb,
  updateItem as updateItemDb,
  deleteItem as deleteItemDb,
} from "@/lib/db/items";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";
import { deleteR2Object } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, isProOnlyType } from "@/lib/subscription";

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

  const isPro = session.user.isPro || process.env.BYPASS_PRO_CHECKS === "true";

  if (!isPro) {
    // Check item type is not Pro-only
    const itemType = await prisma.itemType.findUnique({
      where: { id: parsed.data.itemTypeId },
      select: { name: true },
    });
    if (itemType && isProOnlyType(itemType.name)) {
      return {
        success: false as const,
        error: `${itemType.name} items require a Pro subscription. Upgrade to Pro to unlock file and image uploads.`,
      };
    }

    // Check item limit
    const itemCount = await prisma.item.count({
      where: { userId: session.user.id },
    });
    if (itemCount >= FREE_LIMITS.maxItems) {
      return {
        success: false as const,
        error: `You've reached the free limit of ${FREE_LIMITS.maxItems} items. Upgrade to Pro for unlimited items.`,
      };
    }
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

    // Clean up R2 file if present
    if (result.fileUrl) {
      try {
        await deleteR2Object(result.fileUrl);
      } catch {
        // Log but don't fail the delete — the DB record is already gone
        console.error("Failed to delete R2 object:", result.fileUrl);
      }
    }

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete item" };
  }
}
