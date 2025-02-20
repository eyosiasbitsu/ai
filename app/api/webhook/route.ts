import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"

const XP_PER_LEVEL = 160;

// Calculate how many levels will be gained from XP amount
const calculateLevelIncrease = (xpAmount: number): number => {
  return Math.floor(xpAmount / XP_PER_LEVEL);
};

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.log("[WEBHOOK_ERROR]", error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle successful one-time payments
  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;
    const xpAmount = parseInt(session.metadata?.xpAmount || "0");
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0; // Convert cents to dollars

    if (!userId || !xpAmount) {
      return new NextResponse("Missing metadata", { status: 400 });
    }

    // Get current user usage
    const userUsage = await prismadb.userUsage.findUnique({
      where: { userId }
    });

    if (!userUsage) {
      return new NextResponse("User usage not found", { status: 404 });
    }

    // Update user's XP balance and record transaction
    await prismadb.$transaction([
      // Update user usage
      prismadb.userUsage.update({
        where: { userId },
        data: {
          availableTokens: { increment: xpAmount },
          totalSpent: { increment: xpAmount }, // Increment total XP spent for level calculation
        }
      }),
      // Record the transaction
      prismadb.usageTransaction.create({
        data: {
          userId,
          amount: xpAmount,
        }
      }),
      // Update user subscription record with payment info
      prismadb.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          price: amountPaid,
          stripeCustomerId: session.customer as string,
        },
        update: {
          price: { increment: amountPaid },
        }
      })
    ]);
  }

  return new NextResponse(null, { status: 200 })
}
