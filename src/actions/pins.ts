"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { toggleItemPin as toggleItemPinDb } from "@/lib/db/items";

export async function toggleItemPin(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const result = await toggleItemPinDb(itemId, session.user.id);
    if (!result) {
      return { success: false as const, error: "Item not found" };
    }

    revalidatePath("/dashboard");
    return { success: true as const, data: result };
  } catch {
    return { success: false as const, error: "Failed to toggle pin" };
  }
}
