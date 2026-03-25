import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPasswordResetToken } from "@/lib/db/verification"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      // Still return success to prevent enumeration
      return NextResponse.json({ success: true })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    // Only send reset email for email/password users (not OAuth-only)
    if (user?.password) {
      const token = await createPasswordResetToken(email)
      await sendPasswordResetEmail(email, token)
    }

    // Always return success to prevent user enumeration
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
