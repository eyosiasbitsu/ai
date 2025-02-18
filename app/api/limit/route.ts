import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getUserMessageLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const limit = await getUserMessageLimit(userId);
    return NextResponse.json(limit);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 