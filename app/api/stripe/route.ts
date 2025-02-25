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
    const { option, xpAmount, priceAmount } = await req.json();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a one-time payment session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "payment", // Changed from subscription to one-time payment
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${xpAmount} XP Package`,
              description: `One-time purchase of ${xpAmount} XP`,
            },
            unit_amount: priceAmount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        xpAmount,
        option
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.log("[STRIPE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
