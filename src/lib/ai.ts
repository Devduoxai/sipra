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

  const prompt = `Write a daily motivational message about: ${topic}.${recentContext}

Style: Think like Jay Shetty, Oprah, and a wise life coach — warm, soulful, real.

Rules:
- Exactly 2 sentences only, under 30 words total
- Never use generic corporate cliches like "crush it", "hustle hard", "you've got this", "level up"
- Sound like a wise friend who truly sees you
- One optional emoji at the end
- Output ONLY the message`;

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
          maxOutputTokens: 200,
          temperature: 0.9,
        },
      });

      const content = response.text;
      if (content) {
        return { content: content.trim(), topic };
      }
    } catch (e) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, e);
      if (attempt < 2) {
        const delay =
          process.env.AI_RETRY_DELAY_MS !== undefined
            ? Number(process.env.AI_RETRY_DELAY_MS)
            : (attempt + 1) * 35000;
        await new Promise((r) => setTimeout(r, delay));
      }
      if (attempt === 2) {
        console.error("Gemini quota exhausted, using fallback message");
      }
    }
  }

  return {
    content: `I know you're tired. Rest if you need to, but don't quit on the version of yourself you promised you'd become today. One deep breath. Let's step forward. 💫`,
    topic,
  };
}
