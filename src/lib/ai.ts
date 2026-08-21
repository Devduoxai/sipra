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

  const prompt = `You are an empathetic, emotionally resonant performance coach. Channel the soulful warmth of Les Brown, the emotional depth of Brené Brown, and the quiet dignity of Coach John Wooden.

Write a short daily message about: ${topic}.${recentContext}

Rules:
- Acknowledge struggle, validate fatigue, reframe pain into purpose
- Never use generic corporate cliches like "crush it", "hustle hard", "you've got this"
- Sound like a wise mentor talking to someone they genuinely care about
- 2 to 4 sentences, emotional and real
- You may use one tasteful emoji at the end
- Output ONLY the message, no labels or formatting`;

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
    content: `I know you're tired. Rest if you need to, but don't quit on the version of yourself you promised you'd become today. One deep breath. Let's step forward. 💫`,
    topic,
  };
}
