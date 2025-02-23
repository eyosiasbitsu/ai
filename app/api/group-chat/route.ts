import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const { name, initialCompanionId } = await request.json();
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user usage
    const userUsage = await prismadb.userUsage.findUnique({
      where: { userId: user.id },
    });

    if (!userUsage || userUsage.availableTokens < 50) {
      return new NextResponse("Insufficient XP", { status: 403 });
    }

    // Create the group chat and add the initial companion
    const groupChat = await prismadb.groupChat.create({
      data: {
        name,
        creatorId: user.id,
        members: {
          create: {
            companionId: initialCompanionId,
          },
        },
      },
      include: {
        members: {
          include: {
            companion: true,
          },
        },
      },
    });

    // Update user usage
    await prismadb.userUsage.update({
      where: { userId: user.id },
      data: {
        availableTokens: userUsage.availableTokens - 50,
        totalSpent: userUsage.totalSpent + 50,
      },
    });

    return NextResponse.json(groupChat);
  } catch (error) {
    console.log("[GROUP_CHAT_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get paginated group chats where the user is the creator
    const [groupChats, totalCount] = await Promise.all([
      prismadb.groupChat.findMany({
        where: {
          creatorId: user.id,
        },
        include: {
          members: {
            include: {
              companion: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prismadb.groupChat.count({
        where: {
          creatorId: user.id,
        },
      }),
    ]);

    return NextResponse.json(groupChats);
  } catch (error) {
    console.log("[GROUP_CHAT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
