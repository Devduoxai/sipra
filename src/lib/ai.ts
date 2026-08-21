import { GoogleGenAI } from "@google/genai";
import type { Topic } from "@/types";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `Write a short daily positivity message. Keep it under 50 words. Sound like a kind friend, not a greeting card. No generic quotes or clichés.

Do not include any labels, topic names, greetings, or explanations. Output ONLY the message itself.`;

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

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await getClient().models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nTopic: "${topic}"${recentContext}`,
              },
            ],
          },
        ],
        config: {
          maxOutputTokens: 150,
          temperature: 0.9,
        },
      });

      const content = response.text;
      if (content) {
        return { content: content.trim(), topic };
      }
    } catch {
      if (attempt === 2) throw new Error("AI failed after 3 attempts");
    }
  }

  return { content: `Today's thought on ${topic}: Every small step forward is progress worth celebrating.`, topic };
}
