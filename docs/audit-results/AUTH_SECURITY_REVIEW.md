# Auth Security Review

**Last audited:** 2026-03-25
**Auditor:** auth-auditor agent
**Scope:** Authentication, email verification, password reset, profile operations

---

## 🟠 High

### No Rate Limiting on Any Auth Endpoint

**Files:**
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/resend-verification/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/auth.ts` (Credentials authorize)

**Issue:** None of the auth-related API routes implement any form of rate limiting. There is no IP-based throttling, token bucket, or per-user attempt counter anywhere in the codebase.

**Impact:**
- **Brute force on sign-in:** An attacker can make unlimited credential attempts against any account. With an 8-character minimum password and no lockout, this is directly exploitable.
- **Password reset flooding:** An attacker can call `/api/auth/forgot-password` in a tight loop to spam any email address with reset emails at no cost, exhausting Resend API quota and harassing users.
- **Verification resend flooding:** Same issue on `/api/auth/resend-verification` — no throttle means unlimited email spam to any address.
- **Account creation flooding:** `/api/auth/register` has no limit, allowing automated bulk account creation.

**Fix:** Add rate limiting at the proxy (middleware) layer or inline in each route. The recommended approach for Next.js with Neon is an in-memory or Redis-backed rate limiter. A lightweight option is `@upstash/ratelimit` with Vercel KV, or the `rate-limiter-flexible` package with an in-memory store for development:

```typescript
// Example using @upstash/ratelimit (production-grade)
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 min per IP
})

// In the route handler:
const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
const { success } = await ratelimit.limit(ip)
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}
```

Apply stricter limits for sensitive endpoints:
- Sign-in: 5 attempts per 15 minutes per IP
- Forgot password: 3 requests per hour per IP
- Resend verification: 3 requests per hour per IP
- Register: 10 accounts per hour per IP

---

## 🟡 Medium

### User Enumeration via Registration Endpoint

**File:** `src/app/api/auth/register/route.ts` (lines 38-44)

**Issue:** When a user registers with an email that already exists, the endpoint returns HTTP 409 with the explicit message `"A user with this email already exists"`. This is inconsistent with the anti-enumeration measures applied in `forgot-password` and `resend-verification`, which both return generic success responses.

**Impact:** An attacker can probe the registration endpoint to build a list of valid registered email addresses. This enables targeted phishing, credential stuffing with known emails, and social engineering.

**Fix:** Return a generic success-like response regardless of whether the email exists. Send a "someone tried to register with your email" notification to the existing user's email instead:

```typescript
// Instead of returning 409:
if (existingUser) {
  // Optionally: send a "someone tried to register" email to existingUser.email
  return NextResponse.json(
    {
      success: true,
      requiresVerification: false,
      message: "If this email is new, your account has been created.",
    },
    { status: 200 }
  )
}
```

---

### Verification and Reset Tokens Stored in Plaintext

**File:** `src/lib/db/verification.ts` (lines 14, 66)

**Issue:** Both email verification tokens and password reset tokens are generated with `crypto.randomUUID()` and stored directly (unhashed) in the `VerificationToken` table. If the database is ever read by an attacker (via SQL injection, a Neon misconfiguration, or a compromised backup), all outstanding tokens are immediately usable to verify arbitrary accounts or reset passwords.

**Impact:** Database read access → attacker can verify any pending account or reset any pending password without receiving the email. The window of exposure equals the token lifetime (24 hours for verification, 1 hour for reset).

**Note:** `crypto.randomUUID()` provides 122 bits of entropy, which is strong. The issue is purely about storage, not generation. Tokens are correctly single-use and properly expired.

**Fix:** Hash tokens with SHA-256 before storing. The email contains the raw token; the database stores only the hash:

```typescript
import crypto from "crypto"

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

// When creating:
const token = crypto.randomUUID()
await prisma.verificationToken.create({
  data: {
    identifier: email,
    token: hashToken(token), // store hash
    expires,
  },
})
return token // return raw token (goes into email URL)

