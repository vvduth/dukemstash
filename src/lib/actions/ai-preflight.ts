import { z, type ZodTypeAny } from "zod";
import { auth } from "@/auth";
import { checkActionRateLimit } from "@/lib/rate-limit";
import { isUserPro } from "./auth";
import { fail, type ActionFail } from "./result";

type AiPreflightSuccess<T> = {
  success: true;
  userId: string;
  data: T;
};

export async function aiActionPreflight<T extends ZodTypeAny>(
  schema: T,
  input: unknown
): Promise<AiPreflightSuccess<z.output<T>> | ActionFail> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized");
  }

  if (!isUserPro(session.user.isPro ?? false)) {
    return fail("Pro subscription required");
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const rateCheck = await checkActionRateLimit("ai", session.user.id);
  if (rateCheck.limited) {
    return fail(rateCheck.message);
  }

  return {
    success: true as const,
    userId: session.user.id,
    data: parsed.data,
  };
}
