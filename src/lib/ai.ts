import { GoogleGenAI } from "@google/genai";
import type { Topic } from "@/types";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are Sipra, a daily positivity message writer. Write ONLY the message text. Nothing else. No labels, no greetings, no formatting.

Message rules:
- 15-40 words
- Warm, positive, uplifting, human-sounding
- Easy to understand
- Relevant to the topic
- Different from recent messages
- No clichés, fear, guilt, shame, preaching, or drama`;

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
                text: `${SYSTEM_PROMPT}\n\nWrite a daily positivity message about "${topic}".${recentContext}`,
              },
            ],
          },
        ],
        config: {
          maxOutputTokens: 100,
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
