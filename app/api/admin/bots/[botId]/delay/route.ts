import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { botId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messageDelay } = body;

    if (messageDelay === undefined) {
      return new NextResponse("Message delay is required", { status: 400 });
    }

    const companion = await prismadb.companion.update({
      where: {
        id: params.botId,
      },
      data: {
        messageDelay,
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[BOT_DELAY_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 