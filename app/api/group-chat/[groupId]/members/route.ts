import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { companionId } = await request.json();
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the group chat exists and user is the creator
    const groupChat = await prismadb.groupChat.findUnique({
      where: {
        id: params.groupId,
        creatorId: user.id,
      }
    });

    if (!groupChat) {
      return new NextResponse("Group chat not found or unauthorized", { status: 404 });
    }

    // Add the companion to the group
    const member = await prismadb.groupChatMember.create({
      data: {
        groupChatId: params.groupId,
        companionId: companionId,
      },
      include: {
        companion: true
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.log("[GROUP_MEMBER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const companionId = searchParams.get("companionId");
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!companionId) {
      return new NextResponse("Companion ID required", { status: 400 });
    }

    // Check if the group chat exists and user is the creator
    const groupChat = await prismadb.groupChat.findUnique({
      where: {
        id: params.groupId,
        creatorId: user.id,
      }
    });

    if (!groupChat) {
      return new NextResponse("Group chat not found or unauthorized", { status: 404 });
    }

    // Remove the companion from the group
    await prismadb.groupChatMember.delete({
      where: {
        groupChatId_companionId: {
          groupChatId: params.groupId,
          companionId: companionId,
        }
      }
    });

    return new NextResponse("Member removed successfully", { status: 200 });
  } catch (error) {
    console.log("[GROUP_MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 