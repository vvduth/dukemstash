"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createCollection as createCollectionDb,
  updateCollection as updateCollectionDb,
  deleteCollection as deleteCollectionDb,
} from "@/lib/db/collections";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations/collections";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS } from "@/lib/subscription";

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

  const isPro = session.user.isPro || process.env.BYPASS_PRO_CHECKS === "true";

  if (!isPro) {
    const collectionCount = await prisma.collection.count({
      where: { userId: session.user.id },
    });
    if (collectionCount >= FREE_LIMITS.maxCollections) {
      return {
        success: false as const,
        error: `You've reached the free limit of ${FREE_LIMITS.maxCollections} collections. Upgrade to Pro for unlimited collections.`,
      };
    }
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

export async function updateCollection(
  data: z.input<typeof updateCollectionSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = updateCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await updateCollectionDb(parsed.data.id, session.user.id, {
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/collections`);
    revalidatePath(`/dashboard/collections/${parsed.data.id}`);
    return { success: true as const };
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
    return { success: false as const, error: "Failed to update collection" };
  }
}

export async function deleteCollection(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    await deleteCollectionDb(collectionId, session.user.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete collection" };
  }
}
