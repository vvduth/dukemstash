import { NextRequest } from "next/server"
import { handlers } from "@/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export const { GET } = handlers

export async function POST(request: NextRequest) {
  // Rate limit credentials sign-in attempts
  if (request.nextUrl.pathname.endsWith("/callback/credentials")) {
    // Clone request to read body without consuming it
    const cloned = request.clone()
    try {
      const formData = await cloned.formData()
      const email = formData.get("email") as string | null
      const rateLimit = await checkRateLimit("login", request, email ?? undefined)
      if (rateLimit.limited) return rateLimit.response
    } catch {
      // If body parsing fails, still apply IP-only rate limiting
      const rateLimit = await checkRateLimit("login", request)
      if (rateLimit.limited) return rateLimit.response
    }
  }

  return handlers.POST(request)
}
