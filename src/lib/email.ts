import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Dukemstash <onboarding@resend.dev>"

export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true"
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email — Dukemstash",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #f5f5f5; margin-bottom: 8px;">Dukemstash</h1>
        <p style="color: #a3a3a3; font-size: 14px; margin-bottom: 32px;">Your developer knowledge hub</p>

        <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to verify your email address and activate your account.
        </p>

        <a href="${verifyUrl}" style="display: inline-block; background-color: #f5f5f5; color: #171717; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Verify Email
        </a>

        <p style="color: #737373; font-size: 13px; margin-top: 32px; line-height: 1.5;">
          If the button doesn&apos;t work, copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #a3a3a3; word-break: break-all;">${verifyUrl}</a>
        </p>

        <p style="color: #525252; font-size: 12px; margin-top: 32px;">
          This link expires in 24 hours. If you didn&apos;t create an account, you can ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password — Dukemstash",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #f5f5f5; margin-bottom: 8px;">Dukemstash</h1>
        <p style="color: #a3a3a3; font-size: 14px; margin-bottom: 32px;">Your developer knowledge hub</p>

        <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to choose a new password.
        </p>

        <a href="${resetUrl}" style="display: inline-block; background-color: #f5f5f5; color: #171717; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Reset Password
        </a>

        <p style="color: #737373; font-size: 13px; margin-top: 32px; line-height: 1.5;">
          If the button doesn&apos;t work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #a3a3a3; word-break: break-all;">${resetUrl}</a>
        </p>

        <p style="color: #525252; font-size: 12px; margin-top: 32px;">
          This link expires in 1 hour. If you didn&apos;t request a password reset, you can ignore this email.
        </p>
      </div>
    `,
  })
}
