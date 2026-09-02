import { GoogleGenAI } from "@google/genai";
import type { Topic } from "@/types";

const MAX_MESSAGE_WORDS = 25;

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

const SENTENCE_END = /[.!?]$/;

// If the message ends with a subordinating conjunction, preposition, or other
// connector, it is an unfinished fragment (e.g. "The work you do when.").
const FRAGMENT_END_WORDS = new Set([
  "the",
  "a",
  "an",
  "when",
  "how",
  "what",
  "why",
  "because",
  "if",
  "but",
  "and",
  "or",
  "that",
  "while",
  "before",
  "after",
  "until",
  "about",
  "with",
  "of",
  "for",
  "to",
  "so",
  "as",
  "than",
  "where",
  "who",
  "which",
  "then",
]);

// A complete sentence needs a main verb. Catching bare noun phrases like
// "Your unique perspective." ensures we reject fragments, not just ones that
// end with a connector.
const VERBS = new Set([
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "can",
  "could",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "am",
  "make",
  "makes",
  "made",
  "take",
  "takes",
  "took",
  "taken",
  "get",
  "gets",
  "got",
  "gotten",
  "know",
  "knows",
  "knew",
  "known",
  "see",
  "sees",
  "saw",
  "seen",
  "give",
  "gives",
  "gave",
  "given",
  "go",
  "goes",
  "went",
  "gone",
  "come",
  "comes",
  "came",
  "grow",
  "grows",
  "grew",
  "grown",
  "believe",
  "believes",
  "trust",
  "trusts",
  "love",
  "loves",
  "need",
  "needs",
  "want",
  "wants",
  "feel",
  "feels",
  "felt",
  "matter",
  "matters",
  "mattered",
  "belong",
  "belongs",
  "belonged",
  "shine",
  "shines",
  "shone",
  "start",
  "starts",
  "started",
  "begin",
  "begins",
  "began",
  "focus",
  "focuses",
  "focused",
  "choose",
  "chooses",
  "chose",
  "chosen",
  "stop",
  "stops",
  "stopped",
  "remember",
  "remembers",
  "remembered",
  "change",
  "changes",
  "changed",
  "learn",
  "learns",
  "learned",
  "carry",
  "carries",
  "carried",
  "hold",
  "holds",
  "held",
  "build",
  "builds",
  "built",
  "keep",
  "keeps",
  "kept",
  "become",
  "becomes",
  "became",
  "deserve",
  "deserves",
  "deserved",
  "offer",
  "offers",
  "offered",
  "share",
  "shares",
  "shared",
  "find",
  "finds",
  "found",
  "create",
  "creates",
  "created",
  "say",
  "says",
  "said",
  "think",
  "thinks",
  "thought",
  "let",
  "lets",
  "allow",
  "allows",
  "allowed",
]);

export function isCompleteSentence(text: string): boolean {
  const trimmed = text.trim();

  if (!trimmed || !SENTENCE_END.test(trimmed)) {
    return false;
  }

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length < 3) {
    return false;
  }

  const lastWord = (words[words.length - 1] ?? "").replace(/[.!?]$/, "").toLowerCase();

  if (FRAGMENT_END_WORDS.has(lastWord)) {
    return false;
  }

  // Every complete sentence needs a main verb. Reject bare noun phrases like
  // "Your unique perspective."
  const hasVerb = words.some((w) => VERBS.has(w.toLowerCase()));

  if (!hasVerb) {
    return false;
  }

  return true;
}

export function normalizeMessage(raw: string): string {
  const words = raw.trim().split(/\s+/).filter(Boolean);
  const capped = words.length > MAX_MESSAGE_WORDS ? words.slice(0, MAX_MESSAGE_WORDS) : words;

  let text = capped.join(" ").trim();
  const sentenceEnd = Math.max(text.lastIndexOf("."), text.lastIndexOf("!"));

  if (sentenceEnd > 0) {
    text = text.slice(0, sentenceEnd + 1);
  } else if (text.length > 0 && !/[.!?]$/.test(text)) {
    text = `${text}.`;
  }
  return text;
}

interface SipraPayload {
  message: string;
  valid: boolean;
}

function parseSipraPayload(raw: string | undefined | null): SipraPayload | null {
  if (!raw) {
    return null;
  }

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const parsed = JSON.parse(stripped) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as Record<string, unknown>).message === "string" &&
      typeof (parsed as Record<string, unknown>).valid === "boolean"
    ) {
      return {
        message: (parsed as Record<string, unknown>).message as string,
        valid: (parsed as Record<string, unknown>).valid as boolean,
      };
    }
  } catch {
    // not valid JSON — fall through
  }

  return null;
}

export async function generateMessage(input: GenerateMessageInput): Promise<GeneratedMessage> {
  const { topic, recentMessages } = input;

  const recentContext =
    recentMessages.length > 0 ? `\nDo not repeat these: ${recentMessages.join("; ")}` : "";

  const prompt = `Write a daily motivational message about: ${topic}.${recentContext}

Write like a warm, wise friend who really believes in you — blend the voices of Oprah, Mel Robbins, Jay Shetty, Martha Beck, and Tony Robbins.

Rules:
- Short like a text message: exactly 1-2 sentences, 10-25 words total
- Always use complete sentences that end with a period (full stops, no fragments, no trailing ellipses)
- Warm, direct, empowering — make the reader feel seen and capable
- Land one small, doable nudge at the end (e.g. "Take the first small step today")
- Never use corporate cliches like "crush it", "hustle hard", "you've got this", "level up", "boss up"
- One optional emoji at the end
- The message must be a complete, meaningful sentence (subject + verb), and sound warm and human in the voice above

Return ONLY JSON, no other text:
{
  "message": "the message",
  "valid": true,
  "reason": "one short line explaining why it passes or fails"
}`;

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
          maxOutputTokens: 500,
          temperature: 0.9,
          responseMimeType: "application/json",
        },
      });

      const parsed = parseSipraPayload(response.text);
      if (parsed) {
        const normalized = normalizeMessage(parsed.message);
        if (parsed.valid && normalized && isCompleteSentence(normalized)) {
          return { content: normalized, topic };
        }
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
    content: normalizeMessage(
      "I know you're tired. Rest if you need to, but don't leave the person you promised yourself you'd become. One deep breath, then one small step. 💫",
    ),
    topic,
  };
}
