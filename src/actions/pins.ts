"use server";

import { revalidatePath } from "next/cache";
import { toggleItemPin as toggleItemPinDb } from "@/lib/db/items";
import { requireUser } from "@/lib/actions/auth";
import { fail, ok } from "@/lib/actions/result";

export async function toggleItemPin(itemId: string) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  try {
    const result = await toggleItemPinDb(itemId, guard.userId);
    if (!result) {
      return fail("Item not found");
    }

    revalidatePath("/dashboard");
    return ok(result);
  } catch {
    return fail("Failed to toggle pin");
  }
}
