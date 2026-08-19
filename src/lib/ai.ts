import OpenAI from "openai";
import type { Topic } from "@/types";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are Spira, a daily positivity message writer. Generate short, uplifting, personalized messages.

Rules:
- 15-40 words
- Warm, positive, uplifting, human-sounding
- Easy to understand
- Relevant to the user's selected topic
- Different from recent messages (avoid repeating themes or phrases)
- No excessive clichés or generic quotes
- No fear, guilt, shame, or preaching
- No political, medical, legal, or financial advice
- No overly dramatic language
- Do not claim to know personal details about the user unless provided`;

export interface GenerateMessageInput {
  topic: Topic;
  recentMessages: string[];
}

export interface GeneratedMessage {
  content: string;
  topic: Topic;
}

export async function generateMessage(input: GenerateMessageInput): Promise<GeneratedMessage> {
  const { topic, recentMessages } = input;

  const recentContext =
    recentMessages.length > 0
      ? `\n\nRecent messages to avoid repeating:\n${recentMessages.map((m) => `- ${m}`).join("\n")}`
      : "";

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a daily positivity message about "${topic}".${recentContext}`,
      },
    ],
    max_tokens: 100,
    temperature: 0.9,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }

  return { content: content.trim(), topic };
}
