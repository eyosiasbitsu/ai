import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const companions = await prismadb.companion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(companions);
  } catch (error) {
    console.log("[ADMIN_BOTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 