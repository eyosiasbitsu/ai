import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // Check if user is authenticated (you can add more robust auth later)
    const bots = await prismadb.companion.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bots);
  } catch (error) {
    console.log("[ADMIN_BOTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 