import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await prismadb.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(categories);
    
  } catch (error) {
    console.log("[CATEGORIES_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 