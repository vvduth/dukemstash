"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createCollection as createCollectionDb } from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/validations/collections";

export async function createCollection(
  data: z.input<typeof createCollectionSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const collection = await createCollectionDb(session.user.id, parsed.data);
    revalidatePath("/dashboard");
    return { success: true as const, data: collection };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return {
        success: false as const,
        error: "A collection with this name already exists",
      };
    }
    return { success: false as const, error: "Failed to create collection" };
  }
}
