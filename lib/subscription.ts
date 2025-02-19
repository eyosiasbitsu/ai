import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      price: true,
    },
  })

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()

  return !!isValid;
};

export const getSubscriptionData = async () => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      price: true,
    },
  });

  if (!userSubscription) {
    return null;
  }

  return userSubscription;
};

export const SUBSCRIPTION_TIERS = {
  FREE: process.env.STARTER_PRICE_ID, // No price ID for free tier
  PRO: process.env.PRO_PRICE_ID,
  ENTERPRISE: process.env.ULTIMATE_PRICE_ID,
} as const;

export const changeSubscription = async (newPriceId: string) => {
  try {
    const response = await fetch('/api/stripe/change-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPriceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to change subscription');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};
