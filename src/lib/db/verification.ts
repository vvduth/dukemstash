import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const TOKEN_EXPIRY_HOURS = 24

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
