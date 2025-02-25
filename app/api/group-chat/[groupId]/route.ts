import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const groupChat = await prismadb.groupChat.findUnique({
      where: {
        id: params.groupId,
        creatorId: userId,
      },
    });

    if (!groupChat) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedGroupChat = await prismadb.groupChat.update({
      where: {
        id: params.groupId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedGroupChat);
  } catch (error) {
    console.log("[GROUP_CHAT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const groupChat = await prismadb.groupChat.findUnique({
      where: {
        id: params.groupId,
        creatorId: userId,
      },
    });

    if (!groupChat) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete everything related to the group chat in a transaction
    await prismadb.$transaction([
      // Delete all messages in the group
      prismadb.groupMessage.deleteMany({
        where: {
          groupChatId: params.groupId,
        },
      }),
      // Delete all member associations
      prismadb.groupChatMember.deleteMany({
        where: {
          groupChatId: params.groupId,
        },
      }),
      // Finally delete the group chat itself
      prismadb.groupChat.delete({
        where: {
          id: params.groupId,
        },
      }),
    ]);

    return new NextResponse("OK");
  } catch (error) {
    console.log("[GROUP_CHAT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 