import dotenv from "dotenv";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";

dotenv.config({ path: `.env` });

const XP_PER_MESSAGE = 2;

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has enough XP
    const userUsage = await prismadb.userUsage.findUnique({
      where: { userId: user.id }
    });

    if (!userUsage) {
      return new NextResponse("User usage record not found", { status: 404 });
    }

    // Check XP availability
    if (userUsage.availableTokens < XP_PER_MESSAGE) {
      return new NextResponse("Please purchase more XP to continue chatting", { 
        status: 402,
        statusText: `Need ${XP_PER_MESSAGE - userUsage.availableTokens} more XP`
      });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(user.id);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const companion = await prismadb.companion.findUnique({
      where: {
        id: params.chatId,
      },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${companion.instructions}\n\nYou are ${companion.name}, ${companion.description}\n\nSeed personality: ${companion.seed}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    // Update user's XP after successful response
    await prismadb.userUsage.update({
      where: { userId: user.id },
      data: {
        availableTokens: { decrement: XP_PER_MESSAGE },
        totalSpent: { increment: XP_PER_MESSAGE  }, // Convert XP to dollars (20 XP = $1)
      }
    });

    // Record the transaction
    await prismadb.usageTransaction.create({
      data: {
        userId: user.id,
        amount: XP_PER_MESSAGE
      }
    });

    return new NextResponse(response.choices[0].message.content);
  } catch (error) {
    console.log("Error in POST route:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
