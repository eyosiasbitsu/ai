import dotenv from "dotenv";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

dotenv.config({ path: `.env` });

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    // const companion = await prismadb.companion.update({
    //   where: {
    //     id: params.chatId
    //   },
    //   data: {
    //     messages: {
    //       create: {
    //         content: prompt,
    //         role: "user",
    //         userId: user.id,
    //       },
    //     },
    //   }
    // });

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

    return new NextResponse(response.choices[0].message.content);
  } catch (error) {
    console.log("Error in POST route:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
