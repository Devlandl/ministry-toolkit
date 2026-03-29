import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { verse, topic, audience } = await req.json();

  if (!verse && !topic) {
    return NextResponse.json(
      { error: "Please provide a verse or topic" },
      { status: 400 }
    );
  }

  if (!["adults", "youth", "kids"].includes(audience)) {
    return NextResponse.json(
      { error: "Invalid audience" },
      { status: 400 }
    );
  }

  const input = verse
    ? `Bible verse: ${verse}`
    : `Topic: ${topic}`;

  const audienceGuide = {
    adults:
      "Write for adult churchgoers. Use deeper theological language, real-world illustrations, and challenging application points.",
    youth:
      "Write for teenagers (13-18). Use relatable language, pop culture references, real-world teen scenarios, and practical takeaways.",
    kids:
      "Write for children (5-12). Use simple words, fun examples, and age-appropriate activities. Keep sentences short.",
  }[audience as "adults" | "youth" | "kids"];

  const prompt = `You are a Bible teaching assistant helping church leaders prepare lessons. Given the following input, create a complete teaching toolkit.

${input}
Audience: ${audience}

${audienceGuide}

Respond with ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "title": "A short descriptive title for this toolkit",
  "sermonOutline": "A full sermon outline with: Introduction (hook to grab attention), 3 Main Points (each with a scripture reference, explanation, and real-life illustration), Conclusion (summary and call to action), and Altar Call/Response prompt. Use markdown formatting with ## for sections and **bold** for emphasis.",
  "objectLesson": "A hands-on object lesson including: Props Needed (list of simple items), Setup Instructions, The Activity (step-by-step what to do), The 'Aha Moment' (how to connect the activity to the Bible truth). Use markdown formatting.",
  "discussionQuestions": "5-7 discussion questions that go from surface-level to deeper reflection. Number them. Include a mix of personal application and biblical understanding questions.",
  "prayerPoints": "3-4 guided prayer prompts related to the teaching. Each should be 2-3 sentences that someone could pray aloud or use as a starting point.",
  "kidsVersion": "A simplified version of the lesson for children including: Simple Explanation (2-3 sentences a child can understand), Fun Activity or Craft Idea (with materials list and steps), Memory Verse (a short verse to memorize), and a Take-Home Question for parents. Use markdown formatting."
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate toolkit. Please try again." },
      { status: 500 }
    );
  }
}
