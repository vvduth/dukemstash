import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createVerificationToken } from "@/lib/db/verification"
import { sendVerificationEmail, isEmailVerificationEnabled } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit("register", request)
    if (rateLimit.limited) return rateLimit.response
    const body = await request.json()
    const { name, email, password, confirmPassword } = body as {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    }

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const verificationEnabled = isEmailVerificationEnabled()

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(verificationEnabled ? {} : { emailVerified: new Date() }),
      },
    })

    if (verificationEnabled) {
      const token = await createVerificationToken(email)
      await sendVerificationEmail(email, token)
    }

    return NextResponse.json(
      {
        success: true,
        requiresVerification: verificationEnabled,
        message: verificationEnabled
          ? "Account created. Please check your email to verify your account."
          : "Account created successfully.",
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    )
  }
}
