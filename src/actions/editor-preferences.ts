"use server";

import { prisma } from "@/lib/prisma";
import {
  editorPreferencesSchema,
  type EditorPreferences,
} from "@/lib/validations/editor-preferences";
import { requireUser } from "@/lib/actions/auth";
import { validateInput } from "@/lib/actions/validate";
import { fail, ok } from "@/lib/actions/result";

export async function updateEditorPreferences(data: EditorPreferences) {
  const guard = await requireUser();
  if (!guard.success) return guard;

  const validation = validateInput(editorPreferencesSchema, data);
  if (!validation.success) return validation;

  try {
    await prisma.user.update({
      where: { id: guard.userId },
      data: { editorPreferences: validation.data },
    });
    return ok();
  } catch {
    return fail("Failed to save editor preferences");
  }
}
