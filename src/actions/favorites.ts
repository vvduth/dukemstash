"use server";

import { revalidatePath } from "next/cache";
import { toggleItemFavorite as toggleItemFavoriteDb } from "@/lib/db/items";
import { toggleCollectionFavorite as toggleCollectionFavoriteDb } from "@/lib/db/collections";
import { requireUser } from "@/lib/actions/auth";
import { fail, ok } from "@/lib/actions/result";

export async function toggleItemFavorite(itemId: string) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  try {
    const result = await toggleItemFavoriteDb(itemId, guard.userId);
    if (!result) {
      return fail("Item not found");
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/favorites");
    return ok(result);
  } catch {
    return fail("Failed to toggle favorite");
  }
}

export async function toggleCollectionFavorite(collectionId: string) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  try {
    const result = await toggleCollectionFavoriteDb(collectionId, guard.userId);
    if (!result) {
      return fail("Collection not found");
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    revalidatePath(`/dashboard/collections/${collectionId}`);
    revalidatePath("/dashboard/favorites");
    return ok(result);
  } catch {
    return fail("Failed to toggle favorite");
  }
}
