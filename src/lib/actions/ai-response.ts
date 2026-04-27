import { fail, type ActionFail } from "./result";

type ExtractSuccess = { success: true; data: string };

export function extractAiString(
  json: unknown,
  primaryKey: string,
  fallbackKey: string | undefined,
  emptyError: string
): ExtractSuccess | ActionFail {
  const obj =
    typeof json === "object" && json !== null
      ? (json as Record<string, unknown>)
      : null;

  const raw: unknown =
    typeof json === "string"
      ? json
      : (obj?.[primaryKey] ??
        (fallbackKey ? obj?.[fallbackKey] : undefined));

  if (typeof raw !== "string") {
    return fail("AI returned unexpected format");
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return fail(emptyError);
  }

  return { success: true as const, data: trimmed };
}
