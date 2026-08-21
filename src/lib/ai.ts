import { GoogleGenAI } from "@google/genai";
import type { Topic } from "@/types";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

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
      ? `\nDo not repeat these: ${recentMessages.join("; ")}`
      : "";

  const prompt = `You are a life coach. Write one short motivational message about: ${topic}.${recentContext}

Rules:
- Be specific to the topic
- Sound warm and real like a mentor talking to a friend
- Make the reader feel capable and inspired
- 2 to 4 sentences maximum
- Do not use quotes, labels, or formatting
- Just output the message`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await getClient().models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          maxOutputTokens: 2048,
          temperature: 0.9,
        },
      });

      const content = response.text;
      if (content) {
        return { content: content.trim(), topic };
      }
    } catch (e) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, e);
      if (attempt === 2) throw new Error("AI failed after 3 attempts");
    }
  }

  return {
    content: `You showed up today, and that already puts you ahead of everyone who didn't. Keep going — your future self will thank you.`,
    topic,
  };
}
