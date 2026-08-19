import { NextResponse } from "next/server";
import { z } from "zod";
import { generateMessage } from "@/lib/ai";
import { TOPICS } from "@/types";

const generateSchema = z.object({
  topic: z.enum(TOPICS),
  recentMessages: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 },
      );
    }

    const message = await generateMessage(result.data);

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Failed to generate message" }, { status: 500 });
  }
}
