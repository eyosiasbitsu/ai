import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

const XP_REQUIRED_FOR_CREATION = 100;

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { src, name, instructions, categoryId } = body;

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!src || !name  || !instructions || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    };

    // Check user's XP using UserUsage
    const userUsage = await prismadb.userUsage.findUnique({
      where: { userId: user.id }
    });

    if (!userUsage || userUsage.availableTokens < XP_REQUIRED_FOR_CREATION) {
      return NextResponse.json({ 
        showProModal: true,
        requiredXP: XP_REQUIRED_FOR_CREATION,
        currentXP: userUsage?.availableTokens || 0
      }, { status: 402 });
    }


    // Check limits based on subscription pric
    // Ultimate plan (4999) has no limit, so no check needed

    // Create companion
    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        instructions,
      }
    });

    // Deduct XP after successful creation
    await prismadb.userUsage.update({
      where: { userId: user.id },
      data: {
        availableTokens: userUsage.availableTokens - XP_REQUIRED_FOR_CREATION,
        totalSpent: {
          increment: XP_REQUIRED_FOR_CREATION
        }
      }
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
