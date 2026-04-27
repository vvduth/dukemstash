import { auth } from "@/auth";
import { fail, type ActionFail } from "./result";

type RequireUserSuccess = {
  success: true;
  userId: string;
  isPro: boolean;
};

export async function requireUser(): Promise<RequireUserSuccess | ActionFail> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized");
  }
  return {
    success: true as const,
    userId: session.user.id,
    isPro: session.user.isPro ?? false,
  };
}

export function isUserPro(isPro: boolean): boolean {
  return isPro || process.env.BYPASS_PRO_CHECKS === "true";
}
