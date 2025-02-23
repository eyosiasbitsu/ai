import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// DELETE endpoint to clear all chats
export async function DELETE() {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all messages for this user
    await prismadb.message.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return new NextResponse("All chats cleared successfully", { status: 200 });
  } catch (error) {
    console.log("[CHAT_CLEAR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 