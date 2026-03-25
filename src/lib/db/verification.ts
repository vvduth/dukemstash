import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const TOKEN_EXPIRY_HOURS = 24
const RESET_TOKEN_EXPIRY_HOURS = 1
const RESET_TOKEN_PREFIX = "reset:"

export async function createVerificationToken(email: string) {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record) {
    return { success: false, error: "Invalid verification token" } as const
  }

  if (record.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: { token },
    })
    return { success: false, error: "Verification token has expired" } as const
  }

  // Mark user as verified and delete the token
  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ])

  return { success: true } as const
}

export async function createPasswordResetToken(email: string) {
  const identifier = `${RESET_TOKEN_PREFIX}${email}`

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  })

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  })

  return token
}

export async function validatePasswordResetToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record || !record.identifier.startsWith(RESET_TOKEN_PREFIX)) {
    return { success: false, error: "Invalid or expired reset link" } as const
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return { success: false, error: "Reset link has expired. Please request a new one." } as const
  }

  const email = record.identifier.slice(RESET_TOKEN_PREFIX.length)
  return { success: true, email } as const
}

export async function consumePasswordResetToken(token: string, hashedPassword: string) {
  const validation = await validatePasswordResetToken(token)
  if (!validation.success) {
    return validation
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: validation.email },
      data: { password: hashedPassword },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ])

  return { success: true } as const
}
