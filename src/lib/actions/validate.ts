import { z, type ZodTypeAny } from "zod";
import { fail, type ActionFail } from "./result";

type ValidateSuccess<T> = { success: true; data: T };

export function validateInput<T extends ZodTypeAny>(
  schema: T,
  input: unknown
): ValidateSuccess<z.output<T>> | ActionFail {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join(", "));
  }
  return { success: true as const, data: parsed.data };
}
