import { GoogleGenAI } from "@google/genai";
import type { Topic } from "@/types";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `Write a short daily motivational message about the given topic. Think like a motivational speaker — inspiring, specific, and actionable.

Keep it under 50 words. Be genuine and encouraging. No generic filler like "every small step counts."

Do not include labels, topic names, greetings, or quotes attribution. Output ONLY the message.`;

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
          maxOutputTokens: 500,
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

  return { content: `You showed up today, and that already puts you ahead of everyone who didn't. Keep going — your future self will thank you.`, topic };
}
