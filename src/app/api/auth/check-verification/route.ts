import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isEmailVerificationEnabled } from "@/lib/email"

export async function POST(request: Request) {
  try {
    if (!isEmailVerificationEnabled()) {
      return NextResponse.json({ verified: true })
    }

    const { email } = (await request.json()) as { email?: string }

    if (!email) {
      return NextResponse.json({ verified: true })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true, password: true },
    })

    // Only flag unverified for email/password users (not OAuth)
    if (user && user.password && !user.emailVerified) {
      return NextResponse.json({ verified: false })
    }

    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ verified: true })
  }
}
