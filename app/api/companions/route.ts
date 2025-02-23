import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const companions = await prismadb.companion.findMany({
      where: {
        private: false,
      },
      select: {
        id: true,
        name: true,
        src: true,
        description: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(companions);
  } catch (error) {
    console.log("[COMPANIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 