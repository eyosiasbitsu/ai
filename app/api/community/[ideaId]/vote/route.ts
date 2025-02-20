import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const VOTE_COST = 25;

export async function PATCH(
  req: Request,
  { params }: { params: { ideaId: string } }
) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { voteType } = body; // 'up' or 'down'

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.ideaId) {
      return new NextResponse("Idea ID required", { status: 400 });
    }

    if (!voteType || !['up', 'down'].includes(voteType)) {
      return new NextResponse("Invalid vote type", { status: 400 });
    }

    // Check user's available XP
    const userUsage = await prismadb.userUsage.findUnique({
      where: { userId: user.id }
    });

    if (!userUsage || userUsage.availableTokens < VOTE_COST) {
      return new NextResponse("Insufficient XP. Need 25 XP to vote.", { status: 403 });
    }

    // Update vote and deduct XP
    const [idea] = await prismadb.$transaction([
      prismadb.communityIdea.update({
        where: { id: params.ideaId },
        data: {
          [voteType === 'up' ? 'upvotes' : 'downvotes']: { increment: 1 }
        }
      }),
      prismadb.userUsage.update({
        where: { userId: user.id },
        data: { 
          availableTokens: userUsage.availableTokens - VOTE_COST,
          totalSpent: userUsage.totalSpent + VOTE_COST
        }
      })
    ]);

    return NextResponse.json(idea);
  } catch (error) {
    console.log("[COMMUNITY_VOTE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 