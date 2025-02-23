import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { Companion } from "@prisma/client";

const XP_PER_MESSAGE = 2;

// Helper to determine if a bot should respond
const shouldBotRespond = () => Math.random() < 0.5; // 50% chance

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { prompt, mentionedBotId } = await request.json();
    const user = await currentUser();

    console.log("[GROUP_CHAT_POST] Request received with params:", params);
    console.log("[GROUP_CHAT_POST] User:", user);

    if (!user || !user.id) {
      console.log("[GROUP_CHAT_POST] Unauthorized access attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has enough XP
    const userUsage = await prismadb.userUsage.findUnique({
      where: { userId: user.id }
    });

    console.log("[GROUP_CHAT_POST] User usage:", userUsage);

    if (!userUsage) {
      console.log("[GROUP_CHAT_POST] User usage record not found");
      return new NextResponse("User usage record not found", { status: 404 });
    }

    if (userUsage.availableTokens < XP_PER_MESSAGE) {
      console.log("[GROUP_CHAT_POST] Insufficient XP");
      return new NextResponse("Please purchase more XP to continue chatting", { 
        status: 402,
        statusText: `Need ${XP_PER_MESSAGE - userUsage.availableTokens} more XP`
      });
    }

    // Save the user's message first
    const userMessage = await prismadb.groupMessage.create({
      data: {
        content: prompt,
        groupChatId: params.groupId,
        isBot: false,
        senderId: user.id,
      }
    });

    console.log("[GROUP_CHAT_POST] User message saved:", userMessage);

    // Get the group chat and its members
    const groupChat = await prismadb.groupChat.findUnique({
      where: { id: params.groupId },
      include: {
        members: {
          include: { companion: true }
        }
      }
    });

    console.log("[GROUP_CHAT_POST] Group chat:", groupChat);

    if (!groupChat) {
      console.log("[GROUP_CHAT_POST] Group chat not found");
      return new NextResponse("Group chat not found", { status: 404 });
    }

    // Select responding bots (max 3)
    let respondingBots: Companion[] = [];
    
    // If a bot was mentioned, add it first
    if (mentionedBotId) {
      const mentionedBot = groupChat.members.find(m => m.companion.id === mentionedBotId)?.companion;
      if (mentionedBot) {
        respondingBots.push(mentionedBot);
      }
    }

    console.log("[GROUP_CHAT_POST] Responding bots:", respondingBots);

    // Randomly select remaining bots (up to 3 total)
    const remainingBots = groupChat.members
      .map(m => m.companion)
      .filter(bot => !respondingBots.some(rb => rb.id === bot.id));
    
    const shuffledBots = remainingBots.sort(() => Math.random() - 0.5);
    respondingBots = [...respondingBots, ...shuffledBots.slice(0, 3 - respondingBots.length)];

    console.log("[GROUP_CHAT_POST] Final responding bots:", respondingBots);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });

    // First, determine the most relevant bot to respond
    const determineMainResponder = async (bots: Companion[], prompt: string, openai: OpenAI) => {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Analyze which bot should be the main responder. Return only the index number (0 to N-1)."
          },
          {
            role: "user",
            content: `Message: "${prompt}"\n\nBots:\n${bots.map((bot, i) => 
              `${i}: ${bot.name} - ${bot.description}`).join('\n')}`
          }
        ]
      });
      
      const mainResponderIndex = parseInt(analysis.choices[0].message.content || "0");
      return bots[mainResponderIndex];
    };

    // Process bot responses
    const processBotResponses = async () => {
      // Get main responder (unless a bot was mentioned)
      const mainBot = mentionedBotId 
        ? respondingBots.find(b => b.id === mentionedBotId)
        : await determineMainResponder(respondingBots, prompt, openai);

      if (!mainBot) return [];

      // Generate main response
      const mainResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `${mainBot.instructions}\n\nYou are ${mainBot.name}, ${mainBot.description}.
Keep responses concise and casual, like texting (max 2-3 sentences).
Be engaging but brief. No formal language or long explanations.`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const mainContent = mainResponse.choices[0].message.content || "";
      
      // Save main bot's message
      const mainMessage = await prismadb.groupMessage.create({
        data: {
          content: mainContent,
          groupChatId: params.groupId,
          isBot: true,
          senderId: mainBot.id,
        }
      });

      const responses = [mainMessage];

      // Process other bots' responses
      const otherBots = respondingBots.filter(b => b.id !== mainBot.id);
      
      for (const bot of otherBots) {
        if (Math.random() < 0.5) { // 50% chance to respond
          const followUpResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `${bot.instructions}\n\nYou are ${bot.name}, ${bot.description}.
Respond briefly to the conversation (1-2 sentences max).
Keep it casual like texting. React naturally to what was said before.
No formal language or lengthy responses.`
              },
              {
                role: "user",
                content: prompt
              },
              {
                role: "assistant",
                content: mainContent
              }
            ]
          });

          const followUpContent = followUpResponse.choices[0].message.content || "";
          
          const botMessage = await prismadb.groupMessage.create({
            data: {
              content: followUpContent,
              groupChatId: params.groupId,
              isBot: true,
              senderId: bot.id,
            }
          });

          responses.push(botMessage);
        }
      }

      // Update XP for all responding bots
      await Promise.all(responses.map(msg => 
        prismadb.companion.update({
          where: { id: msg.senderId },
          data: { xpEarned: { increment: XP_PER_MESSAGE } }
        })
      ));

      // Update user XP once for all responses
      const userUsage = await prismadb.userUsage.findUnique({
        where: { userId: user.id }
      });

      const newTokens = Math.max(0, (userUsage?.availableTokens || 0) - (XP_PER_MESSAGE * responses.length));

      await prismadb.userUsage.update({
        where: { userId: user.id },
        data: {
          availableTokens: newTokens,
          totalSpent: { increment: XP_PER_MESSAGE * responses.length },
        }
      });

      return responses;
    };

    const randomDelay = Math.floor(Math.random() * 4) * 1000; // Random delay between 0 and 3000 milliseconds
    await new Promise(resolve => setTimeout(resolve, randomDelay)); // Introduce delay

    const botResponses = await processBotResponses();

    return NextResponse.json({
      botMessages: botResponses.map(msg => ({
        id: msg.id,
        content: msg.content,
        isBot: true,
        senderId: msg.senderId,
        createdAt: msg.createdAt
      })),
      respondingBots: respondingBots
        .filter(bot => botResponses.some(msg => msg.senderId === bot.id))
        .map(bot => ({
          id: bot.id,
          name: bot.name,
          messageDelay: bot.messageDelay
        }))
    });

  } catch (error) {
    console.log("[GROUP_CHAT_POST] Internal Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    // Delete all messages for the specified group chat
    await prismadb.groupMessage.deleteMany({
      where: { groupChatId: params.groupId }
    });

    console.log(`[GROUP_CHAT_DELETE] Cleared messages for group chat: ${params.groupId}`);

    return new NextResponse("Messages cleared", { status: 200 });
  } catch (error) {
    console.log("[GROUP_CHAT_DELETE] Error clearing messages:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 