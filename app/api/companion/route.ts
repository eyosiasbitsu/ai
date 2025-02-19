import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!src || !name || !description || !instructions || !seed || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    };

    // Get user's subscription
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: user.id
      }
    });

    if (!userSubscription) {
      return new NextResponse("Subscription required", { status: 403 });
    }

    // Get existing bot count for the user
    const existingBotsCount = await prismadb.companion.count({
      where: {
        userId: user.id
      }
    });

    // Check limits based on subscription price
    if (userSubscription.price === 999) {
      if (existingBotsCount >= 1) {
        return new NextResponse("Starter plan allows only 1 bot creation, upgrade to pro to create more", { status: 403 });
      }
    } else if (userSubscription.price === 2999) {
      if (existingBotsCount >= 10) {
        return new NextResponse("Pro plan allows up to 10 bot creations, upgrade to ultimate to create more", { status: 403 });
      }
    }
    // Ultimate plan (4999) has no limit, so no check needed

    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      }
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
