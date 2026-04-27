"use server";

import { z } from "zod";
import {
  createItem as createItemDb,
  updateItem as updateItemDb,
  deleteItem as deleteItemDb,
} from "@/lib/db/items";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";
import { deleteR2Object } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, isProOnlyType } from "@/lib/subscription";
import { requireUser, isUserPro } from "@/lib/actions/auth";
import { validateInput } from "@/lib/actions/validate";
import { fail, ok } from "@/lib/actions/result";

export async function createItem(
  data: z.input<typeof createItemSchema>
) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  const validation = validateInput(createItemSchema, data);
  if (!validation.success) return validation;

  if (!isUserPro(guard.isPro)) {
    // Check item type is not Pro-only
    const itemType = await prisma.itemType.findUnique({
      where: { id: validation.data.itemTypeId },
      select: { name: true },
    });
    if (itemType && isProOnlyType(itemType.name)) {
      return fail(
        `${itemType.name} items require a Pro subscription. Upgrade to Pro to unlock file and image uploads.`
      );
    }

    // Check item limit
    const itemCount = await prisma.item.count({
      where: { userId: guard.userId },
    });
    if (itemCount >= FREE_LIMITS.maxItems) {
      return fail(
        `You've reached the free limit of ${FREE_LIMITS.maxItems} items. Upgrade to Pro for unlimited items.`
      );
    }
  }

  try {
    const item = await createItemDb(guard.userId, validation.data);
    return ok(item);
  } catch {
    return fail("Failed to create item");
  }
}

export async function updateItem(
  itemId: string,
  data: z.input<typeof updateItemSchema>
) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  const validation = validateInput(updateItemSchema, data);
  if (!validation.success) return validation;

  try {
    const updated = await updateItemDb(itemId, guard.userId, validation.data);
    return ok(updated);
  } catch {
    return fail("Failed to update item");
  }
}

export async function deleteItem(itemId: string) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  try {
    const result = await deleteItemDb(itemId, guard.userId);
    if (!result) {
      return fail("Item not found");
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

    return ok();
  } catch {
    return fail("Failed to delete item");
  }
}
