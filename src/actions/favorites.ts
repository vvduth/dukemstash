"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { toggleItemFavorite as toggleItemFavoriteDb } from "@/lib/db/items";
import { toggleCollectionFavorite as toggleCollectionFavoriteDb } from "@/lib/db/collections";

export async function toggleItemFavorite(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const result = await toggleItemFavoriteDb(itemId, session.user.id);
    if (!result) {
      return { success: false as const, error: "Item not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/favorites");
    return { success: true as const, data: result };
  } catch {
    return { success: false as const, error: "Failed to toggle favorite" };
  }
}

export async function toggleCollectionFavorite(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const result = await toggleCollectionFavoriteDb(collectionId, session.user.id);
    if (!result) {
      return { success: false as const, error: "Collection not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    revalidatePath(`/dashboard/collections/${collectionId}`);
    revalidatePath("/dashboard/favorites");
    return { success: true as const, data: result };
  } catch {
    return { success: false as const, error: "Failed to toggle favorite" };
  }
}
