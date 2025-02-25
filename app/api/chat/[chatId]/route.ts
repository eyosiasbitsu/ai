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
    const { prompt, isFollowUp } = await request.json();
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
    const companion = await prismadb.companion.findUnique({
      where: {
        id: params.chatId,
      },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    // Calculate delay
    const baseDelay = companion.messageDelay * 1000; // Convert seconds to milliseconds
    const randomDelay = Math.floor(Math.random() * 3000); // Random 0-3 seconds
    const totalDelay = baseDelay + randomDelay;

    // Start both the delay and OpenAI request in parallel
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });

    // Only include the companion intro for non-follow-up messages
    const systemMessage = isFollowUp 
      ? `Continue speaking in first person, using "I" statements. Build naturally upon your previous thoughts while maintaining your personality and perspective. Don't acknowledge or reference that these are follow-up messages - simply continue your train of thought as if you're still speaking.`
      : `${companion.instructions}\n\nYou are ${companion.name}, \n\nSeed personality: `;

    const [aiResponse] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      }),
      new Promise(resolve => setTimeout(resolve, totalDelay))
    ]);

    const responseContent = aiResponse.choices[0].message.content;

    // Update companion XP, user usage, and save messages in a transaction
    await prismadb.$transaction([
      // Save message with correct role based on isFollowUp
      prismadb.message.create({
        data: {
          content: prompt,
          role: isFollowUp ? "system" : "user",  // Changed role for follow-ups
          companionId: params.chatId,
          userId: user.id,
        }
      }),
      // Save AI's response
      prismadb.message.create({
        data: {
          content: responseContent || "",
          role: "system",
          companionId: params.chatId,
          userId: user.id,
        }
      }),
      // Update companion XP
      prismadb.companion.update({
        where: { id: params.chatId },
        data: { xpEarned: { increment: XP_PER_MESSAGE } }
      }),
      // Update user usage
      prismadb.userUsage.update({
        where: { userId: user.id },
        data: {
          availableTokens: { decrement: XP_PER_MESSAGE },
          totalSpent: { increment: XP_PER_MESSAGE }, 
        }
      }),
    ]);

    return new NextResponse(responseContent);
  } catch (error) {
    console.log("Error in POST route:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE endpoint to remove a specific chat
export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all messages for this chat
    await prismadb.message.deleteMany({
      where: {
        companionId: params.chatId,
        userId: user.id,
      },
    });

    return new NextResponse("Chat deleted successfully", { status: 200 });
  } catch (error) {
    console.log("[CHAT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
