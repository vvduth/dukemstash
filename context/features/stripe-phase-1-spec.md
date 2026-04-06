# Stripe Integration - Phase 1: Core Infrastructure

## Overview

Set up Stripe client, subscription constants, session integration, and usage-limit enforcement. This phase has no external Stripe dependency at runtime — everything can be unit tested locally.

## Requirements

- Install `stripe` npm package
- Create Stripe client utility and price constants
- Create subscription constants and limit-checking helpers
- Add `isPro` to NextAuth JWT and session
- Extend next-auth type declarations
- Add env variable placeholders to `.env.example`
- Unit tests for the usage-limits module

## Files to Create

### 1. `src/lib/stripe.ts` — Stripe Client & Helpers

- Initialize `Stripe` with `STRIPE_SECRET_KEY` (throw if missing)
- Export `PRICES` map: `{ monthly: STRIPE_PRICE_MONTHLY_ID, yearly: STRIPE_PRICE_YEARLY_ID }`
- Export `BillingInterval` type
- Export `getOrCreateCustomer(userId, email, existingCustomerId)` — returns existing or creates new Stripe customer, persists `stripeCustomerId` to DB

### 2. `src/lib/subscription.ts` — Shared Constants & Checks

- `FREE_LIMITS = { maxItems: 50, maxCollections: 3 }`
- `PRO_ONLY_TYPES = ["file", "image"]`
- `isProOnlyType(typeName: string): boolean`

### 3. `src/types/next-auth.d.ts` — Extend Session Types

- Add `isPro: boolean` to `Session.user`
- Add `isPro?: boolean` to `JWT`

## Files to Modify

### 1. `.env.example` — Add Stripe Variables

```
# Stripe
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_MONTHLY_ID=""
STRIPE_PRICE_YEARLY_ID=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. `src/auth.ts` — Add `isPro` to Session

- JWT callback: query `isPro` from DB via `prisma.user.findUnique` on every token refresh
- Session callback: copy `token.isPro` to `session.user.isPro`
- This ensures session stays in sync after webhook updates (a page reload picks up changes)

## Unit Tests

### `src/lib/__tests__/subscription.test.ts`

Test the pure functions in `src/lib/subscription.ts`:

| Test | Expected |
|------|----------|
| `isProOnlyType("file")` | `true` |
| `isProOnlyType("image")` | `true` |
| `isProOnlyType("snippet")` | `false` |
| `isProOnlyType("prompt")` | `false` |
| `isProOnlyType("note")` | `false` |
| `isProOnlyType("command")` | `false` |
| `isProOnlyType("link")` | `false` |
| `isProOnlyType("")` | `false` |
| `FREE_LIMITS.maxItems` | `50` |
| `FREE_LIMITS.maxCollections` | `3` |

## Dependencies

```bash
npm install stripe
```

## Notes

- No database migration needed — `isPro`, `stripeCustomerId`, `stripeSubscriptionId` already exist in schema
- The JWT callback adds ~1ms per request for the DB lookup, but guarantees session accuracy
- `src/lib/stripe.ts` will throw at import time if `STRIPE_SECRET_KEY` is missing — this is intentional for early failure in production but means tests that import it need mocking or env setup
- Phase 2 builds on everything created here
