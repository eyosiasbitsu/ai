import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function DELETE(
  req: Request,
  { params }: { params: { botId: string } }
) {
  try {
    const bot = await prismadb.companion.delete({
      where: {
        id: params.botId,
      }
    });

    return NextResponse.json(bot);
  } catch (error) {
    console.log("[BOT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 