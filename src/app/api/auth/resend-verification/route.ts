import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createVerificationToken } from "@/lib/db/verification"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Don't reveal if user exists — always return success
    if (!user || user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a verification link has been sent.",
      })
    }

    const token = await createVerificationToken(email)
    await sendVerificationEmail(email, token)

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a verification link has been sent.",
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    )
  }
}
