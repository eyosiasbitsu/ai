import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userProgress = await prisma.userUsage.findUnique({
      where: { userId },
      select: {
        totalSpent: true,
        level: true,
        availableTokens: true,
      }
    });

    if (!userProgress) {
      return new NextResponse("User progress not found", { status: 404 });
    }

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[USER_PROGRESS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 