// When verifying:
const record = await prisma.verificationToken.findUnique({
  where: { token: hashToken(tokenFromUrl) }, // look up by hash
})
```

---

### `check-verification` Endpoint Leaks Account Existence

**File:** `src/app/api/auth/check-verification/route.ts` (lines 17-25)

**Issue:** When email verification is enabled (`EMAIL_VERIFICATION_ENABLED=true`), this unauthenticated endpoint accepts any email address and returns `{ verified: false }` if and only if a user exists with that email AND has a password set AND has not verified their email. For all other cases (user doesn't exist, user is OAuth-only, user is already verified), it returns `{ verified: true }`. This asymmetry leaks account existence.

**Impact:** An attacker can enumerate email/password accounts that are registered but not yet verified. The practical impact is limited to the short window between registration and verification (24 hours), and only when `EMAIL_VERIFICATION_ENABLED=true`. However, the endpoint is publicly callable with no authentication or rate limiting.

**Note:** This endpoint is called client-side *only after a failed sign-in attempt* (in `SignInForm.tsx` line 61-65), so the enumeration vector requires knowing the user's email anyway. However, calling it directly bypasses that precondition.

**Fix:** Require a short-lived CSRF-like nonce tied to a failed sign-in attempt before calling this endpoint, OR remove the endpoint entirely and encode the unverified-email state in the NextAuth error code. Alternatively, accept the risk given it only fires during the registration window and is conditioned on `EMAIL_VERIFICATION_ENABLED`.

---

## 🔵 Low

### `AUTH_SECRET` Not Documented in `.env.example`

**File:** `.env.example`

**Issue:** The `.env.example` file does not include `AUTH_SECRET` (required by NextAuth v5 to sign JWTs and encryption keys). A developer setting up the project from scratch will not know this variable is required and may run without it, causing NextAuth to fall back to a generated secret that is not persisted across restarts or deployments.

**Impact:** In production, missing `AUTH_SECRET` causes all sessions to be invalidated on every server restart. If NextAuth silently generates a secret in development, the behavior difference may not be caught before production.

**Fix:** Add to `.env.example`:

```bash
# NextAuth — generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"
```

---

## ✅ Passed Checks

- ✅ **bcrypt cost factor** — All password hashes use `bcrypt.hash(password, 12)`. Cost factor 12 is appropriate (above the minimum of 10).
- ✅ **Password hashing on reset** — `src/app/api/auth/reset-password/route.ts` line 23 hashes the new password with bcrypt before storing it.
- ✅ **Token expiration enforced** — Both `verifyEmailToken` and `validatePasswordResetToken` in `src/lib/db/verification.ts` check `record.expires < new Date()` before accepting a token.
- ✅ **Single-use token enforcement** — Tokens are deleted from the DB inside a `$transaction` immediately after use (`src/lib/db/verification.ts` lines 46-54 and 104-112).
- ✅ **Cryptographically random tokens** — Both verification and reset tokens use `crypto.randomUUID()` (Node.js built-in, CSPRNG-backed, 122 bits of entropy).
- ✅ **No user enumeration on forgot-password** — `src/app/api/auth/forgot-password/route.ts` always returns `{ success: true }`, even for non-existent emails or OAuth-only accounts.
- ✅ **No user enumeration on resend-verification** — `src/app/api/auth/resend-verification/route.ts` always returns the same success message regardless of user existence.
- ✅ **Change-password verifies current password** — `src/app/api/auth/change-password/route.ts` line 40 calls `bcrypt.compare(currentPassword, user.password)` before allowing the change.
- ✅ **Session required on profile endpoints** — Both `change-password` and `delete-account` routes check `session?.user?.email` and return 401 if not authenticated.
- ✅ **Delete account cascades properly** — The Prisma schema uses `onDelete: Cascade` on all user relations; `prisma.user.delete` in `delete-account/route.ts` removes all associated data.
- ✅ **Password minimum length enforced consistently** — All three entry points (register, reset-password, change-password) enforce `password.length >= 8`.
- ✅ **OAuth-only users cannot use password reset** — `forgot-password/route.ts` checks `user?.password` before sending a reset email, correctly skipping OAuth-only accounts.
- ✅ **Proxy (middleware) covers all dashboard routes** — `src/proxy.ts` matches `/dashboard/:path*` and redirects unauthenticated users to `/sign-in`. The dashboard layout also has a secondary session guard.
- ✅ **Reset token uses namespace prefix** — Password reset tokens use the `"reset:"` prefix on the identifier, preventing a verification token from being used as a reset token and vice versa.
- ✅ **bcrypt timing-safe comparison** — `bcrypt.compare` is inherently timing-safe; no plaintext comparison is used anywhere.

---

## Summary

**1 High, 3 Medium, 1 Low** issue found.

### Priority Action Items

1. **(High) Add rate limiting** — This is the most impactful fix. Brute-force protection on sign-in and email-flooding prevention on forgot-password/resend are the critical cases. Implement before going to production.
2. **(Medium) Fix user enumeration on register** — Return a generic message instead of explicit 409. One-line fix.
3. **(Medium) Hash tokens before DB storage** — Defense-in-depth against DB compromise. Requires small changes to `createVerificationToken`, `createPasswordResetToken`, `verifyEmailToken`, and `validatePasswordResetToken`.
4. **(Medium) Review `check-verification` exposure** — Acceptable risk if `EMAIL_VERIFICATION_ENABLED` stays false in production, but should be addressed if email verification is ever turned on.
5. **(Low) Document `AUTH_SECRET` in `.env.example`** — Quick documentation fix.
