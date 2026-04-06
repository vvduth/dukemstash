import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe, PRICES, type BillingInterval } from "@/lib/stripe"
import { getOrCreateCustomer } from "@/lib/stripe"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const interval = body.interval as string

  if (interval !== "monthly" && interval !== "yearly") {
    return NextResponse.json(
      { error: "Invalid interval. Must be 'monthly' or 'yearly'" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeCustomerId: true },
  })

  if (user?.isPro) {
    return NextResponse.json(
      { error: "You already have a Pro subscription" },
      { status: 400 }
    )
  }

  const customerId = await getOrCreateCustomer(
    session.user.id,
    session.user.email,
    user?.stripeCustomerId
  )

  const priceId = PRICES[interval as BillingInterval]

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    metadata: { userId: session.user.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
