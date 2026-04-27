"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createCollection as createCollectionDb,
  updateCollection as updateCollectionDb,
  deleteCollection as deleteCollectionDb,
} from "@/lib/db/collections";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations/collections";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS } from "@/lib/subscription";
import { requireUser, isUserPro } from "@/lib/actions/auth";
import { validateInput } from "@/lib/actions/validate";
import { fail, ok } from "@/lib/actions/result";

export async function createCollection(
  data: z.input<typeof createCollectionSchema>
) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  const validation = validateInput(createCollectionSchema, data);
  if (!validation.success) return validation;

  if (!isUserPro(guard.isPro)) {
    const collectionCount = await prisma.collection.count({
      where: { userId: guard.userId },
    });
    if (collectionCount >= FREE_LIMITS.maxCollections) {
      return fail(
        `You've reached the free limit of ${FREE_LIMITS.maxCollections} collections. Upgrade to Pro for unlimited collections.`
      );
    }
  }

  try {
    const collection = await createCollectionDb(guard.userId, validation.data);
    revalidatePath("/dashboard");
    return ok(collection);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return fail("A collection with this name already exists");
    }
    return fail("Failed to create collection");
  }
}

export async function updateCollection(
  data: z.input<typeof updateCollectionSchema>
) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  const validation = validateInput(updateCollectionSchema, data);
  if (!validation.success) return validation;

  try {
    await updateCollectionDb(validation.data.id, guard.userId, {
      name: validation.data.name,
      description: validation.data.description,
    });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/collections`);
    revalidatePath(`/dashboard/collections/${validation.data.id}`);
    return ok();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return fail("A collection with this name already exists");
    }
    return fail("Failed to update collection");
  }
}

export async function deleteCollection(collectionId: string) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  try {
    await deleteCollectionDb(collectionId, guard.userId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    return ok();
  } catch {
    return fail("Failed to delete collection");
  }
}
