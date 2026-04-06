# Stripe Integration - Phase 2: Webhooks, Feature Gating & UI

## Overview

Wire up Stripe Checkout, webhook handler, customer portal, feature gating in server actions/routes, and the billing UI component. This phase requires Stripe CLI (`stripe listen`) for local webhook testing.

## Prerequisites

- Phase 1 complete (stripe client, subscription constants, session `isPro`)
- Stripe Dashboard configured: product, two prices (monthly/yearly), webhook endpoint
- Stripe CLI installed for local development (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)

## Requirements

- Checkout API route to create Stripe Checkout sessions
- Webhook handler for subscription lifecycle events
- Customer portal route for managing existing subscriptions
- Feature gating in `createItem`, `createCollection`, and upload route
- BillingSection component on settings page
- Conditional PRO badges in sidebar

## Files to Create

### 1. `src/app/api/checkout/route.ts` — Create Checkout Session

- POST route, auth required (session + email)
- Accepts `{ interval: "monthly" | "yearly" }` in body
- Validates interval against `PRICES` map
- Checks user isn't already Pro (400 if so)
- Calls `getOrCreateCustomer` then `stripe.checkout.sessions.create`
- Returns `{ url }` for client redirect
- Success URL: `/dashboard/settings?upgraded=true`
- Cancel URL: `/dashboard/settings`

### 2. `src/app/api/webhooks/stripe/route.ts` — Webhook Handler

- POST route, no auth (Stripe sends these)
- Reads raw body + `stripe-signature` header
- Verifies signature with `stripe.webhooks.constructEvent`
- Handles three events:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set `isPro: true`, save `stripeSubscriptionId` |
| `customer.subscription.updated` | Update `isPro` based on status (active/trialing = true) |
| `customer.subscription.deleted` | Set `isPro: false`, clear `stripeSubscriptionId` |

- Returns `{ received: true }` on success
- Returns 400 for missing/invalid signatures

### 3. `src/app/api/billing/portal/route.ts` — Customer Portal

- POST route, auth required
- Looks up `stripeCustomerId` from DB
- Returns 400 if no billing account
- Creates `stripe.billingPortal.sessions.create`
- Returns `{ url }` for client redirect back to `/dashboard/settings`

### 4. `src/components/dashboard/BillingSection.tsx` — Settings Billing Card

- Client component with `isPro` and `email` props
- **Pro state:** Shows PRO badge, "Manage Subscription" button -> portal
- **Free state:** Shows upgrade card with two buttons: "$8/month" and "$72/year (save 25%)"
- Loading states on all buttons during fetch
- Place as first card on settings page (before existing sections)

## Files to Modify

### 1. `src/actions/items.ts` — Free Tier Item Limit

In `createItem`, after auth check, before DB insert:
- If not Pro: count user's items, reject at >= 50 with upgrade message
- If not Pro: reject `file`/`image` types with Pro-required message
- Use `FREE_LIMITS` and `isProOnlyType` from `src/lib/subscription.ts`

### 2. `src/actions/collections.ts` — Free Tier Collection Limit

In `createCollection`, after auth check, before DB insert:
- If not Pro: count user's collections, reject at >= 3 with upgrade message
- Use `FREE_LIMITS` from `src/lib/subscription.ts`

### 3. `src/app/api/upload/route.ts` — Gate File Uploads

After auth check:
- Query `isPro` from DB
- Return 403 if not Pro: `"File uploads require a Pro subscription"`

### 4. `src/app/dashboard/settings/page.tsx` — Add BillingSection

- Import and render `BillingSection` as first card
- Pass `isPro` and `email` from session/DB

### 5. `src/components/dashboard/Sidebar.tsx` — Conditional PRO Badges

- Only show PRO badges on file/image types for non-Pro users
- Requires `isPro` from session (already available in layout)

## Stripe Dashboard Setup (Manual)

1. Create product "Dukemstash Pro"
2. Create monthly price ($8/mo) -> `STRIPE_PRICE_MONTHLY_ID`
3. Create yearly price ($72/yr) -> `STRIPE_PRICE_YEARLY_ID`
4. Create webhook endpoint for checkout.session.completed, customer.subscription.updated, customer.subscription.deleted -> `STRIPE_WEBHOOK_SECRET`
5. Configure Customer Portal (cancellation, plan switching)

## Testing Checklist

### Checkout Flow
- [ ] Free user can initiate monthly checkout
- [ ] Free user can initiate yearly checkout
- [ ] Checkout redirects to Stripe hosted page
- [ ] Successful payment redirects to settings with `?upgraded=true`
- [ ] `isPro` is true in DB after checkout webhook fires
- [ ] Already-Pro user gets 400 error

### Webhook Handling (requires Stripe CLI)
- [ ] `checkout.session.completed` sets isPro + subscriptionId
- [ ] `customer.subscription.updated` syncs status changes
- [ ] `customer.subscription.deleted` revokes Pro
- [ ] Invalid signatures rejected (400)

### Feature Gating
- [ ] Free user blocked at 50 items
- [ ] Free user blocked at 3 collections
- [ ] Free user cannot upload files (403)
- [ ] Free user cannot create file/image items
- [ ] Pro user has no limits

### Customer Portal
- [ ] Pro user can open portal
- [ ] Portal allows cancellation and plan change
- [ ] Non-customer gets 400

### Settings UI
- [ ] Free user sees upgrade buttons
- [ ] Pro user sees PRO badge + "Manage Subscription"

## Notes

- Development mode: per project spec, all features are available during development. Consider `BYPASS_PRO_CHECKS=true` env flag for convenience
- Webhook testing requires `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Session `isPro` updates on next page load after webhook fires (JWT callback queries DB)
- Server-side gating is the source of truth — client-side badges are UX hints only
