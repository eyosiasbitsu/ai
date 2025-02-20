import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/");

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    const { unitAmount } = await req.json();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const priceIds: Record<number, string> = {
      999: process.env.STARTER_PRICE_ID!,
      2999: process.env.PRO_PRICE_ID!,
      4999: process.env.ULTIMATE_PRICE_ID!
    };

    if (!unitAmount || !priceIds[unitAmount as keyof typeof priceIds]) {
      return new NextResponse("Invalid unit amount. Must be one of: 999, 2999, 4999", { status: 400 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId
      }
    })

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      })

      return new NextResponse(JSON.stringify({ url: stripeSession.url }))
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price: priceIds[unitAmount],
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    })

    return new NextResponse(JSON.stringify({ url: stripeSession.url }))
  } catch (error) {
    console.log("[STRIPE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
