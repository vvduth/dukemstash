"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  editorPreferencesSchema,
  type EditorPreferences,
} from "@/lib/validations/editor-preferences";

export async function updateEditorPreferences(data: EditorPreferences) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = editorPreferencesSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { editorPreferences: parsed.data },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to save editor preferences" };
  }
}
