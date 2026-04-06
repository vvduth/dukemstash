# Stripe Subscription Integration Plan

> Dukemstash Pro: $8/month or $72/year (25% annual savings)

---

## Table of Contents

1. [Current State](#current-state)
2. [Stripe Dashboard Setup](#stripe-dashboard-setup)
3. [Implementation Order](#implementation-order)
4. [Files to Create](#files-to-create)
5. [Files to Modify](#files-to-modify)
6. [Feature Gating Strategy](#feature-gating-strategy)
7. [Testing Checklist](#testing-checklist)

---

## Current State

### Database Schema (Ready)

The User model in `prisma/schema.prisma` already has all required fields:

```prisma
model User {
  isPro                Boolean @default(false)
  stripeCustomerId     String? @unique
  stripeSubscriptionId String? @unique
}
```

**No migration needed** — fields exist and are ready to use.

### Auth Configuration

- **NextAuth v5** with JWT session strategy (`src/auth.ts`)
- Session currently includes `user.id` only
- JWT callback needs modification to include `isPro` status
- Auth check pattern: `const session = await auth(); session?.user?.id`

### Existing Pro UI

- Sidebar already shows PRO badges on file/image types (`src/components/dashboard/Sidebar.tsx:124-131`)
- Homepage PricingSection component exists with correct pricing (`src/components/homepage/PricingSection.tsx`)

### Server Action Pattern

All actions follow this pattern (`src/actions/items.ts`, `src/actions/collections.ts`):

```typescript
"use server";
const session = await auth();
if (!session?.user?.id) return { success: false, error: "Unauthorized" };
const parsed = schema.safeParse(data);
// ... try/catch with { success, data?, error? } return
```

### API Route Pattern

Routes use `NextResponse.json()` with status codes (`src/app/api/upload/route.ts`):

```typescript
const session = await auth();
if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

---

## Stripe Dashboard Setup

### 1. Create Product

- **Name:** Dukemstash Pro
- **Description:** Unlimited items, collections, file uploads, and AI features

### 2. Create Two Prices

| Price | Interval | Amount | Env Variable |
|-------|----------|--------|-------------|
| Monthly | month | $8.00 | `STRIPE_PRICE_MONTHLY_ID` |
| Yearly | year | $72.00 | `STRIPE_PRICE_YEARLY_ID` |

### 3. Create Webhook Endpoint

- **URL:** `https://yourdomain.com/api/webhooks/stripe`
- **Events to listen for:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Save the signing secret as `STRIPE_WEBHOOK_SECRET`

### 4. Get API Keys

- **Publishable key** -> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** -> `STRIPE_SECRET_KEY`

---

## Implementation Order

| Step | Task | Files |
|------|------|-------|
| 1 | Environment variables | `.env.example` |
| 2 | Stripe utility & client | `src/lib/stripe.ts` |
| 3 | Add `isPro` to session | `src/auth.ts`, `src/types/next-auth.d.ts` |
| 4 | Checkout API route | `src/app/api/checkout/route.ts` |
| 5 | Webhook handler | `src/app/api/webhooks/stripe/route.ts` |
| 6 | Customer portal route | `src/app/api/billing/portal/route.ts` |
| 7 | Billing settings section | `src/components/dashboard/BillingSection.tsx` |
| 8 | Feature gating (actions) | `src/actions/items.ts`, `src/actions/collections.ts` |
| 9 | Feature gating (upload) | `src/app/api/upload/route.ts` |
| 10 | Upgrade prompts in UI | Various components |
| 11 | Tests | `src/lib/__tests__/stripe.test.ts` |

---

## Files to Create

### 1. `src/lib/stripe.ts` — Stripe Client & Helpers

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY_ID!,
  yearly: process.env.STRIPE_PRICE_YEARLY_ID!,
} as const;

export type BillingInterval = keyof typeof PRICES;

/**
 * Get or create a Stripe customer for a user.
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  existingCustomerId: string | null
): Promise<string> {
  if (existingCustomerId) return existingCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  // Update user with Stripe customer ID
  const { prisma } = await import("@/lib/prisma");
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
```

### 2. `src/app/api/checkout/route.ts` — Create Checkout Session

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PRICES, type BillingInterval } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interval } = (await request.json()) as { interval: BillingInterval };
  if (!interval || !PRICES[interval]) {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, isPro: true },
  });

  if (user?.isPro) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  const customerId = await getOrCreateCustomer(
    session.user.id,
    session.user.email,
    user?.stripeCustomerId ?? null
  );

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PRICES[interval], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### 3. `src/app/api/webhooks/stripe/route.ts` — Webhook Handler

```typescript
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.userId && session.subscription) {
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: {
            isPro: true,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });
      if (user) {
        const isActive = ["active", "trialing"].includes(subscription.status);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPro: isActive,
            stripeSubscriptionId: subscription.id,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPro: false,
            stripeSubscriptionId: null,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### 4. `src/app/api/billing/portal/route.ts` — Customer Portal

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### 5. `src/lib/subscription.ts` — Shared Subscription Constants & Checks

```typescript
export const FREE_LIMITS = {
  maxItems: 50,
  maxCollections: 3,
} as const;

export const PRO_ONLY_TYPES = ["file", "image"] as const;

export function isProOnlyType(typeName: string): boolean {
  return (PRO_ONLY_TYPES as readonly string[]).includes(typeName);
}
```

### 6. `src/components/dashboard/BillingSection.tsx` — Settings Billing Card

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ExternalLink } from "lucide-react";

interface BillingSectionProps {
  isPro: boolean;
  email: string;
}

export function BillingSection({ isPro, email }: BillingSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(interval: "monthly" | "yearly") {
    setLoading(interval);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  if (isPro) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Subscription</CardTitle>
            <Badge className="bg-purple-600">PRO</Badge>
          </div>
          <CardDescription>You have access to all Pro features.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handlePortal} disabled={loading === "portal"}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {loading === "portal" ? "Loading..." : "Manage Subscription"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>
          Unlock unlimited items, collections, file uploads, and AI features.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button onClick={() => handleCheckout("monthly")} disabled={!!loading}>
          <Crown className="mr-2 h-4 w-4" />
          {loading === "monthly" ? "Loading..." : "$8/month"}
        </Button>
        <Button variant="outline" onClick={() => handleCheckout("yearly")} disabled={!!loading}>
          {loading === "yearly" ? "Loading..." : "$72/year (save 25%)"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Files to Modify

### 1. `.env.example` — Add Stripe Variables

```diff
+ # Stripe
+ STRIPE_SECRET_KEY=""
+ STRIPE_PUBLISHABLE_KEY=""
+ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
+ STRIPE_WEBHOOK_SECRET=""
+ STRIPE_PRICE_MONTHLY_ID=""
+ STRIPE_PRICE_YEARLY_ID=""
+ NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. `src/auth.ts` — Add `isPro` to Session

Modify the JWT callback to always sync `isPro` from the database (handles webhook updates):

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user?.id) {
      token.sub = user.id;
    }

    // Always sync isPro from database to catch webhook updates
    if (token.sub) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { isPro: true },
      });
      token.isPro = dbUser?.isPro ?? false;
    }

    return token;
  },
  async session({ session, token }) {
    if (token.sub && session.user) {
      session.user.id = token.sub;
    }
    if (session.user) {
      session.user.isPro = (token.isPro as boolean) ?? false;
    }
    return session;
  },
},
```

### 3. `src/types/next-auth.d.ts` — Extend Session Types

Add or update type declarations for `isPro`:

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isPro?: boolean;
  }
}
```

### 4. `src/actions/items.ts` — Add Free Tier Item Limit

After auth check, before creating the item:

```typescript
// Check free tier limits
if (!session.user.isPro) {
  const itemCount = await prisma.item.count({ where: { userId: session.user.id } });
  if (itemCount >= FREE_LIMITS.maxItems) {
    return {
      success: false as const,
      error: `Free plan is limited to ${FREE_LIMITS.maxItems} items. Upgrade to Pro for unlimited items.`,
    };
  }

  // Block pro-only types
  if (isProOnlyType(parsed.data.itemTypeName)) {
    return {
      success: false as const,
      error: "File and image uploads require a Pro subscription.",
    };
  }
}
```

### 5. `src/actions/collections.ts` — Add Free Tier Collection Limit

After auth check, before creating the collection:

```typescript
// Check free tier limits
if (!session.user.isPro) {
  const collectionCount = await prisma.collection.count({ where: { userId: session.user.id } });
  if (collectionCount >= FREE_LIMITS.maxCollections) {
    return {
      success: false as const,
      error: `Free plan is limited to ${FREE_LIMITS.maxCollections} collections. Upgrade to Pro for unlimited collections.`,
    };
  }
}
```

### 6. `src/app/api/upload/route.ts` — Gate File Uploads

Add after auth check:

```typescript
// Check Pro status for file uploads
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true },
});
if (!user?.isPro) {
  return NextResponse.json(
    { error: "File uploads require a Pro subscription" },
    { status: 403 }
  );
}
```

### 7. `src/app/dashboard/settings/page.tsx` — Add Billing Section

Import and render `BillingSection` component:

```typescript
import { BillingSection } from "@/components/dashboard/BillingSection";

// In the page component, after fetching user data:
<BillingSection isPro={user.isPro} email={user.email} />
```

Place it as the first Card section on the settings page (before Editor Preferences).

### 8. `src/components/dashboard/Sidebar.tsx` — Conditional PRO Badges

Update PRO badges to only show for non-Pro users:

```typescript
{(type.name === 'file' || type.name === 'image') && !session?.user?.isPro && (
  <Badge variant="secondary" className="ml-auto ...">PRO</Badge>
)}
```

Requires passing `isPro` from the session to the Sidebar component.

---

## Feature Gating Strategy

### Server-Side Enforcement (Required)

| Check Point | File | Gate |
|-------------|------|------|
| Create item | `src/actions/items.ts` | 50 item limit + block file/image types |
| Create collection | `src/actions/collections.ts` | 3 collection limit |
| File upload | `src/app/api/upload/route.ts` | Block non-Pro users |
| (Future) AI features | TBD | Block non-Pro users |
| (Future) Export | TBD | Block non-Pro users |

### Client-Side UX Hints (Nice to Have)

| Location | Behavior |
|----------|----------|
| Sidebar file/image links | Show PRO badge (existing), optionally disable click for free users |
| Create Item dialog | Show upgrade prompt when selecting file/image type |
| Item count approaching 50 | Show warning banner on dashboard |
| Collection count at 3 | Show upgrade prompt in create collection dialog |

### Important: Server-side is the source of truth. Client-side hints are UX improvements only.

---

## Testing Checklist

### Stripe Setup

- [ ] Stripe test mode keys configured in `.env`
- [ ] Monthly and yearly prices created in Stripe Dashboard
- [ ] Webhook endpoint configured (use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local dev)
- [ ] Customer Portal configured in Stripe Dashboard

### Checkout Flow

- [ ] Free user can initiate monthly checkout
- [ ] Free user can initiate yearly checkout
- [ ] Checkout redirects to Stripe hosted page
- [ ] Successful checkout redirects back to settings with `?upgraded=true`
- [ ] After checkout, `isPro` is true in database
- [ ] Session reflects `isPro: true` after page reload
- [ ] Already-Pro user gets "Already subscribed" error

### Webhook Handling

- [ ] `checkout.session.completed` sets `isPro: true` and saves `stripeSubscriptionId`
- [ ] `customer.subscription.updated` handles status changes (active, past_due, canceled)
- [ ] `customer.subscription.deleted` sets `isPro: false` and clears `stripeSubscriptionId`
- [ ] Invalid webhook signatures are rejected (400)
- [ ] Missing signatures are rejected (400)

### Customer Portal

- [ ] Pro user can access billing portal
- [ ] Portal allows cancellation
- [ ] Portal allows plan change (monthly <-> yearly)
- [ ] Portal redirects back to settings

### Feature Gating

- [ ] Free user can create up to 50 items
- [ ] Free user gets error at item 51
- [ ] Free user can create up to 3 collections
- [ ] Free user gets error at collection 4
- [ ] Free user cannot upload files (403 from upload route)
- [ ] Free user cannot create file/image item types
- [ ] Pro user has no limits on items
- [ ] Pro user has no limits on collections
- [ ] Pro user can upload files

### Session Sync

- [ ] `isPro` appears in session after login
- [ ] `isPro` updates after webhook (on next page load)
- [ ] Downgraded user loses Pro access on next request

### Settings Page

- [ ] Free user sees upgrade buttons (monthly + yearly)
- [ ] Pro user sees PRO badge and "Manage Subscription" button
- [ ] Manage Subscription opens Stripe Portal

### Edge Cases

- [ ] User with no Stripe customer ID can still checkout (customer created on demand)
- [ ] Duplicate webhook events are handled idempotently
- [ ] Webhook failures don't crash the app (graceful error handling)

---

## Dependencies to Install

```bash
npm install stripe
```

No other dependencies needed. The `stripe` package handles both server-side API calls and webhook signature verification.

---

## Notes

- **No database migration required** — `isPro`, `stripeCustomerId`, and `stripeSubscriptionId` already exist in the schema
- **JWT session sync** — The JWT callback queries `isPro` on every session validation. This adds ~1ms per request but guarantees the session stays in sync after webhook updates. A page reload after checkout is sufficient to pick up Pro status.
- **Stripe CLI for local development** — Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` to forward webhook events during development
- **Development mode** — Per project spec, "All users have access to all features during development." Consider an env flag like `BYPASS_PRO_CHECKS=true` for development convenience.
