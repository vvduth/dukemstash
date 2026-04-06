import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id

      if (session.customer) {
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id

        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            isPro: true,
            stripeSubscriptionId: subscriptionId ?? undefined,
          },
        })
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing"

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id

      await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: { isPro: isActive },
      })
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id

      await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: {
          isPro: false,
          stripeSubscriptionId: null,
        },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
