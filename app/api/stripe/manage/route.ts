import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import prismadb from "@/lib/prismadb";

const returnUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the user subscription from our database
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId
      }
    });

    // If user has no subscription or no stripeCustomerId, handle accordingly
    if (!userSubscription?.stripeCustomerId) {
      return new NextResponse("No subscription found", { status: 404 });
    }

    // Create a Stripe billing portal configuration first
    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Companion AI Subscription Options",
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          products: [
            {
              product: process.env.STRIPE_PRODUCT_ID!,
              prices: [
                process.env.STRIPE_STARTER_PRICE_ID!, // $9.99
                process.env.STRIPE_PRO_PRICE_ID!,     // $29.99
                process.env.STRIPE_ULTIMATE_PRICE_ID! // $49.99
              ]
            }
          ]
        },
        payment_method_update: {
          enabled: true
        },
        customer_update: {
          enabled: true,
          allowed_updates: ["email", "address"]
        },
        invoice_history: {
          enabled: true
        }
      }
    });

    // Create the billing portal session with the configuration
    const session = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      configuration: configuration.id,
      return_url: returnUrl
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.log("[STRIPE_MANAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 